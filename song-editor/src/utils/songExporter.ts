import { Song } from '../types/song';

/**
 * Exportuje písně do JSON formátu
 */
export function exportToJSON(songs: Song[]): string {
  const data = {
    songs,
    exportedAt: new Date().toISOString(),
    version: '1.0',
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Stáhne JSON soubor
 */
export function downloadJSON(songs: Song[]): void {
  const json = exportToJSON(songs);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `harmonia-songs-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

