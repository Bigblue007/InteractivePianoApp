# Průzkum technologií pro Harmonia
## Webová MIDI aplikace se zvukovým enginem a vizualizací

---

## Executive Summary

Pro aplikaci **Harmonia** (webová MIDI klaviatura s detekcí akordů a notovým zápisem) existují 4 hlavní přístupy k řešení zvukového enginu a přehrávání nástroj:

| Přístup | Vhodnost | Komplexnost | Overhead |
|---------|----------|------------|----------|
| **SF2 + soundfont2** | ⭐⭐⭐ Dobrá | Střední | ~500KB–5MB |
| **WAV sampler + Web Audio** | ⭐⭐⭐⭐ Výborná | Nízká | Variabilní |
| **Tone.js + synth** | ⭐⭐ Omezená | Nízká | ~50KB |
| **Hybridní řešení** | ⭐⭐⭐⭐⭐ Ideální | Střední | Modulární |

---

## 1. SF2 Soundfont + soundfont2 Knihovna

### Popis
SF2 (SoundFont 2) je binární formát pro ukládání zvukových bank – obsahuje samplované tóny a metadata o jejich přehrávání (envelopa, pedal behavior, velocity vrstvy).

Knihovna `soundfont2` je JavaScript parser, který SF2 načte a přehraje přes Web Audio API.

### Výhody
- ✅ **Kompletní sada zvuků v jednom souboru** – máš všechny instrumenty pohromadě
- ✅ **Hotové free SF2 knihovny** – Production Voices, Pianobook, ZanderJaz, ChusoCol
- ✅ **Pedal behavior** – sustain pedál je už v SF2 zakódován
- ✅ **Velocity vrstvy** – SF2 obsahuje různé vzorky pro různé dynamiky
- ✅ **Rozšířitelný formát** – můžeš si udělat svůj SF2 v Viewu nebo sfz parseru
- ✅ **Standardní** – SF2 používají DAW a hardware soupravy desítky let

### Nevýhody
- ❌ **Velikost** – kvalitní piano SF2 je 100–1000 MB (zatímco pro web se snažíš o <10MB)
- ❌ **Komplexní parser** – `soundfont2` zvládne basic playback, ale custom features jsou limitované
- ❌ **Latence** – parsování a inicializace SF2 trvá čas (zejména na mobilech)
- ❌ **Browser support** – Web Audio API je stabilní, ale SF2 support není všude stejný
- ❌ **Úpravy zvuků** – chceš-li změnit tón/filtr, musíš mít pokročilé znalosti Web Audio

### Způsob použití v Harmonia
```typescript
// 1. Načtení SF2
const soundfontBuffer = await fetch('/soundfonts/piano.sf2')
  .then(r => r.arrayBuffer());
const sf2 = await SoundFont2.from(new Uint8Array(soundfontBuffer));

// 2. Mapování presete → nám znám nástroj
const presets = {
  'piano': 0,      // SF2 preset index 0
  'epiano': 4,
  'guitar': 24,
  'bass': 32,
};

// 3. MIDI vstup → SF2 playback
midiInput.addListener('noteon', (e) => {
  const note = e.note.number;
  const velocity = e.velocity;
  const instrumentIndex = presets[currentInstrument];
  
  playSF2Note(sf2, instrumentIndex, note, velocity);
});

// 4. Sustain pedál (CC64) – SF2 to řeší automaticky
midiInput.addListener('controlchange', (e) => {
  if (e.controller.number === 64) {
    handleSustain(e.value >= 64);
  }
});
```

### Kdy to použít
- ✅ Chceš všechny klasické orchestrální nástroje v jedné appce
- ✅ Máš dostatek datového provozu (hosting > 50MB SF2 je OK)
- ✅ Potřebuješ profesionální zvuk bez vlastního samplovani
- ✅ Uživatelé jsou především na desktopu
- ❌ Nepoužívej, pokud: mobilní appka, rychlý startup, custom sound design

---

## 2. WAV Sampler + Web Audio API

### Popis
Vlastní nebo free sample knihovna (WAV/OGG/MP3) + JavaScript sampler, který je načte a přehraje přes Web Audio API. Ty kontroluješ vše: velocity mapování, sustain, filtrování.

### Výhody
- ✅ **Maximální kontrol** – přesně víš, co se přehrává
- ✅ **Minimální overhead** – jen ten código, který potřebuješ
- ✅ **Snadná velocity implementace** – velocity → gain/filtr ve tvém kódu
- ✅ **Modulární** – snadno přidáš reverb, delay, filtr
- ✅ **Rychlý startup** – nezačínaš s 500MB SF2
- ✅ **Mobile-friendly** – můžeš mít sadu <5MB samplů
- ✅ **Sustain řízení v kódu** – přesně vědíš, jak pedál funguje

### Nevýhody
- ❌ **Samplování** – musíš si nějakou sadu připravit (nebo najít free)
- ❌ **Programování samplingu** – velocity vrstvy, pitch shifting, envelope musíš napsat sám
- ❌ **Více souborů** – místo jednoho SF2 máš stovky WAV/OGG
- ❌ **Overhead v kódu** – více logiky na tvé straně

### Způsob použití v Harmonia
```typescript
// 1. Definice samplů
const instruments = {
  piano: {
    name: 'Acoustic Piano',
    samples: {
      'C2-soft': { url: '/samples/piano/C2-p.wav', velocity: 'soft' },
      'C2-medium': { url: '/samples/piano/C2-mf.wav', velocity: 'medium' },
      'C2-hard': { url: '/samples/piano/C2-f.wav', velocity: 'hard' },
      // ... další noty a velocity vrstvy
    }
  },
  epiano: { /* ... */ },
  guitar: { /* ... */ }
};

// 2. Sampler helper
class SimpleSampler {
  private buffers = new Map<string, AudioBuffer>();
  private activeNotes = new Map<number, AudioBufferSourceNode>();
  
  constructor(private audioContext: AudioContext) {}
  
  async loadSample(key: string, url: string) {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.buffers.set(key, audioBuffer);
  }
  
  playNote(sampleKey: string, velocity: number, duration = 2) {
    const buffer = this.buffers.get(sampleKey);
    if (!buffer) return;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    
    // Velocity → gain
    const gain = this.audioContext.createGain();
    gain.gain.value = Math.min(velocity, 1);
    
    source.connect(gain);
    gain.connect(this.audioContext.destination);
    source.start();
    
    // Stop po duration
    setTimeout(() => source.stop(), duration * 1000);
  }
}

// 3. MIDI integration
midiInput.addListener('noteon', (e) => {
  const note = e.note.number;
  const velocity = e.velocity; // 0–1
  
  // Mapování: note → sample key
  const velocityLayer = velocity < 0.4 ? 'soft' : velocity < 0.7 ? 'medium' : 'hard';
  const sampleKey = `${e.note.name}-${velocityLayer}`;
  
  sampler.playNote(sampleKey, velocity);
});
```

### Kdy to použít
- ✅ Chceš rychlý, lightweight startup
- ✅ Máš svoje piano recordings (nebo free library)
- ✅ Chceš přesně kontrolovat sustain a release
- ✅ Mobile appka je priorita
- ✅ Chceš custom sound design (reverb, compression)
- ❌ Nepoužívej, pokud: chceš 100+ nástrojů, nemáš čas na sampling

---

## 3. Tone.js + Synthesizer

### Popis
Tone.js je abstrakce nad Web Audio API. Nabízí prebuilt synthy (Sine, Sawtooth, Square) a efekty. Není to sampler, ale syntetizátor – tóny generuje z principu, ne ze samplů.

### Výhody
- ✅ **Velmi lightweight** – ~50KB minified
- ✅ **Jednoduchý API** – `new Tone.Synth().toDestination()`
- ✅ **Efekty** – reverb, delay, chorus zabudované
- ✅ **Scheduling** – Transport API pro synchronizaci
- ✅ **Rychlý start** – žádné loading samplů/SF2

### Nevýhody
- ❌ **Syntetický zvuk** – nikdy se nepodívá jako akustické piano
- ❌ **Limitované pro MIDI klaviaturu** – synthy nejsou určeny k naturalismu
- ❌ **Chybí velocity detaily** – těžké napravit touch-response
- ❌ **Ne ideální pro múziky** – Tone.js je spíš pro experimental/electronic

### Způsob použití v Harmonia
```typescript
import * as Tone from 'tone';

const synth = new Tone.Synth({
  oscillator: { type: 'sine' },
  envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 1 }
}).toDestination();

midiInput.addListener('noteon', (e) => {
  const note = Tone.Frequency(e.note.number, 'midi').toNote();
  synth.triggerAttack(note, Tone.now());
});

midiInput.addListener('noteoff', (e) => {
  const note = Tone.Frequency(e.note.number, 'midi').toNote();
  synth.triggerRelease(note, Tone.now());
});
```

### Kdy to použít
- ✅ Chceš základní zvuk bez samplování
- ✅ Appka je experimental/edukativní
- ✅ Pouštíš to přes reproduktory, ne sluchátka
- ❌ Nepoužívej, pokud: chceš realistický zvuk instrumentů

---

## 4. Hybridní řešení (DOPORUČENO pro Harmonia)

### Popis
Kombinuj několik technologií podle instrumentu:
- **Piano, E-piano** → free sample library (WAV sampler)
- **Synth pads** → Tone.js
- **Orchestrální** → mají SF2 či samples
- **Bass, kytara** → free samples

### Výhody (kombinuje best of both worlds)
- ✅ **Realizmus pro klávesové** – vlastní piano sampler
- ✅ **Flexibility** – synth pro experimentování
- ✅ **Modulární** – každá nástroj má optimální řešení
- ✅ **Performance** – jen to, co se používá
- ✅ **Future-proof** – snadno přidáš další nástroj

### Příklad architektury
```typescript
// instrument.ts
interface InstrumentConfig {
  type: 'sampler' | 'synth' | 'soundfont';
  name: string;
  settings: any;
}

const instruments: Record<string, InstrumentConfig> = {
  piano: {
    type: 'sampler',
    name: 'Acoustic Piano',
    settings: {
      samples: '/samples/piano/',
      velocityLayers: 3,
      release: 2.0
    }
  },
  epiano: {
    type: 'sampler',
    name: 'Electric Piano',
    settings: {
      samples: '/samples/epiano/',
      velocityLayers: 2,
      release: 0.5
    }
  },
  pad: {
    type: 'synth',
    name: 'Synth Pad',
    settings: {
      oscillator: 'square',
      attack: 0.5,
      release: 2
    }
  },
  guitar: {
    type: 'sampler',
    name: 'Acoustic Guitar',
    settings: {
      samples: '/samples/guitar/',
      velocityLayers: 2
    }
  }
};

// engine.ts
class HarmoniaAudioEngine {
  private samplers = new Map<string, SimpleSampler>();
  private synths = new Map<string, Tone.Synth>();
  private currentInstrument: string = 'piano';
  
  async initialize() {
    // Inicializuj jen piano
    this.samplers.set('piano', new SimpleSampler(this.audioContext));
    await this.preloadSamples('piano');
  }
  
  async switchInstrument(name: string) {
    const config = instruments[name];
    
    if (config.type === 'sampler' && !this.samplers.has(name)) {
      const sampler = new SimpleSampler(this.audioContext);
      await this.preloadSamples(name);
      this.samplers.set(name, sampler);
    } else if (config.type === 'synth' && !this.synths.has(name)) {
      const synth = new Tone.Synth(config.settings);
      this.synths.set(name, synth);
    }
    
    this.currentInstrument = name;
  }
  
  playNote(midiNote: number, velocity: number) {
    const config = instruments[this.currentInstrument];
    
    switch (config.type) {
      case 'sampler':
        const sampler = this.samplers.get(this.currentInstrument);
        sampler?.playNote(midiNote, velocity);
        break;
      case 'synth':
        const synth = this.synths.get(this.currentInstrument);
        const note = Tone.Frequency(midiNote, 'midi').toNote();
        synth?.triggerAttack(note, Tone.now());
        break;
    }
  }
}
```

### Kdy to použít
- ✅ **IDEÁLNÍ PRO HARMONIA** – máš různé instrumenty, chceš best quality
- ✅ Startup je optimální (jen piano se načte)
- ✅ Extensible – můžeš postupně přidávat
- ✅ Mobile-friendly – malý initial payload

---

## 5. Srovnění podle kritérií

| Kritérium | SF2 | Sampler | Tone.js | Hybrid |
|-----------|-----|---------|---------|--------|
| **Realismus zvuku** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ |
| **Ease of use** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Performance** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Payload** | ❌ 100–1000 MB | ⭐⭐⭐ 10–50 MB | ⭐⭐⭐⭐ 50 KB | ⭐⭐⭐ 20 MB |
| **Velocity support** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Sustain pedál** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Mobile-ready** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 6. Free Sample Knihovny pro Sampler Přístup

Pokud se rozhodneš jít WAV sampler cestou, tady jsou best free resources:

### Piano
- **Production Voices Free Piano** – Quality piano, FLAC, velocity vrstvy
  - URL: `productionvoices.com/free-piano-sample-library/`
- **Pianobook** – Komunita, stovky pian, různé kvalit
  - URL: `pianobook.co.uk`

### Orchestrální / Multi-instrument
- **Spitfire Labs Free** – BBC Symphony Orchestra, omezené ale kvalitní
- **Philharmonic Freebies** – Orchestrální samply
- **ChusoCol** – Open-source sada, všechny klasické nástroje

### E-Piano, Bass, Kytara
- **Landr Free Samples** – Předsledy, e-piano, synths
- **Freepats** – Community SFZ/WAV libraye
- **Versilian Studio Orchestra** – Orchestrální + klasické nástroje (open-source)

---

## 7. Technická Integrace s Harmonia Stack

Tvůj aktuální stack:
- React 18 + TypeScript
- Zustand (state)
- Web Audio API
- Web MIDI API

### Doporučená rozšíření

#### Option 1: Sampler-first (DOPORUČENO)
```bash
npm install webmidi tone
# (soundfont2 pro později, pokud potřebuješ)
```

Vytvoříš services:
- `audioEngine.ts` – abstrakce Web Audio + sampler
- `midiController.ts` – Web MIDI Event routing
- `instrumentManager.ts` – Switching & config
- Store v Zustand: `audioStore.ts`

#### Option 2: SF2 + sampler hybrid
```bash
npm install webmidi tone soundfont2
```

Přidáš:
- `soundfontLoader.ts` – SF2 parser
- `instrumentSelector.ts` – UI pro výběr (SF2 vs sampler)

---

## 8. Roadmap Implementace

### Fáze 1: MVP (Týden 1–2)
- [ ] Web MIDI API integration (noteon/noteoff/CC64)
- [ ] Tone.js basic synth (proof of concept)
- [ ] Zustand store pro MIDI state
- [ ] Sustain pedál (CC64) logic

```typescript
// midi-store.ts
interface MidiState {
  connectedDevices: MIDIInput[];
  sustainActive: boolean;
  activeNotes: Set<number>;
  currentInstrument: string;
}
```

### Fáze 2: Sampler (Týden 2–3)
- [ ] SimpleSampler třída (WAV playback)
- [ ] Free piano sample library (vzorky)
- [ ] Velocity → gain/filter mapování
- [ ] Sustain release logic

```typescript
// sampler-store.ts
interface SamplerState {
  samplers: Map<string, SimpleSampler>;
  loadedSamples: Set<string>;
  currentInstrument: 'piano' | 'epiano' | 'synth';
}
```

### Fáze 3: Multi-instrument (Týden 3–4)
- [ ] Přidání e-piano, synthu, dalších
- [ ] Lazy loading samplů
- [ ] Instrument selector UI

### Fáze 4: Polish (Týden 4–5)
- [ ] Reverb/delay efekty (Web Audio ConvolverNode)
- [ ] ADSR envelope control
- [ ] Recording/playback sekvencí
- [ ] Export MIDI

---

## 9. Doporučení pro Harmonia

### Nejlepší volba: **Hybridní sampler + Tone.js**

**Důvody:**
1. **Piano/E-piano** → vlastní sampler ze free library (Production Voices)
   - Dává best realismu pro tvou primary use-case
   - Velocity vrstvy kontroluješ ty
   - Sustain je precizní

2. **Synth pads** → Tone.js
   - Lehké na startup
   - Skvělý pro experimentaci

3. **Budoucnost:**
   - Později přidáš kytaru, bas (sampler)
   - Orchestrální → SF2 nebo samply

### Next Steps
1. **Stáhni Production Voices Free Piano** (FLAC) a vyber si 1–2 velocity vrstvy
2. **Napiš SimpleSampler třídu** ve svém React projektu
3. **Integruj WebMIDI.js** pro MIDI input
4. **Build sustain logic** na úrovni audio engine
5. **Stav v Zustand** → `audioStore` s aktivními notami, instrument config

---

## Referenční materiály

- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **Web MIDI API**: https://www.w3.org/TR/webmidi/
- **Tone.js Docs**: https://tonejs.github.io/
- **soundfont2 Lib**: https://github.com/mrtenz/soundfont2
- **WebMIDI.js**: https://webmidijs.org/
- **Pianobook**: https://www.pianobook.co.uk/
- **Production Voices**: https://www.productionvoices.com/

---

**Verze:** 1.0 | **Datum:** Prosinec 2025 | **Pro:** Harmonia Web App