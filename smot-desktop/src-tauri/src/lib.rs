mod auto_config;
mod db;
mod ollama;
mod parsers;
mod setup;
mod system_probe;

use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use sysinfo::{Disks, System};

struct AppState {
  active_mode: Mutex<String>,
  db: Mutex<Connection>,
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

fn sample_documents() -> Vec<ViewerDocument> {
  vec![
    ViewerDocument {
      id: "doc-1".to_string(),
      name: "Contratto_Fornitura_2026.pdf".to_string(),
      file_type: "PDF".to_string(),
      category: "Lavoro".to_string(),
      indexed: true,
      size_kb: 1890,
      pages: 8,
    },
    ViewerDocument {
      id: "doc-2".to_string(),
      name: "Piano_Studio_AI.docx".to_string(),
      file_type: "DOCX".to_string(),
      category: "Studio".to_string(),
      indexed: true,
      size_kb: 640,
      pages: 4,
    },
    ViewerDocument {
      id: "doc-3".to_string(),
      name: "Spese_Casa_Q1.xlsx".to_string(),
      file_type: "XLSX".to_string(),
      category: "Personale".to_string(),
      indexed: false,
      size_kb: 420,
      pages: 3,
    },
  ]
}

#[tauri::command]
async fn get_system_status(state: tauri::State<'_, AppState>) -> Result<SystemStatus, String> {
  let mut sys = System::new_all();
  sys.refresh_all();

  let cpu = sys.global_cpu_info().cpu_usage() as u8;
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
fn get_documents() -> Vec<ViewerDocument> {
  sample_documents()
}

#[tauri::command]
fn upload_documents(payload: UploadDocumentInput) -> UploadResponse {
  let uploaded_documents = payload
    .files
    .iter()
    .enumerate()
    .map(|(index, name)| UploadedDocument {
      id: format!("{}-{}", payload.category.to_lowercase(), index + 1),
      name: name.clone(),
    })
    .collect();
  UploadResponse { uploaded_documents }
}

#[tauri::command]
fn start_indexing(payload: StartIndexingInput) -> StartIndexingResponse {
  StartIndexingResponse {
    job_id: format!("job-{}", payload.document_ids.len()),
  }
}

#[tauri::command]
fn get_indexing_status(payload: JobInput) -> IndexingStatus {
  let progress = if payload.job_id.ends_with('3') { 100 } else { 62 };
  IndexingStatus {
    status: if progress >= 100 {
      "completed".to_string()
    } else {
      "running".to_string()
    },
    overall_progress: progress,
    completed_documents: if progress >= 100 { 2 } else { 1 },
    total_documents: 2,
    eta_seconds: if progress >= 100 { 0 } else { 58 },
    processed_kb: if progress >= 100 { 2530 } else { 1540 },
    total_kb: 2530,
    files: vec![
      IndexingFileStatus {
        document_id: "doc-1".to_string(),
        document_name: "Contratto_Fornitura_2026.pdf".to_string(),
        file_progress: progress,
        chunk_done: if progress >= 100 { 12 } else { 8 },
        chunk_total: 12,
        embedding_done: if progress >= 100 { 12 } else { 7 },
        embedding_total: 12,
      },
      IndexingFileStatus {
        document_id: "doc-2".to_string(),
        document_name: "Piano_Studio_AI.docx".to_string(),
        file_progress: if progress >= 100 { 100 } else { 40 },
        chunk_done: if progress >= 100 { 10 } else { 4 },
        chunk_total: 10,
        embedding_done: if progress >= 100 { 10 } else { 3 },
        embedding_total: 10,
      },
    ],
  }
}

#[tauri::command]
fn pause_indexing(_payload: JobInput) -> serde_json::Value {
  serde_json::json!({"status": "paused"})
}

#[tauri::command]
fn resume_indexing(_payload: JobInput) -> serde_json::Value {
  serde_json::json!({"status": "running"})
}

#[tauri::command]
fn continue_in_background(_payload: JobInput) -> serde_json::Value {
  serde_json::json!({"status": "background"})
}

#[tauri::command]
fn chat_query(payload: ChatQueryInput) -> ChatResponse {
  ChatResponse {
    answer: format!(
      "Risposta locale simulata per: '{}'. Filtro attivo: {}.",
      payload.question, payload.filter_category
    ),
    sources: vec![ChatSource {
      document_id: "doc-1".to_string(),
      document_name: "Contratto_Fornitura_2026.pdf".to_string(),
      page: 2,
      snippet: "Estratto rilevante collegato alla tua domanda.".to_string(),
    }],
  }
}

#[tauri::command]
fn get_viewer_page(payload: ViewerPageInput) -> ViewerPageData {
  ViewerPageData {
    document_id: payload.document_id,
    document_name: "Contratto_Fornitura_2026.pdf".to_string(),
    page: payload.page,
    total_pages: 8,
    highlights: vec![
      "SMOT".to_string(),
      "indicizzazione".to_string(),
      "Ollama".to_string(),
    ],
    text: "SMOT mantiene i dati in locale e lavora offline. L'indicizzazione prepara chunk e metadati per ricerca rapida. Il supporto Ollama viene verificato all'avvio con fallback sicuro.".to_string(),
  }
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
      parse_document_text
    ])
    .setup(|app| {
      let db_path = db::init_database(&app.handle())?;
      let connection = Connection::open(&db_path)
        .expect("Failed to open database connection");

      let state = AppState {
        active_mode: Mutex::new("Balanced".to_string()),
        db: Mutex::new(connection),
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
