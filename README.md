# SMOT — Smart Archive Desktop

> Archivio documentale intelligente 100% offline con IA locale opzionale

## Cos'e' SMOT

SMOT e' un'applicazione **desktop nativa** per l'archiviazione e la consultazione intelligente di documenti. Funziona completamente offline sul tuo computer, senza cloud, senza telemetria, senza inviare dati all'esterno.

### Caratteristiche Principali

- Carica documenti — PDF, DOCX, TXT, XLSX, immagini (OCR)
- Ricerca full-text — FTS5 per ricerca immediata
- Chat RAG — Interroga i tuoi documenti in linguaggio naturale (Ollama)
- IA Locale — Funziona con Ollama (opzionale, privato, sul tuo PC)
- Graph View — Visualizzazione connessioni tra documenti
- Bilingue — Interfaccia in Italiano e Inglese
- Cross-Platform — Windows (.exe/.msi), macOS (.dmg), Linux (.AppImage/.deb)
- 100% Offline — Nessun dato lascia mai il tuo computer

---

## Team

| Sviluppatore | Ruolo | Area |
|---|---|---|
| **Michele** (BigBoss133) | Backend Rust + Infrastruttura | 10 comandi Tauri, CI/CD, Installer |
| **Salvatore** (salvograsso10) | Frontend React + UI/UX | Animazioni, Graph View, ErrorBoundary, Skeleton, Toast |
| **Tommaso** | Backend + Database + Sicurezza | Funzioni SQLite, Security hardening |

> Tutti usiamo **OpenCode** con Sisyphus per l'esecuzione automatica dei task.

---

## Stato Attuale

### Backend — COMPLETATO (Michele)

| Comando | Stato |
|---|---|
| `get_system_status` — sysinfo reale | ✅ |
| `get_documents` — SQLite reale | ✅ |
| `upload_documents` — file copy + DB | ✅ |
| `start_indexing` — chunking + Ollama embeddings | ✅ |
| `get_indexing_status` — progresso reale | ✅ |
| `chat_query` — FTS5 + Ollama RAG | ✅ |
| `get_viewer_page` — file reader + parsers | ✅ |
| Indexing controls (pause/resume/background) | ✅ |

### Frontend — COMPLETATO (Salvatore)

| Feature | Stato |
|---|---|
| ErrorBoundary | ✅ |
| Loading skeletons (Dashboard, Chat, Viewer) | ✅ |
| Empty states | ✅ |
| Confirm dialog (azioni distruttive) | ✅ |
| Toast notifications | ✅ |
| Real-time indexing progress | ✅ |

### Release Beta (Venerdi')

| Task | Chi | Stato |
|---|---|---|
| Generare chiave Tauri updater | Michele | ⏳ |
| Aggiornare versione a 0.1.0-beta | Michele | ⏳ |
| Verificare asset installer | Salvatore | ⏳ |
| Verificare wizard onboarding | Salvatore | ⏳ |
| CI review + security check | Tommaso | ⏳ |
| Test build + tag | Team | ⏳ |

---

## Piani di Lavoro (OpenCode Ready)

| Piano | Per | Task |
|---|---|---|
| **[Release Beta](.sisyphus/plans/smot-release-beta.md)** | Team | 12 task per v0.1.0-beta |
| **[Team Plan](.sisyphus/plans/smot-team-plan.md)** | Tutti | 28 task (master) |
| **[Michele](.sisyphus/plans/smot-michele-backend.md)** | Backend | 10 Rust reali |
| **[Salvatore](.sisyphus/plans/smot-salvatore-frontend.md)** | Frontend | 7 componenti |
| **[Tommaso](.sisyphus/plans/smot-tommaso-db-security.md)** | DB & Security | 9 refactoring/security |

---

## Stack Tecnologico

| Layer | Tecnologia |
|---|---|
| Framework Desktop | Tauri v2 |
| Frontend | React 19 + TypeScript + Vite |
| Backend | Rust |
| Database | SQLite + FTS5 |
| IA | Ollama (opzionale) |
| CI/CD | GitHub Actions (Windows/macOS/Linux) |
| Installer | NSIS (Windows), DMG (macOS), AppImage (Linux) |

---

## Link

- **Repo:** https://github.com/BigBoss133/SMOT-APP
- **Landing:** https://github.com/BigBoss133/SMOT-Landing-page
- **Piano Release:** [`.sisyphus/plans/smot-release-beta.md`](.sisyphus/plans/smot-release-beta.md)

---

*SMOT — Il tuo archivio intelligente, sul tuo computer, solo per te.*
