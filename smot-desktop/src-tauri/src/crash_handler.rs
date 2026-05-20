use std::fs;
use std::io::Write;
use std::path::PathBuf;
use std::panic;

/// Set a custom panic hook that writes crash report to disk.
/// Call this early in main, before the Tauri setup.
pub fn init_panic_hook() {
    let default_hook = panic::take_hook();
    panic::set_hook(Box::new(move |panic_info| {
        default_hook(panic_info);
        if let Err(e) = write_crash_report(panic_info) {
            eprintln!("[SMOT] Failed to write crash report: {}", e);
        }
    }));
}

#[allow(clippy::incompatible_msrv)]
fn write_crash_report(panic_info: &std::panic::PanicHookInfo) -> Result<(), Box<dyn std::error::Error>> {
    let msg = match (
        panic_info.payload().downcast_ref::<&str>(),
        panic_info.payload().downcast_ref::<String>(),
    ) {
        (Some(s), _) => s.to_string(),
        (_, Some(s)) => s.to_string(),
        _ => "Unknown panic".to_string(),
    };

    let location = panic_info
        .location()
        .map(|loc| format!("{}:{}:{}", loc.file(), loc.line(), loc.column()))
        .unwrap_or_else(|| "unknown location".to_string());

    let backtrace = std::backtrace::Backtrace::force_capture();
    let bt_string = format!("{}", backtrace);

    let report = serde_json::json!({
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "message": msg,
        "location": location,
        "backtrace": bt_string,
    });

    let crash_dir = crash_report_dir()?;
    fs::create_dir_all(&crash_dir)?;
    let crash_path = crash_dir.join("crash-report.json");

    let mut file = fs::File::create(&crash_path)?;
    file.write_all(serde_json::to_string_pretty(&report)?.as_bytes())?;
    tracing::error!("Crash report written to: {}", crash_path.display());
    Ok(())
}

fn crash_report_dir() -> Result<PathBuf, Box<dyn std::error::Error>> {
    if let Ok(home) = std::env::var("HOME") {
        #[cfg(target_os = "linux")]
        return Ok(PathBuf::from(home).join(".local/share/com.smot.desktop/logs"));

        #[cfg(target_os = "macos")]
        return Ok(PathBuf::from(home).join("Library/Application Support/com.smot.desktop/logs"));

        #[cfg(target_os = "windows")]
        if let Ok(appdata) = std::env::var("APPDATA") {
            return Ok(PathBuf::from(appdata).join("SMOT/logs"));
        }
    }

    let exe = std::env::current_exe()?;
    let exe_dir = exe.parent().unwrap_or_else(|| std::path::Path::new("."));
    Ok(exe_dir.join("logs"))
}

/// Check for crash report from previous run and return its content.
pub fn check_previous_crash() -> Option<String> {
    let dir = crash_report_dir().ok()?;
    let path = dir.join("crash-report.json");

    if path.exists() {
        let content = fs::read_to_string(&path).ok()?;
        let _ = fs::remove_file(&path);
        Some(content)
    } else {
        None
    }
}
