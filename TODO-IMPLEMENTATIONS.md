# 📋 SMOT — Implementazioni e Bug Fix da Fare

> **Data:** 11 Maggio 2026 | **Stato:** Tutti i branch mergiati in `main`

---

## 📊 STATO ATTUALE

### Backend Rust
| Modulo | Funzioni | Stato |
|--------|----------|:----:|
| `lib.rs` | 13 comandi Tauri | ✅ 10 reali (Michele), 3 reali pre-esistenti |
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
- [x] Sostituire `ram_used_gb: 6.4` con `sysinfo` refresh
- [x] Sostituire `cpu_percent: 21` con CPU usage reale
- [x] Query SQLite per `documents_total` e `documents_indexed`
- [x] Restituire modello Ollama attivo reale

### B2. get_documents → Query DB reale
```rust
// File: lib.rs:220 — Attuale: sample_documents() con 3 doc finti
// Da fare: SELECT * FROM documents JOIN categories
```
- [x] Creare `get_all_documents()` in `db.rs`
- [x] Sostituire `sample_documents()` con query SQL

### B3. upload_documents → Salvataggio file reale
```rust
// File: lib.rs:225 — Attuale: crea ID finti, non salva nulla
// Da fare: copiare file in app_data_dir/documents/, INSERT in SQLite
```
- [x] Copiare file su disco con UUID filename
- [x] Inserire metadata in tabella `documents`
- [x] Restituire documenti reali caricati

### B4. start_indexing → Pipeline indicizzazione
```rust
// File: lib.rs:239 — Attuale: job_id finto
// Da fare: leggere file → chunking → embedding → FTS5
```
- [x] Creare modulo `indexing.rs`
- [x] Implementare text chunking (512 token, overlap 50)
- [x] Calcolare embeddings via Ollama (nomic-embed-text)
- [x] Salvare chunks + embeddings in SQLite
- [x] Aggiornare tabella FTS5

### B5. get_indexing_status → Progresso reale
```rust
// File: lib.rs:246 — Attuale: progresso simulato (62% o 100%)
// Da fare: leggere stato reale da indexing thread
```
- [x] Stato condiviso (Arc<Mutex<IndexingState>>)
- [x] Progresso per documento: chunk_done/total, embedding_done/total
- [x] ETA calcolato su velocità reale

### B6. chat_query → RAG con Ollama
```rust
// File: lib.rs:300 — Attuale: risposta fissa "Risposta locale simulata per..."
// Da fare: FTS5 search → contesto → prompt Ollama → risposta
```
- [x] Cercare chunks rilevanti con FTS5
- [x] Costruire prompt con contesto + domanda
- [x] Chiamare Ollama `/api/generate`
- [x] Restituire risposta + fonti (documento, pagina, snippet)

### B7. get_viewer_page → Contenuto documento reale
```rust
// File: lib.rs:316 — Attuale: testo hardcoded su SMOT
// Da fare: leggere file da disco, restituire pagina richiesta
```
- [x] Leggere documento da `app_data_dir/documents/`
- [x] Per PDF: estrarre pagina specifica
- [x] Restituire testo + nome documento + total_pages reali

### B8-B10. Indexing controls (pause/resume/continue_background)
```rust
// File: lib.rs:285-296 — Attuale: restituiscono JSON finto
// Da fare: inviare segnali al thread di indexing
```
- [x] `pause_indexing`: inviare segnale PAUSE al worker
- [x] `resume_indexing`: inviare segnale RESUME
- [x] `continue_in_background`: distaccare worker, chiudere UI indexing

---

## 🟡 DATABASE (4 task)

- [x] **D1**: `insert_document()` in `db.rs` — INSERT con metadata
- [x] **D2**: `get_all_documents()` in `db.rs` — SELECT con JOIN categorie
- [x] **D3**: `update_indexing_status()` in `db.rs` — UPDATE progresso
- [x] **D4**: `search_fts5(query)` in `db.rs` — SELECT con MATCH FTS5

---

## 🟢 FRONTEND POLISH (6 task)

- [x] **F1**: React Error Boundary in `App.tsx`
- [x] **F2**: Loading skeleton per Dashboard, Chat, Viewer
- [x] **F3**: Empty state "Nessun documento" quando DB vuoto
- [x] **F4**: Dialog conferma per azioni distruttive (delete model, delete doc)
- [x] **F5**: Componente Toast per notifiche successo/errore
- [x] **F6**: Event listener `indexing-progress` per update in tempo reale

---

## 🔒 SICUREZZA (4 task)

- [x] **S1**: Validazione input nei comandi Tauri (path traversal, SQL injection)
- [x] **S2**: Rate limiting su chiamate Ollama (max 5 richieste/sec)
- [x] **S3**: Sanitizzazione filename upload
- [x] **S4**: Nessun dato sensibile in chiaro in config.json

---

## 📊 PRIORITÀ

| ID | Task | Ore | Priorità |
|----|------|:---:|:--------:|
| B1 | System status reale | 2h | ✅ Completato (Michele) |
| B2 | Documenti da DB | 2h | ✅ Completato (Michele) |
| B3 | Upload file reale | 3h | ✅ Completato (Michele) |
| D1-D4 | Funzioni database | 4h | 🟡 P1 |
| B4-B5 | Pipeline indexing | 8h | ✅ Completato (Michele) |
| B6 | Chat RAG | 4h | ✅ Completato (Michele) |
| B7 | Viewer reale | 2h | ✅ Completato (Michele) |
| B8-B10 | Indexing controls | 3h | ✅ Completato (Michele) |
| F1-F6 | Frontend polish | 6h | ✅ Completato (Salvatore) |
| S1-S4 | Security | 4h | ⚪ P3 |

**Totale originale: 24 task (~38h) — 20 completati, 4 rimanenti (S1-S4)**

---

*Generato dopo merge completo di Animations-and-design + installer in main*
