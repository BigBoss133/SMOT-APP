# SMOT — Smart Archive Desktop

> Archivio documentale intelligente 100% offline con IA locale opzionale

## 🎯 Cos'è SMOT

SMOT è un'applicazione **desktop nativa** per l'archiviazione e la consultazione intelligente di documenti. Funziona completamente offline sul tuo computer, senza cloud, senza telemetria, senza inviare dati all'esterno.

### Caratteristiche Principali

- 📄 **Carica documenti** — PDF, DOCX, TXT e immagini (OCR)
- 🔍 **Ricerca full-text** — Trova qualsiasi documento per parola chiave
- 💬 **Chat RAG** — Interroga i tuoi documenti in linguaggio naturale
- 🧠 **IA Locale** — Funziona con Ollama (opzionale, privato, sul tuo PC)
- 🕸️ **Graph View** — Visualizzazione connessioni tra documenti (tipo Obsidian)
- 🌐 **Bilingue** — Interfaccia in Italiano e Inglese
- 💻 **Cross-Platform** — Windows, macOS, Linux
- 🔒 **100% Offline** — Nessun dato lascia mai il tuo computer

---

## 👥 Team

| Sviluppatore | Ruolo | Area |
|---|---|---|
| **Michele** (BigBoss133) | Backend Rust + Infrastruttura | 10 comandi Tauri, CI/CD, Installer |
| **Salvatore** (salvograsso10) | Frontend React + UI/UX | Animazioni, Graph View, Componenti |
| **Tommaso** | Backend + Database + Sicurezza | Funzioni SQLite, Security hardening |

> 🔧 Tutti usiamo **OpenCode** con Sisyphus per l'esecuzione automatica dei task.

---

## 🌿 Branch Structure

| Branch | Stato |
|---|---|
| `main` | 🟢 Sviluppo attivo — tutti i branch mergiati qui |
| `Animations-and-design` | ✅ Mergiato in main |
| `installer` | ✅ Mergiato in main |

---

## 📊 Stato Attuale

### ✅ Gate G1 — Scaffold (COMPLETATO)

| Funzionalità | Stato |
|---|---|
| Tauri v2 + React + TypeScript + Vite | ✅ |
| Dashboard, Upload, Chat, Viewer, Settings | ✅ |
| Navigazione 6 route | ✅ |
| i18n IT/EN | ✅ |

### ✅ Gate G2 — Backend Base (COMPLETATO)

| Funzionalità | Stato |
|---|---|
| SQLite database + FTS5 schema | ✅ `db.rs` |
| Parser PDF/DOCX/XLSX | ✅ `parsers.rs` |
| Ollama detection/download/status | ✅ `ollama.rs` |
| Migrations e init scripts | ✅ |

### ✅ Design System (COMPLETATO — Salvatore)

| Funzionalità | Stato |
|---|---|
| Palette colori ufficiale SMOT | ✅ |
| Graph View (8 componenti React) | ✅ |
| Hooks (useForceGraph, useAnimation, etc.) | ✅ |
| Animazioni CSS catalogate (12 categorie) | ✅ |

### ✅ Installer + CI/CD (COMPLETATO — Michele)

| Funzionalità | Stato |
|---|---|
| Windows (.exe/.msi) + macOS (.dmg) + Linux (.AppImage/.deb) | ✅ |
| Wizard onboarding 5 step | ✅ |
| GitHub Actions CI/CD | ✅ |
| Auto-updater plugin | ✅ |
| GPU detection (OS-specific) | ✅ |

### ⚠️ In Corso — Wave 1 (Piano Team)

| Task | Chi | Stato |
|---|---|---|
| **10 comandi Rust stub → reali** (B1-B10) | Michele | ⏳ Da implementare |
| **4 funzioni database** (D1-D4) | Tommaso | ⏳ Da implementare |
| **6 polish frontend** (F1-F6) | Salvatore | ⏳ Da implementare |
| **4 fix sicurezza** (S1-S4) | Tommaso | ⏳ Da implementare |

> 📋 **Piano completo:** [`.sisyphus/plans/smot-team-plan.md`](.sisyphus/plans/smot-team-plan.md)

---

## 🎨 Palette Colori Ufficiale

| Nome | Hex | Uso |
|---|---|---|
| Navy Scuro | `#0a1a3b` | Sfondo |
| Indaco | `#4338f5` | Gradienti, accenti |
| Viola | `#894df8` | Hover, gradienti |
| Oliva | `#bcc41c` | Highlights, badge |
| Grigio-blu | `#8a9bb5` | Testo secondario |

---

## 🏗️ Stack Tecnologico

| Layer | Tecnologia |
|---|---|
| Framework Desktop | Tauri v2 |
| Frontend | React 19 + TypeScript + Vite |
| Backend | Rust |
| Database | SQLite + FTS5 |
| IA | Ollama (opzionale) |
| Testing | Playwright + Rust test |

---

## 📚 Piani di Lavoro (OpenCode Ready)

| Piano | Per | File | Task |
|---|---|---|---|
| **Team Plan** (master) | Tutti | [`smot-team-plan.md`](.sisyphus/plans/smot-team-plan.md) | 28 |
| **Michele** — Backend Rust | Michele | [`smot-michele-backend.md`](.sisyphus/plans/smot-michele-backend.md) | 11 |
| **Salvatore** — Frontend React | Salvatore | [`smot-salvatore-frontend.md`](.sisyphus/plans/smot-salvatore-frontend.md) | 7 |
| **Tommaso** — DB & Sicurezza | Tommaso | [`smot-tommaso-db-security.md`](.sisyphus/plans/smot-tommaso-db-security.md) | 9 |

> 🚀 Ogni piano si esegue con `/start-work <nome-piano>`

### Piani Completati (archivio)

| Piano | File | Stato |
|---|---|---|
| Installer Implementation | `archive/smot-installer-implementation.md` | ✅ Completato |
| Installer Windows AI | `archive/smot-installer-windows-ai.md` | ✅ Completato |
| Animations & Design | `archive/smot-animations-design.md` | ✅ Completato |
| Gate G2 Persistence | `smot-g2-persistence.md` | ✅ Completato |
| Distribution & Onboarding | `smot-distribution-onboarding.md` | ✅ Completato |

---

## 🔗 Link

- **Repo:** https://github.com/BigBoss133/SMOT-APP
- **Landing:** https://github.com/BigBoss133/SMOT-Landing-page
- **Ollama:** https://ollama.com

---

*SMOT — Il tuo archivio intelligente, sul tuo computer, solo per te.*
