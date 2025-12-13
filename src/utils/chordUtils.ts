import { Chord, Note } from '@tonaljs/tonal';

const DEFAULT_OCTAVE = 4; // C4 jako základní oktáva
const MIN_MIDI = 21; // A0
const MAX_MIDI = 108; // C8;

/**
 * Konvertuje název akordu na pole MIDI not
 * Používá stejnou logiku jako ChordSelector
 * 
 * @param chordName - Název akordu (např. "C", "Am", "Fmaj7")
 * @param octave - Základní oktáva (default 4 = C4)
 * @returns Pole MIDI not v rozsahu klaviatury
 */
export function chordToMidiNotes(
  chordName: string,
  octave: number = DEFAULT_OCTAVE
): number[] {
  try {
    const chord = Chord.get(chordName);
    if (!chord.notes || chord.notes.length === 0) {
      return [];
    }

    // Získat noty akordu (pitch classes, např. ["C", "E", "G"])
    const pitchClasses = chord.notes;
    
    // Konvertovat na MIDI noty (začínáme od zadané oktávy)
    const midiNotes: number[] = [];
    const baseOctave = octave;

    // Pro každou pitch class najít odpovídající MIDI notu
    for (let i = 0; i < pitchClasses.length; i++) {
      const pitchClass = pitchClasses[i];
      try {
        // Pro root note (první nota) použít přesně baseOctave
        // Pro ostatní noty hledat relativně k root note
        if (i === 0) {
          // Root note - použít přesně baseOctave
          const note = Note.get(`${pitchClass}${baseOctave}`);
          if (note.midi !== null && note.midi >= MIN_MIDI && note.midi <= MAX_MIDI) {
            midiNotes.push(note.midi);
          }
        } else {
          // Ostatní noty - zkusit najít v různých oktávách, preferovat vyšší
          // Zkusit offset 0, +1, -1 (preferovat stejnou nebo vyšší oktávu)
          let found = false;
          for (let offset of [0, 1, -1]) {
            const testOctave = baseOctave + offset;
            const note = Note.get(`${pitchClass}${testOctave}`);
            if (note.midi !== null) {
              const transposedMidi = note.midi;
              // Zajistit, že noty jsou v rozsahu klaviatury
              if (transposedMidi >= MIN_MIDI && transposedMidi <= MAX_MIDI) {
                midiNotes.push(transposedMidi);
                found = true;
                break;
              }
            }
          }
          // Pokud se nenašla žádná nota v rozsahu, zkusit ještě nižší oktávy
          if (!found) {
            for (let offset of [-2, -3]) {
              const testOctave = baseOctave + offset;
              try {
                const note = Note.get(`${pitchClass}${testOctave}`);
                if (note.midi !== null) {
                  const transposedMidi = note.midi;
                  if (transposedMidi >= MIN_MIDI && transposedMidi <= MAX_MIDI) {
                    midiNotes.push(transposedMidi);
                    found = true;
                    break;
                  }
                }
              } catch {
                // Ignorovat chyby
              }
            }
          }
        }
      } catch {
        // Ignorovat chyby
      }
    }

    // Seřadit a odstranit duplicity
    return Array.from(new Set(midiNotes)).sort((a, b) => a - b);
  } catch {
    return [];
  }
}

