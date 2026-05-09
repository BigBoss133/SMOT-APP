# 📋 SMOT — Implementazioni e Bug Fix da Fare

> **Data:** 8 Maggio 2026 | **Stato:** Tutti i branch mergiati in `main`

---

## 📊 STATO ATTUALE

### Backend Rust
| Modulo | Funzioni | Stato |
|--------|----------|:----:|
| `lib.rs` | 13 comandi Tauri | 10 STUB, 3 reali |
| `ollama.rs` | 3 comandi | ✅ Reali |
| `db.rs` | init_database, resolve_db_path | ✅ Reali (solo init) |
| `parsers.rs` | extract_document_text | ✅ Reale |
| `setup.rs` | on_app_startup, load_config | ✅ Reale |
| `system_probe.rs` | probe_system, detect_gpu | ✅ Reale |
| `auto_config.rs` | determine_tier | ✅ Reale |

### Frontend React
| Categoria | File | Stato |
|-----------|------|:----:|
| Pagine | 8 (Dashboard, Chat, Viewer, Upload, Indexing, Settings, Graph, Onboarding) | ✅ |
| Componenti | 18 (GraphView x8, Onboarding x6, Sidebar, StatusBar, etc.) | ✅ |
| Hooks | 4 (useForceGraph, useAnimation, useGraphData, useGraphZoom) | ✅ |
| Servizi | 3 (api.ts, ollama.ts, graphRelations.ts) | ✅ |

### Infrastruttura
- ✅ CI/CD: 3 workflow (Windows/macOS/Linux)
- ✅ Bundle NSIS configurato
- ✅ Auto-updater plugin
- ✅ Code signing template
- ✅ GPU detection OS-specific

---

## 🔴 COMANDI STUB (10 da implementare)

### B1. get_system_status → Monitoraggio reale
```rust
// File: lib.rs:174 — Attuale: valori hardcoded
// Da fare: usare sysinfo per CPU/RAM/disco reali + query DB per conteggi doc
```
- [ ] Sostituire `ram_used_gb: 6.4` con `sysinfo` refresh
- [ ] Sostituire `cpu_percent: 21` con CPU usage reale
- [ ] Query SQLite per `documents_total` e `documents_indexed`
- [ ] Restituire modello Ollama attivo reale

### B2. get_documents → Query DB reale
```rust
// File: lib.rs:220 — Attuale: sample_documents() con 3 doc finti
// Da fare: SELECT * FROM documents JOIN categories
```
- [ ] Creare `get_all_documents()` in `db.rs`
- [ ] Sostituire `sample_documents()` con query SQL

### B3. upload_documents → Salvataggio file reale
```rust
// File: lib.rs:225 — Attuale: crea ID finti, non salva nulla
// Da fare: copiare file in app_data_dir/documents/, INSERT in SQLite
```
- [ ] Copiare file su disco con UUID filename
- [ ] Inserire metadata in tabella `documents`
- [ ] Restituire documenti reali caricati

### B4. start_indexing → Pipeline indicizzazione
```rust
// File: lib.rs:239 — Attuale: job_id finto
// Da fare: leggere file → chunking → embedding → FTS5
```
- [ ] Creare modulo `indexing.rs`
- [ ] Implementare text chunking (512 token, overlap 50)
- [ ] Calcolare embeddings via Ollama (nomic-embed-text)
- [ ] Salvare chunks + embeddings in SQLite
- [ ] Aggiornare tabella FTS5

### B5. get_indexing_status → Progresso reale
```rust
// File: lib.rs:246 — Attuale: progresso simulato (62% o 100%)
// Da fare: leggere stato reale da indexing thread
```
- [ ] Stato condiviso (Arc<Mutex<IndexingState>>)
- [ ] Progresso per documento: chunk_done/total, embedding_done/total
- [ ] ETA calcolato su velocità reale

### B6. chat_query → RAG con Ollama
```rust
// File: lib.rs:300 — Attuale: risposta fissa "Risposta locale simulata per..."
// Da fare: FTS5 search → contesto → prompt Ollama → risposta
```
- [ ] Cercare chunks rilevanti con FTS5
- [ ] Costruire prompt con contesto + domanda
- [ ] Chiamare Ollama `/api/generate`
- [ ] Restituire risposta + fonti (documento, pagina, snippet)

### B7. get_viewer_page → Contenuto documento reale
```rust
// File: lib.rs:316 — Attuale: testo hardcoded su SMOT
// Da fare: leggere file da disco, restituire pagina richiesta
```
- [ ] Leggere documento da `app_data_dir/documents/`
- [ ] Per PDF: estrarre pagina specifica
- [ ] Restituire testo + nome documento + total_pages reali

### B8-B10. Indexing controls (pause/resume/continue_background)
```rust
// File: lib.rs:285-296 — Attuale: restituiscono JSON finto
// Da fare: inviare segnali al thread di indexing
```
- [ ] `pause_indexing`: inviare segnale PAUSE al worker
- [ ] `resume_indexing`: inviare segnale RESUME
- [ ] `continue_in_background`: distaccare worker, chiudere UI indexing

---

## 🟡 DATABASE (4 task)

- [ ] **D1**: `insert_document()` in `db.rs` — INSERT con metadata
- [ ] **D2**: `get_all_documents()` in `db.rs` — SELECT con JOIN categorie
- [ ] **D3**: `update_indexing_status()` in `db.rs` — UPDATE progresso
- [ ] **D4**: `search_fts5(query)` in `db.rs` — SELECT con MATCH FTS5

---

## 🟢 FRONTEND POLISH (6 task)

- [ ] **F1**: React Error Boundary in `App.tsx`
- [ ] **F2**: Loading skeleton per Dashboard, Chat, Viewer
- [ ] **F3**: Empty state "Nessun documento" quando DB vuoto
- [ ] **F4**: Dialog conferma per azioni distruttive (delete model, delete doc)
- [ ] **F5**: Componente Toast per notifiche successo/errore
- [ ] **F6**: Event listener `indexing-progress` per update in tempo reale

---

## 🔒 SICUREZZA (4 task)

- [ ] **S1**: Validazione input nei comandi Tauri (path traversal, SQL injection)
- [ ] **S2**: Rate limiting su chiamate Ollama (max 5 richieste/sec)
- [ ] **S3**: Sanitizzazione filename upload
- [ ] **S4**: Nessun dato sensibile in chiaro in config.json

---

## 📊 PRIORITÀ

| ID | Task | Ore | Priorità |
|----|------|:---:|:--------:|
| B1 | System status reale | 2h | 🔴 P0 |
| B2 | Documenti da DB | 2h | 🔴 P0 |
| B3 | Upload file reale | 3h | 🔴 P0 |
| D1-D4 | Funzioni database | 4h | 🟡 P1 |
| B4-B5 | Pipeline indexing | 8h | 🟡 P1 |
| B6 | Chat RAG | 4h | 🟡 P1 |
| B7 | Viewer reale | 2h | 🟢 P2 |
| B8-B10 | Indexing controls | 3h | 🟢 P2 |
| F1-F6 | Frontend polish | 6h | 🟢 P2 |
| S1-S4 | Security | 4h | ⚪ P3 |

**Totale: 24 task, ~38 ore**

---

*Generato dopo merge completo di Animations-and-design + installer in main*
