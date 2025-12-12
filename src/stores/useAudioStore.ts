import { create } from 'zustand';
import { SoundFontInfo } from '../types';

interface AudioState {
  soundfonts: SoundFontInfo[];
  selectedSoundFontId: string | null;
  audioContext: AudioContext | null;
  initialized: boolean;

  // Actions
  addSoundFont: (info: SoundFontInfo) => void;
  selectSoundFont: (id: string) => void;
  setAudioContext: (context: AudioContext | null) => void;
  setInitialized: (initialized: boolean) => void;
  markSoundFontLoaded: (id: string, loaded: boolean) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  soundfonts: [],
  selectedSoundFontId: null,
  audioContext: null,
  initialized: false,

  addSoundFont: (info: SoundFontInfo) => {
    set((state) => {
      // Zkontrolovat, zda už existuje soundfont s tímto ID
      const exists = state.soundfonts.some((sf) => sf.id === info.id);
      if (exists) {
        return state; // Nezměnit stav, pokud už existuje
      }
      return {
        soundfonts: [...state.soundfonts, info],
      };
    });
  },

  selectSoundFont: (id: string) => {
    set({ selectedSoundFontId: id });
  },

  setAudioContext: (context: AudioContext | null) => {
    set({ audioContext: context });
  },

  setInitialized: (initialized: boolean) => {
    set({ initialized });
  },

  markSoundFontLoaded: (id: string, loaded: boolean) => {
    set((state) => ({
      soundfonts: state.soundfonts.map((sf) =>
        sf.id === id ? { ...sf, loaded } : sf
      ),
    }));
  },
}));


