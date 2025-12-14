import './MobileNotSupported.css';

interface MobileNotSupportedProps {
  onContinue?: () => void;
}

export function MobileNotSupported({ onContinue }: MobileNotSupportedProps) {
  const handleContinue = async () => {
    // Zkusit přepnout na landscape pomocí Screen Orientation API
    if ('orientation' in screen && 'lock' in screen.orientation) {
      try {
        await (screen.orientation as any).lock('landscape');
      } catch (error) {
        // API může selhat (např. pokud už je zamčené nebo není podporováno)
        console.log('Nepodařilo se přepnout na landscape:', error);
      }
    }
    
    // Zavolat callback pro pokračování
    if (onContinue) {
      onContinue();
    }
  };

  return (
    <div className="mobile-not-supported">
      <div className="mobile-not-supported-content">
        <div className="mobile-not-supported-icon">
          <div className="piano-icon">🎹</div>
          <div className="music-notes">
            <span className="note note-1">♪</span>
            <span className="note note-2">♫</span>
            <span className="note note-3">♪</span>
          </div>
        </div>
        <h1 className="mobile-not-supported-title">Harmonia</h1>
        <p className="mobile-not-supported-message">
          Aplikace není optimalizovaná pro mobilní telefony.
        </p>
        <p className="mobile-not-supported-recommendation">
          Doporučujeme použít aplikaci na desktopu nebo tabletu pro nejlepší zážitek.
        </p>
        <div className="mobile-not-supported-devices">
          <div className="device-icon desktop">💻</div>
          <div className="device-icon tablet">📱</div>
        </div>
        {onContinue && (
          <button 
            className="mobile-not-supported-continue-btn"
            onClick={handleContinue}
          >
            Pokračovat
          </button>
        )}
      </div>
    </div>
  );
}

