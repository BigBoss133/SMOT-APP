# SMOT — Guida Installazione Linux

> **Versione:** v0.1.0-beta | **File:** `.deb` / `.AppImage`

---

## Requisiti

### Dipendenze di sistema
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y libgtk-3-dev libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev build-essential pkg-config

# Fedora
sudo dnf install gtk3-devel webkit2gtk4.1-devel libappindicator-gtk3-devel librsvg2-devel

# Arch
sudo pacman -S gtk3 webkit2gtk-4.1 libappindicator-gtk3 librsvg
```

### Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

### Node.js 20+
```bash
node --version
sudo npm install -g n && sudo n 20 && hash -r   # se < v20
```

---

## Opzione 1: Scaricare .deb o .AppImage

> I file su https://github.com/BigBoss133/SMOT-APP/releases

### .deb (Debian/Ubuntu)
```bash
sudo dpkg -i smot-beta_0.1.0-beta_amd64.deb
sudo apt install -f
```

### .AppImage (tutte le distro)
```bash
chmod +x SMOT-Beta-0.1.0-beta-x86_64.AppImage
./SMOT-Beta-0.1.0-beta-x86_64.AppImage
```

---

## Opzione 2: Build da sorgente

```bash
git clone https://github.com/BigBoss133/SMOT-APP.git
cd SMOT-APP
git checkout release/v0.1.0-beta
cd smot-desktop
npm install
npm run tauri build
```

Trovi i file in:
```
smot-desktop/src-tauri/target/release/bundle/deb/smot-beta_0.1.0-beta_amd64.deb
smot-desktop/src-tauri/target/release/bundle/appimage/SMOT-Beta-0.1.0-beta-x86_64.AppImage
```

---

## Opzione 3: Modalita sviluppo

```bash
cd ~/SMOT-APP
git checkout release/v0.1.0-beta
git pull
cd smot-desktop
npm run tauri dev
```

---

## Troubleshooting

| Problema | Soluzione |
|----------|-----------|
| `pkg-config` error | `sudo apt install pkg-config libgtk-3-dev libwebkit2gtk-4.1-dev` |
| `Package cairo not found` | `sudo apt install libcairo2-dev` |
| `.AppImage` non parte | `chmod +x file.AppImage` |
| Schermata nera | `export WEBKIT_DISABLE_COMPOSITING_MODE=1 && npm run tauri dev` |
| `CustomEvent` error | Node.js vecchio: `sudo n 20 && hash -r` |
| `libwebkit2gtk-4.1-dev` non trovato | Ubuntu 22.04: `sudo add-apt-repository universe && sudo apt update` |
| Problemi Wayland | `export GDK_BACKEND=x11 && npm run tauri dev` |

---

## Note

- **Ubuntu 22.04+ / Debian 12+**: Supporto completo
- **Fedora 38+**: Supporto completo
- **Arch Linux**: Supporto completo
- **Ollama**: Opzionale
- **Code signing**: Non attivo per la beta

---

*Serve aiuto? https://github.com/BigBoss133/SMOT-APP/issues*