import { AudioContextManager } from './AudioContextManager';
import { SampleLoader } from './SampleLoader';
import { NativeSampleLoader } from './NativeSampleLoader';
import { InstrumentPreset, VelocityLayer, SampleConfig } from '../../config/instrumentPresets';

interface ActiveVoice {
  midi: number;
  sourceNode: AudioBufferSourceNode;
  gainNode: GainNode;
  startTime: number;
  scheduledTime: number; // Naplánovaný čas startu (pro lookahead)
  releaseTriggerUrl?: string; // URL pro release trigger sample
  isLooping: boolean; // Zda je sample v loop módu
}


/**
 * Sampler engine pro přehrávání audio samplů s podporou:
 * - Round Robin (RR1, RR2, RR3) pro variaci
 * - Release Trigger samply při noteOff
 * - Pedal samply (PD/PU) při sustain pedálu
 */
export class SimpleSampler {
  private audioContext: AudioContext;
  private masterGain: GainNode;
  private sampleLoader: SampleLoader | NativeSampleLoader;
  private loadedSamples: Map<string, AudioBuffer> = new Map();
  private activeVoices: Map<number, ActiveVoice[]> = new Map();
  private sustain: boolean = false;
  private sustainPool: Set<number> = new Set();
  private currentPreset: InstrumentPreset | null = null;
  private maxPitchShiftOctaves = 2.5; // Max ±2.5 oktávy pro pitch shifting (zvýšeno pro lepší pokrytí)
  private roundRobinCounter: Map<number, number> = new Map(); // Tracking Round Robin pro každou notu
  
  // Lookahead scheduling - VYPNUTO pro sampler (samply jsou už načtené, není potřeba)
  // Samply se přehrávají okamžitě pro rychlou odezvu

  constructor() {
    this.audioContext = AudioContextManager.getContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.value = 0.7;
    
    const isElectron = typeof window !== 'undefined' && !!window.electronAPI;
    this.sampleLoader = isElectron
      ? NativeSampleLoader.getInstance()
      : SampleLoader.getInstance();
    
    // Lookahead scheduler je vypnutý - samply se přehrávají okamžitě
  }

  /**
   * Načte preset a všechny jeho samply
   */
  async loadPreset(preset: InstrumentPreset): Promise<void> {
    if (preset.type !== 'sampler' || !preset.samples) {
      throw new Error('Preset není typu sampler nebo nemá samply');
    }

    this.currentPreset = preset;
    this.loadedSamples.clear();
    this.roundRobinCounter.clear();

    // Načíst všechny samply presetu (včetně Round Robin a Release Trigger)
    const samples = await this.sampleLoader.loadPresetSamples(preset.samples, preset.pedalSamples);
    this.loadedSamples = samples;

            // Spočítat skutečný počet očekávaných samplů na základě konfigurací
            let expectedCount = 0;
            let noteCount = 0;
            for (const config of preset.samples) {
              noteCount++;
              expectedCount += (config.layers.Level1?.length || 0);
              expectedCount += (config.layers.Level2?.length || 0);
              expectedCount += (config.layers.RT?.length || 0);
            }
            if (preset.pedalSamples) {
              const pedalCount = preset.pedalSamples.PD.length + preset.pedalSamples.PU.length;
              console.log(`Načteno ${samples.size} samplů pro preset ${preset.name} (${noteCount} not, očekáváno ~${expectedCount + pedalCount} samplů)`);
            } else {
              console.log(`Načteno ${samples.size} samplů pro preset ${preset.name} (${noteCount} not, očekáváno ~${expectedCount} samplů)`);
            }
  }

  /**
   * Zjistí velocity layer podle velocity hodnoty
   * Level1: 0-85 (soft)
   * Level2: 86-127 (hard)
   */
  private getVelocityLayer(velocity: number): VelocityLayer {
    return velocity <= 85 ? 'Level1' : 'Level2';
  }

  /**
   * Vybere Round Robin (RR1, RR2, RR3) - cyklické střídání pro každou notu
   */
  private selectRoundRobin(midi: number): number {
    // Použít counter pro střídání Round Robin (cyklické)
    const current = this.roundRobinCounter.get(midi) || 0;
    const next = (current + 1) % 3;
    this.roundRobinCounter.set(midi, next);
    
    return next; // Vrátit index (0, 1, 2)
  }

  /**
   * Najde nejbližší sample konfiguraci pro danou MIDI notu
   */
  private findNearestSampleConfig(midi: number): SampleConfig | null {
    if (!this.currentPreset || !this.currentPreset.samples) {
      return null;
    }

    if (this.currentPreset.samples.length === 0) {
      return null;
    }

    // Najít nejbližší sample konfiguraci
    let nearest = this.currentPreset.samples[0];
    let minDistance = Math.abs(midi - nearest.midi);

    for (const config of this.currentPreset.samples) {
      const distance = Math.abs(midi - config.midi);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = config;
      }
    }

    // Zkontrolovat, zda není pitch shift příliš velký
    const octaveDiff = Math.abs(midi - nearest.midi) / 12;
    if (octaveDiff > this.maxPitchShiftOctaves) {
      console.warn(`Pitch shift ${octaveDiff.toFixed(2)} oktáv pro MIDI ${midi} - může být snížená kvalita`);
    }

    return nearest;
  }

  /**
   * Vypočítá playback rate pro pitch shifting
   */
  private calculatePlaybackRate(targetMidi: number, sampleMidi: number): number {
    const semitoneDiff = targetMidi - sampleMidi;
    return Math.pow(2, semitoneDiff / 12);
  }



  /**
   * Přehrává notu (okamžitě, bez lookahead pro rychlou odezvu)
   */
  noteOn(midi: number, velocity: number = 127): void {
    if (!this.currentPreset) {
      console.warn('Preset není načten');
      return;
    }

    // Zastavit existující noty na stejném MIDI čísle
    this.stopNoteImmediately(midi);

    // Přehrát okamžitě (bez lookahead schedulingu pro rychlou odezvu)
    const now = this.audioContext.currentTime;
    this.playNoteImmediately(midi, velocity, now);
  }

  /**
   * Přehrává notu okamžitě (bez lookahead) - voláno ze scheduleru
   */
  private playNoteImmediately(midi: number, velocity: number, scheduledTime: number): void {
    if (!this.currentPreset) {
      return;
    }

    // Zjistit velocity layer
    const layer = this.getVelocityLayer(velocity);

    // Najít nejbližší sample konfiguraci
    const sampleConfig = this.findNearestSampleConfig(midi);
    if (!sampleConfig) {
      console.warn(`Nenalezen sample pro MIDI ${midi}`);
      return;
    }

    // Vybrat Round Robin index (0, 1, 2)
    const rrIndex = this.selectRoundRobin(midi);
    
    // Najít URL samplu podle layer a Round Robin
    // Pokud layer neexistuje, použít fallback na Level2 (všechny noty mají Level2)
    let sampleUrls = sampleConfig.layers[layer];
    let actualLayer = layer;
    if (!sampleUrls || sampleUrls.length === 0) {
      // Fallback na Level2, pokud požadovaný layer neexistuje
      if (layer !== 'Level2') {
        sampleUrls = sampleConfig.layers.Level2;
        actualLayer = 'Level2';
        if (!sampleUrls || sampleUrls.length === 0) {
          console.warn(`Nenalezeny samply pro MIDI ${midi}, layer ${layer} ani Level2`);
          return;
        }
      } else {
        console.warn(`Nenalezeny samply pro MIDI ${midi}, layer ${layer}`);
        return;
      }
    }

    // Najít správný sample podle Round Robin indexu
    const sampleUrl = sampleUrls[rrIndex];
    if (!sampleUrl) {
      console.warn(`Nenalezen sample pro MIDI ${midi}, layer ${actualLayer}, RR index ${rrIndex}`);
      return;
    }

    // Načíst buffer
    const buffer = this.loadedSamples.get(sampleUrl);
    if (!buffer) {
      console.warn(`Buffer nenalezen pro ${sampleUrl}`);
      return;
    }

    // Najít Release Trigger sample pro tuto notu
    const rtUrls = sampleConfig.layers.RT;
    const rtUrl = rtUrls ? rtUrls[rrIndex] : undefined;

    // Vytvořit source node
    const sourceNode = this.audioContext.createBufferSource();
    sourceNode.buffer = buffer;

    // Vypočítat a nastavit playback rate pro pitch shifting
    const playbackRate = this.calculatePlaybackRate(midi, sampleConfig.midi);
    sourceNode.playbackRate.value = playbackRate;

    // Loopování VYPNUTO - používáme dlouhé samply bez loopování
    // Samply se přehrají celé a skončí přirozeně

    // Vytvořit gain node pro velocity
    const gainNode = this.audioContext.createGain();
    const velocityGain = velocity / 127; // 0-1
    gainNode.gain.value = velocityGain;

    // Připojit: source -> gain -> master
    sourceNode.connect(gainNode);
    gainNode.connect(this.masterGain);

    // Spustit přehrávání na naplánovaný čas
    sourceNode.start(scheduledTime);

    // Uložit voice s Release Trigger URL
    const voice: ActiveVoice = {
      midi,
      sourceNode,
      gainNode,
      startTime: scheduledTime,
      scheduledTime,
      isLooping: false, // Loopování vypnuto
      releaseTriggerUrl: rtUrl,
    };

    if (!this.activeVoices.has(midi)) {
      this.activeVoices.set(midi, []);
    }
    this.activeVoices.get(midi)!.push(voice);

    // Cleanup po dokončení samplu
    sourceNode.addEventListener('ended', () => {
      this.removeVoice(midi, voice);
    });
  }

  /**
   * Zastaví notu (s Release Trigger)
   */
  noteOff(midi: number): void {
    if (this.sustain) {
      this.sustainPool.add(midi);
      return;
    }

    this.stopNoteWithReleaseTrigger(midi);
  }

  /**
   * Zastaví notu s přehráním Release Trigger samplu
   */
  private stopNoteWithReleaseTrigger(midi: number): void {
    const voices = this.activeVoices.get(midi);
    if (!voices) return;

    for (const voice of voices) {
      try {
        // Okamžitě zastavit hlavní sample pomocí gain
        const now = this.audioContext.currentTime;
        voice.gainNode.gain.cancelScheduledValues(now);
        voice.gainNode.gain.setValueAtTime(0, now);

        // Zastavit source node (pokud loopuje, zastavit okamžitě)
        if (voice.isLooping) {
          voice.sourceNode.stop(now);
        } else {
          voice.sourceNode.stop();
        }

        // Přehrát Release Trigger sample, pokud existuje
        if (voice.releaseTriggerUrl) {
          const rtBuffer = this.loadedSamples.get(voice.releaseTriggerUrl);
          if (rtBuffer) {
            const rtSource = this.audioContext.createBufferSource();
            rtSource.buffer = rtBuffer;
            
            // Vypočítat pitch shift pro RT (stejný jako hlavní sample)
            const sampleConfig = this.findNearestSampleConfig(midi);
            if (sampleConfig) {
              const playbackRate = this.calculatePlaybackRate(midi, sampleConfig.midi);
              rtSource.playbackRate.value = playbackRate;
            }
            
            const rtGain = this.audioContext.createGain();
            rtGain.gain.value = 0.5; // RT samply jsou obvykle tišší
            
            rtSource.connect(rtGain);
            rtGain.connect(this.masterGain);
            rtSource.start(now);
          }
        }
      } catch (e) {
        // Ignorovat chyby při zastavování
      }
    }

    this.activeVoices.delete(midi);
  }

  /**
   * Nastaví sustain pedál
   */
  setSustain(sustain: boolean): void {
    const wasSustained = this.sustain;
    this.sustain = sustain;

    if (sustain && !wasSustained) {
      // Pedal Down - přehrát PD sample
      this.playPedalSample('PD');
    } else if (!sustain && wasSustained) {
      // Pedal Up - přehrát PU sample a uvolnit všechny noty ze sustain poolu
      this.playPedalSample('PU');
      
      for (const midi of this.sustainPool) {
        this.stopNoteWithReleaseTrigger(midi);
      }
      this.sustainPool.clear();
    }
  }

  /**
   * Přehrává pedal sample (PD nebo PU)
   */
  private playPedalSample(type: 'PD' | 'PU'): void {
    if (!this.currentPreset || !this.currentPreset.pedalSamples) {
      return;
    }

    const pedalUrls = this.currentPreset.pedalSamples[type];
    if (!pedalUrls || pedalUrls.length === 0) {
      return;
    }

    // Vybrat náhodný Round Robin
    const randomIndex = Math.floor(Math.random() * pedalUrls.length);
    const pedalUrl = pedalUrls[randomIndex];

    const buffer = this.loadedSamples.get(pedalUrl);
    if (!buffer) {
      return;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    
    const gain = this.audioContext.createGain();
    gain.gain.value = 0.3; // Pedal samply jsou tišší
    
    source.connect(gain);
    gain.connect(this.masterGain);
    source.start(this.audioContext.currentTime);
  }

  /**
   * Okamžitě zastaví notu (bez Release Trigger)
   */
  private stopNoteImmediately(midi: number): void {
    const voices = this.activeVoices.get(midi);
    if (!voices) return;

    for (const voice of voices) {
      try {
        // Okamžitě zastavit pomocí gain
        const now = this.audioContext.currentTime;
        voice.gainNode.gain.cancelScheduledValues(now);
        voice.gainNode.gain.setValueAtTime(0, now);

        // Zastavit source node (pokud loopuje, zastavit okamžitě)
        if (voice.isLooping) {
          voice.sourceNode.stop(now);
        } else {
          voice.sourceNode.stop();
        }
      } catch (e) {
        // Ignorovat chyby při zastavování
      }
    }

    this.activeVoices.delete(midi);
  }

  /**
   * Odstraní voice z aktivních
   */
  private removeVoice(midi: number, voice: ActiveVoice): void {
    const voices = this.activeVoices.get(midi);
    if (voices) {
      const index = voices.indexOf(voice);
      if (index > -1) {
        voices.splice(index, 1);
      }
      if (voices.length === 0) {
        this.activeVoices.delete(midi);
      }
    }
  }

  /**
   * Zavře sampler a uvolní zdroje
   */
  dispose(): void {
    // Zastavit všechny noty
    const allMidiNotes = Array.from(this.activeVoices.keys());
    for (const midi of allMidiNotes) {
      this.stopNoteImmediately(midi);
    }

    // Vyčistit reference
    this.activeVoices.clear();
    this.sustainPool.clear();
    this.roundRobinCounter.clear();
    this.currentPreset = null;
  }
}
