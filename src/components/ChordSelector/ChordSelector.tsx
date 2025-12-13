import { useState, useMemo, useEffect, useRef } from 'react';
import { Chord, Note } from '@tonaljs/tonal';
import { getAudioEngine, autoInitializeAudio } from '../AudioInitButton/AudioInitButton';
import { useAudioStore } from '../../stores/useAudioStore';
import { useNotationStore } from '../../stores/useNotationStore';
import './ChordSelector.css';

interface ChordSelectorProps {
  onChordSelect?: (chordName: string, midiNotes: number[]) => void;
}

const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const CHORD_TYPES = [
  { name: '', label: 'maj' },
  { name: 'm', label: 'm' },
  { name: '5', label: '5' },
  { name: '7', label: '7' },
  { name: 'm7', label: 'm7' },
  { name: 'maj7', label: 'maj7' },
  { name: 'dim', label: 'dim' },
  { name: 'aug', label: 'aug' },
  { name: 'sus2', label: 'sus2' },
  { name: 'sus4', label: 'sus4' },
  { name: '7sus4', label: '7sus4' },
  { name: 'add9', label: 'add9' },
  { name: '6', label: '6' },
  { name: 'm6', label: 'm6' },
  { name: '9', label: '9' },
  { name: 'm9', label: 'm9' },
  { name: 'maj9', label: 'maj9' },
  { name: '11', label: '11' },
];

const DEFAULT_OCTAVE = 4; // C4 jako základní oktáva
const MIN_MIDI = 21; // A0
const MAX_MIDI = 108; // C8

// Funkce pro správné skloňování "not/noty" podle počtu
function getNotesText(count: number): string {
  if (count === 1) return '1 nota';
  if (count >= 2 && count <= 4) return `${count} noty`;
  return `${count} not`;
}

export function ChordSelector({ onChordSelect }: ChordSelectorProps) {
  const [selectedRoot, setSelectedRoot] = useState<string>('C');
  const [selectedType, setSelectedType] = useState<string>('');
  const [octaveOffset, setOctaveOffset] = useState<number>(0); // Transpozice o oktávy (výchozí 0 = C4)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isAutoInitializing, setIsAutoInitializing] = useState(false);
  const audioInitialized = useAudioStore((state) => state.initialized);
  const standard = useNotationStore((state) => state.standard);
  const normalizeChord = useNotationStore((state) => state.normalizeChordName);
  // Uložit normalizeChord do ref, aby se neměnila reference při každém renderu
  const normalizeChordRef = useRef(normalizeChord);
  normalizeChordRef.current = normalizeChord;
  
  // Dynamicky generovat labely podle standardu
  const chordTypesWithLabels = useMemo(() => {
    return CHORD_TYPES.map(type => {
      // Pro jazz standard: pokud je prázdný typ (maj), zobrazit prázdný label
      // Pro classical standard: zobrazit "maj"
      if (type.name === '') {
        return {
          ...type,
          label: standard === 'jazz' ? '' : 'maj'
        };
      }
      // Pro ostatní typy použít původní label
      // (většina typů už má správné labely, jen prázdný typ potřebuje úpravu)
      return type;
    });
  }, [standard]);

  // Vypočítat MIDI noty pro vybraný akord (s transpozicí)
  const chordMidiNotes = useMemo(() => {
    const chordName = selectedRoot + selectedType;
    try {
      const chord = Chord.get(chordName);
      if (!chord.notes || chord.notes.length === 0) {
        return [];
      }

      // Získat noty akordu (pitch classes, např. ["C", "E", "G"])
      const pitchClasses = chord.notes;
      
      // Konvertovat na MIDI noty (začínáme od C4 = MIDI 60)
      const midiNotes: number[] = [];
      const baseOctave = DEFAULT_OCTAVE + octaveOffset;

      // Pro každou pitch class najít odpovídající MIDI notu
      for (let i = 0; i < pitchClasses.length; i++) {
        const pitchClass = pitchClasses[i];
        try {
          // Pro root note (první nota) použít přesně baseOctave
          // Pro ostatní noty hledat relativně k root note
          if (i === 0) {
            // Root note - použít přesně baseOctave
            const note = Note.get(`${pitchClass}${baseOctave}`);
            if (note.midi !== null && note.midi >= MIN_MIDI && note.midi <= MAX_MIDI) {
              midiNotes.push(note.midi);
            }
          } else {
            // Ostatní noty - zkusit najít v různých oktávách, preferovat vyšší
            // Zkusit offset 0, +1, -1 (preferovat stejnou nebo vyšší oktávu)
            for (let offset of [0, 1, -1]) {
              const testOctave = baseOctave + offset;
              const note = Note.get(`${pitchClass}${testOctave}`);
              if (note.midi !== null) {
                const transposedMidi = note.midi;
                // Zajistit, že noty jsou v rozsahu klaviatury
                if (transposedMidi >= MIN_MIDI && transposedMidi <= MAX_MIDI) {
                  midiNotes.push(transposedMidi);
                  break;
                }
              }
            }
          }
        } catch {
          // Ignorovat chyby
        }
      }

      // Seřadit a odstranit duplicity
      return Array.from(new Set(midiNotes)).sort((a, b) => a - b);
    } catch {
      return [];
    }
  }, [selectedRoot, selectedType, octaveOffset]);

  // Zavolat callback při změně akordu
  useEffect(() => {
    const rawChordName = selectedRoot + selectedType;
    const normalizedChordName = normalizeChordRef.current(rawChordName);
    if (chordMidiNotes.length > 0 && onChordSelect) {
      onChordSelect(normalizedChordName, chordMidiNotes);
    }
  }, [selectedRoot, selectedType, chordMidiNotes, onChordSelect]);

  // Funkce pro transpozici nahoru
  const transposeUp = () => {
    const newOffset = octaveOffset + 1;
    // Limit +3 oktávy
    if (newOffset > 3) return;
    
    // Vypočítat nové noty s novou transpozicí
    const baseOctave = DEFAULT_OCTAVE + newOffset;
    const chord = Chord.get(selectedRoot + selectedType);
    if (!chord.notes || chord.notes.length === 0) return;
    
    const testNotes: number[] = [];
    for (const pitchClass of chord.notes) {
      for (let offset = -1; offset <= 1; offset++) {
        const testOctave = baseOctave + offset;
        try {
          const note = Note.get(`${pitchClass}${testOctave}`);
          if (note.midi !== null) {
            testNotes.push(note.midi);
            break;
          }
        } catch {
          // Ignorovat chyby
        }
      }
    }
    
    // Zkontrolovat, zda všechny noty jsou v rozsahu
    if (testNotes.length > 0 && testNotes.every(n => n >= MIN_MIDI && n <= MAX_MIDI)) {
      setOctaveOffset(newOffset);
    }
  };

  // Funkce pro transpozici dolů
  const transposeDown = () => {
    const newOffset = octaveOffset - 1;
    // Limit -3 oktávy
    if (newOffset < -3) return;
    
    // Vypočítat nové noty s novou transpozicí (stejná logika jako v chordMidiNotes)
    const baseOctave = DEFAULT_OCTAVE + newOffset;
    const chord = Chord.get(selectedRoot + selectedType);
    if (!chord.notes || chord.notes.length === 0) return;
    
    const testNotes: number[] = [];
    const pitchClasses = chord.notes;
    
    // Použít stejnou logiku jako v chordMidiNotes
    for (let i = 0; i < pitchClasses.length; i++) {
      const pitchClass = pitchClasses[i];
      try {
        if (i === 0) {
          // Root note - použít přesně baseOctave
          const note = Note.get(`${pitchClass}${baseOctave}`);
          if (note.midi !== null && note.midi >= MIN_MIDI && note.midi <= MAX_MIDI) {
            testNotes.push(note.midi);
          }
        } else {
          // Ostatní noty - zkusit najít v různých oktávách, preferovat vyšší
          // Zkusit offset 0, +1, -1 (preferovat stejnou nebo vyšší oktávu)
          let found = false;
          for (let offset of [0, 1, -1]) {
            const testOctave = baseOctave + offset;
            try {
              const note = Note.get(`${pitchClass}${testOctave}`);
              if (note.midi !== null) {
                const transposedMidi = note.midi;
                // Zajistit, zda noty jsou v rozsahu klaviatury
                if (transposedMidi >= MIN_MIDI && transposedMidi <= MAX_MIDI) {
                  testNotes.push(transposedMidi);
                  found = true;
                  break;
                }
              }
            } catch {
              // Ignorovat chyby
            }
          }
          // Pokud se nenašla žádná nota v rozsahu, zkusit ještě nižší oktávy
          if (!found) {
            for (let offset of [-2, -3]) {
              const testOctave = baseOctave + offset;
              try {
                const note = Note.get(`${pitchClass}${testOctave}`);
                if (note.midi !== null) {
                  const transposedMidi = note.midi;
                  if (transposedMidi >= MIN_MIDI && transposedMidi <= MAX_MIDI) {
                    testNotes.push(transposedMidi);
                    found = true;
                    break;
                  }
                }
              } catch {
                // Ignorovat chyby
              }
            }
          }
        }
      } catch {
        // Ignorovat chyby
      }
    }
    
    // Zkontrolovat, zda root note je v rozsahu (to je minimum pro transpozici)
    // Pokud root note není v rozsahu, transpozice není možná
    // Ostatní noty mohou být mimo rozsah - v chordMidiNotes se stejně použijí jen ty v rozsahu
    if (testNotes.length > 0) {
      const rootNote = testNotes[0]; // První nota je root note
      if (rootNote >= MIN_MIDI && rootNote <= MAX_MIDI) {
        // Root note je v rozsahu, povolit transpozici
        // (ostatní noty mimo rozsah se v chordMidiNotes stejně nepoužijí)
        setOctaveOffset(newOffset);
      }
    }
  };

  // Funkce pro spuštění přehrávání akordu (hold)
  const startPlayingChord = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    
    if (chordMidiNotes.length === 0 || isPlaying) return;

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
    
    const engine = getAudioEngine();
    if (!engine) return;

    setIsPlaying(true);
    
    // Přehrát všechny noty akordu
    chordMidiNotes.forEach((midi) => {
      engine.noteOn(midi, 127);
    });
  };

  // Funkce pro zastavení přehrávání akordu
  const stopPlayingChord = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!isPlaying) return;
    
    const engine = getAudioEngine();
    if (!engine) return;

    // Zastavit všechny noty akordu
    chordMidiNotes.forEach((midi) => {
      engine.noteOff(midi);
    });
    
    setIsPlaying(false);
  };

  // Resetovat transpozici při změně akordu (na výchozí 0 = C4)
  useEffect(() => {
    setOctaveOffset(0);
  }, [selectedRoot, selectedType]);

  // Zobrazit název akordu podle standardu
  // Pro classical standard: major akordy (prázdný typ) zobrazit s "M" (CM místo C)
  // Pro jazz standard: major akordy zobrazit bez "M" (C)
  const currentChordName = useMemo(() => {
    const rawChordName = selectedRoot + selectedType;
    // Pro classical standard: pokud je typ prázdný (major), přidat "M"
    if (standard === 'classical' && selectedType === '') {
      return normalizeChord(selectedRoot + 'M');
    }
    // Jinak použít standardní normalizaci
    return normalizeChord(rawChordName);
  }, [selectedRoot, selectedType, standard, normalizeChord]);
  // Kontrola možnosti transpozice nahoru/dolů
  // Pro dolů: zkontrolovat, zda root note při novém offsetu (-1) bude v rozsahu
  const canTransposeUp = chordMidiNotes.length > 0 && octaveOffset < 3;
  
  // Pro dolů: zkontrolovat, zda root note při offsetu -3 bude v rozsahu
  let canTransposeDown = false;
  if (chordMidiNotes.length > 0 && octaveOffset > -3) {
    // Zkontrolovat, zda root note při novém offsetu (octaveOffset - 1) bude v rozsahu
    const testOffset = octaveOffset - 1;
    const testBaseOctave = DEFAULT_OCTAVE + testOffset;
    try {
      const chord = Chord.get(selectedRoot + selectedType);
      if (chord.notes && chord.notes.length > 0) {
        const rootPitchClass = chord.notes[0];
        const rootNote = Note.get(`${rootPitchClass}${testBaseOctave}`);
        if (rootNote.midi !== null && rootNote.midi >= MIN_MIDI && rootNote.midi <= MAX_MIDI) {
          canTransposeDown = true;
        }
      }
    } catch {
      // Pokud selže kontrola, použít původní logiku
      canTransposeDown = chordMidiNotes.length > 0;
    }
  }

  return (
    <div className="chord-selector">
      <h3>Výběr akordu</h3>
      <div className="chord-selector-controls">
        <div className="control-group">
          <label htmlFor="root-select">Základní tón:</label>
          <select
            id="root-select"
            value={selectedRoot}
            onChange={(e) => setSelectedRoot(e.target.value)}
            className="root-select"
          >
            {ROOT_NOTES.map((note) => (
              <option key={note} value={note}>
                {note}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="type-select">Typ akordu:</label>
          <select
            id="type-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="type-select"
          >
            {chordTypesWithLabels.map((type) => {
              // Pro prázdný typ (maj) zobrazit podle standardu
              const displayLabel = type.name === '' 
                ? (standard === 'jazz' ? '' : 'maj')
                : type.label;
              return (
                <option key={type.name} value={type.name}>
                  {displayLabel}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="selected-chord-display">
        <div className="chord-name-row">
          <button
            className="transpose-button"
            onClick={transposeDown}
            disabled={!canTransposeDown}
            title="Transponovat o oktávu dolů"
          >
            - oct.
          </button>
          <div className="chord-name-display">{currentChordName}</div>
          <button
            className="transpose-button"
            onClick={transposeUp}
            disabled={!canTransposeUp}
            title="Transponovat o oktávu nahoru"
          >
            + oct.
          </button>
        </div>
        {chordMidiNotes.length > 0 && (
          <div className="chord-notes-info">
            {getNotesText(chordMidiNotes.length)}
          </div>
        )}
        <button
          className="play-chord-button"
          onMouseDown={startPlayingChord}
          onMouseUp={stopPlayingChord}
          onMouseLeave={stopPlayingChord}
          onTouchStart={startPlayingChord}
          onTouchEnd={stopPlayingChord}
          onContextMenu={(e) => e.preventDefault()}
          disabled={chordMidiNotes.length === 0 || isAutoInitializing}
        >
          {isAutoInitializing 
            ? '⏳ Inicializace...' 
            : isPlaying 
              ? '🔊 Držet' 
              : '▶ Držet pro přehrání'}
        </button>
      </div>
    </div>
  );
}

