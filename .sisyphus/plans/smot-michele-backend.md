# SMOT — Piano Michele (Backend Rust)

> **Team Plan:** `.sisyphus/plans/smot-team-plan.md` | **Repo:** BigBoss133/SMOT-APP

## TL;DR

> **Michele**: 11 task — 10 stub Rust → reali + 2 documentazione. ~19h.
> **Obiettivo**: Trasformare tutti i comandi Tauri da dati finti a implementazioni reali con SQLite e Ollama.

---

## Wave 0 — Cleanup (immediato)

- [ ] C1. Eliminare file obsoleti nella root

  **What to do**: Eliminare `CODE-REVIEW-FIXES.md`, `installer-status.md`, `test_result.md`.
  
  **QA**: `ls CODE-REVIEW-FIXES.md 2>&1` → "No such file"
  
  **Commit**: `chore: remove obsolete root files`

- [ ] C4. Aggiornare REPO-ANALYSIS.md

  **What to do**: Aggiornare stato branch, marcare fix come completati, linkare a smot-team-plan.md.
  
  **QA**: `grep "smot-team-plan" REPO-ANALYSIS.md` → trovato
  
  **Commit**: `docs: update REPO-ANALYSIS.md`

---

## Wave 1 — Backend Base (parallelo con Tommaso D1-D4)

- [ ] B1. `get_system_status` reale (sysinfo)

  **What to do**:
  - File: `smot-desktop/src-tauri/src/lib.rs` — sostituire valori hardcoded
  - Usare crate `sysinfo` per CPU, RAM, disco
  - Query SQL: `COUNT(*) FROM documents`, `WHERE indexed = 1`
  - Restituire `{ cpu_usage, memory_usage, disk_usage, ollama_status, documents_count, indexed_count }`

  **Must NOT do**: NON cambiare firma del comando

  **QA**: `cargo build` + verificare valori non più hardcoded (cpu != 21 fisso)

  **Commit**: `feat(backend): implement real get_system_status with sysinfo`

- [ ] B2. `get_documents` da SQLite reale

  **What to do**:
  - Sostituire `sample_documents()` con `db::get_all_documents()` (richiede D2 di Tommaso)
  - Usare `state: tauri::State<AppState>` per ottenere il DB connection

  **QA**: `grep -c "sample_documents" src/lib.rs` → 0

  **Commit**: `feat(backend): implement real get_documents`

- [ ] B7. `get_viewer_page` con contenuto reale

  **What to do**:
  - Leggere file da `app_data_dir/documents/{doc_id}`
  - Per PDF: usare `parsers::extract_document_text()`
  - Restituire `{ filename, page_content, current_page, total_pages }`

  **QA**: `grep "SMOT è un" src/lib.rs` vicino a get_viewer_page → 0 occorrenze

  **Commit**: `feat(backend): implement real get_viewer_page`

---

## Wave 2 — Backend Core (parallelo con Salvatore F4-F6, Tommaso S1-S2)

- [ ] B3. `upload_documents` salva file reali

  **What to do**:
  - Copiare file in `app_data_dir/documents/{uuid}.{ext}`
  - Chiamare `db::insert_document()` per metadata (richiede D1)
  - Gestire errori: permessi, file non trovato, nome duplicato

  **QA**: `cargo test upload` → file copiato + record DB creato

  **Commit**: `feat(backend): implement real upload_documents`

- [ ] B4. `start_indexing` pipeline reale

  **What to do**:
  - Per ogni doc non indicizzato: chunking (512 token, overlap 50) → embedding via Ollama `nomic-embed-text` → salva in DB
  - Usare `db::update_indexing_status()` per marcare come indicizzato
  - Emettere eventi: `app_handle.emit("indexing-progress", payload)`
  - Stato condiviso: `Arc<Mutex<IndexingState>>`
  - Usare `tauri::async_runtime::spawn` per non bloccare UI

  **QA**: `cargo build` + verificare che start_indexing non sia più stub

  **Commit**: `feat(backend): implement real indexing pipeline`

- [ ] B5. `get_indexing_status` progresso reale

  **What to do**:
  - Leggere stato da `IndexingState` (Arc<Mutex>)
  - Restituire: `{ status, documents_total, documents_done, current_document, chunks_done, chunks_total, eta_seconds }`
  - ETA calcolato su velocità media reale

  **QA**: `grep "62%" src/lib.rs` vicino a get_indexing_status → 0

  **Commit**: `feat(backend): implement real get_indexing_status`

- [ ] B6. `chat_query` RAG con Ollama

  **What to do**:
  - Cercare chunks con `db::search_fts5(query)` (richiede D4)
  - Costruire prompt: contesto + domanda
  - Chiamare Ollama `/api/generate` con `reqwest`
  - Restituire: `{ answer, sources: [{ filename, snippet }] }`
  - Fallback se Ollama non running: messaggio chiaro

  **QA**: `grep "Risposta locale simulata" src/lib.rs` → 0

  **Commit**: `feat(backend): implement chat_query with FTS5 + Ollama RAG`

- [ ] B8-B10. Indexing controls

  **What to do**:
  - `pause_indexing`: AtomicBool → PAUSE
  - `resume_indexing`: AtomicBool → RESUME
  - `continue_in_background`: detach worker thread

  **QA**: `cargo build` + verificare comandi non restituiscano JSON finto

  **Commit**: `feat(backend): implement real indexing controls`

---

## Success Criteria

```bash
cd smot-desktop/src-tauri && cargo build  # exit 0
grep -c "sample_documents\|hardcoded\|simulat\|Risposta locale" src/lib.rs  # Expected: 0
```
