# TASK-ASSIGNMENT.md — Piano di Lavoro 3 Persone

> **Data:** 13 Maggio 2026 (ultimo aggiornamento: 2026-05-13 23:00)  
> **Team:** Salvatore (Frontend/UX) · Terza Persona (DevOps/Fullstack) · Michele (Backend)  
> **Regola:** Il lavoro di **Michele viene svolto per ULTIMO**

---

## Filosofia di Assegnazione

| Ruolo | Persona | Focus |
|-------|---------|-------|
| 🔵 Frontend/UX | Salvatore | UI, React, componenti, accessibility, animazioni |
| 🟢 DevOps/Fullstack | Terza Persona | Infrastruttura, CI/CD, sicurezza, build, config |
| 🔴 Backend | Michele (ULTIMO) | API, database, logica server, sicurezza backend |

---

## FASE 1 — Critici (da completare PRIMA di qualsiasi deploy)

### 🔵 Salvatore — Frontend Critici
| # | Repo | Task | File/Riferimento | Priorità |
|---|------|------|------------------|----------|
| S1 | SMOT-Landing-page | Rimuovere JWT_SECRET hardcoded → usare env var | `backend/src/middleware/auth.ts:6` | CRITICO |
| S2 | SMOT-Landing-page | Sostituire localStorage JWT → httpOnly cookie | `src/context/AuthContext.tsx:21,33,39,44` | ALTO |
| S3 | SMOT-Landing-page | Rimuovere API URL hardcoded localhost → env var | `src/services/api.ts:1` | CRITICO |
| S4 | SMOT-Landing-page | Aggiungere ESLint + Prettier config | root del progetto | MEDIO |

### 🟢 Terza Persona — DevOps/Fullstack Critici
| # | Repo | Task | File/Riferimento | Priorità |
|---|------|------|------------------|----------|
| T1 | offline-smart-archive | Fix PostCSS config → installare `@tailwindcss/postcss` e aggiornare `postcss.config.js` | `postcss.config.js` | CRITICO |
| T2 | offline-smart-archive | Cambiare `debug = False` come default | `backend/core/config.py:8` | ALTO |
| T3 | HEXA-STUDIO | Upgrade Next.js ≥15.5.18 (CVE fix) | `frontend/package.json` | CRITICO |
| T4 | HEXA-STUDIO | Installare ESLint nel frontend (`npm install --save-dev eslint`) | `frontend/` | ALTO |
| T5 | HEXA-STUDIO | Creare GitHub Actions CI (lint + build + test) | `.github/workflows/` | MEDIO |
| T6 | SMOT-Landing-page | Fix CORS wildcard → limitare ai domini autorizzati | `backend/src/index.ts:15` | ✅ COMPLETATO |
| T7 | SMOT-Landing-page | Aggiungere validazione env var a startup | `backend/src/index.ts` | ✅ COMPLETATO |
| T8 | SMOT-Landing-page | Validare STRIPE_SECRET_KEY a runtime | `backend/src/routes/payments.ts:7` | ✅ COMPLETATO |

### 🔴 Michele — Backend Critici (ULTIMO)
| # | Repo | Task | File/Riferimento | Priorità |
|---|------|------|------------------|----------|
| M1 | SMOT-CREATE | Creare directory `templates/` o rimuovere riferimento | `services/generator.py:45` | CRITICO |
| M2 | SMOT-CREATE | Fix CORS wildcard → limitare ai domini autorizzati | `main.py:21` | CRITICO |
| M3 | HEXA-STUDIO | Fix health check Redis — riusare connection pool invece di new connection per ogni `/health` | `backend/app/main.py:76-78` | ALTO |
| M4 | HEXA-STUDIO | Aggiungere test con DB mock (pytest fallisce per ConnectionRefused) | `backend/tests/` | ALTO |
| M5 | SMOT-CREATE | Aggiungere rate limiting su `/api/v1/generate` | `main.py` | MEDIO |

---

## FASE 2 — Alti (importanti per produzione)

### 🔵 Salvatore
| # | Repo | Task | File/Riferimento | Priorità |
|---|------|------|------------------|----------|
| S5 | SMOT-APP | Fix `useForceGraph.ts` dependency array warning | `src/hooks/useForceGraph.ts:168` | ALTO |
| S6 | SMOT-APP | Fix `SettingsPage.tsx` dependency array warning | `src/pages/SettingsPage.tsx:94` | ALTO |
| S7 | SMOT-APP | Fix dynamic import warning per `@tauri-apps/api` | `src/App.tsx`, `src/pages/LicenseBlockedPage.tsx` | MEDIO |
| S8 | SMOT-APP | Aggiungere test E2E Playwright | `e2e/` o `tests/` | MEDIO |
| S9 | SMOT-Landing-page | Aggiungere test (Vitest per unit, Playwright per E2E) | root del progetto | ALTO |

### 🟢 Terza Persona
| # | Repo | Task | File/Riferimento | Priorità |
|---|------|------|------------------|----------|
| T9 | SMOT-APP | Verificare Tauri build (`npm run tauri build`) con Rust toolchain | `src-tauri/` | ✅ COMPLETATO |
| T10 | offline-smart-archive | Aggiungere `.env.example` con tutte le variabili necessarie | root del progetto | MEDIO |
| T11 | offline-smart-archive | Fix generic exception handling → eccezioni specifiche | `backend/services/llm.py:75`, `model_manager.py:107` | MEDIO |
| T12 | HEXA-STUDIO | Aggiungere `.env.example` con password sicure per produzione | `backend/.env.example` | MEDIO |
| T13 | HEXA-STUDIO | Configurare HTTPS + SSL per deployment nginx | `nginx/`, `docker-compose.yml` | MEDIO |

### 🔴 Michele (ULTIMO)
| # | Repo | Task | File/Riferimento | Priorità |
|---|------|------|------------------|----------|
| M6 | SMOT-CREATE | Validazione `extra_data` schema — aggiungere validazione Pydantic | `schemas.py:103` | MEDIO |
| M7 | SMOT-CREATE | Sostituire `shutil.rmtree()` silenzioso con cleanup sicuro | `services/zip_service.py:41` | MEDIO |
| M8 | SMOT-CREATE | Aggiungere test (pytest + httpx AsyncClient) | root del progetto | MEDIO |
| M9 | HEXA-STUDIO | Aggiornare dipendenze Python datate (bcrypt, cryptography, certifi) | `requirements.txt` | MEDIO |
| M10 | offline-smart-archive | Sostituire `except Exception` con eccezioni specifiche | `backend/services/` | BASSO |

---

## FASE 3 — Bassi/Nice-to-have

### 🔵 Salvatore
| # | Repo | Task | File/Riferimento |
|---|------|------|------------------|
| S10 | SMOT-Landing-page | Aggiungere test accessibilità (axe-core) | root del progetto |
| S11 | SMOT-Landing-page | SEO optimization (meta tags, sitemap, robots.txt) | root del progetto |

### 🟢 Terza Persona
| # | Repo | Task | File/Riferimento |
|---|------|------|------------------|
| T14 | offline-smart-archive | Rinominare progetto in `pyproject.toml` per coerenza | `pyproject.toml:3` |
| T15 | smot | Aggiungere `asyncio_default_fixture_loop_scope = "function"` | `pyproject.toml` |
| T16 | smot | Rimuovere `filterwarnings = ["ignore::DeprecationWarning"]` globale | `pyproject.toml:84-86` |
| T17 | HEXA-STUDIO | Aggiungere GitHub Actions per deploy automatico | `.github/workflows/` |

### 🔴 Michele (ULTIMO)
| # | Repo | Task | File/Riferimento |
|---|------|------|------------------|
| M11 | SMOT-CREATE | Rimuovere re-export inutile in `generator.py:1` | `generator.py` |
| M12 | SMOT-APP | Rimuovere codice morto `struct JobInput` in `lib.rs:102` | `src-tauri/src/lib.rs` |
| M13 | SMOT-APP | Sostituire `reqwest::Client::new()` multipli con singleton | `indexing.rs:142`, `lib.rs:449`, `ollama.rs:25,49` |
| M14 | HEXA-STUDIO | Persistere SECRET_KEY invece di rigenerare ad ogni restart | `app/core/config.py` |

---

## Ordine di Esecuzione

```
FASE 1 (Critici)
├── 🔵 Salvatore: S1, S2, S3, S4
├── 🟢 Terza Persona: T1, T2, T3, T4, T5, T6, T7, T8
└── 🔴 Michele (ULTIMO): M1, M2, M3, M4, M5

FASE 2 (Alti)
├── 🔵 Salvatore: S5, S6, S7, S8, S9
├── 🟢 Terza Persona: T9, T10, T11, T12, T13
└── 🔴 Michele (ULTIMO): M6, M7, M8, M9, M10

FASE 3 (Bassi)
├── 🔵 Salvatore: S10, S11
├── 🟢 Terza Persona: T14, T15, T16, T17
└── 🔴 Michele (ULTIMO): M11, M12, M13, M14
```

---

## Come Leggere i Task

Ogni task ha un codice:
- **S** = Salvatore (Frontend/UX)
- **T** = Terza Persona (DevOps/Fullstack)  
- **M** = Michele (Backend) — **SEMPRE PER ULTIMO**

Ogni task referencia file e righe specifiche. Controllare il file `AUDIT-2026-05-13.md` nella repo corrispondente per dettagli completi.

---

## Stato Riepilogativo Repo

| Repo | Build | Lint/Tests | Sicurezza | Critici |
|------|-------|-------------|-----------|---------|
| HEXA-STUDIO | ✅ Frontend OK, ❌ Pytest (no DB) | ❌ ESLint mancante | ⚠️ Next.js CVE | 1 critical npm |
| SMOT-APP | ✅ Build OK | ✅ 62 test OK, clippy clean | ✅ 0 vulnerabilità | ✅ Tauri build verificata (deb/rpm/AppImage) |
| SMOT-Landing-page | ✅ Backend OK | ✅ TypeScript OK (1 warning pre-esistente) | ✅ CORS fix + env validation + Stripe check | 0 critici rimasti |
| SMOT-CREATE | ❓ Non verificata | ❌ Zero test | ⚠️ CORS wildcard | Templates mancanti |
| offline-smart-archive | 🔴 Build fallita (PostCSS) | ❓ Non verificata | ⚠️ Debug mode | PostCSS config |
| smot | ✅ 15 test passano | ⚠️ Warnings async | ✅ Nessun critico | Nessun remote |
| SMOT-KNOW | ❓ Solo MDX | ❌ Zero test | ❓ Da verificare | — |
| dotfiles | ✅ | ✅ | ✅ | — |

---

## Progresso Terza Persona (Tommaso)

| Fase | Task | Stato |
|------|------|:-----:|
| **FASE 1** | T6 — CORS fix SMOT-Landing-page | ✅ Commit `e07445b` |
| **FASE 1** | T7 — Env validation startup | ✅ Commit `e07445b` |
| **FASE 1** | T8 — Stripe key runtime check | ✅ Commit `e07445b` |
| **FASE 2** | T9 — Tauri build SMOT-APP | ✅ Commit `ce57fd3` |
| **FASE 1** | T1-T5 — offline-smart-archive + HEXA-STUDIO | ⏳ Repo non trovate su GitHub |
| **FASE 2** | T10-T13 — offline-smart-archive + HEXA-STUDIO | ⏳ Stesse repo mancanti |
| **FASE 3** | T14-T17 | ⏳ Stesse repo mancanti |

### Dettaglio T6-T8 (SMOT-Landing-page)
- **T6**: Rimosso fallback `|| '*'` in CORS, ora richiede `FRONTEND_URL` obbligatorio
- **T7**: Funzione `validateEnv()` a startup: check `FRONTEND_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY` presenti + validazione formato
- **T8**: Funzione `getStripe()` in `payments.ts` con validazione runtime della key

### Dettaglio T9 (SMOT-APP)
- Build Rust: ✅ 0 errori
- Test Rust: ✅ **62 passati**
- Clippy: ✅ `-D warnings` pulito (fix: `Image::new_owned`, unused imports, `match_result_ok`, `#[allow(dead_code)]`)
- Bundle prodotti: `.deb`, `.rpm`, `.AppImage`
- Fix aggiuntivo: `yarn` → `npm run` in `tauri.conf.json` (yarn non installato)