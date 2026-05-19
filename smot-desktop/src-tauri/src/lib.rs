mod auto_config;
mod db;
mod error;
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

pub struct AppState {
  active_mode: Mutex<String>,
  db: Arc<Mutex<Connection>>,
  controller: Arc<indexing::IndexingController>,
  client: reqwest::Client,
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
struct IndexingStatus {
  status: String,
  overall_progress: u8,
  completed_documents: u8,
  total_documents: u8,
  eta_seconds: u16,
  processed_kb: u16,
  total_kb: u16,
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
  #[allow(dead_code)]
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

// --- Public validation helpers (testable without Tauri runtime) ---

pub fn validate_upload_file_path(path: &str) -> Result<(), String> {
  if path.trim().is_empty() {
    return Err("Filename cannot be empty".to_string());
  }
  if path.contains("..") {
    return Err(format!("Invalid path (path traversal not allowed): {}", path));
  }
  let src = std::path::PathBuf::from(path);
  let stem = src.file_stem().and_then(|s| s.to_str()).unwrap_or("");
  const RESERVED_WINDOWS_NAMES: &[&str] = &[
    "CON", "PRN", "AUX", "NUL",
    "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
    "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
  ];
  if RESERVED_WINDOWS_NAMES.contains(&stem.to_uppercase().as_str()) {
    return Err(format!("Invalid filename (reserved Windows name): {}", path));
  }
  Ok(())
}

pub fn validate_chat_query(query: &str) -> Result<(), String> {
  if query.trim().is_empty() {
    return Err("Query cannot be empty".to_string());
  }
  if query.len() > 1000 {
    return Err("Query too long (max 1000 characters)".to_string());
  }
  Ok(())
}

pub fn validate_document_id(id: &str) -> Result<(), String> {
  uuid::Uuid::parse_str(id).map_err(|_| format!("Invalid document ID: {}", id))?;
  Ok(())
}


#[tauri::command]
async fn get_system_status(state: tauri::State<'_, AppState>) -> Result<SystemStatus, String> {
  let mut sys = System::new_all();
  sys.refresh_all();

  let cpu = sys.cpus().first().map(|c| c.cpu_usage() as u8).unwrap_or(0);
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

  let active_model = match crate::ollama::check_ollama_status(&state.client).await {
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
  let docs = db::get_all_documents(&db)
    .map_err(|e| e.to_string())?
    .into_iter()
    .map(|row| ViewerDocument {
      id: row.id,
      name: row.name,
      file_type: row.file_type,
      category: String::new(),
      indexed: row.indexed,
      size_kb: (row.size_bytes / 1024) as u32,
      pages: 0,
    })
    .collect();
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
    if file_path_str.trim().is_empty() {
      return Err("Filename cannot be empty".to_string());
    }
    if file_path_str.contains("..") {
      return Err(format!("Invalid path (path traversal not allowed): {}", file_path_str));
    }
    let src = PathBuf::from(file_path_str);
    if !src.exists() {
      return Err(format!("File not found: {}", file_path_str));
    }

    // Check for Windows reserved names
    let stem = src.file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("");
    let reserved_names = ["CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "LPT1", "LPT2", "LPT3"];
    if reserved_names.contains(&stem.to_uppercase().as_str()) {
      return Err(format!("Invalid filename (reserved name): {}", file_path_str));
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

    const RESERVED_WINDOWS_NAMES: &[&str] = &["CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9"];
    let stem = src.file_stem().and_then(|s| s.to_str()).unwrap_or("");
    if RESERVED_WINDOWS_NAMES.contains(&stem.to_uppercase().as_str()) {
      return Err(format!("Invalid filename (reserved Windows name): {}", file_name));
    }

    let file_size = src.metadata().map(|m| m.len() as i64).unwrap_or(0);
    let uuid = uuid::Uuid::new_v4().to_string();
    let dest_file_name = format!("{}.{}", uuid, ext);
    let dest_path = docs_dir.join(&dest_file_name);

    fs::copy(&src, &dest_path).map_err(|e| format!("Cannot copy file: {}", e))?;

    let now = chrono::Utc::now().to_rfc3339();
    let relative_path = format!("documents/{}", dest_file_name);
    db::insert_document(&db, &uuid, &file_name, &relative_path, &payload.category, &ext.to_uppercase(), file_size, &now)
      .map_err(|e| format!("DB insert error: {}", e))?;

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

let document_ids = if payload.document_ids.is_empty() { None } else { Some(payload.document_ids) };
  let controller = state.controller.clone();
  let db = state.db.clone();
  let client = state.client.clone();

  let app = app_handle.clone();
  tauri::async_runtime::spawn(async move {
    crate::indexing::start_indexing(app, controller, db, client, document_ids).await;
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
  if payload.question.len() > 1000 {
    return Err("Query too long (max 1000 characters)".to_string());
  }

  ollama::check_rate_limit().map_err(|e| e.to_string())?;

  let (sources, context) = {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    // Build FTS5 search query from user question words
    let search_query = payload.question.split_whitespace()
      .filter(|w| w.len() > 2)
      .map(|w| format!("\"{}\"", w))
      .collect::<Vec<_>>()
      .join(" OR ");

    let mut sources = Vec::new();

    if !search_query.is_empty() {
      let results = db::search_fts5(&db, &search_query)
        .map_err(|e| e.to_string())?;
      for r in results {
        sources.push(ChatSource {
          document_id: r.document_id,
          document_name: r.document_name,
          page: (r.chunk_index as u8) + 1,
          snippet: r.snippet,
        });
      }
    }

    // Build context from sources
    let context = sources.iter()
      .map(|s| format!("[Document: {} | Page: {}] {}", s.document_name, s.page, s.snippet))
      .collect::<Vec<_>>()
      .join("\n\n");

    (sources, context)
  };

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

  let client = state.client.clone();
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
  // Validate document_id is a valid UUID
  uuid::Uuid::parse_str(&payload.document_id)
    .map_err(|_| format!("Invalid document ID: {}", payload.document_id))?;

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
    lines.len().div_ceil(lines_per_page).max(1) as u16
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

// --- Tray & License commands ---

#[tauri::command]
async fn minimize_to_tray(app_handle: tauri::AppHandle) -> Result<(), String> {
  if let Some(window) = app_handle.get_webview_window("main") {
    window.hide().map_err(|e| e.to_string())?;
  }
  Ok(())
}

#[derive(Serialize)]
struct LicenseStatusResponse {
  status: String,
}

#[tauri::command]
fn get_license_status(app_handle: tauri::AppHandle) -> LicenseStatusResponse {
  let status = match crate::setup::load_config(&app_handle) {
    Some(cfg) if cfg.license.is_some() => "active",
    _ => "trial",
  };
  LicenseStatusResponse { status: status.to_string() }
}

#[derive(Deserialize)]
struct ValidateLicenseInput {
  key: String,
}

#[derive(Serialize)]
struct ValidateLicenseResponse {
  valid: bool,
}

fn check_license_format(key: &str) -> bool {
  let key = key.trim();
  if key.len() != 19 { return false; }
  let parts: Vec<&str> = key.split('-').collect();
  if parts.len() != 4 { return false; }
  parts.iter().all(|p| p.len() == 4 && p.chars().all(|c| c.is_ascii_alphanumeric()))
}

#[tauri::command]
fn validate_license(app_handle: tauri::AppHandle, payload: ValidateLicenseInput) -> ValidateLicenseResponse {
  let uppercased = payload.key.trim().to_uppercase();
  if !check_license_format(&uppercased) {
    return ValidateLicenseResponse { valid: false };
  }
  if let Some(mut config) = crate::setup::load_config(&app_handle) {
    config.license = Some(uppercased);
    if let Some(app_data_dir) = app_handle.path().app_data_dir().ok() {
      let config_path = app_data_dir.join("config.json");
      crate::setup::save_config(&config_path, &config);
    }
  }
  ValidateLicenseResponse { valid: true }
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
      setup::complete_onboarding,
      minimize_to_tray,
      get_license_status,
      validate_license
    ])
    .on_window_event(|window, event| {
      if let tauri::WindowEvent::CloseRequested { api, .. } = event {
        let _ = window.hide();
        api.prevent_close();
      }
    })
    .setup(|app| {
      let db_path = db::init_database(app.handle())?;
      let connection = match Connection::open(&db_path) {
        Ok(conn) => conn,
        Err(e) => {
          log::error!("Failed to open database connection: {}", e);
          return Err(Box::new(e) as Box<dyn std::error::Error>);
        }
      };

let state = AppState {
        active_mode: Mutex::new("Balanced".to_string()),
        db: Arc::new(Mutex::new(connection)),
        controller: Arc::new(indexing::IndexingController::new()),
        client: reqwest::Client::new(),
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

      // Setup tray icon
      let show_item = tauri::menu::MenuItemBuilder::with_id("show", "Mostra / Nascondi")
        .build(app)?;
      let quit_item = tauri::menu::MenuItemBuilder::with_id("quit", "Esci")
        .build(app)?;
      let menu = tauri::menu::MenuBuilder::new(app)
        .item(&show_item)
        .item(&quit_item)
        .build()?;

      let icon = app.default_window_icon().cloned().unwrap_or_else(|| {
        let pixel = [10u8, 26, 59, 255];
        let mut rgba = Vec::with_capacity(32 * 32 * 4);
        for _ in 0..(32 * 32) {
          rgba.extend_from_slice(&pixel);
        }
        tauri::image::Image::new_owned(rgba, 32, 32)
      });

      let _tray = tauri::tray::TrayIconBuilder::new()
        .icon(icon)
        .menu(&menu)
        .tooltip("SMOT Smart Archive")
        .on_menu_event(|app, event| {
          match event.id.as_ref() {
            "show" => {
              if let Some(window) = app.get_webview_window("main") {
                if window.is_visible().unwrap_or(false) {
                  let _ = window.hide();
                } else {
                  let _ = window.show();
                  let _ = window.set_focus();
                }
              }
            }
            "quit" => {
              app.exit(0);
            }
            _ => {}
          }
        })
        .build(app)?;

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_validate_upload_path_empty() {
    assert!(validate_upload_file_path("").is_err());
    assert!(validate_upload_file_path("   ").is_err());
  }

  #[test]
  fn test_validate_upload_path_traversal() {
    assert!(validate_upload_file_path("../etc/passwd").is_err());
    assert!(validate_upload_file_path("docs/../../secret").is_err());
  }

  #[test]
  fn test_validate_upload_path_reserved_name_con() {
    assert!(validate_upload_file_path("/tmp/CON.txt").is_err());
  }

  #[test]
  fn test_validate_upload_path_reserved_name_aux() {
    assert!(validate_upload_file_path("/tmp/AUX.pdf").is_err());
  }

  #[test]
  fn test_validate_upload_path_reserved_name_lpt1() {
    assert!(validate_upload_file_path("/tmp/LPT1.docx").is_err());
  }

  #[test]
  fn test_validate_upload_path_valid() {
    assert!(validate_upload_file_path("/home/user/document.pdf").is_ok());
    assert!(validate_upload_file_path("report.xlsx").is_ok());
  }

  #[test]
  fn test_validate_chat_query_empty() {
    assert!(validate_chat_query("").is_err());
    assert!(validate_chat_query("   ").is_err());
  }

  #[test]
  fn test_validate_chat_query_too_long() {
    let long_query = "a".repeat(1001);
    assert!(validate_chat_query(&long_query).is_err());
  }

  #[test]
  fn test_validate_chat_query_at_limit() {
    let exact_query = "a".repeat(1000);
    assert!(validate_chat_query(&exact_query).is_ok());
  }

  #[test]
  fn test_validate_chat_query_valid() {
    assert!(validate_chat_query("What is SMOT?").is_ok());
  }

  #[test]
  fn test_validate_document_id_invalid_uuid() {
    assert!(validate_document_id("not-a-uuid").is_err());
    assert!(validate_document_id("").is_err());
    assert!(validate_document_id("12345").is_err());
  }

  #[test]
  fn test_validate_document_id_valid_uuid() {
    let id = uuid::Uuid::new_v4().to_string();
    assert!(validate_document_id(&id).is_ok());
  }

  #[test]
  fn test_validate_document_id_malformed_uuid() {
    assert!(validate_document_id("550e8400-e29b-41d4-a716-44665544000").is_err());
  }

  // --- StartIndexingInput document_ids ---

  #[test]
  fn test_start_indexing_empty_ids() {
    let input = StartIndexingInput { document_ids: vec![] };
    assert!(input.document_ids.is_empty());
  }

  #[test]
  fn test_start_indexing_non_empty_ids() {
    let input = StartIndexingInput { document_ids: vec!["id1".to_string(), "id2".to_string()] };
    assert!(!input.document_ids.is_empty());
    assert_eq!(input.document_ids.len(), 2);
  }

  // --- Struct creation tests ---

  #[test]
  fn test_viewer_document_creation() {
    let doc = ViewerDocument {
      id: "doc-1".to_string(),
      name: "test.pdf".to_string(),
      file_type: "PDF".to_string(),
      category: "finance".to_string(),
      indexed: true,
      size_kb: 1024,
      pages: 5,
    };
    assert_eq!(doc.id, "doc-1");
    assert_eq!(doc.name, "test.pdf");
    assert_eq!(doc.file_type, "PDF");
    assert!(doc.indexed);
    assert_eq!(doc.size_kb, 1024);
    assert_eq!(doc.pages, 5);
  }

  #[test]
  fn test_system_status_creation() {
    let status = SystemStatus {
      offline_secure: true,
      ram_used_gb: 8.5,
      ram_total_gb: 16.0,
      cpu_percent: 45,
      gpu_percent: 0,
      documents_total: 10,
      documents_indexed: 7,
      storage_total_gb: 512,
      active_model: "llama3.1:8b".to_string(),
    };
    assert!(status.offline_secure);
    assert_eq!(status.ram_used_gb, 8.5);
    assert_eq!(status.documents_total, 10);
    assert_eq!(status.documents_indexed, 7);
  }
}
