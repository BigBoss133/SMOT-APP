# Piano di Lavoro: SMOT v2.0 — Archivio Intelligente Locale

## TL;DR

**Obiettivo:** Trasformare SMOT da app web simulata a **desktop app nativa** con:
- Database reale SQLite (persistenza locale)
- Elaborazione documenti reale (PDF/DOCX/OCR)
- AI opzionale via Ollama (rilevamento automatico)
- Cross-platform (Windows/Mac/Linux)
- Bundle leggero (~10MB vs ~200MB Electron)

**Stima:** 40-60 ore di lavoro | **Riuso codice:** ~40% UI React

---

## Confronto: Vecchia vs Nuova Architettura

### 📊 Panoramica

| Aspetto | SMOT v1 (Attuale) | SMOT v2 (Proposta) |
|---------|-------------------|-------------------|
| **Tipo App** | Web (browser) | Desktop nativa |
| **Framework** | React (CRA) | Tauri v2 + React |
| **Backend** | FastAPI (Python) | Rust (Tauri commands) |
| **Database** | In-memory (no persistenza) | SQLite locale |
| **AI** | Simulata (fake responses) | Ollama locale (opzionale) |
| **Documenti** | Mock upload | Parsing reale PDF/DOCX |
| **Ricerca** | Non implementata | FTS5 + sqlite-vec |
| **Offline** | Parziale | Totale |
| **Bundle Size** | N/A (web) | ~10-15MB |
| **Cross-OS** | Via browser | Build native per Win/Mac/Linux |

### 🗺️ Mappatura Componenti

#### ✅ REUTILIZZABILI (~40% del codice)

**Frontend React (senza modifiche):**
- `App.js` — struttura routing e layout (3 colonne)
- `pages/DashboardPage.js` — dashboard con statistiche
- `pages/UploadPage.js` — UI upload (cambierà solo l'API call)
- `pages/IndexingPage.js` — progresso indicizzazione
- `pages/ChatPage.js` — interfaccia chat RAG
- `pages/ViewerPage.js` — viewer paginato con highlight
- `pages/SettingsPage.js` — impostazioni
- `components/SidebarNav.js` — navigazione sidebar
- `components/RightSystemPanel.js` — pannello sistema
- `components/StatusBar.js` — status bar inferiore
- `components/HardwareModeSelector.js` — selettore modalità
- `context/LanguageContext.js` — gestione lingua IT/EN
- `i18n/translations.js` — file traduzioni

**Design System:**
- Palette colori SMOT (`#0a1a3b`, `#4338f5`, ecc.)
- Layout 3-colonne + status bar
- Componenti Lucide icons
- CSS custom (da migrare)

#### 🔧 DA ADATTARE (~30%)

**API Layer:**
- `services/api.js` — da Axios HTTP a Tauri invoke
- Cambio da `axios.get('/api/documents')` a `invoke('get_documents')`

**Build System:**
- Da `react-scripts` (CRA) a **Vite** (più veloce, moderno)
- Configurazione Tauri (`tauri.conf.json`)

#### 🆕 DA CREARE (~30%)

**Backend Rust:**
- Comandi Tauri per ogni endpoint API
- Gestione database SQLite
- Parsing documenti (PDF, DOCX, OCR)
- Integrazione Ollama (opzionale)
- Vector embeddings con sqlite-vec

**Database:**
- Schema SQLite per documenti
- Tabelle FTS5 per ricerca full-text
- Tabelle embeddings (solo se AI attiva)

**Sistema AI:**
- Rilevamento Ollama all'avvio
- Fallback a ricerca tradizionale
- Circuit breaker per errori

---

## Work Objectives

### Core Objective
Costruire SMOT v2.0 come app desktop Tauri con persistenza reale, elaborazione documenti, e AI opzionale — riutilizzando la UI React esistente.

### Concrete Deliverables
1. App Tauri funzionante su Windows/Mac/Linux
2. Database SQLite con schema documenti
3. Parser PDF/DOCX/TXT/OCR
4. Ricerca full-text FTS5
5. Integrazione Ollama (opzionale)
6. UI React migrata con Tauri API
7. Build CI/CD per tre piattaforme

### Definition of Done
- [ ] App si avvia in <2 secondi
- [ ] Upload PDF mostra contenuto reale
- [ ] Ricerca testuale restituisce risultati
- [ ] Chat AI funziona (se Ollama presente)
- [ ] App funziona senza AI (ricerca normale)
- [ ] Build native per Windows, Mac, Linux

### Must Have
- Persistenza documenti su SQLite
- Parsing reale PDF/DOCX
- Ricerca full-text funzionante
- UI bilingue (IT/EN) mantenuta
- Selettore modalità hardware
- Funzionamento offline totale

### Must NOT Have
- Dipendenza da cloud services
- Richiesta Ollama obbligatoria
- Browser integration
- Server backend separato (tutto in Rust Tauri)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists:** NO (da creare)
- **Automated tests:** Tests-after
- **Framework:** Rust built-in test + Playwright per E2E

### QA Policy
Ogni task include scenari QA testabili automaticamente. Evidence in `.sisyphus/evidence/`.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Fondamenta - 7 task paralleli):
├── T1: Setup Tauri project + Vite
├── T2: Schema database SQLite
├── T3: Setup Rust + SQLite dependencies
├── T4: Porting React UI base (copia)
├── T5: Parser PDF (Rust crate)
├── T6: Parser DOCX (Rust crate)
└── T7: Configurazione build CI/CD

Wave 2 (Core - 7 task paralleli):
├── T8: Comandi Tauri: gestione documenti (depends: T1,T2,T3)
├── T9: Comandi Tauri: upload file (depends: T1,T5,T6)
├── T10: FTS5 search implementation (depends: T2)
├── T11: Indicizzazione reale (depends: T8,T9,T10)
├── T12: Rilevamento Ollama (depends: T1)
├── T13: UI integrazione Tauri API (depends: T1,T4)
└── T14: Viewer con testo reale (depends: T8)

Wave 3 (AI + Polish - 6 task paralleli):
├── T15: Integrazione Ollama embeddings (depends: T11,T12)
├── T16: Chat RAG reale (depends: T15)
├── T17: sqlite-vec per ricerca semantica (depends: T10,T15)
├── T18: Fallback senza AI (depends: T16)
├── T19: Ottimizzazioni performance (depends: T11)
└── T20: Build testing su tre OS (depends: T7,T13)

Wave FINAL (4 review paralleli):
├── F1: Plan compliance audit (oracle)
├── F2: Code quality review (unspecified-high)
├── F3: Real manual QA (unspecified-high + playwright)
└── F4: Scope fidelity check (deep)
```

### Dependency Matrix

| Task | Bloccato Da | Blocca |
|------|-------------|--------|
| T1 | - | T8,T9,T12,T13 |
| T2 | - | T8,T10 |
| T3 | - | T8,T9 |
| T4 | - | T13 |
| T5 | - | T9 |
| T6 | - | T9 |
| T7 | - | T20 |
| T8 | T1,T2,T3 | T11 |
| T9 | T1,T5,T6 | T11 |
| T10 | T2 | T15,T17 |
| T11 | T8,T9,T10 | T15,T19 |
| T12 | T1 | T15 |
| T13 | T1,T4 | T20 |
| T14 | T8 | - |
| T15 | T11,T12 | T16,T17 |
| T16 | T15 | T18 |
| T17 | T10,T15 | - |
| T18 | T16 | - |
| T19 | T11 | - |
| T20 | T7,T13 | F1-F4 |

---

## TODOs

### WAVE 1: Fondamenta

- [ ] **T1. Setup progetto Tauri + Vite**

  **What to do:**
  - Inizializza progetto Tauri v2 con template React + TypeScript + Vite
  - Configura `tauri.conf.json` con permessi filesystem
  - Setup struttura directory: `src-tauri/` (Rust), `src/` (React)
  - Configura hot reload per sviluppo
  
  **References:**
  - Tauri docs: `https://v2.tauri.app/start/create-project/` - Setup base
  - Template: `npm create tauri-app@latest -- --template react-ts`
  
  **Acceptance Criteria:**
  - [ ] `cargo tauri dev` avvia app con hot reload
  - [ ] App mostra "Hello Tauri" di default
  - [ ] Build produzione crea `.exe`/`.app`/`.AppImage`
  
  **QA Scenarios:**
  ```
  Scenario: App si avvia in dev mode
    Tool: Bash
    Steps:
      1. cd /tmp/smot-v2 && cargo tauri dev
      2. Attendi 10s
    Expected: Window appare con titolo "SMOT"
    Evidence: .sisyphus/evidence/t1-app-launches.png
  
  Scenario: Build produzione funziona
    Tool: Bash
    Steps:
      1. cargo tauri build
      2. ls src-tauri/target/release/bundle/
    Expected: File bundle presenti per piattaforma corrente
    Evidence: .sisyphus/evidence/t1-build-exists.txt
  ```
  
  **Commit:** YES

### WAVE 3: AI + Polish

- [ ] **T15. Integrazione Ollama embeddings**

  **What to do:**
  - Implementa `generate_embedding(text: &str) -> Result<Vec<f32>>`:
    - POST a `http://localhost:11434/api/embeddings`
    - Modello: `nomic-embed-text` (leggero, ottimo per local)
    - Timeout: 30s
  - Durante indicizzazione, se Ollama presente:
    - Genera embedding per ogni chunk
    - Salva in tabella `embeddings`
  - Se Ollama assente: salta embeddings, usa solo FTS5
  
  **References:**
  - Ollama embeddings API: `https://github.com/ollama/ollama/blob/main/docs/api.md#generate-embeddings`
  - sqlite-vec: `https://github.com/asg017/sqlite-vec` - per storage vettori
  
  **Acceptance Criteria:**
  - [ ] Embedding generati per chunk (se AI disponibile)
  - [ ] Vettori salvati in database
  
  **QA Scenarios:**
  ```
  Scenario: Generazione embedding
    Tool: Bash (cargo test)
    Precondizioni: Ollama con nomic-embed-text
    Steps:
      1. Chiama generate_embedding("testo di prova")
    Expected: Restituisce array di 768 f32
    Evidence: .sisyphus/evidence/t15-embedding-generated.txt
  ```
  
  **Commit:** YES

- [ ] **T16. Chat RAG reale**

  **What to do:**
  - Implementa query RAG:
    1. Ricevi domanda utente
    2. Genera embedding della domanda
    3. Cerca chunk simili (cosine similarity > 0.7)
    4. Costruisci prompt con context dai chunk
    5. POST a `http://localhost:11434/api/chat` con context
    6. Stream risposta all'UI
  - Comando: `chat_query(question: &str) -> Stream<String>`
  
  **References:**
  - Ollama chat API: `https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-chat-completion`
  - Pattern RAG: context + question in system prompt
  
  **Acceptance Criteria:**
  - [ ] Chat risponde basandosi su documenti caricati
  - [ ] Citazioni mostrano fonti reali (documento, pagina)
  
  **QA Scenarios:**
  ```
  Scenario: Chat con context
    Tool: Playwright
    Precondizioni: Documento PDF caricato con testo "Il pagamento è di 100 euro"
    Steps:
      1. Vai in Chat
      2. Scrivi "Quanto è il pagamento?"
      3. Attendi risposta
    Expected: Risposta menziona "100 euro" e cita documento
    Evidence: .sisyphus/evidence/t16-chat-rag.png
  ```
  
  **Commit:** YES

- [ ] **T17. sqlite-vec per ricerca semantica**

  **What to do:**
  - Aggiungi dipendenza `sqlite-vec` (estensione SQLite)
  - Crea virtual table per embeddings
  - Implementa `semantic_search(query: &str) -> Vec<Chunk>`
  - Combina: FTS5 (keyword) + semantic (vettori) → risultati ibridi
  
  **References:**
  - sqlite-vec: `https://github.com/asg017/sqlite-vec` - Vector search
  
  **Acceptance Criteria:**
  - [ ] Ricerca semantica trova documenti correlati (non solo keyword esatte)
  
  **QA Scenarios:**
  ```
  Scenario: Ricerca semantica
    Tool: Bash (cargo test)
    Precondizioni: Documento su "automobili"
    Steps:
      1. Cerca "macchine" (sinonimo)
    Expected: Trova documento su automobili
    Evidence: .sisyphus/evidence/t17-semantic-search.txt
  ```
  
  **Commit:** YES

- [ ] **T18. Fallback senza AI**

  **What to do:**
  - Se Ollama non disponibile:
    - Chat mostra: "AI non disponibile. Usa la ricerca per trovare documenti."
    - Nascondi input chat
    - Evidenzia funzione ricerca FTS5
  - Se Ollama va offline durante sessione:
    - Mostra warning toast
    - Graceful degradation a ricerca tradizionale
  - Circuit breaker: dopo 3 errori consecutivi, disabilita AI per sessione
  
  **References:**
  - Pattern graceful degradation: vedi ricerche precedenti
  
  **Acceptance Criteria:**
  - [ ] App funziona completamente senza AI
  - [ ] Degradation trasparente all'utente
  
  **QA Scenarios:**
  ```
  Scenario: Chat senza AI
    Tool: Playwright
    Precondizioni: Ollama spento
    Steps:
      1. Apri Chat
    Expected: Messaggio "AI non disponibile", input nascosto
    Evidence: .sisyphus/evidence/t18-fallback-ui.png
  ```
  
  **Commit:** YES

- [ ] **T19. Ottimizzazioni performance**

  **What to do:**
  - Lazy loading: carica documenti in pagine (non tutti insieme)
  - Virtualizzazione lista: `react-window` per liste lunghe
  - Caching: memorizza risultati ricerca recenti
  - Background indexing: usa thread separato per indicizzazione
  - Database WAL mode per migliori performance scrittura
  
  **References:**
  - react-window: `https://github.com/bvaughn/react-window` - Virtualization
  - SQLite WAL: `https://sqlite.org/wal.html` - Write-Ahead Logging
  
  **Acceptance Criteria:**
  - [ ] App fluida con 1000+ documenti
  - [ ] Indicizzazione non blocca UI
  
  **QA Scenarios:**
  ```
  Scenario: Performance con tanti documenti
    Tool: Playwright
    Steps:
      1. Genera 1000 documenti di test
      2. Apri Dashboard
      3. Scrolla lista
    Expected: Scroll fluido, niente lag
    Evidence: .sisyphus/evidence/t19-performance.png
  ```
  
  **Commit:** YES

- [ ] **T20. Build testing su tre OS**

  **What to do:**
  - Test build finale su:
    - Windows 10/11 (installer .msi/.exe)
    - macOS (Apple Silicon + Intel)
    - Linux (AppImage + .deb)
  - Verifica:
    - App si installa correttamente
    - Database si crea in location corretta
    - File upload funziona (permessi)
    - Ollama detection funziona
  
  **Acceptance Criteria:**
  - [ ] Build funzionanti su tutte e 3 le piattaforme
  - [ ] Nessun errore runtime critico
  
  **QA Scenarios:**
  ```
  Scenario: Build Windows
    Tool: Manual testing
    Steps:
      1. Installa su Windows 11
      2. Avvia app
      3. Test upload PDF
    Expected: Funziona correttamente
    Evidence: .sisyphus/evidence/t20-windows-test.txt
  
  Scenario: Build macOS
    Tool: Manual testing
    Steps:
      1. Installa su macOS
    Expected: Funziona
    Evidence: .sisyphus/evidence/t20-macos-test.txt
  ```
  
  **Commit:** NO (solo testing)

---

## Risk Mitigation — Soluzioni ai Blocchi Principali

### 🔴 R1. Parser PDF/DOCX Incompleti su File Reali

**Rischio:** Testo estratto male o vuoto → indicizzazione inutile

**Soluzione Implementativa:**

```rust
// src-tauri/src/parsers/mod.rs
pub enum ParseResult {
    Success { text: String, metadata: DocMetadata },
    Partial { text: String, warnings: Vec<String> }, // Testo parziale ma usabile
    Failed { reason: String, fallback: Option<String> }, // OCR come fallback
}

pub async fn parse_document(path: &Path) -> ParseResult {
    match extension {
        "pdf" => parse_pdf_robust(path).await,
        "docx" => parse_docx_robust(path).await,
        _ => ParseResult::Failed { 
            reason: "Formato non supportato".to_string(),
            fallback: None 
        },
    }
}

async fn parse_pdf_robust(path: &Path) -> ParseResult {
    // 1. Prova pdf-extract (testo nativo)
    match pdf_extract::extract_text(path) {
        Ok(text) if !text.trim().is_empty() => {
            ParseResult::Success { text, metadata: extract_metadata(path) }
        }
        Ok(text) if text.trim().is_empty() => {
            // 2. PDF è una scansione immagine → OCR
            match ocr_image_pdf(path).await {
                Ok(ocr_text) => ParseResult::Success { 
                    text: ocr_text, 
                    metadata: extract_metadata(path) 
                },
                Err(e) => ParseResult::Failed { 
                    reason: format!("PDF senza testo estratto, OCR fallito: {}", e),
                    fallback: None 
                }
            }
        }
        Err(e) => ParseResult::Partial { 
            text: extract_partial_pdf(path).unwrap_or_default(),
            warnings: vec![format!("Errore parsing: {}", e)] 
        }
    }
}
```

**Mitigazioni Aggiuntive:**
1. **Test Suite con Corpus Reale** (T5.1): 
   - 20 PDF reali: contratti, fatture, scansioni, layout complessi
   - Assertions: `assert!(extracted_text.len() > 100)` (minimo 100 chars)
   - Coverage target: 95% dei documenti estratti con successo

2. **Fallback Multi-Livello:**
   - Livello 1: `pdf-extract` (veloce, testo nativo)
   - Livello 2: `lopdf` (più robusto su PDF corrotti)
   - Livello 3: OCR con `tesseract` (per scansioni)

3. **Validazione Post-Parsing:**
   - Se testo < 50 caratteri → flag come "parsing dubbio"
   - Mostra warning in UI: "Documento potrebbe non essere indicizzato correttamente"

**Task Aggiornati:**
- T5.1: Parser PDF robusto con test suite corpus reale
- T5.2: Integrazione OCR fallback per scansioni

---

### 🔴 R2. sqlite-vec e Compatibilità Cross-Platform

**Rischio:** Build/packaging instabile su Win/Mac/Linux

**Soluzione Implementativa:**

**Fase 1 (P0 - Ora): FTS5 Solido**
```rust
// src-tauri/src/search/mod.rs
pub enum SearchBackend {
    Fts5Only,      // Sempre disponibile
    Hybrid,        // FTS5 + embeddings (se sqlite-vec funziona)
}

pub struct SearchService {
    backend: SearchBackend,
    conn: Connection,
}

impl SearchService {
    pub fn new(conn: Connection) -> Self {
        // Prova a inizializzare sqlite-vec
        match Self::init_sqlite_vec(&conn) {
            Ok(_) => {
                log::info!("sqlite-vec inizializzato - modalità ibrida");
                Self { backend: SearchBackend::Hybrid, conn }
            }
            Err(e) => {
                log::warn!("sqlite-vec non disponibile: {} - uso solo FTS5", e);
                Self { backend: SearchBackend::Fts5Only, conn }
            }
        }
    }
    
    pub fn search(&self, query: &str) -> Vec<SearchResult> {
        match self.backend {
            SearchBackend::Fts5Only => self.search_fts5_only(query),
            SearchBackend::Hybrid => self.search_hybrid(query),
        }
    }
}
```

**Fase 2 (P1 - Dopo): Semantic Search Condizionale**
```rust
// Carica sqlite-vec dinamicamente solo se disponibile
#[cfg(feature = "sqlite-vec")]
mod vector_search {
    pub fn enable_semantic() { /* ... */ }
}

// Feature flag in Cargo.toml
[features]
default = ["fts5"]
semantic = ["sqlite-vec", "fts5"]
```

**Mitigazioni Build:**
1. **CI/CD Multi-Platform Testing (T7):**
   - Build separata per Windows, macOS (Intel + ARM), Linux
   - Test `cargo build --features semantic` su ogni piattaforma
   - Se fallisce, build con `--no-default-features` (solo FTS5)

2. **Runtime Detection:**
   ```rust
   pub fn is_semantic_available() -> bool {
       // Controlla a runtime se sqlite-vec è caricabile
       unsafe { sqlite_vec::sqlite3_vec_init.is_ok() }
   }
   ```

**Task Aggiornati:**
- T10: FTS5 base (P0, obbligatorio)
- T17: sqlite-vec semantic search (P1, solo se build passa su tutte le piattaforme)

---

### 🔴 R3. Dipendenza Ollama Locale

**Rischio:** Utenti senza Ollama bloccati in chat

**Soluzione Implementativa:**

```rust
// src-tauri/src/ai/mod.rs
pub struct AIService {
    state: AIState,
    capabilities: AICapabilities,
}

#[derive(Debug, Clone)]
pub enum AIState {
    Available { models: Vec<String>, preferred: String },
    Unavailable { reason: String },
    Degraded { fallback: Box<AIState> },
}

impl AIService {
    pub async fn detect() -> Self {
        // 1. Prova Ollama
        match Self::check_ollama().await {
            Ok(models) if !models.is_empty() => {
                Self { 
                    state: AIState::Available { 
                        models: models.clone(),
                        preferred: models[0].clone() 
                    },
                    capabilities: AICapabilities::Full 
                }
            }
            Ok(_) => Self::no_models_available(),
            Err(e) => {
                log::warn!("Ollama non disponibile: {}", e);
                Self::unavailable_with_reason(e.to_string())
            }
        }
    }
    
    pub fn chat(&self, query: &str, context: &[Chunk]) -> Result<ChatResponse, AIError> {
        match &self.state {
            AIState::Available { preferred, .. } => {
                self.query_ollama(query, context, preferred).await
            }
            AIState::Unavailable { reason } => {
                Err(AIError::NotAvailable { 
                    message: format!("AI non disponibile: {}. Usa la ricerca per trovare documenti.", reason),
                    fallback_action: "search" 
                })
            }
            _ => Err(AIError::UnknownState)
        }
    }
}
```

**UI Fallback:**
```typescript
// src/pages/ChatPage.tsx
function ChatPage() {
  const { aiState } = useAI();
  
  if (aiState.status === 'unavailable') {
    return (
      <div className="ai-fallback">
        <Alert icon={BrainOff}>
          {aiState.message}
        </Alert>
        <Button onClick={() => navigate('/')}>
          Vai alla Ricerca
        </Button>
      </div>
    );
  }
  
  return <ChatInterface />;
}
```

**Mitigazioni:**
1. **Rilevamento all'avvio (T12):** Controlla Ollama in <3 secondi, senza bloccare UI
2. **UX Esplicita:** Badge visibile "AI Pronta" / "AI Non Disponibile"
3. **Fallback automatico:** Se chat aperta e Ollama va offline → redirect a ricerca
4. **Guida installazione:** Link a docs Ollama nella UI quando non rilevato

**Task Aggiornati:**
- T12: Rilevamento Ollama robusto con timeout
- T18: Fallback UI completo con redirect automatico

---

### 🔴 R4. Migrazione CRA → Vite + Tauri Invoke

**Rischio:** Regressioni routing/stato UI

**Soluzione Implementativa:**

**Strategia Migrazione Per Layer:**

```
Fase 1: Shell UI (T4)
├── Copia App.js, index.js
├── Configura React Router (stesse routes)
└── Verifica: routing base funziona

Fase 2: Services Layer (T13)
├── Crea services/tauriApi.ts
├── Implementa invoke() wrapper
├── Test: una chiamata API funziona
└── Poi: migra pagina per pagina

Fase 3: Pagina per Pagina
├── DashboardPage → test → OK → prossima
├── UploadPage → test → OK → prossima
├── ChatPage → test → OK → prossima
└── etc.
```

**Wrapper API per Retrocompatibilità:**
```typescript
// src/services/api.ts - Mantieni stessa interfaccia!
import { invoke } from '@tauri-apps/api/core';

// Vecchio: export const getDocuments = () => axios.get('/api/documents')
// Nuovo: stessa firma, implementazione cambia
export const getDocuments = async (): Promise<Document[]> => {
  return await invoke('get_documents'); // Chiama Rust
};

export const uploadDocuments = async (files: string[]): Promise<UploadResponse> => {
  return await invoke('upload_documents', { files });
};

// ... tutte le altre API mantengono stessa firma
```

**Test di Non-Regressione:**
```bash
# Per ogni pagina migrata:
1. npm run dev
2. Playwright: test E2E pagina
3. Confronta screenshot con versione precedente
4. Tutte le interazioni devono funzionare
```

**Mitigazioni:**
1. **Snapshot Testing:** Screenshots della UI vecchia come reference
2. **Feature Flag:** `const USE_TAURI = true;` — puoi rollback a mock se serve
3. **Test Incrementali:** Ogni pagina testata prima di procedere alla successiva

**Task Aggiornati:**
- T4: Migrazione shell UI con test routing
- T13: Migrazione services layer per layer

---

### 🔴 R5. Concorrenza Job Indicizzazione

**Rischio:** Race condition e UI inconsistente

**Soluzione Implementativa:**

```rust
// src-tauri/src/indexing/job_manager.rs
use std::sync::{Arc, Mutex};
use tokio::sync::{mpsc, oneshot};

pub struct IndexingJobManager {
    state: Arc<Mutex<JobState>>,
    control_tx: mpsc::Sender<JobCommand>,
}

#[derive(Debug, Clone)]
pub struct JobState {
    pub job_id: String,
    pub status: JobStatus,
    pub progress: IndexProgress,
    pub documents: Vec<String>,
}

#[derive(Debug, Clone)]
pub enum JobStatus {
    Idle,
    Running { since: Instant },
    Paused { progress_at_pause: IndexProgress },
    Background { checkpoint: IndexProgress },
    Completed { at: Instant },
    Failed { error: String },
}

pub enum JobCommand {
    Start { documents: Vec<String> },
    Pause,
    Resume,
    Background,
    Cancel,
}

impl IndexingJobManager {
    pub fn new() -> Self {
        let (tx, mut rx) = mpsc::channel(32);
        let state = Arc::new(Mutex::new(JobState::default()));
        let state_clone = state.clone();
        
        // Task background che gestisce lo stato
        tokio::spawn(async move {
            while let Some(cmd) = rx.recv().await {
                let mut state = state_clone.lock().unwrap();
                
                match cmd {
                    JobCommand::Pause => {
                        if let JobStatus::Running { .. } = state.status {
                            state.status = JobStatus::Paused { 
                                progress_at_pause: state.progress.clone() 
                            };
                            log::info!("Job {} pausato", state.job_id);
                        }
                    }
                    JobCommand::Resume => {
                        if let JobStatus::Paused { .. } = state.status {
                            state.status = JobStatus::Running { since: Instant::now() };
                        }
                    }
                    // ... altri comandi
                }
            }
        });
        
        Self { state, control_tx: tx }
    }
    
    pub async fn get_status(&self) -> JobState {
        self.state.lock().unwrap().clone()
    }
    
    pub async fn pause(&self) -> Result<(), String> {
        self.control_tx.send(JobCommand::Pause).await
            .map_err(|e| format!("Failed to send pause: {}", e))
    }
}
```

**Test Concorrenza:**
```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_pause_resume_sequence() {
        let manager = IndexingJobManager::new();
        
        // Start
        manager.start(vec!["doc1.pdf".to_string()]).await.unwrap();
        assert!(matches!(manager.get_status().await.status, JobStatus::Running { .. }));
        
        // Pause
        manager.pause().await.unwrap();
        assert!(matches!(manager.get_status().await.status, JobStatus::Paused { .. }));
        
        // Resume
        manager.resume().await.unwrap();
        assert!(matches!(manager.get_status().await.status, JobStatus::Running { .. }));
        
        // Pause again
        manager.pause().await.unwrap();
        // Background
        manager.background().await.unwrap();
        assert!(matches!(manager.get_status().await.status, JobStatus::Background { .. }));
    }
    
    #[tokio::test]
    async fn test_race_conditions() {
        let manager = IndexingJobManager::new();
        
        // 10 pause contemporanee
        let handles: Vec<_> = (0..10).map(|_| {
            let m = manager.clone();
            tokio::spawn(async move { m.pause().await })
        }).collect();
        
        for h in handles {
            h.await.unwrap().unwrap(); // Nessun panic, tutti gestiti
        }
    }
}
```

**Mitigazioni UI:**
```typescript
// Polling robusto con debounce
const useIndexingStatus = (jobId: string) => {
  const [status, setStatus] = useState<JobStatus>(null);
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const newStatus = await getIndexingStatus(jobId);
      
      // Solo se cambiato davvero
      if (JSON.stringify(newStatus) !== JSON.stringify(status)) {
        setStatus(newStatus);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [jobId]);
  
  return status;
};
```

**Task Aggiornati:**
- T11: Job manager con stato centralizzato e test concorrenza

---

### 🔴 R6. Percorsi File/Permessi OS

**Rischio:** Upload OK su OS A, fallisce su OS B

**Soluzione Implementativa:**

```rust
// src-tauri/src/filesystem/mod.rs
use tauri::api::path::{app_data_dir, app_local_data_dir};
use std::path::PathBuf;

pub struct AppStorage {
    base_dir: PathBuf,
    documents_dir: PathBuf,
}

impl AppStorage {
    pub fn new(app_handle: &tauri::AppHandle) -> Result<Self, String> {
        // USA SEMPRE app_data_dir - mai path hardcoded!
        let base_dir = app_data_dir(app_handle.config())
            .ok_or("Impossibile ottenere app data dir")?;
        
        let documents_dir = base_dir.join("documents");
        
        // Crea directory se non esistono
        std::fs::create_dir_all(&documents_dir)
            .map_err(|e| format!("Failed to create documents dir: {}", e))?;
        
        Ok(Self { base_dir, documents_dir })
    }
    
    pub fn store_document(&self, source_path: &Path, doc_id: &str) -> Result<PathBuf, String> {
        // Sanifica nome file
        let file_name = sanitize_filename(source_path.file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown"));
        
        let dest_path = self.documents_dir.join(format!("{}_{}", doc_id, file_name));
        
        // Copia file (non move, per sicurezza)
        std::fs::copy(source_path, &dest_path)
            .map_err(|e| format!("Failed to copy file: {}", e))?;
        
        Ok(dest_path)
    }
    
    pub fn get_document_path(&self, doc_id: &str, file_name: &str) -> PathBuf {
        self.documents_dir.join(format!("{}_{}", doc_id, file_name))
    }
}

// Sanitizza nomi file cross-platform
fn sanitize_filename(name: &str) -> String {
    // Caratteri illegali su Windows: < > : " / \ | ? *
    name.chars()
        .map(|c| match c {
            '<' | '>' | ':' | '"' | '/' | '\\' | '|' | '?' | '*' => '_',
            _ => c
        })
        .collect()
}
```

**Permessi Tauri (tauri.conf.json):**
```json
{
  "tauri": {
    "allowlist": {
      "fs": {
        "all": false,
        "readFile": true,
        "writeFile": true,
        "readDir": true,
        "copyFile": true,
        "createDir": true,
        "scope": [
          "$APPDATA/**",        // Solo app data dir!
          "$APPDATA/documents/**"
        ]
      }
    }
  }
}
```

**Test Cross-Platform:**
```rust
#[test]
fn test_paths_all_os() {
    // Simula path problematici
    let test_cases = vec![
        ("file:name.pdf", "file_name.pdf"),      // Windows
        ("file/name.pdf", "file_name.pdf"),      // Unix
        ("file\\name.pdf", "file_name.pdf"),     // Windows backslash
        ("file<name>.pdf", "file_name_.pdf"),    // Caratteri speciali
    ];
    
    for (input, expected) in test_cases {
        assert_eq!(sanitize_filename(input), expected);
    }
}

#[test]
fn test_storage_operations() {
    // Test su tmp dir (funziona su tutti gli OS)
    let tmp_dir = tempfile::tempdir().unwrap();
    // ... test operazioni
}
```

**Mitigazioni:**
1. **Scope Tauri ristretto:** Solo `$APPDATA/**`, mai path assoluti
2. **Sanitizzazione nomi:** Rimuovi caratteri illegali per OS
3. **Test CI:** Esegui test filesystem su Windows, macOS, Linux
4. **Error Handling:** Ogni operazione filesystem ha `Result` con messaggio chiaro

**Task Aggiornati:**
- T9: Upload con AppStorage e sanitizzazione
- T20: Test upload su tutti e 3 gli OS

---

## Checklist Risk Mitigation

Prima di procedere con lo sviluppo, verifica che queste mitigazioni siano implementate:

- [ ] **R1:** Parser PDF ha test suite con 20+ documenti reali
- [ ] **R2:** FTS5 funziona senza sqlite-vec (fallback sempre disponibile)
- [ ] **R3:** UI mostra stato AI esplicito, chat ha fallback a ricerca
- [ ] **R4:** Migrazione per layer con test dopo ogni pagina
- [ ] **R5:** Job manager testato per race conditions
- [ ] **R6:** Tutti i path usano `app_data_dir()`, mai hardcoded

---

## Final Verification Wave (DOPO tutti i task implementazione)

> 4 agenti di review in PARALLELO. Tutti devono approvare. Presenta risultati consolidati all'utente e attendi "okay" esplicito prima di completare.

- [ ] **F1. Plan Compliance Audit** — `oracle`
  Leggi il piano dall'inizio alla fine. Per ogni "Must Have": verifica che l'implementazione esista (leggi file, curl endpoint, esegui comando). Per ogni "Must NOT Have": cerca nel codebase pattern vietati — rifiuta con file:line se trovati. Controlla che i file evidence esistano in `.sisyphus/evidence/`. Confronta deliverables con il piano.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] **F2. Code Quality Review** — `unspecified-high`
  Esegui `cargo check`, `cargo clippy`, `cargo fmt --check`. Verifica TypeScript: `tsc --noEmit`. Controlla tutti i file modificati per: `unwrap()` pericolosi, errori gestiti male, `println!` di debug in produzione, codice morto. Cerca AI slop: commenti eccessivi, nomi generici, over-engineering.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N puliti/N problemi] | VERDICT`

- [ ] **Real Manual QA** — `unspecified-high` (+ skill `playwright` se UI)
  Parti da stato pulito. Esegui OGNI scenario QA da OGNI task — segui passaggi esatti, cattura evidence. Testa integrazione cross-task (funzionalità che lavorano insieme, non isolate). Testa casi limite: stato vuoto, input invalidi, azioni rapide. Salva in `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N testati] | VERDICT`

- [ ] **F4. Scope Fidelity Check** — `deep`
  Per ogni task: leggi "What to do", leggi diff attuale (`git diff`). Verifica 1:1 — tutto nello spec è stato costruito (niente mancante), nulla oltre lo spec è stato costruito (no scope creep). Controlla compliance con "Must NOT do". Rileva contaminazione cross-task: Task N che tocca file di Task M. Flagga cambiamenti non contabilizzati.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

**Wave 1:**
- `feat(setup): initialize Tauri v2 project with React`
- `feat(db): add SQLite schema with FTS5 support`
- `feat(parsers): add PDF and DOCX text extraction`
- `feat(ui): port existing React components to Tauri`
- `ci: add GitHub Actions build pipeline`

**Wave 2:**
- `feat(api): implement document management commands`
- `feat(upload): integrate file dialog and upload flow`
- `feat(search): implement FTS5 full-text search`
- `feat(indexing): add real document indexing with progress tracking`
- `feat(ai): add Ollama capability detection`
- `feat(viewer): connect viewer to real document content`

**Wave 3:**
- `feat(embeddings): integrate Ollama for vector generation`
- `feat(rag): implement real RAG chat with context`
- `feat(semantic): add sqlite-vec for semantic search`
- `feat(fallback): implement graceful AI degradation`
- `perf: optimize for large document collections`

---

## Success Criteria

### Must Have Verification
```bash
# 1. App si avvia in <2 secondi
time cargo tauri dev  # Attendi "App started"

# 2. Upload PDF mostra contenuto reale
# (Test manuale: upload PDF, verifica che viewer mostri testo reale)

# 3. Ricerca full-text restituisce risultati
cargo test search::tests  # Deve passare

# 4. Chat AI funziona (se Ollama presente)
# (Test manuale: chat con documento caricato)

# 5. App funziona senza AI (ricerca normale)
# (Test manuale: chiudi Ollama, verifica ricerca funzioni)

# 6. Build native per Windows, Mac, Linux
cargo tauri build  # Produce bundle per piattaforma corrente
```

### Final Checklist
- [ ] Tutti i 20 task completati
- [ ] Tutti i test passano
- [ ] 4 review finali approvano
- [ ] Build CI/CD verde su tutte le piattaforme
- [ ] Utente ha dato "okay" esplicito

---

## Riuso Codice: Mappa Dettagliata

### UI Components (100% riutilizzo)
Tutti i componenti React esistenti possono essere copiati così come sono:
- `src/components/SidebarNav.js`
- `src/components/RightSystemPanel.js`
- `src/components/StatusBar.js`
- `src/components/HardwareModeSelector.js`
- `src/pages/DashboardPage.js`
- `src/pages/UploadPage.js`
- `src/pages/IndexingPage.js`
- `src/pages/ChatPage.js`
- `src/pages/ViewerPage.js`
- `src/pages/SettingsPage.js`
- `src/context/LanguageContext.js`
- `src/i18n/translations.js`

**Modifiche necessarie minime:**
- Cambiare import: da `import axios from 'axios'` a `import { invoke } from '@tauri-apps/api/core'`
- Aggiornare `services/api.js` per usare Tauri invoke invece di HTTP

### Backend (0% riutilizzo, da riscrivere)
Il backend FastAPI esistente è simulato (in-memory). Va completamente riscritto in Rust:
- Da Python a Rust
- Da in-memory a SQLite persistente
- Da fake responses a parsing documenti reale

### Configurazione (50% riutilizzo)
- **Package.json:** Aggiornare a Vite + aggiungere dipendenze Tauri
- **Struttura directory:** Simile (src/, public/)
- **Stili CSS:** 100% riutilizzabili

---

## Confronto Visivo: Prima vs Dopo

### Architettura Attuale (SMOT v1)
```
┌────────────────────────────────────────┐
│  Browser (utente apre URL)            │
├────────────────────────────────────────┤
│  React (CRA) + Axios → HTTP           │
├────────────────────────────────────────┤
│  FastAPI (Python)                     │
│  └── Dati in memoria (fake)           │
└────────────────────────────────────────┘
     ↑
     Niente persistenza
     Niente AI reale
     Niente documenti veri
```

### Architettura Nuova (SMOT v2)
```
┌────────────────────────────────────────┐
│  Tauri Desktop App (Windows/Mac/Linux)│
├────────────────────────────────────────┤
│  React + Vite + Tauri API             │
├────────────────────────────────────────┤
│  Rust Backend (Tauri commands)        │
│  ├── SQLite database (persistente)    │
│  ├── PDF/DOCX parsers                 │
│  └── FTS5 + sqlite-vec search         │
├────────────────────────────────────────┤
│  Ollama (opzionale, locale)           │
│  └── Embeddings + Chat LLM            │
└────────────────────────────────────────┘
     ↑
     Tutto locale
     Offline-first
     AI opzionale
```

---

## Prossimi Passi

1. **Review questo piano** — Leggilo e fammi sapere se vuoi modifiche
2. **Esegui `/start-work smot-v2-migration`** — Inizia l'esecuzione con Sisyphus
3. **Monitora progresso** — Ogni task verrà eseguito e verificato automaticamente

**Nota:** Questo piano è stato creato in locale in `.sisyphus/plans/`. Se vuoi aggiungerlo alla repo GitHub, copialo manualmente o esegui il lavoro e fai commit del piano completato.


- [ ] **T2. Schema database SQLite**

  **What to do:**
  - Progetta schema database per documenti:
    - `documents`: id, name, path, category, file_type, size_bytes, indexed, created_at
    - `document_chunks`: id, document_id, content, chunk_index
    - `fts_documents`: virtual table FTS5 per ricerca full-text
    - `embeddings`: id, chunk_id, vector (solo se AI attiva)
  - Crea migrations SQL
  
  **References:**
  - SQLite FTS5: `https://sqlite.org/fts5.html` - Documentazione ufficiale
  - Schema attuale: vedi `backend/server.py:23-31` per tipi Document
  
  **Acceptance Criteria:**
  - [ ] File `migrations/001_initial.sql` creato con tutte le tabelle
  - [ ] Script `scripts/init_db.sql` inizializza database vuoto
  
  **QA Scenarios:**
  ```
  Scenario: Database si inizializza correttamente
    Tool: Bash
    Steps:
      1. sqlite3 smot.db < migrations/001_initial.sql
      2. sqlite3 smot.db ".schema"
    Expected: Output mostra tabelle documents, chunks, fts_documents
    Evidence: .sisyphus/evidence/t2-schema-created.txt
  ```
  
  **Commit:** YES
  - Message: `feat(db): add SQLite schema with FTS5 support`
  - Files: `migrations/`, `scripts/`

- [ ] **T3. Setup Rust + SQLite dependencies**

  **What to do:**
  - Aggiungi a `Cargo.toml`:
    - `rusqlite` = "0.32" (SQLite bindings)
    - `serde` = { version = "1.0", features = ["derive"] }
    - `tauri` = { version = "2.0", ... }
  - Crea modulo `src-tauri/src/db.rs` per gestione connessione
  - Implementa funzione `init_db()` che crea database se non esiste
  
  **References:**
  - rusqlite docs: `https://docs.rs/rusqlite/` - API reference
  
  **Acceptance Criteria:**
  - [ ] `cargo check` passa senza errori
  - [ ] Database si crea automaticamente in `app_data_dir`
  
  **QA Scenarios:**
  ```
  Scenario: Connessione database funziona
    Tool: Bash
    Steps:
      1. cargo test db::tests
    Expected: Test connection OK
    Evidence: .sisyphus/evidence/t3-db-connects.txt
  ```
  
  **Commit:** YES (gruppo con T2)

- [ ] **T4. Porting React UI base dalla repo esistente**

  **What to do:**
  - Copia file riutilizzabili da repo SMOT attuale:
    - Tutti i file in `src/pages/`
    - Tutti i file in `src/components/`
    - `src/context/LanguageContext.js`
    - `src/i18n/translations.js`
    - `src/styles.css`
  - Installa dipendenze: `lucide-react`, `react-router-dom`
  - Aggiorna import per funzionare con Vite (non CRA)
  
  **References:**
  - File sorgente: `/tmp/smot-analysis/frontend/src/`
  - Vite React setup: `https://vitejs.dev/guide/`
  
  **Acceptance Criteria:**
  - [ ] UI appare identica alla versione web
  - [ ] Routing funziona (Dashboard, Upload, Chat, Viewer, Settings)
  - [ ] Toggle lingua IT/EN funziona
  
  **QA Scenarios:**
  ```
  Scenario: UI si carica correttamente
    Tool: Playwright
    Steps:
      1. Apri app
      2. Screenshot homepage
    Expected: Layout 3 colonne visibile, sidebar sinistra, pannello destro
    Evidence: .sisyphus/evidence/t4-ui-loaded.png
  
  Scenario: Routing funziona
    Tool: Playwright
    Steps:
      1. Clicca "Upload" nella sidebar
      2. Clicca "Chat"
    Expected: Pagina cambia, URL aggiornato
    Evidence: .sisyphus/evidence/t4-routing.png
  ```
  
  **Commit:** YES
  - Message: `feat(ui): port existing React components to Tauri`
  - Files: `src/pages/`, `src/components/`, `src/context/`, `src/i18n/`

- [ ] **T5. Parser PDF in Rust**

  **What to do:**
  - Aggiungi dipendenza `pdf-extract` o `lopdf` a `Cargo.toml`
  - Crea funzione `extract_pdf_text(path: &Path) -> Result<String>`
  - Gestisci errori (PDF corrotto, protetto da password)
  - Test con vari PDF (testo, immagini, misti)
  
  **References:**
  - `pdf-extract` crate: `https://crates.io/crates/pdf-extract`
  - `lopdf` crate: `https://crates.io/crates/lopdf`
  
  **Acceptance Criteria:**
  - [ ] Estrae testo da PDF di testo
  - [ ] Ritorna errore gracefully per PDF corrotti
  
  **QA Scenarios:**
  ```
  Scenario: Estrazione PDF testuale
    Tool: Bash (cargo test)
    Steps:
      1. Crea test con PDF di esempio
      2. Chiama extract_pdf_text()
    Expected: Restituisce stringa con testo del PDF
    Evidence: .sisyphus/evidence/t5-pdf-extracts.txt
  ```
  
  **Commit:** YES

- [ ] **T6. Parser DOCX in Rust**

  **What to do:**
  - Aggiungi dipendenza `docx-rust` o `docx` crate
  - Crea funzione `extract_docx_text(path: &Path) -> Result<String>`
  - Supporta .docx (non .doc legacy)
  
  **References:**
  - `docx-rust` crate: `https://crates.io/crates/docx-rust`
  
  **Acceptance Criteria:**
  - [ ] Estrae testo da DOCX
  
  **QA Scenarios:**
  ```
  Scenario: Estrazione DOCX
    Tool: Bash (cargo test)
    Steps:
      1. Test con DOCX di esempio
    Expected: Testo estratto correttamente
    Evidence: .sisyphus/evidence/t6-docx-extracts.txt
  ```
  
  **Commit:** YES (gruppo con T5)

- [ ] **T7. Configurazione build CI/CD**

  **What to do:**
  - Crea `.github/workflows/build.yml` per GitHub Actions
  - Build su: Ubuntu (Linux), macOS, Windows
  - Artifacts: installer per ogni piattaforma
  - (Opzionale) Code signing per Mac/Windows
  
  **References:**
  - Tauri CI/CD: `https://v2.tauri.app/distribute/pipelines/github/` - GitHub Actions setup
  
  **Acceptance Criteria:**
  - [ ] Workflow GitHub Actions builda su tutte e 3 le piattaforme
  - [ ] Artifact scaricabili disponibili
  
  **QA Scenarios:**
  ```
  Scenario: CI build completa
    Tool: GitHub Actions logs
    Steps:
      1. Push su main
      2. Attendi workflow
    Expected: ✅ Tutti i job passano
    Evidence: .sisyphus/evidence/t7-ci-passed.txt
  ```
  
  **Commit:** YES
  - Message: `ci: add GitHub Actions build pipeline`
  - Files: `.github/workflows/`

### WAVE 2: Core

- [ ] **T8. Comandi Tauri: gestione documenti**

  **What to do:**
  - Implementa comandi Tauri in `src-tauri/src/lib.rs`:
    - `get_documents()` → lista documenti da DB
    - `get_document(id)` → singolo documento
    - `delete_document(id)` → elimina documento
  - Connetti a database SQLite
  
  **References:**
  - Tauri commands: `https://v2.tauri.app/develop/calling-rust/` - Invoke from frontend
  - Codice esistente: vedi `backend/server.py:264-266` per list_documents
  
  **Acceptance Criteria:**
  - [ ] Comando `get_documents` restituisce JSON array
  - [ ] Frontend può chiamare via `invoke('get_documents')`
  
  **QA Scenarios:**
  ```
  Scenario: Lista documenti
    Tool: Bash (cargo test)
    Steps:
      1. Inserisci 3 documenti di test nel DB
      2. Chiama get_documents()
    Expected: Restituisce array con 3 documenti
    Evidence: .sisyphus/evidence/t8-list-docs.txt
  ```
  
  **Commit:** YES

- [ ] **T9. Comandi Tauri: upload file**

  **What to do:**
  - Implementa `upload_documents(paths: Vec<String>)` comando
  - Usa Tauri dialog API per selezione file multipli
  - Copia file in `app_data_dir/documents/`
  - Estrai metadati: nome, dimensione, tipo
  - Inserisci record in tabella `documents`
  
  **References:**
  - Tauri dialog: `https://v2.tauri.app/reference/javascript/api/dialog/` - File dialog
  - Codice esistente: `backend/server.py:269-291` per upload simulato
  
  **Acceptance Criteria:**
  - [ ] Dialog file picker si apre
  - [ ] File copiati in data directory
  - [ ] Record creati in database
  
  **QA Scenarios:**
  ```
  Scenario: Upload file reale
    Tool: Playwright
    Steps:
      1. Clicca "Upload" in app
      2. Seleziona PDF di test
      3. Conferma
    Expected: File appare nella lista documenti
    Evidence: .sisyphus/evidence/t9-upload-works.png
  ```
  
  **Commit:** YES

- [ ] **T10. Implementazione ricerca FTS5**

  **What to do:**
  - Crea tabella virtuale FTS5: `CREATE VIRTUAL TABLE fts_documents USING fts5(content, content_rowid)`
  - Implementa `search_documents(query: &str) -> Vec<Document>`
  - Supporta: query multiple parole, ranking BM25, snippet preview
  - Triggers per sincronizzare FTS con tabella documenti
  
  **References:**
  - SQLite FTS5: `https://sqlite.org/fts5.html` - Full-text search
  - sqlite-vec: `https://github.com/asg017/sqlite-vec` - Vector search extension
  
  **Acceptance Criteria:**
  - [ ] Ricerca "contratto" trova documenti con quella parola
  - [ ] Ricerca multi-parola funziona (AND implicito)
  - [ ] Risultati ordinati per rilevanza
  
  **QA Scenarios:**
  ```
  Scenario: Ricerca base
    Tool: Bash (cargo test)
    Steps:
      1. Indicizza documento con testo "contratto di lavoro"
      2. Cerca "contratto"
    Expected: Documento trovato
    Evidence: .sisyphus/evidence/t10-search-works.txt
  
  Scenario: Ricerca snippet preview
    Tool: Bash (cargo test)
    Steps:
      1. Cerca con snippet()
    Expected: Restituisce frammento di testo con parole evidenziate
    Evidence: .sisyphus/evidence/t10-snippet.txt
  ```
  
  **Commit:** YES

- [ ] **T11. Indicizzazione documenti reale**

  **What to do:**
  - Implementa job di indicizzazione async
  - Per ogni documento:
    1. Estrai testo (usa T5/T6)
    2. Dividi in chunk (es. 500 caratteri)
    3. Inserisci chunk in tabella `document_chunks`
    4. Aggiorna FTS index
  - Tracciamento progresso: percentuale, documenti processati
  - Comandi: `start_indexing`, `get_indexing_status`, `pause_indexing`
  
  **References:**
  - Codice esistente: `backend/server.py:294-346` per API indicizzazione
  - Pattern job async in Rust: `tokio::task::spawn`
  
  **Acceptance Criteria:**
  - [ ] Indicizzazione parte con `start_indexing`
  - [ ] Progresso aggiornato via polling
  - [ ] Testo estratto e chunkato correttamente
  
  **QA Scenarios:**
  ```
  Scenario: Indicizzazione PDF
    Tool: Playwright
    Steps:
      1. Upload PDF di 3 pagine
      2. Avvia indicizzazione
      3. Attendi completamento
    Expected: Progresso arriva a 100%, documento risulta "indexed"
    Evidence: .sisyphus/evidence/t11-indexing-complete.png
  ```
  
  **Commit:** YES

- [ ] **T12. Rilevamento Ollama all'avvio**

  **What to do:**
  - All'avvio app, controlla se Ollama è in esecuzione:
    - Prova a connetterti a `http://localhost:11434/api/version`
    - Timeout: 2 secondi
  - Se presente:
    - Chiama `GET /api/tags` per lista modelli
    - Memorizza modelli disponibili in stato app
    - Mostra UI "AI pronta"
  - Se assente:
    - Mostra UI "AI non disponibile - ricerca tradizionale attiva"
    - Disabilita funzioni chat
  
  **References:**
  - Ollama API: `https://github.com/ollama/ollama/blob/main/docs/api.md`
  - Pattern capability detection: vedi ricerche precedenti
  
  **Acceptance Criteria:**
  - [ ] Rileva Ollama in <3 secondi all'avvio
  - [ ] UI si adatta a presenza/assenza AI
  
  **QA Scenarios:**
  ```
  Scenario: Ollama presente
    Tool: Bash
    Precondizioni: Ollama in esecuzione su localhost:11434
    Steps:
      1. Avvia app
      2. Controlla stato AI in UI
    Expected: Badge "AI pronta" visibile
    Evidence: .sisyphus/evidence/t12-ollama-detected.png
  
  Scenario: Ollama assente
    Tool: Bash
    Precondizioni: Ollama NON in esecuzione
    Steps:
      1. Avvia app
    Expected: Messaggio "AI non disponibile"
    Evidence: .sisyphus/evidence/t12-no-ollama.png
  ```
  
  **Commit:** YES

- [ ] **T13. UI integrazione Tauri API**

  **What to do:**
  - Aggiorna `services/api.js` per usare `@tauri-apps/api/core`:
    - Sostituisci `axios.get` con `invoke('command_name')`
  - Aggiorna componenti:
    - `DashboardPage`: usa `get_documents()` reale
    - `UploadPage`: usa dialog Tauri + `upload_documents()`
    - `IndexingPage`: polling status reale
  - Rimuovi dipendenza `axios` (non più necessaria)
  
  **References:**
  - Tauri API: `https://v2.tauri.app/reference/javascript/api/core/` - Invoke
  - Codice esistente: `frontend/src/services/api.js`
  
  **Acceptance Criteria:**
  - [ ] Tutte le pagine caricano dati reali dal backend Rust
  - [ ] Upload funziona con dialog nativo
  - [ ] Niente più errori 404 (API mock rimosse)
  
  **QA Scenarios:**
  ```
  Scenario: Dashboard carica documenti reali
    Tool: Playwright
    Steps:
      1. Aggiungi 2 documenti al DB manualmente
      2. Apri Dashboard
    Expected: Lista mostra i 2 documenti
    Evidence: .sisyphus/evidence/t13-dashboard-data.png
  ```
  
  **Commit:** YES

- [ ] **T14. Viewer con testo reale**

  **What to do:**
  - Implementa `get_document_page(id, page)` comando
  - Estrai pagine singole dal PDF (usa `pdf-extract` con info pagine)
  - Restituisci: testo, numero pagina, highlights (ricerca)
  - Viewer mostra testo reale, non mock
  
  **References:**
  - Codice esistente: `backend/server.py:377-398` per viewer API
  
  **Acceptance Criteria:**
  - [ ] Viewer mostra testo estratto dal PDF
  - [ ] Navigazione pagine funziona
  
  **QA Scenarios:**
  ```
  Scenario: Visualizzazione PDF
    Tool: Playwright
    Steps:
      1. Apri viewer per documento PDF
    Expected: Testo del PDF visibile (non lorem ipsum)
    Evidence: .sisyphus/evidence/t14-viewer-real.png
  ```
  
  **Commit:** YES

