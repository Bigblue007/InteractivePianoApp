import { useEffect, useRef } from 'react';
import { useAudioStore } from '../../stores/useAudioStore';
import { usePianoStore } from '../../stores/usePianoStore';
import { getAudioEngine } from '../AudioInitButton/AudioInitButton';

/**
 * Neviditelná komponenta pro správu audio přehrávání
 * Sleduje změny aktivních not a sustain pedálu a přehrává je
 */
export function AudioManager() {
  const audioInitialized = useAudioStore((state) => state.initialized);
  const activeNotes = usePianoStore((state) => state.activeNotes);
  const sustain = usePianoStore((state) => state.sustain);
  const prevActiveNotesRef = useRef<Set<number>>(new Set());
  const prevSustainRef = useRef<boolean>(false);

  // Sledovat změny aktivních not a přehrávat je
  useEffect(() => {
    if (!audioInitialized) return;

    const audioEngine = getAudioEngine();
    if (!audioEngine) return;

    const currentNotes = new Set(activeNotes);
    const prevNotes = prevActiveNotesRef.current;

    // Najít nově přidané noty
    const newNotes = Array.from(currentNotes).filter((n) => !prevNotes.has(n));
    const removedNotes = Array.from(prevNotes).filter((n) => !currentNotes.has(n));

    newNotes.forEach((midi) => {
      audioEngine.noteOn(midi, 127);
    });

    removedNotes.forEach((midi) => {
      audioEngine.noteOff(midi);
    });

    prevActiveNotesRef.current = new Set(currentNotes);
  }, [activeNotes, audioInitialized]);

  // Sledovat změny sustain pedálu
  useEffect(() => {
    if (!audioInitialized) return;

    const audioEngine = getAudioEngine();
    if (!audioEngine) return;

    if (sustain !== prevSustainRef.current) {
      audioEngine.setSustain(sustain);
      prevSustainRef.current = sustain;
    }
  }, [sustain, audioInitialized]);

  // Resetovat refs při inicializaci
  useEffect(() => {
    if (audioInitialized) {
      prevActiveNotesRef.current = new Set(usePianoStore.getState().activeNotes);
      prevSustainRef.current = usePianoStore.getState().sustain;
    }
  }, [audioInitialized]);

  // Neviditelná komponenta - nic nerenderuje
  return null;
}




