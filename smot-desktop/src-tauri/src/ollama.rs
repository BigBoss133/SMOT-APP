use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};

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

pub async fn check_ollama_status() -> OllamaStatus {
    let client = reqwest::Client::new();
    match client.get("http://localhost:11434/api/version").timeout(std::time::Duration::from_secs(2)).send().await {
        Ok(resp) => {
            let version = resp.json::<serde_json::Value>().await.ok().and_then(|v| v["version"].as_str().map(String::from));
            let models = match client.get("http://localhost:11434/api/tags").send().await {
                Ok(r) => r.json::<serde_json::Value>().await.ok()
                    .and_then(|v| v["models"].as_array().cloned())
                    .map(|arr| arr.iter().filter_map(|m| m["name"].as_str().map(String::from)).collect())
                    .unwrap_or_default(),
                Err(_) => vec![],
            };
            OllamaStatus { installed: true, version, running: true, models, error: None }
        }
        Err(_) => OllamaStatus { installed: false, version: None, running: false, models: vec![], error: Some("Ollama non raggiungibile".into()) }
    }
}

#[tauri::command]
pub async fn get_ollama_status() -> Result<OllamaStatus, String> {
    Ok(check_ollama_status().await)
}

#[tauri::command]
pub async fn pull_ollama_model(model: String, app: AppHandle) -> Result<(), String> {
    let client = reqwest::Client::new();
    let resp = client.post("http://localhost:11434/api/pull")
        .json(&serde_json::json!({"name": &model, "stream": true}))
        .send().await.map_err(|e| e.to_string())?;
    
    let bytes = resp.bytes().await.map_err(|e| e.to_string())?;
    let text = String::from_utf8_lossy(&bytes);
    let start_time = std::time::Instant::now();
    
    for line in text.lines() {
        if let Ok(status) = serde_json::from_str::<serde_json::Value>(line) {
            let total = status.get("total").and_then(|v| v.as_f64()).unwrap_or(1.0) as f32;
            let completed = status.get("completed").and_then(|v| v.as_f64()).unwrap_or(0.0) as f32;
            let percent = if total > 0.0 { (completed / total) * 100.0 } else { 0.0 };
            let status_str = status["status"].as_str().unwrap_or("downloading").to_string();
            
            let elapsed_secs = start_time.elapsed().as_secs_f64().max(0.001);
            let completed_mb = completed / 1_048_576.0;
            let total_mb = total / 1_048_576.0;
            let speed_mbps = completed_mb / elapsed_secs;
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
        model, status: "complete".into(), percent: 100.0,
        downloaded_mb: 0.0, total_mb: 0.0, eta_seconds: 0, error: None,
    };
    let _ = app.emit("model-download-progress", &complete);
    Ok(())
}

#[tauri::command]
pub async fn check_disk_space(min_gb: f32) -> Result<bool, String> {
    use sysinfo::Disks;
    let disks = Disks::new_with_refreshed_list();
    let free: f32 = disks.iter().map(|d| d.available_space() as f32 / (1024.0 * 1024.0 * 1024.0)).sum();
    Ok(free >= min_gb)
}