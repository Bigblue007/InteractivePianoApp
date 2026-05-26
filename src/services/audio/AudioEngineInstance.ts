import { AudioContextManager } from './AudioContextManager';
import { SimpleSoundFontEngine } from './SoundFontEngine';

let audioEngine: SimpleSoundFontEngine | null = null;
let isInitializing = false; // Flag pro zabránění duplicitní inicializace

/**
 * Získá instanci globálního audio enginu.
 */
export function getAudioEngine(): SimpleSoundFontEngine | null {
  return audioEngine;
}

/**
 * Zajišťuje automatickou inicializaci audio kontextu a enginu při prvním uživatelském gestu.
 */
export async function autoInitializeAudio(): Promise<boolean> {
  // Pokud už je inicializováno, vrať true
  if (audioEngine) {
    return true;
  }

  // Pokud už probíhá inicializace, počkej
  if (isInitializing) {
    // Počkej až do dokončení (max 5 sekund)
    const startTime = Date.now();
    while (isInitializing && Date.now() - startTime < 5000) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return audioEngine !== null;
  }

  // Použít dynamický import pro stores (aby se zabránilo circular dependencies při inicializaci)
  const { useAudioStore } = await import('../../stores/useAudioStore');
  const state = useAudioStore.getState();
  const soundfonts = state.soundfonts;
  const selectedSoundFontId = state.selectedSoundFontId;

  if (soundfonts.length === 0) {
    console.warn('Žádné soundfonts k dispozici pro automatickou inicializaci');
    return false;
  }

  isInitializing = true;

  try {
    // Inicializovat AudioContext
    const context = await AudioContextManager.initialize();
    state.setAudioContext(context);
    state.setInitialized(true);

    // Vytvořit audio engine
    audioEngine = new SimpleSoundFontEngine();

    // Načíst vybraný soundfont
    const selectedSoundFont = soundfonts.find((sf) => sf.id === selectedSoundFontId) || soundfonts[0];
    if (selectedSoundFont) {
      await audioEngine.loadSoundFont(selectedSoundFont.url);
      state.markSoundFontLoaded(selectedSoundFont.id, true);
    }

    return true;
  } catch (err) {
    console.error('Chyba při automatické inicializaci audio:', err);
    audioEngine = null;
    return false;
  } finally {
    isInitializing = false;
  }
}

/**
 * Pomocná metoda pro explicitní nastavení audio enginu (např. při ruční inicializaci).
 */
export function setAudioEngine(engine: SimpleSoundFontEngine | null): void {
  audioEngine = engine;
}
