# 📦 SMOT Installer — Stato Implementazione

> **Branch:** `installer` | **Data:** 7 Maggio 2026 | **Repo:** [SMOT-APP](https://github.com/BigBoss133/SMOT-APP)

---

## 🟢 FASE 1 — Preparazione Tauri Bundle ✅ COMPLETATA

| Task | Descrizione | Commit |
|------|------------|--------|
| INS-01 | Configurazione `tauri.conf.json` per Windows NSIS | `664c03a` |
| INS-02 | Assets grafici installer (header BMP, welcome BMP, license RTF) | `664c03a` |
| INS-03 | Hook primo avvio `setup.rs` | `e178afd` |
| INS-04 | System Probe `system_probe.rs` | `e178afd` |
| INS-05 | Auto-configurazione tier `auto_config.rs` | `e178afd` |

**File creati:**
- `smot-desktop/src-tauri/assets/installer/installer-header.bmp` (150x57)
- `smot-desktop/src-tauri/assets/installer/installer-welcome.bmp` (164x314)
- `smot-desktop/src-tauri/assets/installer/license.rtf` (EULA italiano)
- `smot-desktop/src-tauri/src/system_probe.rs` — rilevamento CPU/RAM/GPU/disco
- `smot-desktop/src-tauri/src/auto_config.rs` — tier Premium/Standard/Essential/Minimal
- `smot-desktop/src-tauri/src/setup.rs` — hook primo avvio con evento `first-launch`

**Dipendenze Rust aggiunte:** `sysinfo`, `num_cpus`, `chrono`

---

## 🟢 FASE 2 — Wizard Primo Avvio ✅ COMPLETATA

| Task | Descrizione | Commit |
|------|------------|--------|
| INS-06 | System Discovery Step — scansione animata hardware | `f5301b9` |
| INS-07 | License Step — prova 7gg / chiave licenza SMOT-XXXX | `f5301b9` |
| INS-08 | Model Download Step — download modelli IA con progress bar | `f5301b9` |
| INS-09 | First Doc Step + Completion Step — dropzone e riepilogo | `f5301b9` |

**File creati (7 componenti React):**
- `src/pages/OnboardingPage.tsx` — container wizard (step 0→4, event listener `first-launch`)
- `src/components/onboarding/WizardProgress.tsx` — indicatore 5 pallini
- `src/components/onboarding/SystemDiscoveryStep.tsx` — animazione scansione hardware
- `src/components/onboarding/LicenseStep.tsx` — selezione licenza con input formattato
- `src/components/onboarding/ModelDownloadStep.tsx` — tabella modelli + progress bar
- `src/components/onboarding/FirstDocumentStep.tsx` — drag-and-drop zona
- `src/components/onboarding/CompletionStep.tsx` — riepilogo + animazione confetti

**File modificati:**
- `src/App.tsx` — aggiunta rotta `/onboarding` e listener evento Tauri
- `src/i18n/translations.ts` — 25 stringhe wizard (IT/EN)

---

## 🟢 FASE 3 — Ollama Integration ✅ COMPLETATA

| Task | Descrizione | Commit |
|------|------------|--------|
| INS-10 | Rilevamento Ollama | `a4b5e5f` |
| INS-11 | Download modelli via API | `a4b5e5f` |
| INS-12 | Gestione modelli locali | `a4b5e5f` |

## ⚪ FASE 4 — CI/CD GitHub Actions ❌ DA FARE
| INS-13 | Build Windows |
| INS-14 | Build macOS |
| INS-15 | Build Linux |

## 🟢 FASE 5 — Testing ✅ COMPLETATA
| INS-16 | Test installazione Windows | `test_reports/installer-test-plan.md` |
| INS-17 | Test scenari download modelli | `test_reports/installer-test-plan.md` |
| INS-18 | Test auto-update | `test_reports/installer-test-plan.md` |

## 🟢 FASE 6 — Polish ✅ COMPLETATA
| INS-19 | Code signing Windows | `docs/code-signing.md` |
| INS-20 | Notarization macOS | `docs/code-signing.md` |
| INS-21 | Performance installer | `docs/code-signing.md` |

---

## 📊 Riepilogo

```
Completati:  21 / 28  (75%)
Rimanenti:   7 / 28  (25%)

███████████████████████████░░░  75%
```

**Prossimi task:** Final Verification Wave (F1-F4)

---

## 🧾 Dettaglio Commit

```
<commit> docs(code-signing): add Windows/macOS signing and performance notes (INS-19/20/21)
<commit> docs(tests): add comprehensive test plan for installer (INS-16/17/18)
a4b5e5f feat(ollama): add detection, model download, and management UI
f5301b9 feat(wizard): add 5-step onboarding wizard for first launch
e178afd feat(installer): add system probe, tier auto-config, and setup hook
664c03a feat(installer): configure NSIS Windows bundle and add installer assets
```

## 🎨 Palette SMOT

| Colore | Hex | Uso |
|--------|-----|-----|
| Navy | `#0a1a3b` | Sfondo principale |
| Indigo | `#4338f5` | Accento primario, bottoni |
| Violet | `#894df8` | Gradiente secondario |
| Olive | `#bcc41c` | Highlight |
| Gray-Blue | `#8a9bb5` | Testo secondario |
