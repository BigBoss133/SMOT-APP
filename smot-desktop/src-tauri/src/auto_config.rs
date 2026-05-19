use crate::system_probe::SystemProfile;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum Tier {
    Premium,
    Standard,
    Essential,
    Minimal,
}

pub fn determine_tier(profile: &SystemProfile) -> Tier {
    let ram = profile.ram_total_gb;
    let gpu_vram = profile.gpu_vram_gb.unwrap_or(0.0);

    // Apple Silicon: memoria unificata, nessuna VRAM dedicata
    if profile.is_unified_memory {
        if ram >= 16.0 {
            Tier::Premium
        } else if ram >= 8.0 {
            Tier::Standard
        } else if ram >= 4.0 {
            Tier::Essential
        } else {
            Tier::Minimal
        }
    } else {
        // GPU dedicata: usa VRAM per determinare il tier
        if ram >= 16.0 && gpu_vram >= 4.0 {
            Tier::Premium
        } else if ram >= 8.0 {
            Tier::Standard
        } else if ram >= 4.0 {
            Tier::Essential
        } else {
            Tier::Minimal
        }
    }
}

impl Tier {
    #[allow(dead_code)]
    pub fn supports_ai(&self) -> bool {
        matches!(self, Tier::Premium | Tier::Standard)
    }

    #[allow(dead_code)]
    pub fn display_name(&self) -> &str {
        match self {
            Tier::Premium => "Premium",
            Tier::Standard => "Standard",
            Tier::Essential => "Essential",
            Tier::Minimal => "Minimale",
        }
    }

    #[allow(dead_code)]
    pub fn recommended_model(&self) -> Option<&str> {
        match self {
            Tier::Premium => Some("llama3.2:7b"),
            Tier::Standard => Some("llama3.2:3b"),
            _ => None,
        }
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    use crate::system_probe::SystemProfile;

    fn create_profile(
        ram: f32,
        gpu_vram: Option<f32>,
        is_unified: bool,
    ) -> SystemProfile {
        SystemProfile {
            cpu_cores: 8,
            ram_total_gb: ram,
            ram_available_gb: ram,
            gpu_name: None,
            gpu_vram_gb: gpu_vram,
            gpu_cuda: false,
            is_unified_memory: is_unified,
            disk_free_gb: 100.0,
            os_name: "Test OS".to_string(),
        }
    }

    #[test]
    fn test_determine_tier_unified_memory() {
        // Premium: RAM >= 16.0
        let profile = create_profile(16.0, None, true);
        assert_eq!(determine_tier(&profile), Tier::Premium);

        let profile = create_profile(32.0, None, true);
        assert_eq!(determine_tier(&profile), Tier::Premium);

        // Standard: RAM >= 8.0
        let profile = create_profile(8.0, None, true);
        assert_eq!(determine_tier(&profile), Tier::Standard);

        let profile = create_profile(12.0, None, true);
        assert_eq!(determine_tier(&profile), Tier::Standard);

        // Essential: RAM >= 4.0
        let profile = create_profile(4.0, None, true);
        assert_eq!(determine_tier(&profile), Tier::Essential);

        let profile = create_profile(6.0, None, true);
        assert_eq!(determine_tier(&profile), Tier::Essential);

        // Minimal: RAM < 4.0
        let profile = create_profile(2.0, None, true);
        assert_eq!(determine_tier(&profile), Tier::Minimal);

        let profile = create_profile(3.9, None, true);
        assert_eq!(determine_tier(&profile), Tier::Minimal);
    }

    #[test]
    fn test_determine_tier_dedicated_gpu() {
        // Premium: RAM >= 16.0 && VRAM >= 4.0
        let profile = create_profile(16.0, Some(4.0), false);
        assert_eq!(determine_tier(&profile), Tier::Premium);

        let profile = create_profile(32.0, Some(8.0), false);
        assert_eq!(determine_tier(&profile), Tier::Premium);

        // Standard: RAM >= 16.0 but VRAM < 4.0
        let profile = create_profile(16.0, Some(2.0), false);
        assert_eq!(determine_tier(&profile), Tier::Standard);

        let profile = create_profile(16.0, None, false);
        assert_eq!(determine_tier(&profile), Tier::Standard);

        // Standard: RAM >= 8.0
        let profile = create_profile(8.0, Some(8.0), false); // Even with high VRAM, needs 16GB RAM for Premium
        assert_eq!(determine_tier(&profile), Tier::Standard);

        let profile = create_profile(8.0, None, false);
        assert_eq!(determine_tier(&profile), Tier::Standard);

        // Essential: RAM >= 4.0
        let profile = create_profile(4.0, Some(2.0), false);
        assert_eq!(determine_tier(&profile), Tier::Essential);

        let profile = create_profile(4.0, None, false);
        assert_eq!(determine_tier(&profile), Tier::Essential);

        // Minimal: RAM < 4.0
        let profile = create_profile(2.0, Some(1.0), false);
        assert_eq!(determine_tier(&profile), Tier::Minimal);

        let profile = create_profile(3.9, None, false);
        assert_eq!(determine_tier(&profile), Tier::Minimal);
    }
}
