# SMOT — Smart Archive Desktop

> Archivio documentale intelligente 100% offline con IA locale opzionale

---

## Team

| Sviluppatore | Ruolo | Completato |
|---|---|---|
| **Michele** (BigBoss133) | Backend Rust + Release | ✅ 15/15 |
| **Salvatore** (salvograsso10) | Frontend React + UI/UX | ✅ 10/10 |
| **Tommaso** | Database + Sicurezza + CI | ✅ 9/9 |

> Tutti i task completati — 34/34. Pronti per la beta.

---

## Stato Attuale

```
Michele    ████████████████ 100% ✅  Backend Rust (10 comandi + indexing + onboarding)
Salvatore  ████████████████ 100% ✅  Frontend React (7 componenti + 3 fix wizard)
Tommaso    ████████████████ 100% ✅  DB refactoring + Security + CI fix + dead code
```

### Michele (Backend)
- 10 comandi Tauri stub → reali (sysinfo, SQLite, Ollama RAG, FTS5)
- Indexing pipeline (chunking → embedding → FTS5)
- Setup onboarding + Apple Silicon detection
- Branch release/v0.1.0-beta con chiave updater
- FIX installer: config check, complete_onboarding, unified memory, ram_available

### Salvatore (Frontend)
- ErrorBoundary, Skeleton, EmptyState, ConfirmDialog, Toast
- Real-time indexing progress listener
- FIX-4: App.tsx wizard full-screen
- FIX-5: OnboardingPage complete_onboarding call
- FIX-6: SystemDiscoveryStep unified memory display

### Tommaso (DB + Security)
- C3: Archiviare piani obsoleti
- D1-D4: Estrarre funzioni DB in db.rs (refactoring)
- S1: Input validation comandi Tauri
- S2: Rate limiting Ollama (5 req/sec)
- S3: Sanitizzazione filename upload
- S4: Pulizia dati sensibili config
- Dead code: JobInput, IndexingFileStatus removed
- CI fix: update trigger branches

---

## Build

| Layer | Comando | Risultato |
|-------|---------|-----------|
| Rust | cargo build | ✅ 0 errori |
| TypeScript | npx tsc --noEmit | ✅ 0 errori |
| Frontend | npm run build | ✅ 321 KB |

---

## Piani di Lavoro

Tutti in `.sisyphus/plans/`:
- smot-team-plan.md — Piano master (34/34 completati)
- smot-michele-backend.md — Michele (15/15)
- smot-salvatore-frontend.md — Salvatore (10/10)
- smot-tommaso-db-security.md — Tommaso (9/9)
- smot-installer-fix.md — Fix (8/8)
- smot-release-beta.md — Release (5/12)

---

## Prossimo Passo: Beta Release

```bash
cd ~/SMOT-APP
git checkout release/v0.1.0-beta
git pull
cd smot-desktop
npm run tauri build
# .dmg in src-tauri/target/release/bundle/dmg/
```

---

**Repo:** https://github.com/BigBoss133/SMOT-APP
**Guide OS:** INSTALL.md (branch docs/install-guides)
**Audit:** AUDIT-REPORT.md