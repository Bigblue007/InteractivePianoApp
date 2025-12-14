export interface SongSection {
  type: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro';
  label?: string; // Volitelný popisek (např. "Verse 1", "Chorus")
  chords: string[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  chords?: string[]; // Seznam akordů v pořadí (deprecated - použít sections)
  sections?: SongSection[]; // Sekce písně (verse, chorus, bridge)
  createdAt: string; // ISO string pro JSON serializaci
  updatedAt: string; // ISO string pro JSON serializaci
}

export type SongInput = Omit<Song, 'id' | 'createdAt' | 'updatedAt'>;

