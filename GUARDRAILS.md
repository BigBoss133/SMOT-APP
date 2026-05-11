# 🛡️ GUARDRAILS — Regole del Team SMOT

> **Valido per:** Michele, Salvatore, Tommaso  
> **Tool:** OpenCode + Sisyphus  
> **Repo:** [BigBoss133/SMOT-APP](https://github.com/BigBoss133/SMOT-APP)

---

## 0. REGOLA FONDAMENTALE

> **Il codice su `main` deve sempre compilare e funzionare.**
>
> Mai pushare codice rotto. Mai mergiare PR che non passa CI.

---

## 1. BRANCH E PULL REQUEST

### ❌ VIETATO
- Pushare direttamente su `main`
- Mergiare la propria PR senza review
- Fare force push su `main`
- Lavorare direttamente su `main`

### ✅ OBBLIGATORIO
- **Un branch per task** (o gruppo di task correlati)
- Nome branch: `{tipo}/{descrizione-breve}`
  - Esempi: `feat/real-system-status`, `fix/input-validation`, `chore/cleanup-files`
- **Pull Request** per mergiare in `main`
- Almeno **1 review** da un altro membro del team prima del merge
- PR title: formato conventional commits (`feat(backend): implement real system status`)

### 🔄 Flusso di lavoro
```
main ← PR ← feature-branch ← commit ← /start-work <piano>
  ↑                        ↑
  stabile                  lavoro quotidiano
```

---

## 2. COMMIT

### Formato (Conventional Commits)
```
tipo(scope): descrizione breve

- feat: nuova funzionalità
- fix: bug fix
- chore: pulizia, refactor minori, dipendenze
- docs: documentazione
- test: test
- security: fix di sicurezza
```

### ✅ OBBLIGATORIO
- Commit atomici: un commit = un task completato
- Messaggio in inglese
- Descrizione chiara di COSA e PERCHÉ (non COME)

### ❌ VIETATO
- Commit giganti con 20 file non correlati
- Messaggi vaghi tipo "fix", "update", "wip"
- Commit con codice commentato o TODO dimenticati

---

## 3. FILE CONDIVISI — COORDINAMENTO OBBLIGATORIO

Questi file richiedono **coordinamento esplicito** prima di essere modificati:

| File | Perché |
|---|---|
| `smot-desktop/src-tauri/Cargo.toml` | Dipendenze Rust — aggiungere crate richiede rebuild |
| `smot-desktop/src-tauri/tauri.conf.json` | Configurazione Tauri — impatta tutti |
| `smot-desktop/package.json` | Dipendenze frontend — richiede `npm install` |
| `smot-desktop/src-tauri/src/lib.rs` | Comandi Tauri — firme usate dal frontend |
| `smot-desktop/src-tauri/src/db.rs` | Schema DB — tutte le query dipendono da questo |

**Regola:** Se devi toccare uno di questi file, scrivi nel gruppo Telegram/WhatsApp del team **prima** di pushare.

---

## 4. CODICE — COSA TOCCARE E COSA NO

### 🟢 AREE LIBERE (ognuno la sua)

| Sviluppatore | File |
|---|---|
| **Michele** | `lib.rs` (solo comandi stub B1-B10), eventuali nuovi moduli Rust |
| **Salvatore** | `src/components/`, `src/pages/`, `src/hooks/`, `src/styles/` |
| **Tommaso** | `db.rs` (solo nuove funzioni D1-D4), validazione input, security |

### 🔴 AREE BLOCCATE (NON toccare senza accordo)

| File | Perché |
|---|---|
| `ollama.rs` | ✅ Già reale e funzionante |
| `setup.rs` | ✅ Già reale e funzionante |
| `system_probe.rs` | ✅ Già reale e funzionante |
| `auto_config.rs` | ✅ Già reale e funzionante |
| `parsers.rs` | ✅ Già reale e funzionante |
| Firme comandi Tauri in `lib.rs` | ⚠️ Il frontend di Salvatore dipende da queste |
| Schema DB in `migrations/` | ⚠️ Tutte le query dipendono da questo schema |
| `tauri.conf.json` | ⚠️ Configurazione globale |

---

## 5. QUALITÀ — PRIMA DI OGNI PUSH

### ✅ CHECKLIST PRE-PUSH (Michele)
```bash
cd smot-desktop/src-tauri
cargo build                    # DEVE passare (exit 0)
cargo test                     # DEVE passare (0 failures)
cargo clippy -- -D warnings    # DEVE passare (0 warnings)
```

### ✅ CHECKLIST PRE-PUSH (Salvatore)
```bash
cd smot-desktop
npx tsc --noEmit               # DEVE passare (exit 0)
npm run build                  # DEVE passare (exit 0)
npm run lint                   # DEVE passare (0 errors)
```

### ✅ CHECKLIST PRE-PUSH (Tommaso)
```bash
cd smot-desktop/src-tauri
cargo test                     # DEVE passare (0 failures)
grep -r "sk-\|api_key\|password\|secret" . --include="*.rs" --include="*.json"  # DEVE essere vuoto
cargo clippy -- -D warnings    # DEVE passare
```

### ❌ MAI PUSHARE SE
- Build fallisce
- Test falliscono
- Ci sono warning di clippy/tsc
- Ci sono secrets nel codice
- C'è codice commentato o `console.log`

---

## 6. OPencode — USO CORRETTO

### ✅ DO
- Usare `/start-work <nome-piano>` per eseguire i task
- Delegare UN task alla volta a Sisyphus
- Verificare il risultato di ogni task prima di passare al successivo
- Tenere traccia dei task completati nel file piano (.md)
- Se un task fallisce, riprendere con `task_id` invece di ricominciare

### ❌ DON'T
- NON eseguire più task in parallelo sullo stesso file
- NON saltare la verifica QA dopo ogni task
- NON chiudere OpenCode a metà di un task
- NON modificare file manualmente mentre Sisyphus sta lavorando

### 🔄 Flusso OpenCode
```
1. git pull main (prendi ultimi cambiamenti)
2. git checkout -b feat/nuovo-task (crea branch)
3. /start-work smot-michele-backend (avvia esecuzione)
4. [Sisyphus lavora sul task]
5. Verifica output: cargo build, test, QA
6. git push origin feat/nuovo-task
7. Crea PR su GitHub → chiedi review
8. Dopo review approvata → merge in main
```

---

## 7. DIPENDENZE TRA TASK

Alcuni task dipendono da altri. **Rispetta l'ordine:**

| Task | Dipende da | Stato |
|---|---|---|
| B2 (get_documents) | D2 (Tommaso) | ✅ Sbloccato — `get_all_documents()` completata |
| B3 (upload_documents) | D1 (Tommaso) | ✅ Sbloccato — `insert_document()` completata |
| B6 (chat_query RAG) | D4 (Tommaso) | ✅ Sbloccato — `search_fts5()` completata |
| B4-B5-B8-B10 (indexing) | D3 (Tommaso) | ✅ Sbloccato — `update_indexing_status()` completata |

**Regola:** Se sei bloccato da un altro, passa al task successivo **non bloccato** nel tuo piano.

---

## 8. COMUNICAZIONE

### Quando scrivere nel gruppo
- ✅ Hai finito un task e la PR è pronta per review
- ✅ Sei bloccato da una dipendenza
- ✅ Stai per toccare un file condiviso (Cargo.toml, tauri.conf.json, ecc.)
- ✅ Hai trovato un bug che impatta il lavoro di un altro
- ✅ Vuoi proporre una modifica al piano

### Quando NON serve scrivere
- ❌ Stai lavorando su un task nel tuo piano
- ❌ Hai fatto un commit atomico su un branch
- ❌ Domande tecniche risolvibili con la documentazione

---

## 9. SICUREZZA — REGOLE FERREE

### ❌ MAI
- Committare API keys, token, password, secret
- Usare `unsafe` in Rust senza review esplicita
- Esporre porte o endpoint senza autenticazione
- Salvare dati utente in chiaro

### ✅ SEMPRE
- Usare variabili d'ambiente per secrets (`{env:VAR_NAME}`)
- Validare TUTTI gli input utente (path traversal, SQL injection, XSS)
- Usare prepared statements per SQL (MAI concatenare stringhe)
- Verificare `.gitignore` copra file sensibili (`.env`, `*.pem`, `*.key`)

---

## 10. RIEPILOGO COMANDI PRE-MERGE

```bash
# Michele — prima di mergiare la PR
git checkout feat/mio-task
cd smot-desktop/src-tauri
cargo build && cargo test && cargo clippy -- -D warnings

# Salvatore — prima di mergiare la PR
git checkout feat/mio-task
cd smot-desktop
npx tsc --noEmit && npm run build

# Tommaso — prima di mergiare la PR
git checkout feat/mio-task
cd smot-desktop/src-tauri
cargo test
grep -r "sk-\|api_key\|password" . --include="*.rs" --include="*.json"  # deve essere vuoto
```

---

> **Infrange una regola?** L'altro membro del team ha il diritto — e il dovere — di **richiedere modifiche** (Request Changes) sulla PR.
>
> **Non sai cosa fare?** Chiedi nel gruppo. Meglio una domanda in più che un commit sbagliato.
