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

## 🌿 Branch Structure

| Branch | Ruolo | Chi Lavora |
|--------|-------|------------|
| `main` | Sviluppo backend + logica | Socio sviluppatore |
| `Animations-and-design` | UI/UX, animazioni, Graph View | TU (designer) |
| `installer` | Installer Windows/macOS/Linux + wizard | Sviluppatore principale |

---

## 📊 Stato Attuale

### ✅ Gate G1 — Scaffold (COMPLETATO)

| Funzionalità | Stato |
|-------------|:---:|
| Tauri v2 + React + TypeScript + Vite | ✅ |
| Dashboard, Upload, Chat, Viewer, Settings | ✅ |
| Navigazione 6 route | ✅ |
| i18n IT/EN | ✅ |
| Test 15/15 passati (100% frontend) | ✅ |

### ✅ Gate G2 — Backend (COMPLETATO)

| Funzionalità | Stato |
|-------------|:---:|
| SQLite database + FTS5 schema | ✅ `db.rs` |
| Parser PDF/DOCX | ✅ `parsers.rs` |
| Migrations e init scripts | ✅ |
| Comandi Tauri integrati | ✅ `lib.rs` |

### ✅ Design System (COMPLETATO)

| Funzionalità | Stato |
|-------------|:---:|
| Palette colori ufficiale SMOT | ✅ |
| Graph View (8 componenti React) | ✅ |
| Hooks (useForceGraph, useAnimation, etc.) | ✅ |
| Animazioni CSS catalogate (12 categorie) | ✅ |

### ⏳ In Corso

| Area | Branch | Stato |
|------|--------|:---:|
| **Installer Windows + Wizard** | `installer` | 📋 Pianificato (21 task) |
| **Ricerca FTS5** | `main` | ⏳ Da implementare |
| **Indicizzazione reale** | `main` | ⏳ Da implementare |
| **Chat RAG con Ollama** | `main` | ⏳ Da implementare |

---

## 📋 Test Results

**Data:** 2026-05-07  
**Risultato:** ✅ **100% pass** (15/15 test)

| # | Test | Stato |
|---|------|:---:|
| 1-15 | Navigation, Upload, Chat, Viewer, Settings, i18n, System Panel | ✅ |

---

## 🎨 Palette Colori Ufficiale

| Nome | Hex | Uso |
|------|-----|-----|
| Navy Scuro | `#0a1a3b` | Sfondo |
| Indaco | `#4338f5` | Gradienti, accenti |
| Viola | `#894df8` | Hover, gradienti |
| Oliva | `#bcc41c` | Highlights, badge |
| Grigio-blu | `#8a9bb5` | Testo secondario |

---

## 🏗️ Stack Tecnologico

| Layer | Tecnologia |
|-------|------------|
| Framework Desktop | Tauri v2 |
| Frontend | React 19 + TypeScript + Vite |
| Backend | Rust |
| Database | SQLite + FTS5 |
| IA | Ollama (opzionale) |
| Testing | Playwright + Rust test |

---

## 📚 Piani Strategici

| Piano | File | Contenuto |
|-------|------|-----------|
| Migrazione v1→v2 | `smot-v2-migration.md` | 20 task, architettura, rischi |
| Gate G2 Persistenza | `smot-g2-persistence.md` | 12 task, SQLite, parser, AI |
| Animazioni & Design | `smot-animations-design.md` | 12 categorie CSS, Graph View plan |
| Distribuzione | `smot-distribution-onboarding.md` | Licensing, onboarding, system detection |
| Installer Windows | `smot-installer-windows-ai.md` | NSIS config, modelli IA, CI/CD |
| Implementazione Installer | `smot-installer-implementation.md` | 21 task, 6 fasi, branch `installer` |

---

## 🔗 Link

- **Repo:** https://github.com/BigBoss133/SMOT-APP
- **Landing:** https://github.com/BigBoss133/SMOT-Landing-page
- **Ollama:** https://ollama.com

---

*SMOT — Il tuo archivio intelligente, sul tuo computer, solo per te.*
