mod auto_config;
mod db;
mod indexing;
mod ollama;
mod parsers;
mod setup;
mod system_probe;

use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use sysinfo::{Disks, System};
use tauri::Manager;

struct AppState {
  active_mode: Mutex<String>,
  db: Arc<Mutex<Connection>>,
  controller: Arc<indexing::IndexingController>,
}

#[derive(Serialize)]
struct ModeData {
  active_mode: String,
  available_modes: Vec<String>,
}

#[derive(Serialize)]
struct SystemStatus {
  offline_secure: bool,
  ram_used_gb: f32,
  ram_total_gb: f32,
  cpu_percent: u8,
  gpu_percent: u8,
  documents_total: u16,
  documents_indexed: u16,
  storage_total_gb: u16,
  active_model: String,
}

#[derive(Serialize)]
struct ViewerDocument {
  id: String,
  name: String,
  file_type: String,
  category: String,
  indexed: bool,
  size_kb: u32,
  pages: u16,
}

#[derive(Deserialize)]
struct UploadDocumentInput {
  files: Vec<String>,
  category: String,
}

#[derive(Serialize)]
struct UploadedDocument {
  id: String,
  name: String,
}

#[derive(Serialize)]
struct UploadResponse {
  uploaded_documents: Vec<UploadedDocument>,
}

#[derive(Deserialize)]
struct StartIndexingInput {
  document_ids: Vec<String>,
}

#[derive(Serialize)]
struct StartIndexingResponse {
  job_id: String,
}

#[derive(Serialize)]
struct IndexingFileStatus {
  document_id: String,
  document_name: String,
  file_progress: u8,
  chunk_done: u8,
  chunk_total: u8,
  embedding_done: u8,
  embedding_total: u8,
}

#[derive(Serialize)]
struct IndexingStatus {
  status: String,
  overall_progress: u8,
  completed_documents: u8,
  total_documents: u8,
  eta_seconds: u16,
  processed_kb: u16,
  total_kb: u16,
  files: Vec<IndexingFileStatus>,
}

#[derive(Deserialize)]
struct JobInput {
  job_id: String,
}

#[derive(Serialize)]
struct ChatSource {
  document_id: String,
  document_name: String,
  page: u8,
  snippet: String,
}

#[derive(Deserialize)]
struct ChatQueryInput {
  question: String,
  filter_category: String,
}

#[derive(Serialize)]
struct ChatResponse {
  answer: String,
  sources: Vec<ChatSource>,
}

#[derive(Deserialize)]
struct ViewerPageInput {
  document_id: String,
  page: u16,
}

#[derive(Serialize)]
struct ViewerPageData {
  document_id: String,
  document_name: String,
  page: u16,
  total_pages: u16,
  highlights: Vec<String>,
  text: String,
}

#[derive(Deserialize)]
struct ParseDocumentInput {
  file_path: String,
}



#[tauri::command]
async fn get_system_status(state: tauri::State<'_, AppState>) -> Result<SystemStatus, String> {
  let mut sys = System::new_all();
  sys.refresh_all();

  let cpu = sys.global_cpu_usage() as u8;
  let ram_total = sys.total_memory() as f32 / 1073741824.0;
  let ram_used = (sys.total_memory() - sys.available_memory()) as f32 / 1073741824.0;

  let disks = Disks::new_with_refreshed_list();
  let total_storage = disks.iter().fold(0u64, |acc, d| acc + d.total_space()) as f32 / 1073741824.0;

  let (doc_count, indexed_count) = {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let docs: i64 = db.query_row("SELECT COUNT(*) FROM documents", [], |r| r.get(0)).unwrap_or(0);
    let indexed: i64 = db.query_row("SELECT COUNT(*) FROM documents WHERE indexed = 1", [], |r| r.get(0)).unwrap_or(0);
    (docs as u16, indexed as u16)
  };

  let active_model = match crate::ollama::check_ollama_status().await {
    status if status.running => status.models.first().cloned().unwrap_or_else(|| "none".to_string()),
    _ => "none (Ollama not running)".to_string(),
  };

  Ok(SystemStatus {
    offline_secure: true,
    ram_used_gb: (ram_used * 10.0).round() / 10.0,
    ram_total_gb: (ram_total * 10.0).round() / 10.0,
    cpu_percent: cpu,
    gpu_percent: 0,
    documents_total: doc_count,
    documents_indexed: indexed_count,
    storage_total_gb: total_storage as u16,
    active_model,
  })
}

#[tauri::command]
fn get_modes(state: tauri::State<AppState>) -> ModeData {
  let mode = state
    .active_mode
    .lock()
    .map(|value| value.clone())
    .unwrap_or_else(|_| "Balanced".to_string());
  ModeData {
    active_mode: mode,
    available_modes: vec![
      "Performance".to_string(),
      "Balanced".to_string(),
      "Lite".to_string(),
    ],
  }
}

#[tauri::command]
fn update_mode(mode: String, state: tauri::State<AppState>) -> ModeData {
  if let Ok(mut current) = state.active_mode.lock() {
    *current = mode.clone();
  }
  ModeData {
    active_mode: mode,
    available_modes: vec![
      "Performance".to_string(),
      "Balanced".to_string(),
      "Lite".to_string(),
    ],
  }
}

#[tauri::command]
fn get_documents(state: tauri::State<AppState>) -> Result<Vec<ViewerDocument>, String> {
  let db = state.db.lock().map_err(|e| e.to_string())?;
  let mut stmt = db
    .prepare("SELECT id, name, file_type, size_bytes, created_at, indexed FROM documents ORDER BY created_at DESC")
    .map_err(|e| e.to_string())?;

  let docs = stmt
    .query_map([], |row| {
      let id: String = row.get(0)?;
      let filename: String = row.get(1)?;
      let file_type: String = row.get(2)?;
      let size_bytes: i64 = row.get(3)?;
      let indexed: bool = row.get(5)?;

      Ok(ViewerDocument {
        id,
        name: filename,
        file_type,
        category: String::new(),
        indexed,
        size_kb: (size_bytes / 1024) as u32,
        pages: 0,
      })
    })
    .map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect::<Vec<_>>();

  Ok(docs)
}

#[tauri::command]
fn upload_documents(
  app_handle: tauri::AppHandle,
  state: tauri::State<AppState>,
  payload: UploadDocumentInput,
) -> Result<UploadResponse, String> {
  use std::fs;
  use std::path::PathBuf;

  let app_data_dir = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;
  let docs_dir = app_data_dir.join("documents");
  fs::create_dir_all(&docs_dir).map_err(|e| format!("Cannot create documents dir: {}", e))?;

  let db = state.db.lock().map_err(|e| e.to_string())?;
  let mut uploaded = Vec::new();

  for file_path_str in &payload.files {
    let src = PathBuf::from(file_path_str);
    if !src.exists() {
      return Err(format!("File not found: {}", file_path_str));
    }

    let ext = src
      .extension()
      .and_then(|e| e.to_str())
      .unwrap_or("bin")
      .to_lowercase();

    let file_name = src
      .file_name()
      .and_then(|n| n.to_str())
      .unwrap_or("unknown")
      .to_string();

    let file_size = src.metadata().map(|m| m.len() as i64).unwrap_or(0);
    let uuid = uuid::Uuid::new_v4().to_string();
    let dest_file_name = format!("{}.{}", uuid, ext);
    let dest_path = docs_dir.join(&dest_file_name);

    fs::copy(&src, &dest_path).map_err(|e| format!("Cannot copy file: {}", e))?;

    let now = chrono::Utc::now().to_rfc3339();
    let relative_path = format!("documents/{}", dest_file_name);
    db.execute(
      "INSERT INTO documents (id, name, path, category, file_type, size_bytes, indexed, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, 0, ?7)",
      rusqlite::params![uuid, file_name, relative_path, payload.category, ext.to_uppercase(), file_size, now],
    ).map_err(|e| format!("DB insert error: {}", e))?;

    uploaded.push(UploadedDocument {
      id: uuid,
      name: file_name,
    });
  }

  Ok(UploadResponse {
    uploaded_documents: uploaded,
  })
}

#[tauri::command]
async fn start_indexing(
  app_handle: tauri::AppHandle,
  state: tauri::State<'_, AppState>,
  payload: StartIndexingInput,
) -> Result<StartIndexingResponse, String> {
  {
    let ctrl_state = state.controller.state.lock().map_err(|e| e.to_string())?;
    if ctrl_state.status == "running" {
      return Err("Indexing already in progress".to_string());
    }
  }

  {
    let mut ctrl_state = state.controller.state.lock().map_err(|e| e.to_string())?;
    ctrl_state.status = "running".to_string();
    ctrl_state.completed_documents = 0;
    ctrl_state.error = None;
    state.controller.pause_flag.store(false, std::sync::atomic::Ordering::Relaxed);
    state.controller.cancel_flag.store(false, std::sync::atomic::Ordering::Relaxed);
  }

  let controller = state.controller.clone();
  let db = state.db.clone();

  let app = app_handle.clone();
  tauri::async_runtime::spawn(async move {
    crate::indexing::start_indexing(app, controller, db).await;
  });

  Ok(StartIndexingResponse { job_id: "indexing-active".to_string() })
}

#[tauri::command]
fn get_indexing_status(state: tauri::State<AppState>) -> IndexingStatus {
  let ctrl = state.controller.state.lock().unwrap_or_else(|e| e.into_inner());
  let progress = if ctrl.total_documents > 0 {
    ((ctrl.completed_documents as f32 / ctrl.total_documents as f32) * 100.0) as u8
  } else {
    0
  };
  IndexingStatus {
    status: ctrl.status.clone(),
    overall_progress: progress,
    completed_documents: ctrl.completed_documents as u8,
    total_documents: ctrl.total_documents as u8,
    eta_seconds: ctrl.eta_seconds as u16,
    processed_kb: 0,
    total_kb: 0,
    files: vec![],
  }
}

#[tauri::command]
fn pause_indexing(state: tauri::State<AppState>) -> Result<serde_json::Value, String> {
  state.controller.pause_flag.store(true, std::sync::atomic::Ordering::Relaxed);
  Ok(serde_json::json!({"status": "pausing"}))
}

#[tauri::command]
fn resume_indexing(state: tauri::State<AppState>) -> Result<serde_json::Value, String> {
  state.controller.pause_flag.store(false, std::sync::atomic::Ordering::Relaxed);
  Ok(serde_json::json!({"status": "running"}))
}

#[tauri::command]
fn continue_in_background(state: tauri::State<AppState>) -> Result<serde_json::Value, String> {
  state.controller.pause_flag.store(false, std::sync::atomic::Ordering::Relaxed);
  Ok(serde_json::json!({"status": "background"}))
}

#[tauri::command]
async fn chat_query(state: tauri::State<'_, AppState>, payload: ChatQueryInput) -> Result<ChatResponse, String> {
  if payload.question.trim().is_empty() {
    return Err("Query cannot be empty".to_string());
  }

  // --- DB operations (lock is dropped before async) ---
  let sources = {
  let db = state.db.lock().map_err(|e| e.to_string())?;

  // Build FTS5 search query from user question words
  let search_query = payload.question.split_whitespace()
    .filter(|w| w.len() > 2)
    .map(|w| format!("\"{}\"", w))
    .collect::<Vec<_>>()
    .join(" OR ");

  let mut sources = Vec::new();

  if !search_query.is_empty() {
    let fts_sql = format!(
      "SELECT c.document_id, d.name, c.chunk_index, snippet(fts_documents, 0, '<mark>', '</mark>', '...', 40) as snippet \
       FROM fts_documents fts \
       JOIN document_chunks c ON fts.rowid = c.rowid \
       JOIN documents d ON c.document_id = d.id \
       WHERE fts_documents MATCH ?1 \
       ORDER BY rank \
       LIMIT 5"
    );

    let mut stmt = db.prepare(&fts_sql).map_err(|e| e.to_string())?;

    let rows = stmt.query_map(rusqlite::params![&search_query], |row| {
      let doc_id: String = row.get(0)?;
      let doc_name: String = row.get(1)?;
      let chunk_idx: i64 = row.get(2)?;
      let snippet_text: String = row.get(3)?;

      Ok(ChatSource {
        document_id: doc_id,
        document_name: doc_name,
        page: (chunk_idx as u8) + 1,
        snippet: snippet_text,
      })
    }).map_err(|e| e.to_string())?;

    for row in rows {
      if let Ok(source) = row {
        sources.push(source);
      }
    }
  }

  sources
  }; // DB lock is DROPPED here

  // Build context from sources
  let context = sources.iter()
    .map(|s| format!("[Document: {} | Page: {}] {}", s.document_name, s.page, s.snippet))
    .collect::<Vec<_>>()
    .join("\n\n");

  // No results — return early
  if sources.is_empty() {
    return Ok(ChatResponse {
      answer: "No relevant documents found for your query. Try different keywords or upload more documents.".to_string(),
      sources: vec![],
    });
  }

  // Build prompt for Ollama
  let system_prompt = "You are a document assistant. Answer the user's question based ONLY on the provided context. If the context doesn't contain enough information, say so. Be concise.";
  let user_prompt = format!("Context:\n{}\n\nQuestion: {}", context, payload.question);

  let client = reqwest::Client::new();
  let ollama_payload = serde_json::json!({
    "model": "llama3.1:8b",
    "prompt": format!("{}\n\n{}", system_prompt, user_prompt),
    "stream": false,
    "options": { "temperature": 0.3, "num_predict": 500 }
  });

  match client.post("http://localhost:11434/api/generate")
    .json(&ollama_payload)
    .timeout(std::time::Duration::from_secs(30))
    .send()
    .await
  {
    Ok(resp) => {
      let body: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;
      let answer = body["response"].as_str().unwrap_or("No response from model").to_string();
      Ok(ChatResponse { answer, sources })
    },
    Err(_) => {
      // Fallback when Ollama is not running
      Ok(ChatResponse {
        answer: format!(
          "I found {} relevant documents, but Ollama is not running. Start Ollama to get AI-powered answers.\n\nFound documents:\n{}",
          sources.len(),
          sources.iter().map(|s| format!("- {} (page {})", s.document_name, s.page)).collect::<Vec<_>>().join("\n")
        ),
        sources,
      })
    }
  }
}

#[tauri::command]
fn get_viewer_page(
  app_handle: tauri::AppHandle,
  state: tauri::State<'_, AppState>,
  payload: ViewerPageInput,
) -> Result<ViewerPageData, String> {
  // Look up document in DB for name and path
  let (doc_name, doc_path_str) = {
    let db = state.db.lock().map_err(|e| format!("DB lock error: {}", e))?;
    let mut stmt = db
      .prepare("SELECT name, path FROM documents WHERE id = ?1")
      .map_err(|e| format!("DB query error: {}", e))?;
    stmt.query_row(rusqlite::params![&payload.document_id], |row| {
      Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
    })
    .map_err(|e| format!("Document not found in DB: {}", e))?
  };

  // Resolve file path (try absolute first, then relative to app_data_dir)
  let doc_path = std::path::PathBuf::from(&doc_path_str);
  let resolved_path = if doc_path.is_absolute() && doc_path.exists() {
    doc_path
  } else {
    let app_data_dir = app_handle
      .path()
      .app_data_dir()
      .map_err(|e| format!("Cannot get app data dir: {}", e))?;
    let relative_path = app_data_dir.join(&doc_path_str);
    if relative_path.exists() {
      relative_path
    } else {
      app_data_dir.join("documents").join(&doc_path_str)
    }
  };

  if !resolved_path.exists() {
    return Err(format!("Document file not found: {}", doc_path_str));
  }

  // Extract text using the parsers module
  let doc_text = parsers::extract_document_text(resolved_path)
    .map_err(|e| format!("Failed to extract text: {}", e))?;

  // Split text into "pages" (approximate for non-PDF; PDFs use actual page count)
  let lines: Vec<&str> = doc_text.text.lines().collect();
  let lines_per_page = 50;
  let total_pages = if let Some(pc) = doc_text.page_count {
    pc as u16
  } else {
    ((lines.len() + lines_per_page - 1) / lines_per_page).max(1) as u16
  };

  // payload.page is 1-indexed from the frontend
  let requested_page = payload.page.max(1);
  let page_index = (requested_page - 1).min(total_pages.saturating_sub(1)) as usize;
  let start_line = page_index * lines_per_page;
  let end_line = (start_line + lines_per_page).min(lines.len());
  let page_text = if start_line < lines.len() {
    lines[start_line..end_line].join("\n")
  } else {
    String::new()
  };

  Ok(ViewerPageData {
    document_id: payload.document_id,
    document_name: doc_name,
    page: (page_index + 1) as u16,
    total_pages,
    highlights: vec![],
    text: page_text,
  })
}

#[tauri::command]
fn parse_document_text(payload: ParseDocumentInput) -> Result<parsers::ParsedDocumentOutput, String> {
  parsers::extract_document_text(payload.file_path.into())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      ollama::get_ollama_status,
      ollama::pull_ollama_model,
      ollama::check_disk_space,
      get_system_status,
      get_modes,
      update_mode,
      get_documents,
      upload_documents,
      start_indexing,
      get_indexing_status,
      pause_indexing,
      resume_indexing,
      continue_in_background,
      chat_query,
      get_viewer_page,
      parse_document_text,
      setup::complete_onboarding
    ])
    .setup(|app| {
      let db_path = db::init_database(&app.handle())?;
      let connection = Connection::open(&db_path)
        .expect("Failed to open database connection");

      let state = AppState {
        active_mode: Mutex::new("Balanced".to_string()),
        db: Arc::new(Mutex::new(connection)),
        controller: Arc::new(indexing::IndexingController::new()),
      };
      app.manage(state);

      setup::on_app_startup(app);

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      app.handle().plugin(tauri_plugin_updater::Builder::default().build())?;

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
