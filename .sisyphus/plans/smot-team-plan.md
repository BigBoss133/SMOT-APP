# SMOT-APP — Piano Lavoro Team (Michele · Salvatore · Tommaso)

> **Piano generato:** 11 Maggio 2026 | **Repo:** [BigBoss133/SMOT-APP](https://github.com/BigBoss133/SMOT-APP)
> **OpenCode Ready** — Ogni task è delegabile a Sisyphus con `/start-work`

---

## TL;DR

> **Obiettivo**: Trasformare i 10 comandi Rust stub in implementazioni reali, completare il frontend con polish UI, aggiungere sicurezza e pulire la repo.
>
> **Team**: 3 sviluppatori — Michele (Rust backend 10 stub + onboarding), Salvatore (React frontend 6 polish), Tommaso (4 funzioni DB + 4 security + cleanup)
>
> **Task Totali**: 28 (10 Michele + 6 Salvatore + 8 Tommaso + 4 condivisi)
> **Ore Stimate**: ~50h (19h Michele + 14h Salvatore + 12h Tommaso + 5h cleanup)
> **Waves**: 3 parallele + 1 finale

---

## Contesto

### Stato Attuale della Repo

```
smot-desktop/          ← APP PRINCIPALE (Tauri v2 + React 19 + Rust)
  src-tauri/src/
    lib.rs             ← 10 comandi STUB (⚠️ CRITICO)
    ollama.rs          ← ✅ Reale (status, download modelli)
    db.rs              ← ✅ Reale (init, schema) — MANCANO 4 funzioni query
    parsers.rs         ← ✅ Reale (PDF, DOCX, XLSX)
    setup.rs           ← ✅ Reale
    system_probe.rs    ← ✅ Reale
    auto_config.rs     ← ✅ Reale
  src/
    pages/             ← 8 pagine React ✅
    components/        ← 18 componenti ✅
    hooks/             ← 4 hooks ✅
    services/          ← api.ts, ollama.ts, graphRelations.ts ✅

⚠️ FILE DA ELIMINARE:
  ROOT: CODE-REVIEW-FIXES.md (77KB verbose), installer-status.md, test_result.md
  DIR:  backend/ (Flask orfano), frontend/ (package.json orfano), test_reports/
  PLANS OBSOLETI: smot-installer-implementation.md, smot-installer-windows-ai.md
```

### Cosa È Già Fatto

| Area | Stato | Chi |
|------|:-----:|-----|
| Scaffold Tauri v2 + React 19 + TypeScript | ✅ | Michele |
| Design system + animazioni + Graph View | ✅ | Salvatore |
| Installer + Wizard + CI/CD | ✅ | Michele |
| Ollama detection/download/status | ✅ | Michele |
| Code review fixes (C1-C2, W1-W12) | ✅ | Michele |

---

## Obiettivi Lavoro

### Core Objective
Trasformare SMOT da scaffold funzionante ma con dati finti a un'applicazione reale e completa.

### Deliverables Concreti
- [ ] 10 comandi Tauri Rust con implementazioni reali (non stub)
- [ ] 4 funzioni database SQLite implementate
- [ ] 6 miglioramenti frontend React
- [ ] 4 fix di sicurezza
- [ ] Repo pulita (file obsoleti rimossi)
- [ ] REPO-ANALYSIS.md aggiornato

### Must NOT Have (Guardrails)
- ❌ NON toccare `ollama.rs`, `setup.rs`, `system_probe.rs`, `auto_config.rs` — già reali
- ❌ NON modificare firme dei comandi Tauri esistenti — Salvatore ci ha già integrato il frontend
- ❌ NON aggiungere nuove dipendenze Rust senza accordo del team
- ❌ NON pushare direttamente su `main` — sempre via PR con review
- ❌ NON rifare installer/CI/CD — già completato da Michele
- ❌ NON rifare animazioni/Graph View — già completato da Salvatore

---

## Strategia di Esecuzione

### Wave 0 — Prep & Cleanup (SUBITO, in parallelo)

> Pulizia repo e preparazione ambiente. Tutti e 3 possono partire immediatamente.

| Task | Chi | Descrizione |
|------|-----|------------|
| C1 | Michele | Eliminare file obsoleti (CODE-REVIEW-FIXES.md, installer-status.md, test_result.md) |
| C2 | Salvatore | Eliminare directory orfane (backend/, frontend/, test_reports/) |
| C3 | Tommaso | Archiviare piani .sisyphus obsoleti, aggiornare README.md |
| C4 | Michele | Aggiornare REPO-ANALYSIS.md |

### Wave 1 — Database + Backend Base + Frontend Foundation (MAX PARALLEL)

| Task | Chi | Descrizione | Dipendenze |
|------|-----|-------------|------------|
| D1-D4 | Tommaso | 4 funzioni database SQLite (insert, get_all, update_status, search_fts5) | — |
| B1 | Michele | get_system_status reale (sysinfo) | — |
| B2 | Michele | get_documents da SQLite | D2 |
| B7 | Michele | get_viewer_page reale | — |
| F1 | Salvatore | ErrorBoundary in App.tsx | — |
| F2 | Salvatore | Loading skeletons (Dashboard, Chat, Viewer) | — |
| F3 | Salvatore | Empty state component | — |

### Wave 2 — Backend Core + Frontend Interattivo + Sicurezza (MAX PARALLEL)

| Task | Chi | Descrizione | Dipendenze |
|------|-----|-------------|------------|
| B3 | Michele | upload_documents salva file reali | D1 |
| B4 | Michele | start_indexing pipeline | D3 |
| B5 | Michele | get_indexing_status reale | B4 |
| B6 | Michele | chat_query RAG con Ollama | D4 |
| B8-B10 | Michele | Indexing controls (pause/resume/background) | B4 |
| F4 | Salvatore | Dialog conferma azioni distruttive | — |
| F5 | Salvatore | Componente Toast notifiche | — |
| F6 | Salvatore | Event listener indexing-progress | B4 |
| S1 | Tommaso | Validazione input comandi Tauri | — |
| S2 | Tommaso | Rate limiting Ollama | — |

### Wave 3 — Security Finale + Integrazione

| Task | Chi | Descrizione |
|------|-----|------------|
| S3 | Tommaso | Sanitizzazione filename upload |
| S4 | Tommaso | Pulizia dati sensibili config |
| INT | Team | Integration test — flusso completo upload → indexing → chat |

---

## Piani Individuali

| Piano | Per | Task |
|---|---|---|
| [`smot-michele-backend.md`](smot-michele-backend.md) | Michele | 11 (C1, C4, B1-B10) |
| [`smot-salvatore-frontend.md`](smot-salvatore-frontend.md) | Salvatore | 7 (C2, F1-F6) |
| [`smot-tommaso-db-security.md`](smot-tommaso-db-security.md) | Tommaso | 9 (C3, D1-D4, S1-S4) |

> 🚀 Ogni piano si esegue con `/start-work <nome-piano>`

---

## Success Criteria

### Comandi di Verifica
```bash
# Backend compila
cd smot-desktop/src-tauri && cargo build
# Expected: exit 0

# Frontend compila
cd smot-desktop && npx tsc --noEmit
# Expected: exit 0

# Tutti i comandi sono reali (non stub)
grep -c "sample_documents\|hardcoded\|finto\|simulat" smot-desktop/src-tauri/src/lib.rs
# Expected: 0

# File obsoleti rimossi
ls CODE-REVIEW-FIXES.md 2>&1
# Expected: No such file or directory
```

### Checklist Finale
- [ ] `cargo build` passa (0 errori)
- [ ] `npx tsc --noEmit` passa (0 errori)
- [ ] 0 riferimenti a dati finti/hardcoded in lib.rs
- [ ] REPO-ANALYSIS.md aggiornato
- [ ] File obsoleti eliminati
- [ ] Directory orfane rimosse
- [ ] Piani .sisyphus obsoleti archiviati
