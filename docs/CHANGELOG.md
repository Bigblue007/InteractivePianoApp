# Changelog - Interaktivní webová klaviatura

## Přehled změn a oprav

Tento dokument popisuje všechny změny, opravy a řešené problémy během vývoje MVP aplikace.

---

## Implementované funkce

### 1. Základní architektura
- **React + TypeScript** - Moderní frontend framework s type safety
- **Vite** - Rychlý build tool a dev server
- **Zustand** - Lightweight state management
- **Modulární struktura** - Rozdělení na services, stores, components, utils

### 2. Zvukový engine
- **SimpleSoundFontEngine** - Základní engine pro přehrávání zvuků
- **Web Audio API** - Nativní audio kontext
- **OscillatorNode** - Dočasné řešení pro přehrávání (připraveno na TinySoundFont WASM)
- **Polyfonie** - Podpora více současně hraných not
- **Sustain pedál** - Implementace CC64 MIDI zprávy

### 3. MIDI podpora
- **Web MIDI API** - Připojení k MIDI zařízením
- **MIDI Manager** - Správa MIDI vstupů a výstupů
- **Parsing MIDI zpráv** - Note On/Off, Control Change (CC64)
- **Automatická detekce zařízení** - Sledování připojených/vypojených zařízení

### 4. Interaktivní klaviatura
- **SVG renderování** - Vektorová klaviatura s přesným umístěním
- **88 kláves** - Plný rozsah od A0 (21) do C8 (108)
- **Pointer events** - Podpora myši i touch zařízení
- **Vizuální feedback** - Zvýraznění stisknutých kláves
- **Responzivní design** - Přizpůsobení šířce obrazovky

### 5. Detekce akordů
- **@tonaljs/tonal** - Hudební teorie a detekce akordů
- **Slash akordy** - Podpora basového tónu (např. C/E)
- **Real-time detekce** - Automatická detekce při změně aktivních not

### 6. Notový zápis
- **VexFlow** - Profesionální vykreslování not
- **Houslový a basový klíč** - Automatické rozdělení podle výšky noty
- **Křížky** - Správné zobrazení zvýšených tónů (C#, D#, F#, G#, A#)
- **Oktávové značky** - 8va/8vb pro extrémně vysoké/nízké noty

### 7. UI komponenty
- **AudioInitButton** - Inicializace audio po uživatelském gestu (s automatickou inicializací)
- **InstrumentSelector** - Výběr soundfontu/nástroje
- **MIDIConnector** - Připojení MIDI zařízení
- **ChordPanel** - Zobrazení detekovaného akordu
- **ScoreView** - Zobrazení notové osnovy
- **ChordSelector** - Výběr akordu s transpozicí a přehráváním
- **NotationSelector** - Přepínání mezi jazz a klasickou notací

---

## Řešené problémy a opravy

### 1. Duplicitní deklarace `setInitialized`
**Problém:** 
- Chyba: `Identifier 'setInitialized' has already been declared`
- Konflikt mezi `useState` a `useAudioStore`

**Řešení:**
- Přejmenování `setInitialized` z `useAudioStore` na `setAudioInitialized`
- Odstranění duplicitního volání `setInitialized(true)`

**Soubor:** `src/components/AudioInitButton/AudioInitButton.tsx`

---

### 2. Nekonečný tón při kliknutí na klávesu
**Problém:**
- Při kliknutí na klávesu se spustil nekonečný tón
- Prázdná stránka po kliknutí
- OscillatorNode se nezastavoval správně

**Řešení:**
- Oprava metody `noteOff()` - správné volání `oscillator.stop()`
- Přidání `onended` handleru pro automatické smazání z mapy
- Změna z `subscribe` na `useEffect` pro sledování změn stavu
- Přidání error handlingu do ScoreRenderer

**Soubory:**
- `src/services/audio/SoundFontEngine.ts`
- `src/components/AudioInitButton/AudioInitButton.tsx`
- `src/services/score/ScoreRenderer.ts`

---

### 3. Prázdná notová osnova
**Problém:**
- Při stisku klávesy se zobrazovala prázdná osnova bez not
- Chyba: `IncompleteVoice: Voice does not have enough notes`

**Řešení:**
- Oprava délky noty z `'q'` (čtvrtka = 1 beat) na `'w'` (celá nota = 4 beatů)
- Správné mapování MIDI not na VexFlow formát
- Přidání error handlingu a debug logování

**Soubor:** `src/services/score/ScoreRenderer.ts`

---

### 4. Duplicitní klíče v React (piano)
**Problém:**
- Warning: `Encountered two children with the same key, 'piano'`
- Soundfont se přidával vícekrát

**Řešení:**
- Kontrola existence soundfontu před přidáním v `useEffect`
- Přidání kontroly v `addSoundFont` akci store
- Změna dependency array v `useEffect`

**Soubory:**
- `src/components/InstrumentSelector/InstrumentSelector.tsx`
- `src/stores/useAudioStore.ts`

---

### 5. Nesprávné umístění kláves
**Problém:**
- Vlevo jedna bílá klávesa navíc
- Vpravo jedna bílá klávesa chybí
- Černé klávesy byly posunuté

**Řešení:**
- Přepracování logiky výpočtu pozic kláves
- Vytvoření mapy pozic bílých kláves před vykreslením
- Správné umístění černých kláves nad předchozí bílou klávesou
- Oprava funkce `getMidiFromPosition` pro správnou detekci kliknutí

**Soubor:** `src/components/PianoKeyboard/PianoKeyboard.tsx`

---

### 6. Klaviatura uříznutá zprava
**Problém:**
- Klaviatura byla uříznutá na pravé straně
- Skrolování zespodu

**Řešení:**
- Přepočet šířky kláves podle šířky obrazovky
- Odstranění padding z kontejnerů
- Přidání `overflow-x: hidden` do CSS
- Odstranění `max-width` z main kontejneru
- Dynamické přizpůsobení šířky kláves podle viewport width

**Soubory:**
- `src/components/PianoKeyboard/PianoKeyboard.tsx`
- `src/components/PianoKeyboard/PianoKeyboard.css`
- `src/App.css`

---

### 7. Zvětšení klaviatury o 30%
**Požadavek:**
- Zvětšit klaviaturu o 30%

**Řešení:**
- Změna rozměrů:
  - KEY_WIDTH: 20 → 26
  - KEY_HEIGHT: 120 → 156
  - BLACK_KEY_WIDTH: 12 → 16
  - BLACK_KEY_HEIGHT: 70 → 91

**Soubor:** `src/components/PianoKeyboard/PianoKeyboard.tsx`

---

### 8. Černé klávesy nešly klikat
**Problém:**
- Kliknutí na černé klávesy bylo posunuté o jednu klávesu doprava
- Fyzický klik neodpovídal vizuální pozici

**Řešení:**
- Oprava funkce `getMidiFromPosition` pro černé klávesy
- Použití stejné logiky jako při vykreslování
- Hledání předchozí bílé klávesy pro správné umístění černé klávesy

**Soubor:** `src/components/PianoKeyboard/PianoKeyboard.tsx`

---

### 9. Chybějící křížky v notovém zápisu
**Problém:**
- Černé klávesy (C#, D#, F#, G#, A#) se zobrazovaly bez křížků
- Noty byly zobrazeny jako základní tóny

**Řešení:**
- Změna konverze MIDI not - použití základních not bez křížků v názvu
- Explicitní přidání `Accidental('#')` modifikátoru k notám, které ho potřebují
- Správné mapování MIDI pozic na accidentals

**Soubor:** `src/services/score/ScoreRenderer.ts`

---

### 10. Oktávové značky (8va/8vb)
**Požadavek:**
- Zobrazit oktávové značky pro extrémně vysoké/nízké noty
- Místo mnoha pomocných linek použít 8va/8vb

**Implementace:**
- Detekce not nad C6 (96) pro houslový klíč → 8va
- Detekce not pod C2 (36) pro basový klíč → 8vb
- Zobrazení not o oktávu níž/výš s textem "8va"/"8vb"
- Přidání čárkované čáry nad/pod osnovou
- Přímé vykreslení pomocí VexFlow context API

**Soubor:** `src/services/score/ScoreRenderer.ts`

---

### 11. MIDI připojení - ReferenceError require is not defined
**Problém:**
- Aplikace nereagovala na MIDI kontroler
- Chyba: `ReferenceError: require is not defined` v MIDI handleru
- MIDI zprávy se nepřijímaly

**Řešení:**
- Nahrazení `require()` ES6 importem `usePianoStore` na začátku souboru
- Oprava registrace MIDI handleru - handler se nyní správně připojuje k vybranému vstupu
- Zlepšení logiky výběru MIDI vstupu - automatický výběr prvního vstupu, pokud je jen jeden

**Soubory:**
- `src/components/MIDIConnector/MIDIConnector.tsx`
- `src/services/midi/MIDIManager.ts`

---

### 12. Neviditelný výběr v selectech (UI)
**Problém:**
- Výběr v dropdown selectech nebyl viditelný na tmavém pozadí
- Text v selectech a labels nebyl čitelný

**Řešení:**
- Změna barev selectů na tmavé pozadí (#2a2a2a) se světlým textem
- Přidání hover a focus stavů pro lepší UX
- Styling option elementů pro konzistentní vzhled
- Přidání světlého textu pro labels

**Soubory:**
- `src/components/InstrumentSelector/InstrumentSelector.css`
- `src/components/MIDIConnector/MIDIConnector.css`

---

### 13. Nesprávná detekce akordů v obratech
**Problém:**
- Akordy v obratech (např. B3-D4-G4 místo G3-B3-D4) byly detekovány špatně
- G dur v sextakordu byl detekován jako "Bm#5" místo "G/B"
- "CM" místo "C" pro durové akordy

**Řešení:**
- Implementace skórovacího systému pro preferování dur/moll akordů před alterovanými
- Automatické zobrazení obratů jako slash akordů (G/B pro sextakord, G/D pro kvartsextakord)
- Normalizace názvů akordů - "CM" → "C" (mollové akordy "Am" zůstávají)
- Pokud basový tón není root, zobrazí se akord s basovým tónem jako obratem

**Soubor:** `src/services/chord/ChordDetector.ts`

**Detaily implementace:**
- Skórovací systém: dur/moll akordy (10 bodů) > kvintakordy (5 bodů) > alterované akordy (1 bod)
- Automatická detekce obratů - pokud basový tón ≠ root, vytvoří se slash akord
- Podpora sextakordu (např. G/B) a kvartsextakordu (např. G/D)

---

### 14. Nezobrazování not v basovém klíči
**Problém:**
- Noty pod C4 (basový klíč) se nezobrazovaly v notové osnově
- Zobrazovaly se pouze noty v houslovém klíči

**Řešení:**
- Oprava pozic vykreslování - basový klíč nahoře, houslový dole (pokud jsou oba přítomny)
- Zvýšení výšky rendereru z 250px na 300px
- Zvýšení min-height ScoreView z 250px na 300px
- Přidání `overflow: visible` pro správné zobrazení obou klíčů
- Správné rozdělení not podle hranice C4 (60)

**Soubory:**
- `src/services/score/ScoreRenderer.ts`
- `src/components/ScoreView/ScoreView.css`

---

### 15. Zasekávání zvuku při rychlém klikání
**Problém:**
- Při rychlém klikání se zvuk zasekával a zněl do nekonečna
- Při hraní akordů zůstávaly viset jednotlivé tóny

**Řešení:**
- Implementace `stopNoteImmediately()` pro okamžité zastavení not přes gain node
- Sledování aktivních oscillátorů a gain nodes pro každou notu
- Automatické zastavení předchozí noty před spuštěním nové na stejném MIDI čísle
- Správné čištění timeoutů a resources při noteOff

**Soubor:** `src/services/audio/SoundFontEngine.ts`

**Detaily implementace:**
- Mapy `activeOscillators`, `activeGainNodes`, `activeTimeouts` pro tracking
- `stopNoteImmediately()` nastaví gain na 0 a zastaví všechny oscillátory pro danou notu
- Před spuštěním nové noty se vždy zastaví předchozí na stejném MIDI čísle

---

### 16. Nový UI layout s výběrem akordu
**Požadavek:**
- Rozdělení UI na 3 části nad klaviaturou (detekovaný akord, ovládací prvky, výběr akordu)
- Výběr libovolného akordu s transpozicí o oktávy
- Zobrazení vybraného akordu na klaviatuře (podbarvení kláves)
- Přehrávání vybraného akordu (hold button)

**Implementace:**
- Nový layout s CSS Grid pro responzivní design
- `ChordSelector` komponenta s dropdowny pro root note a chord type
- Transpozice o oktávy (-3 až +3) s šipkami nahoru/dolů
- Hold button pro přehrávání akordu (onMouseDown/onMouseUp, onTouchStart/onTouchEnd)
- Automatická inicializace audio při prvním přehrání
- Zobrazení počtu not v akordu (2 noty, 3 noty, atd.)
- Zobrazení oktávové transpozice

**Soubory:**
- `src/components/ChordSelector/ChordSelector.tsx`
- `src/components/ChordSelector/ChordSelector.css`
- `src/App.tsx` (integrace do layoutu)
- `src/App.css` (nový layout)

---

### 17. Automatická inicializace audio
**Požadavek:**
- Automatická inicializace audio při prvním uživatelském gestu
- Zachování možnosti ruční inicializace

**Implementace:**
- Hybridní přístup: automatická inicializace při prvním kliknutí na klávesu nebo přehrání akordu
- Export funkce `autoInitializeAudio()` z `AudioInitButton`
- Použití v `PianoKeyboard` a `ChordSelector`
- Ruční tlačítko stále dostupné

**Soubory:**
- `src/components/AudioInitButton/AudioInitButton.tsx`
- `src/components/PianoKeyboard/PianoKeyboard.tsx`
- `src/components/ChordSelector/ChordSelector.tsx`

---

### 18. Notační standardy (Jazz vs. Klasická)
**Požadavek:**
- Přepínání mezi jazz a klasickou notací
- Konzistentní zobrazení názvů akordů podle standardu
- Dynamické aktualizace UI podle standardu

**Implementace:**
- Nový store `useNotationStore` pro správu standardu
- Funkce `normalizeChordName()` pro normalizaci názvů akordů
- Jazz standard: "C" místo "CM", "Am" zůstává
- Klasická notace: "CM" pro dur, "Am" pro moll
- `NotationSelector` komponenta pro přepínání standardu
- Dynamické labely v `ChordSelector` (prázdný label pro jazz, "maj" pro klasickou)
- Zobrazení názvu akordu podle standardu (CM pro classical, C pro jazz)

**Soubory:**
- `src/stores/useNotationStore.ts`
- `src/components/NotationSelector/NotationSelector.tsx`
- `src/components/NotationSelector/NotationSelector.css`
- `src/components/ChordSelector/ChordSelector.tsx` (integrace normalizace)
- `src/components/ChordPanel/ChordPanel.tsx` (integrace normalizace)
- `src/services/chord/ChordDetector.ts` (integrace normalizace)

**Detaily implementace:**
- Normalizace pro jazz: odstranění "M" z dur akordů (CMadd9 → Cadd9, CM7 → C7)
- Normalizace pro klasickou: zachování "M" pro dur akordy
- Podpora slash akordů (normalizace každé části zvlášť)
- Dynamické generování labelů akordů podle standardu

---

### 19. Oprava UI layoutu a duplicitní deklarace
**Problém:**
- Duplicitní deklarace `normalizeChord` v `ChordSelector`
- UI layout se rozbíjel při připojení MIDI (kontrolky vedle sebe místo pod sebou)

**Řešení:**
- Odstranění duplicitní deklarace `normalizeChord` (pouze jedna na řádku 54)
- Změna `.controls` z `flex-wrap: wrap` na `flex-direction: column` pro vertikální uspořádání
- Zajištění konzistentního layoutu i po připojení MIDI

**Soubory:**
- `src/components/ChordSelector/ChordSelector.tsx`
- `src/App.css`
- `src/components/MIDIConnector/MIDIConnector.css`
- `src/components/NotationSelector/NotationSelector.css`
- `src/components/InstrumentSelector/InstrumentSelector.css`
- `src/components/AudioInitButton/AudioInitButton.css`

---

## Technické detaily

### Struktura projektu
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
│   └── NotationSelector/
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
├── hooks/           # Custom React hooks
├── utils/           # Pomocné funkce
└── types/           # TypeScript typy
```

### Použité knihovny
- **react** ^18.2.0
- **@tonaljs/tonal** ^4.10.0 - Hudební teorie
- **vexflow** ^4.2.5 - Notový zápis
- **zustand** ^4.4.7 - State management

### Omezení a poznámky
- **Soundfont engine**: Aktuálně používá OscillatorNode jako placeholder. Pro plnou podporu sf2 je potřeba integrovat TinySoundFont WASM.
- **Web MIDI API**: Vyžaduje HTTPS v produkci (vývoj na localhost funguje)
- **Audio inicializace**: Vyžaduje uživatelské gesto (klik)
- **Browser support**: Chrome/Edge mají plnou podporu, Safari novější verze, Firefox omezená podpora

---

## Budoucí rozšíření (připraveno v architektuře)

- **Knihovna písniček** - `useSongLibraryStore` již vytvořen
- **Knihovna akordů** - `useChordLibraryStore` již vytvořen
- **TinySoundFont WASM** - Integrace pro plnou podporu sf2
- **Záznam a export MIDI**
- **Metronom**
- **Trénink mód**

---

### 20. Přejmenování aplikace na Harmonia a grafické vylepšení (11. 12. 2025)
**Požadavek:**
- Přejmenovat aplikaci na "Harmonia"
- Přidat příjemnou, nevtíravou grafiku

**Implementace:**
- Přejmenování aplikace ve všech souborech (index.html, App.tsx, README.md, package.json)
- Gradient pozadí s dekorativními radiálními gradienty
- Vylepšený header s animovaným logem (hudební nota ♫)
- Gradient text pro název "Harmonia"
- Vylepšené panely s backdrop-filter a jemnými stíny
- Hover efekty na panelech
- Dekorativní prvky v welcome dialogu

**Soubory:**
- `index.html`
- `src/App.tsx`
- `src/App.css`
- `src/index.css`
- `src/components/WelcomeDialog/WelcomeDialog.tsx`
- `src/components/WelcomeDialog/WelcomeDialog.css`
- `README.md`
- `package.json`

---

### 21. Sjednocení dropdownů v controls (11. 12. 2025)
**Požadavek:**
- Sjednotit velikost dropdownů
- Zajistit, aby text v dropdownách byl vidět celý
- Popisky dropdownů zleva a zarovnané

**Implementace:**
- Sjednocení layoutu všech dropdownů (label vlevo, select vpravo)
- Všechny labely mají stejnou šířku (110px) a zarovnání vpravo
- Všechny selecty mají stejnou velikost písma (1.3rem), padding (0.5rem) a minimální šířku (200px)
- Flex: 1 pro selecty pro využití dostupného prostoru
- Sjednocené hover a focus efekty

**Soubory:**
- `src/components/InstrumentSelector/InstrumentSelector.css`
- `src/components/MIDIConnector/MIDIConnector.tsx`
- `src/components/MIDIConnector/MIDIConnector.css`
- `src/components/NotationSelector/NotationSelector.css`
- `src/App.css`

---

*Dokument vytvořen: 11. 12. 2025*  
*Poslední aktualizace: 11. 12. 2025*

