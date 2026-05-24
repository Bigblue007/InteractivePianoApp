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
import { SongLibrary } from './components/SongLibrary/SongLibrary';
import { MobileNotSupported } from './components/MobileNotSupported/MobileNotSupported';
import { usePianoStore } from './stores/usePianoStore';
import { useAudioStore } from './stores/useAudioStore';
import { useSongLibraryStore } from './stores/useSongLibraryStore';
import { getAudioEngine, autoInitializeAudio } from './components/AudioInitButton/AudioInitButton';
import { chordToMidiNotes } from './utils/chordUtils';
import { useIsMobilePhone } from './utils/deviceDetection';
import { APP_NAME, APP_DEMO_VERSION } from './config/version';
import { SampleManager } from './components/SampleManager/SampleManager';
import './App.css';

function App() {
  const [selectedChordNotes, setSelectedChordNotes] = useState<Set<number>>(new Set());
  const [displayNotes, setDisplayNotes] = useState<number[]>([]);
  const [selectedChordIndex, setSelectedChordIndex] = useState<number | undefined>(undefined);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | undefined>(undefined);
  const [selectedChordIndexInSection, setSelectedChordIndexInSection] = useState<number | undefined>(undefined);
  const [selectedSongChords, setSelectedSongChords] = useState<string[]>([]);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [showSampleManager, setShowSampleManager] = useState(false);
  const [skipMobileWarning, setSkipMobileWarning] = useState(false);
  const isMobilePhone = useIsMobilePhone();
  const activeNotes = usePianoStore((state) => state.activeNotes);
  const audioInitialized = useAudioStore((state) => state.initialized);

  const handleChordSelect = useCallback((_chordName: string, midiNotes: number[]) => {
    setSelectedChordNotes(new Set(midiNotes));
    setDisplayNotes(midiNotes);
    setSelectedChordIndex(undefined);
  }, []);

  const handleLibraryChordStart = useCallback(async (
    chordName: string, 
    globalIndex: number,
    sectionIndex: number,
    chordIndexInSection: number
  ) => {
    // 1. Konvertovat chord name na MIDI noty
    const midiNotes = chordToMidiNotes(chordName, 4);
    if (midiNotes.length === 0) {
      console.warn(`Nepodařilo se konvertovat akord ${chordName} na MIDI noty`);
      return;
    }

    // 2. Nastavit selectedChordNotes pro zobrazení na klaviatuře
    setSelectedChordNotes(new Set(midiNotes));
    setDisplayNotes(midiNotes);

    // 3. Nastavit indexy pro zobrazení
    setSelectedChordIndex(globalIndex);
    setSelectedSectionIndex(sectionIndex >= 0 ? sectionIndex : undefined);
    setSelectedChordIndexInSection(chordIndexInSection);

    // 4. Automaticky inicializovat audio, pokud ještě není
    if (!audioInitialized) {
      const initialized = await autoInitializeAudio();
      if (!initialized) {
        console.warn('Nepodařilo se automaticky inicializovat audio');
        return;
      }
    }

    // 5. Přehrát akord
    const audioEngine = getAudioEngine();
    if (!audioEngine) {
      console.warn('Audio engine není k dispozici');
      return;
    }

    // Přehrát nový akord (stejně jako v ChordSelector - velocity 127 pro konzistenci)
    // Nezastavujeme předchozí noty před přehráním, aby nedošlo k přerušení
    midiNotes.forEach((midi) => {
      audioEngine.noteOn(midi, 127);
    });
  }, [audioInitialized, selectedSongChords]);

  const handleLibraryChordStop = useCallback(() => {
    const audioEngine = getAudioEngine();
    if (!audioEngine) {
      return;
    }

    // Zastavit všechny noty
    const allMidiNotes = Array.from(selectedChordNotes);
    allMidiNotes.forEach((midi) => {
      audioEngine.noteOff(midi);
    });
  }, [selectedChordNotes]);

  const handleLibraryChordClick = useCallback((chordName: string) => {
    // Fallback pro případ, že by se použil onClick místo onChordStart
    // Použít index -1 pro sekce a 0 pro chord index, pokud není specifikováno
    handleLibraryChordStart(chordName, 0, -1, 0);
  }, [handleLibraryChordStart]);

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
      setDisplayNotes([]);
      setSelectedChordIndex(undefined);
      setSelectedSectionIndex(undefined);
      setSelectedChordIndexInSection(undefined);
    }
  }, [activeNotes]);

  // Aktualizovat selectedSongChords když se vybere píseň
  const selectedSongId = useSongLibraryStore((state) => state.selectedSongId);
  useEffect(() => {
    if (selectedSongId) {
      const song = useSongLibraryStore.getState().getSong(selectedSongId);
      if (song) {
        setSelectedSongChords(song.chords);
      }
    } else {
      setSelectedSongChords([]);
      setSelectedChordIndex(undefined);
      setSelectedSectionIndex(undefined);
      setSelectedChordIndexInSection(undefined);
    }
  }, [selectedSongId]);

  // Zobrazit zprávu o nepodpořeném zařízení na mobilních telefonech
  // Pokud uživatel klikl na "Pokračovat", zobrazit aplikaci i na mobilu
  if (isMobilePhone && !skipMobileWarning) {
    return <MobileNotSupported onContinue={() => setSkipMobileWarning(true)} />;
  }

  return (
    <div className="app">
      <AudioManager />
      {showWelcomeDialog && (
        <WelcomeDialog onClose={() => setShowWelcomeDialog(false)} />
      )}
      {showSampleManager && (
        <div className="sample-manager-modal-overlay" onClick={() => setShowSampleManager(false)}>
          <div className="sample-manager-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="sample-manager-modal-close-btn" onClick={() => setShowSampleManager(false)}>×</button>
            <SampleManager />
          </div>
        </div>
      )}
      <main>
        <div className="top-section-wrapper">
          <div className="app-header-inline">
            <div className="logo">♫</div>
            <div className="app-title-wrapper">
              <h1>{APP_NAME}</h1>
              <div className="app-demo-version">{APP_DEMO_VERSION}</div>
            </div>
            <button 
              className="btn-open-sample-manager" 
              onClick={() => setShowSampleManager(true)}
            >
              {typeof window !== 'undefined' && window.electronAPI ? '🎹 Spravovat samply' : '🎹 Zvukové knihovny'}
            </button>
          </div>
          <div className="top-section">
            <div className="left-panel top-panel">
              <div className="controls">
                <InstrumentSelector />
                <MIDIConnector />
                <NotationSelector />
              </div>
            </div>
            <div className="center-panel top-panel">
              <ChordPanel />
            </div>
            <div className="right-panel top-panel">
              <ChordSelector onChordSelect={handleChordSelect} />
            </div>
          </div>
        </div>
        
        <div className="piano-section">
          <PianoKeyboard highlightedNotes={selectedChordNotes} />
        </div>
        
                <div className="bottom-section">
                  <div className="left-panel bottom-panel">
                    <ScoreView displayNotes={displayNotes.length > 0 ? displayNotes : undefined} />
                  </div>
                  <div className="right-panel bottom-panel">
                    <SongLibrary
                      onChordClick={handleLibraryChordClick}
                      onChordStart={handleLibraryChordStart}
                      onChordStop={handleLibraryChordStop}
                      selectedChordIndex={selectedChordIndex}
                      selectedSectionIndex={selectedSectionIndex}
                      selectedChordIndexInSection={selectedChordIndexInSection}
                    />
                  </div>
                </div>
      </main>
    </div>
  );
}

export default App;
