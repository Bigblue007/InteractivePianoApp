import { useState, useEffect } from 'react';
import { useAudioStore } from '../../stores/useAudioStore';
import { AudioContextManager } from '../../services/audio/AudioContextManager';
import { SimpleSoundFontEngine } from '../../services/audio/SoundFontEngine';
import { setAudioEngine } from '../../services/audio/AudioEngineInstance';
import './AudioInitButton.css';

// Reexportujeme pomocné metody z nového centralizovaného modulu pro zachování kompatibility importů
export { getAudioEngine, autoInitializeAudio } from '../../services/audio/AudioEngineInstance';

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

  // Synchronizovat stav s automatickou inicializací
  useEffect(() => {
    if (audioInitialized && !initialized) {
      setInitialized(true);
    }
  }, [audioInitialized, initialized]);

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
      const engine = new SimpleSoundFontEngine();
      setAudioEngine(engine);

      // Načíst vybraný soundfont
      const selectedSoundFont = soundfonts.find((sf) => sf.id === selectedSoundFontId) || soundfonts[0];
      if (selectedSoundFont) {
        await engine.loadSoundFont(selectedSoundFont.url);
        markSoundFontLoaded(selectedSoundFont.id, true);
      }

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
