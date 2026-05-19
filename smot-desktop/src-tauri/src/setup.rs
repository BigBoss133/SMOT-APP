use crate::auto_config::{self, Tier};
use crate::system_probe;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{Emitter, Manager};

#[derive(Serialize, Deserialize, Clone)]
pub struct Config {
    pub tier: Tier,
    pub profile: system_probe::SystemProfile,
    pub onboarding_completed: bool,
    pub first_launch: String,
    pub language: String,
    pub license: Option<String>,
}

#[allow(dead_code)]
pub fn config_path(app: &tauri::App) -> Result<PathBuf, String> {
    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    Ok(app_data_dir.join("config.json"))
}

pub fn load_config_from_path(path: &PathBuf) -> Option<Config> {
    fs::read_to_string(path)
        .ok()
        .and_then(|content| serde_json::from_str(&content).ok())
}

pub fn save_config(path: &PathBuf, config: &Config) {
    match serde_json::to_string_pretty(config) {
        Ok(json) => {
            if let Err(e) = fs::write(path, json) {
                log::error!("Failed to write config: {}", e);
            } else {
                log::info!("Config salvato: {}", path.display());
            }
        }
        Err(e) => log::error!("Failed to serialize config: {}", e),
    }
}

pub fn on_app_startup(app: &mut tauri::App) {
    let app_data_dir = match app.path().app_data_dir() {
        Ok(dir) => dir,
        Err(e) => {
            log::error!("Failed to get app data dir: {}", e);
            return;
        }
    };

    for subdir in &["documents", "thumbnails", "logs"] {
        if let Err(e) = fs::create_dir_all(app_data_dir.join(subdir)) {
            log::warn!("Failed to create {} directory: {}", subdir, e);
        }
    }

    match crate::db::init_database(app.handle()) {
        Ok(db_path) => log::info!("SQLite inizializzato: {}", db_path.display()),
        Err(e) => {
            log::error!("Failed to init database: {}", e);
            return;
        }
    }

    let config_path = app_data_dir.join("config.json");
    let is_first_run = !config_path.exists();

    if !is_first_run {
        // Config esiste gia' — controlla se onboarding gia' completato
        if let Some(config) = load_config_from_path(&config_path) {
            if config.onboarding_completed {
                log::info!("Onboarding gia' completato, salto wizard");
                return;
            }
        }
    }

    // Primo avvio o onboarding non completato: crea config, emetti evento
    let profile = system_probe::probe_system();
    let tier = auto_config::determine_tier(&profile);

    let config = Config {
        tier: tier.clone(),
        profile: profile.clone(),
        onboarding_completed: false,
        first_launch: chrono::Local::now().to_rfc3339(),
        language: "it".to_string(),
        license: None,
    };

    save_config(&config_path, &config);

    let handle = app.handle().clone();
    let profile_json = match serde_json::to_value(&profile) {
        Ok(json) => json,
        Err(e) => {
            log::error!("Failed to serialize profile: {}", e);
            return;
        }
    };

    tauri::async_runtime::spawn(async move {
        tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
        let _ = handle.emit("first-launch", &profile_json);
    });
}

#[allow(dead_code)]
pub fn load_config(app: &tauri::AppHandle) -> Option<Config> {
    let app_data_dir = app.path().app_data_dir().ok()?;
    let config_path = app_data_dir.join("config.json");
    let content = fs::read_to_string(&config_path).ok()?;
    serde_json::from_str(&content).ok()
}

#[tauri::command]
pub fn complete_onboarding(app_handle: tauri::AppHandle) -> Result<(), String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    let config_path = app_data_dir.join("config.json");
    let content =
        fs::read_to_string(&config_path).map_err(|e| format!("Cannot read config: {}", e))?;
    let mut config: Config =
        serde_json::from_str(&content).map_err(|e| format!("Cannot parse config: {}", e))?;
    config.onboarding_completed = true;
    save_config(&config_path, &config);
    log::info!("Onboarding completato!");
    Ok(())
}
