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

## [0.3.3] - 2025-12-15

### Přidáno
- **Detekce mobilních telefonů** - Aplikace nyní detekuje mobilní telefony (ne tablety) a zobrazuje informační zprávu
  - Komponenta `MobileNotSupported` s animovanou grafikou (klaviatura a hudební noty)
  - Utilita `deviceDetection.ts` pro rozlišení mobilních telefonů od tabletů
  - Zpráva doporučuje použít aplikaci na desktopu nebo tabletu

### Změněno
- **UX pro mobilní zařízení** - Na mobilních telefonech se místo aplikace zobrazí informační zpráva o nepodpořeném zařízení

---

## [0.3.2] - 2025-12-14

### Přidáno
- **Editor písní** - Samostatná aplikace pro vývojáře k úpravě song library
  - Načítání písní z TypeScript souboru (`popularSongs.ts`)
  - Editace písní s drag & drop sekcemi
  - Inline editace akordů s validací
  - Export do TypeScript formátu pro kopírování do `popularSongs.ts`
  - Export/Import JSON souborů
  - Validace akordů pomocí @tonaljs/tonal
  - Lokální ukládání do localStorage

### Změněno
- **Dokumentace** - Aktualizována dokumentace s informací o Cursor a novém editoru písní
  - Přidána informace o Cursor do README.md, LICENSE, CHANGELOG.md a IMPLEMENTATION_PLAN.md
  - Přidána sekce o editoru písní do README.md

---

## [0.3.1] - 2025-12-13

### Změněno
- **Detekovaný akord** - Přidán placeholder "-" pro zobrazení, když není detekován žádný akord
- **Velikost písma detekovaného akordu** - Sjednocena velikost písma s výběrem akordu (použití stejné třídy `chord-name`)
- **Pořadí nástrojů** - Piano (synth) je nyní první a výchozí nástroj, DX7 Modern (synth) je druhé, Piano (Acoustic) je poslední

### Opraveno
- **CSS selektory** - Opravena nekonzistence mezi TSX třídou `chord-name` a CSS selektorem `chord-name-display`
- **Styling placeholderu** - Placeholder "-" má nyní správně ztlumený vzhled (opacity 0.5, normal font-weight)

---

## [0.3.0] - 2025-12-13

### Přidáno
- **Knihovna písniček** - Kompletní systém pro správu a prohlížení písní
  - Vyhledávání písní podle názvu a interpreta (case-insensitive)
  - Zobrazení seznamu písní s výběrem
  - Detail písně s chord progression
  - Podpora sekcí (verse, chorus, bridge, intro, outro) pro strukturované zobrazení akordů
  - 20 předpřipravených populárních písní
  - Klikatelné akordy s přehráváním při držení tlačítka myši
  - Zobrazení akordů na klaviatuře a v notové osnově při kliknutí
  - Horizontální layout akordů jako tlačítka
  - Tlačítko "Zpět" pro návrat do seznamu písní
- **SongLibrary komponenta** - Hlavní komponenta pro knihovnu písniček
- **ChordProgression komponenta** - Zobrazení akordů s podporou sekcí
- **Utility funkce** - `chordToMidiNotes` pro konverzi názvu akordu na MIDI noty

### Změněno
- **UI layout knihovny písniček** - Kompaktnější design pro lepší využití prostoru
  - Zmenšené paddingy a mezery
  - Název písně a interpret na jednom řádku (název tučně)
  - Odstraněn text "Chord Progression:" pro čistší vzhled
  - Scrollování pouze v části s akordy (pokud je potřeba)
- **ChordProgression** - Horizontální layout místo vertikálního
  - Akordy zobrazeny jako tlačítka vedle sebe
  - Podpora sekcí s hlavičkami (Sloka, Refrén, Bridge, Intro, Outro)
  - Automatické číslování sekcí (Verse 1, Verse 2, atd.)
- **Přehrávání akordů** - Hold mouse button místo jednoho kliknutí
  - Akord se přehrává při držení tlačítka myši
  - Přehrávání se zastaví při uvolnění tlačítka
  - Podpora touch zařízení

### Opraveno
- **Zobrazení detailu písně** - Opraveno prázdné okno při výběru písně (chybějící props)
- **Zvýraznění akordů** - Opraveno zvýraznění správného akordu při duplikátech (použití indexu místo findIndex)

---

## [0.2.1] - 2025-12-13

### Přidáno
- **Loading indikátor pro načítání samplů** - Vizuální feedback při načítání akustického piana
  - Animovaný spinner s textem "Načítání samplů..."
  - Gradient pozadí s modrým odstínem
  - Fade-in animace při zobrazení
  - Dropdown je disabled během načítání pro lepší UX

### Změněno
- **Pořadí nástrojů v dropdownu** - Syntetické nástroje nahoře, akustické piano dole
  - DX7 Modern (synth) - první
  - Piano (synth) - druhý
  - Piano (Acoustic) - poslední
- **Označení syntetických nástrojů** - Přidáno "(synth)" k syntetickým nástrojům pro lepší rozlišení
  - `DX7 Modern` → `DX7 Modern (synth)`
  - `Piano` → `Piano (synth)`
- **InstrumentSelector** - Vylepšené UX s loading indikátorem a explicitním řazením nástrojů
- **UI layout** - Přepracování layoutu horních panelů:
  - Prohození levého a prostředního panelu (dropdowny vlevo, detekovaný akord uprostřed)
  - Prostřední sekce s detekovaným akordem má poloviční výšku
  - Název aplikace přesunut nad prostřední sekci s větší velikostí (2x)
  - Tlačítka transpozice akordů změněna z šipek na text ("+ oct." / "- oct.")
  - MIDI tlačítko zarovnáno s dropdowny
- **Zvýraznění kláves** - Sjednocení barvy zvýraznění pro bílé i černé klávesy (zlatá barva)
- **Padding a mezery** - Snížení paddingů a mezer pro kompaktnější layout

### Opraveno
- **Transpozice akordů** - Opraven limit pro transpozici dolů na -3 oktávy (bylo -2)
- **Zobrazení offsetu oktávy** - Odstraněno zobrazení offsetu, tlačítka mají text "+ oct." / "- oct."
- **Zvýraznění černých kláves** - Opraveno prosvítání černé čáry z bílé klávesy při zvýraznění
- **Velikost MIDI připojení** - Fixní výška pro konzistentní velikost před i po připojení
- **Propisování stínu** - Opraveno propisování stínu a backdrop-filter z horních panelů do spodního okna
- **Velikost okna detekovaného akordu** - Snížena na polovinu s zarovnáním na spodní okraj

---

## [0.2.0] - 2025-12-13

### Přidáno
- **Sample-based akustické piano** - Nový sampler engine s podporou skutečných audio samplů
  - Podpora TKI samplů s Round Robin (RR1, RR2, RR3) pro variaci
  - Velocity layers (Level1 pro soft, Level2 pro hard údery)
  - Release Trigger samply pro přirozený konec tónů
  - Pedal samply (PD/PU) pro sustain pedál
  - Automatické ořezání pauzy na začátku samplů pro eliminaci latence
  - Podpora všech existujících samplů (24 not, ~214 samplů celkem)
- **SampleLoader** - Singleton třída pro načítání a cachování audio samplů
- **SimpleSampler** - Sampler engine s podporou pitch shifting, Round Robin a Release Trigger
- **Automatické ořezání pauzy** - Eliminuje ticho na začátku samplů pro okamžitý start
- **Script pro ořezání samplů** - `npm run trim-samples` pro optimalizaci délky samplů

### Změněno
- **SoundFontEngine** - Refaktorován na dispatcher pro syntetické nástroje a sampler
- **InstrumentPreset** - Nová struktura pro sampler-based nástroje s konfigurací samplů
- **Vite middleware** - Vylepšené servování MP3 souborů s '#' v názvech
- **URL encoding** - Explicitní kódování '#' jako '%23' pro správné načítání samplů
- **MIDI mapping** - Opraven offset pro správné mapování samplů (samply jsou označené o oktávu níž)

### Opraveno
- **Latence samplů** - Vypnuto lookahead scheduling pro okamžité přehrávání
- **Loopování samplů** - Vypnuto pro přirozené přehrávání dlouhých samplů
- **Ořezání pauzy** - Automatické ořezání ticha na začátku samplů
- **UI bug** - Opraveno zobrazení "loaded" checkmarku při výběru nástrojů
- **MP3 dekódování** - Vylepšené error handling a retry mechanismus
- **MIME types** - Správné servování MP3 souborů s Content-Type: audio/mpeg
- **Pitch mapping** - Opraven offset +12 pro správné mapování samplů na MIDI noty

### Technické detaily
- **Sample format**: TKI_{Note}{Octave}_{Type}_{RR}.mp3
- **Round Robin**: Cyklické střídání RR1, RR2, RR3 pro každou notu
- **Pitch shifting**: Max ±2.5 oktávy pomocí playbackRate
- **Automatic silence trimming**: Detekce a ořezání ticha na začátku samplů
- **Sample caching**: Všechny samply jsou cachované v paměti pro rychlý přístup

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
*Poslední aktualizace: 14. 12. 2025*

> **Poznámka:** Tato aplikace byla vytvořena pomocí [Cursor](https://cursor.sh/) - AI-powered editoru pro vývojáře.
