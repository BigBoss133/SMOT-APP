# SMOT Installer — Test Plan

## INS-16: Windows Clean Install/Uninstall

### Test Environment
- Windows 10 VM (clean)
- Windows 11 VM (clean)

### Install Test
- [ ] Run `smot-setup.exe`
- [ ] Select Italian language
- [ ] Accept EULA (license.rtf)
- [ ] Choose install location (default: %LOCALAPPDATA%\SMOT)
- [ ] Verify desktop shortcut created
- [ ] Verify Start Menu folder "SMOT" exists
- [ ] Launch SMOT from shortcut
- [ ] Verify first-launch wizard appears
- [ ] Complete wizard (skip model download)
- [ ] Verify dashboard loads
- [ ] Check config.json exists with correct tier
- [ ] Check documents/thumbnails/logs directories created
- [ ] Check SQLite database initialized

### Uninstall Test
- [ ] Uninstall via Windows Settings → Apps
- [ ] Verify all files removed
- [ ] Verify no registry entries remain
- [ ] Verify desktop shortcut removed
- [ ] Verify Start Menu folder removed

### Edge Cases
- [ ] Install with no internet → app works in offline mode
- [ ] Install with < 4GB RAM → Minimal tier
- [ ] Install path with spaces
- [ ] Install on non-C drive

---

## INS-17: Model Download Scenarios

### Scenario A: Ollama Installed & Running
- [ ] Launch app with Ollama running on localhost:11434
- [ ] Wizard shows "Premium" tier (if >=16GB RAM)
- [ ] Model download step appears
- [ ] Click "Scarica" for llama3.2:3b
- [ ] Progress bar updates in real time
- [ ] Download completes, model appears in Settings
- [ ] Test chat with downloaded model

### Scenario B: Ollama Not Installed
- [ ] Launch app without Ollama
- [ ] Wizard skips model download step (or shows "local search mode")
- [ ] Dashboard loads, app works in search-only mode
- [ ] Settings shows "Ollama non trovato" message
- [ ] Link to ollama.com appears

### Scenario C: No Network
- [ ] Launch app with network disabled
- [ ] Model download step shows error gracefully
- [ ] "Scarica in background" option available
- [ ] App continues to dashboard without crash
- [ ] Upload and search work offline

### Scenario D: Low Disk Space
- [ ] Fill disk to < 5GB free
- [ ] Attempt model download
- [ ] Warning "Spazio disco insufficiente" appears
- [ ] Download blocked, user can skip

---

## INS-18: Auto-Update Flow

### Setup
- [ ] Install v0.1.0 of SMOT
- [ ] Push v0.2.0 tag to GitHub
- [ ] Configure Tauri updater endpoint

### Update Test
- [ ] Launch v0.1.0 app
- [ ] App detects new version
- [ ] Update notification appears
- [ ] Click "Aggiorna"
- [ ] Download progress shown
- [ ] App restarts with new version
- [ ] Verify all user data preserved (config.json, DB, documents)
- [ ] Verify version number updated

### Edge Cases
- [ ] Network drops during download → resume on reconnect
- [ ] Disk full during download → graceful error
- [ ] Downgrade protection