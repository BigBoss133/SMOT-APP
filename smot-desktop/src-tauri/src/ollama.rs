use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::time::Instant;
use tauri::{AppHandle, Emitter, State};

static RATE_LIMITS: Mutex<Vec<Instant>> = Mutex::new(Vec::new());
const MAX_REQUESTS_PER_SEC: usize = 5;

static OLLAMA_CACHE: Lazy<Mutex<Option<(OllamaStatus, Instant)>>> = Lazy::new(|| Mutex::new(None));

pub fn check_rate_limit() -> Result<(), String> {
    let now = Instant::now();
    let mut timestamps = RATE_LIMITS.lock().map_err(|e| e.to_string())?;
    timestamps.retain(|t| now.duration_since(*t).as_secs_f32() < 1.0);
    if timestamps.len() >= MAX_REQUESTS_PER_SEC {
        let oldest = timestamps
            .first()
            .map(|t| 1.0 - now.duration_since(*t).as_secs_f32())
            .unwrap_or(1.0);
        drop(timestamps);
        return Err(format!(
            "Rate limit exceeded, retry after {:.1}s",
            oldest.max(0.1)
        ));
    }
    timestamps.push(now);
    Ok(())
}
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct OllamaStatus {
    pub installed: bool,
    pub version: Option<String>,
    pub running: bool,
    pub models: Vec<String>,
    pub error: Option<String>,
}

#[derive(Serialize, Clone)]
pub struct DownloadProgress {
    pub model: String,
    pub status: String,
    pub percent: f32,
    pub downloaded_mb: f32,
    pub total_mb: f32,
    pub eta_seconds: i64,
    pub error: Option<String>,
}

pub async fn check_ollama_status(client: &reqwest::Client) -> OllamaStatus {
    // Cache check
    if let Ok(cache) = OLLAMA_CACHE.lock() {
        if let Some((ref status, ref time)) = *cache {
            if time.elapsed().as_secs() < 5 {
                return status.clone();
            }
        }
    }

    let result = match client
        .get("http://localhost:11434/api/version")
        .timeout(std::time::Duration::from_secs(10))
        .send()
        .await
    {
        Ok(resp) => {
            let version = resp
                .json::<serde_json::Value>()
                .await
                .ok()
                .and_then(|v| v["version"].as_str().map(String::from));
            let models = match client.get("http://localhost:11434/api/tags").send().await {
                Ok(r) => r
                    .json::<serde_json::Value>()
                    .await
                    .ok()
                    .and_then(|v| v["models"].as_array().cloned())
                    .map(|arr| {
                        arr.iter()
                            .filter_map(|m| m["name"].as_str().map(String::from))
                            .collect()
                    })
                    .unwrap_or_default(),
                Err(_) => vec![],
            };
            OllamaStatus {
                installed: true,
                version,
                running: true,
                models,
                error: None,
            }
        }
        Err(_) => OllamaStatus {
            installed: false,
            version: None,
            running: false,
            models: vec![],
            error: Some("Ollama non raggiungibile".into()),
        },
    };

    // Update cache
    if let Ok(mut cache) = OLLAMA_CACHE.lock() {
        *cache = Some((result.clone(), Instant::now()));
    }

    result
}

#[tauri::command]
pub async fn get_ollama_status(state: State<'_, crate::AppState>) -> Result<OllamaStatus, String> {
    Ok(check_ollama_status(&state.client).await)
}

#[tauri::command]
pub async fn pull_ollama_model(
    model: String,
    app: AppHandle,
    state: State<'_, crate::AppState>,
) -> Result<(), String> {
    if model.trim().is_empty() {
        return Err("Model name cannot be empty".to_string());
    }
    if !model
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == ':' || c == '.' || c == '_' || c == '-')
    {
        return Err(format!("Invalid model name: {}", model));
    }

    let client = state.client.clone();
    let resp = client
        .post("http://localhost:11434/api/pull")
        .json(&serde_json::json!({"name": &model, "stream": true}))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let bytes = resp.bytes().await.map_err(|e| e.to_string())?;
    let text = String::from_utf8_lossy(&bytes);
    let start_time = std::time::Instant::now();

    for line in text.lines() {
        if let Ok(status) = serde_json::from_str::<serde_json::Value>(line) {
            let total = status.get("total").and_then(|v| v.as_f64()).unwrap_or(1.0) as f32;
            let completed = status
                .get("completed")
                .and_then(|v| v.as_f64())
                .unwrap_or(0.0) as f32;
            let percent = if total > 0.0 {
                (completed / total) * 100.0
            } else {
                0.0
            };
            let status_str = status["status"]
                .as_str()
                .unwrap_or("downloading")
                .to_string();

            let elapsed_secs = start_time.elapsed().as_secs_f64().max(0.001);
            let completed_mb = completed / 1_048_576.0;
            let total_mb = total / 1_048_576.0;
            let speed_mbps = completed_mb / (elapsed_secs as f32);
            let eta_seconds = if speed_mbps > 0.01 {
                ((total_mb - completed_mb) / speed_mbps) as i64
            } else {
                0
            };

            let progress = DownloadProgress {
                model: model.clone(),
                status: status_str,
                percent,
                downloaded_mb: completed_mb,
                total_mb,
                eta_seconds,
                error: None,
            };
            let _ = app.emit("model-download-progress", &progress);
        }
    }

    let complete = DownloadProgress {
        model,
        status: "complete".into(),
        percent: 100.0,
        downloaded_mb: 0.0,
        total_mb: 0.0,
        eta_seconds: 0,
        error: None,
    };
    let _ = app.emit("model-download-progress", &complete);
    Ok(())
}

#[tauri::command]
pub async fn check_disk_space(min_gb: f32) -> Result<bool, String> {
    use sysinfo::Disks;
    let disks = Disks::new_with_refreshed_list();
    let free: f32 = disks
        .iter()
        .map(|d| d.available_space() as f32 / (1024.0 * 1024.0 * 1024.0))
        .sum();
    Ok(free >= min_gb)
}
