import { useEffect } from 'react';
import { useAudioStore } from '../../stores/useAudioStore';
import { getAudioEngine } from '../AudioInitButton/AudioInitButton';
import './InstrumentSelector.css';

export function InstrumentSelector() {
  const soundfonts = useAudioStore((state) => state.soundfonts);
  const selectedSoundFontId = useAudioStore((state) => state.selectedSoundFontId);
  const selectSoundFont = useAudioStore((state) => state.selectSoundFont);
  const addSoundFont = useAudioStore((state) => state.addSoundFont);
  const markSoundFontLoaded = useAudioStore((state) => state.markSoundFontLoaded);
  const audioInitialized = useAudioStore((state) => state.initialized);

  // Přidat výchozí nástroje při mount
  useEffect(() => {
    // Zkontrolovat, zda už existuje piano (synthetic)
    const pianoExists = soundfonts.some((sf) => sf.id === 'piano');
    if (!pianoExists) {
      addSoundFont({
        id: 'piano',
        name: 'Piano',
        url: 'synthetic:piano',
        loaded: false,
      });
    }
    
    // Zkontrolovat, zda už existuje piano-acoustic (sampler)
    const pianoAcousticExists = soundfonts.some((sf) => sf.id === 'piano-acoustic');
    if (!pianoAcousticExists) {
      addSoundFont({
        id: 'piano-acoustic',
        name: 'Piano (Acoustic)',
        url: 'preset:piano-acoustic',
        loaded: false,
      });
    }
    
    // Zkontrolovat, zda už existuje DX7
    const dx7Exists = soundfonts.some((sf) => sf.id === 'dx7');
    if (!dx7Exists) {
      addSoundFont({
        id: 'dx7',
        name: 'DX7 Modern',
        url: 'synthetic:dx7',
        loaded: false,
      });
    }
  }, [soundfonts, addSoundFont]);

  // Načíst nástroj při změně výběru nebo inicializaci
  useEffect(() => {
    if (!audioInitialized || !selectedSoundFontId) return;

    const audioEngine = getAudioEngine();
    if (!audioEngine) return;

    const selectedSoundFont = soundfonts.find((sf) => sf.id === selectedSoundFontId);
    if (selectedSoundFont && !selectedSoundFont.loaded) {
      // Označit všechny ostatní nástroje jako nenačtené
      soundfonts.forEach((sf) => {
        if (sf.id !== selectedSoundFontId && sf.loaded) {
          markSoundFontLoaded(sf.id, false);
        }
      });
      
      audioEngine.loadSoundFont(selectedSoundFont.url)
        .then(() => {
          markSoundFontLoaded(selectedSoundFont.id, true);
        })
        .catch((error) => {
          console.error('Chyba při načítání nástroje:', error);
        });
    }
  }, [selectedSoundFontId, audioInitialized, soundfonts, markSoundFontLoaded]);

  const handleSelect = async (id: string) => {
    // Označit předchozí nástroj jako nenačtený
    if (selectedSoundFontId) {
      markSoundFontLoaded(selectedSoundFontId, false);
    }
    
    selectSoundFont(id);
    
    // Pokud je audio inicializováno, načíst nástroj okamžitě
    if (audioInitialized) {
      const audioEngine = getAudioEngine();
      const selectedSoundFont = soundfonts.find((sf) => sf.id === id);
      if (audioEngine && selectedSoundFont) {
        try {
          await audioEngine.loadSoundFont(selectedSoundFont.url);
          markSoundFontLoaded(id, true);
        } catch (error) {
          console.error('Chyba při načítání nástroje:', error);
        }
      }
    }
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
            {sf.name} {sf.id === selectedSoundFontId && sf.loaded ? '✓' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}


