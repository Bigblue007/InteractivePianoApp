/**
 * Parser pro názvy samplů ve formátu TKI
 * Formát: TKI_{Note}{Octave}_{Type}_{RR}.mp3
 * 
 * Příklady:
 * - TKI_A1_Level1_RR1.mp3
 * - TKI_C#2_Level2_RR2.mp3
 * - TKI_D#3_RT_RR1.mp3
 * - TKI_PD_RR1.mp3 (pedal down)
 * - TKI_PU_RR1.mp3 (pedal up)
 * - TKI_Pads_D#2.mp3 (pad sample)
 */

export type SampleType = 'Level1' | 'Level2' | 'RT';
export type RoundRobin = 'RR1' | 'RR2' | 'RR3';
export type VelocityLayer = 'Level1' | 'Level2';

export interface ParsedSampleName {
  note?: string; // Např. "A1", "C#2", "D#3"
  octave?: number; // 0-6
  type: SampleType | 'PD' | 'PU' | 'Pads';
  roundRobin?: RoundRobin;
  midi?: number; // MIDI nota (0-127)
}

/**
 * Parsuje název samplu
 */
export function parseSampleName(filename: string): ParsedSampleName | null {
  // Odstranit příponu .mp3
  const name = filename.replace(/\.mp3$/i, '');
  
  // Odstranit prefix TKI_
  if (!name.startsWith('TKI_')) {
    return null;
  }
  
  const withoutPrefix = name.substring(4);
  
  // Speciální případy: Pedal Down/Up
  if (withoutPrefix.startsWith('PD_')) {
    const rrMatch = withoutPrefix.match(/^PD_(RR[123])$/);
    if (rrMatch) {
      return {
        type: 'PD',
        roundRobin: rrMatch[1] as RoundRobin,
      };
    }
  }
  
  if (withoutPrefix.startsWith('PU_')) {
    const rrMatch = withoutPrefix.match(/^PU_(RR[123])$/);
    if (rrMatch) {
      return {
        type: 'PU',
        roundRobin: rrMatch[1] as RoundRobin,
      };
    }
  }
  
  // Pad samply
  if (withoutPrefix.startsWith('Pads_')) {
    const padMatch = withoutPrefix.match(/^Pads_(.+)$/);
    if (padMatch) {
      const notePart = padMatch[1];
      const noteResult = parseNoteAndOctave(notePart);
      if (noteResult) {
        return {
          type: 'Pads',
          note: notePart,
          octave: noteResult.octave,
          midi: noteResult.midi,
        };
      }
    }
  }
  
  // Normální samply: TKI_{Note}{Octave}_{Type}_{RR}
  // Např: TKI_A1_Level1_RR1
  const match = withoutPrefix.match(/^(.+?)_(Level1|Level2|RT)_(RR[123])$/);
  if (!match) {
    return null;
  }
  
  const notePart = match[1];
  const type = match[2] as SampleType;
  const roundRobin = match[3] as RoundRobin;
  
  const noteResult = parseNoteAndOctave(notePart);
  if (!noteResult) {
    return null;
  }
  
  return {
    note: notePart,
    octave: noteResult.octave,
    type,
    roundRobin,
    midi: noteResult.midi,
  };
}

/**
 * Parsuje notu a oktávu (např. "A1", "C#2", "D#3")
 */
function parseNoteAndOctave(notePart: string): { octave: number; midi: number } | null {
  // Regex pro notu a oktávu: {Note}{Octave}
  // Note může být: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
  const match = notePart.match(/^([A-G]#?)(\d+)$/);
  if (!match) {
    return null;
  }
  
  const noteName = match[1];
  const octave = parseInt(match[2], 10);
  
  // Mapování noty na offset
  const noteMap: Record<string, number> = {
    C: 0,
    'C#': 1,
    D: 2,
    'D#': 3,
    E: 4,
    F: 5,
    'F#': 6,
    G: 7,
    'G#': 8,
    A: 9,
    'A#': 10,
    B: 11,
  };
  
  const noteOffset = noteMap[noteName];
  if (noteOffset === undefined) {
    return null;
  }
  
  // MIDI nota = (octave + 1) * 12 + noteOffset
  const midi = (octave + 1) * 12 + noteOffset;
  
  return { octave, midi };
}

/**
 * Vytvoří název souboru samplu
 */
export function buildSampleFileName(
  note: string,
  octave: number,
  type: VelocityLayer | 'RT',
  roundRobin: RoundRobin
): string {
  return `TKI_${note}${octave}_${type}_${roundRobin}.mp3`;
}

/**
 * Vytvoří název souboru pro pedal sample
 */
export function buildPedalFileName(type: 'PD' | 'PU', roundRobin: RoundRobin): string {
  return `TKI_${type}_${roundRobin}.mp3`;
}

