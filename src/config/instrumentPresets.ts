/**
 * Typy a konfigurace pro nástroje
 * 
 * Struktura samplů TKI:
 * - TKI_{Note}{Octave}_Level1_RR{1-3}.mp3 (soft velocity)
 * - TKI_{Note}{Octave}_Level2_RR{1-3}.mp3 (hard velocity)
 * - TKI_{Note}{Octave}_RT_RR{1-3}.mp3 (release trigger)
 * - TKI_PD_RR{1-3}.mp3 (pedal down)
 * - TKI_PU_RR{1-3}.mp3 (pedal up)
 * - TKI_Pads_{Note}{Octave}.mp3 (pad samply)
 */

export type VelocityLayer = 'Level1' | 'Level2';
export type InstrumentType = 'sampler' | 'synthetic';
export type RoundRobin = 'RR1' | 'RR2' | 'RR3';

export interface SampleConfig {
  midi: number; // MIDI nota, pro kterou existuje sample
  note: string; // Název noty (např. "A1", "C#2")
  octave: number; // Oktáva (0-6)
  layers: {
    Level1: string[]; // URL k MP3 samplům Level1 (RR1, RR2, RR3)
    Level2: string[]; // URL k MP3 samplům Level2 (RR1, RR2, RR3)
    RT: string[]; // URL k Release Trigger samplům (RR1, RR2, RR3)
  };
}

export interface PedalSamples {
  PD: string[]; // Pedal Down samply (RR1, RR2, RR3)
  PU: string[]; // Pedal Up samply (RR1, RR2, RR3)
}

export interface InstrumentPreset {
  id: string;
  name: string;
  type: InstrumentType;
  samples?: SampleConfig[]; // Pro sampler typ
  pedalSamples?: PedalSamples; // Pedal samply
  syntheticType?: 'piano' | 'dx7'; // Pro synthetic typ
}

/**
 * Pomocná funkce pro generování názvu samplu
 */
function getSampleFileName(note: string, octave: number, type: VelocityLayer | 'RT', roundRobin: RoundRobin): string {
  return `TKI_${note}${octave}_${type}_${roundRobin}.mp3`;
}

/**
 * Pomocná funkce pro konverzi noty na MIDI číslo
 * POZNÁMKA: Samply jsou označené o oktávu níž než ve skutečnosti jsou
 * (např. TKI_D#3_Level1_RR1.mp3 je ve skutečnosti D#4)
 * Proto přidáváme offset +12 (1 oktáva) pro správné mapování
 */
function noteToMidi(note: string, octave: number): number {
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

  const noteOffset = noteMap[note] || 0;
  // Přidat offset +12 (1 oktáva), protože samply jsou označené o oktávu níž
  return (octave + 1) * 12 + noteOffset + 12;
}

/**
 * Vytvoří konfiguraci samplů pro danou notu a oktávu
 * Poznámka: Některé noty nemají všechny vrstvy (např. A5 má jen Level2)
 */
function createSampleConfig(note: string, octave: number, basePath: string): SampleConfig {
  const midi = noteToMidi(note, octave);
  const roundRobins: RoundRobin[] = ['RR1', 'RR2', 'RR3'];
  
  // Zkontrolovat, které vrstvy skutečně existují
  // A5 má jen Level2, ne Level1 a RT
  // A#5 má jen Level1 a RT, ne Level2
  const isA5 = note === 'A' && octave === 5;
  const isASharp5 = note === 'A#' && octave === 5;
  const hasLevel1 = !isA5; // A5 nemá Level1, A#5 má
  const hasLevel2 = !isASharp5; // A#5 nemá Level2, všechny ostatní mají
  const hasRT = !isA5; // A5 nemá RT, A#5 má
  
  return {
    midi,
    note: `${note}${octave}`,
    octave,
    layers: {
      Level1: hasLevel1 ? roundRobins.map(rr => `${basePath}${getSampleFileName(note, octave, 'Level1', rr)}`) : [],
      Level2: hasLevel2 ? roundRobins.map(rr => `${basePath}${getSampleFileName(note, octave, 'Level2', rr)}`) : [],
      RT: hasRT ? roundRobins.map(rr => `${basePath}${getSampleFileName(note, octave, 'RT', rr)}`) : [],
    },
  };
}

/**
 * Preset pro akustické piano se samplery TKI
 * 
 * STRATEGIE: Používá všechny existující samply pro maximální kvalitu
 * Samply jsou ořezané na:
 * - Level1/Level2: 2.5 sekundy (attack + decay + začátek sustain)
 * - RT: 1 sekunda (release zvuk)
 * 
 * Pro noty bez samplů se použije pitch shift z nejbližšího existujícího samplu.
 * 
 * Pro ořezání použijte: npm run trim-samples
 */
export const pianoAcousticPreset: InstrumentPreset = {
  id: 'piano-acoustic',
  name: 'Piano (Acoustic)',
  type: 'sampler',
  samples: (() => {
    const samples: SampleConfig[] = [];
    const basePath = '/samples/piano-acoustic/';
    
    // Použít všechny existující samply podle skutečných souborů
    // Tyto noty mají skutečné samply (zjištěno z existujících souborů)
    const availableNotes: Array<{ note: string; octave: number }> = [
      // C
      { note: 'C', octave: 0 },
      { note: 'C#', octave: 2 },
      { note: 'C#', octave: 4 },
      // D
      { note: 'D', octave: 1 },
      { note: 'D#', octave: 3 },
      { note: 'D#', octave: 5 },
      { note: 'D#', octave: 6 },
      // E
      { note: 'E', octave: 0 },
      { note: 'E', octave: 2 },
      { note: 'E', octave: 4 },
      // F
      { note: 'F#', octave: 1 },
      { note: 'F#', octave: 3 },
      { note: 'F#', octave: 5 },
      { note: 'F', octave: 6 },
      // G
      { note: 'G', octave: 0 },
      { note: 'G#', octave: 2 },
      { note: 'G#', octave: 4 },
      // A
      { note: 'A', octave: 1 },
      { note: 'A', octave: 3 },
      { note: 'A', octave: 5 },
      { note: 'A#', octave: 5 },
      // B
      { note: 'B', octave: 0 },
      { note: 'B', octave: 2 },
      { note: 'B', octave: 4 },
    ];
    
    // Vytvořit konfiguraci pro každou existující notu
    for (const { note, octave } of availableNotes) {
      samples.push(createSampleConfig(note, octave, basePath));
    }
    
    return samples;
  })(),
  pedalSamples: {
    PD: [
      '/samples/piano-acoustic/TKI_PD_RR1.mp3',
      '/samples/piano-acoustic/TKI_PD_RR2.mp3',
      '/samples/piano-acoustic/TKI_PD_RR3.mp3',
    ],
    PU: [
      '/samples/piano-acoustic/TKI_PU_RR1.mp3',
      '/samples/piano-acoustic/TKI_PU_RR2.mp3',
      '/samples/piano-acoustic/TKI_PU_RR3.mp3',
    ],
  },
};

/**
 * Mapování všech presets
 */
export const instrumentPresets: Map<string, InstrumentPreset> = new Map([
  ['piano-acoustic', pianoAcousticPreset],
]);

/**
 * Získá preset podle ID
 */
export function getPreset(id: string): InstrumentPreset | undefined {
  return instrumentPresets.get(id);
}
