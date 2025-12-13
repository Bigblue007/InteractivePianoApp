import { Song } from '../../stores/useSongLibraryStore';
import { ChordProgression } from './ChordProgression';
import './SongDetail.css';

interface SongDetailProps {
  song: Song;
  onChordClick: (chordName: string) => void;
  onChordStart?: (chordName: string, index: number, sectionIndex: number, chordIndexInSection: number) => void;
  onChordStop?: () => void;
  onBack: () => void;
  selectedChordIndex?: number;
  selectedSectionIndex?: number;
  selectedChordIndexInSection?: number;
}

export function SongDetail({ 
  song, 
  onChordClick, 
  onChordStart,
  onChordStop,
  onBack, 
  selectedChordIndex,
  selectedSectionIndex,
  selectedChordIndexInSection
}: SongDetailProps) {
  return (
    <div className="song-detail">
      <div className="song-detail-header">
        <button className="back-button" onClick={onBack} title="Zpět na seznam">
          ← Zpět
        </button>
        <div className="song-detail-info">
          <span className="song-detail-title">{song.title}</span>
          <span className="song-detail-artist">{song.artist}</span>
        </div>
      </div>
      <div className="song-detail-chords">
        <ChordProgression
          chords={song.chords}
          sections={song.sections}
          onChordClick={onChordClick}
          onChordStart={onChordStart}
          onChordStop={onChordStop}
          selectedChordIndex={selectedChordIndex}
          selectedSectionIndex={selectedSectionIndex}
          selectedChordIndexInSection={selectedChordIndexInSection}
        />
      </div>
    </div>
  );
}

