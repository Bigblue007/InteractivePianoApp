import { useRef, useEffect, useState } from 'react';
import { usePianoStore } from '../../stores/usePianoStore';
import { useAudioStore } from '../../stores/useAudioStore';
import { autoInitializeAudio } from '../AudioInitButton/AudioInitButton';
import { isBlackKey } from '../../utils/notes';
import './PianoKeyboard.css';

interface PianoKeyboardProps {
  startNote?: number; // MIDI číslo první noty (default: 21 = A0)
  endNote?: number;   // MIDI číslo poslední noty (default: 108 = C8)
  onNoteOn?: (midi: number) => void;
  onNoteOff?: (midi: number) => void;
  highlightedNotes?: Set<number>; // MIDI noty pro zvýraznění (např. vybraný akord)
}

const DEFAULT_START_NOTE = 21; // A0
const DEFAULT_END_NOTE = 108;  // C8

export function PianoKeyboard({
  startNote = DEFAULT_START_NOTE,
  endNote = DEFAULT_END_NOTE,
  onNoteOn,
  onNoteOff,
  highlightedNotes = new Set(),
}: PianoKeyboardProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const activePointers = useRef<Map<number, number>>(new Map()); // pointerId -> midi
  const activeNotes = usePianoStore((state) => state.activeNotes);
  const audioInitialized = useAudioStore((state) => state.initialized);
  const [isAutoInitializing, setIsAutoInitializing] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Spočítat počet bílých kláves
  let whiteKeysCount = 0;
  for (let midi = startNote; midi <= endNote; midi++) {
    if (!isBlackKey(midi)) {
      whiteKeysCount++;
    }
  }

  // Sledovat změny velikosti okna
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Vypočítat šířku klávesy tak, aby klaviatura využila celou šířku obrazovky
  const containerPadding = 0; // Bez padding, protože jsme ho odstranili
  const availableWidth = windowWidth - containerPadding;
  
  // Pro tablety použít menší poměr výšky pouze v landscape (kompaktnější klaviatura)
  const isTablet = windowWidth >= 768 && windowWidth <= 1024;
  const isTabletPortrait = isTablet && window.innerHeight > window.innerWidth;
  const KEY_HEIGHT_RATIO = (isTablet && !isTabletPortrait) ? 4 : 6; // 1:4 pro tablety landscape, 1:6 pro desktop a tablety portrait
  
  const KEY_WIDTH = Math.floor(availableWidth / whiteKeysCount);
  const KEY_HEIGHT = Math.floor(KEY_WIDTH * KEY_HEIGHT_RATIO);
  const BLACK_KEY_WIDTH = Math.floor(KEY_WIDTH * 0.6); // 60% šířky bílé klávesy
  const BLACK_KEY_HEIGHT = Math.floor(KEY_HEIGHT * 0.58); // 58% výšky bílé klávesy
  
  const SVG_WIDTH = whiteKeysCount * KEY_WIDTH;
  const SVG_HEIGHT = KEY_HEIGHT;

  /**
   * Vypočítá pozici bílé klávesy pro danou MIDI notu (stejně jako v renderKeys)
   */
  const getWhiteKeyPosition = (midi: number): number | null => {
    let whiteKeyIndex = 0;
    for (let m = startNote; m <= endNote; m++) {
      if (!isBlackKey(m)) {
        if (m === midi) {
          return whiteKeyIndex;
        }
        whiteKeyIndex++;
      }
    }
    return null;
  };

  /**
   * Najde MIDI notu na základě pozice
   */
  const getMidiFromPosition = (x: number, y: number): number | null => {
    if (!svgRef.current) return null;

    const rect = svgRef.current.getBoundingClientRect();
    const localX = x - rect.left;
    const localY = y - rect.top;

    // Nejprve zkontrolovat černé klávesy (jsou nahoře)
    if (localY < BLACK_KEY_HEIGHT) {
      // Najít nejbližší černou klávesu - použít stejnou logiku jako při vykreslování
      for (let midi = startNote; midi <= endNote; midi++) {
        if (isBlackKey(midi)) {
          // Najít předchozí bílou klávesu (stejně jako v renderKeys)
          let prevWhiteMidi = midi - 1;
          while (prevWhiteMidi >= startNote && isBlackKey(prevWhiteMidi)) {
            prevWhiteMidi--;
          }
          
          if (prevWhiteMidi >= startNote) {
            const prevWhiteKeyIndex = getWhiteKeyPosition(prevWhiteMidi);
            if (prevWhiteKeyIndex !== null) {
              const blackKeyX = prevWhiteKeyIndex * KEY_WIDTH + KEY_WIDTH - BLACK_KEY_WIDTH / 2;
              if (Math.abs(localX - blackKeyX) < BLACK_KEY_WIDTH / 2) {
                return midi;
              }
            }
          }
        }
      }
    }

    // Pak zkontrolovat bílé klávesy
    const whiteKeyIndex = Math.floor(localX / KEY_WIDTH);
    let whiteKeyCount = 0;
    for (let midi = startNote; midi <= endNote; midi++) {
      if (!isBlackKey(midi)) {
        if (whiteKeyCount === whiteKeyIndex) {
          return midi;
        }
        whiteKeyCount++;
      }
    }

    return null;
  };

  /**
   * Zpracuje pointer down
   */
  const handlePointerDown = async (e: React.PointerEvent) => {
    e.preventDefault();
    
    // Automatická inicializace při prvním kliknutí, pokud audio není inicializováno
    if (!audioInitialized && !isAutoInitializing) {
      setIsAutoInitializing(true);
      const initialized = await autoInitializeAudio();
      setIsAutoInitializing(false);
      if (!initialized) {
        console.warn('Nepodařilo se automaticky inicializovat audio');
        return;
      }
    }

    const midi = getMidiFromPosition(e.clientX, e.clientY);
    if (midi !== null) {
      activePointers.current.set(e.pointerId, midi);
      onNoteOn?.(midi);
      usePianoStore.getState().noteOn(midi);
    }
  };

  /**
   * Zpracuje pointer up
   */
  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    const midi = activePointers.current.get(e.pointerId);
    if (midi !== null && midi !== undefined) {
      activePointers.current.delete(e.pointerId);
      onNoteOff?.(midi);
      usePianoStore.getState().noteOff(midi);
    }
  };

  /**
   * Zpracuje pointer move (pro touch)
   */
  const handlePointerMove = (e: React.PointerEvent) => {
    if (activePointers.current.has(e.pointerId)) {
      const oldMidi = activePointers.current.get(e.pointerId);
      const newMidi = getMidiFromPosition(e.clientX, e.clientY);
      
      if (oldMidi !== undefined && newMidi !== null && newMidi !== oldMidi) {
        // Přesunul se na jinou klávesu
        onNoteOff?.(oldMidi);
        usePianoStore.getState().noteOff(oldMidi);
        activePointers.current.set(e.pointerId, newMidi);
        onNoteOn?.(newMidi);
        usePianoStore.getState().noteOn(newMidi);
      }
    }
  };

  /**
   * Vykreslí klávesy
   */
  const renderKeys = () => {
    const whiteKeysElements: JSX.Element[] = [];
    const blackKeysElements: JSX.Element[] = [];
    
    let whiteKeyIndex = 0;
    const whiteKeyPositions = new Map<number, number>(); // midi -> whiteKeyIndex
    
    // Nejdřív vykreslit všechny bílé klávesy a uložit jejich pozice
    for (let midi = startNote; midi <= endNote; midi++) {
      if (!isBlackKey(midi)) {
        whiteKeyPositions.set(midi, whiteKeyIndex);
        whiteKeyIndex++;
      }
    }
    
    // Teď vykreslit bílé klávesy
    whiteKeyIndex = 0;
    for (let midi = startNote; midi <= endNote; midi++) {
      if (!isBlackKey(midi)) {
        const x = whiteKeyIndex * KEY_WIDTH;
        const isPressed = activeNotes.has(midi);
        const isHighlighted = highlightedNotes.has(midi);
        
        whiteKeysElements.push(
          <rect
            key={`white-${midi}`}
            x={x}
            y={0}
            width={KEY_WIDTH}
            height={KEY_HEIGHT}
            className={`key white ${isPressed ? 'pressed' : ''} ${isHighlighted ? 'highlighted' : ''}`}
            data-midi={midi}
          />
        );
        whiteKeyIndex++;
      }
    }
    
    // Pak vykreslit černé klávesy - najít předchozí bílou klávesu
    for (let midi = startNote; midi <= endNote; midi++) {
      if (isBlackKey(midi)) {
        // Najít předchozí bílou klávesu
        let prevWhiteMidi = midi - 1;
        while (prevWhiteMidi >= startNote && isBlackKey(prevWhiteMidi)) {
          prevWhiteMidi--;
        }
        
        if (prevWhiteMidi >= startNote) {
          const prevWhiteKeyIndex = whiteKeyPositions.get(prevWhiteMidi);
          if (prevWhiteKeyIndex !== undefined) {
            const x = prevWhiteKeyIndex * KEY_WIDTH + KEY_WIDTH - BLACK_KEY_WIDTH / 2;
            const isPressed = activeNotes.has(midi);
            const isHighlighted = highlightedNotes.has(midi);
            
            blackKeysElements.push(
              <rect
                key={`black-${midi}`}
                x={x}
                y={0}
                width={BLACK_KEY_WIDTH}
                height={BLACK_KEY_HEIGHT}
                className={`key black ${isPressed ? 'pressed' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                data-midi={midi}
              />
            );
          }
        }
      }
    }
    
    return [...whiteKeysElements, ...blackKeysElements];
  };

  return (
    <div className="piano-keyboard-container">
      <svg
        ref={svgRef}
        width={SVG_WIDTH}
        height={SVG_HEIGHT}
        className="piano-keyboard"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerLeave={(_e) => {
          // Zastavit všechny aktivní pointery při opuštění
          activePointers.current.forEach((midi) => {
            onNoteOff?.(midi);
            usePianoStore.getState().noteOff(midi);
          });
          activePointers.current.clear();
        }}
        style={{ touchAction: 'none' }}
      >
        {renderKeys()}
      </svg>
    </div>
  );
}


