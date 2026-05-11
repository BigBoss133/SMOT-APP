# SMOT — Piano Salvatore (Frontend React)

> **Team Plan:** `.sisyphus/plans/smot-team-plan.md` | **Repo:** BigBoss133/SMOT-APP

## TL;DR

> **Salvatore**: 7 task — 1 cleanup + 6 frontend polish. ~14h.
> **Obiettivo**: Aggiungere ErrorBoundary, loading skeletons, empty states, dialog, toast e real-time indexing progress.

---

## Wave 0 — Cleanup (immediato)

- [ ] C2. Eliminare directory orfane

  **What to do**: Eliminare `backend/`, `frontend/`, `test_reports/`. NON toccare `smot-desktop/`.
  
  **QA**: `ls -d backend/ frontend/ test_reports/ 2>&1` → "No such file" per tutte
  
  **Commit**: `chore: remove orphan directories`

---

## Wave 1 — Frontend Foundation

- [ ] F1. ErrorBoundary in App.tsx

  **What to do**:
  - Creare `smot-desktop/src/components/ErrorBoundary.tsx`
  - Classe React con `componentDidCatch` + `getDerivedStateFromError`
  - Fallback UI: messaggio amichevole + "Riprova" + "Torna alla Home"
  - Wrappare `<Routes>` in `App.tsx` con `<ErrorBoundary>`

  **QA Playwright**: Navigare a pagina con errore → fallback UI mostrato → "Riprova" funziona

  **Commit**: `feat(frontend): add ErrorBoundary`

- [ ] F2. Loading skeletons

  **What to do**:
  - Creare `smot-desktop/src/components/Skeleton.tsx` riutilizzabile
  - DashboardPage: skeleton mentre carica documenti
  - ChatPage: skeleton mentre carica risposta
  - ViewerPage: skeleton mentre carica documento

  **QA Playwright**: Throttling rete → skeleton visibili → scompaiono con dati

  **Commit**: `feat(frontend): add loading skeletons`

- [ ] F3. Empty state

  **What to do**:
  - Creare `smot-desktop/src/components/EmptyState.tsx`
  - Props: `icon`, `title`, `description`, `action?`
  - DashboardPage: "Nessun documento caricato" + "Carica il tuo primo documento"
  - ChatPage: "Nessun documento indicizzato"

  **QA Playwright**: Dashboard con DB vuoto → empty state + pulsante naviga a /upload

  **Commit**: `feat(frontend): add EmptyState component`

---

## Wave 2 — Frontend Interattivo

- [ ] F4. Dialog conferma azioni distruttive

  **What to do**:
  - Creare `smot-desktop/src/components/ConfirmDialog.tsx`
  - Props: `open`, `title`, `message`, `confirmLabel`, `onConfirm`, `onCancel`
  - SettingsPage: "Elimina modello"
  - UploadPage: "Elimina documento"
  - ChatPage: "Cancella chat"

  **QA Playwright**: Apri Settings → clicca "Elimina modello" → dialog appare → "Annulla" chiude → riconferma esegue azione

  **Commit**: `feat(frontend): add ConfirmDialog`

- [ ] F5. Componente Toast notifiche

  **What to do**:
  - Creare `smot-desktop/src/components/Toast.tsx` + `ToastContainer.tsx`
  - Sistema: `useToast()` hook per trigger
  - Tipi: success (verde), error (rosso), info (blu), warning (giallo)
  - Auto-dismiss 5 secondi
  - Usare in: UploadPage, SettingsPage, ChatPage

  **QA Playwright**: Trigger upload → toast verde appare → scompare dopo 5s

  **Commit**: `feat(frontend): add Toast notification system`

- [ ] F6. Event listener `indexing-progress` real-time

  **What to do**:
  - In `IndexingPage.tsx`, ascoltare evento Tauri `indexing-progress`
  - Aggiornare progress bar in tempo reale
  - Mostrare: documento corrente, chunk completati, ETA
  - Usare `listen()` da `@tauri-apps/api/event`

  **QA Playwright**: Avvia indexing → progress bar si aggiorna in tempo reale

  **Commit**: `feat(frontend): add real-time indexing progress`

---

## Success Criteria

```bash
cd smot-desktop && npx tsc --noEmit  # exit 0
ls src/components/ErrorBoundary.tsx src/components/Skeleton.tsx src/components/EmptyState.tsx src/components/ConfirmDialog.tsx src/components/Toast.tsx  # tutti esistono
```
