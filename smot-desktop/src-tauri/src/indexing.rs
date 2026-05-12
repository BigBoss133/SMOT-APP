use rusqlite::Connection;
use serde::Serialize;
use std::sync::{Arc, Mutex, atomic::{AtomicBool, Ordering}};
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager};

const CHUNK_SIZE_CHARS: usize = 2000;
const CHUNK_OVERLAP_CHARS: usize = 200;

#[derive(Clone, Serialize)]
pub struct IndexingProgress {
    pub status: String,
    pub total_documents: u32,
    pub completed_documents: u32,
    pub current_document: String,
    pub current_chunk: u32,
    pub total_chunks: u32,
    pub eta_seconds: u64,
}

pub struct IndexingState {
    pub status: String,
    pub total_documents: u32,
    pub completed_documents: u32,
    pub current_document: String,
    pub current_chunk: u32,
    pub total_chunks: u32,
    pub eta_seconds: u64,
    pub error: Option<String>,
}

impl Default for IndexingState {
    fn default() -> Self {
        Self {
            status: "idle".to_string(),
            total_documents: 0,
            completed_documents: 0,
            current_document: String::new(),
            current_chunk: 0,
            total_chunks: 0,
            eta_seconds: 0,
            error: None,
        }
    }
}

pub struct IndexingController {
    pub state: Mutex<IndexingState>,
    pub pause_flag: AtomicBool,
    pub cancel_flag: AtomicBool,
}

impl IndexingController {
    pub fn new() -> Self {
        Self {
            state: Mutex::new(IndexingState::default()),
            pause_flag: AtomicBool::new(false),
            cancel_flag: AtomicBool::new(false),
        }
    }
}

#[derive(serde::Serialize)]
struct EmbeddingsRequest {
    model: String,
    prompt: String,
}

#[derive(serde::Deserialize)]
struct EmbeddingsResponse {
    embedding: Vec<f32>,
}

pub fn chunk_text(text: &str) -> Vec<String> {
    if text.len() <= CHUNK_SIZE_CHARS {
        return vec![text.to_string()];
    }

    let mut chunks = Vec::new();
    let mut start = 0;

    while start < text.len() {
        let end = (start + CHUNK_SIZE_CHARS).min(text.len());
        let chunk = &text[start..end];

        let split_pos = if end < text.len() {
            chunk.rfind("\n\n")
                .or_else(|| chunk.rfind(". "))
                .or_else(|| chunk.rfind("\n"))
                .map(|pos| start + pos)
        } else {
            None
        };

        let actual_end = split_pos.unwrap_or(end);
        chunks.push(text[start..actual_end].trim().to_string());

        let next_start = if split_pos.is_some() {
            actual_end
        } else if end < text.len() {
            (end - CHUNK_OVERLAP_CHARS).max(start + 1)
        } else {
            end
        };

        start = next_start;
    }

    chunks.retain(|c| !c.trim().is_empty());
    chunks
}

async fn get_embedding(client: &reqwest::Client, text: &str) -> Result<Vec<f32>, String> {
    let resp = client
        .post("http://localhost:11434/api/embeddings")
        .json(&EmbeddingsRequest {
            model: "nomic-embed-text".to_string(),
            prompt: text.to_string(),
        })
        .timeout(Duration::from_secs(60))
        .send()
        .await
        .map_err(|e| format!("Ollama embeddings request failed: {}", e))?;

    let body: EmbeddingsResponse = resp
        .json()
        .await
        .map_err(|e| format!("Ollama embeddings parse error: {}", e))?;

    Ok(body.embedding)
}

fn embedding_to_blob(embedding: &[f32]) -> Vec<u8> {
    embedding.iter().flat_map(|f| f.to_le_bytes()).collect()
}

pub fn query_documents(
    conn: &Connection,
    document_ids: &Option<Vec<String>>,
) -> Result<Vec<(String, String, String)>, String> {
    let (sql, params): (String, Vec<Box<dyn rusqlite::types::ToSql>>) = match document_ids {
        Some(ids) if !ids.is_empty() => {
            let placeholders: Vec<String> = ids.iter().enumerate().map(|(i, _)| format!("?{}", i + 1)).collect();
            let sql = format!(
                "SELECT id, name, path FROM documents WHERE indexed = 0 AND id IN ({})",
                placeholders.join(", ")
            );
            let params: Vec<Box<dyn rusqlite::types::ToSql>> = ids.iter().map(|s| Box::new(s.clone()) as Box<dyn rusqlite::types::ToSql>).collect();
            (sql, params)
        }
        _ => (
            "SELECT id, name, path FROM documents WHERE indexed = 0".to_string(),
            vec![],
        ),
    };

    let mut stmt = conn.prepare(&sql).map_err(|e| format!("DB query error: {}", e))?;
    let rows = stmt
        .query_map(rusqlite::params_from_iter(params.iter().map(|p| p.as_ref())), |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
            ))
        })
        .map_err(|e| format!("DB query error: {}", e))?;
    Ok(rows.filter_map(|r| r.ok()).collect())
}

pub async fn start_indexing(
    app_handle: AppHandle,
    controller: Arc<IndexingController>,
    db: Arc<Mutex<Connection>>,
    client: reqwest::Client,
    document_ids: Option<Vec<String>>,
) {
    let start_time = std::time::Instant::now();

    let documents: Vec<(String, String, String)> = {
        let conn = match db.lock() {
            Ok(c) => c,
            Err(e) => {
                let mut st = controller.state.lock().unwrap_or_else(|e| e.into_inner());
                st.status = "error".to_string();
                st.error = Some(format!("DB lock error: {}", e));
                return;
            }
        };
        match query_documents(&conn, &document_ids) {
            Ok(docs) => docs,
            Err(e) => {
                let mut st = controller.state.lock().unwrap_or_else(|e| e.into_inner());
                st.status = "error".to_string();
                st.error = Some(e);
                return;
            }
        }
    };

    let total = documents.len() as u32;
    {
        let mut st = controller.state.lock().unwrap_or_else(|e| e.into_inner());
        st.total_documents = total;
        st.completed_documents = 0;
        st.status = "running".to_string();
    }

    let _ = app_handle.emit("indexing-progress", IndexingProgress {
        status: "running".to_string(),
        total_documents: total,
        completed_documents: 0,
        current_document: String::new(),
        current_chunk: 0,
        total_chunks: 0,
        eta_seconds: 0,
    });

    for (doc_idx, (doc_id, doc_name, doc_path_str)) in documents.iter().enumerate() {
        if controller.cancel_flag.load(Ordering::Relaxed) {
            let mut st = controller.state.lock().unwrap_or_else(|e| e.into_inner());
            st.status = "cancelled".to_string();
            let _ = app_handle.emit("indexing-progress", IndexingProgress {
                status: "cancelled".to_string(),
                total_documents: total,
                completed_documents: doc_idx as u32,
                current_document: doc_name.clone(),
                current_chunk: 0,
                total_chunks: 0,
                eta_seconds: 0,
            });
            return;
        }

        while controller.pause_flag.load(Ordering::Relaxed) {
            {
                let mut st = controller.state.lock().unwrap_or_else(|e| e.into_inner());
                st.status = "paused".to_string();
            }
            let _ = app_handle.emit("indexing-progress", IndexingProgress {
                status: "paused".to_string(),
                total_documents: total,
                completed_documents: doc_idx as u32,
                current_document: doc_name.clone(),
                current_chunk: 0,
                total_chunks: 0,
                eta_seconds: 0,
            });
            tokio::time::sleep(Duration::from_millis(500)).await;
        }

        {
            let mut st = controller.state.lock().unwrap_or_else(|e| e.into_inner());
            st.current_document = doc_name.clone();
            st.status = "running".to_string();
        }

        let app_data_dir = match app_handle.path().app_data_dir() {
            Ok(d) => d,
            Err(e) => {
                let mut st = controller.state.lock().unwrap_or_else(|e| e.into_inner());
                st.error = Some(format!("Cannot get app data dir: {}", e));
                continue;
            }
        };

        let resolved_path = {
            let p = std::path::PathBuf::from(doc_path_str);
            if p.is_absolute() && p.exists() {
                p
            } else {
                let relative = app_data_dir.join(doc_path_str);
                if relative.exists() { relative } else { app_data_dir.join("documents").join(doc_path_str) }
            }
        };

        let parsed = match crate::parsers::extract_document_text(resolved_path) {
            Ok(p) => p,
            Err(e) => {
                let mut st = controller.state.lock().unwrap_or_else(|e| e.into_inner());
                st.error = Some(format!("Parse error for {}: {}", doc_name, e));
                continue;
            }
        };

        if parsed.text.trim().is_empty() {
            let conn = db.lock().unwrap_or_else(|e| e.into_inner());
            let _ = crate::db::update_indexing_status(&conn, doc_id);
            let mut st = controller.state.lock().unwrap_or_else(|e| e.into_inner());
            st.completed_documents += 1;
            continue;
        }

        let chunks = chunk_text(&parsed.text);
        let total_chunks = chunks.len() as u32;

        {
            let mut st = controller.state.lock().unwrap_or_else(|e| e.into_inner());
            st.total_chunks = total_chunks;
            st.current_chunk = 0;
        }

        for (chunk_idx, chunk_content) in chunks.iter().enumerate() {
            while controller.pause_flag.load(Ordering::Relaxed) {
                {
                    let mut st = controller.state.lock().unwrap_or_else(|e| e.into_inner());
                    st.status = "paused".to_string();
                }
                tokio::time::sleep(Duration::from_millis(500)).await;
            }

            if controller.cancel_flag.load(Ordering::Relaxed) {
                break;
            }

            let chunk_id = uuid::Uuid::new_v4().to_string();
            let now = chrono::Utc::now().to_rfc3339();

            {
                let conn = db.lock().unwrap_or_else(|e| e.into_inner());
                if let Err(e) = conn.execute(
                    "INSERT INTO document_chunks (id, document_id, content, chunk_index, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
                    rusqlite::params![chunk_id, doc_id, chunk_content, chunk_idx as i32, now],
                ) {
                    log::warn!("Failed to insert chunk {}: {}", chunk_id, e);
                    continue;
                }
                if let Err(e) = conn.execute(
                    "INSERT INTO fts_documents (content) VALUES (?1)",
                    rusqlite::params![chunk_content],
                ) {
                    log::warn!("Failed to insert into FTS: {}", e);
                }
            }

            match get_embedding(&client, chunk_content).await {
                Ok(embedding) => {
                    let embedding_id = uuid::Uuid::new_v4().to_string();
                    let blob = embedding_to_blob(&embedding);
                    let now_emb = chrono::Utc::now().to_rfc3339();

                    let conn = db.lock().unwrap_or_else(|e| e.into_inner());
                    if let Err(e) = conn.execute(
                        "INSERT INTO embeddings (id, chunk_id, vector, created_at) VALUES (?1, ?2, ?3, ?4)",
                        rusqlite::params![embedding_id, chunk_id, blob, now_emb],
                    ) {
                        log::warn!("Failed to insert embedding: {}", e);
                    }
                }
                Err(e) => {
                    log::warn!("Embedding failed for chunk {} of {}: {}", chunk_idx, doc_name, e);
                }
            }

            {
                let mut st = controller.state.lock().unwrap_or_else(|e| e.into_inner());
                st.current_chunk = (chunk_idx + 1) as u32;
            }

            let elapsed = start_time.elapsed().as_secs();
            let completed_docs = doc_idx as u32;
            let remaining_docs = total.saturating_sub(completed_docs + 1);
            let eta = if completed_docs > 0 {
                (elapsed / (completed_docs as u64)) * remaining_docs as u64
            } else {
                0
            };

            let _ = app_handle.emit("indexing-progress", IndexingProgress {
                status: "running".to_string(),
                total_documents: total,
                completed_documents: completed_docs,
                current_document: doc_name.clone(),
                current_chunk: (chunk_idx + 1) as u32,
                total_chunks,
                eta_seconds: eta,
            });
        }

        {
            let conn = db.lock().unwrap_or_else(|e| e.into_inner());
            if let Err(e) = crate::db::update_indexing_status(&conn, doc_id) {
                log::warn!("Failed to mark document {} as indexed: {}", doc_id, e);
            }
        }

        {
            let mut st = controller.state.lock().unwrap_or_else(|e| e.into_inner());
            st.completed_documents += 1;
        }
    }

    {
        let mut st = controller.state.lock().unwrap_or_else(|e| e.into_inner());
        st.status = "completed".to_string();
        st.current_document = String::new();
        st.current_chunk = 0;
        st.total_chunks = 0;
        st.eta_seconds = 0;
    }

    let _ = app_handle.emit("indexing-progress", IndexingProgress {
        status: "completed".to_string(),
        total_documents: total,
        completed_documents: total,
        current_document: String::new(),
        current_chunk: 0,
        total_chunks: 0,
        eta_seconds: 0,
    });
}

#[cfg(test)]
mod tests {
    use super::*;
    use rusqlite::Connection;

    fn setup_test_db() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch(
            "PRAGMA journal_mode = WAL;
             PRAGMA foreign_keys = ON;
             CREATE TABLE IF NOT EXISTS documents (
               id TEXT PRIMARY KEY,
               name TEXT NOT NULL,
               path TEXT NOT NULL,
               category TEXT,
               file_type TEXT,
               size_bytes INTEGER,
               indexed INTEGER DEFAULT 0,
               created_at DATETIME DEFAULT CURRENT_TIMESTAMP
             );
             CREATE TABLE IF NOT EXISTS document_chunks (
               id TEXT PRIMARY KEY,
               document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
               content TEXT NOT NULL,
               chunk_index INTEGER NOT NULL,
               created_at DATETIME DEFAULT CURRENT_TIMESTAMP
             );
             CREATE VIRTUAL TABLE IF NOT EXISTS fts_documents USING fts5(
               content,
               content_rowid = rowid,
               tokenize = 'porter'
             );
             CREATE TABLE IF NOT EXISTS embeddings (
               id TEXT PRIMARY KEY,
               chunk_id TEXT NOT NULL REFERENCES document_chunks(id) ON DELETE CASCADE,
               vector BLOB,
               created_at DATETIME DEFAULT CURRENT_TIMESTAMP
             );"
        ).unwrap();
        conn
    }

    fn insert_test_doc(conn: &Connection, id: &str, name: &str, path: &str, indexed: bool) {
        conn.execute(
            "INSERT INTO documents (id, name, path, category, file_type, size_bytes, indexed, created_at) VALUES (?1, ?2, ?3, 'test', 'TXT', 100, ?4, '2025-01-01T00:00:00Z')",
            rusqlite::params![id, name, path, indexed as i32],
        ).unwrap();
    }

    #[test]
    fn test_chunk_text_short() {
        let text = "Short text";
        let chunks = chunk_text(text);
        assert_eq!(chunks.len(), 1);
        assert_eq!(chunks[0], "Short text");
    }

    #[test]
    fn test_chunk_text_empty() {
        let chunks = chunk_text("");
        assert!(chunks.is_empty() || chunks.iter().all(|c| c.trim().is_empty()));
    }

    #[test]
    fn test_chunk_text_long_splits() {
        let text = "A".repeat(5000);
        let chunks = chunk_text(&text);
        assert!(chunks.len() > 1);
        for chunk in &chunks {
            assert!(!chunk.trim().is_empty());
        }
    }

    #[test]
    fn test_chunk_text_preserves_content() {
        let text = "Hello world. This is a test. With multiple sentences. And more text. To fill up space. And verify chunking works correctly. The end.";
        let chunks = chunk_text(text);
        let reassembled: String = chunks.join("");
        assert!(reassembled.contains("Hello world"));
        assert!(reassembled.contains("The end"));
    }

    #[test]
    fn test_chunk_text_at_boundary() {
        let text = "A".repeat(CHUNK_SIZE_CHARS);
        let chunks = chunk_text(&text);
        assert_eq!(chunks.len(), 1);
    }

    #[test]
    fn test_query_documents_all_unindexed() {
        let conn = setup_test_db();
        insert_test_doc(&conn, "doc-1", "file1.txt", "/tmp/file1.txt", false);
        insert_test_doc(&conn, "doc-2", "file2.txt", "/tmp/file2.txt", false);

        let result = query_documents(&conn, &None);
        assert!(result.is_ok());
        let docs = result.unwrap();
        assert_eq!(docs.len(), 2);
    }

    #[test]
    fn test_query_documents_skips_indexed() {
        let conn = setup_test_db();
        insert_test_doc(&conn, "doc-1", "file1.txt", "/tmp/file1.txt", true);
        insert_test_doc(&conn, "doc-2", "file2.txt", "/tmp/file2.txt", false);

        let result = query_documents(&conn, &None);
        assert!(result.is_ok());
        let docs = result.unwrap();
        assert_eq!(docs.len(), 1);
        assert_eq!(docs[0].0, "doc-2");
    }

    #[test]
    fn test_query_documents_with_specific_ids() {
        let conn = setup_test_db();
        insert_test_doc(&conn, "doc-1", "file1.txt", "/tmp/file1.txt", false);
        insert_test_doc(&conn, "doc-2", "file2.txt", "/tmp/file2.txt", false);
        insert_test_doc(&conn, "doc-3", "file3.txt", "/tmp/file3.txt", false);

        let result = query_documents(&conn, &Some(vec!["doc-1".to_string(), "doc-3".to_string()]));
        assert!(result.is_ok());
        let docs = result.unwrap();
        assert_eq!(docs.len(), 2);
    }

    #[test]
    fn test_query_documents_empty_db() {
        let conn = setup_test_db();
        let result = query_documents(&conn, &None);
        assert!(result.is_ok());
        assert_eq!(result.unwrap().len(), 0);
    }

    #[test]
    fn test_query_documents_nonexistent_id() {
        let conn = setup_test_db();
        insert_test_doc(&conn, "doc-1", "file1.txt", "/tmp/file1.txt", false);

        let result = query_documents(&conn, &Some(vec!["nonexistent".to_string()]));
        assert!(result.is_ok());
        assert_eq!(result.unwrap().len(), 0);
    }

    #[test]
    fn test_indexing_controller_default() {
        let ctrl = IndexingController::new();
        let state = ctrl.state.lock().unwrap();
        assert_eq!(state.status, "idle");
        assert_eq!(state.total_documents, 0);
        assert_eq!(state.completed_documents, 0);
        assert!(state.error.is_none());
    }

    #[test]
    fn test_indexing_controller_flags() {
        let ctrl = IndexingController::new();
        assert!(!ctrl.pause_flag.load(Ordering::Relaxed));
        assert!(!ctrl.cancel_flag.load(Ordering::Relaxed));
        ctrl.pause_flag.store(true, Ordering::Relaxed);
        assert!(ctrl.pause_flag.load(Ordering::Relaxed));
    }

    #[test]
    fn test_embedding_to_blob() {
        let embedding = vec![1.0f32, 2.0, 3.0];
        let blob = embedding_to_blob(&embedding);
        assert_eq!(blob.len(), 12);
        // Verify round-trip
        let first = f32::from_le_bytes([blob[0], blob[1], blob[2], blob[3]]);
        assert_eq!(first, 1.0f32);
    }

    #[test]
    fn test_indexing_state_default() {
        let state = IndexingState::default();
        assert_eq!(state.status, "idle");
        assert_eq!(state.total_documents, 0);
        assert_eq!(state.completed_documents, 0);
        assert_eq!(state.current_document, "");
        assert_eq!(state.current_chunk, 0);
        assert_eq!(state.total_chunks, 0);
        assert_eq!(state.eta_seconds, 0);
        assert!(state.error.is_none());
    }

    #[test]
    fn test_indexing_controller_cancel_flag_toggle() {
        let ctrl = IndexingController::new();
        assert!(!ctrl.cancel_flag.load(Ordering::Relaxed));
        ctrl.cancel_flag.store(true, Ordering::Relaxed);
        assert!(ctrl.cancel_flag.load(Ordering::Relaxed));
        ctrl.cancel_flag.store(false, Ordering::Relaxed);
        assert!(!ctrl.cancel_flag.load(Ordering::Relaxed));
    }

    #[test]
    fn test_chunk_text_respects_paragraph_breaks() {
        let para1 = "a".repeat(1500);
        let para2 = "b".repeat(1500);
        let text = format!("{}\n\n{}", para1, para2);
        let chunks = chunk_text(&text);
        assert!(chunks.len() >= 2, "should split at paragraph boundaries");
    }
}