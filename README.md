# SMOT — Smart Archive Desktop

> Archivio documentale intelligente 100% offline con IA locale opzionale

## 🎯 Cos'è SMOT

SMOT è un'applicazione **desktop nativa** per l'archiviazione e la consultazione intelligente di documenti. Funziona completamente offline sul tuo computer, senza cloud, senza telemetria, senza inviare dati all'esterno.

### Caratteristiche Principali

- 📄 **Carica documenti** — PDF, DOCX, TXT e immagini (OCR)
- 🔍 **Ricerca full-text** — Trova qualsiasi documento per parola chiave
- 💬 **Chat RAG** — Interroga i tuoi documenti in linguaggio naturale
- 🧠 **IA Locale** — Funziona con Ollama (opzionale, privato, sul tuo PC)
- 🌐 **Bilingue** — Interfaccia in Italiano e Inglese
- 💻 **Cross-Platform** — Windows, macOS, Linux
- 🔒 **100% Offline** — Nessun dato lascia mai il tuo computer

---

## 📊 Stato Attuale: Gate G1 ✅ COMPLETATO

### Cosa Funziona

| Funzionalità | Stato | Dettaglio |
|-------------|-------|-----------|
| **Scaffold App** | ✅ | Tauri v2 + React + TypeScript + Vite |
| **Dashboard** | ✅ | Statistiche, azioni rapide, documenti recenti |
| **Upload Documenti** | ✅ | Drag & drop, picker file, gestione errori |
| **Indicizzazione** | ✅ | Job simulato con progresso visivo |
| **Chat** | ✅ | Interfaccia chat con pannello fonti |
| **Viewer** | ✅ | Visualizzazione paginata con highlight |
| **Impostazioni** | ✅ | Modalità hardware, toggle, salvataggio |
| **Navigazione** | ✅ | 6 route funzionanti con sidebar |
| **i18n** | ✅ | Toggle lingua IT/EN con tutte le traduzioni |
| **Test Suite** | ✅ | 15/15 test passati (100% frontend) |

### Cosa è Mock (da implementare in Gate G2)

| Funzionalità | Stato | Da Fare |
|-------------|-------|---------|
| **Database** | 🔄 Mock | SQLite con persistenza reale |
| **Upload** | 🔄 Mock | Parsing PDF/DOCX reale |
| **Ricerca** | 🔄 Mock | FTS5 full-text search |
| **Indicizzazione** | 🔄 Mock | Estrazione testo + chunking reale |
| **Chat AI** | 🔄 Mock | Integrazione Ollama + RAG |

---

## 🏗️ Architettura

```
smot-desktop/
├── src/                          # Frontend React TypeScript
│   ├── App.tsx                   # Layout principale (3 colonne + status bar)
│   ├── pages/
│   │   ├── DashboardPage.tsx     # Dashboard con stats e quick actions
│   │   ├── UploadPage.tsx        # Upload documenti con drag & drop
│   │   ├── IndexingPage.tsx      # Progresso indicizzazione in tempo reale
│   │   ├── ChatPage.tsx          # Chat RAG con pannello fonti
│   │   ├── ViewerPage.tsx        # Viewer paginato con highlights
│   │   └── SettingsPage.tsx      # Configurazione sistema e modalità
│   ├── components/
│   │   ├── SidebarNav.tsx        # Navigazione laterale
│   │   ├── RightSystemPanel.tsx  # Pannello sistema (CPU, RAM, status)
│   │   ├── StatusBar.tsx         # Barra inferiore con stats
│   │   └── HardwareModeSelector.tsx  # Selettore Performance/Balanced/Lite
│   ├── context/
│   │   └── LanguageContext.tsx   # Contesto lingua IT/EN
│   ├── i18n/
│   │   └── translations.ts       # File traduzioni
│   ├── services/
│   │   └── api.ts                # API layer (invoke Tauri + fallback)
│   ├── types.ts                  # Tipi TypeScript
│   ├── index.css                 # Stili globali (palette SMOT)
│   └── main.tsx                  # Entry point
│
├── src-tauri/                    # Backend Rust
│   ├── src/
│   │   ├── lib.rs               # Comandi Tauri per tutti gli endpoint
│   │   └── main.rs              # Entry point Rust
│   ├── Cargo.toml               # Dipendenze Rust
│   ├── tauri.conf.json          # Configurazione app Tauri
│   └── icons/                   # Icone per tutte le piattaforme
│
├── package.json                  # Dipendenze frontend
├── vite.config.ts               # Configurazione Vite
└── tsconfig.json                # Configurazione TypeScript
```

### Stack Tecnologico

| Layer | Tecnologia |
|-------|------------|
| **Framework Desktop** | Tauri v2 |
| **Frontend** | React 19 + TypeScript + Vite |
| **Backend** | Rust (Tauri commands) |
| **UI Components** | CSS custom + Lucide React icons |
| **Routing** | React Router v6 |
| **Testing** | Playwright (E2E) + Rust test |

---

## 🎨 Palette Colori Ufficiale SMOT

*Estratta da [SMOT Landing Page](https://github.com/BigBoss133/SMOT-Landing-page)*

### Colori Principali

| Nome | Hex | Anteprima | Uso |
|------|-----|-----------|-----|
| **Navy Scuro** | `#0a1a3b` | 🟦 | Sfondo principale, sidebar |
| **Indaco** | `#4338f5` | 🟣 | Gradienti, accenti primari |
| **Viola** | `#894df8` | 🟪 | Gradienti, hover states |
| **Oliva** | `#bcc41c` | 🟨 | Highlights, keyword, badge |
| **Bianco** | `#ffffff` | ⬜ | Testo principale, icone |

### Colori Secondari

| Nome | Hex | Uso |
|------|-----|-----|
| Grigio-blu | `#8a9bb5` | Testo secondario, placeholder |
| Bianco 8% | `rgba(255,255,255,0.08)` | Bordi, separatori |

### Gradiente Primario

```css
background: linear-gradient(135deg, #4338f5 0%, #894df8 100%);
```

---

## 📋 Test Results

**Data:** 2026-05-07  
**Tester:** Testing Agent (automatico)  
**Risultato:** ✅ **100% pass** (15/15 test)

### Test Eseguiti

| # | Test | Stato |
|---|------|-------|
| 1 | Initial Page Load — App shell | ✅ |
| 2 | Dashboard — Stats, quick actions | ✅ |
| 3 | Sidebar Navigation — 6 routes | ✅ |
| 4 | Upload Page — Dropzone, error handling | ✅ |
| 5 | Chat Page — Input, send, sources | ✅ |
| 6 | Viewer — Pagination, highlights | ✅ |
| 7 | Settings — Mode switching, toggles | ✅ |
| 8 | Indexing Demo State | ✅ |
| 9 | Language Toggle — IT/EN | ✅ |
| 10 | Quick Actions — Upload, Chat, Settings | ✅ |
| 11 | Recent Documents — Click to viewer | ✅ |
| 12 | Upload Error Handling | ✅ |
| 13 | Indexing Job Error | ✅ |
| 14 | Critical data-testid Elements | ✅ |
| 15 | Right System Panel | ✅ |

---

## 🚀 Prossimi Passi: Gate G2

Il piano dettagliato per la prossima iterazione è in:
📁 `.sisyphus/plans/smot-g2-persistence.md`

### Cosa Include Gate G2

1. **SQLite Database** — Persistenza reale dei documenti
2. **Parser PDF** — Estrazione testo con fallback OCR
3. **Parser DOCX** — Supporto documenti Word
4. **FTS5 Search** — Ricerca full-text nei documenti
5. **Indicizzazione Reale** — Job async con progresso
6. **Ollama Detection** — Rilevamento automatico AI locale
7. **Chat RAG** — Risposte basate sui documenti reali
8. **Fallback UI** — Funzionamento completo anche senza AI

### Per Eseguire

```bash
git clone https://github.com/BigBoss133/SMOT-APP.git
cd SMOT-APP
/start-work smot-g2-persistence
```

---

## 📚 Documentazione

| File | Descrizione |
|------|-------------|
| `README.md` | Questo file — panoramica app |
| `.sisyphus/plans/smot-v2-migration.md` | Piano originale completo (20 task + rischi) |
| `.sisyphus/plans/smot-g2-persistence.md` | Piano Gate G2 (12 task + palette colori) |
| `memory/PRD.md` | Product Requirements Document |
| `test_result.md` | Report dettagliato dei test |
| `test_reports/iteration_2.json` | Report JSON machine-readable |

---

## 🔗 Link

- **Repo App:** https://github.com/BigBoss133/SMOT-APP
- **Landing Page:** https://github.com/BigBoss133/SMOT-Landing-page
- **Ollama:** https://ollama.com (per AI locale)

---

*SMOT — Il tuo archivio intelligente, sul tuo computer, solo per te.*
