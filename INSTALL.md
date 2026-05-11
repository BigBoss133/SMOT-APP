# SMOT — Guide Installazione

> Scegli il tuo sistema operativo:

| OS | Guida | Formato |
|----|-------|---------|
| 🍎 **macOS** | [`INSTALL-macOS.md`](INSTALL-macOS.md) | `.dmg` |
| 🪟 **Windows** | [`INSTALL-Windows.md`](INSTALL-Windows.md) | `.exe` |
| 🐧 **Linux** | [`INSTALL-Linux.md`](INSTALL-Linux.md) | `.deb` / `.AppImage` |

---

## Build rapida (tutti gli OS)

```bash
git clone https://github.com/BigBoss133/SMOT-APP.git
cd SMOT-APP
git checkout release/v0.1.0-beta
cd smot-desktop
npm install
npm run tauri build
```

---

## Requisiti minimi

| OS | Spazio | RAM |
|----|--------|-----|
| macOS 12+ | 500 MB | 4 GB |
| Windows 10+ | 500 MB | 4 GB |
| Linux (GTK) | 500 MB | 4 GB |

---

[🍎 macOS](INSTALL-macOS.md) | [🪟 Windows](INSTALL-Windows.md) | [🐧 Linux](INSTALL-Linux.md)
