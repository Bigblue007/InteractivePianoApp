import { useMemo } from 'react';
import { usePianoStore } from '../../stores/usePianoStore';
import { useNotationStore } from '../../stores/useNotationStore';
import { ChordDetector } from '../../services/chord/ChordDetector';
import './ChordPanel.css';

export function ChordPanel() {
  const activeNotes = usePianoStore((state) => state.activeNotes);
  const standard = useNotationStore((state) => state.standard);

  const chordName = useMemo(() => {
    return ChordDetector.detectChord(activeNotes);
  }, [activeNotes, standard]);

  return (
    <div className="chord-panel">
      <h3>Detekovaný akord</h3>
      <div className="chord-name-display">
        {chordName || '-'}
      </div>
    </div>
  );
}


