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

    SystemProfile {
        cpu_cores,
        ram_total_gb,
        gpu_name: None,
        gpu_vram_gb: None,
        gpu_cuda: false,
        disk_free_gb,
        os_name,
    }
}