import { create } from 'zustand';
import { MIDINote } from '../types';
import { getAudioEngine } from '../services/audio/AudioEngineInstance';

interface PianoState {
  activeNotes: Set<MIDINote>;
  sustain: boolean;
  
  // Actions
  noteOn: (midi: MIDINote, velocity?: number) => void;
  noteOff: (midi: MIDINote) => void;
  setSustain: (sustain: boolean) => void;
  clearAll: () => void;
}

// Pomocná funkce pro nelineární transformaci velocity (Soft Velocity Curve)
// y = 127 * (x / 127)^0.55
const transformVelocity = (velocity: number): number => {
  if (velocity <= 0) return 0;
  if (velocity >= 127) return 127;
  return Math.round(127 * Math.pow(velocity / 127, 0.55));
};

export const usePianoStore = create<PianoState>((set) => ({
  activeNotes: new Set(),
  sustain: false,

  noteOn: (midi: MIDINote, velocity = 127) => {
    const transformedVelocity = transformVelocity(velocity);

    // 1. Spustit zvuk přímo v audio enginu s velocity
    const engine = getAudioEngine();
    if (engine) {
      engine.noteOn(midi, transformedVelocity);
    }

    // 2. Aktualizovat visual stav pro klaviaturu
    set((state) => {
      const newActiveNotes = new Set(state.activeNotes);
      newActiveNotes.add(midi);
      return { activeNotes: newActiveNotes };
    });
  },

  noteOff: (midi: MIDINote) => {
    // 1. Zastavit/Sustainovat zvuk přímo v audio enginu
    const engine = getAudioEngine();
    if (engine) {
      engine.noteOff(midi);
    }

    // 2. Vizuálně odebrat klávesu ihned při uvolnění
    // (sustain si hlídá audio engine sám, takže klávesa se vizuálně uvolní, což je žádoucí)
    set((state) => {
      const newActiveNotes = new Set(state.activeNotes);
      newActiveNotes.delete(midi);
      return { activeNotes: newActiveNotes };
    });
  },

  setSustain: (sustain: boolean) => {
    // 1. Předat sustain do audio enginu (ten uvolní tóny ze svého poolu)
    const engine = getAudioEngine();
    if (engine) {
      engine.setSustain(sustain);
    }

    // 2. Aktualizovat stav pedálu v UI
    set({ sustain });
  },

  clearAll: () => {
    const engine = getAudioEngine();
    if (engine) {
      engine.dispose();
      // Re-inicializovat prázdný engine by se mělo až při dalším play,
      // ale pro jistotu uvolníme a zrušíme sustain
      engine.setSustain(false);
    }
    
    set({
      activeNotes: new Set(),
      sustain: false,
    });
  },
}));
