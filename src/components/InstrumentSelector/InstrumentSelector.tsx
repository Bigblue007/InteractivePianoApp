import { useEffect } from 'react';
import { useAudioStore } from '../../stores/useAudioStore';
import './InstrumentSelector.css';

export function InstrumentSelector() {
  const soundfonts = useAudioStore((state) => state.soundfonts);
  const selectedSoundFontId = useAudioStore((state) => state.selectedSoundFontId);
  const selectSoundFont = useAudioStore((state) => state.selectSoundFont);
  const addSoundFont = useAudioStore((state) => state.addSoundFont);

  // Přidat výchozí soundfont při mount
  useEffect(() => {
    // Zkontrolovat, zda už existuje soundfont s ID 'piano'
    const pianoExists = soundfonts.some((sf) => sf.id === 'piano');
    if (!pianoExists) {
      addSoundFont({
        id: 'piano',
        name: 'Piano',
        url: '/soundfonts/Piano.SF2',
        loaded: false,
      });
    }
  }, [soundfonts, addSoundFont]);

  const handleSelect = (id: string) => {
    selectSoundFont(id);
  };

  if (soundfonts.length === 0) {
    return null;
  }

  return (
    <div className="instrument-selector">
      <label htmlFor="instrument-select">Nástroj:</label>
      <select
        id="instrument-select"
        value={selectedSoundFontId || soundfonts[0]?.id || ''}
        onChange={(e) => handleSelect(e.target.value)}
      >
        {soundfonts.map((sf) => (
          <option key={sf.id} value={sf.id}>
            {sf.name} {sf.loaded ? '✓' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}


