use rusqlite::Connection;
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

const INITIAL_SCHEMA: &str = include_str!("../migrations/001_initial.sql");

/// Create an r2d2 connection pool for the given database path.
pub fn create_pool(path: &std::path::Path) -> Result<Pool<SqliteConnectionManager>, Box<dyn std::error::Error>> {
    let manager = SqliteConnectionManager::file(path);
    let pool = Pool::builder().max_size(4).build(manager)?;
    Ok(pool)
}

/// Get a connection from the pool.
pub fn get_conn(pool: &Pool<SqliteConnectionManager>) -> Result<r2d2::PooledConnection<SqliteConnectionManager>, String> {
    pool.get().map_err(|e| format!("Failed to get DB connection from pool: {}", e))
}

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

/// Initialize database with a connection pool.
pub fn init_database_pool(app_handle: &AppHandle) -> Result<(PathBuf, Pool<SqliteConnectionManager>), Box<dyn std::error::Error>> {
    let db_path = resolve_db_path(app_handle)?;
    let conn = Connection::open(&db_path)?;
    conn.execute_batch(INITIAL_SCHEMA)?;
    drop(conn);
    let pool = create_pool(&db_path)?;
    Ok((db_path, pool))
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

/// Backup the database to a timestamped copy.
#[tauri::command]
pub fn backup_database(app_handle: tauri::AppHandle) -> Result<String, String> {
    let db_path = resolve_db_path(&app_handle).map_err(|e| e.to_string())?;
    if !db_path.exists() {
        return Err("Database file not found".to_string());
    }
    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
    let backup_path = db_path.with_file_name(format!("smot_backup_{}.db", timestamp));
    fs::copy(&db_path, &backup_path).map_err(|e| format!("Backup failed: {}", e))?;
    tracing::info!("Database backed up to: {}", backup_path.display());
    Ok(backup_path.to_string_lossy().to_string())
}

/// Restore the database from the most recent backup.
#[tauri::command]
pub fn restore_database(app_handle: tauri::AppHandle) -> Result<String, String> {
    let db_path = resolve_db_path(&app_handle).map_err(|e| e.to_string())?;
    let db_dir = db_path.parent().ok_or("Cannot determine DB directory")?;

    let mut backups: Vec<_> = fs::read_dir(db_dir)
        .map_err(|e| format!("Cannot read directory: {}", e))?
        .filter_map(|entry| entry.ok())
        .filter(|entry| {
            entry.file_name().to_string_lossy().starts_with("smot_backup_") &&
            entry.file_name().to_string_lossy().ends_with(".db")
        })
        .collect();

    backups.sort_by_key(|e| e.file_name());
    let latest = backups.pop().ok_or("No backup files found")?;

    fs::copy(latest.path(), &db_path).map_err(|e| format!("Restore failed: {}", e))?;
    tracing::info!("Database restored from: {}", latest.path().display());
    Ok(format!("Restored from {}", latest.path().display()))
}
