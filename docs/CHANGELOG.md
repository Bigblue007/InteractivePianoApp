# Changelog

Všechny významné změny v projektu budou zdokumentovány v tomto souboru.

Formát je založen na [Keep a Changelog](https://keepachangelog.com/cs/1.0.0/),
a tento projekt se drží [Semantic Versioning](https://semver.org/lang/cs/).

## [Unreleased]

### Přidáno
- (Zde budou nové funkce, které ještě nejsou v release)

### Změněno
- (Zde budou změny v existujících funkcích)

### Opraveno
- (Zde budou opravy bugů)

---

## [0.1.1] - 2025-12-11

### Přidáno
- **DX7 Modern elektrické piano** - Nový syntetický nástroj s FM synthesis charakterem
  - Bright, metallic zvuk s rychlým attackem a vysokým sustainem
  - Simulace FM synthesis pomocí více oscilátorů (carrier, modulator, harmonické)
  - High-pass filtr a resonance boost pro charakteristický DX7 sound
- **Výběr nástrojů** - Možnost přepínání mezi Piano a DX7 Modern v dropdownu

### Změněno
- **Vylepšený piano zvuk** - Výrazně vylepšená kvalita zvuku akustického piana:
  - 6 harmonických místo 4 pro bohatší spektrum
  - Inharmonicity (neharmoničnost strun) pro realističtější zvuk
  - Velocity-sensitive parametry (attack, decay, sustain, gain)
  - Exponenciální decay aproximace pro přirozenější pokles
  - Dynamické low-pass a high-shelf filtry podle velocity a MIDI noty
  - Delší doba přehrávání pro nižší noty (2-5 sekund)
- **InstrumentSelector** - Automaticky načítá nástroj při změně výběru
- **SoundFontEngine** - Podpora syntetických nástrojů (`synthetic:piano`, `synthetic:dx7`)

### Technické detaily
- **Piano synthesis**: Additive synthesis s 6 harmonickými, inharmonicity factor 0.01%
- **DX7 synthesis**: FM synthesis simulace s carrier (square), modulator (2.5x freq), harmonické
- **Filtry**: Dynamické low-pass (3000-8000 Hz) a high-shelf (-3dB) pro piano
- **Envelope**: Exponenciální decay aproximace pomocí 10 lineárních segmentů (piano), 8 segmentů (DX7)

---

## [0.1.0] - 2025-12-11

### Přidáno
- **Základní architektura** - React + TypeScript, Vite, Zustand, modulární struktura
- **Zvukový engine** - SimpleSoundFontEngine s Web Audio API, polyfonie, sustain pedál
- **MIDI podpora** - Web MIDI API, MIDI Manager, automatická detekce zařízení
- **Interaktivní klaviatura** - SVG renderování, 88 kláves (A0-C8), pointer events, responzivní design
- **Detekce akordů** - @tonaljs/tonal, slash akordy, real-time detekce
- **Notový zápis** - VexFlow, houslový a basový klíč, křížky, oktávové značky (8va/8vb)
- **UI komponenty**:
  - AudioInitButton s automatickou inicializací
  - InstrumentSelector pro výběr soundfontu
  - MIDIConnector pro připojení MIDI zařízení
  - ChordPanel pro zobrazení detekovaného akordu
  - ScoreView pro zobrazení notové osnovy
  - ChordSelector s transpozicí oktáv a přehráváním
  - NotationSelector pro přepínání mezi jazz a klasickou notací
  - WelcomeDialog pro uvítání při startu
  - AudioManager pro správu audio playback
- **Notační standardy** - Jazz (C místo CM) a klasická notace (CM), normalizace názvů akordů
- **Grafické vylepšení** - Gradient pozadí, animované logo, vylepšené panely
- **HTTPS dev server** - Script `npm run dev:https` pro vývoj s HTTPS

### Změněno
- **Přejmenování aplikace** - Z "Interactive Piano App" na "Harmonia"
- **UI layout** - Rozdělení na 3 části nad klaviaturou (detekovaný akord, ovládací prvky, výběr akordu)
- **Zvětšení klaviatury** - O 30% (KEY_WIDTH: 20 → 26, KEY_HEIGHT: 120 → 156)
- **Fonty** - Všechny fonty zvětšeny o 30%
- **Sjednocení dropdownů** - Stejný layout, velikost a zarovnání pro všechny dropdowny

### Opraveno
- Duplicitní deklarace `setInitialized` v AudioInitButton
- Nekonečný tón při kliknutí na klávesu (oprava `noteOff()`)
- Prázdná notová osnova (oprava délky noty z 'q' na 'w')
- Duplicitní klíče v React (kontrola existence soundfontu)
- Nesprávné umístění kláves (přepracování logiky výpočtu pozic)
- Klaviatura uříznutá zprava (dynamické přizpůsobení šířky)
- Černé klávesy nešly klikat (oprava `getMidiFromPosition`)
- Chybějící křížky v notovém zápisu (explicitní přidání `Accidental('#')`)
- MIDI připojení - ReferenceError require is not defined
- Neviditelný výběr v selectech (tmavé pozadí se světlým textem)
- Nesprávná detekce akordů v obratech (skórovací systém, slash akordy)
- Nezobrazování not v basovém klíči (oprava pozic, zvýšení výšky rendereru)
- Zasekávání zvuku při rychlém klikání (`stopNoteImmediately()`)
- UI layout se rozbíjel při připojení MIDI (flex-direction: column)
- Duplicitní deklarace `normalizeChord` v ChordSelector
- HTTPS dev server script (`npm run dev -- --https` → `npm run dev:https`)

### Technické detaily

#### Struktura projektu
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
│   ├── NotationSelector/
│   ├── WelcomeDialog/
│   └── AudioManager/
├── services/        # Business logika
│   ├── audio/       # Zvukový engine
│   ├── midi/        # MIDI handling
│   ├── chord/       # Detekce akordů
│   └── score/       # Notový zápis
├── stores/          # Zustand stores
│   ├── usePianoStore.ts
│   ├── useAudioStore.ts
│   ├── useMIDIStore.ts
│   ├── useNotationStore.ts
│   ├── useSongLibraryStore.ts (připraveno)
│   └── useChordLibraryStore.ts (připraveno)
├── utils/           # Pomocné funkce
└── types/           # TypeScript typy
```

#### Použité knihovny
- **react** ^18.2.0
- **@tonaljs/tonal** ^4.10.0 - Hudební teorie
- **vexflow** ^4.0.3 - Notový zápis
- **zustand** ^4.4.7 - State management
- **read-wasm-sf2** ^1.0.0 - Soundfont loader

#### Omezení a poznámky
- **Soundfont engine**: Aktuálně používá OscillatorNode jako placeholder. Pro plnou podporu sf2 je potřeba integrovat TinySoundFont WASM.
- **Web MIDI API**: Vyžaduje HTTPS v produkci (vývoj na localhost funguje)
- **Audio inicializace**: Vyžaduje uživatelské gesto (klik)
- **Browser support**: Chrome/Edge mají plnou podporu, Safari novější verze, Firefox omezená podpora

---

*Dokument vytvořen: 11. 12. 2025*  
*Poslední aktualizace: 11. 12. 2025*
