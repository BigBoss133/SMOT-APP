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

fn chunk_text(text: &str) -> Vec<String> {
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

pub async fn start_indexing(
    app_handle: AppHandle,
    controller: Arc<IndexingController>,
    db: Arc<Mutex<Connection>>,
) {
    let client = reqwest::Client::new();
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
        let mut stmt = conn.prepare(
            "SELECT id, name, path FROM documents WHERE indexed = 0"
        );
        let mut stmt = match stmt {
            Ok(s) => s,
            Err(e) => {
                let mut st = controller.state.lock().unwrap_or_else(|e| e.into_inner());
                st.status = "error".to_string();
                st.error = Some(format!("DB query error: {}", e));
                return;
            }
        };
        let rows: Vec<(String, String, String)> = match stmt.query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
            ))
        }) {
            Ok(mapped) => mapped.filter_map(|r| r.ok()).collect(),
            Err(e) => {
                let mut st = controller.state.lock().unwrap_or_else(|e| e.into_inner());
                st.status = "error".to_string();
                st.error = Some(format!("DB query error: {}", e));
                return;
            }
        };
        rows
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