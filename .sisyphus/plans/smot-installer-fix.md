# SMOT — Fix Installer & Onboarding

> **Data:** 11 Maggio 2026 | **Branch:** `release/v0.1.0-beta`
> **Priorita:** 🔴 CRITICO — blocca il rilascio beta

---

## TL;DR

Due bug critici impediscono il corretto funzionamento dell'installer e dell'onboarding:
1. L'app mostra sidebar + dashboard + wizard TUTTI insieme invece del wizard full-screen
2. Apple Silicon viene rilevato come hardware scarso (VRAM=0) invece del reale

| Sviluppatore | Task | Area |
|---|---|---|
| **Michele** | Fix setup.rs, system_probe.rs, auto_config.rs | Backend Rust |
| **Salvatore** | Fix App.tsx (wizard full-screen), OnboardingPage | Frontend React |
| **Tommaso** | Test flow completo, update guide | QA + Docs |

---

## Analisi dei Bug

### Bug 1: App intera visibile invece del wizard

**Radice**: `setup.rs` NON controlla se config.json esiste già.
- Su OGNI avvio: crea config con `onboarding_completed: false`
- Su OGNI avvio: emette evento `first-launch`
- `App.tsx` riceve l'evento e naviga a /onboarding MA sidebar e topbar restano visibili

**Fix**: 
1. setup.rs deve controllare se config.json esiste e ha onboarding_completed = true
2. App.tsx deve nascondere sidebar/topbar quando il wizard e' attivo

### Bug 2: Apple Silicon VRAM rilevata come 0

**Radice**: `system_probe.rs` parsa `system_profiler SPDisplaysDataType` e cerca "VRAM".
- Apple Silicon ha memoria UNIFICATA (GPU condivide RAM)
- Il campo VRAM non esiste o mostra "(Dynamic, Max)"
- Parse fallisce -> gpu_vram_gb = None -> auto_config lo tratta come 0.0

**Fix**:
1. Su macOS, se il chip contiene "Apple", VRAM = RAM * 0.5
2. auto_config.rs: per macOS, basta RAM >= 8GB per supportare AI

---

## Wave 0 — Backend Fix (Michele)

- [ ] **FIX-1a**: `setup.rs` — check config esistente prima di sovrascrivere
  - Leggere config.json se esiste
  - Se `onboarding_completed = true`, NON emettere `first-launch`
  - Altrimenti, creare nuovo config e emettere evento solo al primo avvio
  - File: `smot-desktop/src-tauri/src/setup.rs`

- [ ] **FIX-1b**: `setup.rs` — aggiungere comando Tauri `complete_onboarding`
  - Riceve chiamata dal frontend quando il wizard finisce
  - Aggiorna `onboarding_completed: true` nel config.json
  - Serve a salvare lo stato permanentemente

- [ ] **FIX-2a**: `system_probe.rs` — fix Apple Silicon VRAM detection
  - Su macOS, se il nome GPU contiene "Apple" (Apple M1/M2/M3/M4)
  - Impostare `gpu_vram_gb = ram_total_gb * 0.5` (memoria unificata)
  - Aggiungere campo `is_unified_memory: bool` al `SystemProfile`

- [ ] **FIX-2b**: `auto_config.rs` — aggiustare tier per macOS
  - Su macOS con `is_unified_memory = true`: AI supportato se RAM >= 8GB
  - Rimuovere il requisito `gpu_vram >= 4.0` per Apple Silicon

- [ ] **FIX-3**: `system_probe.rs` — aggiungere RAM disponibile
  - Aggiungere `ram_available_gb` al `SystemProfile`
  - Usare `sys.available_memory()` per la RAM libera
  - Utile per mostrare nel wizard

---

## Wave 1 — Frontend Fix (Salvatore)

- [ ] **FIX-4**: `App.tsx` — wizard full-screen
  - Quando l'utente e' su `/onboarding`, nascondere completamente:
    - `<SidebarNav />`
    - `<header>` (topbar)
    - `<RightSystemPanel />`
    - `<StatusBar />`
  - Mostrare solo il contenuto del wizard a tutto schermo
  - Usare `useLocation()` per capire se siamo su `/onboarding`

- [ ] **FIX-5**: `OnboardingPage.tsx` — completare il wizard correttamente
  - Alla fine del wizard (CompletionStep), chiamare il comando Tauri `complete_onboarding`
  - Dopo il completamento, navigare a `/` (dashboard)
  - Salvare le preferenze scelte (lingua, licenza, modello AI)

- [ ] **FIX-6**: `SystemDiscoveryStep.tsx` — mostrare info hardware corrette
  - Mostrare RAM totale e disponibile invece che solo totale
  - Per macOS: mostrare "Memoria Unificata" invece di GPU VRAM
  - Adattare testo in base a `is_unified_memory`

---

## Wave 2 — Test & Docs (Tommaso)

- [ ] **FIX-7**: Test flusso completo
  - Primo avvio -> wizard appare full-screen
  - Completare wizard -> salva config, naviga a dashboard
  - Riavvio -> dashboard direttamente (senza wizard)
  - Verificare che su Apple Silicon il tier sia corretto
  - Testare su almeno 2 OS (macOS + Linux o Windows)

- [ ] **FIX-8**: Aggiornare guide installazione
  - Aggiungere sezione "Primo avvio" con screenshot
  - Spiegare cosa aspettarsi dal wizard
  - Nota su Apple Silicon

---

## Success Criteria

```bash
# Fix 1: Wizard full-screen al primo avvio
# Fix 2: Tier corretto su Apple Silicon
# Fix 3: Secondo avvio -> dashboard diretta
# Fix 4: Config.json non sovrascritto
```
