import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Song, SongSection } from '../../types/song';
import { EditableSection } from '../EditableSection/EditableSection';
import './SongEditForm.css';

interface SongEditFormProps {
  song: Song | null;
  onSave: (song: Song) => void;
  onCancel: () => void;
}

export function SongEditForm({ song, onSave, onCancel }: SongEditFormProps) {
  const [title, setTitle] = useState(song?.title || '');
  const [artist, setArtist] = useState(song?.artist || '');
  const [sections, setSections] = useState<SongSection[]>(song?.sections || []);

  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setArtist(song.artist);
      setSections(song.sections || []);
    } else {
      setTitle('');
      setArtist('');
      setSections([]);
    }
  }, [song]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((_, i) => `section-${i}` === active.id);
        const newIndex = items.findIndex((_, i) => `section-${i}` === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddSection = () => {
    setSections([
      ...sections,
      {
        type: 'verse',
        chords: [],
      },
    ]);
  };

  const handleUpdateSection = (index: number, section: SongSection) => {
    const newSections = [...sections];
    newSections[index] = section;
    setSections(newSections);
  };

  const handleDeleteSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Validace
    if (!title.trim()) {
      alert('Název písně je povinný');
      return;
    }
    if (!artist.trim()) {
      alert('Interpret je povinný');
      return;
    }
    if (sections.length === 0) {
      alert('Píseň musí mít alespoň jednu sekci');
      return;
    }
    if (sections.some((s) => s.chords.length === 0)) {
      alert('Všechny sekce musí mít alespoň jeden akord');
      return;
    }

    const updatedSong: Song = {
      ...(song || {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      title: title.trim(),
      artist: artist.trim(),
      sections,
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedSong);
  };

  return (
    <div className="song-edit-form">
      <div className="form-header">
        <h2>{song ? 'Editovat píseň' : 'Nová píseň'}</h2>
      </div>

      <div className="form-fields">
        <div className="form-field">
          <label htmlFor="song-title">Název písně *</label>
          <input
            id="song-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Např. Let It Be"
          />
        </div>

        <div className="form-field">
          <label htmlFor="song-artist">Interpret *</label>
          <input
            id="song-artist"
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Např. The Beatles"
          />
        </div>
      </div>

      <div className="sections-container">
        <div className="sections-header">
          <h3>Sekce</h3>
          <button
            type="button"
            onClick={handleAddSection}
            className="add-section-btn"
          >
            + Přidat sekci
          </button>
        </div>

        {sections.length === 0 ? (
          <div className="no-sections">Žádné sekce. Přidejte první sekci.</div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((_, i) => `section-${i}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="sections-list">
                {sections.map((section, index) => (
                  <SortableSectionItem
                    key={`section-${index}`}
                    id={`section-${index}`}
                    section={section}
                    index={index}
                    onUpdate={handleUpdateSection}
                    onDelete={handleDeleteSection}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-btn">
          Zrušit
        </button>
        <button type="button" onClick={handleSave} className="save-btn">
          Uložit
        </button>
      </div>
    </div>
  );
}

interface SortableSectionItemProps {
  id: string;
  section: SongSection;
  index: number;
  onUpdate: (index: number, section: SongSection) => void;
  onDelete: (index: number) => void;
}

function SortableSectionItem({
  id,
  section,
  index,
  onUpdate,
  onDelete,
}: SortableSectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <EditableSection
        section={section}
        sectionIndex={index}
        onUpdate={onUpdate}
        onDelete={onDelete}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}


