# SMOT — Piano Tommaso (Database + Sicurezza)

> **Team Plan:** `.sisyphus/plans/smot-team-plan.md` | **Repo:** BigBoss133/SMOT-APP
> **🛡️ Guardrails:** Leggere [`GUARDRAILS.md`](../../GUARDRAILS.md) prima di iniziare

## TL;DR

> **Tommaso**: 9 task — 0 completati ⏳. Refactoring DB + security hardening.

---

## 🛡️ Guardrails

| Regola | Dettaglio |
|---|---|
| **Branch** | `feat/nome-task` → PR → review → merge in main |
| **Pre-push** | `cargo test && cargo clippy -- -D warnings` |
| **Aree off-limits** | `ollama.rs`, `indexing.rs`, `parsers.rs`, `system_probe.rs`, `auto_config.rs` |
| **⚠️ Primo step** | Leggi `smot-desktop/src-tauri/src/db.rs` e `smot-desktop/src-tauri/migrations/001_initial.sql` |
| **SQL** | SOLO prepared statements. MAI concatenare stringhe. |

> 📖 Regole complete: [`GUARDRAILS.md`](../../GUARDRAILS.md)

---

## ⚠️ Contesto

**Michele ha già implementato i 10 comandi backend.** La logica DB è inline nei comandi Tauri.

Il tuo compito è **estrarre** le query SQL in funzioni `db.rs` dedicate (refactoring).

| Task | Query inline attuale | Dove si trova |
|------|---------------------|---------------|
| D1 | `INSERT INTO documents` | `lib.rs` → `upload_documents` (line ~290) |
| D2 | `SELECT FROM documents` | `lib.rs` → `get_documents` (line ~220) |
| D3 | `UPDATE documents SET indexed` | `indexing.rs` (line ~350) |
| D4 | `SELECT FROM fts_documents` | `lib.rs` → `chat_query` (line ~398) |

---

## Wave 0 — Prep

- [ ] C3. Archiviare piani obsoleti in `.sisyphus/plans/archive/`

  **QA**: `ls .sisyphus/plans/archive/` → contiene i piani archiviati

---

## Wave 1 — Refactoring DB

**Schema:** `smot-desktop/src-tauri/migrations/001_initial.sql`

```sql
documents(id TEXT PK, name TEXT, path TEXT, category TEXT, file_type TEXT, size_bytes INTEGER, indexed INTEGER DEFAULT 0, created_at DATETIME)
document_chunks(id TEXT PK, document_id TEXT REFERENCES documents, content TEXT, chunk_index INTEGER)
fts_documents(content) -- FTS5
embeddings(id TEXT PK, chunk_id TEXT REFERENCES document_chunks, vector BLOB)
```

- [ ] **D1**: `insert_document()` — estrarre da `upload_documents`
  - Leggere la funzione in `lib.rs`, creare `db::insert_document()`
  - Sostituire la query inline con chiamata a `db::insert_document()`

- [ ] **D2**: `get_all_documents()` — estrarre da `get_documents`
  - Leggere la funzione in `lib.rs`, creare `db::get_all_documents()` + struct `Document`
  - Sostituire la query inline con chiamata a `db::get_all_documents()`

- [ ] **D3**: `update_indexing_status()` — estrarre da `indexing.rs`
  - Leggere la funzione in `indexing.rs`, creare `db::update_indexing_status()`
  - Sostituire la query inline con chiamata a `db::update_indexing_status()`

- [ ] **D4**: `search_fts5()` — estrarre da `chat_query`
  - Leggere la funzione in `lib.rs`, creare `db::search_fts5()` + struct `SearchResult`
  - Sostituire la query inline con chiamata a `db::search_fts5()`

---

## Wave 2 — Security

- [ ] **S1**: Input validation su tutti i comandi Tauri
  - `chat_query`: non vuota, max 1000 char
  - `upload_documents`: no `../`, filename valido
  - `get_viewer_page`: doc_id UUID valido
  - `pull_ollama_model`: solo `[a-zA-Z0-9:._-]`

- [ ] **S2**: Rate limiting Ollama — max 5 richieste/sec
  - In `ollama.rs`, `Arc<Mutex<Vec<Instant>>>`

- [ ] **S3**: Sanitizzazione filename upload
  - Rimuovere `<>:"/\|?*`, troncare 255 char, bloccare `CON, PRN, AUX, NUL`

- [ ] **S4**: Audit secrets in `tauri.conf.json`
  - `grep -r "sk-\|api_key\|password"` → deve essere vuoto

---

## Pre-Push

```bash
cd smot-desktop/src-tauri
cargo test && cargo clippy -- -D warnings
grep -r "sk-\|api_key\|password" . --include="*.rs" --include="*.json"  # vuoto
```

---

> 📋 Per iniziare: `/start-work smot-tommaso-db-security`