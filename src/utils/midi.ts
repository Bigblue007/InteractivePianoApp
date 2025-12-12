/**
 * Pomocné funkce pro práci s MIDI
 */

/**
 * Konvertuje MIDI číslo na frekvenci v Hz
 */
export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Konvertuje frekvenci na MIDI číslo
 */
export function frequencyToMidi(frequency: number): number {
  return Math.round(12 * Math.log2(frequency / 440) + 69);
}

/**
 * Zkontroluje, zda je MIDI číslo platné
 */
export function isValidMidi(midi: number): boolean {
  return midi >= 0 && midi <= 127;
}





