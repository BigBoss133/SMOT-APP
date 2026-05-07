# Strategia Distribuzione, Licenze & Onboarding Premium — SMOT Desktop

> **Obiettivo:** Installer intelligente che rileva le spec del PC, sistema licenze locale, onboarding che "coccola" l'utente, guida integrata.

---

## 1. 🔬 System Detection: Installer Intelligente

### Cosa Rileva al Primo Avvio

```rust
// src-tauri/src/system_probe.rs
#[derive(Serialize, Deserialize, Clone)]
pub struct SystemProfile {
    // CPU
    pub cpu_cores: usize,
    pub cpu_threads: usize,
    pub cpu_model: String,
    pub cpu_frequency_mhz: u32,
    
    // RAM
    pub ram_total_gb: f32,
    pub ram_available_gb: f32,
    
    // GPU (per AI acceleration)
    pub gpu_name: Option<String>,
    pub gpu_vram_gb: Option<f32>,
    pub gpu_cuda: bool,
    pub gpu_metal: bool,
    pub gpu_vulkan: bool,
    
    // Disco
    pub disk_total_gb: f32,
    pub disk_free_gb: f32,
    
    // OS
    pub os_name: String,
    pub os_version: String,
    pub os_arch: String,
    
    // Rete (per download modelli)
    pub has_internet: bool,
}

pub fn probe_system() -> SystemProfile {
    SystemProfile {
        cpu_cores: num_cpus::get() as usize,
        cpu_threads: num_cpus::get_physical() as usize,
        ram_total_gb: sys_info::mem_info().unwrap().total as f32 / 1024.0,
        disk_free_gb: fs2::available_space(app_dir).unwrap_or(0) as f32 / 1e9,
        gpu_cuda: check_cuda_available(),
        gpu_metal: cfg!(target_os = "macos"),
        // ... etc
    }
}
```

### Configurazione Automatica Basata sulle Spec

| Fascia PC | RAM | GPU | Configurazione Auto |
|-----------|-----|-----|---------------------|
| 🟢 **Premium** | 16GB+ | ✅ CUDA/Metal | Modello 7B, embedding GPU, indexing parallelo |
| 🟡 **Standard** | 8-16GB | ❌ | Modello 3B, embedding CPU, indexing moderato |
| 🔴 **Essential** | 4-8GB | ❌ | No AI, ricerca FTS5, indexing singolo thread |
| ⚪ **Minimo** | <4GB | ❌ | Solo viewer, no indexing in background |

```rust
#[derive(Serialize, Clone)]
pub enum TierConfig {
    Premium {
        model: &'static str,      // "llama3.2:7b"
        embedding_threads: usize,
        indexing_parallel: usize,
        use_gpu: bool,
    },
    Standard {
        model: &'static str,      // "llama3.2:3b"
        embedding_threads: usize,
        indexing_parallel: usize,
    },
    Essential,
    Minimal,
}

pub fn auto_configure(profile: &SystemProfile) -> TierConfig {
    match (profile.ram_total_gb, profile.gpu_vram_gb) {
        (r, Some(vram)) if r >= 16.0 && vram >= 4.0 => TierConfig::Premium { ... },
        (r, _) if r >= 8.0 => TierConfig::Standard { ... },
        (r, _) if r >= 4.0 => TierConfig::Essential,
        _ => TierConfig::Minimal,
    }
}
```

### Feedback Visivo all'Utente

```
┌──────────────────────────────────────────────────┐
│  🔬 Analisi del tuo computer...                   │
│                                                   │
│  ████████████████████░░░░  80% completato          │
│                                                   │
│  ✅ CPU: Intel i7-12700H (14 core) — Ottimo!      │
│  ✅ RAM: 16 GB — Abbondante                       │
│  ✅ GPU: NVIDIA RTX 3060 (6 GB VRAM) — Eccellente!│
│  ✅ Disco: 234 GB liberi                          │
│                                                   │
│  🎉 Il tuo PC è nella fascia PREMIUM              │
│  SMOT funzionerà con IA completa!                 │
└──────────────────────────────────────────────────┘
```

---

## 2. 🔑 Sistema Licenze Locale (No Account)

### Principi

- **Nessun account** — solo chiave di licenza
- **Validazione offline** — firma crittografica locale
- **Nessun dato personale** — la chiave è anonima
- **Privacy totale** — nessuna telemetria, nessun tracking

### Formato Chiave

```
SMOT-PREMIUM-XXXX-XXXX-XXXX
│    │       │
│    │       └── Checksum + firma
│    └── Tier (PREMIUM / STANDARD / ESSENTIAL)
└── Prefisso
```

### Struttura Interna

```rust
#[derive(Serialize, Deserialize)]
struct LicenseKey {
    tier: String,           // "premium" | "standard" | "essential"
    issued_at: i64,          // Unix timestamp
    expires_at: i64,         // 0 = lifetime
    features: Vec<String>,   // ["ai", "unlimited_docs", "priority_update"]
    signature: String,       // HMAC-SHA256 della parte dati
}

impl LicenseKey {
    pub fn validate(&self) -> Result<(), LicenseError> {
        // 1. Verifica scadenza
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH).unwrap().as_secs() as i64;
        if self.expires_at > 0 && now > self.expires_at {
            return Err(LicenseError::Expired);
        }
        
        // 2. Verifica firma (senza chiamate di rete)
        let payload = format!("{}{}{}{:?}", 
            self.tier, self.issued_at, self.expires_at, self.features);
        let expected = hmac_sign(&payload, HARDCODED_PUBLIC_KEY);
        if self.signature != expected {
            return Err(LicenseError::InvalidSignature);
        }
        
        Ok(())
    }
}
```

### Flusso Acquisto

```
1. Utente visita smot.app → sceglie piano
2. Paga con Stripe/PayPal (no registrazione)
3. Riceve email con chiave: SMOT-PREMIUM-A1B2-C3D4-E5F6
4. Apre SMOT → inserisce chiave
5. ✅ Attivato. Fine. Nessun account.
```

### Piani e Prezzi

| Piano | Prezzo | Documenti | AI | Durata |
|-------|--------|:---------:|:--:|--------|
| **Essential** | 29€ | 500 | ❌ | Per sempre |
| **Standard** | 4.99€/mese | Illimitati | ✅ 3B | Rinnovo mensile |
| **Premium** | 7.99€/mese | Illimitati | ✅ 7B + GPU | Rinnovo mensile |
| **Lifetime** | 149€ | Illimitati | ✅ Completa | Per sempre |

### UI Inserimento Chiave

```
┌──────────────────────────────────────────────────┐
│  🔑 Attiva SMOT                                   │
│                                                   │
│  Inserisci la chiave ricevuta via email:          │
│                                                   │
│  ┌──────────────────────────────────────────┐    │
│  │ SMOT-PREMIUM-____-____-____              │    │
│  └──────────────────────────────────────────┘    │
│                                                   │
│  Formato: SMOT-TIER-XXXX-XXXX-XXXX               │
│                                                   │
│  [  Attiva  ]  [  Prova gratuita (7 giorni)  ]    │
│                                                   │
│  📧 Non hai una chiave?                           │
│  Visita smot.app per acquistare                   │
└──────────────────────────────────────────────────┘
```

### Trial Gratuito

- **7 giorni** — tutte le funzionalità sbloccate
- **Nessuna carta di credito** richiesta
- Al termine: downgrade a Essential (solo ricerca, 500 doc max)
- L'utente può acquistare in qualsiasi momento

```rust
pub fn check_trial(app_state: &AppState) -> LicenseStatus {
    let config = read_config(&app_state);
    
    if let Some(license) = &config.license_key {
        return validate_license(license);
    }
    
    // Nessuna licenza? Controlla trial
    let now = Utc::now();
    let first_launch = config.first_launch.unwrap_or(now);
    let days_since_first = (now - first_launch).num_days();
    
    if days_since_first <= 7 {
        LicenseStatus::Trial { days_left: 7 - days_since_first }
    } else {
        LicenseStatus::EssentialLimited
    }
}
```

---

## 3. 🛋️ Onboarding "Coccoloso" — UX Premium

### Filosofia

> L'utente deve sentirsi **accolto, guidato, stupito** — non confuso da opzioni tecniche.

| Principio | Come lo applichiamo |
|-----------|---------------------|
| **Delight first** | Animazione elegante, messaggi positivi, micro-celebrazioni |
| **Zero frizione** | Tutto auto-rilevato, niente domande tecniche |
| **Progresso visibile** | Barre animate, checkmark verdi, stime tempo reali |
| **Linguaggio umano** | "Il tuo PC è una Ferrari!" non "16GB RAM rilevati" |
| **Undo always** | Ogni scelta è reversibile da Impostazioni |

### Flusso Onboarding Ripensato

#### Step 0: Splash (3 secondi)

```
┌──────────────────────────────────────────────────┐
│                                                   │
│                                                   │
│              🧠  SMOT                              │
│         Il tuo archivio, la tua mente              │
│                                                   │
│      Sicuro · Veloce · Solo sul tuo computer       │
│                                                   │
│   [ fade in del logo con gradiente animato ]       │
│                                                   │
└──────────────────────────────────────────────────┘
```

#### Step 1: System Discovery (automatico, 5-10 secondi)

```
┌──────────────────────────────────────────────────┐
│  🔬 Sto analizzando il tuo computer...             │
│                                                   │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  95%                       │
│                                                   │
│  ✅ Intel Core i7 — che potenza!                  │
│  ✅ 16 GB RAM — spazio per tutto                  │
│  ✅ NVIDIA GeForce RTX — IA fulminea              │
│  ✅ 234 GB liberi — archivio enorme               │
│                                                   │
│  🎉 Configurazione OTTIMALE rilevata!             │
│     [  Continua  ]                                │
└──────────────────────────────────────────────────┘
```

#### Step 2: Welcome Personalizzato

```
┌──────────────────────────────────────────────────┐
│  Ciao! Sono SMOT 🧠                               │
│                                                   │
│  Il tuo computer è potente, posso offrirti:       │
│                                                   │
│  ✨ Ricerca intelligente nei documenti             │
│  ✨ Chat che capisce le tue domande                │
│  ✨ Organizzazione automatica                      │
│  ✨ Tutto offline, solo sul tuo PC                 │
│                                                   │
│  Pronto a scoprire cosa posso fare per te?        │
│                                                   │
│        [  Iniziamo! 🚀  ]                         │
└──────────────────────────────────────────────────┘
```

#### Step 3: Licenza / Trial

```
┌──────────────────────────────────────────────────┐
│  🎁 Prova SMOT gratuitamente!                     │
│                                                   │
│  Hai 7 giorni con TUTTE le funzionalità:          │
│  ✅ Chat IA illimitata                            │
│  ✅ Documenti illimitati                          │
│  ✅ Ricerca avanzata                              │
│  ✅ Nessuna carta richiesta                        │
│                                                   │
│  [  Inizia prova gratuita  ]                      │
│                                                   │
│  Hai già una chiave?                              │
│  [  Inserisci chiave di licenza  ]                │
└──────────────────────────────────────────────────┘
```

#### Step 4: Primo Documento Guidato

```
┌──────────────────────────────────────────────────┐
│  🎯 Iniziamo con un documento!                    │
│                                                   │
│  Trascina qui un PDF, DOCX o TXT:                │
│  ┌──────────────────────────────────────────┐    │
│  │                                          │    │
│  │         📄  Trascina un file qui         │    │
│  │          oppure clicca per cercare       │    │
│  │                                          │    │
│  └──────────────────────────────────────────┘    │
│                                                   │
│  💡 Suggerimento: inizia con un contratto,        │
│  una fattura o un documento di studio.            │
│                                                   │
│  [  Salta, caricherò dopo  ]                      │
└──────────────────────────────────────────────────┘
```

#### Step 5: Prima Ricerca (se documento caricato)

```
┌──────────────────────────────────────────────────┐
│  ✅ Documento caricato!                            │
│                                                   │
│  Prova a fare una domanda:                        │
│  ┌──────────────────────────────────────────┐    │
│  │ "Qual è la data di pagamento?"           │    │
│  └──────────────────────────────────────────┘    │
│                                                   │
│  SMOT cercherà nel documento e ti risponderà.     │
│                                                   │
│  [  Chiedi a SMOT  ]                              │
└──────────────────────────────────────────────────┘
```

#### Step 6: Completo — Riepilogo

```
┌──────────────────────────────────────────────────┐
│  🎉 Sei pronto!                                   │
│                                                   │
│  Ecco un riepilogo del tuo SMOT:                  │
│                                                   │
│  🖥️  PC:        Configurazione PREMIUM            │
│  📄  Documenti: 1 caricato                        │
│  🧠  IA:        Attiva (Llama 3.2 7B)             │
│  🔑  Licenza:   Trial — 7 giorni rimanenti        │
│                                                   │
│  💡 Suggerimento: premi Ctrl+K in qualsiasi       │
│  momento per aprire la guida rapida.              │
│                                                   │
│          [  Vai alla Dashboard  ]                  │
└──────────────────────────────────────────────────┘
```

---

## 4. 📖 Guida Integrata

### Accesso

- **Shortcut globale:** `Ctrl+K` / `Cmd+K`
- **Icona `?`** nella sidebar (sempre visibile)
- **"Hai bisogno di aiuto?"** tooltip al primo hover su ogni sezione

### Struttura Guida

```
┌──────────────────────────────────────────────────┐
│  🔍 Cerca nella guida...                          │
├──────────────────────────────────────────────────┤
│                                                   │
│  📚 Primi Passi                                   │
│    ├── Come caricare un documento                 │
│    ├── Come fare una ricerca                      │
│    ├── Come usare la chat IA                      │
│    └── Organizzare i documenti                    │
│                                                   │
│  🧠 Intelligenza Artificiale                      │
│    ├── Come funziona la chat RAG                  │
│    ├── Come interpretare le fonti                 │
│    └── Cosa fare se la risposta non è precisa     │
│                                                   │
│  🔍 Ricerca Avanzata                              │
│    ├── Operatori di ricerca (AND, OR, NOT)        │
│    ├── Filtri per categoria e data               │
│    └── Ricerca semantica vs testuale              │
│                                                   │
│  🎨 Personalizzazione                             │
│    ├── Cambiare lingua (IT/EN)                    │
│    ├── Modalità Performance/Balanced/Lite        │
│    └── Tema chiaro/scuro                          │
│                                                   │
│  🔑 Licenza e Account                             │
│    ├── Come attivare la licenza                   │
│    ├── Piani e prezzi                             │
│    └── Cosa succede alla scadenza                 │
│                                                   │
│  ❓ FAQ                                           │
│    ├── SMOT funziona senza internet?              │
│    ├── I miei dati sono al sicuro?                │
│    └── Posso usare SMOT su più computer?          │
│                                                   │
└──────────────────────────────────────────────────┘
```

### Tour Interattivo (Primo Avvio per Feature)

```typescript
// src/components/GuidedTour.tsx
const tourSteps = [
  {
    target: '.sidebar-upload',
    title: 'Carica i tuoi documenti',
    content: 'Trascina qui PDF, DOCX o TXT. SMOT li analizzerà automaticamente.',
    position: 'right',
  },
  {
    target: '.search-bar',
    title: 'Cerca al volo',
    content: 'Scrivi una parola chiave e trova subito il documento giusto.',
    position: 'bottom',
  },
  {
    target: '.chat-input',
    title: 'Chatta con i tuoi documenti',
    content: 'Fai domande in linguaggio naturale. SMOT risponde citando le fonti.',
    position: 'top',
  },
];

// Tour si attiva automaticamente al primo accesso a ogni pagina
// L'utente può saltare o rivedere da Guida → "Rivedi il tour"
```

### Contextual Help Tooltip

```
┌──────────────────────────────────────────┐
│  Modalità Performance                    │
│  ┌────────────────────────────────┐      │
│  │ 🟢 Performance                 │  ?   │
│  └────────────────────────────────┘      │
│       ↑                                   │
│  ┌────┴──────────────────────────────┐   │
│  │ 💡 Usa questa modalità per sfrut- │   │
│  │ tare al massimo GPU e RAM.        │   │
│  │ Ideale per PC potenti.            │   │
│  │                                   │   │
│  │ [Scopri di più nella guida]       │   │
│  └──────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

### Video Tutorial Integrati (Opzionali, P2)

- **Embed Loom/YouTube privato** nella guida
- Tutorial 30-60 secondi per ogni funzionalità
- Generati con IA e revisionati

---

## 5. 📦 Interfaccia Stato Licenza

### Status Bar (sempre visibile)

```
┌──────────────────────────────────────────────────────────────┐
│ 🟢 PREMIUM attivo  │  128 documenti  │  12 GB usati  │  IT ▼ │
└──────────────────────────────────────────────────────────────┘
```

### Pannello Licenza (in Impostazioni)

```
┌──────────────────────────────────────────────────┐
│  🔑 La tua licenza                                 │
│                                                   │
│  Piano:     PREMIUM                               │
│  Stato:     ✅ Attivo                             │
│  Scadenza:  15 Giugno 2026 (38 giorni)            │
│  Rinnovo:   Automatico mensile                    │
│                                                   │
│  La tua chiave: SMOT-PREMIUM-A1B2-●●●●-●●●●      │
│                                                   │
│  [  Gestisci abbonamento  ]                       │
│  [  Acquista Lifetime     ]                       │
│  [  Inserisci nuova chiave ]                      │
└──────────────────────────────────────────────────┘
```

### Notifiche Scadenza

| Giorni alla scadenza | Notifica |
|---------------------|----------|
| 7 giorni | Banner giallo in dashboard: "La tua licenza scade tra 7 giorni" |
| 3 giorni | Toast notification + "Rinnova ora con 20% di sconto" |
| 1 giorno | Dialog modale prima di usare l'app |
| Scaduta | Essential mode. Banner: "Licenza scaduta. Funzionalità limitate." |

---

## 6. 🛡️ Gestione Offline Licenze

### Problema
L'app è offline, ma la licenza deve essere validabile.

### Soluzione
```rust
// Validazione a due livelli:
// 1. Firma HMAC locale (sempre disponibile)
// 2. Verifica online periodica (opzionale, quando c'è internet)

struct LicenseValidator {
    // Chiave pubblica hardcoded nel binario
    public_key: [u8; 32],
    
    // Ultima verifica online
    last_online_check: Option<DateTime<Utc>>,
}

impl LicenseValidator {
    fn validate_offline(&self, key: &LicenseKey) -> bool {
        // HMAC-SHA256: verifica firma con chiave pubblica
        let payload = key.tier + &key.issued_at.to_string() + &key.expires_at.to_string();
        let computed = hmac_sha256(&payload, &self.public_key);
        constant_time_eq(&computed, &key.signature)
    }
    
    async fn validate_online(&self, key: &LicenseKey) -> Result<(), Error> {
        // POST a smot.app/api/license/verify
        // Solo quando internet è disponibile
        // Se offline → salta, usa validazione locale
    }
}
```

### Protezione Anti-Pirateria (Minima)

- **Nessun DRM invasivo** — fiducia nell'utente
- Chiave pubblica hardcoded → difficile da falsificare senza reverse engineering
- Rate limiting sul server di licenza (100 richieste/ora per IP)
- Se abuso rilevato: revoca chiave lato server (blocco solo se l'utente ha internet)

---

## 7. 📋 Implementation Plan Aggiornato

### Fase 1: Installer + System Detection (16h)

| Task | Ore | Descrizione |
|------|:---:|-------------|
| **SYS1** | 3h | `system_probe.rs` — rilevamento CPU/RAM/GPU/Disco |
| **SYS2** | 2h | `auto_config.rs` — mappatura spec → tier configurazione |
| **SYS3** | 3h | UI Wizard system detection animato |
| **SYS4** | 3h | Build pipeline multi-OS con auto-detection |
| **SYS5** | 2h | Test detection su Windows/Mac/Linux |
| **SYS6** | 3h | Feedback visivo risultati detection |

### Fase 2: Licenze (20h)

| Task | Ore | Descrizione |
|------|:---:|-------------|
| **LIC1** | 4h | `license.rs` — struttura chiave, HMAC validation |
| **LIC2** | 3h | Generatore chiavi (tool interno per creare licenze) |
| **LIC3** | 3h | UI inserimento/attivazione chiave |
| **LIC4** | 3h | Sistema trial 7 giorni |
| **LIC5** | 2h | UI stato licenza (status bar, impostazioni) |
| **LIC6** | 2h | Notifiche scadenza progressive |
| **LIC7** | 3h | Server verifica online (actix-web, endpoint /verify) |

### Fase 3: Guida Integrata (12h)

| Task | Ore | Descrizione |
|------|:---:|-------------|
| **GUI1** | 3h | Componente HelpCenter con ricerca |
| **GUI2** | 4h | Contenuti guida (markdown → render) |
| **GUI3** | 3h | Tour interattivo (react-joyride o custom) |
| **GUI4** | 2h | Tooltip contestuali (hover su elementi UI) |

### Fase 4: Onboarding Premium (10h)

| Task | Ore | Descrizione |
|------|:---:|-------------|
| **ONB1** | 4h | Wizard refactor (6 step con animazioni) |
| **ONB2** | 2h | Messaggi personalizzati in base al tier |
| **ONB3** | 2h | Micro-animazioni celebrazione (confetti, checkmark) |
| **ONB4** | 2h | A/B testing UX (skip rate, completion rate) |

### Totale: ~58 ore

---

## 8. 🎯 Flusso Utente Completo

```
SCARICA SMOT (smot.app)
    ↓
APRI L'APP → Splash screen animato
    ↓
SYSTEM DETECTION → "Il tuo PC è una Ferrari!" 🏎️
    ↓
TRIAL 7 GIORNI → nessuna carta, tutto sbloccato
    ↓
WIZARD ONBOARDING (2 min)
    ├── Carica primo doc
    ├── Prova la chat
    └── Completo!
    ↓
DASHBOARD CON TOUR GUIDATO
    ↓                     ↓
ACQUISTA LICENZA      CONTINUA TRIAL
(se piace)             (fino a scadenza)
    ↓                     ↓
PREMIUM ATTIVO         ESSENTIAL (ridotto)
```

---

## 9. 💰 Modello di Business

| Fonte | Dettaglio |
|-------|-----------|
| **Abbonamenti** | 4.99-7.99€/mese (ricorrente) |
| **Lifetime** | 149€ (una tantum) |
| **Essential** | 29€ (funzionalità base) |
| **Trial** | 7 giorni gratuiti, no carta |
| **Pagamento** | Stripe/PayPal su smot.app |
| **Rinnovo** | Automatico, cancellabile sempre |

---

## 10. 📊 Metriche di Successo Onboarding

| Metrica | Target |
|---------|--------|
| Completamento wizard | >80% |
| Skip rate step licenza | <30% |
| Primo documento caricato in sessione 1 | >60% |
| Prima chat inviata in sessione 1 | >40% |
| Conversione trial → pagante | >15% |
| Tempo medio wizard | <2 minuti |
