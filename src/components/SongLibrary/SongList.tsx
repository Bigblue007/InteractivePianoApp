import { Song } from '../../stores/useSongLibraryStore';
import './SongList.css';

interface SongListProps {
  songs: Song[];
  onSelectSong: (song: Song) => void;
  selectedSongId?: string;
}

export function SongList({ songs, onSelectSong, selectedSongId }: SongListProps) {
  if (songs.length === 0) {
    return (
      <div className="song-list-empty">
        <p>Žádné písně nenalezeny</p>
      </div>
    );
  }

  return (
    <div className="song-list">
      {songs.map((song) => (
        <div
          key={song.id}
          className={`song-item ${selectedSongId === song.id ? 'selected' : ''}`}
          onClick={() => onSelectSong(song)}
        >
          <div className="song-item-title">{song.title}</div>
          <div className="song-item-artist">{song.artist}</div>
        </div>
      ))}
    </div>
  );
}

