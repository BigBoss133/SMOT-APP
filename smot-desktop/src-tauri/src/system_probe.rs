use serde::{Deserialize, Serialize};
use sysinfo::{Disks, System};

#[derive(Serialize, Deserialize, Clone)]
pub struct SystemProfile {
    pub cpu_cores: usize,
    pub ram_total_gb: f32,
    pub gpu_name: Option<String>,
    pub gpu_vram_gb: Option<f32>,
    pub gpu_cuda: bool,
    pub disk_free_gb: f32,
    pub os_name: String,
}

pub fn probe_system() -> SystemProfile {
    let mut sys = System::new_all();
    sys.refresh_all();

    let cpu_cores = num_cpus::get();
    let ram_total_gb = sys.total_memory() as f32 / (1024.0 * 1024.0 * 1024.0);

    let os_name = format!(
        "{} {}",
        System::name().unwrap_or_else(|| "Unknown".to_string()),
        System::os_version().unwrap_or_else(|| "".to_string())
    ).trim().to_string();

    let disks = Disks::new_with_refreshed_list();
    let disk_free_gb = disks
        .iter()
        .map(|d| d.available_space() as f32 / (1024.0 * 1024.0 * 1024.0))
        .sum::<f32>();

    let (gpu_name, gpu_vram_gb, gpu_cuda) = detect_gpu();

    SystemProfile {
        cpu_cores,
        ram_total_gb,
        gpu_name,
        gpu_vram_gb,
        gpu_cuda,
        disk_free_gb,
        os_name,
    }
}

fn detect_gpu() -> (Option<String>, Option<f32>, bool) {
    #[cfg(target_os = "linux")]
    {
        if let Ok(output) = std::process::Command::new("lspci")
            .arg("-v")
            .output()
        {
            let stdout = String::from_utf8_lossy(&output.stdout);
            for line in stdout.lines() {
                if line.contains("VGA") || line.contains("3D") {
                    let gpu_name = line.split(": ").last().unwrap_or("Unknown GPU").to_string();
                    let cuda = gpu_name.to_lowercase().contains("nvidia");
                    let vram = if cuda { detect_nvidia_vram() } else { None };
                    return (Some(gpu_name), vram, cuda);
                }
            }
        }
        (None, None, false)
    }

    #[cfg(target_os = "windows")]
    {
        if let Ok(output) = std::process::Command::new("wmic")
            .args(&["path", "win32_VideoController", "get", "name,AdapterRAM"])
            .output()
        {
            let stdout = String::from_utf8_lossy(&output.stdout);
            for line in stdout.lines().skip(1) {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 2 {
                    let name = parts[..parts.len() - 1].join(" ");
                    let cuda = name.to_lowercase().contains("nvidia");
                    let vram = parts.last()
                        .and_then(|s| s.parse::<f32>().ok())
                        .map(|b| b / (1024.0 * 1024.0 * 1024.0));
                    return (Some(name), vram, cuda);
                }
            }
        }
        (None, None, false)
    }

    #[cfg(target_os = "macos")]
    {
        if let Ok(output) = std::process::Command::new("system_profiler")
            .args(&["SPDisplaysDataType"])
            .output()
        {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let mut gpu_name = None;
            let mut vram = None;
            for line in stdout.lines() {
                if line.contains("Chipset Model:") || line.contains("Chip Model:") {
                    gpu_name = Some(line.split(": ").last().unwrap_or("Unknown").to_string());
                }
                if line.contains("VRAM") {
                    if let Some(vram_str) = line.split(": ").last() {
                        if let Some(mb) = vram_str.split_whitespace().next()
                            .and_then(|s| s.parse::<f32>().ok())
                        {
                            vram = Some(mb / 1024.0);
                        }
                    }
                }
            }
            return (gpu_name, vram, false);
        }
        (None, None, false)
    }

    #[cfg(not(any(target_os = "linux", target_os = "windows", target_os = "macos")))]
    {
        (None, None, false)
    }
}

fn detect_nvidia_vram() -> Option<f32> {
    if let Ok(output) = std::process::Command::new("nvidia-smi")
        .args(&["--query-gpu=memory.total", "--format=csv,noheader,nounits"])
        .output()
    {
        let stdout = String::from_utf8_lossy(&output.stdout);
        stdout.lines().next()
            .and_then(|s| s.trim().parse::<f32>().ok())
            .map(|mb| mb / 1024.0)
    } else {
        None
    }
}