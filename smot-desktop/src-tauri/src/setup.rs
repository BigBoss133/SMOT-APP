use crate::auto_config::{self, Tier};
use crate::system_probe;
use serde::{Deserialize, Serialize};
use std::fs;
use tauri::Manager;

#[derive(Serialize, Deserialize, Clone)]
pub struct Config {
    pub tier: Tier,
    pub profile: system_probe::SystemProfile,
    pub onboarding_completed: bool,
    pub first_launch: String,
    pub language: String,
    pub license: Option<String>,
    pub ai_enabled: bool,
}

pub fn on_app_startup(app: &mut tauri::App) {
    let app_data_dir = match app.path().app_data_dir() {
        Ok(dir) => dir,
        Err(e) => { log::error!("Failed to get app data dir: {}", e); return; }
    };

    for subdir in &["documents", "thumbnails", "logs"] {
        if let Err(e) = fs::create_dir_all(app_data_dir.join(subdir)) {
            log::warn!("Failed to create {} directory: {}", subdir, e);
        }
    }

    match crate::db::init_database(&app.handle()) {
        Ok(db_path) => log::info!("SQLite inizializzato: {}", db_path.display()),
        Err(e) => { log::error!("Failed to init database: {}", e); return; }
    }

    let profile = system_probe::probe_system();
    let tier = auto_config::determine_tier(&profile);

    let config = Config {
        tier,
        profile: profile.clone(),
        onboarding_completed: false,
        first_launch: chrono::Local::now().to_rfc3339(),
        language: "it".to_string(),
        license: None,
        ai_enabled: tier.supports_ai(),
    };

    let config_path = app_data_dir.join("config.json");
    match serde_json::to_string_pretty(&config) {
        Ok(json) => {
            if let Err(e) = fs::write(&config_path, json) {
                log::error!("Failed to write config: {}", e);
            } else {
                log::info!("Config salvato: {}", config_path.display());
            }
        }
        Err(e) => log::error!("Failed to serialize config: {}", e),
    }

    let handle = app.handle().clone();
    let profile_json = match serde_json::to_value(&profile) {
        Ok(json) => json,
        Err(e) => { log::error!("Failed to serialize profile: {}", e); return; }
    };

    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_millis(500));
        let _ = handle.emit("first-launch", &profile_json);
    });
}

pub fn load_config(app: &tauri::AppHandle) -> Option<Config> {
    let app_data_dir = app.path().app_data_dir().ok()?;
    let config_path = app_data_dir.join("config.json");
    let content = fs::read_to_string(&config_path).ok()?;
    serde_json::from_str(&content).ok()
}