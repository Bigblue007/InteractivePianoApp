# Harmonia - Interaktivní webová klaviatura

**Harmonia** je webová aplikace pro muzikanty s interaktivní klaviaturou, která vizualizuje stisknuté klávesy, přehrává tóny, detekuje akordy a zobrazuje noty v notovém zápisu.

## Funkce

- 🎹 Interaktivní SVG klaviatura (myš/touch)
- 🎵 Připojení přes MIDI (včetně sustain pedálu)
- 🎼 Detekce akordů pomocí @tonaljs/tonal
- 📝 Zobrazení not v notové osnově (VexFlow)
- 🔊 Podpora sf2 soundfontů (ZanderJa)
- 🎛️ Výběr nástroje

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

```bash
npm run dev
```

Aplikace poběží na `http://localhost:3000`

**Poznámka k MIDI:** Pro připojení MIDI zařízení doporučujeme použít **Chrome** nebo **Edge**. Firefox má omezenou podporu a vyžaduje add-on. Pokud máte problémy s MIDI, zkuste spustit dev server s HTTPS:

```bash
npm run dev -- --https
```

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
│   ├── InstrumentSelector/
│   ├── MIDIConnector/
│   └── AudioInitButton/
├── services/        # Business logika
│   ├── audio/      # Zvukový engine
│   ├── midi/       # MIDI handling
│   ├── chord/      # Detekce akordů
│   └── score/      # Notový zápis
├── stores/         # Zustand stores
├── hooks/          # Custom React hooks
├── utils/          # Pomocné funkce
└── types/          # TypeScript typy
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
- **[IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)** - Plán implementace a aktuální stav projektu
- **[interactive-piano-def.md](docs/interactive-piano-def.md)** - Původní technický průvodce projektu

## Budoucí rozšíření

- Ovládání klaviatury klávesnicí počítače
- Chord Inversions v výběru akordů
- Knihovna písniček s akordy
- Knihovna akordů
- Záznam a export do MIDI
- Metronom
- Trénink mód (škály, intervaly)

Viz [docs/TODO.md](docs/TODO.md) pro detailní seznam plánovaných funkcí.

## Licence

Viz soubory soundfontů pro jejich licenční podmínky.


