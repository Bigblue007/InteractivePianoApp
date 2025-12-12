# Interaktivní webová klaviatura – technický průvodce

*Datum: 11. 12. 2025*

## Obsah
- [Cíl a hlavní funkcionality](#cíl-a-hlavní-funkcionality)
- [Doporučený technologický stack](#doporučený-technologický-stack)
- [Architektura řešení](#architektura-řešení)
- [Praktické detaily (latence, pedál, polyfonie)](#praktické-detaily-latence-pedál-polyfonie)
- [Ukázky kódu](#ukázky-kódu)
  - [MIDI připojení a parsing zpráv](#midi-připojení-a-parsing-zpráv)
  - [Zvukový engine přes Tone.js Sampler](#zvukový-engine-přes-tonejs-sampler)
  - [Detekce akordů pomocí Tonal](#detekce-akordů-pomocí-tonal)
  - [Vykreslení not do notové osnovy (VexFlow)](#vykreslení-not-do-notové-osnovy-vexflow)
  - [SVG klaviatura – zvýraznění kláves](#svg-klaviatura--zvýraznění-kláves)
- [Rychlý start (instalace a inicializace)](#rychlý-start-instalace-a-inicializace)
- [Podpora prohlížečů a omezení](#podpora-prohlížečů-a-omezení)
- [MVP varianta](#mvp-varianta)
- [Možná rozšíření](#možná-rozšíření)
- [Bezpečnost, licence a práva](#bezpečnost-licence-a-práva)
- [Troubleshooting](#troubleshooting)

---

## Cíl a hlavní funkcionality
Webová aplikace pro muzikanty s **interaktivní klaviaturou**, která:
- vizualizuje stisknuté klávesy (myš/touch i vstup z digitálního piana),
- přehrává jednotlivé tóny i celé **akordy**,
- detekuje **aktuálně hraný akord** a zobrazuje jej,
- ukazuje noty v **notovém zápisu** (houslový/basový klíč),
- umožňuje napojení přes **MIDI** (včetně **sustain pedálu**, velocity, případně pitch bend).

---

## Doporučený technologický stack

### UI klaviatury (render + interakce)
- **SVG** (doporučeno): jednoduché zvýraznění stisků, škálování, přesná geometrie.
- Alternativy: **Canvas** (vyšší výkon při animacích), nebo **HTML+CSS** (rychlý start, méně přesné).
- Framework: **React** / **Vue** / **Svelte** pro stavovou logiku; store: **Zustand** (React), **Pinia** (Vue).

### Zvukový engine
- **Web Audio API** (nativní, nízká latence) + knihovna **Tone.js** (polyfonie, scheduling, ADSR, Sampler).
- Sample přehrávání: **soundfont-player**, **WebAudioFont**; vyšší kvalita: **FluidSynth WASM** / **TinySoundFont WASM**.

### MIDI vstup (digitální piano)
- **Web MIDI API** (`navigator.requestMIDIAccess`) nebo **webmidi.js** (zjednodušený přístup, správa zařízení).
- Podpora: spolehlivě **Chrome/Edge** (desktop), **Safari** novější verze; **Firefox** omezený. Vždy **HTTPS** a uživatelské gesto.

### Hudební teorie a akordy
- **@tonaljs/tonal**: detekce akordů (`Chord.detect`), práce s pitch classes, konverze MIDI↔noty.

### Notový zápis
- **VexFlow**: generování not do SVG/Canvas.
- **OpenSheetMusicDisplay (OSMD)**: pokud budete pracovat s **MusicXML**.

---

## Architektura řešení

```text
[UI (React/Vue/Svelte)]
   ├─ PianoKeyboard (SVG)
   │    ├─ zvýrazňování stisku (UI state)
   │    └─ pointer/mouse/touch → noteOn/noteOff
   ├─ MIDIConnector
   │    ├─ výběr vstupu (Web MIDI / webmidi.js)
   │    └─ eventy noteon/noteoff/CC64 → state + audio
   ├─ ScoreView (VexFlow/OSMD)
   │    └─ render aktuálních tónů/akordů
   └─ ChordPanel (Tonal)
        └─ detekce akordu + label
[AudioEngine (Tone.js + Sampler/WebAudio)]
   ├─ polyfonie, velocity, sustain
   └─ plánování (currentTime, lookahead)
[State Store]
   ├─ aktivní noty (set MIDI numbers)
   ├─ sustain pedál (CC64)
   └─ vybraný MIDI input / nastavení latence
```

---

## Praktické detaily (latence, pedál, polyfonie)
- Inicializujte audio až po **uživatelském kliku** (prohlížeče blokují auto‑play).
- **Sampler**: přednačtěte základní zóny (např. C4, D#4, F#4, A4) → pitch‑shift pro okolní tóny; pro vyšší kvalitu přidejte více vzorků.
- **Sustain pedál (CC64)**: při stisku držte odchozí `noteOff` ve „sustain poolu“ a uvolněte až po puštění pedálu.
- **Akordová detekce**: pracujte s **pitch‑class** (C, C#, D …) a evidujte **bass note** pro slash akordy (např. C/E).
- **Scheduling**: hrajte s malým **lookahead** (10–25 ms) vůči `AudioContext.currentTime`.
- **Mobil**: použijte **Pointer Events**, debouncujte vizuální update, počítejte s vyšší latencí Bluetooth MIDI.

---

## Ukázky kódu

### MIDI připojení a parsing zpráv
```ts
// Připojení k MIDI zařízením – nativní Web MIDI API
async function connectMidi() {
  if (!navigator.requestMIDIAccess) {
    console.warn("Web MIDI API není podporováno – doporučte Chrome/Edge.");
    return;
  }
  const midiAccess = await navigator.requestMIDIAccess({ sysex: false });
  for (const input of midiAccess.inputs.values()) {
    input.onmidimessage = handleMidiMessage;
  }
  midiAccess.onstatechange = (e) => {
    console.log("MIDI změna stavu:", e.port.name, e.port.state);
  };
}

let sustain = false;
const activeNotes = new Set<number>();
const sustainPool = new Set<number>();

function handleMidiMessage(e: WebMidi.MIDIMessageEvent) {
  const [status, data1, data2] = e.data;
  const cmd = status & 0xf0;
  // Note On
  if (cmd === 0x90 && data2 > 0) {
    noteOn(data1, data2);
  }
  // Note Off (nebo Note On s velocity 0)
  else if (cmd === 0x80 || (cmd === 0x90 && data2 === 0)) {
    noteOff(data1);
  }
  // Control Change – Sustain pedál (CC64)
  else if (cmd === 0xB0 && data1 === 64) {
    sustain = data2 >= 64;
    if (!sustain) releaseSustainPool();
  }
}
```

### Zvukový engine přes Tone.js Sampler
```ts
import * as Tone from "tone";

const sampler = new Tone.Sampler({
  urls: { "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3", "A4": "A4.mp3" },
  baseUrl: "/samples/grand-piano/",
  onload: () => console.log("Sampler ready"),
}).toDestination();

async function initAudio() {
  await Tone.start(); // vyžaduje uživatelské gesto (klik)
}

function midiToNoteName(midi: number) {
  return Tone.Frequency(midi, "midi").toNote(); // např. "C#4"
}

function noteOn(midi: number, velocity: number) {
  const note = midiToNoteName(midi);
  const vel = Math.min(1, Math.max(0, velocity / 127));
  sampler.triggerAttack(note, undefined, vel);
  activeNotes.add(midi);
  highlightKey(midi, true);
  detectAndRenderChord();
}

function noteOff(midi: number) {
  if (sustain) {
    sustainPool.add(midi);
    return;
  }
  const note = midiToNoteName(midi);
  sampler.triggerRelease(note);
  activeNotes.delete(midi);
  highlightKey(midi, false);
  detectAndRenderChord();
}

function releaseSustainPool() {
  for (const midi of sustainPool) {
    const note = midiToNoteName(midi);
    sampler.triggerRelease(note);
    activeNotes.delete(midi);
    highlightKey(midi, false);
  }
  sustainPool.clear();
  detectAndRenderChord();
}
```

### Detekce akordů pomocí Tonal
```ts
import { Chord, Note } from "@tonaljs/tonal";

function detectChordName(): string | null {
  if (activeNotes.size === 0) return null;
  const pcs = [...activeNotes]
    .map((n) => Note.pitchClass(Note.fromMidi(n))) // např. "C", "E", "G"
    .sort();
  const candidates = Chord.detect(pcs);
  // Zohlednit basový tón (nejnižší MIDI) – slash akordy
  const bassMidi = Math.min(...activeNotes);
  const bassPc = Note.pitchClass(Note.fromMidi(bassMidi));
  const withSlash = candidates.length ? `${candidates[0]}/${bassPc}` : null;
  return withSlash || candidates[0] || null;
}

function detectAndRenderChord() {
  const name = detectChordName();
  renderChordLabel(name);
  renderScore([...activeNotes]);
}
```

### Vykreslení not do notové osnovy (VexFlow)
```ts
import Vex from "vexflow";
import * as Tone from "tone";

const VF = Vex.Flow;
const factory = new VF.Factory({
  renderer: { elementId: "score", width: 700, height: 250 },
});
const score = factory.EasyScore();
const system = factory.System();

function midiToVex(n: number): string {
  const name = Tone.Frequency(n, "midi").toNote(); // "C#4"
  const letter = name[0].toLowerCase();            // "c"
  const acc = name.includes("#") ? "#" : (name.includes("b") ? "b" : "");
  const octave = parseInt(name.match(/\d+/)?.[0] || "4", 10);
  return `${letter}${acc}/${octave}`;
}

function renderScore(midiNotes: number[]) {
  factory.reset();
  const vexNotesTreble = midiNotes
    .filter((n) => n >= 60) // jednoduché dělení: houslový klíč od C4
    .map(midiToVex);
  const vexNotesBass = midiNotes
    .filter((n) => n < 60)
    .map(midiToVex);

  if (vexNotesTreble.length) {
    const voiceT = score.voice(score.notes(vexNotesTreble.join(" "), { stem: "up" }));
    system.addStave({ voices: [voiceT] }).addClef("treble").addTimeSignature("4/4");
  }
  if (vexNotesBass.length) {
    const voiceB = score.voice(score.notes(vexNotesBass.join(" "), { stem: "down" }));
    system.addStave({ voices: [voiceB] }).addClef("bass").addTimeSignature("4/4");
  }
  factory.draw();
}
```

### SVG klaviatura – zvýraznění kláves
```ts
function highlightKey(midi: number, pressed: boolean) {
  const el = document.querySelector(`[data-midi="${midi}"]`) as SVGElement | null;
  if (!el) return;
  el.classList.toggle("pressed", pressed);
}

/* CSS příklad */
/*
.key.white { fill: #fff; stroke: #333; }
.key.black { fill: #000; }
.key.pressed.white { fill: #9fd3ff; }
.key.pressed.black { fill: #3a78b3; }
*/
```

---

## Rychlý start (instalace a inicializace)
```bash
# Inicializace projektu (React příklad)
npm create vite@latest my-piano-app -- --template react-ts
cd my-piano-app

# Knihovny
npm install tone @tonaljs/tonal vexflow webmidi
# (volitelné) soundfont-player nebo WebAudioFont
npm install soundfont-player

# Spuštění
npm run dev
```

**Poznámky:**
- Audio inicializujte po kliknutí (např. tlačítko „Zapnout zvuk“ → `await Tone.start()`).
- MIDI přístup aktivujte po kliknutí (tlačítko „Připojit piano“ → `requestMIDIAccess`).

---

## Podpora prohlížečů a omezení
- Doporučte **Chrome/Edge** (desktop) pro Web MIDI.
- **Safari**: novější verze postupně doplňuje podporu; otestujte.
- **Firefox**: omezená podpora Web MIDI – připravte fallback (hraní přes UI, bez MIDI vstupu).
- Vždy **HTTPS** a **uživatelské gesto** pro povolení audio/midi.

---

## MVP varianta
- React + **SVG** klaviatura.
- **Tone.js Sampler** s klavírním zvukem (soundfont nebo vlastní samply).
- **Web MIDI API** (včetně **sustain pedálu** a velocity).
- **@tonaljs/tonal** pro detekci akordů.
- **VexFlow** pro vykreslení aktuálních not (nejprve houslový klíč, později basový).

---

## Možná rozšíření
- Přepínání ladění (A4 = 440/442 Hz).
- Metronom (Tone.js) + kvantizace pro zápis do not.
- Záznam a export do **MIDI (SMF)**, import/export **MusicXML** (OSMD).
- Nápověda **prstokladu** (heuristiky dle intervalu/polohy).
- Trénink: **škály, intervaly, akordové vzory**, gamifikace.
- **MPE/aftertouch** podpora pro výrazové klaviatury.

---

## Bezpečnost, licence a práva
- Web MIDI/Audio vyžaduje HTTPS + uživatelské gesto.
- **Soundfonty/samply**: zkontrolujte licenci (některé balíky mohou být velké a ne zcela open).
- Neposílejte **SysEx** pokud to nepotřebujete (omezuje povolení v prohlížečích).

---

## Troubleshooting
- **Žádný zvuk**: nezapomenout `Tone.start()` po uživatelském kliknutí, zkontrolujte hlasitost a toDestination.
- **Žádný MIDI vstup**: prohlížeč, HTTPS, práva; zkuste Chrome/Edge.
- **Vysoká latence**: snižte lookahead, minimalizujte grafické změny, použijte přednačtené samply.
- **Detekce akordu není konzistentní**: normalizujte na pitch‑class, ošetřete enharmonické názvy (C# vs. Db), zvažte basový tón.

---

*Autor: automaticky vygenerováno (M365 Copilot).*
