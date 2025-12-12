import { useEffect, useState } from 'react';
import { useMIDIStore } from '../../stores/useMIDIStore';
import { usePianoStore } from '../../stores/usePianoStore';
import { MIDIManager } from '../../services/midi/MIDIManager';
import './MIDIConnector.css';

export function MIDIConnector() {
  const available = useMIDIStore((state) => state.available);
  const inputs = useMIDIStore((state) => state.inputs);
  const selectedInputId = useMIDIStore((state) => state.selectedInputId);
  const setAvailable = useMIDIStore((state) => state.setAvailable);
  const setInputs = useMIDIStore((state) => state.setInputs);
  const selectInput = useMIDIStore((state) => state.selectInput);
  const setAccess = useMIDIStore((state) => state.setAccess);

  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [midiManager] = useState(() => new MIDIManager());

  useEffect(() => {
    // Zkontrolovat dostupnost
    const isAvailable = MIDIManager.isAvailable();
    setAvailable(isAvailable);

    if (!isAvailable) {
      const browserInfo = MIDIManager.getBrowserInfo();
      setError(
        `Web MIDI API není podporováno v ${browserInfo.name}. ${browserInfo.message || 'Doporučujeme použít Chrome nebo Edge.'}`
      );
    } else if (!MIDIManager.isSecureContext()) {
      setError('Web MIDI API vyžaduje HTTPS nebo localhost. V produkci musí být aplikace na HTTPS.');
    }

    return () => {
      midiManager.close();
    };
  }, [setAvailable, midiManager]);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);

    try {
      const access = await midiManager.requestAccess();
      setAccess(access);

      // Aktualizovat seznam vstupů
      const midiInputs = midiManager.getInputs();
      const inputsList = midiInputs.map((input) => ({
        id: input.id,
        name: input.name || 'Neznámé zařízení',
        manufacturer: input.manufacturer,
        state: input.state as 'connected' | 'disconnected',
      }));
      
      setInputs(inputsList);

      // Nastavit handler pro MIDI zprávy (před výběrem vstupu)
      midiManager.onMessage((message) => {
        const pianoStore = usePianoStore.getState();

        // Note On
        if (message.command === 0x90 && message.data2 > 0) {
          pianoStore.noteOn(message.data1);
        }
        // Note Off
        else if (message.command === 0x80 || (message.command === 0x90 && message.data2 === 0)) {
          pianoStore.noteOff(message.data1);
        }
        // Control Change - Sustain pedál (CC64)
        else if (message.command === 0xb0 && message.data1 === 64) {
          pianoStore.setSustain(message.data2 >= 64);
        }
      });

      // Automaticky vybrat první vstup, pokud je jen jeden
      if (inputsList.length === 1) {
        const firstInputId = inputsList[0].id;
        selectInput(firstInputId);
        midiManager.selectInput(firstInputId);
      } else if (selectedInputId) {
        // Pokud už je vybrán vstup, znovu ho připojit (aby se handler správně připojil)
        midiManager.selectInput(selectedInputId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se připojit k MIDI');
    } finally {
      setConnecting(false);
    }
  };

  const handleSelectInput = (inputId: string) => {
    if (!inputId) {
      // Pokud je vybráno prázdné, odpojit všechny vstupy
      selectInput(null);
      // Odpojit všechny vstupy v manageru
      if (midiManager) {
        const allInputs = midiManager.getInputs();
        for (const input of allInputs) {
          input.onmidimessage = null;
        }
      }
      return;
    }
    
    selectInput(inputId);
    midiManager.selectInput(inputId);
  };

  const browserInfo = MIDIManager.getBrowserInfo();
  const isSecure = MIDIManager.isSecureContext();

  if (!available) {
    return (
      <div className="midi-connector">
        <p className="error">
          Web MIDI API není podporováno v {browserInfo.name}.<br />
          {browserInfo.message || 'Doporučujeme použít Chrome nebo Edge pro plnou podporu.'}
        </p>
      </div>
    );
  }

  return (
    <div className="midi-connector">
      {inputs.length === 0 ? (
        <>
          <button onClick={handleConnect} disabled={connecting}>
            {connecting ? 'Připojování...' : 'Připojit MIDI zařízení'}
          </button>
          {!isSecure && (
            <p className="info">
              ⚠️ Web MIDI API vyžaduje HTTPS nebo localhost. V produkci musí být aplikace na HTTPS.
            </p>
          )}
          {browserInfo.name === 'Firefox' && (
            <p className="info">
              ⚠️ Firefox má omezenou podporu Web MIDI API. Pro nejlepší kompatibilitu použijte Chrome nebo Edge.
            </p>
          )}
        </>
      ) : (
        <div>
          <label htmlFor="midi-input-select">MIDI vstup:</label>
          <select
            id="midi-input-select"
            value={selectedInputId || ''}
            onChange={(e) => handleSelectInput(e.target.value)}
          >
            <option value="">— Vyberte zařízení —</option>
            {inputs.map((input) => (
              <option key={input.id} value={input.id}>
                {input.name} ({input.state})
              </option>
            ))}
          </select>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}


