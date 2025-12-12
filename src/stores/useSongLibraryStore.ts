import { create } from 'zustand';

export interface Song {
  id: string;
  title: string;
  artist?: string;
  chords: string[]; // Seznam akordů v pořadí
  createdAt: Date;
  updatedAt: Date;
}

interface SongLibraryState {
  songs: Song[];
  
  // Actions
  addSong: (song: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSong: (id: string, updates: Partial<Song>) => void;
  deleteSong: (id: string) => void;
  getSong: (id: string) => Song | undefined;
}

export const useSongLibraryStore = create<SongLibraryState>((set, get) => ({
  songs: [],

  addSong: (songData) => {
    const newSong: Song = {
      ...songData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      songs: [...state.songs, newSong],
    }));
  },

  updateSong: (id, updates) => {
    set((state) => ({
      songs: state.songs.map((song) =>
        song.id === id
          ? { ...song, ...updates, updatedAt: new Date() }
          : song
      ),
    }));
  },

  deleteSong: (id) => {
    set((state) => ({
      songs: state.songs.filter((song) => song.id !== id),
    }));
  },

  getSong: (id) => {
    return get().songs.find((song) => song.id === id);
  },
}));





