# PRD — SMOT Smart Archive (Iterazione 1)

## Problema originale
Progettare e implementare l'interfaccia desktop di **SMOT**, archivio documentale intelligente **offline-first**, con flussi principali:
- Dashboard con statistiche e azioni rapide
- Upload documenti (drag & drop / picker)
- Indicizzazione con progresso visivo
- Chat RAG con fonti
- Viewer documento con navigazione pagina e highlight
- Settings e monitor risorse

Vincoli branding/UI forniti:
- Palette SMOT: `#0a1a3b`, `#4338f5`, `#894df8`, `#bcc41c`, `#c084fc`, `#ffffff`
- Testi ad alto contrasto (bianco su sfondi scuri, nero su bianco)
- Oliva `#bcc41c` solo per parole chiave/highlight

Scelte utente confermate:
1. **UI/UX + API backend base**
2. **Selettore modalità hardware in dashboard**
3. **Interfaccia bilingue IT/EN**
4. **Viewer con paginazione + highlight dinamici simulati**
5. Priorità **bilanciata** (visual + flussi)

## Decisioni architetturali
- Stack creato da zero:
  - **Frontend:** React (CRA), React Router, Axios, Lucide icons
  - **Backend:** FastAPI
- API backend base con logica simulata per:
  - upload documenti
  - avvio/stato indicizzazione progressiva
  - chat con fonti
  - viewer paginato con highlight
- Stato dati backend in-memory per MVP rapido (senza persistenza DB in questa iterazione)
- UI desktop a 3 aree: sidebar sinistra, workspace centrale, sidebar destra, con status bar inferiore

## Implementato
### Backend (`/app/backend`)
- `server.py` con endpoint:
  - `GET /api/health`
  - `GET /api/system/status`
  - `GET/PUT /api/modes`
  - `GET /api/documents`
  - `POST /api/documents/upload`
  - `POST /api/indexing/start`
  - `GET /api/indexing/status/{job_id}`
  - `POST /api/indexing/pause/{job_id}`
  - `POST /api/indexing/resume/{job_id}`
  - `POST /api/indexing/background/{job_id}`
  - `POST /api/chat/query`
  - `GET /api/viewer/{document_id}/page/{page}`
- Seed documenti demo + progresso indicizzazione simulato
- Test backend aggiunti dal testing agent: `11/11` passati

### Frontend (`/app/frontend`)
- Routing pagine:
  - `/` Dashboard
  - `/upload` Upload & gestione file selezionati
  - `/indexing/:jobId` Progress indicizzazione con polling
  - `/chat` Interfaccia chat con fonti cliccabili
  - `/viewer` e `/viewer/:documentId` Viewer paginato con highlight
  - `/settings` Configurazioni sistema
- Layout coerente con requisiti SMOT (3 colonne + status bar)
- Palette applicata, highlight oliva sui termini chiave
- Toggle lingua IT/EN globale
- Data-testid estesi per elementi interattivi e informazioni chiave
- Correzioni post-test:
  - fix path API frontend (`/api/api/*` -> corretto)
  - gestione errori fetch iniziali in `App.js` per evitare runtime overlay bloccante

## Backlog prioritizzato
### P0 (prossimo step)
- Persistenza reale documenti/job su database locale
- Upload reale file/cartelle/ZIP con parsing metadati
- Indicizzazione reale (estrazione testo/chunking/embedding locale)
- Miglioramento gestione errori UI per ogni flusso (messaggi contestuali)

### P1
- Onboarding hardware dedicato (wizard iniziale)
- Filtri avanzati documenti/tag e multi-select batch operations
- Viewer con anteprima miniatura pagine e jump rapido alle fonti

### P2
- Telemetria locale avanzata (CPU/GPU/VRAM timeline)
- Temi multipli e personalizzazione workspace
- Export conversazioni e report fonti

## Next tasks consigliati
1. Integrare parser file reali (PDF/DOCX/TXT/immagini OCR)
2. Collegare un vector store locale per retrieval semantico reale
3. Rendere click-to-source completamente sincronizzato con viewer e posizione evidenziata

