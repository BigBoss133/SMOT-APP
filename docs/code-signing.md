# SMOT — Code Signing & Notarization Guide

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