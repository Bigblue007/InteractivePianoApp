/**
 * Správce AudioContext - zajišťuje singleton instanci
 */
export class AudioContextManager {
  private static instance: AudioContext | null = null;
  private static compressor: DynamicsCompressorNode | null = null;
  private static masterGainNode: GainNode | null = null;

  /**
   * Získá nebo vytvoří AudioContext
   */
  static getContext(): AudioContext {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContext({
        sampleRate: 44100,
        latencyHint: 'interactive',
      });
    }
    return AudioContextManager.instance;
  }

  /**
   * Získá nebo vytvoří master výstupní uzel (gain a kompresor)
   */
  static getMasterDestination(context: AudioContext): AudioNode {
    if (!AudioContextManager.compressor) {
      // Vytvořit kompresor pro vyrovnání hlasitosti a ochranu před clippingem
      const compressor = context.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-12, context.currentTime); // treshold -12dB
      compressor.knee.setValueAtTime(10, context.currentTime);       // koleno 10dB
      compressor.ratio.setValueAtTime(4, context.currentTime);        // poměr 4:1
      compressor.attack.setValueAtTime(0.005, context.currentTime);   // attack 5ms
      compressor.release.setValueAtTime(0.15, context.currentTime);   // release 150ms
      
      // Master gain node
      const masterGain = context.createGain();
      masterGain.gain.setValueAtTime(1.0, context.currentTime);
      
      // Propojení: masterGain -> compressor -> destination
      masterGain.connect(compressor);
      compressor.connect(context.destination);
      
      AudioContextManager.masterGainNode = masterGain;
      AudioContextManager.compressor = compressor;
    }
    return AudioContextManager.masterGainNode!;
  }

  /**
   * Inicializuje AudioContext (vyžaduje uživatelské gesto)
   */
  static async initialize(): Promise<AudioContext> {
    const context = AudioContextManager.getContext();
    if (context.state === 'suspended') {
      await context.resume();
    }
    return context;
  }

  /**
   * Zavře AudioContext
   */
  static close(): void {
    if (AudioContextManager.instance) {
      AudioContextManager.instance.close();
      AudioContextManager.instance = null;
      AudioContextManager.compressor = null;
      AudioContextManager.masterGainNode = null;
    }
  }

  /**
   * Zkontroluje, zda je AudioContext aktivní
   */
  static isInitialized(): boolean {
    return AudioContextManager.instance !== null && 
           AudioContextManager.instance.state === 'running';
  }
}






