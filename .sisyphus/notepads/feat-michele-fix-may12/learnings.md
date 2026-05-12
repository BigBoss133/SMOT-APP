# Learnings - feat/michele-fix-may12

## Build & Architecture
- `cargo build` compiles in ~4s after incremental changes
- `ollama.rs` already had caching (`OLLAMA_CACHE` with `Lazy<Mutex<...>>`) and client-passing (`State<'_, crate::AppState>`) before this task — FIX-4 and FIX-7 were pre-implemented
- `indexing.rs` already had a `query_documents` helper function extracted — my initial edit created duplicate code that needed cleanup
- `AppState` now includes `client: reqwest::Client` as a singleton, shared across `chat_query`, `get_ollama_status`, `pull_ollama_model`, and `start_indexing`

## Rust Patterns
- `rusqlite::params_from_iter` for dynamic parameter binding with `IN` clauses
- `once_cell::sync::Lazy` for static initialization of complex types (avoids `const` evaluation issues)
- `#[allow(dead_code)]` on `supports_ai` method since `ai_enabled` was removed from Config

## Gotchas
- When editing large blocks, always verify the file state after — my edit left orphaned code because the file had already been partially modified
- `stmt` lifetime issues in rusqlite: `query_map` returns an iterator that borrows `stmt`, so `stmt` must outlive the result collection