# SMOT — Piano Salvatore (Frontend React)

> **Team Plan:** `.sisyphus/plans/smot-team-plan.md` | **Repo:** BigBoss133/SMOT-APP
> **🛡️ Guardrails:** Leggere [`GUARDRAILS.md`](../../GUARDRAILS.md) prima di iniziare

## TL;DR

> **Salvatore**: 7 task — 1 cleanup + 6 frontend polish. ~14h.

---

## 🛡️ Guardrails

| Regola | Dettaglio |
|---|---|
| **Branch** | `feat/nome-task` → PR → review → merge in main |
| **Commit** | `tipo(scope): descrizione` (es. `feat(frontend): add ErrorBoundary`) |
| **Pre-push** | `npx tsc --noEmit && npm run build` |
| **Aree off-limits** | `lib.rs` (comandi Tauri), `src-tauri/` (tutto il backend Rust) |
| **File condivisi** | Avvisare il team prima di toccare `package.json`, `tauri.conf.json` |
| **Stile** | NO inline styles → CSS modules. Tutti i testi in i18n (IT/EN). |
| **Accessibilità** | Ogni bottone con sola icona deve avere `aria-label` |

> 📖 Tutte le regole: [`GUARDRAILS.md`](../../GUARDRAILS.md)

---

## Wave 0 — Cleanup (immediato)

- [ ] C2. Eliminare directory orfane

  **What to do**: Eliminare `backend/`, `frontend/`, `test_reports/`. NON toccare `smot-desktop/`.
  
  **QA**: `ls -d backend/ frontend/ test_reports/ 2>&1` → "No such file" per tutte

---

## Wave 1 — Frontend Foundation

- [ ] F1. ErrorBoundary in App.tsx

  **What to do**:
  - Creare `smot-desktop/src/components/ErrorBoundary.tsx`
  - Classe React con `componentDidCatch` + `getDerivedStateFromError`
  - Fallback UI: messaggio amichevole + "Riprova" + "Torna alla Home"
  - Wrappare `<Routes>` in `App.tsx` con `<ErrorBoundary>`

  **QA Playwright**: Navigare a pagina con errore → fallback UI mostrato → "Riprova" funziona

- [ ] F2. Loading skeletons

  **What to do**:
  - Creare `smot-desktop/src/components/Skeleton.tsx` riutilizzabile
  - DashboardPage: skeleton mentre carica documenti
  - ChatPage: skeleton mentre carica risposta
  - ViewerPage: skeleton mentre carica documento

  **QA Playwright**: Throttling rete → skeleton visibili → scompaiono con dati

- [ ] F3. Empty state

  **What to do**:
  - Creare `smot-desktop/src/components/EmptyState.tsx`
  - Props: `icon`, `title`, `description`, `action?`
  - DashboardPage: "Nessun documento caricato" + "Carica il tuo primo documento"
  - ChatPage: "Nessun documento indicizzato"

  **QA Playwright**: Dashboard con DB vuoto → empty state + pulsante naviga a /upload

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

- [ ] F5. Componente Toast notifiche

  **What to do**:
  - Creare `smot-desktop/src/components/Toast.tsx` + `ToastContainer.tsx`
  - Sistema: `useToast()` hook per trigger
  - Tipi: success (verde), error (rosso), info (blu), warning (giallo)
  - Auto-dismiss 5 secondi
  - Usare in: UploadPage, SettingsPage, ChatPage

  **QA Playwright**: Trigger upload → toast verde appare → scompare dopo 5s

- [ ] F6. Event listener `indexing-progress` real-time

  **What to do**:
  - In `IndexingPage.tsx`, ascoltare evento Tauri `indexing-progress`
  - Aggiornare progress bar in tempo reale
  - Mostrare: documento corrente, chunk completati, ETA
  - Usare `listen()` da `@tauri-apps/api/event`

  **QA Playwright**: Avvia indexing → progress bar si aggiorna in tempo reale

---

## Pre-Push Checklist

```bash
cd smot-desktop
npx tsc --noEmit && npm run build
```

## Success Criteria

```bash
ls src/components/ErrorBoundary.tsx src/components/Skeleton.tsx src/components/EmptyState.tsx src/components/ConfirmDialog.tsx src/components/Toast.tsx  # tutti esistono
```
