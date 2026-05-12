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
    use std::error::Error;

    #[test]
    fn test_display_database() {
        let err = AppError::Database("connection failed".to_string());
        assert!(err.to_string().contains("Errore database"));
        assert!(err.to_string().contains("connection failed"));
    }

    #[test]
    fn test_display_network() {
        let err = AppError::Network("timeout".to_string());
        assert!(err.to_string().contains("Errore di rete"));
        assert!(err.to_string().contains("timeout"));
    }

    #[test]
    fn test_display_io() {
        let io_err = std::io::Error::new(std::io::ErrorKind::NotFound, "file missing");
        let err = AppError::Io(io_err);
        assert!(err.to_string().contains("Errore I/O"));
    }

    #[test]
    fn test_display_parse() {
        let err = AppError::Parse("bad json".to_string());
        assert!(err.to_string().contains("Errore di parsing"));
    }

    #[test]
    fn test_display_config() {
        let err = AppError::Config("missing key".to_string());
        assert!(err.to_string().contains("Errore di configurazione"));
    }

    #[test]
    fn test_display_not_found() {
        let err = AppError::NotFound("document-123".to_string());
        assert!(err.to_string().contains("Non trovato"));
    }

    #[test]
    fn test_display_unauthorized() {
        let err = AppError::Unauthorized("no token".to_string());
        assert!(err.to_string().contains("Non autorizzato"));
    }

    #[test]
    fn test_display_external() {
        let err = AppError::External("ollama down".to_string());
        assert!(err.to_string().contains("Errore esterno"));
    }

    #[test]
    fn test_display_validation() {
        let err = AppError::Validation("empty field".to_string());
        assert!(err.to_string().contains("Errore di validazione"));
    }

    #[test]
    fn test_error_source_io() {
        let io_err = std::io::Error::new(std::io::ErrorKind::PermissionDenied, "denied");
        let app_err = AppError::Io(io_err);
        assert!(app_err.source().is_some());
    }

    #[test]
    fn test_error_source_non_io() {
        let app_err = AppError::Database("err".to_string());
        assert!(app_err.source().is_none());
    }

    #[test]
    fn test_from_sqlite() {
        let sqlite_err = rusqlite::Error::InvalidQuery;
        let app_err: AppError = sqlite_err.into();
        assert!(matches!(app_err, AppError::Database(_)));
    }

    #[test]
    fn test_from_io() {
        let io_err = std::io::Error::new(std::io::ErrorKind::BrokenPipe, "pipe broke");
        let app_err: AppError = io_err.into();
        assert!(matches!(app_err, AppError::Io(_)));
    }

    #[test]
    fn test_into_string() {
        let err = AppError::Validation("bad input".to_string());
        let s: String = err.into();
        assert!(s.contains("Errore di validazione"));
        assert!(s.contains("bad input"));
    }

    #[test]
    fn test_context_on_ok_result() {
        let result: Result<i32, rusqlite::Error> = Ok(42);
        let with_ctx = result.context("loading config");
        assert!(with_ctx.is_ok());
        assert_eq!(with_ctx.unwrap(), 42);
    }

    #[test]
    fn test_context_on_err_result() {
        let result: Result<i32, rusqlite::Error> = Err(rusqlite::Error::InvalidQuery);
        let with_ctx = result.context("loading config");
        assert!(with_ctx.is_err());
        let err = with_ctx.unwrap_err();
        assert!(matches!(err, AppError::Database(_)));
        assert!(err.to_string().contains("loading config"));
    }

    #[test]
    fn test_context_on_some_option() {
        let opt: Option<i32> = Some(10);
        let result = opt.context("missing value");
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 10);
    }

    #[test]
    fn test_context_on_none_option() {
        let opt: Option<i32> = None;
        let result = opt.context("missing value");
        assert!(result.is_err());
        assert!(matches!(result.unwrap_err(), AppError::NotFound(_)));
    }

    #[test]
    fn test_app_result_type_alias() {
        let ok: AppResult<i32> = Ok(1);
        assert_eq!(ok.unwrap(), 1);
        let err: AppResult<i32> = Err(AppError::Config("bad".to_string()));
        assert!(err.is_err());
    }

    #[test]
    fn test_from_serde_json_error() {
        let json_err = serde_json::from_str::<i32>("not a number").unwrap_err();
        let app_err: AppError = json_err.into();
        assert!(matches!(app_err, AppError::Parse(_)));
        assert!(app_err.to_string().contains("Errore di parsing"));
    }

    #[test]
    fn test_context_option_none_contains_msg() {
        let opt: Option<&str> = None;
        let result: AppResult<&str> = opt.context("resource X");
        let err = result.unwrap_err();
        assert!(err.to_string().contains("resource X"));
    }

    #[test]
    fn test_from_reqwest_error() {
        // Verify From<reqwest::Error> compiles and converts to Network variant
        let _: fn(reqwest::Error) -> AppError = |e| e.into();
        // Also test with a real error if we can produce one
        let client = reqwest::Client::builder().build().unwrap();
        let result = client.get("http://[::1]:").build();
        if let Err(req_err) = result {
            let app_err: AppError = req_err.into();
            assert!(matches!(app_err, AppError::Network(_)));
        }
    }
}
