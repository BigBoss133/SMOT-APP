# SMOT — Piano Tommaso (Database + Sicurezza)

> **Team Plan:** `.sisyphus/plans/smot-team-plan.md` | **Repo:** BigBoss133/SMOT-APP
> **🛡️ Guardrails:** Leggere [`GUARDRAILS.md`](../../GUARDRAILS.md) prima di iniziare

## TL;DR

> **Tommaso**: 9 task — 1 cleanup + 4 DB functions + 4 security. ~12h.

---

## 🛡️ Guardrails

| Regola | Dettaglio |
|---|---|
| **Branch** | `feat/nome-task` → PR → review → merge in main |
| **Commit** | `tipo(scope): descrizione` (es. `feat(db): add insert_document function`) |
| **Pre-push** | `cargo test && cargo clippy -- -D warnings` |
| **Pre-push (security)** | `grep -r "sk-\|api_key\|password" . --include="*.rs" --include="*.json"` → DEVE essere vuoto |
| **Aree off-limits** | `ollama.rs`, `setup.rs`, `system_probe.rs`, `auto_config.rs`, `parsers.rs`, schema DB esistente (`migrations/`) |
| **File condivisi** | Avvisare il team prima di toccare `Cargo.toml`, `db.rs` (parti esistenti) |
| **⚠️ Onboarding** | PRIMA di iniziare: leggi `smot-desktop/src-tauri/src/db.rs` e `smot-desktop/src-tauri/migrations/` |
| **SQL** | SOLO prepared statements. MAI concatenare stringhe SQL. |
| **Sicurezza** | Ogni funzione deve validare input. Nessun secret in chiaro. |

> 📖 Tutte le regole: [`GUARDRAILS.md`](../../GUARDRAILS.md)

---

## Wave 0 — Prep & Cleanup (immediato)

- [ ] C3. Archiviare piani .sisyphus obsoleti + aggiornare README

  **What to do**:
  - Spostare in `.sisyphus/plans/archive/`: `smot-installer-implementation.md`, `smot-installer-windows-ai.md`, `smot-animations-design.md`
  - Aggiornare `README.md`: sezione "Stato Attuale" → marcare installer come ✅ completato
  - Aggiungere link a `smot-team-plan.md` nel README

  **QA**: `ls .sisyphus/plans/archive/` → contiene i 3 piani | `grep "✅" README.md` → installer completato

---

## Wave 1 — Database Functions (MAX PARALLEL con Michele B1-B2-B7)

**Schema di riferimento:** `smot-desktop/src-tauri/migrations/001_initial.sql`
```sql
documents(id TEXT PK, filename TEXT, file_type TEXT, size_bytes INTEGER, uploaded_at TEXT, indexed INTEGER DEFAULT 0)
documents_fts(id, filename, content) -- FTS5 virtual table
```

- [ ] D1. `insert_document()` in `db.rs`

  **What to do**:
  - Leggere `smot-desktop/src-tauri/src/db.rs` per capire lo schema esistente
  - Funzione: `pub fn insert_document(conn: &Connection, filename: &str, file_type: &str, size_bytes: i64) -> Result<String, AppError>`
  - UUID via `uuid::Uuid::new_v4()`, timestamp via `chrono::Utc::now()`
  - SQL: `INSERT INTO documents (id, filename, file_type, size_bytes, uploaded_at, indexed) VALUES (?1, ?2, ?3, ?4, ?5, 0)`

  **QA**: `cargo test insert_document` → documento inserito con UUID valido

- [ ] D2. `get_all_documents()` in `db.rs`

  **What to do**:
  - Struct `Document` con campi: `id, filename, file_type, size_bytes, uploaded_at, indexed`
  - Funzione: `pub fn get_all_documents(conn: &Connection) -> Result<Vec<Document>, AppError>`
  - SQL: `SELECT id, filename, file_type, size_bytes, uploaded_at, indexed FROM documents ORDER BY uploaded_at DESC`

  **QA**: `cargo test get_all_documents` → array di Document ordinato per data

- [ ] D3. `update_indexing_status()` in `db.rs`

  **What to do**:
  - Funzione: `pub fn update_indexing_status(conn: &Connection, doc_id: &str, indexed: bool) -> Result<(), AppError>`
  - SQL: `UPDATE documents SET indexed = ?1 WHERE id = ?2`

  **QA**: `cargo test update_indexing_status` → flag indexed cambiato nel DB

- [ ] D4. `search_fts5()` in `db.rs`

  **What to do**:
  - Struct `SearchResult` con `filename`, `snippet`, `doc_id`
  - Funzione: `pub fn search_fts5(conn: &Connection, query: &str) -> Result<Vec<SearchResult>, AppError>`
  - SQL: `SELECT filename, snippet(documents_fts, 0, '<mark>', '</mark>', '...', 30), id FROM documents_fts WHERE documents_fts MATCH ?1 ORDER BY rank LIMIT 10`

  **QA**: `cargo test search_fts5` → risultati con snippet HTML e highlighting

---

## Wave 2 — Security (parallelo con Michele B3-B10, Salvatore F4-F6)

- [ ] S1. Validazione input comandi Tauri

  **What to do**:
  - In `lib.rs`, aggiungere validazione pre-esecuzione per ogni comando:
    - `chat_query`: query non vuota, max 1000 char
    - `upload_documents`: filename non vuoto, no `../`
    - `get_viewer_page`: doc_id UUID valido
    - `pull_ollama_model`: solo `[a-zA-Z0-9:._-]`
  - Restituire `Err("Invalid input: ...")` con messaggio descrittivo

- [ ] S2. Rate limiting chiamate Ollama

  **What to do**:
  - In `ollama.rs`, aggiungere rate limiter: max 5 richieste/sec
  - Implementazione: `Arc<Mutex<Vec<Instant>>>` + cleanup periodico
  - Se superato: errore "Rate limit exceeded, retry after X seconds"
  - Applicare a `pull_ollama_model` e `chat_query`

- [ ] S3. Sanitizzazione filename upload

  **What to do**:
  - In `upload_documents`, sanitizzare filename:
    - Rimuovere `<>:"/\|?*`
    - Troncare a max 255 char
    - Bloccare nomi riservati Windows: `CON, PRN, AUX, NUL, COM1-9, LPT1-9`
  - Salvare con UUID interno, nome originale nei metadata

- [ ] S4. Pulizia dati sensibili in config

  **What to do**:
  - Audit `tauri.conf.json`: nessuna API key/secret in chiaro
  - Verificare `.gitignore` copra `.env`, `*.pem`, `*.key`
  - Se secrets presenti, migrare a variabili d'ambiente

---

## Pre-Push Checklist

```bash
cd smot-desktop/src-tauri
cargo test
grep -r "sk-\|api_key\|password\|secret" . --include="*.rs" --include="*.json"  # DEVE essere vuoto
```

## Success Criteria

```bash
cd smot-desktop/src-tauri && cargo test  # tutti i test passano
```
