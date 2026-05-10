//! Unified error handling for SMOT application
//! 
//! Provides a single AppError enum that covers all error types in the application,
//! with automatic conversion from external error types.

use std::fmt;

/// Unified application error type
#[derive(Debug)]
pub enum AppError {
    /// Database/SQLite errors
    Database(String),
    /// Network/HTTP errors
    Network(String),
    /// File I/O errors
    Io(std::io::Error),
    /// Data parsing errors
    Parse(String),
    /// Configuration errors
    Config(String),
    /// Resource not found
    NotFound(String),
    /// Authentication/authorization errors
    Unauthorized(String),
    /// External process errors (Ollama, etc.)
    External(String),
    /// Validation errors
    Validation(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::Database(msg) => write!(f, "Errore database: {}", msg),
            AppError::Network(msg) => write!(f, "Errore di rete: {}", msg),
            AppError::Io(err) => write!(f, "Errore I/O: {}", err),
            AppError::Parse(msg) => write!(f, "Errore di parsing: {}", msg),
            AppError::Config(msg) => write!(f, "Errore di configurazione: {}", msg),
            AppError::NotFound(msg) => write!(f, "Non trovato: {}", msg),
            AppError::Unauthorized(msg) => write!(f, "Non autorizzato: {}", msg),
            AppError::External(msg) => write!(f, "Errore esterno: {}", msg),
            AppError::Validation(msg) => write!(f, "Errore di validazione: {}", msg),
        }
    }
}

impl std::error::Error for AppError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            AppError::Io(err) => Some(err),
            _ => None,
        }
    }
}

// Conversions from external error types

impl From<rusqlite::Error> for AppError {
    fn from(err: rusqlite::Error) -> Self {
        AppError::Database(err.to_string())
    }
}

impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        AppError::Io(err)
    }
}

impl From<reqwest::Error> for AppError {
    fn from(err: reqwest::Error) -> Self {
        AppError::Network(err.to_string())
    }
}

impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        AppError::Parse(err.to_string())
    }
}

impl From<Box<dyn std::error::Error>> for AppError {
    fn from(err: Box<dyn std::error::Error>) -> Self {
        AppError::External(err.to_string())
    }
}

impl From<tauri::Error> for AppError {
    fn from(err: tauri::Error) -> Self {
        AppError::External(format!("Tauri error: {}", err))
    }
}

// Conversion to String for Tauri command compatibility
impl From<AppError> for String {
    fn from(err: AppError) -> String {
        err.to_string()
    }
}

/// Result type alias for app operations
pub type AppResult<T> = Result<T, AppError>;

/// Helper trait for adding context to errors
pub trait Context<T> {
    fn context(self, msg: &str) -> AppResult<T>;
}

impl<T, E: Into<AppError>> Context<T> for Result<T, E> {
    fn context(self, msg: &str) -> AppResult<T> {
        self.map_err(|e| {
            let app_err: AppError = e.into();
            match app_err {
                AppError::Database(_) => AppError::Database(format!("{} - {}", msg, app_err)),
                AppError::Network(_) => AppError::Network(format!("{} - {}", msg, app_err)),
                AppError::Io(io_err) => AppError::Io(std::io::Error::new(
                    io_err.kind(),
                    format!("{} - {}", msg, io_err),
                )),
                AppError::Parse(_) => AppError::Parse(format!("{} - {}", msg, app_err)),
                AppError::Config(_) => AppError::Config(format!("{} - {}", msg, app_err)),
                AppError::NotFound(_) => AppError::NotFound(format!("{} - {}", msg, app_err)),
                AppError::Unauthorized(_) => AppError::Unauthorized(format!("{} - {}", msg, app_err)),
                AppError::External(_) => AppError::External(format!("{} - {}", msg, app_err)),
                AppError::Validation(_) => AppError::Validation(format!("{} - {}", msg, app_err)),
            }
        })
    }
}

impl<T> Context<T> for Option<T> {
    fn context(self, msg: &str) -> AppResult<T> {
        self.ok_or_else(|| AppError::NotFound(msg.to_string()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_display_messages() {
        let err = AppError::Database("connection failed".to_string());
        assert!(err.to_string().contains("Errore database"));
        
        let err = AppError::NotFound("document-123".to_string());
        assert!(err.to_string().contains("Non trovato"));
    }

    #[test]
    fn test_from_sqlite() {
        let sqlite_err = rusqlite::Error::InvalidQuery;
        let app_err: AppError = sqlite_err.into();
        matches!(app_err, AppError::Database(_));
    }
}
