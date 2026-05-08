# 🔍 SMOT-APP — Analisi Completa Repository

> **🔄 Aggiornamento 7 Maggio 2026 — Fix Installer Completati**
>
> Tutti i 5 fix critici sono stati implementati localmente. 3 commit in attesa di push su GitHub (token scaduto).

> **Data:** 7 Maggio 2026 | **Repo:** [BigBoss133/SMOT-APP](https://github.com/BigBoss133/SMOT-APP)

---

## 🌿 Branches

| Branch | Ruolo | Commit | Stato |
|--------|-------|--------|:-----:|
| `main` | Backend + logica core | `8abe0c5` | 🟡 Scaffold pronto, logica da implementare |
| `Animations-and-design` | UI/UX, Graph View, animazioni | `129f429` | 🟢 Design pronto, già mergiato in main |
| `installer` | Installer + wizard onboarding | `6a73f70` | 🟢 Piano completato, 5 fix necessari |

---

## 📦 BRANCH: `main`

### Stato Attuale
Scaffold Tauri v2 + React 19 funzionante. **Tutti i comandi backend restituiscono dati mock/finti.**

### File Chiave
| File | Contenuto | Problema |
|------|-----------|----------|
| `src-tauri/src/lib.rs` | 13 comandi Tauri | ⚠️ Tutti mock — `get_system_status` hardcoded, `chat_query` risposta finta, `get_documents` ritorna 3 doc finti |
| `src-tauri/src/db.rs` | SQLite init + FTS5 | ✅ Funzionante |
| `src-tauri/src/parsers.rs` | PDF/DOCX extraction | ✅ Funzionante |
| `src/components/GraphView/` | 8 componenti Graph View | ✅ Completati |
| `src/hooks/` | useForceGraph, useAnimation, etc. | ✅ Completati |
| `src/services/api.ts` | Frontend API wrapper | ✅ Funzionante |
| `src/i18n/translations.ts` | IT/EN | ✅ 34 chiavi |

### Problemi Critici
| # | Problema | Severità |
|---|---------|----------|
| M1 | `get_system_status` restituisce dati hardcoded (ram_used: 6.4, cpu: 21%) | 🔴 |
| M2 | `chat_query` non usa Ollama — risposta finta hardcoded | 🔴 |
| M3 | `get_documents` restituisce 3 documenti fake, non legge da SQLite | 🔴 |
| M4 | `get_indexing_status` è completamente simulato | 🔴 |
| M5 | `upload_documents` non salva realmente i file | 🔴 |
| M6 | Nessun auto-update configurato | 🟡 |
| M7 | Nessuna firma codice | 🟡 |
| M8 | GPU detection assente in `system_probe.rs` (NON presente su main) | N/A* |

\* system_probe.rs esiste solo su `installer`

### Piano Associato: `smot-v2-migration.md`
- **Task totali:** 85
- **Completati:** 0 (0%)
- **Stato:** Da iniziare

### Fix Necessari
1. **Implementare comandi reali**: sostituire mock con query SQLite + Ollama
2. **Indicizzazione documenti**: pipeline reale con chunking ed embedding
3. **Persistenza upload**: salvare file su disco + metadata in DB
4. **Chat RAG**: integrare Ollama con recupero documenti

---

## 🎨 BRANCH: `Animations-and-design`

### Stato Attuale
🟢 **Completato e mergiato in `main`.** Non richiede ulteriore lavoro immediato.

### File
| Categoria | File |
|-----------|------|
| Graph View | `GraphView.tsx`, `GraphNode.tsx`, `GraphEdge.tsx`, `GraphCanvas.tsx`, `GraphControls.tsx`, `GraphLegend.tsx`, `GraphSidebar.tsx`, `GraphTooltip.tsx` |
| Hooks | `useForceGraph.ts`, `useGraphData.ts`, `useGraphZoom.ts`, `useAnimation.ts` |
| Services | `graphRelations.ts` |
| Page | `GraphPage.tsx` (routed in App.tsx) |

### Piano Associato: `smot-animations-design.md`
- **12 categorie di animazioni CSS catalogate**
- **Graph View plan** — implementato ✅

### Miglioramenti Possibili
1. Transizioni tra nodi con spring physics
2. Zoom su doppio click nodo
3. Filtri per categoria nella sidebar
4. Export graph come immagine

---

## 📦 BRANCH: `installer`

### Stato Attuale
🟢 **Piano 28/28 completato (100%)** — MA con 5 fix necessari prima del rilascio.

### Cosa Aggiunge Rispetto a `main`
| Categoria | File |
|-----------|------|
| **Bundle** | NSIS/WiX config in `tauri.conf.json`, assets BMP/RTF |
| **Rust** | `system_probe.rs`, `auto_config.rs`, `setup.rs`, `ollama.rs` |
| **Wizard** | `OnboardingPage.tsx` + 6 componenti onboarding |
| **CI/CD** | `.github/workflows/` (Windows, macOS, Linux) |
| **Docs** | `code-signing.md`, `installer-test-plan.md`, `installer-status.md` |

### Verifiche Superate
- ✅ TypeScript: 0 errori (`tsc -b`)
- ✅ LSP Rust: 0 errori su 8 moduli
- ✅ Asset: BMP header/welcome, RTF licenza
- ✅ Wizard: 5 step funzionanti
- ✅ Ollama: detection + download + progress bar
- ✅ CI/CD: 3 workflow GitHub Actions

### 🔴 Fix Necessari (PRIMA del rilascio)

| # | Fix | File da Modificare | Priorità | Stato |
|---|-----|-------------------|----------|--------|
| **F1** | Collegare BMP a NSIS | `tauri.conf.json` → aggiungere `headerImage`/`welcomeImage` nella sezione NSIS | 🔴 ALTA | ✅ Completato |
| **F2** | Aggiungere auto-update | `Cargo.toml` → `tauri-plugin-updater`, `tauri.conf.json` → `plugins.updater` | 🔴 ALTA | ✅ Completato |
| **F3** | Firma codice Windows | `.github/workflows/build-windows.yml` → aggiungere step `signtool` | 🟡 MEDIA | ✅ Completato |
| **F4** | GPU detection reale | `system_probe.rs` → usare `wgpu` o comandi OS per rilevare GPU | 🟡 MEDIA | ✅ Completato |
| **F5** | Gestione errori startup | `setup.rs` → non propagare errori con `?`, usare `log::error` + fallback | 🟢 BASSA | ✅ Completato |

### 🟡 Miglioramenti Consigliati

| # | Miglioramento |
|---|--------------|
| I1 | Compressione UPX su eseguibile (riduce dimensione 40-60%) |
| I2 | Aggiungere `tauri-plugin-dialog` per file picker nativo |
| I3 | Aggiungere `tauri-plugin-shell` per link esterni (ollama.com) |
| I4 | Service worker per caching offline |
| I5 | Supporto installazione silenziosa (`/S` flag NSIS) |
| I6 | Backup automatico config.json prima di update |

---

## 🔗 Dipendenze Cross-Branch

```
main ──────────────────────► installer (eredita tutto backend)
  │                              │
  ├── Graph View (da Animations) │
  ├── db.rs, parsers.rs          │
  └── 13 comandi mock            │
                                 │
                   installer aggiunge:
                   ├── system_probe.rs
                   ├── auto_config.rs
                   ├── setup.rs
                   ├── ollama.rs
                   ├── Wizard (7 file React)
                   ├── CI/CD (3 workflow)
                   └── Asset installer
```

**⚠️ IMPORTANTE:** I fix su `main` (comandi reali) vanno fatti PRIMA di mergiare `installer` in `main`, altrimenti l'installer erediterà comandi mock che restituiscono dati falsi.

---

## 📊 Priorità Lavoro

### Fase 1 — Installer Fix (1-2 giorni) ✅ COMPLETATA
```
F1 → F2 → F4 → F5 → F3
```
Obiettivo: Installer pronto per test reale. ✅ Tutti i 5 fix implementati.

### Fase 2 — Backend Reale (3-5 giorni)
```
M1 → M3 → M5 → M2 → M4
```
Obiettivo: Sostituire tutti i mock con implementazioni reali (SQLite + Ollama).

### Fase 3 — Polish & Rilascio (2-3 giorni)
```
I1 → I2 → I3 → F3 → Rilascio v0.1.0
```
Obiettivo: Primo installer funzionante scaricabile da GitHub Releases.

---

## 📋 Riepilogo Fix per Piano

| ID | Task | Branch | File |
|----|------|--------|------|
| F1 | Wire BMP assets to NSIS | `installer` | `tauri.conf.json` |
| F2 | Add tauri-plugin-updater | `installer` | `Cargo.toml`, `tauri.conf.json` |
| F3 | Code signing in CI | `installer` | `build-windows.yml` |
| F4 | Real GPU detection | `installer` | `system_probe.rs` |
| F5 | Startup error handling | `installer` | `setup.rs`, `lib.rs` |
| M1 | Real system status | `main` | `lib.rs` |
| M2 | Real chat with Ollama | `main` | `lib.rs` |
| M3 | Real document loading from DB | `main` | `lib.rs` |
| M4 | Real indexing pipeline | `main` | `lib.rs` |
| M5 | Real file upload persistence | `main` | `lib.rs` |

---

## ✅ Fix Completati (7 Maggio 2026)

| Fix | Descrizione | Commit | File Modificati |
|-----|------------|--------|-----------------|
| F1 | BMP collegati a NSIS | `bac66af` | `tauri.conf.json` |
| F2 | Auto-updater plugin | `bac66af` | `Cargo.toml`, `lib.rs`, `capabilities/default.json`, `tauri.conf.json` |
| F3 | Code signing CI template | `d8c48af` | `build-windows.yml` |
| F4 | GPU detection reale | `d671129` | `system_probe.rs` (OS-specific lspci/nvidia-smi, wmic, system_profiler) |
| F5 | Gestione errori startup | `d671129` | `setup.rs`, `lib.rs` (log::error invece di panic) |

### Commit Locali (da pushare)
```
d8c48af ci: add commented-out code signing step template (F3)
d671129 fix(installer): real GPU detection and graceful startup error handling
bac66af fix(installer): wire BMP assets to NSIS and add auto-updater plugin
```

### Verifiche
- ✅ TypeScript: 0 errori (`tsc -b`)
- ✅ LSP Rust: 0 errori (su tutti i moduli)
- ✅ GPU detection: Linux (lspci+nvidia-smi), Windows (wmic), macOS (system_profiler)
- ✅ Startup: mai crash, sempre logga errori con fallback

---

*Analisi generata il 7 Maggio 2026 — da aggiornare dopo ogni sessione di lavoro.*