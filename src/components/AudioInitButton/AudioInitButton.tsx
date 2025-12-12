import { useState, useEffect, useRef } from 'react';
import { useAudioStore } from '../../stores/useAudioStore';
import { AudioContextManager } from '../../services/audio/AudioContextManager';
import { SimpleSoundFontEngine } from '../../services/audio/SoundFontEngine';
import { usePianoStore } from '../../stores/usePianoStore';
import './AudioInitButton.css';

let audioEngine: SimpleSoundFontEngine | null = null;
let isInitializing = false; // Flag pro zabránění duplicitní inicializace

// Export funkce pro získání audio engine (pro použití v jiných komponentách)
export function getAudioEngine(): SimpleSoundFontEngine | null {
  return audioEngine;
}

// Export funkce pro automatickou inicializaci (při prvním kliknutí)
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

export function AudioInitButton() {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const soundfonts = useAudioStore((state) => state.soundfonts);
  const selectedSoundFontId = useAudioStore((state) => state.selectedSoundFontId);
  const audioInitialized = useAudioStore((state) => state.initialized);
  const setAudioContext = useAudioStore((state) => state.setAudioContext);
  const setAudioInitialized = useAudioStore((state) => state.setInitialized);
  const markSoundFontLoaded = useAudioStore((state) => state.markSoundFontLoaded);
  const activeNotes = usePianoStore((state) => state.activeNotes);
  const sustain = usePianoStore((state) => state.sustain);
  const prevActiveNotesRef = useRef<Set<number>>(new Set());
  const prevSustainRef = useRef<boolean>(false);

  // Synchronizovat stav s automatickou inicializací
  useEffect(() => {
    if (audioInitialized && !initialized && audioEngine) {
      setInitialized(true);
      // Resetovat refs pro sledování změn
      prevActiveNotesRef.current = new Set(usePianoStore.getState().activeNotes);
      prevSustainRef.current = usePianoStore.getState().sustain;
    }
  }, [audioInitialized, initialized]);

  // Sledovat změny aktivních not a přehrávat je
  useEffect(() => {
    if (!audioEngine || !initialized) return;

    const currentNotes = new Set(activeNotes);
    const prevNotes = prevActiveNotesRef.current;

    // Najít nově přidané noty
    const newNotes = Array.from(currentNotes).filter((n) => !prevNotes.has(n));
    const removedNotes = Array.from(prevNotes).filter((n) => !currentNotes.has(n));

    newNotes.forEach((midi) => {
      audioEngine?.noteOn(midi, 127);
    });

    removedNotes.forEach((midi) => {
      audioEngine?.noteOff(midi);
    });

    prevActiveNotesRef.current = new Set(currentNotes);
  }, [activeNotes, initialized]);

  // Sledovat změny sustain pedálu
  useEffect(() => {
    if (!audioEngine || !initialized) return;

    if (sustain !== prevSustainRef.current) {
      audioEngine.setSustain(sustain);
      prevSustainRef.current = sustain;
    }
  }, [sustain, initialized]);

  const handleInitialize = async () => {
    setLoading(true);
    setError(null);

    try {
      // Inicializovat AudioContext
      const context = await AudioContextManager.initialize();
      setAudioContext(context);
      setInitialized(true);
      setAudioInitialized(true);

      // Vytvořit audio engine
      audioEngine = new SimpleSoundFontEngine();

      // Načíst vybraný soundfont
      const selectedSoundFont = soundfonts.find((sf) => sf.id === selectedSoundFontId) || soundfonts[0];
      if (selectedSoundFont) {
        await audioEngine.loadSoundFont(selectedSoundFont.url);
        markSoundFontLoaded(selectedSoundFont.id, true);
      }

      // Resetovat refs pro sledování změn
      prevActiveNotesRef.current = new Set(usePianoStore.getState().activeNotes);
      prevSustainRef.current = usePianoStore.getState().sustain;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se inicializovat audio');
      setInitialized(false);
    } finally {
      setLoading(false);
    }
  };

  if (initialized) {
    return (
      <div className="audio-init-button">
        <span className="status-success">✓ Audio inicializováno</span>
      </div>
    );
  }

  return (
    <div className="audio-init-button">
      <button onClick={handleInitialize} disabled={loading}>
        {loading ? 'Inicializace...' : 'Zapnout zvuk'}
      </button>
      <p className="auto-init-hint">(nebo klikněte na klávesu)</p>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

