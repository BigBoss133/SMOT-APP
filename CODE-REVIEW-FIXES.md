# CODE-REVIEW-FIXES.md

Documento completo di tutti i finding della code review, con soluzioni passo-passo, codice esatto da copiare/incollare e checklist di verifica.

---

## Indice

1. [CRITICAL (2 finding)](#critical)
2. [WARNING (12 finding)](#warning)
3. [SUGGESTION (14 finding)](#suggestion)
4. [Tabella Riepilogativa](#tabella-riepilogativa)

---

## CRITICAL

### C1 — CSP è `null` — Nessuna Content Security Policy

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | CRITICAL |
| **Categoria** | Sicurezza |
| **File** | `smot-desktop/src-tauri/tauri.conf.json` |
| **Effort** | 5 minuti |
| **Priorità** | 1 |

#### Problema

La sezione `"csp"` è impostata a `null`, il che significa che **nessuna Content Security Policy** è attiva. Questo lascia l'applicazione vulnerabile ad attacchi XSS, injection di script e data exfiltration.

#### Codice Attuale

```json
{
  "app": {
    "csp": null
  }
}
```

#### Codice Fixato

```json
{
  "app": {
    "csp": "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' asset: https://asset.localhost data:; script-src 'self'"
  }
}
```

#### Istruzioni Passo-Passo

1. Aprire il file `smot-desktop/src-tauri/tauri.conf.json`
2. Individuare la sezione `"app"` e la chiave `"csp"`
3. Sostituire il valore `null` con la stringa CSP riportata sopra
4. Salvare il file
5. Riavviare l'applicazione con `cargo tauri dev`
6. Aprire i DevTools (Ctrl+Shift+I) e verificare nella tab Network che gli header di risposta contengano `Content-Security-Policy`

#### Checklist Verifica

- [ ] Il valore di `"csp"` non è più `null`
- [ ] L'app si avvia senza errori nella console
- [ ] Nei DevTools, tab Network, gli header di risposta mostrano `Content-Security-Policy`
- [ ] Le risorse interne (CSS, immagini, script) si caricano correttamente
- [ ] Tentativi di caricare script esterni vengono bloccati dalla CSP

---

### C2 — `strict: false` — TypeScript Strict Mode Disabilitato

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | CRITICAL |
| **Categoria** | TypeScript |
| **File** | `smot-desktop/tsconfig.app.json` |
| **Effort** | 2-4 ore |
| **Priorità** | 1 |

#### Problema

L'opzione `"strict": false` disabilita tutti i controlli strict di TypeScript, permettendo `implicit any`, `strictNullChecks` disabilitato, `noImplicitThis` disabilitato e altri controlli di sicurezza dei tipi. Questo maschera bug potenziali e rende il codice meno sicuro.

#### Codice Attuale

```json
{
  "compilerOptions": {
    "strict": false
  }
}
```

#### Codice Fixato

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

#### Istruzioni Passo-Passo

1. Aprire `smot-desktop/tsconfig.app.json`
2. Cambiare `"strict": false` in `"strict": true`
3. Eseguire `npx tsc --noEmit` per vedere tutti gli errori
4. Per ogni errore, applicare la correzione appropriata:

**Errori comuni e soluzioni:**

**Errore: Parameter implicitly has an 'any' type**

```typescript
// Prima (errore)
function handleChatSubmit(e) {
  e.preventDefault()
}

// Dopo (fix)
function handleChatSubmit(e: React.FormEvent<HTMLFormElement>): void {
  e.preventDefault()
}
```

**Errore: Object is possibly 'null' o 'undefined'**

```typescript
// Prima (errore)
const element = document.getElementById('chat-input')
element.focus()

// Dopo (fix)
const element = document.getElementById('chat-input')
if (element) {
  element.focus()
}
```

**Errore: Variable implicitly has type 'any'**

```typescript
// Prima (errore)
const items = data.map(item => item.name)

// Dopo (fix)
interface DataItem {
  name: string
  id: string
}
const items: string[] = (data as DataItem[]).map((item: DataItem): string => item.name)
```

5. Ripetere `npx tsc --noEmit` dopo ogni batch di correzioni
6. Continuare finché il comando non restituisce codice 0

#### Checklist Verifica

- [ ] `"strict": true` in `tsconfig.app.json`
- [ ] `npx tsc --noEmit` esce con codice 0
- [ ] Nessun `implicit any` rimasto nel codice
- [ ] Nessun `strictNullChecks` violation
- [ ] L'app si compila e funziona correttamente

---

## WARNING

### W1 — 10 Comandi Backend Sono Stub (Dati Finti)

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | WARNING |
| **Categoria** | Backend |
| **File** | `smot-desktop/src-tauri/src/lib.rs` |
| **Effort** | 38 ore |
| **Priorità** | 3 |

#### Problema

Dieci comandi Tauri restituiscono dati hardcoded finti invece di interrogare il database o eseguire logica reale. I comandi stub sono:

1. `get_system_status`
2. `get_documents`
3. `upload_documents`
4. `start_indexing`
5. `get_indexing_status`
6. `pause_indexing`
7. `resume_indexing`
8. `continue_in_background`
9. `chat_query`
10. `get_viewer_page`

I comandi già reali e funzionanti sono: `get_ollama_status`, `pull_ollama_model`, `check_disk_space` (in `ollama.rs`) e `parse_document_text` (in `lib.rs`).

#### Codice Attuale (esempio: `get_system_status`)

```rust
#[tauri::command]
fn get_system_status() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "cpu_usage": 45.2,
        "memory_usage": 62.8,
        "disk_usage": 34.1,
        "ollama_status": "running",
        "documents_count": 12,
        "indexed_count": 8
    }))
}
```

#### Codice Fixato (esempio: `get_system_status`)

```rust
#[tauri::command]
fn get_system_status(state: tauri::State<AppState>) -> Result<serde_json::Value, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    let documents_count: i64 = db
        .query_row(
            "SELECT COUNT(*) FROM documents",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    let indexed_count: i64 = db
        .query_row(
            "SELECT COUNT(*) FROM documents WHERE indexed = 1",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    let sys = sysinfo::System::new_all();
    let cpu_usage = sys.global_cpu_info().cpu_usage();
    let memory_usage = (sys.used_memory() as f64 / sys.total_memory() as f64) * 100.0;
    let disk_usage = {
        let disks = sysinfo::Disks::new_with_refreshed_list();
        let disk = disks.first().map(|d| d).unwrap();
        (disk.used_space() as f64 / disk.total_space() as f64) * 100.0
    };

    let ollama_status = if crate::ollama::is_ollama_running() {
        "running"
    } else {
        "stopped"
    };

    Ok(serde_json::json!({
        "cpu_usage": (cpu_usage * 10.0).round() / 10.0,
        "memory_usage": (memory_usage * 10.0).round() / 10.0,
        "disk_usage": (disk_usage * 10.0).round() / 10.0,
        "ollama_status": ollama_status,
        "documents_count": documents_count,
        "indexed_count": indexed_count
    }))
}
```

#### Codice Fixato (esempio: `get_documents`)

```rust
#[tauri::command]
fn get_documents(state: tauri::State<AppState>) -> Result<Vec<serde_json::Value>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = db
        .prepare("SELECT id, filename, file_type, size_bytes, uploaded_at, indexed FROM documents ORDER BY uploaded_at DESC")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(serde_json::json!({
                "id": row.get::<_, String>(0)?,
                "filename": row.get::<_, String>(1)?,
                "file_type": row.get::<_, String>(2)?,
                "size_bytes": row.get::<_, i64>(3)?,
                "uploaded_at": row.get::<_, String>(4)?,
                "indexed": row.get::<_, bool>(5)?
            }))
        })
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for row in rows {
        results.push(row.map_err(|e| e.to_string())?);
    }
    Ok(results)
}
```

#### Codice Fixato (esempio: `upload_documents`)

```rust
#[tauri::command]
async fn upload_documents(
    state: tauri::State<'_, AppState>,
    files: Vec<serde_json::Value>,
) -> Result<Vec<serde_json::Value>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for file in files {
        let filename = file["name"].as_str().ok_or("Nome file mancante")?;
        let file_type = file["type"].as_str().ok_or("Tipo file mancante")?;
        let size_bytes = file["size"].as_i64().ok_or("Dimensione mancante")?;
        let id = uuid::Uuid::new_v4().to_string();
        let now = chrono::Utc::now().to_rfc3339();

        db.execute(
            "INSERT INTO documents (id, filename, file_type, size_bytes, uploaded_at, indexed) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            rusqlite::params![id, filename, file_type, size_bytes, now, false],
        )
        .map_err(|e| e.to_string())?;

        results.push(serde_json::json!({
            "id": id,
            "filename": filename,
            "file_type": file_type,
            "size_bytes": size_bytes,
            "uploaded_at": now,
            "indexed": false
        }));
    }
    Ok(results)
}
```

#### Codice Fixato (esempio: `start_indexing`)

```rust
#[tauri::command]
async fn start_indexing(state: tauri::State<'_, AppState>) -> Result<serde_json::Value, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    let unindexed_count: i64 = db
        .query_row(
            "SELECT COUNT(*) FROM documents WHERE indexed = 0",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    if unindexed_count == 0 {
        return Ok(serde_json::json!({
            "status": "no_documents",
            "message": "Nessun documento da indicizzare"
        }));
    }

    db.execute(
        "UPDATE documents SET indexed = 1 WHERE indexed = 0",
        [],
    )
    .map_err(|e| e.to_string())?;

    Ok(serde_json::json!({
        "status": "started",
        "documents_to_index": unindexed_count
    }))
}
```

#### Codice Fixato (esempio: `chat_query` con FTS5)

```rust
#[tauri::command]
async fn chat_query(
    state: tauri::State<'_, AppState>,
    query: String,
) -> Result<serde_json::Value, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = db
        .prepare(
            "SELECT filename, snippet(documents_fts, 0, '>>>', '<<<', '...', 10) as snippet \
             FROM documents_fts \
             WHERE documents_fts MATCH ?1 \
             ORDER BY rank \
             LIMIT 5"
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([&query], |row| {
            Ok(serde_json::json!({
                "filename": row.get::<_, String>(0)?,
                "snippet": row.get::<_, String>(1)?
            }))
        })
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for row in rows {
        results.push(row.map_err(|e| e.to_string())?);
    }

    if results.is_empty() {
        return Ok(serde_json::json!({
            "answer": "Nessun documento trovato per la query specificata.",
            "sources": []
        }));
    }

    Ok(serde_json::json!({
        "answer": format!("Trovati {} risultati per: {}", results.len(), query),
        "sources": results
    }))
}
```

#### Istruzioni Passo-Passo

1. Aggiungere le dipendenze necessarie in `Cargo.toml`:

```toml
[dependencies]
sysinfo = "0.30"
uuid = { version = "1", features = ["v4"] }
chrono = { version = "0.4", features = ["serde"] }
```

2. Creare la struttura `AppState` in `lib.rs` se non esiste:

```rust
use std::sync::Mutex;
use rusqlite::Connection;

pub struct AppState {
    pub db: Mutex<Connection>,
}
```

3. Inizializzare `AppState` in `main.rs`:

```rust
fn main() {
    let db = crate::db::init_database().expect("Errore inizializzazione database");
    let state = AppState { db: Mutex::new(db) };

    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            get_system_status,
            get_documents,
            upload_documents,
            start_indexing,
            get_indexing_status,
            pause_indexing,
            resume_indexing,
            continue_in_background,
            chat_query,
            get_viewer_page,
            crate::ollama::get_ollama_status,
            crate::ollama::pull_ollama_model,
            crate::ollama::check_disk_space,
            parse_document_text,
        ])
        .run(tauri::generate_context!())
        .expect("Errore avvio applicazione");
}
```

4. Implementare ogni comando stub uno per uno, seguendo gli esempi sopra
5. Per ogni comando, aggiungere il parametro `state: tauri::State<AppState>` alla firma
6. Testare ogni comando singolarmente via Tauri invoke dal frontend

#### Checklist Verifica

- [ ] `AppState` definito e registrato in `main.rs`
- [ ] `get_system_status` restituisce dati reali dal sistema e dal DB
- [ ] `get_documents` legge dalla tabella `documents`
- [ ] `upload_documents` inserisce nel DB e restituisce i record creati
- [ ] `start_indexing` aggiorna lo stato di indicizzazione nel DB
- [ ] `get_indexing_status` legge lo stato reale dal DB
- [ ] `pause_indexing` / `resume_indexing` gestiscono lo stato di pausa
- [ ] `continue_in_background` delega a un task in background
- [ ] `chat_query` esegue ricerca FTS5 e restituisce risultati reali
- [ ] `get_viewer_page` restituisce contenuto reale del documento
- [ ] Ogni comando testato via `invoke` dal frontend

---

### W2 — Vulnerabilità ReDoS in ViewerPage

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | WARNING |
| **Categoria** | Sicurezza |
| **File** | `smot-desktop/src/pages/ViewerPage.tsx` |
| **Effort** | 2 minuti |
| **Priorità** | 1 |

#### Problema

La funzione `highlightText()` crea una RegExp direttamente dall'input utente senza escapare i caratteri speciali. Un input malevolo come `(a+)+b` può causare catastrophic backtracking, bloccando la UI.

#### Codice Attuale

```typescript
function highlightText(text: string, term: string): React.ReactNode[] {
  if (!term) return [text]
  const regex = new RegExp(`(${term})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    part.toLowerCase() === term.toLowerCase()
      ? <mark key={i}>{part}</mark>
      : part
  )
}
```

#### Codice Fixato

```typescript
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlightText(text: string, term: string): React.ReactNode[] {
  if (!term) return [text]
  const regex = new RegExp(`(${escapeRegex(term)})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    part.toLowerCase() === term.toLowerCase()
      ? <mark key={i}>{part}</mark>
      : part
  )
}
```

#### Istruzioni Passo-Passo

1. Aprire `smot-desktop/src/pages/ViewerPage.tsx`
2. Aggiungere la funzione `escapeRegex` subito prima di `highlightText`
3. Modificare la riga `const regex = new RegExp(...)` per usare `escapeRegex(term)` al posto di `term`
4. Salvare il file
5. Testare con input malevolo: digitare `(a+)+b` nel campo di ricerca e verificare che la UI non si blocchi

#### Checklist Verifica

- [ ] La funzione `escapeRegex` è definita prima di `highlightText`
- [ ] `highlightText` usa `escapeRegex(term)` nella costruzione della RegExp
- [ ] Input normale funziona ancora (evidenziazione corretta)
- [ ] Input malevolo `(a+)+b` non blocca la UI
- [ ] Input con caratteri speciali come `C++` viene evidenziato correttamente

---

### W3 — Nessun ErrorBoundary nell'App

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | WARNING |
| **Categoria** | Robustezza |
| **File** | `smot-desktop/src/App.tsx` |
| **Effort** | 15 minuti |
| **Priorità** | 1 |

#### Problema

L'app non ha un ErrorBoundary. Qualsiasi errore non catturato in un componente React crasha l'intera applicazione senza recovery.

#### Codice Attuale (App.tsx)

```tsx
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* altre route */}
      </Routes>
    </Router>
  )
}
```

#### Codice Fixato — Creare `src/components/ErrorBoundary.tsx`

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary ha catturato un errore:', error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            textAlign: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#dc2626' }}>
            Qualcosa è andato storto
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
            Si è verificato un errore imprevisto nell'applicazione.
          </p>
          <pre
            style={{
              background: '#f3f4f6',
              padding: '1rem',
              borderRadius: '0.5rem',
              maxWidth: '600px',
              overflow: 'auto',
              fontSize: '0.75rem',
              marginBottom: '1.5rem',
            }}
          >
            {this.state.error?.message}
          </pre>
          <button
            onClick={this.handleReset}
            style={{
              padding: '0.5rem 1.5rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Riprova
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
```

#### Codice Fixato — Aggiornare `App.tsx`

```tsx
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* altre route */}
        </Routes>
      </Router>
    </ErrorBoundary>
  )
}
```

#### Istruzioni Passo-Passo

1. Creare il file `smot-desktop/src/components/ErrorBoundary.tsx` con il codice sopra
2. Aprire `smot-desktop/src/App.tsx`
3. Aggiungere l'import di `ErrorBoundary` in cima al file
4. Wrappare il contenuto di `App()` con `<ErrorBoundary>`
5. Salvare entrambi i file
6. Per testare: aggiungere temporaneamente un componente che lancia un errore:

```tsx
// Solo per test, rimuovere dopo verifica
function CrashTest(): ReactNode {
  throw new Error('Test ErrorBoundary')
}
```

Inserire `<CrashTest />` dentro una Route, verificare che appare il fallback UI, poi rimuovere il componente di test.

#### Checklist Verifica

- [ ] Il file `ErrorBoundary.tsx` esiste in `src/components/`
- [ ] `<ErrorBoundary>` wrappa `<Routes>` in `App.tsx`
- [ ] Un errore forzato mostra il fallback UI invece di crashare
- [ ] Il pulsante "Riprova" resetta lo stato dell'errore
- [ ] L'errore viene loggato in console tramite `componentDidCatch`

---

### W4 — Runtime Async Mancante per Comandi Ollama

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | WARNING |
| **Categoria** | Backend |
| **File** | `smot-desktop/src-tauri/src/ollama.rs`, `smot-desktop/src-tauri/src/main.rs` |
| **Effort** | 30 minuti |
| **Priorità** | 2 |

#### Problema

Il comando `pull_ollama_model` è `async` e usa `reqwest`, ma non c'è una configurazione esplicita del runtime tokio. Tauri 2.x gestisce automaticamente il runtime async, ma è necessario verificare che la dipendenza `tokio` con il feature `rt-multi-thread` sia presente in `Cargo.toml`.

#### Codice Attuale (Cargo.toml, sezione dipendenze)

```toml
[dependencies]
tauri = { version = "2", features = [] }
reqwest = { version = "0.12", features = ["json", "stream"] }
# tokio potrebbe mancare o avere features incomplete
```

#### Codice Fixato (Cargo.toml)

```toml
[dependencies]
tauri = { version = "2", features = [] }
reqwest = { version = "0.12", features = ["json", "stream"] }
tokio = { version = "1", features = ["rt-multi-thread", "macros"] }
```

#### Codice Fixato (ollama.rs, se necessario aggiungere attributo)

Se `pull_ollama_model` è una funzione `async` invocata come comando Tauri, verificare che la firma sia corretta:

```rust
#[tauri::command]
async fn pull_ollama_model(
    app_handle: tauri::AppHandle,
    model_name: String,
) -> Result<serde_json::Value, String> {
    // Il corpo della funzione usa reqwest per lo streaming del download
    let client = reqwest::Client::new();
    let response = client
        .post(format!("http://localhost:11434/api/pull"))
        .json(&serde_json::json!({ "name": model_name, "stream": true }))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    // ... elaborazione dello stream
    Ok(serde_json::json!({ "status": "completed" }))
}
```

#### Istruzioni Passo-Passo

1. Aprire `smot-desktop/src-tauri/Cargo.toml`
2. Verificare se `tokio` è presente nelle dipendenze
3. Se non presente, aggiungere la riga: `tokio = { version = "1", features = ["rt-multi-thread", "macros"] }`
4. Se presente ma senza `rt-multi-thread`, aggiungere il feature
5. Eseguire `cargo build` per verificare la compilazione
6. Eseguire `pull_ollama_model` tramite l'app e verificare che non blocchi il thread principale
7. Verificare che l'UI rimanga responsiva durante il download del modello

#### Checklist Verifica

- [ ] `tokio` con feature `rt-multi-thread` è in `Cargo.toml`
- [ ] `cargo build` compila senza errori
- [ ] `pull_ollama_model` funziona senza bloccare l'UI
- [ ] L'app rimane interattiva durante il download del modello
- [ ] Gli eventi di progresso vengono emessi correttamente

---

### W5 — Race Condition in setup.rs

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | WARNING |
| **Categoria** | Concorrenza |
| **File** | `smot-desktop/src-tauri/src/setup.rs` |
| **Effort** | 10 minuti |
| **Priorità** | 2 |

#### Problema

L'uso di `std::thread::spawn` con `std::thread::sleep` per operazioni ritardate può causare panic se l'app viene chiusa prima che il thread completi, perché `handle.emit()` potrebbe essere chiamato su un'app già distrutta.

#### Codice Attuale

```rust
std::thread::spawn(move || {
    std::thread::sleep(std::time::Duration::from_secs(2));
    handle.emit("system-ready", {}).ok();
});
```

#### Codice Fixato

```rust
tauri::async_runtime::spawn(async move {
    tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
    let _ = handle.emit("system-ready", ());
});
```

#### Istruzioni Passo-Passo

1. Aprire `smot-desktop/src-tauri/src/setup.rs`
2. Individuare tutte le occorrenze di `std::thread::spawn` che usano `std::thread::sleep`
3. Sostituire ogni occorrenza con `tauri::async_runtime::spawn` e `tokio::time::sleep(...).await`
4. Verificare che `tokio` sia tra le dipendenze in `Cargo.toml` (vedi W4)
5. Salvare il file
6. Compilare con `cargo build`
7. Avviare e chiudere rapidamente l'app, verificare nessun panic o warning nella console

#### Checklist Verifica

- [ ] Nessun `std::thread::spawn` con `std::thread::sleep` rimane in `setup.rs`
- [ ] Tutte le operazioni ritardate usano `tauri::async_runtime::spawn`
- [ ] `cargo build` compila senza errori
- [ ] Avvio e chiusura rapida dell'app non generano panic
- [ ] L'evento `system-ready` viene ancora emesso correttamente

---

### W6 — Chiave Pubblica Updater Placeholder

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | WARNING |
| **Categoria** | Sicurezza |
| **File** | `smot-desktop/src-tauri/tauri.conf.json` |
| **Effort** | 10 minuti |
| **Priorità** | 2 |

#### Problema

Il campo `pubkey` contiene un valore placeholder. Senza una chiave pubblica reale, l'updater non può verificare l'integrità degli aggiornamenti, rendendo possibile attacchi di supply chain.

#### Codice Attuale

```json
{
  "plugins": {
    "updater": {
      "pubkey": "PLACEHOLDER_PUBLIC_KEY_REPLACE_AFTER_KEY_GENERATION"
    }
  }
}
```

#### Istruzioni Passo-Passo

1. Generare una coppia di chiavi per il signing degli aggiornamenti:

```bash
cargo tauri signer generate -w ~/.tauri/smot.key
```

2. Il comando chiederà una password per proteggere la chiave privata. Scegliere una password sicura e salvarla in un gestore di password.
3. Il comando stamperà la chiave pubblica. Copiarla.
4. Sostituire il valore placeholder in `tauri.conf.json`:

```json
{
  "plugins": {
    "updater": {
      "pubkey": "CHIAVE_PUBBLICA_GENERATA_QUI"
    }
  }
}
```

5. Salvare la chiave privata (`~/.tauri/smot.key`) in modo sicuro.
6. Configurare la chiave privata come GitHub Secret `TAURI_SIGNING_PRIVATE_KEY` per la CI.
7. Configurare la password come GitHub Secret `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`.

#### Codice Fixato (esempio con chiave generata)

```json
{
  "plugins": {
    "updater": {
      "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IDY0NjQ2MzQ2MzQ2MzQ2MzQKUldTR05BS0J2..."
    }
  }
}
```

#### Checklist Verifica

- [ ] La coppia di chiavi è stata generata con `cargo tauri signer generate`
- [ ] Il campo `pubkey` in `tauri.conf.json` non contiene più "PLACEHOLDER"
- [ ] La chiave privata è salvata in modo sicuro (non nel repository)
- [ ] I GitHub Secrets `TAURI_SIGNING_PRIVATE_KEY` e `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` sono configurati
- [ ] Una build di test firma correttamente il binario

---

### W7 — Code Signing Disabilitato in Tutti i Workflow CI

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | WARNING |
| **Categoria** | Sicurezza / CI |
| **File** | `.github/workflows/build-windows.yml`, `.github/workflows/build-macos.yml`, `.github/workflows/build-linux.yml` |
| **Effort** | 2-4 ore |
| **Priorità** | 2 |

#### Problema

Gli step di code signing sono commentati o disabilitati in tutti e tre i workflow CI. I binari prodotti non sono firmati, il che genera warning su Windows (SmartScreen) e macOS (Gatekeeper).

#### Codice Attuale (esempio: build-windows.yml)

```yaml
# - name: Sign Windows executable
#   run: |
#     signtool sign /f certificate.pfx /p ${{ secrets.CERT_PASSWORD }} /tr http://timestamp.digicert.com /td sha256 /fd sha256 target/release/smot.exe
```

#### Codice Fixato (build-windows.yml)

```yaml
- name: Sign Windows executable
  if: github.ref == 'refs/heads/main'
  run: |
    signtool sign /f certificate.pfx /p ${{ secrets.CERT_PASSWORD }} /tr http://timestamp.digicert.com /td sha256 /fd sha256 target/release/smot.exe
  shell: pwsh
```

#### Codice Fixato (build-macos.yml)

```yaml
- name: Sign macOS application
  if: github.ref == 'refs/heads/main'
  run: |
    codesign --sign "${{ secrets.MACOS_SIGNING_IDENTITY }}" --force --deep target/release/bundle/macos/SMOT.app
  shell: bash

- name: Notarize macOS application
  if: github.ref == 'refs/heads/main'
  run: |
    xcrun notarytool submit target/release/bundle/dmg/SMOT.dmg --apple-id "${{ secrets.APPLE_ID }}" --password "${{ secrets.APPLE_APP_PASSWORD }}" --team-id "${{ secrets.APPLE_TEAM_ID }}" --wait
  shell: bash
```

#### Codice Fixato (build-linux.yml)

```yaml
- name: Sign Linux AppImage
  if: github.ref == 'refs/heads/main'
  run: |
    gpg --batch --yes --passphrase "${{ secrets.GPG_PASSPHRASE }}" --default-key "${{ secrets.GPG_KEY_ID }}" --detach-sign target/release/SMOT.AppImage
  shell: bash
```

#### Istruzioni Passo-Passo

1. Ottenere un certificato EV Code Signing per Windows da una CA (DigiCert, Sectigo, ecc.)
2. Ottenere un certificato Apple Developer per macOS
3. Generare una chiave GPG per la firma su Linux
4. Configurare i seguenti GitHub Secrets nel repository:
   - `CERT_PASSWORD`: password del certificato Windows
   - `MACOS_SIGNING_IDENTITY`: identity per codesign
   - `APPLE_ID`: Apple ID email
   - `APPLE_APP_PASSWORD`: app-specific password
   - `APPLE_TEAM_ID`: team ID Apple
   - `GPG_KEY_ID`: ID della chiave GPG
   - `GPG_PASSPHRASE`: passphrase della chiave GPG
5. Decommentare gli step di signing nei tre workflow
6. Aggiungere la condizione `if: github.ref == 'refs/heads/main'` per firmare solo le release
7. Pushare e verificare che la build CI produca binari firmati

#### Checklist Verifica

- [ ] Certificato EV Code Signing ottenuto per Windows
- [ ] Certificato Apple Developer ottenuto per macOS
- [ ] Chiave GPG generata per Linux
- [ ] Tutti i GitHub Secrets configurati
- [ ] Gli step di signing sono decommentati nei tre workflow
- [ ] La condizione `if: github.ref == 'refs/heads/main'` è presente
- [ ] Una build CI su `main` produce binari firmati
- [ ] Su Windows, il binario non genera warning SmartScreen
- [ ] Su macOS, il binario passa Gatekeeper

---

### W8 — Gestione Errori Inconsistente nel Backend

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | WARNING |
| **Categoria** | Architettura |
| **File** | `lib.rs`, `db.rs`, `setup.rs` |
| **Effort** | 2-3 ore |
| **Priorità** | 3 |

#### Problema

Tre pattern di gestione errori diversi coesistono:
- `lib.rs` usa `Result<T, String>`
- `db.rs` usa `Box<dyn Error>`
- `setup.rs` usa `log::error!` senza propagare l'errore

Questo rende il codice difficile da mantenere e propaga errori in modo inconsistente.

#### Codice Attuale (lib.rs)

```rust
fn get_system_status() -> Result<serde_json::Value, String> {
    // ...
}
```

#### Codice Attuale (db.rs)

```rust
fn init_database() -> Result<Connection, Box<dyn std::error::Error>> {
    // ...
}
```

#### Codice Attuale (setup.rs)

```rust
log::error!("Errore durante il setup: {}", e);
// nessun Result ritornato
```

#### Codice Fixato — Creare `src/error.rs`

```rust
use std::fmt;

#[derive(Debug)]
pub enum AppError {
    Database(String),
    Network(String),
    Io(std::io::Error),
    Parse(String),
    Config(String),
    NotFound(String),
    Unauthorized(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::Database(msg) => write!(f, "Errore database: {}", msg),
            AppError::Network(msg) => write!(f, "Errore di rete: {}", msg),
            AppError::Io(err) => write!(f, "Errore I/O: {}", err),
            AppError::Parse(msg) => write!(f, "Errore di parsing: {}", msg),
            AppError::Config(msg) => write!(f, "Errore di configurazione: {}", msg),
            AppError::NotFound(msg) => write!(f, "Non trovato: {}", msg),
            AppError::Unauthorized(msg) => write!(f, "Non autorizzato: {}", msg),
        }
    }
}

impl std::error::Error for AppError {}

impl From<rusqlite::Error> for AppError {
    fn from(err: rusqlite::Error) -> Self {
        AppError::Database(err.to_string())
    }
}

impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        AppError::Io(err)
    }
}

impl From<reqwest::Error> for AppError {
    fn from(err: reqwest::Error) -> Self {
        AppError::Network(err.to_string())
    }
}

impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        AppError::Parse(err.to_string())
    }
}

impl From<AppError> for String {
    fn from(err: AppError) -> String {
        err.to_string()
    }
}
```

#### Codice Fixato — Aggiornare `lib.rs`

```rust
use crate::error::AppError;

fn get_system_status(state: tauri::State<AppState>) -> Result<serde_json::Value, AppError> {
    let db = state.db.lock().map_err(|e| AppError::Database(e.to_string()))?;
    // ...
    Ok(serde_json::json!({ /* ... */ }))
}
```

#### Codice Fixato — Aggiornare `db.rs`

```rust
use crate::error::AppError;

pub fn init_database() -> Result<Connection, AppError> {
    let db = Connection::open(&db_path)?;
    // ...
    Ok(db)
}
```

#### Codice Fixato — Aggiornare `setup.rs`

```rust
use crate::error::AppError;

pub fn setup(app: &tauri::App) -> Result<(), AppError> {
    // ...
    if let Err(e) = some_operation() {
        log::error!("Errore durante il setup: {}", e);
        return Err(e);
    }
    Ok(())
}
```

#### Istruzioni Passo-Passo

1. Creare il file `smot-desktop/src-tauri/src/error.rs` con il codice sopra
2. Aggiungere `mod error;` in `lib.rs` o `main.rs`
3. Aggiornare `lib.rs`: cambiare tutti i `Result<T, String>` in `Result<T, AppError>`
4. Aggiornare `db.rs`: cambiare tutti i `Result<T, Box<dyn Error>>` in `Result<T, AppError>`
5. Aggiornare `setup.rs`: far ritornare `Result<(), AppError>` e propagare gli errori
6. Aggiungere `impl From<AppError> for String` per la compatibilità con Tauri (che richiede `String` come errore)
7. Eseguire `cargo build` e risolvere eventuali errori di compilazione
8. Eseguire `cargo clippy` per verificare la coerenza

#### Checklist Verifica

- [ ] Il file `error.rs` esiste con l'enum `AppError`
- [ ] `mod error;` è dichiarato in `lib.rs` o `main.rs`
- [ ] `lib.rs` usa `Result<T, AppError>`
- [ ] `db.rs` usa `Result<T, AppError>`
- [ ] `setup.rs` ritorna `Result<(), AppError>`
- [ ] `impl From<X> for AppError` esiste per ogni tipo di errore usato
- [ ] `cargo build` compila senza errori
- [ ] `cargo clippy` non segnala warning

---

### W9 — Calcolo ETA Download Basato su Rate Fisso

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | WARNING |
| **Categoria** | UX / Correttezza |
| **File** | `smot-desktop/src-tauri/src/ollama.rs` |
| **Effort** | 15 minuti |
| **Priorità** | 2 |

#### Problema

Il calcolo dell'ETA assume un rate di trasferimento fisso (diviso per 5.0), il che produce stime inaccurate all'inizio del download e quando la velocità varia.

#### Codice Attuale

```rust
let eta_seconds = (total - completed) / (completed / 5.0);
```

#### Codice Fixato

```rust
let elapsed_secs = start_time.elapsed().as_secs_f64().max(0.001);
let completed_mb = completed / 1_048_576.0;
let total_mb = total / 1_048_576.0;
let speed_mbps = completed_mb / elapsed_secs;
let eta_seconds = (total_mb - completed_mb) / speed_mbps.max(0.01);
```

#### Istruzioni Passo-Passo

1. Aprire `smot-desktop/src-tauri/src/ollama.rs`
2. Individuare la riga con il calcolo dell'ETA
3. Sostituire il calcolo fisso con il calcolo basato sulla velocità media
4. Verificare che `start_time` sia disponibile nello scope della funzione (dovrebbe essere un `std::time::Instant` creatato all'inizio del download)
5. Se `start_time` non esiste, aggiungerlo all'inizio della funzione di download:

```rust
let start_time = std::time::Instant::now();
```

6. Salvare il file
7. Compilare con `cargo build`
8. Testare il download di un modello e verificare che l'ETA sia ragionevole fin dall'inizio

#### Checklist Verifica

- [ ] Il calcolo dell'ETA usa la velocità media reale
- [ ] `start_time` è definito all'inizio della funzione di download
- [ ] L'ETA non mostra valori assurdi all'inizio del download
- [ ] L'ETA si aggiorna correttamente durante il download
- [ ] `cargo build` compila senza errori

---

### W10 — Nessun Allowlist Comandi IPC

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | WARNING |
| **Categoria** | Sicurezza |
| **File** | `smot-desktop/src-tauri/tauri.conf.json` |
| **Effort** | 30 minuti |
| **Priorità** | 2 |

#### Problema

Non c'è una allowlist esplicita dei comandi IPC consentiti. In Tauri 2.x, i comandi sono esposti tramite `invoke_handler`, ma una allowlist nella configurazione aggiunge un ulteriore livello di sicurezza.

#### Codice Attuale

La sezione `security` in `tauri.conf.json` non contiene una allowlist dei comandi.

#### Codice Fixato

In Tauri 2.x, la gestione dei permessi avviene tramite le capability. Creare o aggiornare il file `smot-desktop/src-tauri/capabilities/default.json`:

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Capability per lo scope predefinito",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "core:window:default",
    "core:window:allow-close",
    "core:window:allow-set-title",
    "shell:allow-open",
    "dialog:allow-open",
    "dialog:allow-save",
    "fs:default",
    "fs:allow-read-file",
    "fs:allow-write-file",
    "http:default",
    "http:allow-fetch"
  ]
}
```

#### Istruzioni Passo-Passo

1. Verificare se esiste già la directory `smot-desktop/src-tauri/capabilities/`
2. Se non esiste, crearla
3. Creare o aggiornare il file `default.json` con la configurazione sopra
4. Rimuovere eventuali permessi non necessari
5. Aggiungere solo i permessi effettivamente usati dall'app
6. Riavviare l'app e verificare che tutte le funzionalità funzionino ancora
7. Verificare che comandi non nella lista vengano bloccati

#### Checklist Verifica

- [ ] Il file `capabilities/default.json` esiste
- [ ] Contiene solo i permessi necessari
- [ ] L'app funziona correttamente con la allowlist
- [ ] Tentativi di usare permessi non nella lista vengono bloccati
- [ ] La documentazione di Tauri 2.x sulle capability è stata consultata

---

### W11 — Nessun Header di Sicurezza in Vite

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | WARNING |
| **Categoria** | Sicurezza |
| **File** | `smot-desktop/vite.config.ts` |
| **Effort** | 5 minuti |
| **Priorità** | 2 |

#### Problema

Il server di sviluppo Vite non configura header di sicurezza, permettendo potenziali attacchi MIME-type sniffing, clickjacking e information leakage tramite referrer.

#### Codice Attuale

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // ... altre configurazioni, nessun header di sicurezza
})
```

#### Codice Fixato

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-XSS-Protection': '1; mode=block',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
  },
  // ... altre configurazioni esistenti
})
```

#### Istruzioni Passo-Passo

1. Aprire `smot-desktop/vite.config.ts`
2. Aggiungere la sezione `server` con gli `headers` come mostrato sopra
3. Se la sezione `server` esiste già, aggiungere solo la proprietà `headers`
4. Salvare il file
5. Riavviare il server di sviluppo: `npm run dev`
6. Verificare con: `curl -I http://localhost:1420`
7. Controllare che gli header siano presenti nella risposta

#### Checklist Verifica

- [ ] La sezione `server.headers` è presente in `vite.config.ts`
- [ ] `X-Content-Type-Options: nosniff` è presente nella risposta
- [ ] `X-Frame-Options: DENY` è presente nella risposta
- [ ] `Referrer-Policy: strict-origin-when-cross-origin` è presente nella risposta
- [ ] L'app funziona correttamente con i nuovi header

---

### W12 — Supporto .xlsx Mancante nei Parser

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | WARNING |
| **Categoria** | Funzionalità |
| **File** | `smot-desktop/src-tauri/src/parsers.rs` |
| **Effort** | 1-2 ore |
| **Priorità** | 3 |

#### Problema

Il parser non supporta i file `.xlsx`. Quando un utente carica un file Excel, riceve un errore generico o nessun contenuto.

#### Codice Attuale (ipotetico)

```rust
fn parse_document_text(file_path: &str) -> Result<String, String> {
    let extension = Path::new(file_path)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("");

    match extension {
        "pdf" => extract_pdf(file_path),
        "txt" => extract_text(file_path),
        "docx" => extract_docx(file_path),
        _ => Err(format!("Formato non supportato: {}", extension)),
    }
}
```

#### Codice Fixato — Aggiungere dipendenza in `Cargo.toml`

```toml
[dependencies]
calamine = "0.22"
```

#### Codice Fixato — Aggiungere funzione `extract_xlsx` in `parsers.rs`

```rust
use calamine::{open_workbook_auto, DataType, Reader};

fn extract_xlsx(file_path: &str) -> Result<String, String> {
    let mut workbook = open_workbook_auto(file_path)
        .map_err(|e| format!("Errore apertura file XLSX: {}", e))?;

    let mut text_content = String::new();

    let sheet_names = workbook.sheet_names().to_vec();
    for sheet_name in &sheet_names {
        text_content.push_str(&format!("=== Foglio: {} ===\n", sheet_name));

        let range = workbook
            .worksheet_range(sheet_name)
            .map_err(|e| format!("Errore lettura foglio {}: {}", sheet_name, e))?;

        for row in range.rows() {
            let row_text: Vec<String> = row
                .iter()
                .map(|cell| match cell {
                    DataType::String(s) => s.clone(),
                    DataType::Float(f) => f.to_string(),
                    DataType::Int(i) => i.to_string(),
                    DataType::Bool(b) => b.to_string(),
                    DataType::DateTime(dt) => dt.to_string(),
                    DataType::Error(e) => format!("ERRORE: {:?}", e),
                    DataType::Empty => String::new(),
                })
                .collect();
            text_content.push_str(&row_text.join("\t"));
            text_content.push('\n');
        }
        text_content.push('\n');
    }

    Ok(text_content)
}
```

#### Codice Fixato — Aggiornare `parse_document_text`

```rust
fn parse_document_text(file_path: &str) -> Result<String, String> {
    let extension = Path::new(file_path)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    match extension.as_str() {
        "pdf" => extract_pdf(file_path),
        "txt" => extract_text(file_path),
        "docx" => extract_docx(file_path),
        "xlsx" | "xls" => extract_xlsx(file_path),
        "csv" => extract_text(file_path),
        "md" => extract_text(file_path),
        _ => Err(format!(
            "Formato file non supportato: .{}. Formati supportati: .pdf, .txt, .docx, .xlsx, .xls, .csv, .md",
            extension
        )),
    }
}
```

#### Istruzioni Passo-Passo

1. Aggiungere `calamine = "0.22"` in `Cargo.toml` sotto `[dependencies]`
2. Aprire `smot-desktop/src-tauri/src/parsers.rs`
3. Aggiungere gli import di `calamine` in cima al file
4. Implementare la funzione `extract_xlsx` come sopra
5. Aggiornare il `match` in `parse_document_text` per includere i casi `"xlsx"` e `"xls"`
6. Migliorare il messaggio di errore del caso `_` per elencare i formati supportati
7. Eseguire `cargo build` per verificare la compilazione
8. Testare con un file `.xlsx` reale e verificare che il testo venga estratto correttamente
9. Testare con un formato non supportato (es. `.pptx`) e verificare che l'errore sia chiaro

#### Checklist Verifica

- [ ] `calamine` è in `Cargo.toml`
- [ ] La funzione `extract_xlsx` è implementata in `parsers.rs`
- [ ] `parse_document_text` gestisce i casi `"xlsx"` e `"xls"`
- [ ] Il messaggio di errore per formati non supportati elenca i formati validi
- [ ] `cargo build` compila senza errori
- [ ] Upload di un file `.xlsx` restituisce testo estratto
- [ ] Upload di un formato non supportato restituisce errore chiaro

---

## SUGGESTION

### S1 — Pattern di Styling Inconsistenti

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | SUGGESTION |
| **Categoria** | Consistenza |
| **File** | Componenti onboarding (`SystemDiscoveryStep.tsx`, `CompletionStep.tsx`, ecc.) |
| **Effort** | 4-6 ore |
| **Priorità** | 4 |

#### Problema

I componenti onboarding usano `style={{...}}` inline, mentre il resto dell'app usa classi CSS. Questo crea inconsistenza visiva e rende la manutenzione più difficile.

#### Codice Attuale (esempio)

```tsx
<div style={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '2rem',
  backgroundColor: '#1a1a2e',
}}>
  <h2 style={{ color: '#e94560', fontSize: '1.5rem' }}>Titolo</h2>
</div>
```

#### Codice Fixato — Creare `src/styles/onboarding.module.css`

```css
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: #1a1a2e;
}

.title {
  color: #e94560;
  font-size: 1.5rem;
}
```

#### Codice Fixato — Aggiornare il componente

```tsx
import styles from '../styles/onboarding.module.css'

function SystemDiscoveryStep() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Titolo</h2>
    </div>
  )
}
```

#### Istruzioni Passo-Passo

1. Creare il file `src/styles/onboarding.module.css`
2. Per ogni componente onboarding, estrarre tutti gli stili inline nel file CSS module
3. Sostituire ogni `style={{...}}` con `className={styles.nomeClasse}`
4. Ripetere per tutti i componenti onboarding
5. Verificare visivamente che l'aspetto non sia cambiato
6. Eseguire `npx tsc --noEmit` per verificare che non ci siano errori TypeScript

#### Checklist Verifica

- [ ] Nessun `style={{...}}` inline rimane nei componenti onboarding
- [ ] Tutti gli stili sono in file CSS module
- [ ] L'aspetto visivo è identico a prima della migrazione
- [ ] `npx tsc --noEmit` non segnala errori

---

### S2 — 15+ Funzioni Senza Tipo di Ritorno Esplicito

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | SUGGESTION |
| **Categoria** | TypeScript |
| **File** | `App.tsx`, `ChatPage.tsx`, `SettingsPage.tsx`, `IndexingPage.tsx`, `UploadPage.tsx` |
| **Effort** | 1-2 ore |
| **Priorità** | 4 |

#### Problema

Molte funzioni non dichiarano esplicitamente il tipo di ritorno, lasciando TypeScript inferirlo. Questo riduce la leggibilità e può mascherare bug.

#### Codice Attuale (esempi)

```typescript
// App.tsx
function App() {
  return (
    // ...
  )
}

// ChatPage.tsx
function handleChatSubmit(e) {
  e.preventDefault()
}

// SettingsPage.tsx
function fetchSettings() {
  const response = await fetch('/api/settings')
  return response.json()
}
```

#### Codice Fixato

```typescript
// App.tsx
function App(): React.JSX.Element {
  return (
    // ...
  )
}

// ChatPage.tsx
function handleChatSubmit(e: React.FormEvent<HTMLFormElement>): void {
  e.preventDefault()
}

// SettingsPage.tsx
async function fetchSettings(): Promise<Settings> {
  const response = await fetch('/api/settings')
  return response.json()
}
```

#### Istruzioni Passo-Passo

1. Eseguire `npx tsc --noEmit` per identificare tutte le funzioni con tipo di ritorno implicito
2. Per ogni funzione senza tipo di ritorno:
   - Se è un componente React: aggiungere `: React.JSX.Element`
   - Se è un event handler: aggiungere `: void`
   - Se è una funzione async: aggiungere `: Promise<T>` dove T è il tipo del dato ritornato
   - Se è una funzione sincrona: aggiungere il tipo specifico (es. `: string`, `: number`)
3. Se `strict: true` è già abilitato (vedi C2), TypeScript segnalerà automaticamente questi errori
4. Salvare e verificare con `npx tsc --noEmit`

#### Checklist Verifica

- [ ] Tutte le funzioni hanno un tipo di ritorno esplicito
- [ ] `npx tsc --noEmit` non segnala errori di tipo
- [ ] Nessun `implicit any` nei tipi di ritorno

---

### S3 — Label ARIA Mancanti su Bottoni

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | SUGGESTION |
| **Categoria** | Accessibilità |
| **File** | `ChatPage.tsx`, `SettingsPage.tsx`, `GraphControls.tsx` |
| **Effort** | 30 minuti |
| **Priorità** | 4 |

#### Problema

Bottoni che contengono solo icone o testo non descrittivo mancano di `aria-label`, rendendoli inaccessibili agli screen reader.

#### Codice Attuale (esempi)

```tsx
<button onClick={handleSend}>
  <SendIcon />
</button>

<button onClick={handleClear}>
  <TrashIcon />
</button>

<button onClick={handleZoomIn}>
  <ZoomInIcon />
</button>
```

#### Codice Fixato

```tsx
<button onClick={handleSend} aria-label="Invia messaggio">
  <SendIcon />
</button>

<button onClick={handleClear} aria-label="Cancella chat">
  <TrashIcon />
</button>

<button onClick={handleZoomIn} aria-label="Aumenta zoom">
  <ZoomInIcon />
</button>
```

#### Istruzioni Passo-Passo

1. Aprire ogni file elencato
2. Cercare tutti gli elementi `<button>` che contengono solo icone o testo breve
3. Per ogni bottone senza `aria-label`, aggiungere un attributo `aria-label` con una descrizione chiara dell'azione
4. Le label devono essere in italiano (coerente con la lingua dell'app)
5. Verificare con uno screen reader o con Lighthouse audit

#### Checklist Verifica

- [ ] Tutti i bottoni con solo icone hanno `aria-label`
- [ ] Le label sono descrittive e in italiano
- [ ] Lighthouse audit accessibilità supera 90
- [ ] Nessun bottone con solo icona è senza `aria-label`

---

### S4 — Nessuna Navigazione da Tastiera in GraphView

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | SUGGESTION |
| **Categoria** | Accessibilità |
| **File** | `GraphCanvas.tsx`, `GraphNode.tsx` |
| **Effort** | 1-2 ore |
| **Priorità** | 4 |

#### Problema

La vista a grafo non è navigabile da tastiera. Non ci sono `tabIndex`, gestori `onKeyDown` o ruoli ARIA appropriati.

#### Codice Attuale (GraphCanvas.tsx)

```tsx
<svg width={width} height={height}>
  {/* nodi e archi */}
</svg>
```

#### Codice Fixato (GraphCanvas.tsx)

```tsx
const [focusedNode, setFocusedNode] = useState<string | null>(null)

const handleKeyDown = (e: React.KeyboardEvent<SVGSVGElement>): void => {
  if (!focusedNode) return

  const nodeIds = nodes.map((n) => n.id)
  const currentIndex = nodeIds.indexOf(focusedNode)

  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown': {
      e.preventDefault()
      const nextIndex = Math.min(currentIndex + 1, nodeIds.length - 1)
      setFocusedNode(nodeIds[nextIndex])
      break
    }
    case 'ArrowLeft':
    case 'ArrowUp': {
      e.preventDefault()
      const prevIndex = Math.max(currentIndex - 1, 0)
      setFocusedNode(nodeIds[prevIndex])
      break
    }
    case 'Enter': {
      e.preventDefault()
      onNodeSelect(focusedNode)
      break
    }
  }
}

<svg
  width={width}
  height={height}
  tabIndex={0}
  role="img"
  aria-label={`Grafo con ${nodes.length} nodi e ${edges.length} connessioni`}
  onKeyDown={handleKeyDown}
>
  {/* nodi e archi */}
</svg>
```

#### Codice Fixato (GraphNode.tsx)

```tsx
<g
  tabIndex={focusedNode === node.id ? 0 : -1}
  role="button"
  aria-label={`Nodo: ${node.label}`}
  aria-selected={focusedNode === node.id}
  onClick={() => onNodeSelect(node.id)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onNodeSelect(node.id)
    }
  }}
>
  {/* contenuto del nodo */}
</g>
```

#### Istruzioni Passo-Passo

1. Aprire `GraphCanvas.tsx`
2. Aggiungere lo stato `focusedNode` e il gestore `handleKeyDown`
3. Aggiungere `tabIndex={0}`, `role="img"`, `aria-label` e `onKeyDown` all'SVG
4. Aprire `GraphNode.tsx`
5. Aggiungere `tabIndex`, `role="button"`, `aria-label`, `aria-selected` e `onKeyDown` al `<g>`
6. Verificare che la navigazione con Tab funzioni
7. Verificare che le frecce muovano il focus tra i nodi
8. Verificare che Enter selezioni un nodo

#### Checklist Verifica

- [ ] L'SVG ha `tabIndex={0}` e `role="img"`
- [ ] I nodi hanno `role="button"` e `aria-label`
- [ ] Le frecce muovono il focus tra i nodi
- [ ] Enter seleziona il nodo focalizzato
- [ ] Tab entra e esce dal grafo

---

### S5 — Attributo `lang` Mancante su `<html>`

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | SUGGESTION |
| **Categoria** | Accessibilità |
| **File** | `smot-desktop/src/main.tsx` o `smot-desktop/index.html` |
| **Effort** | 2 minuti |
| **Priorità** | 4 |

#### Problema

L'elemento `<html>` non ha l'attributo `lang`, il che impedisce agli screen reader di determinare la lingua della pagina.

#### Codice Attuale (index.html)

```html
<html>
  <head>
    <!-- ... -->
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

#### Codice Fixato (index.html)

```html
<html lang="it">
  <head>
    <!-- ... -->
  </head>
  <body>
    <div id="root"></div>
  </div>
</html>
```

#### Alternativa: Impostare via JavaScript in `main.tsx`

```typescript
document.documentElement.lang = 'it'
```

Aggiungere questa riga all'inizio di `main.tsx`, prima di `createRoot`.

#### Istruzioni Passo-Passo

1. Aprire `smot-desktop/index.html`
2. Aggiungere `lang="it"` al tag `<html>`
3. Salvare il file
4. Verificare con `document.documentElement.lang` nella console del browser

#### Checklist Verifica

- [ ] `<html lang="it">` è presente in `index.html`
- [ ] `document.documentElement.lang` restituisce `"it"`
- [ ] Lighthouse audit non segnala l'errore "html element does not have a lang attribute"

---

### S6 — Nessuna Cache Dipendenze in CI

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | SUGGESTION |
| **Categoria** | CI/CD |
| **File** | `.github/workflows/build-windows.yml`, `.github/workflows/build-macos.yml`, `.github/workflows/build-linux.yml` |
| **Effort** | 30 minuti |
| **Priorità** | 5 |

#### Problema

I workflow CI non cachano `node_modules` né `~/.cargo`, causando rebuild completi a ogni esecuzione.

#### Codice Attuale (esempio: build-linux.yml)

```yaml
steps:
  - uses: actions/checkout@v4
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: '20'
  - name: Install dependencies
    run: npm ci
  - name: Build
    run: npm run build
```

#### Codice Fixato

```yaml
steps:
  - uses: actions/checkout@v4

  - name: Cache node_modules
    uses: actions/cache@v4
    with:
      path: |
        node_modules
        ~/.npm
      key: node-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
      restore-keys: |
        node-${{ runner.os }}-

  - name: Cache Cargo
    uses: actions/cache@v4
    with:
      path: |
        ~/.cargo/registry
        ~/.cargo/git
        src-tauri/target
      key: cargo-${{ runner.os }}-${{ hashFiles('src-tauri/Cargo.lock') }}
      restore-keys: |
        cargo-${{ runner.os }}-

  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: '20'

  - name: Install dependencies
    run: npm ci

  - name: Build
    run: npm run build
```

#### Istruzioni Passo-Passo

1. Aprire ogni workflow file in `.github/workflows/`
2. Aggiungere gli step di cache **prima** degli step di installazione
3. Per `node_modules`: cachare `node_modules` e `~/.npm` con key basata su `package-lock.json`
4. Per Cargo: cachare `~/.cargo/registry`, `~/.cargo/git` e `src-tauri/target` con key basata su `Cargo.lock`
5. Ripetere per tutti e tre i workflow
6. Pushare e verificare che la seconda esecuzione CI sia significativamente più veloce

#### Checklist Verifica

- [ ] Gli step di cache sono presenti in tutti e tre i workflow
- [ ] Le key di cache usano gli hash dei lockfile
- [ ] I `restore-keys` sono configurati per fallback parziali
- [ ] La seconda esecuzione CI è più veloce della prima
- [ ] I log CI mostrano "Cache hit" o "Cache restored"

---

### S7 — Chat Query Restituisce Solo Italiano

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | SUGGESTION |
| **Categoria** | i18n |
| **File** | `smot-desktop/src-tauri/src/lib.rs` |
| **Effort** | Da definire (dipende dall'implementazione reale) |
| **Priorità** | 5 |

#### Problema

Il comando `chat_query` restituisce risposte hardcoded in italiano, senza supporto per altre lingue.

#### Codice Attuale

```rust
Ok(serde_json::json!({
    "answer": "Ecco i documenti trovati per la tua query.",
    "sources": []
}))
```

#### Codice Fixato (quando il comando sarà implementato realmente)

```rust
#[tauri::command]
async fn chat_query(
    state: tauri::State<'_, AppState>,
    query: String,
    lang: Option<String>,
) -> Result<serde_json::Value, String> {
    let language = lang.unwrap_or_else(|| "it".to_string());

    let no_results_msg = match language.as_str() {
        "en" => "No documents found for the specified query.",
        "de" => "Keine Dokumente für die angegebene Abfrage gefunden.",
        "fr" => "Aucun document trouvé pour la requête spécifiée.",
        _ => "Nessun documento trovato per la query specificata.",
    };

    // ... logica di ricerca reale ...

    if results.is_empty() {
        return Ok(serde_json::json!({
            "answer": no_results_msg,
            "sources": []
        }));
    }

    let found_msg = match language.as_str() {
        "en" => format!("Found {} results for: {}", results.len(), query),
        "de" => format!("{} Ergebnisse gefunden für: {}", results.len(), query),
        "fr" => format!("{} résultats trouvés pour : {}", results.len(), query),
        _ => format!("Trovati {} risultati per: {}", results.len(), query),
    };

    Ok(serde_json::json!({
        "answer": found_msg,
        "sources": results
    }))
}
```

#### Istruzioni Passo-Passo

1. Questo fix va applicato quando il comando `chat_query` sarà implementato realmente (vedi W1)
2. Aggiungere il parametro opzionale `lang: Option<String>` alla firma del comando
3. Implementare la logica di selezione della lingua come mostrato sopra
4. Dal frontend, passare la lingua configurata dall'utente nell'invoke
5. Per un supporto i18n completo, considerare l'uso di un file di traduzioni esterno

#### Checklist Verifica

- [ ] Il comando `chat_query` accetta un parametro `lang` opzionale
- [ ] Le risposte sono nella lingua corretta in base al parametro
- [ ] Il default è italiano (`"it"`)
- [ ] Il frontend passa la lingua configurata dall'utente

---

### S8 — `db.rs` Ha Solo 2 Funzioni

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | SUGGESTION |
| **Categoria** | Architettura |
| **File** | `smot-desktop/src-tauri/src/db.rs` |
| **Effort** | 4-6 ore |
| **Priorità** | 4 |

#### Problema

Il file `db.rs` contiene solo 2 funzioni (`init_database` e `create_tables`), mentre tutta la logica SQL è sparsa nei comandi in `lib.rs`. Questo viola il principio di separazione delle responsabilità.

#### Codice Fixato — Espandere `db.rs`

```rust
use rusqlite::{Connection, params};
use crate::error::AppError;

pub fn init_database() -> Result<Connection, AppError> {
    let db_path = get_db_path()?;
    let conn = Connection::open(&db_path)?;
    create_tables(&conn)?;
    Ok(conn)
}

fn get_db_path() -> Result<String, AppError> {
    let home = dirs::home_dir().ok_or(AppError::Config("Home directory non trovata".into()))?;
    let db_dir = home.join(".smot").join("data");
    std::fs::create_dir_all(&db_dir)?;
    Ok(db_dir.join("smot.db").to_string_lossy().into_owned())
}

fn create_tables(conn: &Connection) -> Result<(), AppError> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            file_type TEXT NOT NULL,
            size_bytes INTEGER NOT NULL,
            uploaded_at TEXT NOT NULL,
            indexed INTEGER DEFAULT 0
        );
        CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
            id,
            filename,
            content,
            content='documents',
            content_rowid='rowid'
        );"
    )?;
    Ok(())
}

pub fn insert_document(
    conn: &Connection,
    id: &str,
    filename: &str,
    file_type: &str,
    size_bytes: i64,
) -> Result<(), AppError> {
    conn.execute(
        "INSERT INTO documents (id, filename, file_type, size_bytes, uploaded_at, indexed) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![id, filename, file_type, size_bytes, chrono::Utc::now().to_rfc3339(), false],
    )?;
    Ok(())
}

pub fn get_all_documents(conn: &Connection) -> Result<Vec<serde_json::Value>, AppError> {
    let mut stmt = conn.prepare(
        "SELECT id, filename, file_type, size_bytes, uploaded_at, indexed FROM documents ORDER BY uploaded_at DESC"
    )?;
    let rows = stmt.query_map([], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "filename": row.get::<_, String>(1)?,
            "file_type": row.get::<_, String>(2)?,
            "size_bytes": row.get::<_, i64>(3)?,
            "uploaded_at": row.get::<_, String>(4)?,
            "indexed": row.get::<_, bool>(5)?
        }))
    })?;
    let mut results = Vec::new();
    for row in rows {
        results.push(row?);
    }
    Ok(results)
}

pub fn get_document_by_id(conn: &Connection, id: &str) -> Result<Option<serde_json::Value>, AppError> {
    let mut stmt = conn.prepare(
        "SELECT id, filename, file_type, size_bytes, uploaded_at, indexed FROM documents WHERE id = ?1"
    )?;
    let mut rows = stmt.query_map([id], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "filename": row.get::<_, String>(1)?,
            "file_type": row.get::<_, String>(2)?,
            "size_bytes": row.get::<_, i64>(3)?,
            "uploaded_at": row.get::<_, String>(4)?,
            "indexed": row.get::<_, bool>(5)?
        }))
    })?;
    match rows.next() {
        Some(row) => Ok(Some(row?)),
        None => Ok(None),
    }
}

pub fn search_fts5(conn: &Connection, query: &str) -> Result<Vec<serde_json::Value>, AppError> {
    let mut stmt = conn.prepare(
        "SELECT d.id, d.filename, snippet(documents_fts, 0, '>>>', '<<<', '...', 10) as snippet \
         FROM documents_fts fts \
         JOIN documents d ON d.id = fts.id \
         WHERE documents_fts MATCH ?1 \
         ORDER BY rank \
         LIMIT 5"
    )?;
    let rows = stmt.query_map([query], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "filename": row.get::<_, String>(1)?,
            "snippet": row.get::<_, String>(2)?
        }))
    })?;
    let mut results = Vec::new();
    for row in rows {
        results.push(row?);
    }
    Ok(results)
}

pub fn update_indexing_status(
    conn: &Connection,
    id: &str,
    indexed: bool,
) -> Result<(), AppError> {
    conn.execute(
        "UPDATE documents SET indexed = ?1 WHERE id = ?2",
        params![indexed, id],
    )?;
    Ok(())
}
```

#### Istruzioni Passo-Passo

1. Aprire `smot-desktop/src-tauri/src/db.rs`
2. Aggiungere le funzioni `insert_document`, `get_all_documents`, `get_document_by_id`, `search_fts5`, `update_indexing_status`
3. Aggiornare i comandi in `lib.rs` per chiamare queste funzioni invece di SQL inline
4. Eseguire `cargo build` e risolvere eventuali errori
5. Testare ogni operazione CRUD tramite il frontend

#### Checklist Verifica

- [ ] `db.rs` contiene tutte le funzioni CRUD necessarie
- [ ] Nessun SQL inline rimane in `lib.rs`
- [ ] `cargo build` compila senza errori
- [ ] Ogni operazione CRUD funziona correttamente

---

### S9 — Nessuna Configurazione Prettier

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | SUGGESTION |
| **Categoria** | Qualità del codice |
| **File** | `.prettierrc` (da creare) |
| **Effort** | 5 minuti |
| **Priorità** | 5 |

#### Problema

Non c'è un file di configurazione Prettier, il che porta a formattazione inconsistente nel codice.

#### Codice Fixato — Creare `.prettierrc`

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 100,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

#### Codice Fixato — Aggiungere script in `package.json`

```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{ts,tsx,css,json}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css,json}\""
  }
}
```

#### Codice Fixato — Creare `.prettierignore`

```
node_modules
dist
build
src-tauri
*.min.js
```

#### Istruzioni Passo-Passo

1. Creare il file `.prettierrc` nella root del progetto frontend (`smot-desktop/`)
2. Creare il file `.prettierignore`
3. Aggiungere gli script in `package.json`
4. Eseguire `npm run format` per formattare tutto il codice esistente
5. Eseguire `npm run format:check` per verificare che non ci siano differenze
6. Aggiungere un pre-commit hook con `husky` e `lint-staged` per formattare automaticamente

#### Checklist Verifica

- [ ] Il file `.prettierrc` esiste nella root del progetto
- [ ] Il file `.prettierignore` esiste
- [ ] Gli script `format` e `format:check` sono in `package.json`
- [ ] `npm run format:check` non segnala differenze
- [ ] Il codice è formattato in modo consistente

---

### S10 — Prop `onStatusUpdate` Non Usata in IndexingPage

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | SUGGESTION |
| **Categoria** | Codice morto |
| **File** | `smot-desktop/src/pages/IndexingPage.tsx` |
| **Effort** | 5 minuti |
| **Priorità** | 5 |

#### Problema

La prop `onStatusUpdate` è dichiarata nell'interfaccia delle props ma non viene mai chiamata nel componente.

#### Codice Attuale

```typescript
interface IndexingPageProps {
  onStatusUpdate?: (status: IndexingStatus) => void
  // altre props
}

function IndexingPage({ onStatusUpdate, ...otherProps }: IndexingPageProps) {
  // onStatusUpdate non viene mai chiamata
  const pollStatus = async () => {
    const status = await invoke('get_indexing_status')
    // onStatusUpdate non viene chiamata qui
  }
}
```

#### Codice Fixato (Opzione A: Rimuovere la prop se non serve)

```typescript
interface IndexingPageProps {
  // onStatusUpdate rimossa
  // altre props
}

function IndexingPage({ ...otherProps }: IndexingPageProps) {
  const pollStatus = async () => {
    const status = await invoke('get_indexing_status')
    // ...
  }
}
```

#### Codice Fixato (Opzione B: Chiamare la prop nel polling loop)

```typescript
interface IndexingPageProps {
  onStatusUpdate?: (status: IndexingStatus) => void
  // altre props
}

function IndexingPage({ onStatusUpdate, ...otherProps }: IndexingPageProps) {
  const pollStatus = async (): Promise<void> => {
    const status: IndexingStatus = await invoke('get_indexing_status')
    onStatusUpdate?.(status)
  }
}
```

#### Istruzioni Passo-Passo

1. Aprire `smot-desktop/src/pages/IndexingPage.tsx`
2. Decidere se la prop `onStatusUpdate` serve o no
3. Se non serve: rimuoverla dall'interfaccia e dalla destructuring
4. Se serve: chiamarla nel polling loop come mostrato nell'Opzione B
5. Verificare con `npx tsc --noEmit` che non ci siano errori

#### Checklist Verifica

- [ ] La prop `onStatusUpdate` è stata rimossa o effettivamente usata
- [ ] `npx tsc --noEmit` non segnala unused variables
- [ ] Il componente funziona correttamente

---

### S11 — `modeData` Tipizzato Implicitamente

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | SUGGESTION |
| **Categoria** | TypeScript |
| **File** | `DashboardPage.tsx`, `SettingsPage.tsx` |
| **Effort** | 15 minuti |
| **Priorità** | 5 |

#### Problema

La variabile `modeData` è tipizzata implicitamente, senza un tipo esplicito che ne definisca la struttura.

#### Codice Attuale

```typescript
const modeData = {
  local: { label: 'Locale', description: 'Elaborazione locale' },
  cloud: { label: 'Cloud', description: 'Elaborazione cloud' },
  hybrid: { label: 'Ibrido', description: 'Elaborazione mista' },
}
```

#### Codice Fixato — Creare il tipo in `types.ts`

```typescript
// src/types.ts
export interface ModeOption {
  label: string
  description: string
}

export interface ModeData {
  local: ModeOption
  cloud: ModeOption
  hybrid: ModeOption
}
```

#### Codice Fixato — Usare il tipo esplicitamente

```typescript
import type { ModeData } from '../types'

const modeData: ModeData = {
  local: { label: 'Locale', description: 'Elaborazione locale' },
  cloud: { label: 'Cloud', description: 'Elaborazione cloud' },
  hybrid: { label: 'Ibrido', description: 'Elaborazione mista' },
}
```

#### Istruzioni Passo-Passo

1. Aprire `smot-desktop/src/types.ts` (o crearlo se non esiste)
2. Aggiungere le interfacce `ModeOption` e `ModeData`
3. Aprire `DashboardPage.tsx` e `SettingsPage.tsx`
4. Importare `ModeData` da `types.ts`
5. Aggiungere l'annotazione di tipo `: ModeData` alla variabile `modeData`
6. Verificare con `npx tsc --noEmit`

#### Checklist Verifica

- [ ] Le interfacce `ModeOption` e `ModeData` sono definite in `types.ts`
- [ ] `modeData` ha l'annotazione di tipo esplicita in entrambi i file
- [ ] `npx tsc --noEmit` non segnala errori

---

### S12 — Usare `tracing` Invece di `log`

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | SUGGESTION |
| **Categoria** | Osservabilità |
| **File** | `Cargo.toml`, tutti i file `.rs` |
| **Effort** | 1-2 ore |
| **Priorità** | 5 |

#### Problema

Il crate `log` è usato per il logging, ma `tracing` offre funzionalità superiori: span strutturati, correlazione di richieste, e metriche integrate.

#### Codice Attuale (Cargo.toml)

```toml
[dependencies]
log = "0.4"
```

#### Codice Attuale (nei file .rs)

```rust
use log::{info, error, warn, debug};

fn some_function() -> Result<(), String> {
    info!("Avvio operazione");
    error!("Errore durante l'operazione: {}", e);
}
```

#### Codice Fixato (Cargo.toml)

```toml
[dependencies]
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }
```

#### Codice Fixato (main.rs, inizializzazione)

```rust
use tracing_subscriber::{fmt, EnvFilter};

fn main() {
    fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    // ... resto dell'inizializzazione Tauri
}
```

#### Codice Fixato (nei file .rs)

```rust
use tracing::{info, error, warn, debug};

fn some_function() -> Result<(), String> {
    info!("Avvio operazione");
    error!("Errore durante l'operazione: {}", e);
}
```

#### Codice Fixato (con span strutturati)

```rust
use tracing::{info, instrument};

#[instrument(skip(state))]
fn get_system_status(state: tauri::State<AppState>) -> Result<serde_json::Value, AppError> {
    info!("Recupero stato sistema");
    // ...
}
```

#### Istruzioni Passo-Passo

1. In `Cargo.toml`, rimuovere `log = "0.4"` e aggiungere `tracing` e `tracing-subscriber`
2. In `main.rs`, aggiungere l'inizializzazione del subscriber
3. In ogni file `.rs`, sostituire `use log::{...}` con `use tracing::{...}`
4. Sostituire tutte le chiamate `log::info!` con `tracing::info!`, `log::error!` con `tracing::error!`, ecc.
5. Aggiungere `#[instrument]` dove appropriato per span strutturati
6. Eseguire `cargo build` e risolvere eventuali errori
7. Verificare che i log siano ancora visibili nella console

#### Checklist Verifica

- [ ] `log` è rimosso da `Cargo.toml`
- [ ] `tracing` e `tracing-subscriber` sono in `Cargo.toml`
- [ ] Il subscriber è inizializzato in `main.rs`
- [ ] Tutti i `use log::` sono sostituiti con `use tracing::`
- [ ] `cargo build` compila senza errori
- [ ] I log sono visibili nella console

---

### S13 — Iniezione Style a Livello Modulo (Anti-pattern)

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | SUGGESTION |
| **Categoria** | Architettura / Performance |
| **File** | `SystemDiscoveryStep.tsx`, `CompletionStep.tsx` |
| **Effort** | 30 minuti |
| **Priorità** | 5 |

#### Problema

I componenti creano elementi `<style>` e li iniettano nel `<head>` a livello di modulo. Questo significa che gli stili vengono iniettati ogni volta che il modulo viene importato, potenzialmente causando duplicati e rendendo difficile il debug.

#### Codice Attuale (esempio)

```typescript
const styleSheet = document.createElement('style')
styleSheet.textContent = `
  .system-discovery-container {
    display: flex;
    flex-direction: column;
    padding: 2rem;
  }
`
document.head.appendChild(styleSheet)
```

#### Codice Fixato — Opzione A: CSS Module

Creare `src/styles/system-discovery.module.css`:

```css
.container {
  display: flex;
  flex-direction: column;
  padding: 2rem;
}
```

Aggiornare il componente:

```typescript
import styles from '../styles/system-discovery.module.css'

function SystemDiscoveryStep() {
  return (
    <div className={styles.container}>
      {/* contenuto */}
    </div>
  )
}
```

#### Codice Fixato — Opzione B: Inline Styles nel JSX

```typescript
function SystemDiscoveryStep() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem',
    }}>
      {/* contenuto */}
    </div>
  )
}
```

L'Opzione A (CSS Module) è preferibile per componenti con stili complessi.

#### Istruzioni Passo-Passo

1. Identificare tutti i componenti che usano `document.createElement('style')` e `document.head.appendChild`
2. Per ogni componente, estrarre gli stili in un file CSS module
3. Importare il CSS module nel componente
4. Sostituire i nomi di classe hardcoded con riferimenti al CSS module
5. Rimuovere il codice di iniezione dello stile
6. Verificare che l'aspetto visivo sia identico
7. Cercare e rimuovere eventuali `document.createElement('style')` rimasti

#### Checklist Verifica

- [ ] Nessun `document.createElement('style')` rimane nei componenti
- [ ] Nessun `document.head.appendChild(styleSheet)` rimane
- [ ] Gli stili sono in file CSS module
- [ ] L'aspetto visivo è identico a prima
- [ ] `npx tsc --noEmit` non segnala errori

---

### S14 — Piano Migrazione `serde` 1.0 a 2.0

| Campo | Dettaglio |
|-------|-----------|
| **Severità** | SUGGESTION |
| **Categoria** | Manutenzione |
| **File** | `Cargo.toml` |
| **Effort** | N/A (pianificazione) |
| **Priorità** | 6 |

#### Problema

`serde` 1.0 è stabile ma `serde` 2.0 è in sviluppo. Quando sarà rilasciato, la migrazione potrebbe richiedere cambiamenti nelle derive macros e nelle API.

#### Piano di Migrazione

1. **Monitorare il rilascio di serde 2.0**: Seguire il repository `serde-rs/serde` su GitHub per annunci di rilascio
2. **Creare un branch di test**: Quando serde 2.0 sarà stabile, creare un branch dedicato
3. **Aggiornare Cargo.toml**:

```toml
[dependencies]
serde = { version = "2", features = ["derive"] }
serde_json = "2"
```

4. **Eseguire `cargo build`**: Identificare tutti gli errori di compilazione
5. **Aggiornare le derive macros**: Le macro `#[derive(Serialize, Deserialize)]` potrebbero cambiare sintassi
6. **Aggiornare le chiamate API**: `serde_json::from_str`, `serde_json::to_string`, ecc. potrebbero avere firme diverse
7. **Eseguire i test**: Verificare che serializzazione e deserializzazione funzionino correttamente
8. **Aggiornare le dipendenze correlate**: `tauri`, `reqwest` e altre crate che dipendono da `serde` potrebbero aver bisogno di aggiornamenti

#### Checklist Verifica (quando serde 2.0 sarà stabile)

- [ ] serde 2.0 è stato rilasciato stabile
- [ ] Un branch di test è stato creato
- [ ] `cargo build` compila senza errori
- [ ] Tutti i test di serializzazione/deserializzazione passano
- [ ] Le dipendenze correlate sono compatibili

---

## Tabella Riepilogativa

| # | Severità | Categoria | File | Effort Stimato | Priorità |
|---|----------|-----------|------|----------------|----------|
| C1 | CRITICAL | Sicurezza | tauri.conf.json | 5 min | 1 |
| C2 | CRITICAL | TypeScript | tsconfig.app.json | 2-4 ore | 1 |
| W1 | WARNING | Backend | lib.rs | 38 ore | 3 |
| W2 | WARNING | Sicurezza | ViewerPage.tsx | 2 min | 1 |
| W3 | WARNING | Robustezza | App.tsx | 15 min | 1 |
| W4 | WARNING | Backend | ollama.rs, main.rs | 30 min | 2 |
| W5 | WARNING | Concorrenza | setup.rs | 10 min | 2 |
| W6 | WARNING | Sicurezza | tauri.conf.json | 10 min | 2 |
| W7 | WARNING | Sicurezza / CI | build-*.yml | 2-4 ore | 2 |
| W8 | WARNING | Architettura | lib.rs, db.rs, setup.rs | 2-3 ore | 3 |
| W9 | WARNING | UX / Correttezza | ollama.rs | 15 min | 2 |
| W10 | WARNING | Sicurezza | tauri.conf.json | 30 min | 2 |
| W11 | WARNING | Sicurezza | vite.config.ts | 5 min | 2 |
| W12 | WARNING | Funzionalità | parsers.rs | 1-2 ore | 3 |
| S1 | SUGGESTION | Consistenza | Componenti onboarding | 4-6 ore | 4 |
| S2 | SUGGESTION | TypeScript | *.tsx (5 file) | 1-2 ore | 4 |
| S3 | SUGGESTION | Accessibilità | ChatPage, SettingsPage, GraphControls | 30 min | 4 |
| S4 | SUGGESTION | Accessibilità | GraphCanvas.tsx, GraphNode.tsx | 1-2 ore | 4 |
| S5 | SUGGESTION | Accessibilità | index.html | 2 min | 4 |
| S6 | SUGGESTION | CI/CD | build-*.yml | 30 min | 5 |
| S7 | SUGGESTION | i18n | lib.rs | Da definire | 5 |
| S8 | SUGGESTION | Architettura | db.rs | 4-6 ore | 4 |
| S9 | SUGGESTION | Qualità codice | .prettierrc | 5 min | 5 |
| S10 | SUGGESTION | Codice morto | IndexingPage.tsx | 5 min | 5 |
| S11 | SUGGESTION | TypeScript | DashboardPage, SettingsPage | 15 min | 5 |
| S12 | SUGGESTION | Osservabilità | Cargo.toml, *.rs | 1-2 ore | 5 |
| S13 | SUGGESTION | Architettura | SystemDiscoveryStep, CompletionStep | 30 min | 5 |
| S14 | SUGGESTION | Manutenzione | Cargo.toml | N/A (pianificazione) | 6 |

---

## Conteggi

- **Totale finding**: 28
- **CRITICAL**: 2
- **WARNING**: 12
- **SUGGESTION**: 14
- **Effort totale stimato**: ~55-70 ore (escluso W1 che è 38 ore da solo)
- **Effort rapido (sotto 30 min)**: C1, W2, W3, W5, W9, W11, S5, S9, S10, S11 = ~1.5 ore
- **Effort medio (30 min - 2 ore)**: C2, W4, W6, W10, W12, S2, S3, S4, S6, S12, S13 = ~10-18 ore
- **Effort alto (2+ ore)**: W1, W7, W8, S1, S8 = ~50-57 ore