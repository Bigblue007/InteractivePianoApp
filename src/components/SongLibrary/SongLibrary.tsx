import { useEffect, useState } from 'react';
import { useSongLibraryStore } from '../../stores/useSongLibraryStore';
import { SearchBar } from './SearchBar';
import { SongList } from './SongList';
import { SongDetail } from './SongDetail';
import './SongLibrary.css';

interface SongLibraryProps {
  onChordClick: (chordName: string) => void;
  onChordStart?: (chordName: string, index: number, sectionIndex: number, chordIndexInSection: number) => void;
  onChordStop?: () => void;
  selectedChordIndex?: number;
  selectedSectionIndex?: number;
  selectedChordIndexInSection?: number;
}

export function SongLibrary({ 
  onChordClick, 
  onChordStart,
  onChordStop,
  selectedChordIndex,
  selectedSectionIndex,
  selectedChordIndexInSection
}: SongLibraryProps) {
  const songs = useSongLibraryStore((state) => state.songs);
  const selectedSongId = useSongLibraryStore((state) => state.selectedSongId);
  const searchQuery = useSongLibraryStore((state) => state.searchQuery);
  const setSearchQuery = useSongLibraryStore((state) => state.setSearchQuery);
  const selectSong = useSongLibraryStore((state) => state.selectSong);
  const searchSongs = useSongLibraryStore((state) => state.searchSongs);
  const initializeDefaultSongs = useSongLibraryStore((state) => state.initializeDefaultSongs);

  // Inicializovat výchozí písně při mount
  useEffect(() => {
    initializeDefaultSongs();
  }, [initializeDefaultSongs]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSelectSong = (song: { id: string }) => {
    selectSong(song.id);
  };

  const handleBack = () => {
    selectSong(null);
  };

  const filteredSongs = searchSongs(searchQuery);
  const selectedSong = selectedSongId ? songs.find((s) => s.id === selectedSongId) : null;

  return (
    <div className="song-library">
      <div className="song-library-header">
        <h3>Knihovna písniček</h3>
      </div>
      {!selectedSong ? (
        <>
          <SearchBar onSearch={handleSearch} />
          <SongList
            songs={filteredSongs}
            onSelectSong={handleSelectSong}
            selectedSongId={selectedSongId || undefined}
          />
        </>
      ) : (
        <SongDetail
          song={selectedSong}
          onChordClick={onChordClick}
          onChordStart={onChordStart}
          onChordStop={onChordStop}
          onBack={handleBack}
          selectedChordIndex={selectedChordIndex}
          selectedSectionIndex={selectedSectionIndex}
          selectedChordIndexInSection={selectedChordIndexInSection}
        />
      )}
    </div>
  );
}

