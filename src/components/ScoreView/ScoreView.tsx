import { useEffect, useRef } from 'react';
import { usePianoStore } from '../../stores/usePianoStore';
import { ScoreRenderer } from '../../services/score/ScoreRenderer';
import './ScoreView.css';

export function ScoreView() {
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
      const notesArray = Array.from(activeNotes);
      rendererRef.current.renderNotes(notesArray);
    }
  }, [activeNotes]);

  return (
    <div className="score-view">
      <div id="score-container" ref={containerRef}></div>
    </div>
  );
}





