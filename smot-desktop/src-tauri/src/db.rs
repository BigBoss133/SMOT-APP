use rusqlite::Connection;
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

const INITIAL_SCHEMA: &str = include_str!("../migrations/001_initial.sql");

pub fn resolve_db_path(app_handle: &AppHandle) -> Result<PathBuf, Box<dyn std::error::Error>> {
  let app_data_dir = app_handle.path().app_data_dir()?;
  fs::create_dir_all(&app_data_dir)?;
  Ok(app_data_dir.join("smot.db"))
}

pub fn init_database(app_handle: &AppHandle) -> Result<PathBuf, Box<dyn std::error::Error>> {
  let db_path = resolve_db_path(app_handle)?;
  let connection = Connection::open(&db_path)?;
  connection.execute_batch(INITIAL_SCHEMA)?;
  Ok(db_path)
}

pub struct DocumentRow {
  pub id: String,
  pub name: String,
  pub file_type: String,
  pub size_bytes: i64,
  pub indexed: bool,
}

pub struct FtsResult {
  pub document_id: String,
  pub document_name: String,
  pub chunk_index: i64,
  pub snippet: String,
}

#[allow(clippy::too_many_arguments)]
pub fn insert_document(
  conn: &Connection,
  id: &str,
  name: &str,
  path: &str,
  category: &str,
  file_type: &str,
  size_bytes: i64,
  created_at: &str,
) -> Result<(), rusqlite::Error> {
  conn.execute(
    "INSERT INTO documents (id, name, path, category, file_type, size_bytes, indexed, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, 0, ?7)",
    rusqlite::params![id, name, path, category, file_type, size_bytes, created_at],
  )?;
  Ok(())
}

pub fn get_all_documents(conn: &Connection) -> Result<Vec<DocumentRow>, rusqlite::Error> {
  let mut stmt = conn.prepare(
    "SELECT id, name, file_type, size_bytes, indexed FROM documents ORDER BY created_at DESC",
  )?;
  let docs = stmt
    .query_map([], |row| {
      Ok(DocumentRow {
        id: row.get(0)?,
        name: row.get(1)?,
        file_type: row.get(2)?,
        size_bytes: row.get(3)?,
        indexed: row.get(4)?,
      })
    })?
    .filter_map(|r| r.ok())
    .collect();
  Ok(docs)
}

pub fn update_indexing_status(conn: &Connection, doc_id: &str) -> Result<(), rusqlite::Error> {
  conn.execute(
    "UPDATE documents SET indexed = 1 WHERE id = ?1",
    rusqlite::params![doc_id],
  )?;
  Ok(())
}

pub fn search_fts5(conn: &Connection, query: &str) -> Result<Vec<FtsResult>, rusqlite::Error> {
  let mut stmt = conn.prepare(
    "SELECT c.document_id, d.name, c.chunk_index, snippet(fts_documents, 0, '<mark>', '</mark>', '...', 40) as snippet \
     FROM fts_documents fts \
     JOIN document_chunks c ON fts.rowid = c.rowid \
     JOIN documents d ON c.document_id = d.id \
     WHERE fts_documents MATCH ?1 \
     ORDER BY rank \
     LIMIT 5",
  )?;
  let results = stmt
    .query_map(rusqlite::params![query], |row| {
      Ok(FtsResult {
        document_id: row.get(0)?,
        document_name: row.get(1)?,
        chunk_index: row.get(2)?,
        snippet: row.get(3)?,
      })
    })?
    .filter_map(|r| r.ok())
    .collect();
  Ok(results)
}
