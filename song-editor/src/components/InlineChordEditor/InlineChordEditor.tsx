import React, { useState, useRef, useEffect } from 'react';
import { validateChord } from '../../utils/chordValidator';
import './InlineChordEditor.css';

interface InlineChordEditorProps {
  chords: string[];
  onChordsChange: (chords: string[]) => void;
}

export function InlineChordEditor({ chords, onChordsChange }: InlineChordEditorProps) {
  const [localChords, setLocalChords] = useState<string[]>(chords);
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setLocalChords(chords);
  }, [chords]);

  const handleChordChange = (index: number, value: string) => {
    const newChords = [...localChords];
    newChords[index] = value;
    setLocalChords(newChords);
    
    // Validace při blur
    const validation = validateChord(value);
    if (validation.valid) {
      const newErrors = { ...validationErrors };
      delete newErrors[index];
      setValidationErrors(newErrors);
    } else {
      setValidationErrors({
        ...validationErrors,
        [index]: validation.error || 'Neplatný akord',
      });
    }
  };

  const handleChordBlur = (index: number) => {
    const chord = localChords[index];
    const validation = validateChord(chord);
    
    if (validation.valid) {
      onChordsChange(localChords);
      const newErrors = { ...validationErrors };
      delete newErrors[index];
      setValidationErrors(newErrors);
    } else {
      setValidationErrors({
        ...validationErrors,
        [index]: validation.error || 'Neplatný akord',
      });
    }
  };

  const handleAddChord = () => {
    const newChords = [...localChords, ''];
    setLocalChords(newChords);
    setTimeout(() => {
      const lastIndex = newChords.length - 1;
      inputRefs.current[lastIndex]?.focus();
    }, 0);
  };

  const handleRemoveChord = (index: number) => {
    const newChords = localChords.filter((_, i) => i !== index);
    setLocalChords(newChords);
    onChordsChange(newChords);
    const newErrors = { ...validationErrors };
    delete newErrors[index];
    // Přesunout chyby pro následující akordy
    Object.keys(newErrors).forEach((key) => {
      const keyNum = parseInt(key);
      if (keyNum > index) {
        newErrors[keyNum - 1] = newErrors[keyNum];
        delete newErrors[keyNum];
      }
    });
    setValidationErrors(newErrors);
  };

  return (
    <div className="inline-chord-editor">
      <div className="chord-inputs">
        {localChords.map((chord, index) => (
          <div key={index} className="chord-input-wrapper">
            <input
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              value={chord}
              onChange={(e) => handleChordChange(index, e.target.value)}
              onBlur={() => handleChordBlur(index)}
              className={`chord-input ${validationErrors[index] ? 'error' : ''}`}
              placeholder="C"
            />
            <button
              type="button"
              onClick={() => handleRemoveChord(index)}
              className="remove-chord-btn"
              aria-label="Odstranit akord"
            >
              ×
            </button>
            {validationErrors[index] && (
              <span className="chord-error">{validationErrors[index]}</span>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleAddChord}
        className="add-chord-btn"
        aria-label="Přidat akord"
      >
        + Přidat akord
      </button>
    </div>
  );
}

