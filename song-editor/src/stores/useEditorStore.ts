import { create } from 'zustand';
import { Song, SongInput } from '../types/song';

interface EditorState {
  songs: Song[];
  selectedSongId: string | null | 'new'; // 'new' pro novou píseň
  
  // Actions
  addSong: (song: SongInput) => void;
  updateSong: (id: string, updates: Partial<Song>) => void;
  deleteSong: (id: string) => void;
  getSong: (id: string) => Song | undefined;
  selectSong: (id: string | null | 'new') => void;
  importSongs: (songs: Song[]) => void;
  exportSongs: () => Song[];
  loadFromLocalStorage: () => void;
  saveToLocalStorage: () => void;
}

const STORAGE_KEY = 'harmonia-song-editor';

export const useEditorStore = create<EditorState>((set, get) => ({
  songs: [],
  selectedSongId: null,

  addSong: (songData) => {
    const newSong: Song = {
      ...songData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      songs: [...state.songs, newSong],
    }));
    get().saveToLocalStorage();
  },

  updateSong: (id, updates) => {
    set((state) => ({
      songs: state.songs.map((song) =>
        song.id === id
          ? { ...song, ...updates, updatedAt: new Date().toISOString() }
          : song
      ),
    }));
    get().saveToLocalStorage();
  },

  deleteSong: (id) => {
    set((state) => ({
      songs: state.songs.filter((song) => song.id !== id),
      selectedSongId: state.selectedSongId === id ? null : state.selectedSongId,
    }));
    get().saveToLocalStorage();
  },

  getSong: (id) => {
    return get().songs.find((song) => song.id === id);
  },

  selectSong: (id) => {
    set({ selectedSongId: id });
  },

  importSongs: (songs) => {
    // Validace a přidání písní
    const validSongs = songs.map((song) => ({
      ...song,
      id: song.id || crypto.randomUUID(),
      createdAt: song.createdAt || new Date().toISOString(),
      updatedAt: song.updatedAt || new Date().toISOString(),
    }));
    set({ songs: validSongs });
    get().saveToLocalStorage();
  },

  exportSongs: () => {
    return get().songs;
  },

  loadFromLocalStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (Array.isArray(data.songs)) {
          set({ songs: data.songs });
        }
      }
    } catch (error) {
      console.error('Chyba při načítání z localStorage:', error);
    }
  },

  saveToLocalStorage: () => {
    try {
      const data = {
        songs: get().songs,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Chyba při ukládání do localStorage:', error);
    }
  },
}));

