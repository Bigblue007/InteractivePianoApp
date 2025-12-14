# Plán implementace - Interaktivní webová klaviatura

*Datum vytvoření: 11. 12. 2025*  
*Poslední aktualizace: 14. 12. 2025*

> **Poznámka:** Tato aplikace byla vytvořena pomocí [Cursor](https://cursor.sh/) - AI-powered editoru pro vývojáře.

## Přehled

Tento dokument popisuje plán implementace MVP interaktivní webové klaviatury a jeho aktuální stav. Dokument je aktualizován podle skutečné implementace a porovnává původní plán se skutečností.

**Původní plán:** `interactive_piano_mvp_1a137d42.plan.md`  
**Technický průvodce:** [interactive-piano-def.md](interactive-piano-def.md)

---

## Původní požadavky

Podle původního plánu a [interactive-piano-def.md](interactive-piano-def.md) měla aplikace obsahovat:
- Interaktivní klaviaturu (myš/touch + MIDI)
- Přehrávání zvuků ze sf2 soundfontů (ZanderJa)
- Detekci akordů
- Zobrazení not v notové osnově
- Podporu sustain pedálu
- Rozšiřitelnou architekturu pro budoucí funkce (knihovna písniček, akordů)

---

## Technologický stack (plán vs. realita)

### Původní plán
- **Framework**: React 18+ s TypeScript
- **Build tool**: Vite
- **State management**: Zustand
- **Zvukový engine**: TinySoundFont WASM (přímá podpora sf2) + Web Audio API
- **MIDI**: Web MIDI API (nativní)
- **Hudební teorie**: @tonaljs/tonal
- **Notový zápis**: VexFlow
- **Styling**: CSS Modules nebo Tailwind CSS

### Skutečná implementace
- ✅ React 18 + TypeScript
- ✅ Vite
- ✅ Zustand
- ⚠️ SimpleSoundFontEngine s OscillatorNode (místo TinySoundFont WASM)
- ✅ Web MIDI API (nativní)
- ✅ @tonaljs/tonal
- ✅ VexFlow
- ✅ CSS Modules (vlastní CSS soubory)

**Odchylka:** Pro MVP jsme použili jednodušší audio engine s OscillatorNode místo TinySoundFont WASM. Struktura je připravena na budoucí integraci. TinySoundFont WASM nebyl integrován kvůli složitosti a časovým omezením MVP.

---

## Architektura (implementováno)

```
src/
├── components/          # React komponenty ✅
│   ├── PianoKeyboard/  # SVG klaviatura ✅
│   ├── ScoreView/      # VexFlow notový zápis ✅
│   ├── ChordPanel/     # Zobrazení akordu ✅
│   ├── InstrumentSelector/ # Výběr soundfontu ✅
│   ├── MIDIConnector/  # MIDI připojení ✅
│   └── AudioInitButton/ # Inicializace audio ✅
├── services/           # Business logika ✅
│   ├── audio/          # Zvukový engine ✅
│   │   ├── SoundFontEngine.ts ✅
│   │   ├── AudioContextManager.ts ✅
│   │   └── types.ts ✅
│   ├── midi/           # MIDI handling ✅
│   │   ├── MIDIManager.ts ✅
│   │   └── types.ts ✅
│   ├── chord/          # Detekce akordů ✅
│   │   └── ChordDetector.ts ✅
│   └── score/          # Notový zápis ✅
│       └── ScoreRenderer.ts ✅
├── stores/             # Zustand stores ✅
│   ├── usePianoStore.ts ✅
│   ├── useAudioStore.ts ✅
│   ├── useMIDIStore.ts ✅
│   ├── useSongLibraryStore.ts ✅ (připraveno)
│   └── useChordLibraryStore.ts ✅ (připraveno)
├── hooks/              # Custom React hooks
├── utils/              # Pomocné funkce ✅
│   ├── midi.ts ✅
│   └── notes.ts ✅
└── types/              # TypeScript typy ✅
```

---

## Implementační fáze (podle původního plánu)

### ✅ Fáze 1: Základní setup projektu
**Status:** Dokončeno

**Plán:**
- [x] Inicializace Vite projektu s React+TypeScript template
- [x] Instalace závislostí: `@tonaljs/tonal`, `vexflow`, `zustand`
- [ ] Nastavení TinySoundFont WASM (npm balíček nebo vlastní integrace) ⚠️
- [x] Základní struktura složek a TypeScript konfigurace

**Realita:**
- ✅ Vite projekt s React+TypeScript
- ✅ Závislosti nainstalovány
- ⚠️ TinySoundFont WASM nebyl integrován (použit OscillatorNode placeholder)
- ✅ Struktura složek vytvořena

**Výsledek:** Projekt je připraven k vývoji. Audio engine používá placeholder místo TinySoundFont WASM.

---

### ✅ Fáze 2: State management a core services
**Status:** Dokončeno

**Plán:**
- [x] Vytvoření Zustand stores (piano, audio, MIDI)
- [x] Implementace `SoundFontEngine` s TinySoundFont ⚠️
- [x] Implementace `MIDIManager` s Web MIDI API
- [x] Implementace `ChordDetector` s @tonaljs/tonal

**Realita:**
- ✅ Všechny stores vytvořeny (piano, audio, MIDI)
- ⚠️ SoundFontEngine používá OscillatorNode místo TinySoundFont WASM
- ✅ MIDIManager plně funkční
- ✅ ChordDetector implementován s podporou slash akordů

**Výsledek:** Všechny core services jsou funkční. Audio engine je připraven na budoucí integraci TinySoundFont WASM.

---

### ✅ Fáze 3: UI komponenty - klaviatura
**Status:** Dokončeno

**Plán:**
- [x] `PianoKeyboard` komponenta s SVG renderováním
- [x] Logika mapování pozice → MIDI
- [x] Zvýraznění kláves při stisku
- [x] Pointer events handling (mouse/touch)

**Realita:**
- ✅ PianoKeyboard s SVG renderováním 88 kláves (A0-C8)
- ✅ Správné mapování pozice → MIDI (opraveno během vývoje)
- ✅ Zvýraznění stisknutých kláves
- ✅ Pointer events (mouse/touch) s podporou drag
- ✅ Responzivní design (přizpůsobení šířce obrazovky) - dodatečně přidáno
- ✅ Zvětšení klaviatury o 30% - dodatečně přidáno

**Výsledek:** Plně funkční interaktivní klaviatura s responzivním designem.

---

### ✅ Fáze 4: UI komponenty - zobrazení
**Status:** Dokončeno

**Plán:**
- [x] `ScoreView` komponenta s VexFlow
- [x] `ChordPanel` komponenta pro zobrazení akordu
- [x] `InstrumentSelector` pro výběr nástroje
- [x] `MIDIConnector` pro připojení MIDI zařízení

**Realita:**
- ✅ ScoreView s VexFlow (houslový i basový klíč)
- ✅ ChordPanel s real-time detekcí akordů
- ✅ InstrumentSelector s podporou více soundfontů
- ✅ MIDIConnector s automatickou detekcí zařízení
- ✅ AudioInitButton (dodatečně přidáno pro lepší UX)
- ✅ Podpora křížků v notovém zápisu - dodatečně přidáno
- ✅ Oktávové značky (8va/8vb) - dodatečně přidáno

**Výsledek:** Všechny UI komponenty jsou implementovány s dodatečnými vylepšeními.

---

### ✅ Fáze 5: Integrace a audio inicializace
**Status:** Dokončeno

**Plán:**
- [x] `AudioInitButton` komponenta (vyžaduje uživatelské gesto)
- [x] Propojení všech komponent přes stores
- [x] Testování MIDI vstupu
- [x] Testování sf2 načítání a přehrávání

**Realita:**
- ✅ AudioInitButton implementován
- ✅ Všechny komponenty propojeny přes Zustand stores
- ✅ MIDI vstup testován a funkční (včetně sustain pedálu)
- ⚠️ sf2 načítání funguje (data se načítají), ale nepoužívají se (OscillatorNode placeholder)

**Výsledek:** Aplikace je plně funkční. sf2 soubory se načítají, ale nepoužívají se kvůli placeholder audio engine.

---

### ✅ Fáze 6: Finální úpravy a příprava na rozšíření
**Status:** Dokončeno

**Plán:**
- [x] Error handling a loading states
- [x] Responsive design
- [x] Dokumentace API pro budoucí rozšíření
- [x] Příprava struktury pro knihovnu písniček/akordů (prázdné moduly)

**Realita:**
- ✅ Error handling přidán do všech komponent
- ✅ Loading states implementovány
- ✅ Responzivní design (přizpůsobení šířce obrazovky)
- ✅ Stores pro knihovnu písniček a akordů vytvořeny (`useSongLibraryStore`, `useChordLibraryStore`)
- ✅ Dokumentace vytvořena (CHANGELOG.md, IMPLEMENTATION_PLAN.md)

**Výsledek:** Aplikace je připravena na rozšíření. Všechny plánované úpravy byly dokončeny.

---

## Implementované funkce vs. plán

### ✅ Implementováno

1. **Interaktivní SVG klaviatura**
   - ✅ Vykreslení 88 kláves (A0-C8)
   - ✅ Zvýraznění stisknutých kláves
   - ✅ Pointer events (mouse/touch)
   - ✅ Responzivní design

2. **Zvukový engine**
   - ✅ Web Audio API
   - ✅ Polyfonie
   - ✅ Velocity support
   - ⚠️ OscillatorNode placeholder (místo TinySoundFont WASM)

3. **MIDI podpora**
   - ✅ Web MIDI API
   - ✅ Note On/Off
   - ✅ Sustain pedál (CC64)
   - ✅ Automatická detekce zařízení
   - ✅ HTTPS podpora pro dev server
   - ✅ Zlepšené error handling s detekcí prohlížeče

4. **Detekce akordů**
   - ✅ @tonaljs/tonal
   - ✅ Slash akordy (basový tón)
   - ✅ Real-time detekce
   - ✅ Preferování dur/moll akordů před alterovanými
   - ✅ Automatické zobrazení obratů (sextakord, kvartsextakord)
   - ✅ Normalizace názvů ("CM" → "C")

5. **Notový zápis**
   - ✅ VexFlow
   - ✅ Houslový a basový klíč (správné zobrazení obou současně)
   - ✅ Křížky (accidentals)
   - ✅ Oktávové značky (8va/8vb)
   - ✅ Správné rozdělení not podle výšky (C4 = hranice)

6. **UI komponenty**
   - ✅ Všechny plánované komponenty
   - ✅ Error handling
   - ✅ Loading states
   - ✅ Tmavý motiv s viditelnými selecty
   - ✅ Responzivní design
   - ✅ Nový layout s 3 sloupci (detekovaný akord, ovládací prvky, výběr akordu)
   - ✅ ChordSelector s transpozicí a přehráváním
   - ✅ NotationSelector pro přepínání standardů
   - ✅ Zobrazení vybraného akordu na klaviatuře

### ⚠️ Částečně implementováno

1. **Soundfont engine**
   - ⚠️ Použit OscillatorNode místo TinySoundFont WASM
   - ✅ Struktura připravena na integraci
   - ✅ Načítání sf2 souborů (data se načítají, ale nepoužívají)

### ✅ Nově implementováno (nad rámec původního plánu)

1. **Výběr akordu (ChordSelector)**
   - ✅ Dropdowny pro root note a chord type
   - ✅ Transpozice o oktávy (-3 až +3)
   - ✅ Hold button pro přehrávání akordu
   - ✅ Zobrazení počtu not v akordu
   - ✅ Zobrazení vybraného akordu na klaviatuře (podbarvení kláves)
   - ✅ Automatická inicializace audio při prvním přehrání

2. **Notační standardy**
   - ✅ Přepínání mezi jazz a klasickou notací
   - ✅ Normalizace názvů akordů podle standardu
   - ✅ Dynamické labely v UI podle standardu
   - ✅ Konzistentní zobrazení napříč aplikací

3. **Automatická inicializace audio**
   - ✅ Hybridní přístup: automatická + ruční inicializace
   - ✅ Inicializace při prvním kliknutí na klávesu nebo přehrání akordu

### ✅ Nově implementováno (Release 0.3.0)

1. **Knihovna písniček**
   - ✅ Store vytvořen (`useSongLibraryStore`)
   - ✅ UI komponenty implementovány
   - ✅ Vyhledávání podle názvu a interpreta
   - ✅ Zobrazení chord progression s podporou sekcí
   - ✅ Klikatelné akordy s přehráváním
   - ✅ 20 předpřipravených populárních písní
   - ✅ Podpora sekcí (verse, chorus, bridge, intro, outro)

### 📋 Připraveno pro budoucí rozšíření

1. **Editace a mazání písní**
   - ✅ Store podporuje `updateSong` a `deleteSong`
   - ❌ UI komponenty pro editaci chybí (plánováno v 0.4.0)

2. **Knihovna akordů**
   - ✅ Store vytvořen (`useChordLibraryStore`)
   - ❌ UI komponenty chybí

---

## Odchylky od původního plánu

### 1. Audio Engine - TinySoundFont WASM
**Původní plán:** 
- TinySoundFont WASM (přímá podpora sf2)
- Použít `@magenta/tinysoundfont` nebo podobný npm balíček
- Alternativně: vlastní WASM wrapper

**Skutečná implementace:** 
- SimpleSoundFontEngine s OscillatorNode jako placeholder
- sf2 soubory se načítají (fetch), ale nepoužívají se
- Struktura připravena na budoucí integraci

**Důvod:** 
- Pro MVP bylo jednodušší použít OscillatorNode
- TinySoundFont WASM vyžaduje složitější integraci
- Časové omezení MVP

**Dopad:** 
- Zvuk je funkční, ale není to skutečný soundfont
- Pro plnou podporu sf2 je potřeba integrovat TinySoundFont WASM
- API je připraveno, stačí vyměnit implementaci

### 2. Tone.js
**Původní plán:** 
- Tone.js Sampler s polyfonií, scheduling, ADSR

**Skutečná implementace:** 
- Přímé použití Web Audio API
- Vlastní implementace polyfonie a envelope

**Důvod:** 
- Pro jednodušší implementaci jsme použili přímo Web Audio API
- Vlastní kontrola nad audio pipeline

**Dopad:** 
- Funkčnost je zachována
- Chybí některé pokročilé funkce Tone.js (scheduling, lookahead)
- Vlastní implementace je flexibilnější pro budoucí úpravy

### 3. Custom React Hooks
**Původní plán:**
- `useAudio.ts`, `useMIDI.ts`, `usePianoKeyboard.ts`

**Skutečná implementace:**
- Hooks nebyly vytvořeny
- Logika je přímo v komponentách nebo stores

**Důvod:**
- Pro MVP nebylo nutné abstrahovat logiku do hooks
- Stores poskytují dostatečnou abstrakci

**Dopad:**
- Kód je funkční, ale méně modulární
- Hooks lze přidat později pro lepší organizaci kódu

---

## Řešené problémy během implementace

Viz [CHANGELOG.md](CHANGELOG.md) pro podrobný seznam všech řešených problémů.

Hlavní problémy:
1. Duplicitní deklarace `setInitialized`
2. Nekonečný tón při kliknutí
3. Prázdná notová osnova
4. Nesprávné umístění kláves
5. Chybějící křížky v notovém zápisu
6. Problém s klikáním na černé klávesy
7. MIDI připojení - ReferenceError require is not defined
8. Neviditelný výběr v selectech (UI)
9. Nesprávná detekce akordů v obratech
10. Nezobrazování not v basovém klíči
11. Zasekávání zvuku při rychlém klikání
12. HTTPS podpora pro MIDI

---

## Budoucí rozšíření (podle původního plánu)

### Vysoká priorita (připraveno v architektuře)
- [ ] **Integrace TinySoundFont WASM** - Pro plnou podporu sf2 souborů
  - Struktura je připravena (`SoundFontEngine` interface)
  - Stačí vyměnit implementaci v `SimpleSoundFontEngine`
- [ ] **UI pro knihovnu písniček** - Store již vytvořen (`useSongLibraryStore`)
  - Potřebné: `components/SongLibrary/` komponenty
- [ ] **UI pro knihovnu akordů** - Store již vytvořen (`useChordLibraryStore`)
  - Potřebné: `components/ChordLibrary/` komponenty

### Střední priorita
- [ ] **Záznam a export do MIDI (SMF)**
- [ ] **Metronom** (Tone.js nebo vlastní implementace)
- [ ] **Přepínání ladění** (A4 = 440/442 Hz)
- [ ] **Kvantizace** pro zápis do not

### Nízká priorita
- [ ] **Trénink mód** - škály, intervaly, akordové vzory, gamifikace
- [ ] **Nápověda prstokladu** (heuristiky dle intervalu/polohy)
- [ ] **MPE/aftertouch podpora** pro výrazové klaviatury
- [ ] **Import/export MusicXML** (OSMD)
- [ ] **Custom React hooks** - `useAudio.ts`, `useMIDI.ts`, `usePianoKeyboard.ts`

---

## Závěr

MVP aplikace je **plně funkční** a splňuje všechny základní požadavky. Hlavní odchylka od plánu je použití OscillatorNode místo TinySoundFont WASM, ale struktura je připravena na budoucí integraci.

Aplikace je připravena na rozšíření o další funkce, jako je knihovna písniček a akordů, pro které jsou již vytvořeny stores.

---

## Aktualizace (nejnovější změny)

### Nový UI layout a výběr akordu (11. 12. 2025)
- **3-sloupcový layout**: Detekovaný akord (vlevo), ovládací prvky (uprostřed), výběr akordu (vpravo)
- **Responzivní design**: Přizpůsobení výšce okna prohlížeče
- **ChordSelector**: Nová komponenta pro výběr akordu s transpozicí o oktávy (-3 až +3)
- **Zobrazení akordu na klaviatuře**: Podbarvení kláves pro vybraný akord
- **Hold button**: Přehrávání akordu při držení tlačítka (onMouseDown/onMouseUp, onTouchStart/onTouchEnd)
- **Zobrazení počtu not**: "2 noty", "3 noty", atd. podle počtu not v akordu
- **Automatická inicializace audio**: Při prvním přehrání akordu

### Notační standardy (11. 12. 2025)
- **NotationSelector**: Přepínání mezi jazz a klasickou notací
- **useNotationStore**: Nový store pro správu standardu a normalizaci názvů akordů
- **Normalizace názvů akordů**: Konzistentní zobrazení podle standardu
  - Jazz: "C" místo "CM", "Am" zůstává, "CMadd9" → "Cadd9"
  - Klasická: "CM" pro dur, "Am" pro moll, zachování všech názvů
- **Dynamické labely**: UI se aktualizuje podle vybraného standardu (prázdný label pro jazz, "maj" pro klasickou)
- **Zobrazení názvu akordu**: CM pro classical, C pro jazz ve výběru akordu

### Automatická inicializace audio (11. 12. 2025)
- **Hybridní přístup**: Automatická inicializace při prvním gestu + ruční tlačítko
- **Integrace**: Automatická inicializace v PianoKeyboard a ChordSelector
- **Export funkce**: `autoInitializeAudio()` z AudioInitButton pro použití v jiných komponentách

### Opravy (11. 12. 2025)
- **Duplicitní deklarace**: Oprava `normalizeChord` v ChordSelector (odstranění duplicitní deklarace na řádku 129)
- **UI layout**: Zajištění vertikálního uspořádání ovládacích prvků i po připojení MIDI (změna z `flex-wrap: wrap` na `flex-direction: column`)

### Vylepšení detekce akordů
- **Skórovací systém**: Preferování dur/moll akordů (10 bodů) před alterovanými (1 bod)
- **Obraty akordů**: Automatické zobrazení jako slash akordy (G/B pro sextakord, G/D pro kvartsextakord)
- **Normalizace**: "CM" → "C", zachování mollových akordů ("Am" → "Am")

### Oprava vykreslování not
- **Basový klíč**: Správné zobrazení not pod C4
- **Pozice klíčů**: Basový nahoře, houslový dole (pokud jsou oba přítomny)
- **Výška rendereru**: Zvýšena na 300px pro zobrazení obou klíčů

### MIDI připojení
- **HTTPS podpora**: Dev server s HTTPS (`npm run dev:https`)
- **Error handling**: Zlepšené zprávy s detekcí prohlížeče
- **Automatický výběr**: První MIDI vstup se vybere automaticky

### UI vylepšení
- **Tmavý motiv**: Selecty a labels s viditelným textem
- **Hover/Focus stavy**: Lepší UX při interakci
- **Zvětšení fontů**: Všechny fonty zvětšeny o 30%

### Přejmenování na Harmonia a grafické vylepšení (11. 12. 2025)
- **Přejmenování**: Aplikace přejmenována na "Harmonia" ve všech souborech
- **Grafika**: Gradient pozadí s dekorativními prvky, animované logo, vylepšené panely
- **Header**: Hudební nota jako logo s floating animací, gradient text pro název

### Sjednocení dropdownů (11. 12. 2025)
- **Layout**: Všechny dropdowny mají stejný layout (label vlevo, select vpravo)
- **Zarovnání**: Všechny labely mají stejnou šířku (110px) a zarovnání vpravo
- **Velikost**: Všechny selecty mají stejnou velikost písma, padding a minimální šířku

### Knihovna písniček (13. 12. 2025) - Release 0.3.0
- **SongLibrary komponenta** - Kompletní implementace knihovny písniček v pravém panelu pod klaviaturou
- **Vyhledávání** - Real-time vyhledávání podle názvu a interpreta (case-insensitive)
- **Chord Progression** - Zobrazení akordů s podporou sekcí (verse, chorus, bridge, intro, outro)
- **Interaktivní akordy** - Klikatelné akordy s přehráváním při držení tlačítka myši
- **Integrace** - Zobrazení akordů na klaviatuře (zvýraznění) a v notové osnově při kliknutí
- **20 předpřipravených písní** - Populární písně různých žánrů s chord progression
- **Sekce** - Strukturované zobrazení s hlavičkami (Sloka, Refrén, Bridge, Intro, Outro)
- **Horizontální layout** - Akordy zobrazeny jako tlačítka vedle sebe
- **Kompaktní design** - Optimalizováno pro zobrazení bez scrollování

### Editor písní (14. 12. 2025) - Unreleased
- **Samostatná aplikace** - Editor písní jako vývojářský nástroj (`song-editor/`)
- **TypeScript parser** - Načítání písní z `popularSongs.ts` s podporou vnořených struktur
- **Drag & Drop** - Přesouvání sekcí pomocí @dnd-kit
- **Inline editace** - Editace akordů přímo v sekcích s validací
- **Import/Export** - Načítání z TypeScript/JSON a export do TypeScript formátu
- **Validace** - Validace akordů pomocí @tonaljs/tonal
- **LocalStorage** - Automatické ukládání do localStorage

### UI vylepšení (13. 12. 2025) - Release 0.3.1
- **Detekovaný akord** - Přidán placeholder "-" pro zobrazení, když není detekován žádný akord
- **Sjednocení velikosti písma** - Detekovaný akord má stejnou velikost písma jako výběr akordu (použití třídy `chord-name`)
- **Pořadí nástrojů** - Piano (synth) je nyní první a výchozí nástroj, DX7 Modern (synth) je druhé, Piano (Acoustic) je poslední
- **Oprava CSS selektorů** - Opravena nekonzistence mezi TSX třídou a CSS selektorem
- **Styling placeholderu** - Placeholder má nyní správně ztlumený vzhled

---

*Dokument vytvořen: 11. 12. 2025*  
*Poslední aktualizace: 13. 12. 2025*

