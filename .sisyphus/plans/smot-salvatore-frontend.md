# SMOT — Piano Salvatore (Frontend React)

> **Team Plan:** `.sisyphus/plans/smot-team-plan.md` | **Repo:** BigBoss133/SMOT-APP

## TL;DR

> **Salvatore**: 10 task — 7 completati ✅, 3 da fare ⏳ (fix installer).

---

## ✅ Completato

| # | Task |
|---|------|
| C2 | Eliminare directory orfane (backend/, frontend/, test_reports/) ✅ |
| F1 | ErrorBoundary in App.tsx ✅ |
| F2 | Loading skeletons (Dashboard, Chat, Viewer) ✅ |
| F3 | Empty states ✅ |
| F4 | ConfirmDialog (azioni distruttive) ✅ |
| F5 | Toast notifications (success/error/info/warning) ✅ |
| F6 | Real-time indexing progress listener ✅ |

---

## ⏳ Da Fare (Installer Fix)

| # | Task | File |
|---|------|------|
| **FIX-4** | Wizard full-screen — nascondere sidebar/topbar in `/onboarding` | `App.tsx` |
| **FIX-5** | OnboardingPage chiama `complete_onboarding` alla fine | `OnboardingPage.tsx` |
| **FIX-6** | SystemDiscoveryStep mostra `is_unified_memory` e `ram_available_gb` | `SystemDiscoveryStep.tsx` |

### FIX-4: Wizard full-screen
```tsx
// In App.tsx, usa useLocation() per capire se sei su /onboarding
const location = useLocation();
const isOnboarding = location.pathname === '/onboarding';

// Se onboarding, NON mostrare sidebar, topbar, RightSystemPanel, StatusBar
{!isOnboarding && <>
  <SidebarNav />
  <header>...</header>
  <RightSystemPanel />
  <StatusBar />
</>}
```

### FIX-5: Salvare onboarding completato
```tsx
// In CompletionStep.tsx, alla fine del wizard:
import { invoke } from '@tauri-apps/api/core';
await invoke('complete_onboarding');
navigate('/');
```

### FIX-6: Mostrare unified memory
```tsx
// In SystemDiscoveryStep.tsx:
if (profile.is_unified_memory) {
  // Mostra "Memoria Unificata" invece di GPU VRAM
  // Mostra RAM disponibile: profile.ram_available_gb
}
```

---

## Build

```bash
cd smot-desktop && npx tsc --noEmit && npm run build  # exit 0 ✅
```

---

> 📋 Per iniziare: `/start-work smot-salvatore-frontend`