# Strategia Distribuzione & Onboarding — SMOT Desktop

> Analisi installer vs portable, primo avvio, setup dipendenze, user experience.

---

## 🎯 Obiettivo

SMOT deve essere **scaricabile e funzionante in <2 minuti** da qualsiasi utente, su qualsiasi OS, con o senza conoscenze tecniche.

---

## 📊 Confronto: Installer vs Portable

| Criterio | Installer (.msi/.dmg/.deb) | Portable (.exe/.app/.AppImage) |
|----------|:--------------------------:|:----------------------------:|
| **Peso download** | ~15-20 MB | ~10-15 MB |
| **Peso installato** | ~30-50 MB | ~15-20 MB |
| **Start Menu / Dock** | ✅ Automatico | ❌ Manuale |
| **Uninstall pulito** | ✅ Sì | ❌ File residui |
| **Auto-update** | 🔧 Più complesso | ✅ Tauri built-in |
| **Permessi OS** | 🔧 Richiede admin (a volte) | ✅ No admin |
| **Windows SmartScreen** | ⚠️ Flagga .msi | ⚠️ Flagga .exe |
| **UX utente** | Doppio click → Next → Fine | Doppio click → Pronto |
| **Portabilità (USB)** | ❌ No | ✅ Sì |

### 🏆 Verdetto

**Portable (standalone binary) è la scelta migliore per SMOT** perché:
- L'utente target potrebbe non avere permessi admin
- L'app è offline — non serve integrazione OS profonda
- Tauri v2 supporta auto-update nativo per portable
- La "portabilità" allinea con la filosofia "tutto locale"

---

## 🚀 Strategia: Portable + Onboarding Wizard

```
DOWNLOAD (10-15MB)
    ↓
DOPPIO CLICK → APP SI APRE
    ↓
WIZARD PRIMO AVVIO (2 minuti)
    ↓
APP PRONTA
```

### Perché funziona

1. **Download istantaneo** — 10-15MB vs 150MB+ di Electron
2. **Nessuna installazione** — doppio click e via
3. **Setup guidato** — il wizard fa tutto al posto dell'utente
4. **Auto-contenuto** — l'app crea la sua cartella dati automaticamente

---

## 🧙 Primo Avvio: Onboarding Wizard

### Step 1: Benvenuto (5 secondi)

```
┌──────────────────────────────────────────┐
│                                          │
│           🧠  SMOT                        │
│      Il tuo archivio intelligente         │
│                                          │
│    100% offline · Zero cloud · IA locale  │
│                                          │
│         [  Iniziamo  ]                    │
└──────────────────────────────────────────┘
```

### Step 2: Scelta Modalità (10 secondi)

```
┌──────────────────────────────────────────┐
│  Come vuoi usare SMOT?                    │
│                                          │
│  ┌──────────┐  ┌──────────┐             │
│  │ 🧠 CON IA │  │ 📄 SENZA  │             │
│  │  Chat +   │  │  Ricerca  │             │
│  │  RAG      │  │  classica │             │
│  │           │  │           │             │
│  │ Richiede  │  │ Funziona  │             │
│  │ Ollama    │  │ subito    │             │
│  └──────────┘  └──────────┘             │
│                                          │
│  [configurabile anche dopo]              │
└──────────────────────────────────────────┘
```

### Step 3a: Setup Ollama (se scelto "CON IA")

```
┌──────────────────────────────────────────┐
│  Configurazione IA Locale                 │
│                                          │
│  Rilevamento automatico... ✅            │
│                                          │
│  ○ Ollama trovato!                       │
│    Versione: 0.5.1                       │
│    Modelli: llama3.2, nomic-embed-text   │
│                                          │
│  Scarica modello consigliato:            │
│  ┌──────────────────────────────────┐    │
│  │ 🟢 llama3.2:3b  (1.8 GB)  [↓]   │    │
│  │ 🟡 phi3:mini    (2.2 GB)  [↓]   │    │
│  │ ⚪ Salta per ora                 │    │
│  └──────────────────────────────────┘    │
│                                          │
│  ○ Ollama NON trovato                     │
│    📖 Guida installazione →              │
│    [Apri ollama.com]  [Salta]            │
└──────────────────────────────────────────┘
```

### Step 3b: Ricerca Classica (se scelto "SENZA IA")

```
┌──────────────────────────────────────────┐
│  SMOT è pronto!                          │
│                                          │
│  ✅ Database locale creato               │
│  ✅ Cartella documenti pronta            │
│  ✅ Ricerca full-text attiva             │
│                                          │
│  La chat IA non sarà disponibile.        │
│  Puoi attivarla in qualsiasi momento     │
│  da Impostazioni.                        │
│                                          │
│          [  Inizia a usare SMOT  ]        │
└──────────────────────────────────────────┘
```

### Step 4: Primo documento (opzionale)

```
┌──────────────────────────────────────────┐
│  Prova SMOT subito                       │
│                                          │
│  Trascina qui un documento               │
│  ┌──────────────────────────────────┐    │
│  │        📄  PDF, DOCX, TXT        │    │
│  │     Trascina o clicca per        │    │
│  │       caricare un file            │    │
│  └──────────────────────────────────┘    │
│                                          │
│  [Salta — inizierò dopo]                 │
└──────────────────────────────────────────┘
```

---

## 📁 Gestione Automatica File/Cartelle

### Cosa crea SMOT al primo avvio

```rust
// Non serve che l'utente faccia nulla.
// L'app crea tutto automaticamente.

fn first_run_setup(app_handle: &AppHandle) -> Result<(), Box<dyn Error>> {
    let app_dir = app_handle.path().app_data_dir()?;
    
    // Cartelle automatiche
    create_dir_all(app_dir.join("documents"))?;   // Documenti caricati
    create_dir_all(app_dir.join("thumbnails"))?;   // Anteprime
    create_dir_all(app_dir.join("logs"))?;          // Log
    
    // Database
    init_database(app_handle)?;                     // SQLite
    
    // File configurazione default
    if !app_dir.join("config.json").exists() {
        let default_config = serde_json::json!({
            "language": "it",
            "mode": "balanced",
            "ai_enabled": false,
            "onboarding_completed": false,
            "first_launch": chrono::Utc::now().to_rfc3339(),
        });
        fs::write(
            app_dir.join("config.json"),
            serde_json::to_string_pretty(&default_config)?
        )?;
    }
    
    Ok(())
}
```

### Percorsi per OS

| OS | Cartella dati | Esempio |
|----|--------------|---------|
| **Windows** | `%APPDATA%/com.smot.app/` | `C:\Users\Mario\AppData\Roaming\com.smot.app\` |
| **macOS** | `~/Library/Application Support/com.smot.app/` | `/Users/mario/Library/Application Support/com.smot.app/` |
| **Linux** | `~/.local/share/com.smot.app/` | `/home/mario/.local/share/com.smot.app/` |

---

## 🔄 Auto-Update (Tauri Built-in)

```json
// tauri.conf.json
{
  "plugins": {
    "updater": {
      "endpoints": [
        "https://smot.app/releases/latest.json"
      ],
      "pubkey": "...",
      "windows": {
        "installMode": "passive"
      }
    }
  }
}
```

**Flusso update:**
```
1. App controlla /releases/latest.json all'avvio
2. Se nuova versione → notifica silenziosa
3. Download in background (~5-10 MB)
4. "Riavvia per aggiornare" → click → aggiornato
```

---

## 🎨 UX Onboarding: Principi

| Principio | Implementazione |
|-----------|----------------|
| **Zero configurazione** | Tutto auto-rilevato, tutto auto-creato |
| **Scelta consapevole** | IA sì/no spiegato in linguaggio semplice |
| **Skip always** | Ogni step è saltabile |
| **Mai bloccare** | Se Ollama non c'è, l'app funziona lo stesso |
| **Progresso visibile** | Download modelli mostra barra + ETA |
| **Italiano first** | Wizard in italiano, ENG come fallback |

---

## 📦 Build per Distribuzione

```bash
# Windows
cargo tauri build --target x86_64-pc-windows-msvc
# Output: smot-desktop/src-tauri/target/release/bundle/msi/*.msi
#         smot-desktop/src-tauri/target/release/smot.exe  ← portable!

# macOS
cargo tauri build --target aarch64-apple-darwin
# Output: smot-desktop/src-tauri/target/release/bundle/dmg/*.dmg
#         smot-desktop/src-tauri/target/release/bundle/macos/SMOT.app  ← portable!

# Linux
cargo tauri build --target x86_64-unknown-linux-gnu
# Output: smot-desktop/src-tauri/target/release/bundle/appimage/*.AppImage
#         smot-desktop/src-tauri/target/release/bundle/deb/*.deb
```

**Distribuiremo entrambi:**
- **Portable .exe/.app/.AppImage** — consigliato, download diretto
- **Installer .msi/.dmg/.deb** — per utenti che lo preferiscono

---

## 🚦 Flusso Utente Completo

```
UTENTE VISITA smot.app
    ↓
CLICCA "Download" → rileva OS → scarica file corretto (15 MB)
    ↓
DOPPIO CLICK sul file scaricato
    ↓
SMARTSCREEN (Windows): "App non riconosciuta" → [Esegui comunque]
    ↓
APP SI APRE → Splash screen
    ↓
WIZARD PRIMO AVVIO (2 minuti)
    ├── Scelta IA sì/no
    ├── Download modello (se IA)
    └── Pronto!
    ↓
DASHBOARD → app pronta all'uso
```

---

## 🛡️ Firme e Certificati (per evitare SmartScreen)

```bash
# Windows: Code Signing Certificate (~$200/year)
signtool sign /fd SHA256 /a /f certificate.pfx /p password smot.exe

# macOS: Apple Developer ID (~$99/year)
codesign --sign "Developer ID Application: SMOT" SMOT.app
xcrun notarytool submit SMOT.dmg --apple-id ...

# Linux: GPG signature
gpg --detach-sign smot.AppImage
```

Per la fase iniziale (MVP): accettiamo l'avviso SmartScreen e aggiungiamo certificati dopo.

---

## 📋 Implementation Plan (Onboarding)

| Task | Stima | Dipende da |
|------|:-----:|------------|
| **OB1:** Config wizard React (3 step) | 3h | UI esistente |
| **OB2:** Tauri command `first_run_setup()` | 2h | db.rs |
| **OB3:** Rilevamento automatico Ollama | 1h | G2-T9 |
| **OB4:** Download modelli Ollama con progresso | 3h | OB3 |
| **OB5:** Salvataggio/configurazione `config.json` | 1h | OB1 |
| **OB6:** Build portable per 3 OS | 2h | CI/CD |
| **OB7:** Auto-update Tauri config | 2h | OB6 |
| **OB8:** Test onboarding su Windows/Mac/Linux | 2h | OB1-OB7 |
| **Totale** | **16h** | |

---

## 🎯 Risposta alla Domanda

> È necessario un installer?

**No.** L'app può funzionare come portable (doppio click e via).

**Ma offriremo entrambe le opzioni:**
- **Portable** (default) — per utenti che vogliono provare subito
- **Installer** (opzionale) — per chi preferisce integrazione OS classica

Il primo avvio gestisce TUTTO automaticamente: crea cartelle, inizializza DB, rileva (o guida a installare) Ollama. L'utente vede solo un wizard di 3 step in italiano.
