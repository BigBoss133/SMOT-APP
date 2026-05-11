# SMOT — Build & Run Guide

> **Branch:** `release/v0.1.0-beta` | **Target:** Tutti gli OS (Windows, macOS, Linux)

---

## Prerequisiti

### 1. Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 2. Node.js v20+
```bash
# Verificare versione
node --version   # Deve essere >= 20

# Se serve aggiornare:
npm install -g n
sudo n 20
hash -r
```

### 3. Git
```bash
git --version   # Deve essere installato
```

---

## Setup per OS

### macOS
```bash
# Xcode Command Line Tools (contiene tutto il necessario)
xcode-select --install
```
Nessun altro passo — Xcode include tutto per compilare Tauri.

### Linux (Ubuntu/Debian)
```bash
# GTK + WebKit + dipendenze Tauri
sudo apt install -y \
  libgtk-3-dev \
  libwebkit2gtk-4.1-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libjavascriptcoregtk-4.1-dev \
  libsoup-3.0-dev
```

### Windows
```bash
# 1. Installare Visual Studio Build Tools (o VS 2022)
#    https://visualstudio.microsoft.com/downloads/
#    Selezionare: "Desktop development with C++"

# 2. WebView2 (pre-installato su Windows 10+)
#    Se manca: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

# 3. (Opzionale) NSIS per installer .exe
#    https://nsis.sourceforge.io/Download
```

---

## Build

### 1. Clonare la repo (solo la prima volta)
```bash
git clone https://github.com/BigBoss133/SMOT-APP.git
cd SMOT-APP
```

### 2. Passare al branch release
```bash
git checkout release/v0.1.0-beta
git pull origin release/v0.1.0-beta
```

### 3. Installare dipendenze frontend
```bash
cd smot-desktop
npm install
```

### 4. Build backend Rust
```bash
cd src-tauri
cargo build
cd ..
```

### 5. Build frontend
```bash
npm run build
```

---

## Run in Development Mode

```bash
cd smot-desktop
npm run tauri dev
```

Questo avvia:
- Backend Rust (compilato e avviato da Tauri)
- Frontend React (Vite dev server su localhost:1420)
- Finestra desktop dell'app

---

## Build per Release (.exe, .dmg, .AppImage)

```bash
cd smot-desktop
npm run tauri build
```

L'installer si trova in:
| OS | Path |
|----|------|
| **Windows** | `smot-desktop/src-tauri/target/release/bundle/nsis/SMOT-Beta_0.1.0-beta_x64-setup.exe` |
| **macOS** | `smot-desktop/src-tauri/target/release/bundle/dmg/SMOT-Beta-0.1.0-beta.dmg` |
| **Linux** | `smot-desktop/src-tauri/target/release/bundle/deb/smot-beta_0.1.0-beta_amd64.deb` |

---

## Quick Start (Tutto in una riga)

### Prima volta (clone)
```bash
git clone https://github.com/BigBoss133/SMOT-APP.git && cd SMOT-APP && git checkout release/v0.1.0-beta && cd smot-desktop && npm install && npm run tauri dev
```

### Dalla seconda volta in poi
```bash
cd ~/SMOT-APP && git checkout release/v0.1.0-beta && git pull && cd smot-desktop && npm run tauri dev
```

### macOS
```bash
git clone https://github.com/BigBoss133/SMOT-APP.git && cd SMOT-APP && git checkout release/v0.1.0-beta && cd smot-desktop && npm install && npm run tauri dev
```

### Linux
```bash
git clone https://github.com/BigBoss133/SMOT-APP.git && cd SMOT-APP && git checkout release/v0.1.0-beta && sudo apt install libgtk-3-dev libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev && cd smot-desktop && npm install && npm run tauri dev
```

### Windows (PowerShell)
```powershell
git clone https://github.com/BigBoss133/SMOT-APP.git; cd SMOT-APP; git checkout release/v0.1.0-beta; cd smot-desktop; npm install; npm run tauri dev
```

---

## Troubleshooting

| Errore | Soluzione |
|--------|-----------|
| `fatal: not a git repository` | Sei fuori dalla repo. Primo: `git clone https://github.com/BigBoss133/SMOT-APP.git && cd SMOT-APP` |
| `cargo build` fallisce con `pkg-config` su Linux | `sudo apt install libgtk-3-dev libwebkit2gtk-4.1-dev` |
| `npm run build` fallisce con `CustomEvent is not defined` | Node.js troppo vecchio. Aggiornare con `n 20` |
| `cargo build` fallisce con `unknown field X` | Tauri config non aggiornato. Sei su `release/v0.1.0-beta`? |
| `tauri dev` non apre finestra | Verificare Xcode (`xcode-select --install`) su macOS |
| `Permission denied` su Linux | Eseguire senza restrizioni Wayland |
| App si apre ma schermata bianca | Rilanciare `npm install && npm run tauri dev` |

---

## Note Importanti

- **macOS**: La prima volta che apri la .app, clicca **destro -> Apri** (non doppio click).
  Poi il sistema chiede conferma una tantum.
- **Windows**: SmartScreen potrebbe mostrare un avviso. Clicca "Ulteriori informazioni" -> "Esegui comunque".
- **Linux**: Potrebbe servire `--no-sandbox` se eseguito come root (non raccomandato).
- **Ollama**: Opzionale. Se non installato, la chat funziona in modalita' solo-ricerca.
- **Code signing**: Non attivo per la beta. L'app funziona ma mostra "Sviluppatore non verificato".

---

*SMOT — Il tuo archivio intelligente, sul tuo computer, solo per te.*
