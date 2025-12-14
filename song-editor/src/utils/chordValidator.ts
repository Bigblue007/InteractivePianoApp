import { Chord } from '@tonaljs/tonal';

/**
 * Validuje název akordu pomocí @tonaljs/tonal
 */
export function validateChord(chordName: string): { valid: boolean; error?: string } {
  if (!chordName || chordName.trim().length === 0) {
    return { valid: false, error: 'Akord nemůže být prázdný' };
  }

  const normalized = chordName.trim();
  const chord = Chord.get(normalized);

  if (!chord || chord.empty) {
    return { valid: false, error: `Neplatný akord: ${normalized}` };
  }

  return { valid: true };
}

/**
 * Validuje pole akordů
 */
export function validateChords(chords: string[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  chords.forEach((chord, index) => {
    const validation = validateChord(chord);
    if (!validation.valid) {
      errors.push(`Akord ${index + 1} (${chord}): ${validation.error}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

