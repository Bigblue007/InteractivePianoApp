import React, { useState, useEffect } from 'react';
import { useEditorStore } from './stores/useEditorStore';
import { SongList } from './components/SongList/SongList';
import { SongEditForm } from './components/SongEditForm/SongEditForm';
import { ImportExport } from './components/ImportExport/ImportExport';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog/DeleteConfirmDialog';
import './App.css';

function App() {
  const {
    songs,
    selectedSongId,
    selectSong,
    addSong,
    updateSong,
    deleteSong,
    getSong,
    loadFromLocalStorage,
  } = useEditorStore();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [songToDelete, setSongToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  const selectedSong = selectedSongId ? getSong(selectedSongId) : null;

  const handleSaveSong = (song: typeof selectedSong extends null ? never : typeof selectedSong) => {
    if (selectedSongId && selectedSong) {
      updateSong(selectedSongId, song);
    } else {
      addSong(song);
    }
    selectSong(null);
  };

  const handleCancelEdit = () => {
    selectSong(null);
  };

  const handleNewSong = () => {
    selectSong('new');
  };

  const handleDeleteSong = (id: string) => {
    const song = getSong(id);
    if (song) {
      setSongToDelete(id);
      setShowDeleteDialog(true);
    }
  };

  const handleConfirmDelete = () => {
    if (songToDelete) {
      deleteSong(songToDelete);
      if (selectedSongId === songToDelete) {
        selectSong(null);
      }
      setSongToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const handleCancelDelete = () => {
    setSongToDelete(null);
    setShowDeleteDialog(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Harmonia Song Editor</h1>
        <p className="subtitle">Vývojářský nástroj pro správu song library</p>
      </header>

      <div className="app-content">
        <div className="sidebar">
          <ImportExport />
          <div className="new-song-section">
            <button
              type="button"
              onClick={handleNewSong}
              className="new-song-btn"
            >
              + Nová píseň
            </button>
          </div>
          <SongList
            songs={songs}
            selectedSongId={selectedSongId === 'new' ? null : selectedSongId}
            onSelectSong={selectSong}
            onDeleteSong={handleDeleteSong}
          />
        </div>

        <div className="main-content">
          {selectedSongId === 'new' || selectedSong ? (
            <SongEditForm
              song={selectedSongId === 'new' ? null : selectedSong}
              onSave={handleSaveSong}
              onCancel={handleCancelEdit}
            />
          ) : (
            <div className="empty-state">
              <p>Vyberte píseň ze seznamu nebo vytvořte novou.</p>
            </div>
          )}
        </div>
      </div>

      {showDeleteDialog && songToDelete && (
        <DeleteConfirmDialog
          songTitle={getSong(songToDelete)?.title || 'Neznámá píseň'}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}

export default App;

