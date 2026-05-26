# TASK-ASSIGNMENT.md — Piano di Lavoro 3 Persone

> **Data:** 26 Maggio 2026 (ultimo aggiornamento: 2026-05-26)  
> **Team:** Salvatore (Frontend/UX) · Tommaso (DevOps — SOLO SMOT) · Michele (Backend + offline-smart-archive)  
> **Regola:** Il lavoro di **Michele viene svolto per ULTIMO**

---

## Filosofia di Assegnazione

| Ruolo | Persona | Focus |
|-------|---------|-------|
| 🔵 Frontend/UX | Salvatore | UI, React, componenti, accessibility, animazioni |
| 🟢 DevOps (SOLO SMOT) | Tommaso | Infrastruttura CI/CD, sicurezza, build — solo repo SMOT |
| 🔴 Backend + offline-smart-archive | Michele (ULTIMO) | API, database, logica server, sicurezza backend + repo offline-smart-archive |

---

## FASE 1 — Critici (da completare PRIMA di qualsiasi deploy)

### 🔵 Salvatore — Frontend Critici
| # | Repo | Task | File/Riferimento | Priorità | Stato |
|---|------|------|------------------|----------|-------|
| S1 | SMOT-Landing-page | Rimuovere JWT_SECRET hardcoded → usare env var | `backend/src/middleware/auth.ts:6` | CRITICO | ✅ COMPLETATO |
| S2 | SMOT-Landing-page | Sostituire localStorage JWT → httpOnly cookie | `src/context/AuthContext.tsx:21,33,39,44` | ALTO | ✅ COMPLETATO |
| S3 | SMOT-Landing-page | Rimuovere API URL hardcoded localhost → env var | `src/services/api.ts:1` | CRITICO | ✅ COMPLETATO |
| S4 | SMOT-Landing-page | Aggiungere ESLint + Prettier config | root del progetto | MEDIO | ✅ COMPLETATO |
| S12 | HEXA-STUDIO | Upgrade Next.js ≥15.5.18 (CVE fix) | `frontend/package.json` | CRITICO | ✅ COMPLETATO |
| S13 | HEXA-STUDIO | Installare ESLint nel frontend (`npm install --save-dev eslint`) | `frontend/` | ALTO | ✅ COMPLETATO |
| S14 | HEXA-STUDIO | Creare GitHub Actions CI (lint + build + test) | `.github/workflows/` | MEDIO | ✅ COMPLETATO |

### 🟢 Tommaso — DevOps/Fullstack Critici
| # | Repo | Task | File/Riferimento | Priorità |
|---|------|------|------------------|----------|
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
| M18 | offline-smart-archive | Fix PostCSS config → installare `@tailwindcss/postcss` e aggiornare `postcss.config.js` | `postcss.config.js` | CRITICO |
| M19 | offline-smart-archive | Cambiare `debug = False` come default | `backend/core/config.py:8` | ALTO |

---

## FASE 2 — Alti (importanti per produzione)

### 🔵 Salvatore
| # | Repo | Task | File/Riferimento | Priorità | Stato |
|---|------|------|------------------|----------|-------|
| S5 | SMOT-APP | Fix `useForceGraph.ts` dependency array warning | `src/hooks/useForceGraph.ts:168` | ALTO | ✅ COMPLETATO |
| S6 | SMOT-APP | Fix `SettingsPage.tsx` dependency array warning | `src/pages/SettingsPage.tsx:94` | ALTO | ✅ COMPLETATO |
| S7 | SMOT-APP | Fix dynamic import warning per `@tauri-apps/api` | `src/App.tsx`, `src/pages/LicenseBlockedPage.tsx` | MEDIO | ✅ COMPLETATO |
| S8 | SMOT-APP | Aggiungere test E2E Playwright | `e2e/` o `tests/` | MEDIO | ✅ COMPLETATO |
| S9 | SMOT-Landing-page | Aggiungere test (Vitest per unit, Playwright per E2E) | root del progetto | ALTO | ✅ COMPLETATO |

### 🟢 Tommaso
| # | Repo | Task | File/Riferimento | Priorità |
|---|------|------|------------------|----------|
| T9 | SMOT-APP | Verificare Tauri build (`npm run tauri build`) con Rust toolchain | `src-tauri/` | ✅ COMPLETATO |

### 🔴 Michele (ULTIMO)
| # | Repo | Task | File/Riferimento | Priorità |
|---|------|------|------------------|----------|
| M6 | SMOT-CREATE | Validazione `extra_data` schema — aggiungere validazione Pydantic | `schemas.py:103` | MEDIO |
| M7 | SMOT-CREATE | Sostituire `shutil.rmtree()` silenzioso con cleanup sicuro | `services/zip_service.py:41` | MEDIO |
| M8 | SMOT-CREATE | Aggiungere test (pytest + httpx AsyncClient) | root del progetto | MEDIO |
| M9 | HEXA-STUDIO | Aggiornare dipendenze Python datate (bcrypt, cryptography, certifi) | `requirements.txt` | MEDIO |
| M10 | offline-smart-archive | Sostituire `except Exception` con eccezioni specifiche | `backend/services/llm.py:75`, `model_manager.py:107`, `backend/services/` | BASSO |
| M20 | offline-smart-archive | Aggiungere `.env.example` con tutte le variabili necessarie | root del progetto | MEDIO |
| M15 | HEXA-STUDIO | Aggiungere `.env.example` con password sicure per produzione | `backend/.env.example` | ✅ COMPLETATO |
| M16 | HEXA-STUDIO | Configurare HTTPS + SSL per deployment nginx | `nginx/`, `docker-compose.yml` | ✅ COMPLETATO |

---

## FASE 3 — Bassi/Nice-to-have

### 🔵 Salvatore
| # | Repo | Task | File/Riferimento | Stato |
|---|------|------|------------------|-------|
| S10 | SMOT-Landing-page | Aggiungere test accessibilità (axe-core) | root del progetto | ✅ COMPLETATO |
| S11 | SMOT-Landing-page | SEO optimization (meta tags, sitemap, robots.txt) | root del progetto | ✅ COMPLETATO |

### 🟢 Tommaso
| # | Repo | Task | File/Riferimento |
|---|------|------|------------------|
| T15 | smot | Aggiungere `asyncio_default_fixture_loop_scope = "function"` | `pyproject.toml` |
| T16 | smot | Rimuovere `filterwarnings = ["ignore::DeprecationWarning"]` globale | `pyproject.toml:84-86` |

### 🔴 Michele (ULTIMO)
| # | Repo | Task | File/Riferimento |
|---|------|------|------------------|
| M11 | SMOT-CREATE | Rimuovere re-export inutile in `generator.py:1` | `generator.py` |
| M12 | SMOT-APP | Rimuovere codice morto `struct JobInput` in `lib.rs:102` | `src-tauri/src/lib.rs` |
| M13 | SMOT-APP | Sostituire `reqwest::Client::new()` multipli con singleton | `indexing.rs:142`, `lib.rs:449`, `ollama.rs:25,49` |
| M14 | HEXA-STUDIO | Persistere SECRET_KEY invece di rigenerare ad ogni restart | `app/core/config.py` |
| M17 | HEXA-STUDIO | Aggiungere GitHub Actions per deploy automatico | `.github/workflows/` |
| M21 | offline-smart-archive | Rinominare progetto in `pyproject.toml` per coerenza | `pyproject.toml:3` |

---

## Ordine di Esecuzione

```
FASE 1 (Critici)
├── 🔵 Salvatore: S1 ✅, S2 ✅, S3 ✅, S4 ✅, S12 ✅, S13 ✅, S14 ✅
├── 🟢 Tommaso: T6 ✅, T7 ✅, T8 ✅
└── 🔴 Michele (ULTIMO): M1, M2, M3, M4, M5, M18, M19

FASE 2 (Alti)
├── 🔵 Salvatore: S5 ✅, S6 ✅, S7 ✅, S8 ✅, S9 ✅
├── 🟢 Tommaso: T9 ✅
└── 🔴 Michele (ULTIMO): M6, M7, M8, M9, M10, M20, M15 ✅, M16 ✅

FASE 3 (Bassi)
├── 🔵 Salvatore: S10 ✅, S11 ✅
├── 🟢 Tommaso: T15, T16
└── 🔴 Michele (ULTIMO): M11, M12, M13, M14, M17, M21
```

---

## Come Leggere i Task

Ogni task ha un codice:
- **S** = Salvatore (Frontend/UX)
- **T** = Tommaso (DevOps — solo SMOT)  
- **M** = Michele (Backend + offline-smart-archive) — **SEMPRE PER ULTIMO**

Ogni task referencia file e righe specifiche. Controllare il file `AUDIT-2026-05-13.md` nella repo corrispondente per dettagli completi.

---

## Stato Riepilogativo Repo

| Repo | Build | Lint/Tests | Sicurezza | Critici |
|------|-------|-------------|-----------|---------|
| HEXA-STUDIO | ✅ Frontend OK (Next.js 16.2.6) + ✅ Backend OK (104 test) | ✅ ESLint + ✅ CI/CD | ✅ CVE risolte | 0 critici rimasti |
| SMOT-APP | ✅ Build OK | ✅ 62 test OK, clippy clean | ✅ 0 vulnerabilità | ✅ Tauri build verificata (deb/rpm/AppImage) |
| SMOT-Landing-page | ✅ Backend OK | ✅ TypeScript OK (1 warning pre-esistente) | ✅ CORS fix + env validation + Stripe check | 0 critici rimasti |
| SMOT-CREATE | ❓ Non verificata | ❌ Zero test | ⚠️ CORS wildcard | Templates mancanti |
| offline-smart-archive | 🔴 Build fallita (PostCSS) | ❓ Non verificata | ⚠️ Debug mode | PostCSS config (Michele) |
| smot | ✅ 15 test passano | ⚠️ Warnings async | ✅ Nessun critico | Nessun remote |
| SMOT-KNOW | ❓ Solo MDX | ❌ Zero test | ❓ Da verificare | — |
| dotfiles | ✅ | ✅ | ✅ | — |

---

## Progresso Tommaso

| Fase | Task | Stato |
|------|------|:-----:|
| **FASE 1** | T6 — CORS fix SMOT-Landing-page | ✅ Commit `e07445b` |
| **FASE 1** | T7 — Env validation startup | ✅ Commit `e07445b` |
| **FASE 1** | T8 — Stripe key runtime check | ✅ Commit `e07445b` |
| **FASE 2** | T9 — Tauri build SMOT-APP | ✅ Commit `ce57fd3` |
| **FASE 3** | T15 — Fix asyncio fixture scope smot | ⏳ |
| **FASE 3** | T16 — Remove global DeprecationWarning filter smot | ⏳ |

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

---

## Progresso Michele (offline-smart-archive)

| Fase | Task | Stato |
|------|------|:-----:|
| **FASE 1** | M18 — Fix PostCSS offline-smart-archive | ⏳ Solo Michele può operare (repo privata) |
| **FASE 1** | M19 — debug=False default offline-smart-archive | ⏳ Solo Michele può operare |
| **FASE 2** | M10 — Fix exception handling offline-smart-archive | ⏳ Merged con S18 (llm.py + model_manager.py) |
| **FASE 2** | M20 — .env.example offline-smart-archive | ⏳ Solo Michele può operare |
| **FASE 3** | M21 — Rename pyproject.toml offline-smart-archive | ⏳ Solo Michele può operare |

---

## Progresso Salvatore

| Fase | Task | Stato |
|------|------|:-----:|
| **FASE 1** | S1 — JWT_SECRET env var SMOT-Landing-page | ✅ Commit `f923d38` |
| **FASE 1** | S2 — httpOnly cookie fallback AuthContext | ✅ Commit `dfbfd89` |
| **FASE 1** | S3 — API URL env var SMOT-Landing-page | ✅ Commit `f923d38` |
| **FASE 1** | S4 — ESLint + Prettier config | ✅ Commit `d746106` |
| **FASE 2** | S5 — Fix useForceGraph.ts dependency array | ✅ Commit `15ce1c4` |
| **FASE 2** | S6 — Fix SettingsPage.tsx dependency array | ✅ Commit `15ce1c4` |
| **FASE 2** | S7 — Fix dynamic import @tauri-apps/api | ✅ Commit `0dbb513` |
| **FASE 2** | S8 — E2E Playwright tests SMOT-APP | ✅ Commit `0dbb513` |
| **FASE 2** | S9 — Vitest + Playwright SMOT-Landing-page | ✅ Commit `d746106` |
| **FASE 3** | S10 — Test accessibilità axe-core | ✅ Commit `d746106` |
| **FASE 3** | S11 — SEO meta tags, sitemap, robots.txt | ✅ Commit `0546525` |
| **FASE 1** | S12 — Next.js upgrade HEXA-STUDIO | ✅ Già su Next.js 16.2.6 |
| **FASE 1** | S13 — ESLint frontend HEXA-STUDIO | ✅ Già installato |
| **FASE 1** | S14 — CI/CD GitHub Actions HEXA-STUDIO | ✅ Già presente |
| **FASE 3** | A21 — Fix TypeScript errors HEXA-STUDIO | ✅ 0 errori |
| **FASE 3** | A22 — Fix build Next.js HEXA-STUDIO | ✅ Build verificata |
| **FASE 3** | A23 — E2E Playwright tests HEXA-STUDIO | ✅ 5 spec file |
| **FASE 2** | M4 — SQLite fallback test DB HEXA-STUDIO | ✅ Auto-detection |
| **FASE 2** | A12 — Fix test_ai_chat HEXA-STUDIO | ✅ 4/4 |
| **FASE 2** | A17 — Fix test_2fa HEXA-STUDIO | ✅ 6/6 |
| **FASE 2** | A20 — Test OAuth HEXA-STUDIO | ✅ 8/8 |

### Dettaglio FASE 1 (SMOT-Landing-page)
- **S1**: Rimosso JWT_SECRET hardcoded `'dev-secret-change-me'` da `auth.ts`, ora usa `process.env.JWT_SECRET` con validazione
- **S2**: AuthContext non salva più JWT in localStorage, usa httpOnly cookie con fallback `credentials: "include"`
- **S3**: `api.ts` usa `import.meta.env.VITE_API_URL ?? "/api"` invece di localhost hardcoded
- **S4**: Aggiunti `eslint.config.js`, `.prettierrc`, script `lint` e `format` in package.json

### Dettaglio FASE 2 (SMOT-APP + SMOT-Landing-page)
- **S5**: `useForceGraph.ts` — rimossi `documents` e `relations` dalla dependency array, usati ref interni per evitare re-init
- **S6**: `SettingsPage.tsx` — aggiunti `text` e `toast` alla dependency array con useRef pattern
- **S7**: Centralizzato import `@tauri-apps/api` in `services/tauri.ts` con dynamic import lazy
- **S8**: Aggiunti 5 test E2E Playwright: `app.spec.ts`, `chat.spec.ts`, `navigation.spec.ts`, `onboarding.spec.ts`, `upload.spec.ts`
- **S9**: Aggiunti 3 file Vitest (`App.test.tsx`, `AuthContext.test.tsx`, `api.test.ts`) + 4 test E2E Playwright + setup axe-core

### Dettaglio FASE 1 (HEXA-STUDIO — Frontend)
- **S12**: `frontend/package.json` — Next.js già su `^16.2.6` (≥15.5.18 richiesto)
- **S13**: ESLint già in `devDependencies` (`eslint ^10.3.0`), `.eslintrc.json` già presente
- **S14**: CI/CD pipeline già in `.github/workflows/ci.yml` con lint, test, build, security scan, Docker deploy

### Dettaglio Frontend HEXA-STUDIO (A21-A23)
- **A21**: `npx tsc --noEmit` → **0 errori** TypeScript ✅
- **A22**: Build Next.js verificata; rimosso `eslint: { ignoreDuringBuilds: true }` da `next.config.js` ✅
- **A23**: 5 E2E spec Playwright (app, login, legal, media, profile); fix selectors e config path ✅

### Dettaglio Test Backend HEXA-STUDIO (M4, A12, A17, A20)
- **M4**: conftest.py con fallback SQLite (aiosqlite) se PostgreSQL non disponibile ✅
- **A12**: test_ai_chat.py — 4/4 test passati ✅
- **A17**: test_2fa.py — 6/6 test passati ✅
- **A20**: test_oauth.py — 8/8 test passati ✅ (Threads + Meta + LinkedIn + Twitter + TikTok)

### Dettaglio FASE 3 (SMOT-Landing-page)
- **S10**: Test accessibilità axe-core in `e2e/a11y.spec.ts` e `e2e/accessibility.spec.ts`
- **S11**: Meta tags SEO in `index.html`, `robots.txt` e `sitemap.xml` in `public/`, react-helmet-async per SEO per-route