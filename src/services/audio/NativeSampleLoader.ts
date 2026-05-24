import { AudioContextManager } from './AudioContextManager';
import { SampleConfig, PedalSamples } from '../../config/instrumentPresets';

/**
 * Singleton třída pro načítání a cachování audio samplů z lokálního disku v Electronu
 */
export class NativeSampleLoader {
  private static instance: NativeSampleLoader | null = null;
  private cache: Map<string, AudioBuffer> = new Map();
  private audioContext: AudioContext;

  private constructor() {
    this.audioContext = AudioContextManager.getContext();
  }

  /**
   * Získá instanci NativeSampleLoader (singleton)
   */
  static getInstance(): NativeSampleLoader {
    if (!NativeSampleLoader.instance) {
      NativeSampleLoader.instance = new NativeSampleLoader();
    }
    return NativeSampleLoader.instance;
  }

  /**
   * Načte a dekóduje audio sample z disku přes IPC
   */
  async loadSample(relativePath: string): Promise<AudioBuffer> {
    if (!relativePath || relativePath.trim() === '') {
      throw new Error(`Neplatná cesta pro sample: "${relativePath}"`);
    }

    // Zkontrolovat cache
    if (this.cache.has(relativePath)) {
      return this.cache.get(relativePath)!;
    }

    try {
      if (!window.electronAPI) {
        throw new Error('electronAPI není dostupné na objektu window.');
      }

      // Odstranit úvodní lomítko pro správné vyřešení relativní cesty v Electronu
      const cleanPath = relativePath.replace(/^\//, '');
      const absolutePath = await window.electronAPI.resolveResourcePath(cleanPath);
      
      // Přečíst soubor do ArrayBufferu přes IPC
      const arrayBuffer = await window.electronAPI.readSampleFile(absolutePath);
      
      // Dekódovat audio data
      let audioBuffer: AudioBuffer;
      try {
        // decodeAudioData zkonzumuje ArrayBuffer, proto použijeme kopii (.slice(0)) pro bezpečí
        audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer.slice(0));
      } catch (decodeError) {
        console.error(`Chyba při dekódování audio dat pro soubor: ${absolutePath}`, decodeError);
        throw decodeError;
      }

      // Ořezat ticho na začátku pro zamezení latence
      audioBuffer = this.trimStartSilence(audioBuffer, 0.01);

      // Uložit do cache
      this.cache.set(relativePath, audioBuffer);

      return audioBuffer;
    } catch (error) {
      console.error(`Chyba v NativeSampleLoader při načítání ${relativePath}:`, error);
      throw error;
    }
  }

  /**
   * Načte všechny samply pro daný preset
   */
  async loadPresetSamples(
    sampleConfigs: SampleConfig[],
    pedalSamples?: PedalSamples
  ): Promise<Map<string, AudioBuffer>> {
    const samples = new Map<string, AudioBuffer>();
    const loadPromises: Promise<void>[] = [];

    for (const config of sampleConfigs) {
      // Level1
      if (config.layers.Level1 && config.layers.Level1.length > 0) {
        for (const url of config.layers.Level1) {
          if (!url || url.trim() === '') continue;
          loadPromises.push(
            this.loadSample(url)
              .then((buffer) => {
                samples.set(url, buffer);
              })
              .catch((err) => {
                console.warn(`Chyba při nativním načítání samplu ${url}:`, err);
              })
          );
        }
      }

      // Level2
      if (config.layers.Level2 && config.layers.Level2.length > 0) {
        for (const url of config.layers.Level2) {
          if (!url || url.trim() === '') continue;
          loadPromises.push(
            this.loadSample(url)
              .then((buffer) => {
                samples.set(url, buffer);
              })
              .catch((err) => {
                console.warn(`Chyba při nativním načítání samplu ${url}:`, err);
              })
          );
        }
      }

      // RT
      if (config.layers.RT && config.layers.RT.length > 0) {
        for (const url of config.layers.RT) {
          if (!url || url.trim() === '') continue;
          loadPromises.push(
            this.loadSample(url)
              .then((buffer) => {
                samples.set(url, buffer);
              })
              .catch((err) => {
                console.warn(`Chyba při nativním načítání samplu ${url}:`, err);
              })
          );
        }
      }
    }

    // Pedal
    if (pedalSamples) {
      for (const url of pedalSamples.PD) {
        loadPromises.push(
          this.loadSample(url)
            .then((buffer) => {
              samples.set(url, buffer);
            })
            .catch((err) => {
              console.warn(`Chyba při nativním načítání pedal samplu ${url}:`, err);
            })
        );
      }

      for (const url of pedalSamples.PU) {
        loadPromises.push(
          this.loadSample(url)
            .then((buffer) => {
              samples.set(url, buffer);
            })
            .catch((err) => {
              console.warn(`Chyba při nativním načítání pedal samplu ${url}:`, err);
            })
        );
      }
    }

    await Promise.all(loadPromises);
    return samples;
  }

  getSample(key: string): AudioBuffer | null {
    return this.cache.get(key) || null;
  }

  clearCache(): void {
    this.cache.clear();
  }

  hasSample(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Ořízne ticho na začátku AudioBuffer
   */
  private trimStartSilence(buffer: AudioBuffer, silenceThreshold: number = 0.01): AudioBuffer {
    const sampleRate = buffer.sampleRate;
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length;
    
    let startSample = 0;
    for (let i = 0; i < length; i++) {
      let hasSignal = false;
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        if (Math.abs(channelData[i]) > silenceThreshold) {
          hasSignal = true;
          break;
        }
      }
      if (hasSignal) {
        startSample = i;
        break;
      }
    }
    
    if (startSample === 0) {
      return buffer;
    }
    
    const paddingSamples = Math.floor(sampleRate * 0.005); // 5ms padding
    startSample = Math.max(0, startSample - paddingSamples);
    
    const trimmedLength = length - startSample;
    if (trimmedLength < length * 0.5) {
      return buffer;
    }
    
    const trimmedBuffer = this.audioContext.createBuffer(
      numberOfChannels,
      trimmedLength,
      sampleRate
    );
    
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sourceData = buffer.getChannelData(channel);
      const targetData = trimmedBuffer.getChannelData(channel);
      targetData.set(sourceData.subarray(startSample));
    }
    
    return trimmedBuffer;
  }
}
