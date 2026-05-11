# SMOT — Guida Installazione Windows

> **Versione:** v0.1.0-beta | **File:** `.exe` (NSIS installer)

---

## Requisiti

### Visual Studio Build Tools
- https://visualstudio.microsoft.com/downloads/
- Seleziona: **"Sviluppo desktop con C++"**

### Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Node.js 20+
- https://nodejs.org (versione 20 LTS+)
- Verifica: `node --version`

### Git
- https://git-scm.com/download/win

---

## Opzione 1: Scaricare l'exe (piu facile)

> L'exe sara disponibile su https://github.com/BigBoss133/SMOT-APP/releases

1. Scarica `SMOT-Beta_0.1.0-beta_x64-setup.exe`
2. Doppio click -> Next -> Next -> Installa
3. SMOT nel Menu Start e Desktop

---

## Opzione 2: Build da sorgente

```powershell
git clone https://github.com/BigBoss133/SMOT-APP.git
cd SMOT-APP
git checkout release/v0.1.0-beta
cd smot-desktop
npm install
npm run tauri build
```

Trovi l'exe in:
```
smot-desktop/src-tauri/target/release/bundle/nsis/SMOT-Beta_0.1.0-beta_x64-setup.exe
```

---

## Opzione 3: Modalita sviluppo

```powershell
git clone https://github.com/BigBoss133/SMOT-APP.git
cd SMOT-APP
git checkout release/v0.1.0-beta
cd smot-desktop
npm install
npm run tauri dev
```

---

## Primo avvio

1. **SmartScreen**: "Windows ha protetto il tuo PC"
2. Clicca **"Ulteriori informazioni"** -> **"Esegui comunque"**

---

## Troubleshooting

| Problema | Soluzione |
|----------|-----------|
| `cargo build` fallisce con `link.exe` | VS Build Tools non installato |
| `node --version` mostra v18 | Reinstalla Node.js 20+ da nodejs.org |
| `npm install` fallisce | `Remove-Item -Recurse -Force node_modules; npm install` |
| Schermata bianca | WebView2 mancante: https://developer.microsoft.com/en-us/microsoft-edge/webview2/ |

---

## Note

- **Windows 10/11**: Supporto completo
- **Windows 7/8**: NON supportato
- **Ollama**: Opzionale
- **Code signing**: Non attivo per la beta

---

*Serve aiuto? https://github.com/BigBoss133/SMOT-APP/issues*