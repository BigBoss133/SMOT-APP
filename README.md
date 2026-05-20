# SMOT — Smart Archive Desktop

> Archivio documentale intelligente 100% offline con IA locale opzionale | v0.1.0-beta

---

## 🎯 Cos'è SMOT

SMOT è un'applicazione **desktop nativa** per l'archiviazione e la consultazione intelligente di documenti. Funziona completamente offline, senza cloud, senza telemetria.

- 📄 **Carica documenti** — PDF, DOCX, TXT, XLSX
- 🔍 **Ricerca full-text** — FTS5 immediata
- 💬 **Chat RAG** — Ollama + ricerca contestuale
- 🧠 **IA Locale** — Opzionale, privata, sul tuo PC
- 🕸️ **Graph View** — Connessioni tra documenti
- 🌐 **Bilingue** — Italiano / English
- 💻 **Cross-Platform** — Windows (.exe), macOS (.dmg), Linux (.deb/.AppImage)
- 🔒 **100% Offline** — Zero telemetria

---

## 👥 Team

| Sviluppatore | GitHub | Ruolo | Task |
|---|---|---|---|
| **Michele** | BigBoss133 | Backend Rust + Release + Landing API + Test | ✅ 28/28 |
| **Salvatore** | salvograsso10 | Frontend React + UI/UX + Landing Page | ✅ 10/10 |
| **Tommaso** | osurac5 | Database + Sicurezza + CI | ✅ 9/9 |

> 🎉 **47/47 task completati** — Pronti per la beta release

---

## 📊 Stato Attuale

```
MICHELE    ████████████████ 100%  Backend Rust: fix pubkey, CI macOS, reqwest singleton, error handling, 62 test
SALVATORE  ████████████████ 100%  Frontend React: 7 componenti + 3 fix wizard + landing page
TOMMASO    ████████████████ 100%  DB refactoring + Security (S1-S4) + CI fix + dead code
```

### Michele — Backend + Landing API + Test
- 10 comandi Tauri stub → reali (sysinfo, SQLite, FTS5, Ollama RAG)
- Modulo indexing.rs (395 righe: chunking → embedding → FTS5)
- Setup onboarding con check config + complete_onboarding
- Apple Silicon detection (memoria unificata, ram_available_gb)
- Branch release/v0.1.0-beta + chiave updater generata
- Landing page backend API (Express + Stripe + JWT + license management)
- CI macOS fix: rustup target add per Intel + Apple Silicon
- reqwest::Client singleton (ridotto da 4 a 1 istanza)
- Connection::open().expect() → error handling graceful
- Ollama timeout 2s→10s + caching 5s TTL
- Sanitizzazione filename Windows (CON/PRN/AUX/NUL)
- **62 test Rust** (parsers: 7, error: 21, lib: 13, indexing: 20)
- Rimossa configurazione modello locale dal primo avvio

### Salvatore — Frontend
- ErrorBoundary con fallback UI
- Loading skeletons (Dashboard, Chat, Viewer)
- Empty states per pagine vuote
- ConfirmDialog per azioni distruttive
- Toast notifications (success/error/info/warning)
- Real-time indexing progress via eventi Tauri
- Wizard full-screen (nasconde chrome in onboarding)
- SystemDiscoveryStep con memoria unificata
- Fix useForceGraph.ts dependency array (ref pattern)
- Fix SettingsPage.tsx dependency array (ref pattern)
- Fix dynamic import @tauri-apps/api → static import via services/tauri.ts
- E2E Playwright tests (5 test: app, chat, navigation, onboarding, upload)

### Tommaso — DB + Security
- Funzioni DB estratte in db.rs (insert_document, get_all_documents, update_indexing_status, search_fts5)
- Input validation su tutti i comandi Tauri
- Rate limiting Ollama (5 richieste/sec)
- Sanitizzazione filename upload (path traversal, nomi riservati)
- Config audit (nessun secret in chiaro)
- Dead code rimosso (JobInput, IndexingFileStatus)
- CI fix (branch trigger aggiornati)
- Tauri build verificata (deb/rpm/AppImage, cargo test 62/62, clippy clean)

---

## 🏗️ Stack Tecnologico

| Layer | Tecnologia |
|---|---|
| Desktop | Tauri v2.11 |
| Frontend | React 19 + TypeScript + Vite 8 |
| Backend | Rust + sysinfo + rusqlite + reqwest |
| Database | SQLite + FTS5 |
| IA | Ollama (opzionale) |
| CI/CD | GitHub Actions (Windows/macOS/Linux) |
| Installer | NSIS (Win), DMG (Mac), AppImage/deb (Linux) |
| Landing API | Node.js + Express + Stripe + JWT |

---

## ✅ Build Status

| Comando | Risultato |
|---------|:--------:|
| `cargo build` | ✅ 0 errori |
| `cargo test` | ✅ 62/62 test passano |
| `npx tsc --noEmit` | ✅ 0 errori |
| `npx eslint 'src/**/*.{ts,tsx}'` | ✅ 0 errori, 0 warning |
| `npm run build` | ✅ 321 KB JS, 16 KB CSS |

---

## 🌿 Branch

| Branch | Stato |
|--------|:----:|
| `main` | 🟢 Sviluppo attivo |
| `release/v0.1.0-beta` | 🟢 Release beta (tutti i fix) |
| `docs/install-guides` | 🟢 Guide installazione per OS |

---

## 📚 Piani di Lavoro

Tutti in `.sisyphus/plans/` — eseguibili con `/start-work`:

| Piano | Per | Task |
|---|---|---|
| `smot-team-plan.md` | Master | 34/34 ✅ |
| `smot-michele-backend.md` | Michele | 15/15 ✅ |
| `smot-salvatore-frontend.md` | Salvatore | 10/10 ✅ |
| `smot-tommaso-db-security.md` | Tommaso | 9/9 ✅ |
| `smot-installer-fix.md` | Installer | 8/8 ✅ |
| `smot-installer-checklist.md` | UX Polish | 11 task |
| `smot-landing-license.md` | Landing + Licenze | 13 task |
| `smot-release-beta.md` | Release | 7/12 ⏳ |
| `smot-repo-audit.md` | Audit + Fix Plan | 15/15 ✅ |

---

## 🚀 Build per Beta

```bash
git clone https://github.com/BigBoss133/SMOT-APP.git
cd SMOT-APP
git checkout release/v0.1.0-beta
cd smot-desktop
npm install
npm run tauri build
```

Il file si trova in `smot-desktop/src-tauri/target/release/bundle/`

---

## 🔗 Link

- **Repo:** https://github.com/BigBoss133/SMOT-APP
- **Landing:** https://github.com/BigBoss133/SMOT-Landing-page
- **Guide OS:** `INSTALL.md` (branch `docs/install-guides`)
- **Audit:** `AUDIT-REPORT.md`

---

*SMOT — Il tuo archivio intelligente, sul tuo computer, solo per te.*