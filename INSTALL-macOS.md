# SMOT — Guida Installazione macOS

> **Versione:** v0.1.0-beta | **File:** `.dmg`

---

## Requisiti

| Cosa | Comando |
|------|--------|
| **Xcode CLI** | `xcode-select --install` |
| **Rust** | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh` |
| **Node.js 20+** | `node --version` (se <20: `npm install -g n && sudo n 20 && hash -r`) |
| **Git** | `git --version` |

---

## Opzione 1: Scaricare il .dmg (piu facile)

> Il .dmg sara disponibile su https://github.com/BigBoss133/SMOT-APP/releases

1. Vai su **GitHub Releases** e scarica `SMOT-Beta-0.1.0-beta.dmg`
2. Apri il `.dmg` (doppio click)
3. Trascina **SMOT Beta** nella cartella **Applicazioni**
4. Apri da **Applicazioni** (prima volta: tasto destro -> Apri)

---

## Opzione 2: Build da sorgente

```bash
git clone https://github.com/BigBoss133/SMOT-APP.git
cd SMOT-APP
git checkout release/v0.1.0-beta
cd smot-desktop
npm install
npm run tauri build
```

Il `.dmg` si trova in:
```
smot-desktop/src-tauri/target/release/bundle/dmg/SMOT-Beta-0.1.0-beta.dmg
```

---

## Opzione 3: Modalita sviluppo (senza installare)

```bash
git clone https://github.com/BigBoss133/SMOT-APP.git
cd SMOT-APP
git checkout release/v0.1.0-beta
cd smot-desktop
npm install
npm run tauri dev
```

---

## Primo avvio

1. Alla prima apertura, macOS mostra: "SMOT Beta non puo essere aperto perche proviene da uno sviluppatore non verificato"
2. **Soluzione**: Clicca **destro** sull'app -> **Apri**
3. Clicca **Apri** nel dialogo di conferma
4. Dopo la prima volta, funziona col doppio click normale

---

## Troubleshooting

| Problema | Soluzione |
|----------|-----------|
| `cargo build` fallisce | `xcode-select --install` |
| `node --version` mostra v18 | `sudo n 20 && hash -r` |
| Schermata bianca | `cd smot-desktop && npm install && npm run tauri build` |
| `npm install` da errori | `rm -rf node_modules && npm install` |
| `tauri dev` non apre finestra | Xcode non installato: `xcode-select --install` |

---

## Note

- **Apple Silicon (M1/M2/M3/M4)**: Supporto nativo
- **Intel Mac**: Stessi comandi
- **Ollama**: Opzionale. Senza, chat in modalita solo-ricerca
- **Code signing**: Non attivo per la beta. Avviso "Sviluppatore non verificato" e normale

---

*Serve aiuto? https://github.com/BigBoss133/SMOT-APP/issues*