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
  const setLoadingSoundFont = useAudioStore((state) => state.setLoadingSoundFont);
  const loadingSoundFontId = useAudioStore((state) => state.loadingSoundFontId);
  const audioInitialized = useAudioStore((state) => state.initialized);

  // Přidat výchozí nástroje při mount
  // POŘADÍ: Syntetické nástroje nahoře, akustické piano dole
  useEffect(() => {
    // Zkontrolovat, zda už existuje DX7 (synthetic) - přidat jako první
    const dx7Exists = soundfonts.some((sf) => sf.id === 'dx7');
    if (!dx7Exists) {
      addSoundFont({
        id: 'dx7',
        name: 'DX7 Modern (synth)',
        url: 'synthetic:dx7',
        loaded: false,
      });
    }
    
    // Zkontrolovat, zda už existuje piano (synthetic) - přidat jako druhý
    const pianoExists = soundfonts.some((sf) => sf.id === 'piano');
    if (!pianoExists) {
      addSoundFont({
        id: 'piano',
        name: 'Piano (synth)',
        url: 'synthetic:piano',
        loaded: false,
      });
    }
    
    // Zkontrolovat, zda už existuje piano-acoustic (sampler) - přidat jako poslední
    const pianoAcousticExists = soundfonts.some((sf) => sf.id === 'piano-acoustic');
    if (!pianoAcousticExists) {
      addSoundFont({
        id: 'piano-acoustic',
        name: 'Piano (Acoustic)',
        url: 'preset:piano-acoustic',
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
      
      // Nastavit loading state pro sampler nástroje (akustické piano)
      if (selectedSoundFont.url.startsWith('preset:')) {
        setLoadingSoundFont(selectedSoundFont.id);
      }
      
      audioEngine.loadSoundFont(selectedSoundFont.url)
        .then(() => {
          markSoundFontLoaded(selectedSoundFont.id, true);
          setLoadingSoundFont(null);
        })
        .catch((error) => {
          console.error('Chyba při načítání nástroje:', error);
          setLoadingSoundFont(null);
        });
    }
  }, [selectedSoundFontId, audioInitialized, soundfonts, markSoundFontLoaded, setLoadingSoundFont]);

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
        // Nastavit loading state pro sampler nástroje (akustické piano)
        if (selectedSoundFont.url.startsWith('preset:')) {
          setLoadingSoundFont(id);
        }
        
        try {
          await audioEngine.loadSoundFont(selectedSoundFont.url);
          markSoundFontLoaded(id, true);
          setLoadingSoundFont(null);
        } catch (error) {
          console.error('Chyba při načítání nástroje:', error);
          setLoadingSoundFont(null);
        }
      }
    }
  };

  if (soundfonts.length === 0) {
    return null;
  }

  // Seřadit nástroje: syntetické nahoře, akustické piano dole
  // Definovat explicitní pořadí pro garantované řazení
  const instrumentOrder: Record<string, number> = {
    'dx7': 1,           // Syntetické nástroje nahoře
    'piano': 2,
    'piano-acoustic': 10, // Akustické piano dole
  };
  
  const sortedSoundfonts = [...soundfonts].sort((a, b) => {
    const orderA = instrumentOrder[a.id] ?? 5; // Neznámé nástroje uprostřed
    const orderB = instrumentOrder[b.id] ?? 5;
    return orderA - orderB;
  });

  const isLoading = loadingSoundFontId !== null;
  const selectedSoundFont = soundfonts.find((sf) => sf.id === selectedSoundFontId);

  return (
    <div className="instrument-selector">
      <label htmlFor="instrument-select">Nástroj:</label>
      <div className="instrument-selector-wrapper">
        <select
          id="instrument-select"
          value={selectedSoundFontId || sortedSoundfonts[0]?.id || ''}
          onChange={(e) => handleSelect(e.target.value)}
          disabled={isLoading}
        >
          {sortedSoundfonts.map((sf) => (
            <option key={sf.id} value={sf.id}>
              {sf.name} {sf.id === selectedSoundFontId && sf.loaded ? '✓' : ''}
            </option>
          ))}
        </select>
        {isLoading && selectedSoundFont && (
          <div className="sample-loading-indicator">
            <div className="loading-spinner"></div>
            <span className="loading-text">Načítání samplů...</span>
          </div>
        )}
      </div>
    </div>
  );
}


