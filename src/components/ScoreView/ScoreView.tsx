import { useEffect, useRef } from 'react';
import { usePianoStore } from '../../stores/usePianoStore';
import { ScoreRenderer } from '../../services/score/ScoreRenderer';
import './ScoreView.css';

interface ScoreViewProps {
  displayNotes?: number[]; // Noty z knihovny písniček
}

export function ScoreView({ displayNotes }: ScoreViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<ScoreRenderer | null>(null);
  const activeNotes = usePianoStore((state) => state.activeNotes);

  useEffect(() => {
    if (containerRef.current && !rendererRef.current) {
      rendererRef.current = new ScoreRenderer();
      rendererRef.current.init('score-container');
    }
  }, []);

  useEffect(() => {
    if (rendererRef.current) {
      // Pokud jsou displayNotes z knihovny, použít je, jinak použít activeNotes
      const notesArray = displayNotes && displayNotes.length > 0 
        ? displayNotes 
        : Array.from(activeNotes);
      rendererRef.current.renderNotes(notesArray);
    }
  }, [activeNotes, displayNotes]);

  return (
    <div className="score-view">
      <div id="score-container" ref={containerRef}></div>
    </div>
  );
}





