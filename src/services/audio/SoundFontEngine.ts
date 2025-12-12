import { AudioContextManager } from './AudioContextManager';
import { SoundFontEngine, AudioVoice } from './types';

/**
 * Engine pro přehrávání sf2 soundfontů
 * Pro MVP používá jednoduchý přístup s možností rozšíření o TinySoundFont WASM
 */
export class SimpleSoundFontEngine implements SoundFontEngine {
  private audioContext: AudioContext;
  private masterGain: GainNode;
  private voices: Map<number, AudioVoice> = new Map();
  private activeOscillators: Map<number, OscillatorNode[]> = new Map();
  private activeGainNodes: Map<number, GainNode[]> = new Map();
  private activeTimeouts: Map<number, NodeJS.Timeout> = new Map();
  private soundFontData: ArrayBuffer | null = null;
  private loaded: boolean = false;
  private sustain: boolean = false;
  private sustainPool: Set<number> = new Set();

  constructor() {
    this.audioContext = AudioContextManager.getContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.value = 0.7;
  }

  /**
   * Načte sf2 soundfont ze URL
   * Poznámka: Pro plnou podporu sf2 je potřeba TinySoundFont WASM
   * Tato implementace je placeholder pro MVP
   */
  async loadSoundFont(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Nepodařilo se načíst soundfont: ${response.statusText}`);
      }
      this.soundFontData = await response.arrayBuffer();
      this.loaded = true;
      console.log('Soundfont načten (pro plnou podporu sf2 použijte TinySoundFont WASM)');
    } catch (error) {
      console.error('Chyba při načítání soundfontu:', error);
      throw error;
    }
  }

  /**
   * Spustí notu
   */
  noteOn(midi: number, velocity: number = 127): void {
    if (!this.loaded) {
      console.warn('Soundfont není načten');
      return;
    }

    // Zastavit existující notu na stejném MIDI čísle (okamžitě)
    this.stopNoteImmediately(midi);

    // Pro MVP: vytvořit jednoduchý tón pomocí OscillatorNode
    // TODO: Nahradit TinySoundFont WASM pro plnou podporu sf2
    const frequency = this.midiToFrequency(midi);
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    // Envelope: attack, decay, sustain, release
    const now = this.audioContext.currentTime;
    const vel = velocity / 127;
    const duration = 2000; // 2 sekundy defaultní délka
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(vel * 0.3, now + 0.01); // attack
    gainNode.gain.linearRampToValueAtTime(vel * 0.2, now + 0.1); // decay
    gainNode.gain.setValueAtTime(vel * 0.2, now + 0.1); // sustain

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(now);

    // Uložit reference pro tracking
    const oscillators = [oscillator];
    const gainNodes = [gainNode];
    
    this.activeOscillators.set(midi, oscillators);
    this.activeGainNodes.set(midi, gainNodes);
    this.voices.set(midi, {
      midi,
      gainNode,
      sourceNode: oscillator as unknown as AudioBufferSourceNode,
    });

    // Cleanup timeout pro automatické zastavení po dlouhé době (bezpečnostní opatření)
    const timeout = setTimeout(() => {
      this.stopNoteImmediately(midi);
    }, duration);
    
    this.activeTimeouts.set(midi, timeout);
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


