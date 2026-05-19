# SMOT — Code Signing, Notarization & Onboarding Guide

## INS-19: Windows Code Signing

### Prerequisites
- Extended Validation (EV) Code Signing Certificate (~$200-400/year)
- Providers: DigiCert, Sectigo, GlobalSign
- Hardware token or Azure Key Vault for key storage

### Setup in GitHub Actions
Add to `build-windows.yml`:
```yaml
- name: Sign executable
  run: |
    signtool sign /fd SHA256 /a /f certificate.pfx /p ${{ secrets.WIN_CERT_PASSWORD }} /tr http://timestamp.digicert.com smot.exe
- name: Sign installer
  run: |
    signtool sign /fd SHA256 /a /f certificate.pfx /p ${{ secrets.WIN_CERT_PASSWORD }} /tr http://timestamp.digicert.com smot-setup.exe
```

### Secrets required
- `WIN_CERT_PASSWORD`: PFX certificate password
- `WIN_CERT_BASE64`: Base64-encoded PFX file

---

## INS-20: macOS Notarization

### Prerequisites
- Apple Developer Program ($99/year)
- Developer ID Application certificate
- App-specific password for notarytool

### Setup
1. Generate cert: `security create-keychain`
2. Add to Keychain in CI

### GitHub Actions addition
```yaml
- name: Notarize
  run: |
    xcrun notarytool submit SMOT.dmg --apple-id ${{ secrets.APPLE_ID }} --password ${{ secrets.APPLE_PASSWORD }} --team-id ${{ secrets.APPLE_TEAM_ID }} --wait
    xcrun stapler staple SMOT.dmg
```

### Secrets required
- `APPLE_ID`: Developer account email
- `APPLE_PASSWORD`: App-specific password
- `APPLE_TEAM_ID`: Team identifier

---

## INS-21: Performance Optimization

### Current Targets
| Metric | Target |
|--------|--------|
| Installer size | < 100 MB |
| Installation time | < 30 sec |
| App cold start | < 3 sec |
| Wizard completion | < 2 min |

### Optimizations Implemented
- ✅ Tauri v2 native performance (no Electron overhead)
- ✅ Rust backend (fast system probe)
- ✅ Lazy loading of wizard components (code splitting via React.lazy)
- ✅ CSS-only animations (no JS animation libraries)
- ✅ Ollama detection timeout (2s max)
- ✅ `sysinfo` cached refreshes

### Future Optimizations
- [ ] UPX compression for executable
- [ ] Image optimization (WebP for assets)
- [ ] Database vacuum on first launch
- [ ] Service worker for offline caching
- [ ] Model download resume support

---

## Onboarding & Licenze (Beta)

### Flusso Onboarding (Primo Avvio)

L'app esegue il wizard onboarding automaticamente al primo avvio (`isOnboarding` in App.tsx):

```
1. System Discovery  → auto_config.rs rileva CPU/RAM/GPU → assegna tier
2. Welcome           → messaggio personalizzato in base al tier
3. Licenza / Trial   → LicenseStep.tsx — input chiave o prova gratuita
4. Primo documento   → drop zone per caricare PDF/DOCX/TXT
5. Completo!          → CompletionStep.tsx — confetti + riepilogo
```

### Sistema Licenze

| Componente | File | Descrizione |
|-----------|------|-------------|
| LicenseBlockedPage | `src/pages/LicenseBlockedPage.tsx` | Blocco app se licenza scaduta |
| LicenseBanner | `src/components/LicenseBanner.tsx` | Banner periodo grazia |
| LicenseStep | `src/components/onboarding/LicenseStep.tsx` | Step licenza nel wizard |
| get_license_status | `src-tauri/src/lib.rs` | Comando Rust: ritorna `active`/`trial` |
| validate_license | `src-tauri/src/lib.rs` | Comando Rust: valida formato chiave |

### Trial 7 Giorni

- Nessuna carta di credito richiesta
- Tutte le funzionalità sbloccate per 7 giorni dal primo avvio
- Alla scadenza: downgrade a Essential (solo ricerca FTS5, 500 documenti)
- Configurazione salvata in `config.json` (non in cloud)

### Tier Hardware

| Tier | RAM | GPU | Modello AI | Indice |
|------|-----|-----|-----------|--------|
| Premium | 16GB+ | CUDA/Metal | Llama 3.2 7B | Parallelo |
| Standard | 8-16GB | - | Llama 3.2 3B | Moderato |
| Essential | 4-8GB | - | Nessun AI | Singolo |
| Minimal | <4GB | - | Solo viewer | Nessuno |

### Test Manuale

```bash
# Forzare onboarding al prossimo avvio (cancellare stato)
rm ~/.config/smot/config.json
# Oppure modificare: "onboarding_completed": true → false

# Test licenza da terminale
cd src-tauri && cargo run -- validate-license SMOT-PREMIUM-AAAA-BBBB-CCCC

# Verificare traduzioni IT/EN in i18n/translations.ts
grep -n "license\|onboarding\|trial\|welcome" src/i18n/translations.ts
```