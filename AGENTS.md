# Harmonia Desktop - Agent Rules

## Tech Stack
- **Runtime:** Electron 33+ (Chromium)
- **Build:** electron-vite 2.x
- **Frontend:** React 18 + TypeScript 5
- **State:** Zustand 4.x
- **Audio:** Web Audio API + Node.js fs (přes preload bridge)
- **Music Theory:** @tonaljs/tonal
- **Notation:** VexFlow 4.x
- **Packaging:** electron-builder 25.x

## MCP Integrace

### Context7 MCP — Ověřování API
Před generováním kódu, který využívá API jakékoli knihovny ze stacku,
**povinně** ověř aktuální API přes Context7 MCP:
1. Zavolej `resolve-library-id` s názvem knihovny a dotazem
2. Vyber nejlepší match (preferuj oficiální zdroje, vyšší benchmark)
3. Zavolej `query-docs` s vybraným ID a konkrétním dotazem
4. Použij odpověď z Context7 jako **autoritativní zdroj** — má přednost
   před trénovanými znalostmi modelu

> ⚠️ NEPOUŽÍVEJ lokální `node_modules` jako primární referenci API.
> Context7 poskytuje aktuální dokumentaci včetně breaking changes,
> deprecations a nových API, které v node_modules nemusí být viditelné.

**Typické dotazy pro Context7:**
- Electron: `BrowserWindow options`, `contextBridge API`, `ipcMain patterns`
- electron-vite: `config structure`, `HMR setup`, `preload externalization`
- electron-builder: `extraResources config`, `NSIS options`, `auto-updater setup`
- Zustand: `persist middleware`, `store patterns with Electron`
- VexFlow: `Renderer API changes`, `StaveNote formatting`
- @tonaljs/tonal: `chord detection API`, `interval calculation`

### GitHub MCP — Správa repozitáře
- Vytváření větví, issues, pull requestů
- Synchronizace kódu
- Code review workflow

## Coding Standards
- Striktní TypeScript (no `any`)
- Funkcionální React komponenty (hooks only)
- Conventional Commits (feat:, fix:, chore:, docs:, UI/style:, refactor:)

## Post-Task Workflow (Definition of Done)
1. Zeptej se na update dokumentace (docs/PROGRESS.md, README.md, ARCHITECTURE.md)
2. Navrhni commit message dle Conventional Commits
3. **NIKDY** neprováděj `git push` bez explicitního potvrzení
4. Pokud uživatel řekne "later", zapiš do docs/PROGRESS.md jako pending

## Zkratky
- `done` → Dokumentační kolečko + commit + push (po schválení)
- `checkpoint` → Update docs/PROGRESS.md + ARCHITECTURE.md (bez commitu)
- `sync` → Synchronizace s GitHub přes MCP
