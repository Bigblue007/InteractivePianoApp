import React from 'react';
import { SongSection } from '../../types/song';
import { InlineChordEditor } from '../InlineChordEditor/InlineChordEditor';
import './EditableSection.css';

interface EditableSectionProps {
  section: SongSection;
  sectionIndex: number;
  onUpdate: (index: number, section: SongSection) => void;
  onDelete: (index: number) => void;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

const SECTION_TYPES: SongSection['type'][] = ['verse', 'chorus', 'bridge', 'intro', 'outro'];

const SECTION_TYPE_LABELS: Record<SongSection['type'], string> = {
  verse: 'Sloka',
  chorus: 'Refrén',
  bridge: 'Bridge',
  intro: 'Intro',
  outro: 'Outro',
};

export function EditableSection({
  section,
  sectionIndex,
  onUpdate,
  onDelete,
  isDragging = false,
  dragHandleProps,
}: EditableSectionProps) {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate(sectionIndex, {
      ...section,
      type: e.target.value as SongSection['type'],
    });
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(sectionIndex, {
      ...section,
      label: e.target.value || undefined,
    });
  };

  const handleChordsChange = (chords: string[]) => {
    onUpdate(sectionIndex, {
      ...section,
      chords,
    });
  };

  return (
    <div className={`editable-section ${isDragging ? 'dragging' : ''}`}>
      <div className="section-header">
        <div
          className="drag-handle"
          title="Přetáhnout sekci"
          {...dragHandleProps}
        >
          ≡
        </div>
        <select
          value={section.type}
          onChange={handleTypeChange}
          className="section-type-select"
        >
          {SECTION_TYPES.map((type) => (
            <option key={type} value={type}>
              {SECTION_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={section.label || ''}
          onChange={handleLabelChange}
          placeholder="Label (volitelné, např. Verse 1)"
          className="section-label-input"
        />
        <button
          type="button"
          onClick={() => onDelete(sectionIndex)}
          className="delete-section-btn"
          aria-label="Smazat sekci"
        >
          × Smazat
        </button>
      </div>
      <div className="section-content">
        <InlineChordEditor
          chords={section.chords}
          onChordsChange={handleChordsChange}
        />
      </div>
    </div>
  );
}

