import { create } from 'zustand';
import { MIDINote } from '../types';

interface PianoState {
  activeNotes: Set<MIDINote>;
  sustain: boolean;
  sustainPool: Set<MIDINote>;
  
  // Actions
  noteOn: (midi: MIDINote) => void;
  noteOff: (midi: MIDINote) => void;
  setSustain: (sustain: boolean) => void;
  clearAll: () => void;
}

export const usePianoStore = create<PianoState>((set, get) => ({
  activeNotes: new Set(),
  sustain: false,
  sustainPool: new Set(),

  noteOn: (midi: MIDINote) => {
    set((state) => {
      const newActiveNotes = new Set(state.activeNotes);
      newActiveNotes.add(midi);
      return { activeNotes: newActiveNotes };
    });
  },

  noteOff: (midi: MIDINote) => {
    const state = get();
    if (state.sustain) {
      // Přidat do sustain poolu místo okamžitého uvolnění
      set((s) => {
        const newSustainPool = new Set(s.sustainPool);
        newSustainPool.add(midi);
        return { sustainPool: newSustainPool };
      });
    } else {
      // Okamžité uvolnění
      set((s) => {
        const newActiveNotes = new Set(s.activeNotes);
        newActiveNotes.delete(midi);
        return { activeNotes: newActiveNotes };
      });
    }
  },

  setSustain: (sustain: boolean) => {
    set({ sustain });
    if (!sustain) {
      // Uvolnit všechny noty ze sustain poolu
      const state = get();
      set((s) => {
        const newActiveNotes = new Set(s.activeNotes);
        state.sustainPool.forEach((midi) => {
          newActiveNotes.delete(midi);
        });
        return {
          activeNotes: newActiveNotes,
          sustainPool: new Set(),
        };
      });
    }
  },

  clearAll: () => {
    set({
      activeNotes: new Set(),
      sustainPool: new Set(),
      sustain: false,
    });
  },
}));


