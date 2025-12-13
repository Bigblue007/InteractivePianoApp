import { create } from 'zustand';
import { POPULAR_SONGS } from '../data/popularSongs';

export interface SongSection {
  type: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro';
  label?: string; // Volitelný popisek (např. "Verse 1", "Chorus")
  chords: string[];
}

export interface Song {
  id: string;
  title: string;
  artist: string; // Povinné (místo optional)
  chords: string[]; // Seznam akordů v pořadí (deprecated - použít sections)
  sections?: SongSection[]; // Sekce písně (verse, chorus, bridge)
  createdAt: Date;
  updatedAt: Date;
}

interface SongLibraryState {
  songs: Song[];
  selectedSongId: string | null;
  searchQuery: string;
  
  // Actions
  addSong: (song: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSong: (id: string, updates: Partial<Song>) => void;
  deleteSong: (id: string) => void;
  getSong: (id: string) => Song | undefined;
  selectSong: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  searchSongs: (query: string) => Song[];
  initializeDefaultSongs: () => void;
}

export const useSongLibraryStore = create<SongLibraryState>((set, get) => ({
  songs: [],
  selectedSongId: null,
  searchQuery: '',

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
      selectedSongId: state.selectedSongId === id ? null : state.selectedSongId,
    }));
  },

  getSong: (id) => {
    return get().songs.find((song) => song.id === id);
  },

  selectSong: (id) => {
    set({ selectedSongId: id });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  searchSongs: (query) => {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) {
      return get().songs;
    }

    return get().songs.filter((song) => {
      const titleMatch = song.title.toLowerCase().includes(normalizedQuery);
      const artistMatch = song.artist.toLowerCase().includes(normalizedQuery);
      return titleMatch || artistMatch;
    });
  },

  initializeDefaultSongs: () => {
    const state = get();
    // Inicializovat pouze pokud store je prázdný
    if (state.songs.length === 0) {
      const defaultSongs: Song[] = POPULAR_SONGS.map((songData) => ({
        ...songData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      set({ songs: defaultSongs });
    }
  },
}));





