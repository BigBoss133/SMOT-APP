# SMOT — Smart Archive Desktop

> Archivio documentale intelligente 100% offline con IA locale opzionale

## 🎯 Cos'è SMOT

SMOT è un'applicazione **desktop nativa** per l'archiviazione e la consultazione intelligente di documenti. Funziona completamente offline sul tuo computer, senza cloud, senza telemetria.

- 📄 **Carica documenti** — PDF, DOCX, TXT, XLSX
- 🔍 **Ricerca full-text** — FTS5 immediata
- 💬 **Chat RAG** — Ollama + ricerca contestuale
- 🧠 **IA Locale** — Opzionale, privata, sul tuo PC
- 🕸️ **Graph View** — Connessioni tra documenti
- 🌐 **Bilingue** — Italiano / English
- 💻 **Cross-Platform** — Windows, macOS, Linux
- 🔒 **100% Offline** — Zero telemetria

---

## 👥 Team

| Sviluppatore | GitHub | Ruolo | Completato |
|---|---|---|---|
| **Michele** | BigBoss133 | Backend Rust + Release | ✅ Tutti i task |
| **Salvatore** | salvograsso10 | Frontend React + UI/UX | ✅ Componenti, ⏳ Fix wizard |
| **Tommaso** | — | Database + Sicurezza | ⏳ Da iniziare |

> Tutti usiamo **OpenCode** con Sisyphus.

---

## 🌿 Branch Attivi

| Branch | Stato |
|---|---|
| `main` | 🟢 Sviluppo attivo |
| `release/v0.1.0-beta` | 🟢 Release beta |
| `docs/install-guides` | 🟢 Guide installazione per OS |
| `backup/pre-cleanup` | 📌 Tag di backup (11 Maggio) |

---

## 📊 Stato Attuale

### ✅ Michele — Backend Rust (COMPLETATO)

| Task | Stato | Commit |
|------|:-----:|--------|
| Cleanup file obsoleti | ✅ | `80a60cf` |
| REPO-ANALYSIS.md aggiornato | ✅ | `f6b3400` |
| `get_system_status` con sysinfo + SQLite | ✅ | `36dbba9` |
| `get_documents` da DB reale | ✅ | `2c669c8` |
| `upload_documents` file copy + insert | ✅ | `e3505e4` |
| `start_indexing` pipeline (indexing.rs) | ✅ | `80cf0f4` |
| `get_indexing_status` controller state | ✅ | `80cf0f4` |
| `chat_query` FTS5 + Ollama RAG | ✅ | `0848d5b` |
| `get_viewer_page` reader + parsers | ✅ | `b8ae765` |
| Indexing controls (pause/resume/background) | ✅ | `80cf0f4` |
| Branch release + chiave updater | ✅ | `878b401` |
| Fix onboarding setup.rs | ✅ | `83d5ea3` |
| Fix Apple Silicon detection | ✅ | `83d5ea3` |

### ✅ Salvatore — Frontend React

| Task | Stato |
|------|:-----:|
| C2: Eliminati backend/frontend/test_reports | ✅ |
| F1: ErrorBoundary in App.tsx | ✅ |
| F2: Loading skeletons (Dashboard, Chat, Viewer) | ✅ |
| F3: Empty states | ✅ |
| F4: ConfirmDialog (azioni distruttive) | ✅ |
| F5: Toast notifications | ✅ |
| F6: Real-time indexing progress listener | ✅ |
| **FIX-4**: Wizard full-screen (nascondere sidebar) | ⏳ |
| **FIX-5**: OnboardingPage chiama complete_onboarding | ⏳ |
| **FIX-6**: SystemDiscoveryStep Apple Silicon | ⏳ |

### ⏳ Tommaso — Database + Sicurezza

| Task | Stato | Note |
|------|:-----:|------|
| C3: Archiviare piani obsoleti | ⏳ | README già aggiornato |
| D1-D4: Estrarre funzioni in db.rs | ⏳ | SQL già implementato inline |
| S1: Input validation comandi Tauri | ⏳ | |
| S2: Rate limiting Ollama | ⏳ | |
| S3: Sanitizzazione filename upload | ⏳ | |
| S4: Pulizia dati sensibili config | ⏳ | |

---

## 🚀 Piani di Lavoro (OpenCode Ready)

| Piano | Per | File | Task |
|---|---|---|---|
| **Team Plan** | Tutti | `smot-team-plan.md` | 28 totali |
| **Michele** | Backend | `smot-michele-backend.md` | ✅ 13/13 ⭐ COMPLETATO |
| **Salvatore** | Frontend | `smot-salvatore-frontend.md` | ✅ 7/7 + ⏳ 3/3 |
| **Tommaso** | DB & Sicurezza | `smot-tommaso-db-security.md` | 0/9 |
| **Installer Fix** | Tutti | `smot-installer-fix.md` | 3/8 |
| **Release Beta** | Team | `smot-release-beta.md` | 5/12 |

> Tutti i piani sono in `.sisyphus/plans/` — esegui con `/start-work <nome-piano>`

---

## 🏗️ Stack

| Layer | Tecnologia |
|---|---|
| Desktop | Tauri v2 |
| Frontend | React 19 + TypeScript + Vite |
| Backend | Rust + sysinfo + rusqlite |
| DB | SQLite + FTS5 |
| IA | Ollama (opzionale) |
| CI/CD | GitHub Actions |

---

**Repo:** https://github.com/BigBoss133/SMOT-APP
**Piani:** `.sisyphus/plans/`
**Audit:** `AUDIT-REPORT.md`
**Guide OS:** `INSTALL.md` (branch `docs/install-guides`)