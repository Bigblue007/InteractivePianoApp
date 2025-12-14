import { Song, SongInput } from '../types/song';

/**
 * Importuje písně z JSON souboru
 */
export function importFromJSON(jsonContent: string): Song[] {
  try {
    const data = JSON.parse(jsonContent);
    
    if (!data.songs || !Array.isArray(data.songs)) {
      throw new Error('Neplatný formát JSON - očekává se objekt s polem "songs"');
    }

    return data.songs.map((song: any) => ({
      id: song.id || crypto.randomUUID(),
      title: song.title || '',
      artist: song.artist || '',
      chords: song.chords,
      sections: song.sections,
      createdAt: song.createdAt || new Date().toISOString(),
      updatedAt: song.updatedAt || new Date().toISOString(),
    }));
  } catch (error) {
    throw new Error(`Chyba při importu JSON: ${error}`);
  }
}

