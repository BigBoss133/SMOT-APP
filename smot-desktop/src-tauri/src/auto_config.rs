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
    pub fn supports_ai(&self) -> bool {
        matches!(self, Tier::Premium | Tier::Standard)
    }

    pub fn display_name(&self) -> &str {
        match self {
            Tier::Premium => "Premium",
            Tier::Standard => "Standard",
            Tier::Essential => "Essential",
            Tier::Minimal => "Minimale",
        }
    }

    pub fn recommended_model(&self) -> Option<&str> {
        match self {
            Tier::Premium => Some("llama3.2:7b"),
            Tier::Standard => Some("llama3.2:3b"),
            _ => None,
        }
    }
}