import { useState, useEffect, useCallback } from 'react';
import { PianoKeyboard } from './components/PianoKeyboard/PianoKeyboard';
import { ScoreView } from './components/ScoreView/ScoreView';
import { ChordPanel } from './components/ChordPanel/ChordPanel';
import { ChordSelector } from './components/ChordSelector/ChordSelector';
import { InstrumentSelector } from './components/InstrumentSelector/InstrumentSelector';
import { MIDIConnector } from './components/MIDIConnector/MIDIConnector';
import { NotationSelector } from './components/NotationSelector/NotationSelector';
import { WelcomeDialog } from './components/WelcomeDialog/WelcomeDialog';
import { AudioManager } from './components/AudioManager/AudioManager';
import { usePianoStore } from './stores/usePianoStore';
import { useAudioStore } from './stores/useAudioStore';
import './App.css';

function App() {
  const [selectedChordNotes, setSelectedChordNotes] = useState<Set<number>>(new Set());
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const activeNotes = usePianoStore((state) => state.activeNotes);
  const audioInitialized = useAudioStore((state) => state.initialized);

  const handleChordSelect = useCallback((_chordName: string, midiNotes: number[]) => {
    setSelectedChordNotes(new Set(midiNotes));
  }, []);

  // Zobrazit welcome dialog při startu, pokud audio není inicializováno
  useEffect(() => {
    if (!audioInitialized) {
      setShowWelcomeDialog(true);
    } else {
      setShowWelcomeDialog(false);
    }
  }, [audioInitialized]);

  // Zrušit zvýraznění akordu, když uživatel začne hrát
  useEffect(() => {
    if (activeNotes.size > 0) {
      setSelectedChordNotes(new Set());
    }
  }, [activeNotes]);

  return (
    <div className="app">
      <AudioManager />
      {showWelcomeDialog && (
        <WelcomeDialog onClose={() => setShowWelcomeDialog(false)} />
      )}
      <header>
        <div className="header-content">
          <div className="logo">♫</div>
          <h1>Harmonia</h1>
        </div>
      </header>
      <main>
        <div className="top-section">
          <div className="left-panel top-panel">
            <ChordPanel />
          </div>
          <div className="center-panel top-panel">
            <div className="controls">
              <InstrumentSelector />
              <MIDIConnector />
              <NotationSelector />
            </div>
          </div>
          <div className="right-panel top-panel">
            <ChordSelector onChordSelect={handleChordSelect} />
          </div>
        </div>
        
        <div className="piano-section">
          <PianoKeyboard highlightedNotes={selectedChordNotes} />
        </div>
        
        <div className="bottom-section">
          <div className="left-panel bottom-panel">
            <ScoreView />
          </div>
          <div className="right-panel bottom-panel">
            {/* Pravá část dole - připraveno pro budoucí funkce */}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
