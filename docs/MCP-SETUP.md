# 🧠 OpenCode MCP & Tools — Guida per il Team SMOT

> **Ultimo aggiornamento**: 2026-05-09
> **Config file**: `~/.config/opencode/opencode.json`
> **Backup**: `opencode.json.backup.1778349045`

---

## 📋 MCP Installate (15 totali, 14 attive)

### 🔍 Code Intelligence

| MCP | Tipo | Descrizione | Comando |
|-----|------|-------------|---------|
| **context7** | remote | Documentazione live delle librerie (Next.js, React, Tauri, ecc.) | Auto (chiamato on-demand) |
| **sigmap** | npx | 97% token reduction — firma compressa del progetto invece di leggere ogni file | `npx sigmap --setup` (una volta) |
| **sequential-thinking** | npx | Ragionamento strutturato multi-step | Auto |
| **grep** | remote | Code search su GitHub pubblico | Auto |

### 🗄️ Dati & Storage

| MCP | Tipo | Descrizione | Comando |
|-----|------|-------------|---------|
| **sqlite** | npx | Query dirette su database SQLite | Auto |
| **memory** | npx | Knowledge graph persistente tra sessioni | Auto |
| **filesystem** | npx | Operazioni su file system | Auto |

### 🔧 Dev Tools

| MCP | Tipo | Descrizione | Setup richiesto |
|-----|------|-------------|-----------------|
| **github** | docker | PR, issue, workflow, repo management | ⚠️ GitHub Token in `~/.config/opencode/.env` |
| **git** | docker | Operazioni Git locali | Nessuno |
| **semgrep** | local | Security scanning statico (5000+ regole) | `pip install semgrep` in venv |
| **firecrawl** | docker | Web scraping per test import documenti | Nessuno |

### 🧪 Testing & Browser

| MCP | Tipo | Descrizione |
|-----|------|-------------|
| **playwright** | docker | Automazione browser, E2E testing |
| **fetch** | docker | HTTP requests |
| **time** | docker | Utility timezone/date |

### ❌ Disabilitata

| MCP | Motivo |
|-----|--------|
| **duckduckgo** | Sostituita da Context7 + built-in web search |

---

## 🚀 Setup Rapido (nuovo membro del team)

### 1. Prerequisiti

```bash
# Node.js 18+
node --version

# Docker (per github, playwright, git, fetch, time, firecrawl)
docker --version

# Python (per semgrep venv)
python3 --version
```

### 2. Installa OpenCode

```bash
npm install -g opencode
```

### 3. Copia la configurazione

```bash
# Copia il file di config
cp ~/.config/opencode/opencode.json ~/.config/opencode/opencode.json

# Crea il file .env con i token (NON COMMITTARE!)
# Il GitHub token va richiesto al team lead
echo 'GITHUB_TOKEN=ghp_...' > ~/.config/opencode/.env
echo 'GITHUB_PERSONAL_ACCESS_TOKEN=ghp_...' >> ~/.config/opencode/.env
chmod 600 ~/.config/opencode/.env
```

### 4. Attiva Sigmap sul progetto

```bash
cd SMOT-APP
npx sigmap --setup
# Genera .github/copilot-instructions.md con le firme del progetto
# Installa hook git per rigenerare automaticamente a ogni commit
```

### 5. Installa Semgrep (opzionale)

```bash
python3 -m venv /tmp/semgrep-venv
/tmp/semgrep-venv/bin/pip install semgrep
ln -sf /tmp/semgrep-venv/bin/semgrep ~/.local/bin/semgrep
```

### 6. Pull Docker images

```bash
docker pull ghcr.io/github/github-mcp-server
docker pull mcp/firecrawl
docker pull mcp/playwright
docker pull mcp/git
```

### 7. Verifica

```bash
# Conta MCP installate
python3 -c "import json; c=json.load(open('$HOME/.config/opencode/opencode.json')); m=c['mcp']; print(f'MCP: {len(m)} totali, {sum(1 for v in m.values() if v.get(\"enabled\"))} attive')"

# Dovrebbe stampare: MCP: 15 totali, 14 attive
```

---

## 🛠️ OpenCode Skills Disponibili

| Skill | Quando usarla |
|-------|---------------|
| **prompt-master** | Sempre (mandatorio) — ottimizza i prompt |
| **testing** | Dopo modifiche — genera e mantiene test |
| **code-review** | Dopo PR — review strutturata |
| **git-workflow** | Gestione branch, commit convenzionali |
| **react-best-practices** | UI/UX branch |
| **12-principles-of-animation** | Animazioni Graph View |
| **shadcn** | Componenti UI nuovi |
| **playwright-cli** | E2E testing |
| **vite** | Build optimization |

---

## 📊 Sigmap Usage

```bash
# Genera la mappa del progetto (una tantum)
npx sigmap

# Genera + watch per cambiamenti
npx sigmap --watch

# Setup completo (genera + git hook + watch)
npx sigmap --setup

# Report riduzione token
npx sigmap --report

# Dashboard performance
npx sigmap --dashboard
```

**Output**: `.github/copilot-instructions.md` — contiene firme compresse di tutti i file del progetto. L'AI legge questo invece del codice sorgente intero.

---

## ⚠️ Security Notes

1. **GitHub Token**: NON committare `~/.config/opencode/.env`. È in `.gitignore` globale.
2. **Rotazione token**: I token GitHub vanno ruotati ogni 90 giorni.
3. **API keys**: Il file `opencode.json` contiene API keys — non condividerlo in chiaro.
4. **Backup**: Prima di modificare `opencode.json`, sempre fare backup:
   ```bash
   cp ~/.config/opencode/opencode.json ~/.config/opencode/opencode.json.backup.$(date +%s)
   ```

---

## 🔗 Risorse

- [OpenCode Docs](https://opencode.ai)
- [MCP Registry](https://mcpservers.org) — 1891+ server
- [Context7](https://context7.com) — Documentazione live
- [Sigmap GitHub](https://github.com/manojmallick/sigmap)
- [Awesome MCP Servers](https://github.com/wong2/awesome-mcp-servers)
