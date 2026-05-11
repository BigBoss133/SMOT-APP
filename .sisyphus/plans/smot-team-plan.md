# SMOT-APP — Piano Lavoro Team (Michele · Salvatore · Tommaso)

> **Data:** 11 Maggio 2026 22:00 | **Repo:** BigBoss133/SMOT-APP
> **OpenCode Ready** — Ogni task è delegabile con `/start-work`

---

## 📊 Stato Generale

```
Michele    ████████████████ 100% (15/15) ✅ COMPLETATO
Salvatore  ████████░░░░░░░░  70% (7/10)  ⏳ Fix wizard rimanenti
Tommaso    ░░░░░░░░░░░░░░░░   0% (0/9)   ⏳ Da iniziare
```

### Michele ✅
- 10 comandi Rust stub → reali
- Indexing pipeline (indexing.rs, 395 righe)
- Branch release/v0.1.0-beta con chiave updater
- Fix setup.rs onboarding + Apple Silicon detection

### Salvatore (7/10)
- ✅ ErrorBoundary, Skeleton, EmptyState, ConfirmDialog, Toast, Indexing events
- ✅ Directory orfane rimosse
- ⏳ FIX-4: App.tsx wizard full-screen
- ⏳ FIX-5: OnboardingPage completion
- ⏳ FIX-6: SystemDiscoveryStep unified memory

### Tommaso (0/9)
- ⏳ C3: Archiviare piani obsoleti
- ⏳ D1-D4: Estrarre funzioni DB in db.rs (refactoring)
- ⏳ S1-S4: Security hardening

---

## Piani Individuali

| Piano | Per | File | Task |
|---|---|---|---|
| **Michele** | Backend | `smot-michele-backend.md` | ✅ 15/15 |
| **Salvatore** | Frontend | `smot-salvatore-frontend.md` | ✅ 7/7 + ⏳ 3 |
| **Tommaso** | DB & Security | `smot-tommaso-db-security.md` | 0/9 |
| **Installer Fix** | Tutti | `smot-installer-fix.md` | 5/8 |
| **Release Beta** | Team | `smot-release-beta.md` | 5/12 |

---

## Build

| Layer | Comando | Risultato |
|-------|---------|-----------|
| Rust | `cargo build` | ✅ |
| TS | `npx tsc --noEmit` | ✅ |
| Frontend | `npm run build` | ✅ 321KB |

---

> Per iniziare: `/start-work smot-salvatore-frontend` o `/start-work smot-tommaso-db-security`