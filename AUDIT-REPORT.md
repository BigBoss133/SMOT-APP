# SMOT — Audit Report & Beta Roadmap

Source: `smot-desktop/src-tauri/src/` (Rust) + `smot-desktop/src/` (React)

---

## 1. Security Audit

| Result | Finding | File:Line |
|:------:|---------|-----------|
| ✅ | **No hardcoded secrets** in Rust code | — |
| ✅ | **No SQL injection** — tutte le query usano `?1, ?2` parametri | — |
| ✅ | **CSP configurata** correttamente | `tauri.conf.json:25` |
| ✅ | **No `@ts-ignore` o `as any`** nel frontend | — |
| ⚠️ | **Path traversal**: `upload_documents` accetta path utente senza sanitizzare | `lib.rs:267` |
| ⚠️ | **`Connection::open().expect()`** — crasha se DB non apribile | `lib.rs:584` |

## 2. Bug Hunt

| Severità | Finding | File:Line |
|:--------:|---------|-----------|
| 🟡 | **`reqwest::Client` non riusato** — 4x `Client::new()` invece di singleton (overhead) | `indexing.rs:142`, `lib.rs:449`, `ollama.rs:25,49` |
| 🟡 | **`start_indexing` accetta `document_ids` ma non li usa** — indicizza tutti i doc non indicizzati | `lib.rs:313` |
| 🟢 | **Ollama timeout 2s** — potrebbe fallire su macchine lente | `ollama.rs:26` |

## 3. Dead Code (da rimuovere)

| Cosa | Perché | File |
|------|--------|------|
| `struct JobInput` | Non più usato (pause/resume usano controller) | `lib.rs:102` |
| `IndexingFileStatus` | `get_indexing_status` ritorna `files: vec![]` sempre | `lib.rs:79,98` |
| `start_indexing` parametro `document_ids` | Ignorato — indicizza tutto | `lib.rs:313` |

## 4. Performance

| Issue | Impatto | Fix |
|-------|---------|-----|
| 4x `reqwest::Client::new()` | Ogni chiamata ricrea pool TCP | Usare `AppState` con `client: reqwest::Client` |
| `check_ollama_status()` senza caching | Chiamato ad ogni `get_system_status` | Cache risultato per 5-10s |
| FTS5 query in `chat_query` ricostruita ogni volta | Overhead parsing SQL | Prepared statement stabile |

## 5. Beta Roadmap

```
MERCOLEDÌ — Tommaso (DB + Security) ✅ COMPLETATO
  ✅ C3: Archiviare piani obsoleti
  ✅ D1-D4: Estrarre funzioni in db.rs
  ✅ S1: Input validation
  ✅ S2: Rate limiting

GIOVEDÌ — Tommaso (Security) + Refactoring ✅ COMPLETATO
  ✅ S3: Sanitizzazione filename
  ✅ S4: Config audit
  ✅ Dead code cleanup (JobInput, IndexingFileStatus)

GIOVEDÌ — Michele (Performance + Fix)
  reqwest::Client singleton in AppState
  Ollama status caching
  DB init error handling graceful
  upload_documents path validation

VENERDÌ — Testing & Build
  cargo build + test
  Test flusso upload -> index -> chat
  npm run build frontend
  Fix bug trovati durante testing
  Tag v0.1.0-beta

VENERDÌ SERA -> BETA RELEASED
```

## 6. Beta Prerequisites

### System deps for build
```bash
sudo apt install libgtk-3-dev libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev
```

### Unblocker (mancanza signing = OK per beta)
- Windows code signing cert (~$200) -> salta per beta
- macOS notarization ($99/yr) -> salta per beta
- Tauri updater signing key -> generare con `cargo tauri signer generate`

### Build & tag
```bash
cd smot-desktop
npm install
cd src-tauri && cargo build && cd ..
npm run build
git tag v0.1.0-beta && git push origin v0.1.0-beta
```
