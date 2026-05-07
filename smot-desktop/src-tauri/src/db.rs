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
