/**
 * Správce AudioContext - zajišťuje singleton instanci
 */
export class AudioContextManager {
  private static instance: AudioContext | null = null;

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





