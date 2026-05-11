# SMOT — Piano Tommaso (Database + Sicurezza)

> **Team Plan:** `.sisyphus/plans/smot-team-plan.md` | **Repo:** BigBoss133/SMOT-APP
> **🛡️ Guardrails:** Leggere [`GUARDRAILS.md`](../../GUARDRAILS.md) prima di iniziare

## TL;DR

> **Tommaso**: 9 task — 9 completati ✅. Refactoring DB + security hardening. **COMPLETATO 11 Maggio 2026.**

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

- [x] C3. Archiviare piani obsoleti in `.sisyphus/plans/archive/`

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

- [x] **D1**: `insert_document()` — estrarre da `upload_documents`
  - Letto `lib.rs`, creata `db::insert_document()` con 8 parametri + `#[allow(clippy::too_many_arguments)]`
  - Sostituita la query inline con `db::insert_document()`

- [x] **D2**: `get_all_documents()` — estrarre da `get_documents`
  - Letto `lib.rs`, creata `db::get_all_documents()` + struct `DocumentRow`
  - Sostituita la query inline con `db::get_all_documents()`

- [x] **D3**: `update_indexing_status()` — estrarre da `indexing.rs`
  - Letto `indexing.rs`, creata `db::update_indexing_status()`
  - Sostituite entrambe le query inline con `crate::db::update_indexing_status()`

- [x] **D4**: `search_fts5()` — estrarre da `chat_query`
  - Letto `lib.rs`, creata `db::search_fts5()` + struct `FtsResult`
  - Sostituita la query FTS5 inline con `db::search_fts5()`

---

## Wave 2 — Security ✅

- [x] **S1**: Input validation su tutti i comandi Tauri
  - ✅ `chat_query`: non vuota, max 1000 char
  - ✅ `upload_documents`: no `../`, filename valido
  - ✅ `get_viewer_page`: doc_id UUID valido
  - ✅ `pull_ollama_model`: solo `[a-zA-Z0-9:._-]`

- [x] **S2**: Rate limiting Ollama — max 5 richieste/sec
  - ✅ In `ollama.rs`, `Mutex<Vec<Instant>>` con cleanup + `pub fn check_rate_limit()`

- [x] **S3**: Sanitizzazione filename upload
  - ✅ `sanitize_filename()`: rimuove `<>:"/\|?*`, tronca a 255 char
  - ✅ `is_reserved_windows_name()`: blocca `CON, PRN, AUX, NUL, COM1-9, LPT1-9`

- [x] **S4**: Audit secrets in `tauri.conf.json`
  - ✅ `grep -r "sk-\|api_key\|password"` → vuoto (0 secrets)

---

## Pre-Push

```bash
cd smot-desktop/src-tauri
cargo test && cargo clippy -- -D warnings
grep -r "sk-\|api_key\|password" . --include="*.rs" --include="*.json"  # vuoto
```

---

> 📋 **PIANO COMPLETATO** — 11 Maggio 2026. Tutti i 9 task eseguiti e push-ati su `main`.