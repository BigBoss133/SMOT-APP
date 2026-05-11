# SMOT — Landing Page + Sistema Licenze

> **Repo:** SMOT-Landing-page + SMOT-APP
> **Target:** Sito registrazione/pagamento + validazione licenza nell'app

---

## Stato Attuale

| Cosa | Stato |
|------|:----:|
| Landing page marketing | ✅ (Salvatore, single-file React) |
| Backend / API | ❌ Non esiste |
| Registrazione utenti | ❌ |
| Pagamento (Stripe) | ❌ |
| Generazione licenze | ❌ |
| Validazione licenza in SMOT-APP | ❌ |
| 7 giorni prova gratuita | ❌ |

---

## Team Distribution

| Sviluppatore | Area | Tempo |
|---|---|:---:|
| **Michele** | Backend API + Stripe + Database | ~8h |
| **Salvatore** | Frontend sito (React, form, checkout, dashboard) | ~6h |
| **Tommaso** | SMOT-APP: campo licenza, validazione API, controllo avvio | ~4h |

---

## Wave 0 — Backend API (Michele)

- [ ] **API-1**: Setup progetto backend
  - Tech: Node.js + Express + TypeScript (o FastAPI Python)
  - Struttura: `/api/auth`, `/api/license`, `/api/payments`
  - Database: SQLite (semplice) o PostgreSQL (production)

- [ ] **API-2**: Auth system
  - `POST /api/auth/register` — registrazione (email, password)
  - `POST /api/auth/login` — login (ritorna JWT)
  - `GET /api/auth/me` — profilo utente

- [ ] **API-3**: Stripe integration
  - `POST /api/payments/create-checkout` — crea sessione Stripe
  - Stripe webhook: `POST /api/payments/webhook` — gestisce eventi
  - Logica 7 giorni trial: attiva solo se e il PRIMO pagamento dell'utente

- [ ] **API-4**: License management
  - `POST /api/license/generate` — genera chiave dopo pagamento
  - `GET /api/license/status` — verifica validità licenza
  - `GET /api/license/validate/:key` — endpoint pubblico chiamato da SMOT-APP

- [ ] **API-5**: Database schema
  ```sql
  users(id, email, password_hash, created_at)
  licenses(id, user_id, key TEXT UNIQUE, plan TEXT, status TEXT, created_at, expires_at, trial_used BOOL)
  payments(id, user_id, stripe_session_id, amount, currency, status, created_at)
  ```

---

## Wave 1 — Frontend Sito (Salvatore)

- [ ] **WEB-1**: Convertire landing page da single-file a React app strutturata
  - Vite + React + TypeScript + react-router-dom
  - Route: `/` (landing), `/pricing` (prezzi), `/register` (registrazione)
  - Route: `/dashboard` (area utente), `/checkout` (pagamento)

- [ ] **WEB-2**: Form registrazione + login
  - `RegisterPage.tsx` — email, password, conferma password
  - `LoginPage.tsx` — email, password
  - Gestione errori (email già usata, password debole)

- [ ] **WEB-3**: Pagina prezzi + checkout
  - `PricingPage.tsx` — 3 piani: Free Trial (7gg), Monthly, Annual
  - Bottone "Prova Gratis 7 Giorni" → Stripe Checkout
  - Dopo pagamento → dashboard con chiave licenza

- [ ] **WEB-4**: Dashboard utente
  - Mostrare chiave licenza (copiabile)
  - Stato licenza: attiva / scaduta / trial
  - Storico pagamenti
  - Bottone "Scarica SMOT"

---

## Wave 2 — SMOT-APP Licenza (Tommaso)

- [ ] **APP-1**: Aggiungere step licenza nel wizard
  - Modificare `LicenseStep.tsx`: aggiungere campo input per chiave
  - Validazione formato chiave (es. `SMOT-XXXX-XXXX-XXXX-XXXX`)
  - Bottone "Salta (modalità trial 7 giorni)"

- [ ] **APP-2**: Tauri command `validate_license`
  - Chiama `GET /api/license/validate/:key`
  - Se valida: salva licenza in config.json
  - Se trial: salva data inizio trial
  - Se invalida: mostra errore

- [ ] **APP-3**: Controllo licenza all'avvio
  - In `setup.rs`: dopo onboarding, controlla licenza in config
  - Se trial scaduto (>7gg): mostra dialog "Licenza scaduta"
  - Se licenza valida: avvia normalmente

- [ ] **APP-4**: UI stato licenza in Settings
  - Mostrare stato licenza nella SettingsPage
  - Pulsante "Inserisci chiave" se in trial
  - Giorni rimanenti se in trial

---

## Flusso Completo

```
1. Utente visita landing page
2. Clicca "Prova Gratis" → registrazione → Stripe checkout
3. Primo pagamento → 7 giorni gratis attivati → licenza generata
4. Riceve chiave via email + dashboard
5. Scarica SMOT-APP
6. Al primo avvio: wizard → inserisce chiave licenza
7. App valida chiave via API → attivata
8. Alla scadenza: app mostra dialog rinnovo
```

---

## Note

- **7 giorni trial**: Solo al PRIMO pagamento. Se l'utente ha gia' pagato una volta, niente trial.
- **Stripe**: Usare Stripe Checkout (hosted page) per PCI compliance
- **API validation**: Endpoint pubblico senza auth (solo GET con API key nel backend)
- **Deploy**: Vercel (frontend) + Railway/Render (backend)
