# 🔍 SMOT-APP — Analisi Completa Repository

> **Data:** 12 Maggio 2026 12:00 | **Repo:** BigBoss133/SMOT-APP

---

## 🌿 Branch Attivi

| Branch | Stato | Ultimo Commit |
|--------|:-----:|---------------|
| `main` | 🟢 Attivo | `2c4a354` — fix: Michele backend fixes (pubkey, CI macOS, Rust fixes, 62 tests) |
| `release/v0.1.0-beta` | 🟢 Attivo | `83d5ea3` — fix: installer/onboarding bugs |
| `docs/install-guides` | 🟢 Attivo | `2fad4a6` — docs: OS-specific install guides |
| `backup/pre-cleanup` | 📌 Tag | Backup pre-pulizia |

### Branch Eliminati (già mergiati in main)

| Branch | Mergiato in | Commit |
|--------|-------------|--------|
| ~~`Animations-and-design`~~ | `d655b3f` | `3bdeeb8` — Salvatore |
| ~~`feat/salvatore-frontend-polish`~~ | `5380fbf` | `f9fd5a3` — Salvatore |
| ~~`installer`~~ | `d655b3f` | `800c0fd` — Michele |

---

## 📦 BRANCH: `main`

### Stato Attuale
✅ **Tutti i 10 comandi Tauri sono implementazioni reali.**
✅ **Frontend polish completato (7/7 task).**
✅ **Fix backend Rust completati (pubkey, CI macOS, reqwest singleton, error handling, Ollama caching, Windows sanitize, document_ids).**
✅ **62 test Rust scritti e passanti (parsers: 7, error: 21, lib: 13, indexing: 20).**
⏳ **Fix frontend wizard/onboarding (3 task, Salvatore).**

### File Chiave

| File | Contenuto | Stato |
|------|-----------|:----:|
| `smot-desktop/src-tauri/src/lib.rs` | 13 comandi Tauri + `indexing.rs` | ✅ Tutti reali |
| `smot-desktop/src-tauri/src/db.rs` | SQLite init + FTS5 | ✅ Funzionante |
| `smot-desktop/src-tauri/src/parsers.rs` | PDF/DOCX/XLSX | ✅ Funzionante |
| `smot-desktop/src-tauri/src/ollama.rs` | Detection + download + status | ✅ Funzionante |
| `smot-desktop/src-tauri/src/indexing.rs` | Pipeline chunking + embedding | ✅ 395 righe |
| `smot-desktop/src-tauri/src/setup.rs` | Startup + onboarding + config | ✅ Fixato (83d5ea3) |
| `smot-desktop/src-tauri/src/system_probe.rs` | GPU/CPU/RAM detection | ✅ Apple Silicon |
| `smot-desktop/src-tauri/src/auto_config.rs` | Tier detection | ✅ Unified memory |
| `smot-desktop/src-tauri/src/error.rs` | Error handling | ✅ 21 test |
| `smot-desktop/src/components/ErrorBoundary.tsx` | ErrorBoundary | ✅ Salvatore |
| `smot-desktop/src/components/Skeleton.tsx` | Loading skeletons | ✅ Salvatore |
| `smot-desktop/src/components/EmptyState.tsx` | Empty states | ✅ Salvatore |
| `smot-desktop/src/components/ConfirmDialog.tsx` | Confirm dialog | ✅ Salvatore |
| `smot-desktop/src/components/Toast.tsx` | Toast notifications | ✅ Salvatore |
| `smot-desktop/src/context/ToastContext.tsx` | Toast context | ✅ Salvatore |

---

## 📊 Progresso Generale

### Michele — ✅ COMPLETATO (fix + test)
Tutti i 10 stub backend -> reali. Indexing pipeline. Setup onboarding. Apple Silicon detection. Branch release creato.
Fix: pubkey updater, CI macOS targets, reqwest::Client singleton, Connection::open error handling, Ollama caching 5s TTL, timeout 2s→10s, Windows filename sanitization, document_ids filtering.
Rimossa configurazione modello locale (ai_enabled) dal Config.
**62 test Rust scritti**: parsers(7), error(21), lib(13), indexing(20).

### Salvatore — ✅ Componenti, ⏳ Fix wizard
Tutti i 7 task frontend completati. Mancano 3 fix per il wizard full-screen e Apple Silicon display.

### Tommaso — ✅ COMPLETATO
DB functions estratte da inline a db.rs (D1-D4). Security hardening (S1-S4). Dead code rimosso. CI workflows aggiornati.

---

## ⏳ Task in Corso (Installer Fix)

| # | Task | Chi | Stato |
|---|------|-----|:----:|
| FIX-1a | setup.rs check config | Michele | ✅ |
| FIX-1b | complete_onboarding command | Michele | ✅ |
| FIX-2a | Apple Silicon VRAM | Michele | ✅ |
| FIX-2b | auto_config unified memory | Michele | ✅ |
| FIX-3 | ram_available_gb | Michele | ✅ |
| FIX-4 | App.tsx full-screen wizard | Salvatore | ⏳ |
| FIX-5 | OnboardingPage save | Salvatore | ⏳ |
| FIX-6 | SystemDiscoveryStep display | Salvatore | ⏳ |

---

## Build Status

| Layer | Comando | Risultato |
|-------|---------|-----------|
| Rust | `cargo build` | ✅ 0 errori |
| Rust | `cargo test` | ✅ 62/62 pass |
| TypeScript | `npx tsc --noEmit` | ✅ 0 errori |
| Frontend | `npm run build` | ✅ 321 KB JS |

---

*Analisi aggiornata 12 Maggio 2026 — dopo merge feat/michele-fix-may12 in main*