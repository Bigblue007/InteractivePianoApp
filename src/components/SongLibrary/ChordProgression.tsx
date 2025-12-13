import { SongSection } from '../../stores/useSongLibraryStore';
import './ChordProgression.css';

interface ChordProgressionProps {
  chords?: string[]; // Deprecated - použít sections
  sections?: SongSection[];
  onChordClick: (chordName: string) => void;
  onChordStart?: (chordName: string, index: number, sectionIndex: number, chordIndexInSection: number) => void;
  onChordStop?: () => void;
  selectedChordIndex?: number;
  selectedSectionIndex?: number;
  selectedChordIndexInSection?: number;
}

export function ChordProgression({ 
  chords,
  sections,
  onChordClick, 
  onChordStart,
  onChordStop,
  selectedChordIndex,
  selectedSectionIndex,
  selectedChordIndexInSection
}: ChordProgressionProps) {
  // Podpora pro starý formát (chords array) - backward compatibility
  const useSections = sections && sections.length > 0;

  if (!useSections && (!chords || chords.length === 0)) {
    return (
      <div className="chord-progression-empty">
        <p>Žádné akordy</p>
      </div>
    );
  }

  const handlePointerDown = (chord: string, sectionIndex: number, chordIndexInSection: number, globalIndex: number) => {
    if (onChordStart) {
      onChordStart(chord, globalIndex, sectionIndex, chordIndexInSection);
    } else {
      onChordClick(chord);
    }
  };

  const handlePointerUp = () => {
    if (onChordStop) {
      onChordStop();
    }
  };

  // Pokud máme sekce, zobrazit je s hlavičkami
  if (useSections) {
    let globalChordIndex = 0;
    return (
      <div className="chord-progression-sections">
        {sections.map((section, sectionIndex) => {
          const sectionChords = section.chords.map((chord, chordIndexInSection) => {
            const currentGlobalIndex = globalChordIndex++;
            const isSelected = selectedSectionIndex === sectionIndex && 
                              selectedChordIndexInSection === chordIndexInSection;
            return (
              <div
                key={`${sectionIndex}-${chordIndexInSection}`}
                className={`chord-item ${isSelected ? 'selected' : ''}`}
                onPointerDown={(e) => {
                  e.preventDefault();
                  handlePointerDown(chord, sectionIndex, chordIndexInSection, currentGlobalIndex);
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  handlePointerUp();
                }}
                onPointerLeave={(e) => {
                  e.preventDefault();
                  handlePointerUp();
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handlePointerDown(chord, sectionIndex, chordIndexInSection, currentGlobalIndex);
                }}
                onMouseUp={(e) => {
                  e.preventDefault();
                  handlePointerUp();
                }}
                onMouseLeave={(e) => {
                  e.preventDefault();
                  handlePointerUp();
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handlePointerDown(chord, sectionIndex, chordIndexInSection, currentGlobalIndex);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handlePointerUp();
                }}
                onTouchCancel={(e) => {
                  e.preventDefault();
                  handlePointerUp();
                }}
              >
                <span className="chord-number">{chordIndexInSection + 1}</span>
                <span className="chord-name">{chord}</span>
              </div>
            );
          });
          
          return (
            <div key={sectionIndex} className="chord-section">
              <div className="section-header">
                <span className="section-type">{getSectionTypeLabel(section.type)}</span>
                {section.label && <span className="section-label">{section.label}</span>}
              </div>
              <div className="chord-progression">
                {sectionChords}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Starý formát - bez sekcí
  return (
    <div className="chord-progression">
      {chords!.map((chord, index) => (
        <div
          key={index}
          className={`chord-item ${selectedChordIndex === index ? 'selected' : ''}`}
          onPointerDown={(e) => {
            e.preventDefault();
            handlePointerDown(chord, -1, index, index);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            handlePointerUp();
          }}
          onPointerLeave={(e) => {
            e.preventDefault();
            handlePointerUp();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            handlePointerDown(chord, -1, index, index);
          }}
          onMouseUp={(e) => {
            e.preventDefault();
            handlePointerUp();
          }}
          onMouseLeave={(e) => {
            e.preventDefault();
            handlePointerUp();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            handlePointerDown(chord, -1, index, index);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            handlePointerUp();
          }}
          onTouchCancel={(e) => {
            e.preventDefault();
            handlePointerUp();
          }}
        >
          <span className="chord-number">{index + 1}</span>
          <span className="chord-name">{chord}</span>
        </div>
      ))}
    </div>
  );
}

function getSectionTypeLabel(type: SongSection['type']): string {
  const labels: Record<SongSection['type'], string> = {
    verse: 'Sloka',
    chorus: 'Refrén',
    bridge: 'Bridge',
    intro: 'Intro',
    outro: 'Outro',
  };
  return labels[type];
}

function getSectionLabel(type: SongSection['type'], index: number): string {
  const typeLabel = getSectionTypeLabel(type);
  if (type === 'chorus' || type === 'bridge' || type === 'intro' || type === 'outro') {
    return typeLabel;
  }
  return `${typeLabel} ${index + 1}`;
}

