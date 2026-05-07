# PRD — SMOT Smart Archive (Pivot Desktop Nativo)

## Problema originale (aggiornato)
Realizzare **SMOT** come applicazione **desktop 100% offline** con archiviazione documentale intelligente e RAG locale.

Pivot confermato:
- Da stack web legacy (**FastAPI + CRA**) a stack desktop nativo:
  - **Tauri v2 (Rust)**
  - **React + TypeScript + Vite**
  - **SQLite (rusqlite + FTS5)**
  - **Ollama locale**

## Scelte utente confermate
1. Procedere subito con migrazione Gate G1
2. Nuovo workspace Tauri separato in `/app/smot-desktop`
3. Mantenere legacy code come riferimento temporaneo
4. Porting rapido UI (funzionalità prima, hardening dopo)
5. Risposte e interfaccia in italiano/inglese

## Architettura target
```
/app/smot-desktop
├── src/                  # React TS + routing + UI SMOT
├── src/services/api.ts   # invoke Tauri + fallback browser/mock
└── src-tauri/            # Rust commands Tauri v2
```

Legacy (obsoleto ma mantenuto):
- `/app/frontend` (CRA)
- `/app/backend` (FastAPI)

## Implementato in questa iterazione (2026-05-07)
### Gate G1 completato
- Scaffold completo Tauri v2 in `/app/smot-desktop`
  - Vite React TS inizializzato
  - `@tauri-apps/cli` e `@tauri-apps/api` configurati
  - `tauri.conf.json` aggiornato (finestra desktop, identifier dedicato)
  - `vite.config.ts` allineato a porta 1420 per dev Tauri

- Migrazione UI dal legacy CRA a React TS (nuovo progetto)
  - Routing migrato: `/`, `/upload`, `/indexing/:jobId`, `/chat`, `/viewer`, `/viewer/:documentId`, `/settings`
  - Componenti migrati: sidebar, panel sistema, status bar, selector modalità
  - i18n IT/EN migrato
  - Stili SMOT migrati in `src/index.css`
  - `data-testid` mantenuti su elementi critici/interattivi

- Integrazione Tauri base
  - Comandi Rust mock in `src-tauri/src/lib.rs` per flussi principali UI
  - Service layer `src/services/api.ts` con:
    - tentativo `invoke(...)` in runtime Tauri
    - fallback browser/mock per sviluppo Vite puro

### Aggiornamento UI Palette (2026-05-07)
- Applicata la palette ufficiale da `.sisyphus/plans/smot-g2-persistence.md` (branch `conflict_070526_1255`) in `smot-desktop/src/index.css`.
- Colori brand allineati:
  - Navy `#0a1a3b`
  - Indaco `#4338f5`
  - Viola `#894df8`
  - Highlight oliva `#bcc41c`
  - Testo secondario grigio-blu `#8a9bb5`
- Aggiunte variabili CSS ufficiali (`--color-*`, `--gradient-primary`, `--gradient-bg`) senza modifiche a layout/logica.

### Avanzamento Piano `main/.sisyphus/plans/smot-v2-migration.md` (2026-05-07)
- Piano analizzato da branch `main` (via raw GitHub).
- Stato task principali:
  - ✅ **T1 Setup Tauri + Vite**: completato
  - ✅ **T4 Porting UI React**: completato
  - 🟡 **T13 UI integrazione Tauri API**: parziale (invoke + fallback browser, flussi ancora MOCKED)
  - ✅ **T2 Schema SQLite**: completato in `src-tauri/migrations/001_initial.sql`
  - ✅ **T3 Rust + SQLite dependencies/init**: completato (`rusqlite` + `src-tauri/src/db.rs` + init DB in startup)
  - ⏳ **T5–T12, T14–T20**: non ancora implementati

### Implementazione tecnica T2/T3
- Aggiunta dipendenza `rusqlite` (`Cargo.toml`, feature `bundled`).
- Creati script schema:
  - `src-tauri/migrations/001_initial.sql`
  - `src-tauri/scripts/init_db.sql`
- Creato modulo `src-tauri/src/db.rs`:
  - risoluzione path DB in `app_data_dir()`
  - creazione cartella dati
  - init schema su `smot.db`
- Hook startup in `src-tauri/src/lib.rs` (`setup`) con inizializzazione SQLite e log path DB.

### Qualità e test
- `yarn lint` ✅
- `yarn build` ✅
- Smoke screenshot UI su `http://127.0.0.1:1420` ✅
- Testing agent report: `/app/test_reports/iteration_2.json` → **100% frontend pass** ✅
- Verifica palette con `auto_frontend_testing_agent` ✅ (nessuna regressione funzionale)
- Smoke post T2/T3 + `auto_frontend_testing_agent` ✅ (nessuna regressione UI)

Nota ambiente:
- `cargo` non disponibile nel container corrente (impossibile `cargo check` qui).

## Stato integrazioni
- Ollama: non ancora integrato (step successivo Gate G3)
- SQLite reale: non ancora integrato (step successivo Gate G1 T2/T3)

## MOCKED (attuale)
Flussi attualmente **MOCKED** per consentire migrazione UI end-to-end:
- System status
- Lista documenti
- Upload/start indexing/status/pause/resume/background
- Chat response con fonti
- Viewer page text/highlights
- Mode read/update

## Backlog prioritizzato
### P0 (prossimi step immediati)
1. Schema SQLite reale in Rust (`documents`, `document_chunks`, `fts_documents`, `embeddings`)
2. Modulo `rusqlite` + init DB locale e migrazioni base
3. Upload reale file tramite dialog Tauri + persistenza metadata su SQLite
4. Indicizzazione reale: estrazione testo, chunking, FTS5
5. Sostituzione definitiva fallback mock con dati persistenti

### P1
1. Rilevazione robusta Ollama all’avvio + fallback UI
2. Embeddings locali + risposta RAG con citazioni reali
3. Gestione errori UX più dettagliata per ogni flusso

### P2
1. Hybrid search (`sqlite-vec`)
2. Ottimizzazioni performance (liste virtualizzate)
3. CI/CD packaging desktop

## Note operative
- Il file richiesto `smotv2-migration*.md` non è presente nel repository corrente.
- Fonte di verità attuale: questo PRD + handoff + report test.

