import React from 'react';
import { Song } from '../../types/song';
import './SongList.css';

interface SongListProps {
  songs: Song[];
  selectedSongId: string | null;
  onSelectSong: (id: string) => void;
  onDeleteSong: (id: string) => void;
}

export function SongList({ songs, selectedSongId, onSelectSong, onDeleteSong }: SongListProps) {
  if (songs.length === 0) {
    return (
      <div className="song-list empty">
        <p>Žádné písně. Načtěte písně z TypeScript souboru nebo vytvořte novou.</p>
      </div>
    );
  }

  return (
    <div className="song-list">
      <h3>Seznam písní ({songs.length})</h3>
      <div className="songs-grid">
        {songs.map((song) => (
          <div
            key={song.id}
            className={`song-item ${selectedSongId === song.id ? 'selected' : ''}`}
          >
            <div
              className="song-info"
              onClick={() => onSelectSong(song.id)}
            >
              <div className="song-title">{song.title}</div>
              <div className="song-artist">{song.artist}</div>
              <div className="song-meta">
                {song.sections?.length || 0} sekcí
              </div>
            </div>
            <button
              type="button"
              onClick={() => onDeleteSong(song.id)}
              className="delete-song-btn"
              aria-label="Smazat píseň"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

