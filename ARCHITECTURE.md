# Harmonia Desktop - Architecture Map

Strukturální mapa projektu po migraci na Electron desktop:

```text
harmonia-desktop/
├── src/
│   ├── main/               # Electron Main process (Node.js)
│   │   └── index.ts        # App lifecycle, IPC handlers, menu
│   ├── preload/            # Preload scripts (Bridge)
│   │   ├── index.ts        # contextBridge API
│   │   └── types.d.ts      # ElectronAPI type declarations
│   └── renderer/           # React frontend
│       ├── src/
│       │   ├── components/  # 12+ React komponent (Piano, Score, Chord...)
│       │   ├── services/    # Business logika
│       │   │   ├── audio/   # SoundFontEngine, SimpleSampler, NativeSampleLoader
│       │   │   ├── midi/    # MIDI input handling
│       │   │   ├── chord/   # Detekce akordů (Tonal.js)
│       │   │   └── score/   # Notový zápis (VexFlow)
│       │   ├── stores/      # Zustand state management (6 stores)
│       │   ├── data/        # Statická data (písně, presety)
│       │   ├── config/      # Instrument presets, version
│       │   ├── types/       # TypeScript definice
│       │   └── utils/       # Utility funkce
│       └── index.html       # Renderer entry point
├── resources/               # Electron resources
│   ├── icon.ico             # Windows ikona
│   ├── icon.png             # Linux ikona
│   ├── samples/             # Základní sample set (bundled)
│   └── soundfonts/          # SF2 soundfonty (bundled)
├── docs/                    # Dokumentace projektu
│   ├── CHANGELOG.md
│   ├── DEPLOYMENT.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── TODO.md
│   ├── VERSIONING.md
│   └── PROGRESS.md          # Dynamický log stavu vývoje
├── electron.vite.config.ts  # electron-vite konfigurace
├── electron-builder.yml     # Build/packaging konfigurace
├── vite.config.ts           # Web-only Vite konfigurace (zachováno)
├── CLAUDE.md
├── AGENTS.md
└── ARCHITECTURE.md

```
