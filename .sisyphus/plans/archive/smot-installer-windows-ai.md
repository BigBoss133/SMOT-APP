# Piano Installer Windows & Modelli IA — SMOT Desktop

> **Obiettivo:** Installer Windows one-click + download automatico modelli IA + replicabile su Mac/Linux.
> **Principio:** L'utente scarica, clicca, e SMOT fa tutto da solo.

---

## 1. 🪟 Installer Windows — Specifiche

### 1a. Output Tauri

```bash
cargo tauri build --target x86_64-pc-windows-msvc
```

| File | Peso | Scopo |
|------|:----:|-------|
| `smot.exe` | ~12 MB | Portable (doppio click) |
| `smot.msi` | ~15 MB | Installer classico |
| `smot-setup.exe` | ~15 MB | NSIS installer (consigliato) |

### 1b. Struttura Installer (NSIS)

```
smot-setup.exe
├── Splash screen SMOT
├── EULA / Licenza
├── Scelta percorso installazione (default: %LOCALAPPDATA%\SMOT)
├── [Avvia SMOT] al termine
└── Disinstalla da Pannello di Controllo
```

### 1c. Configurazione tauri.conf.json

```json
{
  "tauri": {
    "bundle": {
      "active": true,
      "targets": "all",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/icon.ico"
      ],
      "windows": {
        "wix": {
          "language": "it-IT"
        },
        "nsis": {
          "languages": ["Italian", "English"],
          "installMode": "currentUser",
          "displayLanguageSelector": true,
          "installerIcon": "icons/icon.ico",
          "headerImage": "assets/installer-header.bmp",
          "welcomeImage": "assets/installer-welcome.bmp",
          "createDesktopShortcut": true,
          "shortcutName": "SMOT - Smart Archive",
          "startMenuFolder": "SMOT"
        }
      }
    },
    "updater": {
      "active": true,
      "endpoints": [
        "https://smot.app/api/update/{{target}}/{{current_version}}"
      ],
      "pubkey": "CHIAVE_PUBBLICA_QUI",
      "windows": {
        "installMode": "passive"
      }
    }
  }
}
```

### 1d. Risorse Grafiche Installer

```
assets/installer/
├── installer-header.bmp     # 150x57 — Banner in alto
├── installer-welcome.bmp    # 164x314 — Immagine benvenuto
├── installer-icon.ico       # Icona NSIS
└── license.rtf             # Testo licenza formattato
```

**Banner design:**
- Sfondo gradiente `#4338f5 → #894df8`
- Logo SMOT a sinistra
- Testo "SMOT Smart Archive" in bianco

---

## 2. 🚀 Primo Avvio — Cosa Deve Fare

```rust
// src-tauri/src/setup.rs — hook al primo avvio
pub fn on_first_launch(app: &mut App) -> Result<(), Box<dyn Error>> {
    // 1. Crea cartelle
    create_app_directories(app)?;           // documents/, thumbnails/, logs/
    
    // 2. Inizializza database
    init_database(app)?;                     // SQLite + FTS5 + migrations
    
    // 3. Rileva sistema
    let profile = system_probe::probe_system();
    let tier = auto_config::determine_tier(&profile);
    
    // 4. Salva configurazione
    save_config(app, Config {
        tier: tier.clone(),
        profile,
        onboarding_completed: false,
        first_launch: Utc::now(),
        language: detect_system_language(),    // IT/EN da OS
        license: None,
        ai_enabled: tier.supports_ai(),
        ollama_detected: false,
    })?;
    
    // 5. Emetti evento per UI → mostra wizard
    app.emit("first-launch", tier)?;
    
    Ok(())
}
```

### Flusso Wizard Windows

```
Doppio click su smot.exe (o collegamento desktop)
    ↓
Splash screen (2s)
    ↓
┌──────────────────────────────────────────┐
│  🔬 Rilevamento sistema...               │
│  CPU: Intel i7 · RAM: 16GB · GPU: RTX    │
│  Configurazione: PREMIUM                 │
└──────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────┐
│  🎁 Prova gratuita 7 giorni               │
│  [Inizia prova] [Inserisci chiave]        │
└──────────────────────────────────────────┘
    ↓ (se PREMIUM/STANDARD + consenso)
┌──────────────────────────────────────────┐
│  📥 Download modello IA...               │
│  llama3.2:3b (1.8 GB) ████████░░ 80%     │
│  Tempo rimasto: ~2 minuti                 │
│  [Salta] [Scarica in background]          │
└──────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────┐
│  ✅ SMOT è pronto!                        │
│  Dashboard → carica il primo documento    │
└──────────────────────────────────────────┘
```

---

## 3. 🤖 Modelli IA Locali — Scelta

### 3a. Criteri di Scelta

| Criterio | Peso | Target |
|----------|:----:|--------|
| Qualità RAG (italiano) | 🔴 Alto | Risposte accurate sui documenti |
| Dimensione | 🔴 Alto | <4GB per download accettabile |
| RAM richiesta | 🔴 Alto | Funzionare su 8-16GB |
| Velocità (CPU) | 🟡 Medio | Risposta <30 secondi |
| Licenza | 🟡 Medio | Commercial-friendly |
| Token/contesto | 🟢 Basso | Almeno 8K context |

### 3b. Modelli Selezionati

#### 🥇 Primario: Llama 3.2 3B (Q4_K_M)

```
Modello:      llama3.2:3b
Tag Ollama:   llama3.2:3b-instruct-q4_K_M
Dimensione:   1.8 GB
RAM richiesta: 3-4 GB
Context:      128K token
Lingue:       IT/EN (eccellente italiano)
Velocità CPU: ~15-20 tok/s
Licenza:      Llama 3.2 Community (commercial OK)
Costo:        Gratuito
```

**Perché:** Miglior rapporto qualità/dimensione. Parlato italiano eccellente. Download veloce (1.8GB).

#### 🥈 Premium (solo se GPU): Llama 3.2 7B (Q4_K_M)

```
Modello:      llama3.2:7b
Tag Ollama:   llama3.2:7b-instruct-q4_K_M
Dimensione:   4.7 GB
RAM richiesta: 7-8 GB
Context:      128K token
Velocità GPU: ~60-80 tok/s
```

**Perché:** Qualità superiore, ma solo per PC con 16GB+ RAM e GPU.

#### 🥉 Embedding: Nomic Embed Text v1.5

```
Modello:      nomic-embed-text
Tag Ollama:   nomic-embed-text:v1.5
Dimensione:   274 MB
RAM richiesta: 1 GB
Output:       768 dimensioni
Velocità:     ~5ms per chunk
```

**Perché:** Leggerissimo, ottimo per search semantico, gratuito, MIT license.

#### 🏅 Fallback Leggero: Phi-3 Mini

```
Modello:      phi3:mini
Tag Ollama:   phi3:mini-4k-instruct-q4_K_M
Dimensione:   2.2 GB
RAM richiesta: ~4 GB
Context:      4K token
```

**Perché:** Alternativa se llama3.2 non disponibile. Buona qualità, pesa poco.

### 3c. Matrice Modello × Tier

| Tier | Chat Model | Embedding Model | VRAM Min |
|------|-----------|-----------------|----------|
| **Premium** | `llama3.2:7b` | `nomic-embed-text` | 6 GB |
| **Standard** | `llama3.2:3b` | `nomic-embed-text` | — |
| **Essential** | — | — | — |
| **Minimal** | — | — | — |

---

## 4. 📥 Download Modelli: Zero Friction

### 4a. Flusso Automatico

```typescript
// src/hooks/useModelDownloader.ts
export function useModelDownloader() {
  const [state, setState] = useState<DownloadState>('idle');
  const [progress, setProgress] = useState(0);
  const [currentModel, setCurrentModel] = useState('');

  const downloadRequiredModels = async (tier: TierConfig) => {
    const models = getModelsForTier(tier);
    
    for (const model of models) {
      setCurrentModel(model.name);
      setState('downloading');
      
      // Ollama gestisce il download automaticamente
      await ollama.pull(model.tag, {
        onProgress: (p) => setProgress(p.percent),
      });
    }
    
    setState('complete');
  };

  return { state, progress, currentModel, downloadRequiredModels };
}
```

### 4b. UI Download

```
┌──────────────────────────────────────────────────┐
│  📥 Preparazione modelli IA                        │
│                                                   │
│  Per usare la chat intelligente, SMOT scaricherà  │
│  alcuni modelli IA. È tutto automatico!           │
│                                                   │
│  ┌─────────────────────────────────────────┐     │
│  │ 🧠 Llama 3.2 3B   1.8 GB                │     │
│  │ ████████████████░░░░░░░  78%            │     │
│  │ Tempo stimato: 1 minuto                  │     │
│  └─────────────────────────────────────────┘     │
│                                                   │
│  ℹ️ I modelli rimangono sul tuo computer.         │
│  Puoi cancellarli in qualsiasi momento.           │
│                                                   │
│  [  Scarica in background  ]  [  Salta  ]        │
└──────────────────────────────────────────────────┘
```

### 4c. Background Download

```typescript
// Se l'utente clicca "Scarica in background":
// Il download continua mentre usa l'app normalmente
// Notifica in status bar quando completato

// src/App.tsx
useEffect(() => {
  if (config.pendingDownloads.length > 0) {
    // Riprendi download interrotti
    resumeBackgroundDownloads(config.pendingDownloads);
  }
}, []);

// Status bar mostra:
// "📥 Scaricando llama3.2... 45%"
```

### 4d. Gestione Ollama (se non installato)

```rust
// Scenario: Utente ha Premium ma Ollama non è installato
// SMOT NON installa Ollama automaticamente (scelta consapevole)
// MA guida l'utente passo-passo

#[derive(PartialEq)]
enum OllamaStatus {
    Found { version: String, models: Vec<String> },
    NotInstalled,
    NotRunning,
    Outdated { current: String, required: String },
}

fn handle_ollama_status(status: OllamaStatus) -> UserAction {
    match status {
        OllamaStatus::Found { .. } => {
            // Tutto ok, procedi con download modelli
            UserAction::DownloadModels
        }
        OllamaStatus::NotInstalled => {
            // Guida interattiva
            UserAction::ShowGuide("Installa Ollama")
        }
        OllamaStatus::NotRunning => {
            UserAction::ShowGuide("Avvia Ollama")
        }
        OllamaStatus::Outdated { .. } => {
            UserAction::ShowGuide("Aggiorna Ollama")
        }
    }
}
```

### 4e. Guida Installazione Ollama Integrata

```
┌──────────────────────────────────────────────────┐
│  🧠 Per usare l'IA, installa Ollama               │
│                                                   │
│  È gratis, open source, e resta sul tuo PC.      │
│  Bastano 2 minuti:                                │
│                                                   │
│  ┌──────────────────────────────────────────┐    │
│  │  1️⃣  Visita ollama.com                     │    │
│  │  2️⃣  Clicca "Download" per il tuo OS      │    │
│  │  3️⃣  Installa (doppio click)               │    │
│  │  4️⃣  Torna qui e clicca "Verifica"         │    │
│  └──────────────────────────────────────────┘    │
│                                                   │
│  [  Apri ollama.com  ]  [  Verifica install.  ]   │
│  [  Salta — userò solo la ricerca  ]              │
└──────────────────────────────────────────────────┘
```

---

## 5. 📦 Pacchetto Completo Windows

### 5a. Cosa Include lo Zip/Installer

```
smot-setup.exe (15 MB)
    ↓ installa
C:\Users\Mario\AppData\Local\SMOT\
├── smot.exe                  # Binario principale
├── smot.db                   # Database SQLite (creato al primo avvio)
├── config.json               # Configurazione
├── documents/                # Documenti utente
├── thumbnails/               # Anteprime
└── logs/                     # Log
```

### 5b. Build Pipeline (GitHub Actions)

```yaml
# .github/workflows/build-windows.yml
name: Build Windows Installer

on:
  push:
    tags: ['v*']

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with: { node-version: '22' }
      
      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
      
      - name: Install Tauri CLI
        run: npm install -g @tauri-apps/cli@latest
      
      - name: Install NSIS
        run: choco install nsis -y
      
      - name: Install Frontend Deps
        run: npm ci
        working-directory: smot-desktop
      
      - name: Build
        run: cargo tauri build --target x86_64-pc-windows-msvc
        working-directory: smot-desktop
      
      - name: Upload Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: smot-windows
          path: |
            smot-desktop/src-tauri/target/release/bundle/msi/*.msi
            smot-desktop/src-tauri/target/release/bundle/nsis/*.exe
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            smot-desktop/src-tauri/target/release/bundle/msi/*.msi
            smot-desktop/src-tauri/target/release/bundle/nsis/*.exe
```

---

## 6. 🍎 macOS & 🐧 Linux (Dopo Windows)

### 6a. macOS (.dmg)

```bash
cargo tauri build --target aarch64-apple-darwin  # Apple Silicon
cargo tauri build --target x86_64-apple-darwin   # Intel
```

**Particolarità:**
- Bundle `.app` dentro `.dmg`
- Trascina l'icona in `/Applications` (classico Mac)
- Gatekeeper: richiede notarization Apple ($99/year)
- Per test: click destro → Apri (bypass temporaneo)

### 6b. Linux (.AppImage + .deb)

```bash
cargo tauri build --target x86_64-unknown-linux-gnu
```

**Particolarità:**
- `.AppImage`: eseguibile portable (doppio click)
- `.deb`: per Debian/Ubuntu
- `.rpm`: per Fedora (opzionale)
- Nessun code signing richiesto
- Flatpak per distribuzione store

---

## 7. 📋 Implementation Plan (Windows First)

### Fase 1: Windows Installer (12h)

| Task | Ore | Descrizione |
|------|:---:|-------------|
| **W1** | 1h | Configurare `tauri.conf.json` per NSIS |
| **W2** | 2h | Creare assets installer (banner, icone, EULA) |
| **W3** | 2h | `setup.rs` — hook primo avvio e wizard |
| **W4** | 1h | Logger per debug installazione |
| **W5** | 3h | GitHub Actions build pipeline Windows |
| **W6** | 0.5h | Test installazione pulita su VM Windows 10 |
| **W7** | 0.5h | Test installazione pulita su VM Windows 11 |
| **W8** | 1h | Test uninstall + reinstall (no dati persi) |
| **W9** | 1h | Test auto-update Windows |

### Fase 2: Modelli IA (10h)

| Task | Ore | Descrizione |
|------|:---:|-------------|
| **M1** | 2h | `src/hooks/useModelDownloader.ts` — download via Ollama API |
| **M2** | 2h | UI wizard download modelli con progress bar |
| **M3** | 1h | Background download + status bar |
| **M4** | 2h | Guida installazione Ollama integrata |
| **M5** | 1h | Selezione modello per tier |
| **M6** | 1h | Test download su PC senza Ollama |
| **M7** | 1h | Test download su PC con Ollama esistente |

### Fase 3: macOS (6h)

| Task | Ore | Descrizione |
|------|:---:|-------------|
| **MAC1** | 2h | Config `.dmg` + icona |
| **MAC2** | 1h | GitHub Actions macOS (x86 + ARM) |
| **MAC3** | 1h | Test su macOS |
| **MAC4** | 2h | Notarization (Apple Developer) |

### Fase 4: Linux (4h)

| Task | Ore | Descrizione |
|------|:---:|-------------|
| **LIN1** | 2h | Config `.AppImage` + `.deb` |
| **LIN2** | 1h | GitHub Actions Linux |
| **LIN3** | 1h | Test su Ubuntu/Fedora |

### Totale: ~32 ore

---

## 8. 📊 Riepilogo Modelli per OS

| OS | Ollama Support | Modello Default | Download Auto |
|----|:---:|----------------|:---:|
| **Windows** | ✅ Nativo | llama3.2:3b (1.8GB) | ✅ Via wizard |
| **macOS** | ✅ Nativo | llama3.2:3b (1.8GB) | ✅ Via wizard |
| **Linux** | ✅ Nativo | llama3.2:3b (1.8GB) | ✅ Via wizard |

---

## 9. 🎯 Cosa Scarica l'Utente

```
smot.app → Rileva OS → Download automatico

Windows:   smot-setup-v1.0.0.exe    (15 MB)
macOS:     SMOT-v1.0.0-arm64.dmg    (18 MB)
Linux:     smot-v1.0.0.AppImage     (16 MB)

Dopo installazione:
- 15 MB  → app
- 1.8 GB → llama3.2:3b (se IA attivata)
- 274 MB → nomic-embed-text (se IA attivata)
- ~2 GB  → totale con IA
```

**L'app base è solo 15 MB.** I modelli IA si scaricano solo se l'utente sceglie di attivare l'IA e ha un PC compatibile.
