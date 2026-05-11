# SMOT — Release v0.1.0-beta: Piano Team

> **Branch:** `release/v0.1.0-beta` (da creare da `main`)
> **Target:** Venerdì 15 Maggio 2026

---

## TL;DR

Il branch `installer` è già completamente mergiato in `main`. 
Ora serve **preparare la release beta**: aggiornare versione, generare chiavi updater, testare build.

| Sviluppatore | Task | Area |
|---|---|---|
| **Michele** | Branch, version bump, signing keys, CI test | Backend/Release |
| **Salvatore** | Check wizard UI, assets installer, i18n | Frontend/Design |
| **Tommaso** | Updater config, CI review, security check | Infra/Security |

---

## Wave 0 — Branch & Cleanup (Michele)

- [ ] **R0a**: Cancellare branch `installer` obsoleto
  ```bash
  git branch -D installer
  git push origin --delete installer
  ```
  
- [ ] **R0b**: Creare branch `release/v0.1.0-beta` da `main`
  ```bash
  git checkout -b release/v0.1.0-beta main
  git push origin release/v0.1.0-beta
  ```

---

## Wave 1 — Config & Build (Michele)

- [ ] **R1**: Generare chiave Tauri updater
  ```bash
  cargo tauri signer generate -w ~/.tauri/smot.key
  ```
  Salvare: `pubkey` -> `tauri.conf.json`, password -> password manager
  
- [ ] **R2**: Aggiornare `tauri.conf.json`
  - Sostituire `"pubkey": "PLACEHOLDER..."` con la chiave generata
  - Aggiornare `"version": "0.1.0-beta"`
  - Aggiornare `"productName": "SMOT Beta"`

- [ ] **R3**: Installare GTK deps e testare build Linux
  ```bash
  sudo apt install libgtk-3-dev libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev
  cd smot-desktop && npm install && cd src-tauri && cargo build && cd ..
  ```

---

## Wave 2 — UI & Assets (Salvatore)

- [ ] **R4**: Verificare asset installer
  - `assets/installer/installer-header.bmp` — 150x57 px
  - `assets/installer/installer-welcome.bmp` — 164x314 px
  - `icons/icon.ico`, `icons/icon.icns`
  - Se mancano placeholder, crearne di semplici

- [ ] **R5**: Verificare wizard onboarding
  - OnboardingPage si vede al primo avvio?
  - I passi 1-5 funzionano?
  - Traduzioni IT/EN complete?

- [ ] **R6**: Aggiornare `index.html` title
  - Cambiare da "SMOT Smart Archive" a "SMOT Smart Archive Beta"

---

## Wave 3 — CI & Security (Tommaso) ✅

- [x] **R7**: Verificare workflow CI
  - Leggere `.github/workflows/build-windows.yml`, `build-macos.yml`, `build-linux.yml`
  - Trigger branch aggiornati da `installer` a `main`

- [x] **R8**: Security check pre-release
  - 0 secret in chiaro in `tauri.conf.json`
  - `.gitignore` include `*.key`, `*.pem`, `.env`
  - CSP configurata correttamente

- [x] **R9**: Aggiornare endpoint updater
  - Pubkey placeholder presente — Michele deve generare la chiave reale

---

## Wave FINAL — Release (Team)

- [ ] **R10**: Test build completo
  ```bash
  cd smot-desktop
  cd src-tauri && cargo build && cd ..
  npm run build
  npx tsc --noEmit
  ```

- [ ] **R11**: Tag release e push
  ```bash
  git tag v0.1.0-beta
  git push origin v0.1.0-beta
  ```

- [ ] **R12**: GitHub Release
  - Andare su GitHub -> Releases -> Draft a new release
  - Tag: `v0.1.0-beta`
  - Title: "SMOT v0.1.0-beta"

---

## Note

- Il code signing (Windows EV cert, macOS Developer ID) e' **rimandato a post-beta**
- L'updater funzionera' solo dopo la prima release su GitHub
- Build locale richiede GTK libs su Linux