/**
 * Pomocné funkce pro práci s notami a MIDI
 */

export const MIDI_NOTE_NAMES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

/**
 * Konvertuje MIDI číslo na název noty
 */
export function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const note = MIDI_NOTE_NAMES[midi % 12];
  return `${note}${octave}`;
}

/**
 * Zkontroluje, zda je nota černá klávesa
 */
export function isBlackKey(midi: number): boolean {
  const note = midi % 12;
  return [1, 3, 6, 8, 10].includes(note); // C#, D#, F#, G#, A#
}

/**
 * Získá pozici klávesy v oktávě (0-11)
 */
export function getKeyPositionInOctave(midi: number): number {
  return midi % 12;
}

/**
 * Získá počet bílých kláves před danou notou v oktávě
 */
export function getWhiteKeyIndex(midi: number): number {
  const note = midi % 12;
  const whiteKeyMap: Record<number, number> = {
    0: 0,  // C
    2: 1,  // D
    4: 2,  // E
    5: 3,  // F
    7: 4,  // G
    9: 5,  // A
    11: 6, // B
  };
  return whiteKeyMap[note] ?? -1;
}





