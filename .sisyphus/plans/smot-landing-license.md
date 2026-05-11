# SMOT — Landing Page + Sistema Licenze

> **Repo:** SMOT-Landing-page + SMOT-APP

---

## Flusso Completo

```
UTENTE:
  Landing → Registrati → Stripe Checkout → Pagamento
  → 7gg gratis (solo primo pagamento) → Licenza generata
  → Scarica SMOT-APP → Avvia eseguibile

APP (all'avvio):
  1. Legge config.json → trova licenza?
     SI → 2. Valida via API → data scadenza
       - Licenza valida → Avvia app normalmente
       - Licenza scaduta da <24h → Avvia con warning "Rinnova entro oggi"
       - Licenza scaduta da >24h → BLOCCO TOTALE
         → Mostra solo schermata "Inserisci nuova chiave"
         → NESSUNA funzionalità accessibile
     NO → Mostra wizard onboarding → LicenseStep
```

## Regole Ferree

| Regola | Dettaglio |
|--------|-----------|
| **7gg gratis** | Solo PRIMO pagamento. Se utente ha già pagato, niente trial |
| **Graace period** | 1 giorno (24 ore) dopo scadenza per rinnovare |
| **Blocco post-graace** | App completamente bloccata. Solo input licenza visibile |
| **Nessun bypass** | Impossibile usare l'app senza licenza valida |
| **Installer** | Dopo installazione, l'exe non serve più — l'app parte direttamente |

---

## Team Distribution

| Area | Michele | Salvatore | Tommaso |
|------|:---:|:---:|:---:|
| **Backend API** | ✅ Express + Stripe + DB | — | — |
| **Frontend sito** | — | ✅ React + form + checkout | — |
| **SMOT-APP licenza** | — | — | ✅ Rust + UI |

---

## Wave 0 — Backend API (Michele)

- [ ] **API-1**: Setup progetto backend
  - Tech: Node.js + Express + TypeScript
  - Struttura: /api/auth, /api/license, /api/payments
  - DB: SQLite (dev) / PostgreSQL (prod)

- [ ] **API-2**: Auth system
  - POST /api/auth/register — registrazione
  - POST /api/auth/login — ritorna JWT
  - GET /api/auth/me — profilo

- [ ] **API-3**: Stripe integration
  - POST /api/payments/create-checkout
  - Webhook Stripe per eventi pagamento
  - Logica trial: controlla se e' primo pagamento utente

- [ ] **API-4**: License management
  - POST /api/license/generate — dopo pagamento riuscito
  - GET /api/license/status — stato licenza (JWT required)
  - GET /api/license/validate/:key — endpoint pubblico per app
    - Ritorna: { valid, plan, expires_at, grace_until, blocked }

- [ ] **API-5**: Database
  ```sql
  users(id, email, password_hash, created_at)
  licenses(id, user_id, key TEXT UNIQUE, plan TEXT,
           status TEXT, created_at, expires_at,
           trial_used BOOLEAN DEFAULT false)
  payments(id, user_id, stripe_session_id,
           amount, currency, status, created_at)
  ```

- [ ] **API-6**: License validation logic
  - Se expires_at > now → { valid: true, blocked: false }
  - Se expires_at < now < expires_at + 24h → { valid: true, blocked: false, grace: true }
  - Se now > expires_at + 24h → { valid: false, blocked: true }

---

## Wave 1 — Frontend Sito (Salvatore)

- [ ] **WEB-1**: Convertire landing page a React app strutturata
  - Vite + React + TypeScript + react-router-dom
  - Route: / (landing), /pricing, /register, /login, /dashboard, /checkout

- [ ] **WEB-2**: Form registrazione + login
- [ ] **WEB-3**: Pagina prezzi + Stripe Checkout
  - Piani: Monthly (9.99/mese), Annual (89.99/anno)
  - Badge "7 giorni gratis sul primo pagamento"
- [ ] **WEB-4**: Dashboard utente
  - Chiave licenza (copiabile)
  - Stato: attiva / in scadenza / trial / bloccata
  - Storico pagamenti

---

## Wave 2 — SMOT-APP Licenza (Tommaso)

### Blocco all'avvio (Rust) — CRITICO

- [ ] **APP-1**: Check licenza in `setup.rs` PRIMA di mostrare UI
  ```rust
  // In setup.rs, PRIMA di on_app_startup():
  // 1. Leggi config.json → estrai license_key
  // 2. Se nessuna chiave → mostra LicenseStep nel wizard
  // 3. Se chiave presente → chiama API validate
  // 4. Se blocked = true → emetti evento "license-blocked"
  // 5. Altrimenti → avvia normalmente
  ```

- [ ] **APP-2**: Tauri command `validate_license`
  ```rust
  #[tauri::command]
  async fn validate_license(key: String) -> Result<LicenseStatus, String> {
    // GET /api/license/validate/{key}
    // Ritorna: valid, plan, expires_at, grace_until, blocked
  }
  ```

- [ ] **APP-3**: Schermata blocco licenza (React)
  - `LicenseBlockedPage.tsx` — full-screen, solo input licenza
  - Nessun accesso a sidebar, dashboard, o qualsiasi funzionalità
  - Messaggio: "Licenza scaduta. Inserisci una nuova chiave per continuare."
  - Pulsante: "Valida" → chiama validate_license

- [ ] **APP-4**: Banner warning in periodo di grazia
  - In App.tsx, se licenza in grazia: banner giallo in alto
  - "La tua licenza scade oggi. Rinnova per non perdere l'accesso."
  - Pulsante "Rinnova ora" → apre browser su /pricing

### Wizard Licenza

- [ ] **APP-5**: Aggiornare `LicenseStep.tsx`
  - Input per chiave formato `SMOT-XXXX-XXXX-XXXX-XXXX`
  - Validazione in tempo reale via API
  - Bottone "Salta" → modalità trial 7 giorni (solo primo avvio)

---

## Flusso Tecnico all'Avvio

```
main.rs / setup.rs:

1. Legge config.json
2. Estrae license_key
3. Se license_key vuota → show_wizard() → LicenseStep
4. Se license_key presente:
   a. Chiama GET /api/license/validate/{key}
   b. Riceve: { valid, plan, expires_at, blocked, grace }
   c. Se valid = true AND grace = false → avvia app normalmente
   d. Se valid = true AND grace = true → avvia con banner warning
   e. Se blocked = true → mostra LicenseBlockedPage (full-screen)

Frontend (React):
- Ascolta evento "license-blocked" → mostra LicenseBlockedPage
- Ascolta evento "license-grace" → mostra banner
- Componente LicenseBlockedPage: solo input chiave + valida
```
