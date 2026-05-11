# Piano Implementazione Installer — SMOT Desktop

> **Branch:** `installer` | **Target:** Windows → macOS → Linux  
> **Base:** SMOT v2 Tauri app (Gate G1+G2 backend)  
> **Obiettivo:** Installer one-click con auto-configurazione e download modelli IA

---

## 📋 TODO: Implementazione Installer

### FASE 1 — Preparazione Tauri Bundle

- [ ] **INS-01. Configurare tauri.conf.json per Windows NSIS**

  **What to do:**
  ```json
  // smot-desktop/src-tauri/tauri.conf.json
  {
    "bundle": {
      "windows": {
        "nsis": {
          "installMode": "currentUser",
          "languages": ["Italian", "English"],
          "displayLanguageSelector": true,
          "installerIcon": "icons/icon.ico",
          "createDesktopShortcut": true,
          "shortcutName": "SMOT - Smart Archive",
          "startMenuFolder": "SMOT"
        },
        "wix": { "language": "it-IT" }
      }
    }
  }
  ```

  **Acceptance Criteria:**
  - [ ] `cargo tauri build` produce `smot-setup.exe` e `smot.msi`
  - [ ] Installer in italiano di default

  **Commit:** `feat(installer): configure NSIS Windows bundle`

- [ ] **INS-02. Creare assets grafici installer**

  **What to do:**
  - `assets/installer/installer-header.bmp` (150x57) — Banner viola con logo SMOT
  - `assets/installer/installer-welcome.bmp` (164x314) — Immagine benvenuto
  - `assets/installer/license.rtf` — Testo EULA in italiano
  - Palette: sfondo `#0a1a3b`, gradiente `#4338f5→#894df8`, testo `#ffffff`

  **Acceptance Criteria:**
  - [ ] Header visibile nell'installer
  - [ ] Welcome image centrata
  - [ ] Licenza in italiano formattata

  **Commit:** `feat(installer): add Windows installer assets`

- [ ] **INS-03. Hook primo avvio (setup.rs)**

  **What to do:**
  ```rust
  // smot-desktop/src-tauri/src/setup.rs
  pub fn on_app_startup(app: &mut App) -> Result<(), Box<dyn Error>> {
      let app_dir = app.path().app_data_dir()?;
      let config_path = app_dir.join("config.json");
      
      // Prima esecuzione?
      if !config_path.exists() {
          // 1. Crea cartelle
          create_dir_all(app_dir.join("documents"))?;
          create_dir_all(app_dir.join("thumbnails"))?;
          create_dir_all(app_dir.join("logs"))?;
          
          // 2. Inizializza database
          db::init_database(app.handle())?;
          
          // 3. Rileva sistema
          let profile = system_probe::probe_system();
          let tier = auto_config::determine_tier(&profile);
          
          // 4. Salva config iniziale
          save_config(&config_path, Config {
              tier: tier.clone(),
              profile: profile.clone(),
              onboarding_completed: false,
              first_launch: Utc::now(),
              language: "it".to_string(),
              license: None,
              ai_enabled: tier.supports_ai(),
          })?;
          
          // 5. Emetti evento per wizard UI
          app.emit("first-launch", serde_json::to_value(&profile)?)?;
      }
      
      Ok(())
  }
  ```

  **Acceptance Criteria:**
  - [ ] Primo avvio crea cartelle e database
  - [ ] Config salvata con tier corretto
  - [ ] Evento `first-launch` emesso per UI

  **Commit:** `feat(installer): add first-launch setup hook`

- [ ] **INS-04. System Probe (system_probe.rs)**

  **What to do:**
  - Rilevamento CPU (cores, model, frequency) via `num_cpus` + `sys-info`
  - Rilevamento RAM (total, available) via `sys-info`
  - Rilevamento GPU (name, VRAM, CUDA/Metal) via `wgpu` o comandi OS
  - Rilevamento disco (free space in app directory)
  - OS detection (name, version, arch)

  ```rust
  pub struct SystemProfile {
      pub cpu_cores: usize,
      pub ram_total_gb: f32,
      pub gpu_name: Option<String>,
      pub gpu_vram_gb: Option<f32>,
      pub gpu_cuda: bool,
      pub disk_free_gb: f32,
      pub os_name: String,
  }
  
  pub fn probe_system() -> SystemProfile { ... }
  ```

  **Acceptance Criteria:**
  - [ ] Rilevamento funziona su Windows
  - [ ] GPU detection corretta (NVIDIA, AMD, Intel)
  - [ ] RAM e disco precisi

  **Commit:** `feat(installer): add system hardware probe`

- [ ] **INS-05. Auto-configurazione tier (auto_config.rs)**

  **What to do:**
  ```rust
  pub enum Tier {
      Premium,    // 16GB+ RAM + GPU
      Standard,   // 8GB+ RAM
      Essential,  // 4GB+ RAM
      Minimal,    // <4GB RAM
  }
  
  pub fn determine_tier(profile: &SystemProfile) -> Tier {
      if profile.ram_total_gb >= 16.0 && profile.gpu_vram_gb.unwrap_or(0.0) >= 4.0 {
          Tier::Premium
      } else if profile.ram_total_gb >= 8.0 {
          Tier::Standard
      } else if profile.ram_total_gb >= 4.0 {
          Tier::Essential
      } else {
          Tier::Minimal
      }
  }
  
  impl Tier {
      pub fn supports_ai(&self) -> bool { matches!(self, Premium | Standard) }
      pub fn display_name(&self) -> &str { ... }
      pub fn recommended_model(&self) -> Option<&str> { ... }
  }
  ```

  **Acceptance Criteria:**
  - [ ] Tier corretto per ogni profilo
  - [ ] UI mostra nome tier in italiano ("Premium", "Standard", "Essential", "Minimal")

  **Commit:** `feat(installer): add auto-configuration logic`

---

### FASE 2 — Wizard Primo Avvio

- [ ] **INS-06. Pagina wizard: System Discovery**

  **What to do:**
  - Componente React `OnboardingPage.tsx` con step multipli
  - Step 1: animazione di scansione con risultati in tempo reale
  - Mostra CPU, RAM, GPU con emoji e messaggi positivi
  - Durata: 3-5 secondi (animazione, non attesa reale)

  ```
  "✅ Intel Core i7-12700H — che potenza!"
  "✅ 16 GB RAM — spazio per tutto"
  "✅ NVIDIA RTX 3060 — IA fulminea"
  "🎉 Il tuo PC è nella fascia PREMIUM!"
  ```

  **Acceptance Criteria:**
  - [ ] Animazione fluida (60fps)
  - [ ] Messaggi in italiano
  - [ ] Tier corretto mostrato

  **Commit:** `feat(wizard): add system discovery onboarding step`

- [ ] **INS-07. Pagina wizard: Scelta Licenza**

  **What to do:**
  - Step 2: "Prova gratuita 7 giorni" vs "Inserisci chiave"
  - Input chiave formattato: `SMOT-XXXX-XXXX-XXXX-XXXX`
  - Validazione formato in tempo reale
  - Messaggio: "Nessuna carta richiesta per la prova"

  **Acceptance Criteria:**
  - [ ] Input chiave con auto-formattazione
  - [ ] Validazione HMAC locale
  - [ ] Salvataggio licenza in config.json

  **Commit:** `feat(wizard): add license selection onboarding step`

- [ ] **INS-08. Pagina wizard: Download Modello IA**

  **What to do:**
  - Step 3 (solo se Premium/Standard): scelta modello
  - Tabella modelli con dimensione, descrizione, stima download
  - Progress bar animata con percentuale e ETA
  - Opzioni: [Scarica ora] [Scarica in background] [Salta]

  ```
  Modelli disponibili per il tuo PC:
  🧠 Llama 3.2 3B    1.8 GB — Consigliato!      [Scarica]
  🔍 Nomic Embed      274 MB — Necessario          [Scarica]
  ```

  **Acceptance Criteria:**
  - [ ] Download via Ollama API
  - [ ] Progress bar in tempo reale
  - [ ] Background download funzionante
  - [ ] Gestione errori (rete assente, spazio disco)

  **Commit:** `feat(wizard): add AI model download onboarding step`

- [ ] **INS-09. Pagina wizard: Primo Documento + Completamento**

  **What to do:**
  - Step 4: dropzone "Trascina il tuo primo documento"
  - Step 5: riepilogo configurazione
  - Pulsante "Vai alla Dashboard" con animazione celebrazione

  **Acceptance Criteria:**
  - [ ] Dropzone funzionante
  - [ ] Riepilogo corretto
  - [ ] Animazione completamento

  **Commit:** `feat(wizard): add first document and completion steps`

---

### FASE 3 — Ollama Integration

- [ ] **INS-10. Rilevamento Ollama**

  **What to do:**
  - All'avvio: `GET http://localhost:11434/api/version`
  - Timeout: 2 secondi
  - Se trovato: lista modelli, verifica compatibilità
  - Se non trovato: guida installazione integrata

  **Acceptance Criteria:**
  - [ ] Detection < 3 secondi
  - [ ] Guida ollama.com in italiano
  - [ ] Pulsante "Verifica installazione" per re-check

  **Commit:** `feat(ollama): add detection and installation guide`

- [ ] **INS-11. Download Modelli via Ollama API**

  **What to do:**
  ```rust
  #[tauri::command]
  async fn pull_model(model: String, app: AppHandle) -> Result<(), String> {
      // POST http://localhost:11434/api/pull
      // Stream progress to UI via app.emit("model-download-progress", ...)
  }
  ```

  **Acceptance Criteria:**
  - [ ] Download funzionante
  - [ ] Progress event in tempo reale
  - [ ] Resume download interrotti

  **Commit:** `feat(ollama): add model download with progress`

- [ ] **INS-12. Gestione Modelli Locali**

  **What to do:**
  - Lista modelli scaricati: `GET /api/tags`
  - Elimina modello: `DELETE /api/delete`
  - Verifica spazio disco prima del download
  - Stima tempo download in base alla rete

  **Acceptance Criteria:**
  - [ ] Gestione modelli in Impostazioni
  - [ ] Warning se spazio < 5GB
  - [ ] ETA accurato (±20%)

  **Commit:** `feat(ollama): add model management UI`

---

### FASE 4 — GitHub Actions CI/CD

- [ ] **INS-13. Build Windows (GitHub Actions)**

  **What to do:**
  - Workflow `.github/workflows/build-windows.yml`
  - Build su `windows-latest`
  - Produce: `smot-setup.exe` (NSIS) + `smot.msi` (WiX)
  - Upload artifacts
  - Creazione release automatica su tag `v*`

  **Acceptance Criteria:**
  - [ ] Build verde su push
  - [ ] Artifact scaricabile
  - [ ] Release creata automaticamente

  **Commit:** `ci: add Windows build workflow`

- [ ] **INS-14. Build macOS (GitHub Actions)**

  **What to do:**
  - Workflow `.github/workflows/build-macos.yml`
  - Build su `macos-latest` (ARM64)
  - Build separata per Intel (x86_64)
  - Produce: `SMOT.app` in `.dmg`

  **Commit:** `ci: add macOS build workflow`

- [ ] **INS-15. Build Linux (GitHub Actions)**

  **What to do:**
  - Workflow `.github/workflows/build-linux.yml`
  - Build su `ubuntu-latest`
  - Produce: `.AppImage` + `.deb`

  **Commit:** `ci: add Linux build workflow`

---

### FASE 5 — Testing

- [ ] **INS-16. Test installazione Windows pulita**

  **What to do:**
  - VM Windows 10: installa → avvia → wizard → dashboard
  - VM Windows 11: same flow
  - Verifica: cartelle create, DB inizializzato, config.json salvato
  - Disinstalla: pulizia completa, nessun residuo

  **Acceptance Criteria:**
  - [ ] Installazione completata senza errori
  - [ ] Wizard funzionante su entrambi
  - [ ] Disinstallazione pulita

  **Commit:** `test: verify clean Windows install/uninstall`

- [ ] **INS-17. Test download modelli**

  **What to do:**
  - Test con Ollama installato: detection OK → download parte
  - Test senza Ollama: guida mostrata, app funziona in modalità ricerca
  - Test rete assente: messaggio chiaro, app funziona offline
  - Test spazio disco insufficiente: warning preventivo

  **Acceptance Criteria:**
  - [ ] Tutti gli scenari gestiti
  - [ ] Nessun crash in nessun caso

  **Commit:** `test: verify model download scenarios`

- [ ] **INS-18. Test auto-update**

  **What to do:**
  - Simula nuova release su GitHub
  - Verifica che app rilevi update
  - Download e installazione automatica
  - Dati utente preservati dopo update

  **Commit:** `test: verify auto-update flow`

---

### FASE 6 — Polish

- [ ] **INS-19. Code signing Windows**

  **What to do:**
  - Acquista certificato code signing (~$200/anno)
  - Configura `signtool` in GitHub Actions
  - Firma `smot.exe` e `smot-setup.exe`

  **Commit:** `ci: add Windows code signing`

- [ ] **INS-20. Notarization macOS**

  **What to do:**
  - Apple Developer ID ($99/anno)
  - `codesign` + `notarytool` in CI
  - Evita warning Gatekeeper

  **Commit:** `ci: add macOS notarization`

- [ ] **INS-21. Performance installer**

  **What to do:**
  - Target: installazione < 30 secondi
  - Target: avvio app < 3 secondi
  - Target: wizard completamento < 2 minuti

  **Commit:** `perf: optimize installer and startup time`

---

## 📊 Riepilogo Task

| Fase | Task | Ore Stimate |
|------|------|:----------:|
| 1 — Bundle | INS-01..05 | 8h |
| 2 — Wizard | INS-06..09 | 10h |
| 3 — Ollama | INS-10..12 | 6h |
| 4 — CI/CD | INS-13..15 | 4h |
| 5 — Test | INS-16..18 | 4h |
| 6 — Polish | INS-19..21 | 4h |
| **Totale** | **21 task** | **~36h** |

---

## 🔗 Dipendenze

```
INS-01 ──→ INS-13 (CI Windows)
INS-03 ──→ INS-06 (Wizard usa setup hook)
INS-04 ──→ INS-05 (Tier da system profile)
INS-05 ──→ INS-07, INS-08 (Wizard step condizionali)
INS-10 ──→ INS-11 (Download dopo detection)
INS-11 ──→ INS-12 (Gestione modelli)
INS-13 ──→ INS-16 (Test dopo build)
```

---

## 🎯 Definition of Done

- [ ] `smot-setup.exe` scaricabile da GitHub Releases
- [ ] Installer in italiano con EULA
- [ ] Wizard 5 step funzionante (discovery → licenza → modelli → doc → done)
- [ ] Download modelli automatico con progresso
- [ ] App funziona anche senza Ollama
- [ ] Build CI/CD verde su 3 OS
- [ ] Test installazione pulita passati
