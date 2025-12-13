import { AudioContextManager } from './AudioContextManager';
import { SampleConfig, PedalSamples } from '../../config/instrumentPresets';

/**
 * Singleton třída pro načítání a cachování audio samplů
 */
export class SampleLoader {
  private static instance: SampleLoader | null = null;
  private cache: Map<string, AudioBuffer> = new Map();
  private audioContext: AudioContext;

  private constructor() {
    this.audioContext = AudioContextManager.getContext();
  }

  /**
   * Získá instanci SampleLoader (singleton)
   */
  static getInstance(): SampleLoader {
    if (!SampleLoader.instance) {
      SampleLoader.instance = new SampleLoader();
    }
    return SampleLoader.instance;
  }

  /**
   * Načte a dekóduje audio sample z URL
   */
  async loadSample(url: string): Promise<AudioBuffer> {
    // Validovat URL - pokud je prázdný nebo root, vyhodit chybu
    if (!url || url.trim() === '' || url === '/' || url === '//') {
      const errorMsg = `Neplatný URL pro sample: "${url}"`;
      throw new Error(errorMsg);
    }
    
    // Zkontrolovat cache
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    try {
      // URL encoding pro '#' v názvech souborů
      // DŮLEŽITÉ: encodeURI NEZAKÓDUJE '#' (je to fragment separator v URL)
      // Musíme zakódovat '#' ručně jako '%23' před fetch requestem
      let encodedUrl: string;
      try {
        // encodeURI zachová '#' jako fragment separator, takže ho musíme zakódovat ručně
        // Zakódovat '#' jako '%23' v celém URL
        encodedUrl = url.replace(/#/g, '%23');
      } catch (e) {
        // Pokud encoding selže, použít původní URL
        encodedUrl = url;
      }
      
      // Použít fetch s explicitním mode: 'no-cors' není vhodný, ale můžeme zkusit 'cors'
      // Důležité: NEPOUŽÍVAT přímé odkazy, které by mohly otevřít video player
      const response = await fetch(encodedUrl, {
        method: 'GET',
        headers: {
          'Accept': 'audio/mpeg, audio/*',
        },
        // Zajistit, že se neotevře v novém okně/tabu
        cache: 'default',
      });
      if (!response.ok) {
        // Pokud je status 404, zkontrolovat, zda soubor skutečně existuje
        if (response.status === 404) {
          const errorMsg = `Sample soubor neexistuje: ${url} (zkódováno: ${encodedUrl})`;
          throw new Error(errorMsg);
        }
        const errorMsg = response.statusText || `HTTP ${response.status}`;
        throw new Error(`Nepodařilo se načíst sample: ${errorMsg}`);
      }

      // Zkontrolovat Content-Type
      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.includes('audio') && !contentType.includes('mpeg')) {
        console.warn(`Neočekávaný Content-Type pro ${url}: ${contentType}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      
      // Dekódovat audio data
      let audioBuffer: AudioBuffer;
      try {
        // Zkusit dekódovat s kopií bufferu (některé prohlížeče vyžadují kopii)
        audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer.slice(0));
      } catch (decodeError) {
        // Pokud Web Audio API dekódování selže, zkusit znovu načíst
        console.warn(`Web Audio API dekódování selhalo pro ${url}, zkouším znovu načíst...`);
        try {
          // Zkusit znovu načíst
          const retryResponse = await fetch(url);
          if (retryResponse.ok) {
            const retryBuffer = await retryResponse.arrayBuffer();
            audioBuffer = await this.audioContext.decodeAudioData(retryBuffer.slice(0));
          } else {
            throw decodeError;
          }
        } catch (retryError) {
          // Pokud i retry selže, vyhodit chybu s detailní zprávou
          const errorMessage = `Nepodařilo se dekódovat audio sample ${url}. ` +
            `Zkontrolujte, zda je soubor platný MP3 soubor a zda prohlížeč podporuje MP3 dekódování. ` +
            `Chyba: ${decodeError instanceof Error ? decodeError.message : String(decodeError)}`;
          console.error(errorMessage);
          throw new Error(errorMessage);
        }
      }

      // Ořezat pauzu na začátku samplu pro eliminaci latence
      audioBuffer = this.trimStartSilence(audioBuffer, 0.01); // 1% prah pro ticho

      // Uložit do cache
      this.cache.set(url, audioBuffer);

      return audioBuffer;
    } catch (error) {
      console.error(`Chyba při načítání samplu ${url}:`, error);
      
      // Pokud je to DOMException s "unknown content type", zkusit alternativní přístup
      if (error instanceof DOMException && error.message.includes('unknown content type')) {
        console.warn(`Problém s dekódováním MP3 pro ${url}. Zkontrolujte, zda je soubor skutečně MP3.`);
      }
      
      throw error;
    }
  }

  /**
   * Načte všechny samply pro daný preset (včetně Round Robin a Release Trigger)
   */
  async loadPresetSamples(
    sampleConfigs: SampleConfig[],
    pedalSamples?: PedalSamples
  ): Promise<Map<string, AudioBuffer>> {
    const samples = new Map<string, AudioBuffer>();
    const loadPromises: Promise<void>[] = [];

    // Načíst samply pro každou konfiguraci
    for (const config of sampleConfigs) {
      // Level1 samply (RR1, RR2, RR3) - pouze pokud existují
      if (config.layers.Level1 && config.layers.Level1.length > 0) {
        for (const url of config.layers.Level1) {
          if (!url || url.trim() === '') {
            continue;
          }
          loadPromises.push(
            this.loadSample(url)
              .then((buffer) => {
                samples.set(url, buffer);
              })
              .catch((error) => {
                console.warn(`Chyba při načítání samplu ${url}:`, error);
              })
          );
        }
      }

      // Level2 samply (RR1, RR2, RR3) - pouze pokud existují
      if (config.layers.Level2 && config.layers.Level2.length > 0) {
        for (const url of config.layers.Level2) {
          if (!url || url.trim() === '') {
            continue;
          }
          loadPromises.push(
            this.loadSample(url)
              .then((buffer) => {
                samples.set(url, buffer);
              })
              .catch((error) => {
                console.warn(`Chyba při načítání samplu ${url}:`, error);
              })
          );
        }
      }

      // RT samply (RR1, RR2, RR3) - pouze pokud existují
      if (config.layers.RT && config.layers.RT.length > 0) {
        for (const url of config.layers.RT) {
          if (!url || url.trim() === '') {
            continue;
          }
          loadPromises.push(
            this.loadSample(url)
              .then((buffer) => {
                samples.set(url, buffer);
              })
              .catch((error) => {
                console.warn(`Chyba při načítání samplu ${url}:`, error);
              })
          );
        }
      }
    }

    // Načíst pedal samply
    if (pedalSamples) {
      for (const url of pedalSamples.PD) {
        loadPromises.push(
          this.loadSample(url)
            .then((buffer) => {
              samples.set(url, buffer);
            })
            .catch((error) => {
              console.warn(`Chyba při načítání pedal samplu ${url}:`, error);
            })
        );
      }

      for (const url of pedalSamples.PU) {
        loadPromises.push(
          this.loadSample(url)
            .then((buffer) => {
              samples.set(url, buffer);
            })
            .catch((error) => {
              console.warn(`Chyba při načítání pedal samplu ${url}:`, error);
            })
        );
      }
    }

    await Promise.all(loadPromises);
    return samples;
  }

  /**
   * Vrátí cachovaný sample nebo null
   */
  getSample(key: string): AudioBuffer | null {
    return this.cache.get(key) || null;
  }

  /**
   * Vyčistí cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Zkontroluje, zda je sample v cache
   */
  hasSample(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Ořízne ticho na začátku AudioBuffer pro eliminaci latence
   * Detekuje první sample s signálem nad prahem a ořízne vše před ním
   * 
   * @param buffer Původní AudioBuffer
   * @param silenceThreshold Práh pro ticho (0-1, default 0.01 = 1%)
   * @returns Nový AudioBuffer bez ticha na začátku
   */
  private trimStartSilence(buffer: AudioBuffer, silenceThreshold: number = 0.01): AudioBuffer {
    const sampleRate = buffer.sampleRate;
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length;
    
    // Najít první sample s signálem (zkontrolovat všechny kanály)
    let startSample = 0;
    
    // Projít všechny samply a najít první s signálem
    for (let i = 0; i < length; i++) {
      let hasSignal = false;
      
      // Zkontrolovat všechny kanály - pokud alespoň jeden má signál, je to začátek
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
    
    // Pokud není co ořezat (žádná pauza na začátku), vrátit původní buffer
    if (startSample === 0) {
      return buffer;
    }
    
    // Přidat malý padding (5ms) pro plynulý přechod a zachování attack transients
    const paddingSamples = Math.floor(sampleRate * 0.005); // 5ms
    startSample = Math.max(0, startSample - paddingSamples);
    
    const trimmedLength = length - startSample;
    
    // Pokud by ořezání bylo příliš agresivní (více než 50% samplu), nechat původní
    if (trimmedLength < length * 0.5) {
      console.warn(`Ořezání samplu by bylo příliš agresivní (${((startSample / length) * 100).toFixed(1)}%), ponechávám původní`);
      return buffer;
    }
    
    // Vytvořit nový buffer s ořezanými daty
    const trimmedBuffer = this.audioContext.createBuffer(
      numberOfChannels,
      trimmedLength,
      sampleRate
    );
    
    // Zkopírovat data do nového bufferu
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sourceData = buffer.getChannelData(channel);
      const targetData = trimmedBuffer.getChannelData(channel);
      targetData.set(sourceData.subarray(startSample));
    }
    
    return trimmedBuffer;
  }
}
