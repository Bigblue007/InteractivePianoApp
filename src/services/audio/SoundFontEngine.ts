import { AudioContextManager } from './AudioContextManager';
import { SoundFontEngine, AudioVoice } from './types';

/**
 * Engine pro přehrávání sf2 soundfontů
 * Pro MVP používá jednoduchý přístup s možností rozšíření o TinySoundFont WASM
 */
export type InstrumentType = 'piano' | 'dx7';

export class SimpleSoundFontEngine implements SoundFontEngine {
  private audioContext: AudioContext;
  private masterGain: GainNode;
  private voices: Map<number, AudioVoice> = new Map();
  private activeOscillators: Map<number, OscillatorNode[]> = new Map();
  private activeGainNodes: Map<number, GainNode[]> = new Map();
  private activeTimeouts: Map<number, ReturnType<typeof setTimeout>> = new Map();
  // @ts-expect-error - Připraveno pro budoucí použití s TinySoundFont WASM
  private soundFontData: ArrayBuffer | null = null;
  private loaded: boolean = false;
  private sustain: boolean = false;
  private sustainPool: Set<number> = new Set();
  private instrumentType: InstrumentType = 'piano'; // Výchozí typ nástroje

  constructor() {
    this.audioContext = AudioContextManager.getContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.value = 0.7;
  }

  /**
   * Načte sf2 soundfont ze URL nebo nastaví typ nástroje
   * Poznámka: Pro plnou podporu sf2 je potřeba TinySoundFont WASM
   * Tato implementace je placeholder pro MVP
   */
  async loadSoundFont(url: string): Promise<void> {
    try {
      // Zkontrolovat, zda je to syntetický nástroj (ne skutečný soundfont)
      if (url === 'synthetic:piano' || url === 'synthetic:dx7') {
        this.instrumentType = url === 'synthetic:piano' ? 'piano' : 'dx7';
        this.loaded = true;
        console.log(`Syntetický nástroj načten: ${this.instrumentType}`);
        return;
      }
      
      // Načíst skutečný soundfont (pokud by se někdy použil)
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Nepodařilo se načíst soundfont: ${response.statusText}`);
      }
      this.soundFontData = await response.arrayBuffer();
      this.instrumentType = 'piano'; // Výchozí pro soundfont
      this.loaded = true;
      console.log('Soundfont načten (pro plnou podporu sf2 použijte TinySoundFont WASM)');
    } catch (error) {
      console.error('Chyba při načítání soundfontu:', error);
      throw error;
    }
  }

  /**
   * Spustí notu - volá správnou metodu podle typu nástroje
   */
  noteOn(midi: number, velocity: number = 127): void {
    if (!this.loaded) {
      console.warn('Soundfont není načten');
      return;
    }

    // Zastavit existující notu na stejném MIDI čísle (okamžitě)
    this.stopNoteImmediately(midi);

    // Volat správnou metodu podle typu nástroje
    if (this.instrumentType === 'dx7') {
      this.noteOnDX7(midi, velocity);
    } else {
      this.noteOnPiano(midi, velocity);
    }
  }

  /**
   * Spustí notu s vylepšeným realističtějším zvukem piana
   */
  private noteOnPiano(midi: number, velocity: number = 127): void {

    // Vytvořit vylepšený realističtější zvuk piana
    const frequency = this.midiToFrequency(midi);
    const now = this.audioContext.currentTime;
    const vel = velocity / 127;
    
    // Velocity-sensitive parametry
    const velocityGain = 0.3 + (vel * 0.7); // 30-100% gain podle velocity
    const attackTime = 0.002 + (vel * 0.008); // 2-10ms attack (rychlejší pro vyšší velocity)
    const decayTime = 0.15 + (vel * 0.25); // 150-400ms decay (delší pro vyšší velocity)
    const sustainLevel = 0.15 + (vel * 0.25); // 15-40% sustain (vyšší pro vyšší velocity)
    
    // Vytvořit mixer gain node pro kombinaci všech oscilátorů
    const mixerGain = this.audioContext.createGain();
    
    const oscillators: OscillatorNode[] = [];
    const gainNodes: GainNode[] = [];
    
    // Piano harmonické spektrum s inharmonicity (neharmoničnost strun)
    // Inharmonicity: vyšší harmonické jsou mírně vyšší než čisté násobky
    const inharmonicityFactor = 0.0001; // 0.01% pro každou harmonickou
    
    // 1. Fundamentální tón (hlavní frekvence) - triangle wave
    const fundamental = this.createPianoOscillator(
      frequency, 
      'triangle', 
      velocityGain * 1.0, 
      now, 
      mixerGain,
      attackTime,
      decayTime,
      sustainLevel
    );
    oscillators.push(fundamental.oscillator);
    gainNodes.push(fundamental.gainNode);
    
    // 2. Druhá harmonická (oktáva výš) - 28% amplitudy
    const harmonic2Freq = frequency * 2 * (1 + inharmonicityFactor * 2);
    const harmonic2 = this.createPianoOscillator(
      harmonic2Freq, 
      'triangle', 
      velocityGain * 0.28, 
      now, 
      mixerGain,
      attackTime * 1.1,
      decayTime * 0.9,
      sustainLevel * 0.8
    );
    oscillators.push(harmonic2.oscillator);
    gainNodes.push(harmonic2.gainNode);
    
    // 3. Třetí harmonická (kvinta) - 18% amplitudy
    const harmonic3Freq = frequency * 3 * (1 + inharmonicityFactor * 3);
    const harmonic3 = this.createPianoOscillator(
      harmonic3Freq, 
      'sine', 
      velocityGain * 0.18, 
      now, 
      mixerGain,
      attackTime * 1.2,
      decayTime * 0.85,
      sustainLevel * 0.7
    );
    oscillators.push(harmonic3.oscillator);
    gainNodes.push(harmonic3.gainNode);
    
    // 4. Čtvrtá harmonická (dvě oktávy výš) - 12% amplitudy
    const harmonic4Freq = frequency * 4 * (1 + inharmonicityFactor * 4);
    const harmonic4 = this.createPianoOscillator(
      harmonic4Freq, 
      'sine', 
      velocityGain * 0.12, 
      now, 
      mixerGain,
      attackTime * 1.3,
      decayTime * 0.8,
      sustainLevel * 0.6
    );
    oscillators.push(harmonic4.oscillator);
    gainNodes.push(harmonic4.gainNode);
    
    // 5. Pátá harmonická - 8% amplitudy
    const harmonic5Freq = frequency * 5 * (1 + inharmonicityFactor * 5);
    const harmonic5 = this.createPianoOscillator(
      harmonic5Freq, 
      'sine', 
      velocityGain * 0.08, 
      now, 
      mixerGain,
      attackTime * 1.4,
      decayTime * 0.75,
      sustainLevel * 0.5
    );
    oscillators.push(harmonic5.oscillator);
    gainNodes.push(harmonic5.gainNode);
    
    // 6. Šestá harmonická - 4% amplitudy
    const harmonic6Freq = frequency * 6 * (1 + inharmonicityFactor * 6);
    const harmonic6 = this.createPianoOscillator(
      harmonic6Freq, 
      'sine', 
      velocityGain * 0.04, 
      now, 
      mixerGain,
      attackTime * 1.5,
      decayTime * 0.7,
      sustainLevel * 0.4
    );
    oscillators.push(harmonic6.oscillator);
    gainNodes.push(harmonic6.gainNode);
    
    // Dynamický low-pass filtr podle velocity a frekvence
    // Vyšší noty mají více high-freq, nižší noty jsou teplejší
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    
    // Frekvence filtru: 3000-8000 Hz podle velocity a MIDI noty
    const baseFilterFreq = 3000 + (vel * 3000); // 3000-6000 Hz podle velocity
    const noteFilterOffset = (midi - 60) * 50; // +50 Hz na každou notu od C4
    filter.frequency.value = Math.max(2000, Math.min(10000, baseFilterFreq + noteFilterOffset));
    filter.Q.value = 0.7; // Mírně nižší Q pro plynulejší rolloff
    
    // High-shelf filtr pro jemné potlačení vysokých frekvencí
    const highShelf = this.audioContext.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.value = 5000;
    highShelf.gain.value = -3; // -3dB pro teplejší zvuk
    
    // Připojit: mixer -> lowpass -> highshelf -> master
    mixerGain.connect(filter);
    filter.connect(highShelf);
    highShelf.connect(this.masterGain);

    // Uložit reference pro tracking
    this.activeOscillators.set(midi, oscillators);
    this.activeGainNodes.set(midi, gainNodes);
    this.voices.set(midi, {
      midi,
      gainNode: mixerGain,
      sourceNode: oscillators[0] as unknown as AudioBufferSourceNode,
    });

    // Cleanup timeout - delší pro nižší noty (realističtější)
    const duration = 2000 + (midi < 60 ? (60 - midi) * 50 : 0); // 2-5 sekund
    const timeout = setTimeout(() => {
      this.stopNoteImmediately(midi);
    }, duration);
    
    this.activeTimeouts.set(midi, timeout);
  }

  /**
   * Spustí notu s DX7-style elektrickým pianem (FM synthesis)
   */
  private noteOnDX7(midi: number, velocity: number = 127): void {
    const frequency = this.midiToFrequency(midi);
    const now = this.audioContext.currentTime;
    const vel = velocity / 127;
    
    // DX7 charakteristiky: bright, metallic, rychlý attack, delší sustain
    const velocityGain = 0.4 + (vel * 0.6); // 40-100% gain
    const attackTime = 0.001 + (vel * 0.004); // 1-5ms attack (velmi rychlý)
    const decayTime = 0.05 + (vel * 0.15); // 50-200ms decay
    const sustainLevel = 0.6 + (vel * 0.3); // 60-90% sustain (vysoký)
    
    // Vytvořit mixer gain node
    const mixerGain = this.audioContext.createGain();
    
    const oscillators: OscillatorNode[] = [];
    const gainNodes: GainNode[] = [];
    
    // DX7 používá FM synthesis - simulace pomocí více oscilátorů
    // Carrier (hlavní tón) - square wave pro metallic sound
    const carrier = this.createDX7Oscillator(
      frequency,
      'square',
      velocityGain * 0.7,
      now,
      mixerGain,
      attackTime,
      decayTime,
      sustainLevel
    );
    oscillators.push(carrier.oscillator);
    gainNodes.push(carrier.gainNode);
    
    // Modulator (FM) - vyšší frekvence pro metallic charakter
    const modulatorFreq = frequency * 2.5; // 2.5x pro charakteristický DX7 sound
    const modulator = this.createDX7Oscillator(
      modulatorFreq,
      'sine',
      velocityGain * 0.3,
      now,
      mixerGain,
      attackTime * 0.8,
      decayTime * 1.2,
      sustainLevel * 0.9
    );
    oscillators.push(modulator.oscillator);
    gainNodes.push(modulator.gainNode);
    
    // Další harmonická pro bohatší zvuk
    const harmonic = this.createDX7Oscillator(
      frequency * 2,
      'triangle',
      velocityGain * 0.15,
      now,
      mixerGain,
      attackTime * 1.2,
      decayTime * 0.9,
      sustainLevel * 0.7
    );
    oscillators.push(harmonic.oscillator);
    gainNodes.push(harmonic.gainNode);
    
    // Bright high-frequency content
    const bright = this.createDX7Oscillator(
      frequency * 4,
      'sine',
      velocityGain * 0.1,
      now,
      mixerGain,
      attackTime * 1.5,
      decayTime * 0.7,
      sustainLevel * 0.5
    );
    oscillators.push(bright.oscillator);
    gainNodes.push(bright.gainNode);
    
    // Bright high-pass filtr pro charakteristický DX7 sound
    const highPass = this.audioContext.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.value = 200; // Odříznout velmi nízké frekvence
    highPass.Q.value = 0.5;
    
    // Slight resonance boost kolem 2-4kHz pro brightness
    const resonance = this.audioContext.createBiquadFilter();
    resonance.type = 'peaking';
    resonance.frequency.value = 3000;
    resonance.Q.value = 2;
    resonance.gain.value = 3; // +3dB boost
    
    // Připojit: mixer -> highpass -> resonance -> master
    mixerGain.connect(highPass);
    highPass.connect(resonance);
    resonance.connect(this.masterGain);

    // Uložit reference pro tracking
    this.activeOscillators.set(midi, oscillators);
    this.activeGainNodes.set(midi, gainNodes);
    this.voices.set(midi, {
      midi,
      gainNode: mixerGain,
      sourceNode: oscillators[0] as unknown as AudioBufferSourceNode,
    });

    // Cleanup timeout
    const duration = 3000 + (vel * 2000); // 3-5 sekund
    const timeout = setTimeout(() => {
      this.stopNoteImmediately(midi);
    }, duration);
    
    this.activeTimeouts.set(midi, timeout);
  }

  /**
   * Vytvoří oscilátor s DX7 envelope (rychlý attack, vysoký sustain)
   */
  private createDX7Oscillator(
    frequency: number,
    type: OscillatorType,
    amplitude: number,
    startTime: number,
    output: GainNode,
    attackTime: number,
    decayTime: number,
    sustainLevel: number
  ): { oscillator: OscillatorNode; gainNode: GainNode } {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    // DX7 envelope: velmi rychlý attack, střední decay, vysoký sustain
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(amplitude, startTime + attackTime);
    
    // Decay: exponenciální pokles
    const decayEndTime = startTime + attackTime + decayTime;
    const decaySteps = 8;
    const decayRatio = sustainLevel;
    
    for (let i = 1; i <= decaySteps; i++) {
      const t = startTime + attackTime + (decayTime * i / decaySteps);
      const value = amplitude * Math.pow(decayRatio, i / decaySteps);
      gainNode.gain.linearRampToValueAtTime(value, t);
    }
    
    // Sustain: držet hodnotu
    gainNode.gain.setValueAtTime(amplitude * sustainLevel, decayEndTime);

    oscillator.connect(gainNode);
    gainNode.connect(output);
    oscillator.start(startTime);

    return { oscillator, gainNode };
  }

  /**
   * Vytvoří oscilátor s vylepšeným piano envelope (exponenciální decay)
   */
  private createPianoOscillator(
    frequency: number,
    type: OscillatorType,
    amplitude: number,
    startTime: number,
    output: GainNode,
    attackTime: number,
    decayTime: number,
    sustainLevel: number
  ): { oscillator: OscillatorNode; gainNode: GainNode } {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    // Vylepšený piano envelope s exponenciálním decay
    // Attack: rychlý nástup
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(amplitude, startTime + attackTime);
    
    // Decay: exponenciální pokles (simulace pomocí více lineárních segmentů)
    const decayEndTime = startTime + attackTime + decayTime;
    const decaySteps = 10; // Počet kroků pro exponenciální aproximaci
    const decayRatio = sustainLevel; // Cílová hodnota (sustain level)
    
    for (let i = 1; i <= decaySteps; i++) {
      const t = startTime + attackTime + (decayTime * i / decaySteps);
      // Exponenciální křivka: amplitude * (sustainLevel)^(i/decaySteps)
      const value = amplitude * Math.pow(decayRatio, i / decaySteps);
      gainNode.gain.linearRampToValueAtTime(value, t);
    }
    
    // Sustain: držet hodnotu
    gainNode.gain.setValueAtTime(amplitude * sustainLevel, decayEndTime);

    oscillator.connect(gainNode);
    gainNode.connect(output);
    oscillator.start(startTime);

    return { oscillator, gainNode };
  }

  /**
   * Okamžitě zastaví notu (používá se při noteOn pro zastavení předchozí noty)
   */
  private stopNoteImmediately(midi: number): void {
    // Zrušit timeout cleanup, pokud existuje
    const timeout = this.activeTimeouts.get(midi);
    if (timeout) {
      clearTimeout(timeout);
      this.activeTimeouts.delete(midi);
    }

    // Nejdřív okamžitě zastavíme zvuk pomocí gain nodes (okamžité zastavení)
    const gainNodes = this.activeGainNodes.get(midi);
    if (gainNodes) {
      const now = this.audioContext.currentTime;
      gainNodes.forEach(gainNode => {
        try {
          // Okamžitě nastavíme gain na 0 pro okamžité zastavení zvuku
          gainNode.gain.cancelScheduledValues(now);
          gainNode.gain.setValueAtTime(0, now);
        } catch (e) {
          // Ignorujeme chyby při zastavování
        }
      });
    }

    // Pak zastavíme oscilátory
    const oscillators = this.activeOscillators.get(midi);
    if (oscillators) {
      oscillators.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {
          // Ignorujeme chyby při zastavování
        }
      });
      this.activeOscillators.delete(midi);
    }

    // Smazat všechny reference
    this.activeGainNodes.delete(midi);
    this.voices.delete(midi);
  }

  /**
   * Zastaví notu (s podporou sustain pedálu)
   */
  noteOff(midi: number): void {
    if (this.sustain) {
      this.sustainPool.add(midi);
      return;
    }

    // Okamžitě zastavit notu
    this.stopNoteImmediately(midi);
  }

  /**
   * Nastaví sustain pedál
   */
  setSustain(sustain: boolean): void {
    this.sustain = sustain;
    if (!sustain) {
      // Uvolnit všechny noty ze sustain poolu - okamžitě zastavit
      for (const midi of this.sustainPool) {
        this.stopNoteImmediately(midi);
      }
      this.sustainPool.clear();
    }
  }

  /**
   * Zavře engine a uvolní zdroje
   */
  dispose(): void {
    // Zastavit všechny noty okamžitě
    const allMidiNotes = Array.from(this.voices.keys());
    for (const midi of allMidiNotes) {
      this.stopNoteImmediately(midi);
    }
    
    // Zrušit všechny timeouts
    for (const timeout of this.activeTimeouts.values()) {
      clearTimeout(timeout);
    }
    
    // Vyčistit všechny reference
    this.voices.clear();
    this.activeOscillators.clear();
    this.activeGainNodes.clear();
    this.activeTimeouts.clear();
    this.sustainPool.clear();
  }

  /**
   * Konvertuje MIDI číslo na frekvenci
   */
  private midiToFrequency(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
}


