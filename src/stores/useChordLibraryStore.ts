import { create } from 'zustand';

export interface ChordInfo {
  id: string;
  name: string;
  notes: number[]; // MIDI noty
  description?: string;
  tags: string[];
  createdAt: Date;
}

interface ChordLibraryState {
  chords: ChordInfo[];
  
  // Actions
  addChord: (chord: Omit<ChordInfo, 'id' | 'createdAt'>) => void;
  updateChord: (id: string, updates: Partial<ChordInfo>) => void;
  deleteChord: (id: string) => void;
  getChord: (id: string) => ChordInfo | undefined;
  searchChords: (query: string) => ChordInfo[];
}

export const useChordLibraryStore = create<ChordLibraryState>((set, get) => ({
  chords: [],

  addChord: (chordData) => {
    const newChord: ChordInfo = {
      ...chordData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    set((state) => ({
      chords: [...state.chords, newChord],
    }));
  },

  updateChord: (id, updates) => {
    set((state) => ({
      chords: state.chords.map((chord) =>
        chord.id === id ? { ...chord, ...updates } : chord
      ),
    }));
  },

  deleteChord: (id) => {
    set((state) => ({
      chords: state.chords.filter((chord) => chord.id !== id),
    }));
  },

  getChord: (id) => {
    return get().chords.find((chord) => chord.id === id);
  },

  searchChords: (query) => {
    const lowerQuery = query.toLowerCase();
    return get().chords.filter(
      (chord) =>
        chord.name.toLowerCase().includes(lowerQuery) ||
        chord.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        chord.description?.toLowerCase().includes(lowerQuery)
    );
  },
}));





