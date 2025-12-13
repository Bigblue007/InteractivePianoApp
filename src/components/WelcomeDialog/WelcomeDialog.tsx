import { useState } from 'react';
import { useAudioStore } from '../../stores/useAudioStore';
import { autoInitializeAudio } from '../AudioInitButton/AudioInitButton';
import { APP_NAME, APP_DEMO_VERSION } from '../../config/version';
import './WelcomeDialog.css';

interface WelcomeDialogProps {
  onClose: () => void;
}

export function WelcomeDialog({ onClose }: WelcomeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioInitialized = useAudioStore((state) => state.initialized);

  const handlePlay = async () => {
    if (audioInitialized) {
      onClose();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const initialized = await autoInitializeAudio();
      if (initialized) {
        onClose();
      } else {
        setError('Nepodařilo se inicializovat audio');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se inicializovat audio');
    } finally {
      setLoading(false);
    }
  };

  // Pokud je audio už inicializováno, zavřít dialog
  if (audioInitialized) {
    return null;
  }

  return (
    <div className="welcome-dialog-overlay">
      <div className="welcome-dialog">
        <h2>Vítejte v {APP_NAME}</h2>
        <div className="welcome-demo-version">{APP_DEMO_VERSION}</div>
        <p>Pro začátek klikněte na tlačítko PLAY a inicializujte zvuk.</p>
        <button 
          className="welcome-play-button" 
          onClick={handlePlay} 
          disabled={loading}
        >
          {loading ? '⏳ Inicializace...' : '▶ PLAY'}
        </button>
        {error && <p className="welcome-error">{error}</p>}
      </div>
    </div>
  );
}

