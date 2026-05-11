# SMOT — Installer Checklist: Verso la Beta

> **Target:** Installer completo, funzionale, user-friendly
> **Branch:** `release/v0.1.0-beta`

---

## CRITICO - Bloccanti per la Beta (Salvatore)

| # | Cosa | File | Tempo |
|---|------|------|:---:|
| 1 | Wizard full-screen: nascondere sidebar/topbar in /onboarding | App.tsx | 10 min |
| 2 | Chiamare invoke('complete_onboarding') in handleFinish | OnboardingPage.tsx | 5 min |
| 3 | Aggiungere is_unified_memory e ram_available_gb al frontend | OnboardingPage.tsx:13 | 5 min |
| 4 | Mostrare memoria unificata Apple Silicon in UI | SystemDiscoveryStep.tsx | 10 min |

## Miglioramenti UX (Salvatore)

| # | Cosa | Tempo |
|---|------|:---:|
| 5 | Pulsante Salta tutto nel wizard | 10 min |
| 6 | Auto-detect lingua da navigator.language | 5 min |
| 7 | Toast Benvenuto dopo onboarding | 5 min |
| 8 | Gestione errori system probe | 10 min |
| 9 | Icona tray + minimize to tray | 30 min |
| 10 | Logo SMOT nel wizard header | 5 min |
| 11 | Frecce su Indietro/Avanti | 5 min |

## Backend - Gia Fatto (Michele)

| # | Cosa |
|---|------|
| A | complete_onboarding Tauri command |
| B | setup.rs check config prima di emettere first-launch |
| C | Apple Silicon unified memory detection |
| D | ram_available_gb in SystemProfile (Rust) |
| E | Auto-config tier per unified memory |
| F | Chiave updater generata |
| G | Build Rust + Frontend verificati |

## Istruzioni per i Fix

### FIX-4: App.tsx
Aggiungere useLocation e nascondere chrome quando isOnboarding = true.

### FIX-5: OnboardingPage.tsx
In handleFinish: await invoke('complete_onboarding') prima di navigate('/').

### FIX-6: SystemDiscoveryStep.tsx + OnboardingPage.tsx
Aggiungere is_unified_memory e ram_available_gb all'interfaccia SystemProfile.
Mostrare Memoria Unificata per Apple Silicon.

---

Tempo totale: 30 minuti per i critici. Poi npm run tauri build per il .dmg.
