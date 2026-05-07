# Piano Iteration 3: Gate G2 — Persistenza e Funzionalità Reali

## TL;DR

**Stato attuale:** ✅ Gate G1 completato (Tauri scaffold + UI migrata)
**Obiettivo:** Gate G2 — Aggiungere persistenza SQLite, parsing documenti reale, e AI opzionale
**Focus:** Solo ciò che manca (non ricostruire ciò che funziona)
**Stima:** 25-35 ore | **Task:** 12 (snello e focalizzato)

---

## 🎨 Palette Colori SMOT (Estratta da Landing Page)

Colori ufficiali del brand SMOT, estratti dal sito https://github.com/BigBoss133/SMOT-Landing-page:

### Colori Principali

| Colore | Hex | Uso | CSS Variable |
|--------|-----|-----|--------------|
| **Navy Scuro** | `#0a1a3b` | Sfondo principale, sidebar | `--color-bg-primary` |
| **Indaco** | `#4338f5` | Gradienti, accenti primari | `--color-accent-primary` |
| **Viola** | `#894df8` | Gradienti, hover states | `--color-accent-secondary` |
| **Oliva/Giallo-verde** | `#bcc41c` | Highlights, keyword, badge AI | `--color-highlight` |
| **Bianco** | `#ffffff` | Testo principale, icone | `--color-text-primary` |

### Colori Secondari

| Colore | Hex | Uso | CSS Variable |
|--------|-----|-----|--------------|
| **Grigio-blu** | `#8a9bb5` | Testo secondario, placeholder | `--color-text-secondary` |
| **Bianco 8%** | `rgba(255,255,255,0.08)` | Bordi sottili, separatori | `--color-border` |
| **Bianco 88%** | `rgba(10,26,59,0.88)` | Overlay, backdrop | `--color-overlay` |

### Gradienti

```css
/* Gradiente principale (logo, hero) */
--gradient-primary: linear-gradient(135deg, #4338f5 0%, #894df8 100%);

/* Gradiente sfondo (opzionale) */
--gradient-bg: radial-gradient(ellipse at top, #1e3a8a 0%, #0a1a3b 100%);
```

### Esempi d'Uso

```css
/* Layout principale */
body { background: #0a1a3b; color: #ffffff; }

/* Sidebar */
.sidebar { background: #0a1a3b; border-right: 1px solid rgba(255,255,255,0.08); }

/* Bottone primario */
.btn-primary { 
  background: linear-gradient(135deg, #4338f5, #894df8);
  color: #ffffff;
}

/* Highlight/Keyword */
.highlight { color: #bcc41c; font-weight: 600; }

/* Testo secondario */
.text-muted { color: #8a9bb5; }
```

### Note Implementazione

- **Contrasto:** Testo bianco (#fff) su navy (#0a1a3b) = rapporto 12.5:1 ✅ (WCAG AAA)
- **Highlight oliva:** Usare solo per keyword, badge, accenti (non per testo principale)
- **Gradiente:** Usare per elementi importanti (CTA, logo, card hero)
- **Bordi:** Sempre con opacità bassa (8%) per non essere invasivi

---

## Cosa è Già Fatto (NON Toccare)

✅ **Tauri v2 scaffold** in `smot-desktop/`
✅ **UI React completa** — tutte le pagine migrate
✅ **Routing** — tutte le route funzionanti
✅ **i18n IT/EN** — toggle lingua funzionante
✅ **Mock API layer** — pronto per sostituzione con implementazione reale
✅ **Test suite** — 15/15 test passati

---

## Cosa Manca (Gate G2)

### Core Mancante
❌ **Persistenza:** Dati in-memory, no SQLite
❌ **Parser PDF/DOCX:** Upload simulato
❌ **Ricerca:** Nessuna implementazione
❌ **Indicizzazione:** Progresso simulato
❌ **AI Ollama:** Chat con risposte mock

---

## Work Objectives

### Core Objective
Aggiungere persistenza SQLite, parsing documenti reale, ricerca FTS5, e integrazione AI opzionale Ollama — mantenendo la UI esistente.

### Concrete Deliverables
1. Database SQLite con persistenza documenti
2. Parser PDF/DOCX funzionanti
3. Ricerca full-text FTS5
4. Indicizzazione reale con progresso
5. Integrazione Ollama (opzionale)
6. Chat RAG con context dai documenti

### Must Have
- [ ] SQLite + schema documenti
- [ ] Parser PDF (testo + OCR fallback)
- [ ] Parser DOCX
- [ ] Ricerca FTS5
- [ ] Indicizzazione con progresso reale
- [ ] Ollama detection
- [ ] Fallback UI quando AI assente

### Must NOT Have
- [ ] Ricostruire UI (già fatta)
- [ ] Cambiare routing
- [ ] Modificare design system
- [ ] Rimuovere mock API (sostituire gradualmente)

---

## Execution Strategy

### Wave 1: Database e Parsing (4 task paralleli)
```
├── G2-T1: Setup SQLite + schema
├── G2-T2: Parser PDF con OCR fallback
├── G2-T3: Parser DOCX
└── G2-T4: Integrazione database con API layer
```

### Wave 2: Ricerca e Indicizzazione (4 task paralleli)
```
├── G2-T5: FTS5 search implementation
├── G2-T6: Indicizzazione reale (async job)
├── G2-T7: Progress tracking con stato
└── G2-T8: Sostituzione mock API in UI
```

### Wave 3: AI e Finalizzazione (4 task)
```
├── G2-T9: Ollama detection e health check
├── G2-T10: Embeddings + vector storage
├── G2-T11: Chat RAG con context
└── G2-T12: Fallback UI + testing finale
```

---

## TODOs

### WAVE 1: Database e Parsing

- [ ] **G2-T1. Setup SQLite + Schema Database**

  **What to do:**
  - Aggiungi `rusqlite` a `Cargo.toml`
  - Crea schema tabelle:
    ```sql
    CREATE TABLE documents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      path TEXT NOT NULL,
      category TEXT,
      file_type TEXT,
      size_bytes INTEGER,
      indexed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE VIRTUAL TABLE fts_documents USING fts5(
      content, 
      content_rowid=rowid,
      tokenize='porter'
    );
    
    CREATE TABLE document_chunks (
      id TEXT PRIMARY KEY,
      document_id TEXT REFERENCES documents(id),
      content TEXT,
      chunk_index INTEGER
    );
    ```
  - Setup connessione DB in `lib.rs`
  - Database in `app_data_dir()` (cross-platform)

  **References:**
  - `smot-desktop/src-tauri/Cargo.toml` — aggiungi dipendenza
  - Piano originale: sezione R6 per path cross-OS
  
  **Acceptance Criteria:**
  - [ ] `cargo build` passa con rusqlite
  - [ ] Database si crea in `app_data_dir/smot.db`
  - [ ] Schema inizializzato correttamente
  
  **QA Scenarios:**
  ```
  Scenario: Database si crea correttamente
    Tool: Rust test
    Steps:
      1. Avvia app Tauri
      2. Chiama init_db()
    Expected: File smot.db creato con tabelle
    Evidence: .sisyphus/evidence/g2-t1-db-created.txt
  ```
  
  **Commit:** YES
  - Message: `feat(db): add SQLite schema and connection`

- [ ] **G2-T2. Parser PDF con OCR Fallback**

  **What to do:**
  - Aggiungi crate `pdf-extract` (testo nativo)
  - Aggiungi `tesseract` (OCR per scansioni)
  - Implementa funzione:
    ```rust
    pub fn extract_pdf_text(path: &Path) -> Result<String, ParseError> {
      // 1. Prova estrazione nativa
      match pdf_extract::extract_text(path) {
        Ok(text) if !text.trim().is_empty() => Ok(text),
        Ok(_) => {
          // 2. PDF è immagine → OCR
          ocr_pdf(path)
        }
        Err(e) => Err(ParseError::ExtractionFailed(e.to_string()))
      }
    }
    ```
  - Gestisci PDF corrotti con errore graceful

  **References:**
  - Piano originale: sezione R1 per multi-level fallback
  
  **Acceptance Criteria:**
  - [ ] Estrae testo da PDF testuali
  - [ ] OCR funziona per PDF scansioni
  - [ ] Errori gestiti senza panic
  
  **QA Scenarios:**
  ```
  Scenario: Estrazione PDF testuale
    Tool: Rust test
    Steps:
      1. Carica PDF di test (contratto.pdf)
      2. Chiama extract_pdf_text()
    Expected: Testo estratto > 100 caratteri
    Evidence: .sisyphus/evidence/g2-t2-pdf-text.txt
  
  Scenario: OCR su scansione
    Tool: Rust test
    Steps:
      1. Carica PDF scansione
      2. Chiama extract_pdf_text()
    Expected: OCR restituisce testo
    Evidence: .sisyphus/evidence/g2-t2-pdf-ocr.txt
  ```
  
  **Commit:** YES

- [ ] **G2-T3. Parser DOCX**

  **What to do:**
  - Aggiungi crate `docx-rust`
  - Implementa:
    ```rust
    pub fn extract_docx_text(path: &Path) -> Result<String, ParseError> {
      let doc = docx_rust::Docx::from_file(path)?;
      Ok(doc.extract_text())
    }
    ```
  - Supporta solo .docx (non .doc legacy)

  **Acceptance Criteria:**
  - [ ] Estrae testo da DOCX
  
  **QA Scenarios:**
  ```
  Scenario: Estrazione DOCX
    Tool: Rust test
    Steps:
      1. Carica DOCX di test
    Expected: Testo estratto correttamente
    Evidence: .sisyphus/evidence/g2-t3-docx.txt
  ```
  
  **Commit:** YES (gruppo con G2-T2)

- [ ] **G2-T4. Integrazione Database con API Layer**

  **What to do:**
  - Sostituisci mock in `lib.rs`:
    ```rust
    #[tauri::command]
    fn get_documents(state: State<AppState>) -> Result<Vec<Document>, String> {
      let conn = state.db.lock().map_err(|e| e.to_string())?;
      let mut stmt = conn.prepare("SELECT * FROM documents ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;
      // ... fetch e return
    }
    ```
  - Aggiorna `AppState` con connessione DB
  - Inizializza DB all'avvio app

  **Acceptance Criteria:**
  - [ ] `get_documents` legge da SQLite
  - [ ] UI mostra documenti reali (non mock)
  
  **QA Scenarios:**
  ```
  Scenario: Lista documenti da DB
    Tool: Playwright
    Steps:
      1. Inserisci 2 documenti nel DB
      2. Apri Dashboard
    Expected: Lista mostra 2 documenti
    Evidence: .sisyphus/evidence/g2-t4-db-list.png
  ```
  
  **Commit:** YES
  - Message: `feat(api): connect database to API commands`

### WAVE 2: Ricerca e Indicizzazione

- [ ] **G2-T5. FTS5 Search Implementation**

  **What to do:**
  - Implementa ricerca:
    ```rust
    #[tauri::command]
    fn search_documents(query: String, state: State<AppState>) -> Result<Vec<SearchResult>, String> {
      let conn = state.db.lock().map_err(|e| e.to_string())?;
      let sql = r#"
        SELECT d.*, snippet(fts_documents, 0, '<b>', '</b>', '...', 30) as snippet
        FROM documents d
        JOIN fts_documents ON d.rowid = fts_documents.rowid
        WHERE fts_documents MATCH ?1
        ORDER BY rank
      "#;
      // ... execute e return
    }
    ```
  - Triggers per mantenere FTS sincronizzato
  - Highlights nel testo (snippet)

  **References:**
  - SQLite FTS5: `https://sqlite.org/fts5.html`
  
  **Acceptance Criteria:**
  - [ ] Ricerca "contratto" trova documenti
  - [ ] Snippet mostra contesto con highlights
  
  **QA Scenarios:**
  ```
  Scenario: Ricerca full-text
    Tool: Rust test
    Steps:
      1. Indicizza documento con "pagamento"
      2. Cerca "pagamento"
    Expected: Documento trovato con snippet
    Evidence: .sisyphus/evidence/g2-t5-search.txt
  ```
  
  **Commit:** YES

- [ ] **G2-T6. Indicizzazione Reale (Async Job)**

  **What to do:**
  - Implementa job async con `tokio::task::spawn`:
    ```rust
    #[tauri::command]
    async fn start_indexing(
      document_ids: Vec<String>,
      state: State<'_, AppState>
    ) -> Result<String, String> {
      let job_id = uuid::Uuid::new_v4().to_string();
      
      tokio::spawn(async move {
        for doc_id in document_ids {
          // 1. Estrai testo con parser
          // 2. Dividi in chunk
          // 3. Salva chunk + aggiorna FTS
          // 4. Aggiorna progresso
        }
      });
      
      Ok(job_id)
    }
    ```
  - Comandi: `start_indexing`, `get_indexing_status`, `pause_indexing`

  **Acceptance Criteria:**
  - [ ] Indicizzazione processa documenti reali
  - [ ] Chunk salvati nel DB
  
  **QA Scenarios:**
  ```
  Scenario: Indicizzazione PDF
    Tool: Playwright
    Steps:
      1. Upload PDF
      2. Avvia indicizzazione
      3. Attendi completamento
    Expected: Documento risulta indexed=true
    Evidence: .sisyphus/evidence/g2-t6-indexing.png
  ```
  
  **Commit:** YES

- [ ] **G2-T7. Progress Tracking con Stato**

  **What to do:**
  - Struttura stato job:
    ```rust
    pub struct IndexingJob {
      pub id: String,
      pub status: JobStatus, // Running, Paused, Completed
      pub progress: f32, // 0.0 - 100.0
      pub current_document: String,
      pub processed_chunks: usize,
      pub total_chunks: usize,
    }
    ```
  - Stato in `Arc<Mutex<HashMap<String, IndexingJob>>>`
  - Polling da UI ogni 500ms

  **Acceptance Criteria:**
  - [ ] Progresso aggiorna in tempo reale
  - [ ] Pause/Resume funzionano
  
  **QA Scenarios:**
  ```
  Scenario: Progresso indicizzazione
    Tool: Playwright
    Steps:
      1. Avvia indicizzazione 3 documenti
      2. Osserva pagina Indexing
    Expected: Barra progresso avanza, percentuale aggiornata
    Evidence: .sisyphus/evidence/g2-t7-progress.gif
  ```
  
  **Commit:** YES

- [ ] **G2-T8. Sostituzione Mock API in UI**

  **What to do:**
  - In `services/api.ts`, verifica quali endpoint sono mock:
    ```typescript
    // Cambia da:
    export const getDocuments = async () => mockDocuments;
    // A:
    export const getDocuments = async () => {
      return await invoke('get_documents');
    };
    ```
  - Sostituisci uno per uno, testando dopo ogni cambio
  - Mantieni fallback browser per dev:
    ```typescript
    const isTauri = typeof window !== 'undefined' && (window as any).__TAURI__;
    export const getDocuments = isTauri 
      ? () => invoke('get_documents')
      : () => Promise.resolve(mockDocuments);
    ```

  **Acceptance Criteria:**
  - [ ] Tutti gli endpoint usano comandi Rust reali
  - [ ] UI funziona sia in Tauri che in browser dev
  
  **QA Scenarios:**
  ```
  Scenario: UI con dati reali
    Tool: Playwright
    Steps:
      1. Testa tutte le pagine
    Expected: Dati persistono dopo refresh
    Evidence: .sisyphus/evidence/g2-t8-ui-real.png
  ```
  
  **Commit:** YES

### WAVE 3: AI e Finalizzazione

- [ ] **G2-T9. Ollama Detection e Health Check**

  **What to do:**
  - All'avvio app:
    ```rust
    pub async fn check_ollama() -> Result<Vec<String>, String> {
      let client = reqwest::Client::new();
      let resp = client
        .get("http://localhost:11434/api/tags")
        .timeout(Duration::from_secs(2))
        .send()
        .await
        .map_err(|e| format!("Ollama non raggiungibile: {}", e))?;
      
      let models: Vec<String> = resp.json().await
        .map_err(|e| format!("Errore parsing: {}", e))?;
      
      Ok(models)
    }
    ```
  - Stato AI in React Context
  - UI mostra badge "AI Pronta" / "AI Non Disponibile"

  **References:**
  - Piano originale: sezione R3
  
  **Acceptance Criteria:**
  - [ ] Rileva Ollama in <3 secondi
  - [ ] UI si adatta a presenza/assenza AI
  
  **QA Scenarios:**
  ```
  Scenario: Ollama presente
    Tool: Playwright
    Precondizioni: Ollama in esecuzione
    Steps:
      1. Avvia app
    Expected: Badge "AI Pronta" visibile
    Evidence: .sisyphus/evidence/g2-t9-ollama.png
  ```
  
  **Commit:** YES

- [ ] **G2-T10. Embeddings + Vector Storage**

  **What to do:**
  - Se Ollama disponibile, genera embeddings:
    ```rust
    pub async fn generate_embedding(text: &str) -> Result<Vec<f32>, String> {
      let client = reqwest::Client::new();
      let resp = client
        .post("http://localhost:11434/api/embeddings")
        .json(&json!({
          "model": "nomic-embed-text",
          "prompt": text
        }))
        .send()
        .await?;
      
      let embedding: Vec<f32> = resp.json().await?;
      Ok(embedding)
    }
    ```
  - Salva embeddings in tabella `embeddings` (opzionale)
  - Se Ollama assente: salta embeddings

  **Acceptance Criteria:**
  - [ ] Embeddings generati (se AI disponibile)
  
  **QA Scenarios:**
  ```
  Scenario: Generazione embedding
    Tool: Rust test
    Precondizioni: Ollama con nomic-embed-text
    Steps:
      1. Chiama generate_embedding("test")
    Expected: Array di 768 float
    Evidence: .sisyphus/evidence/g2-t10-embedding.txt
  ```
  
  **Commit:** YES

- [ ] **G2-T11. Chat RAG con Context**

  **What to do:**
  - Implementa query RAG:
    ```rust
    #[tauri::command]
    async fn chat_query(
      question: String,
      state: State<'_, AppState>
    ) -> Result<ChatResponse, String> {
      // 1. Cerca chunk rilevanti (FTS5 o embeddings)
      let context = search_relevant_chunks(&question, &state).await?;
      
      // 2. Costruisci prompt
      let prompt = format!(
        "Basandoti su questi documenti:\n{}\n\nRispondi alla domanda: {}",
        context, question
      );
      
      // 3. Chiama Ollama
      let response = call_ollama_chat(&prompt).await?;
      
      Ok(ChatResponse {
        answer: response,
        sources: extract_sources(&context),
      })
    }
    ```
  - Stream risposta all'UI

  **Acceptance Criteria:**
  - [ ] Chat risponde basandosi su documenti caricati
  - [ ] Citazioni mostrano fonti reali
  
  **QA Scenarios:**
  ```
  Scenario: Chat con context
    Tool: Playwright
    Precondizioni: Documento caricato con "pagamento 100 euro"
    Steps:
      1. Scrivi "Quanto è il pagamento?"
    Expected: Risposta menziona "100 euro"
    Evidence: .sisyphus/evidence/g2-t11-chat-rag.png
  ```
  
  **Commit:** YES

- [ ] **G2-T12. Fallback UI + Testing Finale**

  **What to do:**
  - Fallback quando AI assente:
    ```typescript
    if (!aiAvailable) {
      return (
        <div className="ai-fallback">
          <Alert>AI non disponibile. Usa la ricerca.</Alert>
          <Button onClick={() => navigate('/')}>Vai alla Ricerca</Button>
        </div>
      );
    }
    ```
  - Test completo Gate G2:
    - Upload PDF → parsing → indicizzazione → ricerca → chat
    - Test senza Ollama (solo ricerca)
    - Test con Ollama (chat RAG)

  **Acceptance Criteria:**
  - [ ] App funziona senza AI
  - [ ] App funziona con AI
  - [ ] Tutti i test passano
  
  **QA Scenarios:**
  ```
  Scenario: Test completo flusso
    Tool: Playwright
    Steps:
      1. Upload PDF
      2. Indicizza
      3. Cerca nel documento
      4. Chat con domanda sul documento
    Expected: Tutto funziona end-to-end
    Evidence: .sisyphus/evidence/g2-t12-complete-flow.png
  ```
  
  **Commit:** YES
  - Message: `feat: complete Gate G2 with AI fallback`

---

## Risk Mitigation (Sintesi)

### R1. Parser incompleti → G2-T2 con OCR fallback
### R2. sqlite-vec instabile → Non usare in G2 (solo FTS5)
### R3. Ollama mancante → G2-T9 detection + G2-T12 fallback
### R4. Regressioni UI → Sostituzione graduale endpoint (G2-T8)
### R5. Race condition job → Stato centralizzato con Mutex (G2-T7)
### R6. Path OS → Sempre `app_data_dir()` (G2-T1)

---

## Commit Strategy

**Wave 1:**
- `feat(db): add SQLite schema and connection`
- `feat(parser): add PDF and DOCX text extraction`
- `feat(api): connect database to API commands`

**Wave 2:**
- `feat(search): implement FTS5 full-text search`
- `feat(indexing): add real document indexing with progress`
- `feat(ui): replace mock APIs with real commands`

**Wave 3:**
- `feat(ai): add Ollama detection and health check`
- `feat(embeddings): integrate Ollama for vector generation`
- `feat(rag): implement real RAG chat with context`
- `feat: complete Gate G2 with AI fallback`

---

## Success Criteria

### Gate G2 Completo Quando:
- [ ] Upload PDF/DOCX → parsing reale
- [ ] Indicizzazione → progresso reale, dati in SQLite
- [ ] Ricerca → FTS5 trova documenti
- [ ] Chat → RAG con Ollama (se presente)
- [ ] Fallback → funziona senza AI
- [ ] Test suite → 15/15 passano + nuovi test

### Comandi Verifica:
```bash
cd smot-desktop
cargo test  # Test Rust passano
npm run test  # Test React passano
cargo tauri dev  # App funziona
```

---

## Next Steps

1. ✅ Gate G1: Scaffold Tauri + UI (COMPLETATO)
2. 🔄 **Gate G2: Persistenza e Funzionalità Reali (QUESTO PIANO)**
3. ⏳ Gate G3: Ottimizzazioni e Polish (futuro)

**Per iniziare:**
```bash
git checkout conflict_070526_1255
/start-work smot-g2-persistence
```
