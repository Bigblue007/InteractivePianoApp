import React, { useState, useRef } from 'react';
import { parseTypeScriptFile, parseTypeScriptCode } from '../../utils/typescriptParser';
import { importFromJSON } from '../../utils/songImporter';
import { exportToTypeScript } from '../../utils/typescriptExporter';
import { downloadJSON } from '../../utils/songExporter';
import { useEditorStore } from '../../stores/useEditorStore';
import './ImportExport.css';

export function ImportExport() {
  const [showTypeScriptInput, setShowTypeScriptInput] = useState(false);
  const [typescriptCode, setTypescriptCode] = useState('');
  const [exportCode, setExportCode] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const { songs, importSongs } = useEditorStore();

  const handleTypeScriptFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const songInputs = parseTypeScriptFile(content);
        const songs = songInputs.map((song) => ({
          ...song,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        importSongs(songs);
        alert(`Načteno ${songs.length} písní`);
      } catch (error) {
        alert(`Chyba při načítání: ${error}`);
      }
    };
    reader.readAsText(file);
  };

  const handleTypeScriptCodePaste = () => {
    try {
      const songInputs = parseTypeScriptCode(typescriptCode);
      const songs = songInputs.map((song) => ({
        ...song,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      importSongs(songs);
      setShowTypeScriptInput(false);
      setTypescriptCode('');
      alert(`Načteno ${songs.length} písní`);
    } catch (error) {
      alert(`Chyba při parsování: ${error}`);
    }
  };

  const handleJSONFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedSongs = importFromJSON(content);
        importSongs(importedSongs);
        alert(`Načteno ${importedSongs.length} písní`);
      } catch (error) {
        alert(`Chyba při načítání JSON: ${error}`);
      }
    };
    reader.readAsText(file);
  };

  const handleExportTypeScript = () => {
    if (songs.length === 0) {
      alert('Nejsou žádné písně k exportu');
      return;
    }
    const code = exportToTypeScript(songs);
    setExportCode(code);
  };

  const handleExportJSON = () => {
    if (songs.length === 0) {
      alert('Nejsou žádné písně k exportu');
      return;
    }
    downloadJSON(songs);
  };

  const handleCopyTypeScript = () => {
    if (exportCode) {
      navigator.clipboard.writeText(exportCode);
      alert('Kód zkopírován do schránky');
    }
  };

  return (
    <div className="import-export">
      <h3>Import / Export</h3>

      <div className="import-section">
        <h4>Import</h4>
        <div className="import-buttons">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="import-btn"
          >
            📥 Načíst z TypeScript souboru
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".ts,.tsx"
            onChange={handleTypeScriptFileSelect}
            style={{ display: 'none' }}
          />

          <button
            type="button"
            onClick={() => setShowTypeScriptInput(!showTypeScriptInput)}
            className="import-btn"
          >
            📋 Vložit TypeScript kód
          </button>

          <button
            type="button"
            onClick={() => jsonFileInputRef.current?.click()}
            className="import-btn"
          >
            📄 Načíst z JSON
          </button>
          <input
            ref={jsonFileInputRef}
            type="file"
            accept=".json"
            onChange={handleJSONFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {showTypeScriptInput && (
          <div className="typescript-input-container">
            <textarea
              value={typescriptCode}
              onChange={(e) => setTypescriptCode(e.target.value)}
              placeholder="Vložte kód z popularSongs.ts..."
              className="typescript-textarea"
              rows={10}
            />
            <div className="typescript-input-actions">
              <button
                type="button"
                onClick={handleTypeScriptCodePaste}
                className="parse-btn"
              >
                Načíst
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTypeScriptInput(false);
                  setTypescriptCode('');
                }}
                className="cancel-btn"
              >
                Zrušit
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="export-section">
        <h4>Export</h4>
        <div className="export-buttons">
          <button
            type="button"
            onClick={handleExportTypeScript}
            className="export-btn"
          >
            📤 Exportovat do TypeScript
          </button>
          <button
            type="button"
            onClick={handleExportJSON}
            className="export-btn"
          >
            💾 Exportovat do JSON
          </button>
        </div>

        {exportCode && (
          <div className="export-code-container">
            <div className="export-code-header">
              <span>Vygenerovaný kód (zkopírujte do popularSongs.ts):</span>
              <button
                type="button"
                onClick={handleCopyTypeScript}
                className="copy-btn"
              >
                📋 Kopírovat
              </button>
            </div>
            <pre className="export-code">
              <code>{exportCode}</code>
            </pre>
            <button
              type="button"
              onClick={() => setExportCode(null)}
              className="close-btn"
            >
              Zavřít
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

