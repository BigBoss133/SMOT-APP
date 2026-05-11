# SMOT — Piano Tommaso (Database + Sicurezza)

> **Team Plan:** `.sisyphus/plans/smot-team-plan.md` | **Repo:** BigBoss133/SMOT-APP
> **🛡️ Guardrails:** Leggere [`GUARDRAILS.md`](../../GUARDRAILS.md) prima di iniziare

## TL;DR

> **Tommaso**: 9 task — 1 cleanup + 4 DB functions (refactoring) + 4 security. ~12h.

---

## 🛡️ Guardrails

| Regola | Dettaglio |
|---|---|
| **Branch** | `feat/nome-task` → PR → review → merge in main |
| **Commit** | `tipo(scope): descrizione` (es. `feat(db): add insert_document function`) |
| **Pre-push** | `cargo test && cargo clippy -- -D warnings` |
| **Pre-push (security)** | `grep -r "sk-\|api_key\|password" . --include="*.rs" --include="*.json"` → DEVE essere vuoto |
| **Aree off-limits** | `ollama.rs`, `setup.rs`, `system_probe.rs`, `auto_config.rs`, `parsers.rs`, `indexing.rs` |
| **⚠️ Onboarding** | PRIMA di iniziare: leggi `smot-desktop/src-tauri/src/db.rs` e `smot-desktop/src-tauri/src/lib.rs` |
| **SQL** | SOLO prepared statements. MAI concatenare stringhe SQL. |
| **Sicurezza** | Ogni funzione deve validare input. Nessun secret in chiaro. |

> 📖 Tutte le regole: [`GUARDRAILS.md`](../../GUARDRAILS.md)

---

## ⚠️ Stato Preliminare

**Michele ha già implementato i 10 comandi backend**, inclusa la logica DB inline nei comandi Tauri. 

Il tuo compito per D1-D4 è **estrarre** le query SQL da `lib.rs` in funzioni dedicate in `db.rs`.

| Task | Stato attuale | Cosa fare |
|---|---|---|
| D1 | `INSERT INTO documents` inline in `upload_documents` (B3) | Estrarre in `db::insert_document()` |
| D2 | `SELECT FROM documents` inline in `get_documents` (B2) | Estrarre in `db::get_all_documents()` |
| D3 | `UPDATE documents SET indexed` inline in `indexing.rs` (B4) | Estrarre in `db::update_indexing_status()` |
| D4 | `SELECT FROM fts_documents` inline in `chat_query` (B6) | Estrarre in `db::search_fts5()` |

---

## Wave 0 — Prep & Cleanup (immediato)

- [ ] C3. Archiviare piani .sisyphus obsoleti + aggiornare README

  **What to do**:
  - Spostare in `.sisyphus/plans/archive/`: `smot-installer-implementation.md`, `smot-installer-windows-ai.md`, `smot-animations-design.md`
  - README già aggiornato — verificare che sia OK

  **QA**: `ls .sisyphus/plans/archive/` → contiene i 3 piani

  **Commit**: `docs: archive obsolete plans`

---

## Wave 1 — Database Functions (da estrarre da lib.rs)

**Schema di riferimento:** `smot-desktop/src-tauri/migrations/001_initial.sql`
```sql
documents(id TEXT PK, name TEXT, path TEXT, category TEXT, file_type TEXT, size_bytes INTEGER, indexed INTEGER DEFAULT 0, created_at DATETIME)
document_chunks(id TEXT PK, document_id TEXT, content TEXT, chunk_index INTEGER)
fts_documents(content) -- FTS5 on document_chunks.content
embeddings(id TEXT PK, chunk_id TEXT, vector BLOB)
```

**Per ogni task D1-D4**:
1. Leggi la funzione **inline attuale** in `lib.rs` (usa `grep` per trovarla)
2. Crea la funzione in `db.rs`
3. Aggiorna `lib.rs` per chiamare `db::function_name()` invece di SQL inline
4. Verifica con LSP diagnostics

---

- [ ] D1. `insert_document()` — da estrarre da `upload_documents` in `lib.rs`

  **Where**: Sostituire il `db.execute("INSERT INTO documents...")` con chiamata a `db::insert_document()`

  **QA**: `cargo build` — compila senza errori

  **Commit**: `refactor(db): extract insert_document function from upload_documents`

- [ ] D2. `get_all_documents()` — da estrarre da `get_documents` in `lib.rs`

  **Where**: Sostituire la `db.prepare("SELECT id, name...")` con chiamata a `db::get_all_documents()`

  **QA**: `cargo build` — compila senza errori

  **Commit**: `refactor(db): extract get_all_documents function from get_documents`

- [ ] D3. `update_indexing_status()` — da estrarre da `indexing.rs`

  **Where**: Sostituire la `db.execute("UPDATE documents SET indexed...")` in `indexing.rs` con chiamata a `db::update_indexing_status()`

  **QA**: `cargo build` — compila senza errori

  **Commit**: `refactor(db): extract update_indexing_status function from indexing module`

- [ ] D4. `search_fts5()` — da estrarre da `chat_query` in `lib.rs`

  **Where**: Sostituire la query FTS5 inline con chiamata a `db::search_fts5()`

  **QA**: `cargo build` — compila senza errori

  **Commit**: `refactor(db): extract search_fts5 function from chat_query`

---

## Wave 2 — Security (implementazione nuova)

- [ ] S1. Validazione input comandi Tauri

  **What to do**:
  - In `lib.rs`, aggiungere validazione pre-esecuzione per ogni comando:
    - `chat_query`: query non vuota, max 1000 char
    - `upload_documents`: filename non vuoto, no `../`
    - `get_viewer_page`: doc_id UUID valido
    - `pull_ollama_model`: solo `[a-zA-Z0-9:._-]`
  - Restituire `Err("Invalid input: ...")` con messaggio descrittivo

  **QA**: `cargo test` — input malevolo bloccato, input valido accettato

  **Commit**: `feat(security): add input validation to all Tauri commands`

- [ ] S2. Rate limiting chiamate Ollama

  **What to do**:
  - In `ollama.rs`, aggiungere rate limiter: max 5 richieste/sec
  - Implementazione: `Arc<Mutex<Vec<Instant>>>` + cleanup periodico
  - Se superato: errore "Rate limit exceeded, retry after X seconds"
  - Applicare a `pull_ollama_model` e `chat_query`

  **QA**: `cargo test` — 10 richieste in <1s → prime 5 ok, ultime 5 bloccate

  **Commit**: `feat(security): add rate limiting to Ollama calls (5 req/sec)`

- [ ] S3. Sanitizzazione filename upload

  **What to do**:
  - In `upload_documents`, sanitizzare filename:
    - Rimuovere `<>:\"/\\|?*`
    - Troncare a max 255 char
    - Bloccare nomi riservati Windows: `CON, PRN, AUX, NUL, COM1-9, LPT1-9`
  - Salvare con UUID interno, nome originale nei metadata

  **QA**: `cargo test` — path traversal bloccato, nomi riservati rinominati

  **Commit**: `feat(security): sanitize upload filenames`

- [ ] S4. Pulizia dati sensibili in config

  **What to do**:
  - Audit `tauri.conf.json`: nessuna API key/secret in chiaro
  - Verificare `.gitignore` copra `.env`, `*.pem`, `*.key`
  - Se secrets presenti, migrare a variabili d'ambiente

  **QA**: `grep -r "sk-\|api_key\|password\|secret" smot-desktop/src-tauri/tauri.conf.json` → nessun match

  **Commit**: `feat(security): audit config for secrets`

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
grep -c "db::insert_document\|db::get_all_documents\|db::update_indexing_status\|db::search_fts5" src/lib.rs src/indexing.rs  # Expected: >0 (chiamate a db.rs)
```