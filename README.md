# Harmonia - Interaktivní webová klaviatura

> **Poznámka:** Tato aplikace byla vytvořena pomocí [Cursor](https://cursor.sh/) - AI-powered editoru pro vývojáře.

**Harmonia** je webová aplikace pro muzikanty s interaktivní klaviaturou, která vizualizuje stisknuté klávesy, přehrává tóny, detekuje akordy a zobrazuje noty v notovém zápisu.

## Funkce

- 🎹 Interaktivní SVG klaviatura (myš/touch)
- 🎵 Připojení přes MIDI (včetně sustain pedálu)
- 🎼 Detekce akordů pomocí @tonaljs/tonal
- 📝 Zobrazení not v notové osnově (VexFlow)
- 🔊 Podpora sf2 soundfontů (ZanderJa) a audio samplů
- 🎛️ Výběr nástroje (Piano, DX7 Modern, Piano Acoustic)
- 📚 Knihovna písní s akordy a sekcemi (verse, chorus, bridge, intro, outro)
- 🎵 Přehrávání akordů z knihovny písní
- 🛠️ Samostatný editor písní pro vývojáře (song-editor/)

## Technologie

- **React 18** + **TypeScript**
- **Vite** - build tool
- **Zustand** - state management
- **@tonaljs/tonal** - hudební teorie a detekce akordů
- **VexFlow** - notový zápis
- **Web Audio API** - zvukový engine
- **Web MIDI API** - MIDI vstup

## Instalace

```bash
npm install
```

## Spuštění

### Vývoj

```bash
npm run dev
```

Aplikace poběží na `http://localhost:3000`

### Produkční build

```bash
npm run build
npm run preview
```

### Publikace

Pro návod na publikaci aplikace viz [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

**Poznámka k MIDI:** Pro připojení MIDI zařízení doporučujeme použít **Chrome** nebo **Edge**. Firefox má omezenou podporu a vyžaduje add-on. Pokud máte problémy s MIDI, zkuste spustit dev server s HTTPS:

```bash
npm run dev:https
```

## Vytváření Release

Pro vytvoření nového release použijte automatický script:

```bash
npm run release
```

Script automaticky commitne změny, pushne na GitHub a vytvoří tag. Více informací v [docs/VERSIONING.md](docs/VERSIONING.md).

## Použití

1. **Zapněte zvuk** - klikněte na tlačítko "Zapnout zvuk" (vyžaduje uživatelské gesto)
2. **Vyberte nástroj** - v dropdownu vyberte soundfont (výchozí: Piano)
3. **Připojte MIDI** (volitelné) - klikněte na "Připojit MIDI zařízení" a vyberte zařízení
4. **Hrajte** - klikněte na klávesy myší nebo použijte MIDI klávesnici

## Struktura projektu

```
src/
├── components/       # React komponenty
│   ├── PianoKeyboard/
│   ├── ScoreView/
│   ├── ChordPanel/
│   ├── ChordSelector/
│   ├── InstrumentSelector/
│   ├── MIDIConnector/
│   ├── AudioInitButton/
│   └── SongLibrary/  # Knihovna písní
├── services/        # Business logika
│   ├── audio/      # Zvukový engine
│   ├── midi/       # MIDI handling
│   ├── chord/      # Detekce akordů
│   └── score/      # Notový zápis
├── stores/         # Zustand stores
├── data/           # Data (písně, presety)
├── utils/          # Pomocné funkce
└── types/          # TypeScript typy

song-editor/         # Samostatný editor písní (vývojářský nástroj)
├── src/
│   ├── components/  # Komponenty editoru
│   ├── stores/     # Editor store
│   └── utils/      # Parser a exporter
```

## Soundfonty

Soubory sf2 umístěte do `public/soundfonts/`. Výchozí soundfont je `Piano.SF2`.

Pro přidání dalších soundfontů:
1. Vložte soubor do `public/soundfonts/`
2. V kódu přidejte do `useAudioStore` (nebo přes UI v budoucí verzi)

## Podpora prohlížečů

- **Chrome/Edge** (desktop) - plná podpora Web MIDI API
- **Safari** - novější verze podporují Web MIDI API
- **Firefox** - omezená podpora Web MIDI API (fallback na UI klávesnici)

## Poznámky

- Pro plnou podporu sf2 souborů je potřeba integrovat TinySoundFont WASM (aktuálně používá jednoduchý OscillatorNode jako placeholder)
- Web MIDI API vyžaduje HTTPS v produkci (vývoj na localhost funguje)
- Audio inicializace vyžaduje uživatelské gesto (klik)

## Dokumentace

- **[CHANGELOG.md](docs/CHANGELOG.md)** - Podrobný seznam všech změn, oprav a řešených problémů
- **[VERSIONING.md](docs/VERSIONING.md)** - Návod na verzování a vytváření releases
- **[IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)** - Plán implementace a aktuální stav projektu
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Návod na publikaci aplikace
- **[TODO.md](docs/TODO.md)** - Seznam plánovaných funkcí a úkolů
- **[interactive-piano-def.md](docs/interactive-piano-def.md)** - Původní technický průvodce projektu

## Vývoj

Tato aplikace byla vytvořena pomocí [Cursor](https://cursor.sh/) - AI-powered editoru pro vývojáře, který umožňuje efektivní vývoj pomocí AI asistenta.

## Editor písní

Projekt obsahuje samostatný editor písní (`song-editor/`) určený pro vývojáře k úpravě song library:

- Načítání písní z TypeScript souboru (`src/data/popularSongs.ts`)
- Editace písní s drag & drop sekcemi
- Validace akordů
- Export do TypeScript formátu pro kopírování do `popularSongs.ts`

**Spuštění editoru:**
```bash
cd song-editor
npm install
npm run dev
```

Editor poběží na `http://localhost:3001`

## Budoucí rozšíření

- Ovládání klaviatury klávesnicí počítače
- Chord Inversions v výběru akordů
- Knihovna akordů
- Záznam a export do MIDI
- Metronom
- Trénink mód (škály, intervaly)

Viz [docs/TODO.md](docs/TODO.md) pro detailní seznam plánovaných funkcí.

## Licence

Tento projekt je licencován pod [MIT License](LICENSE).

### Třetí strany

Projekt používá následující open-source knihovny:
- **React** - MIT License
- **@tonaljs/tonal** - MIT License
- **VexFlow** - MIT License
- **Zustand** - MIT License
- **TypeScript** - Apache License 2.0
- **Vite** - MIT License
- A další (viz [LICENSE](LICENSE) pro kompletní seznam)

Soundfont soubory (SF2) mohou mít vlastní licenční podmínky. Viz jednotlivé soundfont soubory pro jejich specifické licence.


