import { Song, SongInput } from '../types/song';

/**
 * Exportuje písně do TypeScript formátu pro kopírování do popularSongs.ts
 */
export function exportToTypeScript(songs: Song[]): string {
  const songInputs: SongInput[] = songs.map((song) => ({
    title: song.title,
    artist: song.artist,
    ...(song.chords && song.chords.length > 0 ? { chords: song.chords } : {}),
    ...(song.sections && song.sections.length > 0 ? { sections: song.sections } : {}),
  }));

  const lines: string[] = [];
  lines.push("import { Song } from '../stores/useSongLibraryStore';");
  lines.push('');
  lines.push('export const POPULAR_SONGS: Omit<Song, \'id\' | \'createdAt\' | \'updatedAt\'>[] = [');

  songInputs.forEach((song, index) => {
    lines.push('  {');
    lines.push(`    title: "${escapeString(song.title)}",`);
    lines.push(`    artist: "${escapeString(song.artist)}",`);
    
    if (song.chords && song.chords.length > 0) {
      const chordsStr = song.chords.map((c) => `"${escapeString(c)}"`).join(', ');
      lines.push(`    chords: [${chordsStr}], // Fallback pro backward compatibility`);
    }

    if (song.sections && song.sections.length > 0) {
      lines.push('    sections: [');
      song.sections.forEach((section, sectionIndex) => {
        lines.push('      {');
        lines.push(`        type: "${section.type}",`);
        if (section.label) {
          lines.push(`        label: "${escapeString(section.label)}",`);
        }
        const chordsStr = section.chords.map((c) => `"${escapeString(c)}"`).join(', ');
        lines.push(`        chords: [${chordsStr}]`);
        lines.push(sectionIndex < song.sections!.length - 1 ? '      },' : '      }');
      });
      lines.push('    ]');
    }

    lines.push(index < songInputs.length - 1 ? '  },' : '  }');
  });

  lines.push('];');

  return lines.join('\n');
}

/**
 * Escapuje string pro TypeScript
 */
function escapeString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

