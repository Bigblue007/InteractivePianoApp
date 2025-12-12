import { MIDIMessage, MIDIMessageHandler } from './types';

export class MIDIManager {
  private access: MIDIAccess | null = null;
  private handlers: Set<MIDIMessageHandler> = new Set();

  /**
   * Zkontroluje dostupnost Web MIDI API
   */
  static isAvailable(): boolean {
    return 'requestMIDIAccess' in navigator;
  }

  /**
   * Zkontroluje, zda je prohlížeč podporován
   */
  static getBrowserInfo(): { name: string; supported: boolean; message?: string } {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome') || userAgent.includes('edge') || userAgent.includes('chromium')) {
      return { name: 'Chrome/Edge', supported: true };
    }
    
    if (userAgent.includes('firefox')) {
      return { 
        name: 'Firefox', 
        supported: false,
        message: 'Firefox má omezenou podporu Web MIDI API a vyžaduje add-on. Doporučujeme použít Chrome nebo Edge.'
      };
    }
    
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return { 
        name: 'Safari', 
        supported: 'requestMIDIAccess' in navigator,
        message: 'Safari má částečnou podporu Web MIDI API. Ověřte, že používáte nejnovější verzi.'
      };
    }
    
    return { 
      name: 'Neznámý', 
      supported: 'requestMIDIAccess' in navigator 
    };
  }

  /**
   * Zkontroluje, zda je připojení přes HTTPS nebo localhost
   */
  static isSecureContext(): boolean {
    return window.isSecureContext || 
           location.protocol === 'https:' || 
           location.hostname === 'localhost' || 
           location.hostname === '127.0.0.1';
  }

  /**
   * Požádá o přístup k MIDI zařízením
   */
  async requestAccess(): Promise<MIDIAccess> {
    if (!MIDIManager.isAvailable()) {
      const browserInfo = MIDIManager.getBrowserInfo();
      throw new Error(
        `Web MIDI API není podporováno v tomto prohlížeči (${browserInfo.name}). ${browserInfo.message || 'Doporučujeme použít Chrome nebo Edge.'}`
      );
    }

    // Zkontrolovat secure context
    if (!MIDIManager.isSecureContext()) {
      throw new Error(
        'Web MIDI API vyžaduje HTTPS nebo localhost. V produkci musí být aplikace na HTTPS.'
      );
    }

    try {
      this.access = await navigator.requestMIDIAccess({ sysex: false });
      this.setupEventListeners();
      return this.access;
    } catch (error) {
      const browserInfo = MIDIManager.getBrowserInfo();
      let errorMessage = `Nepodařilo se získat přístup k MIDI: ${error}`;
      
      if (error instanceof Error) {
        if (error.name === 'SecurityError' || error.message.includes('permission')) {
          if (browserInfo.name === 'Firefox') {
            errorMessage = 'Firefox vyžaduje add-on pro Web MIDI API. Doporučujeme použít Chrome nebo Edge pro plnou podporu.';
          } else {
            errorMessage = 'Nepodařilo se získat oprávnění k MIDI. Zkontrolujte nastavení prohlížeče a povolte přístup k MIDI zařízením.';
          }
        } else {
          errorMessage = error.message;
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Nastaví event listenery pro MIDI zařízení
   */
  private setupEventListeners(): void {
    if (!this.access) return;

    // NEPŘIPOJUJEME listenery na všechny vstupy automaticky
    // Listenery se připojí až při výběru konkrétního vstupu přes selectInput()
    
    // Sledovat změny stavu zařízení (pro případ, že se zařízení připojí později)
    this.access.onstatechange = (event) => {
      const port = event.port;
      if (port && port.type === 'input' && port.state === 'connected') {
        console.log('Nové MIDI zařízení připojeno:', port.name);
        // Listener se připojí až při výběru vstupu
      }
    };
  }

  /**
   * Připojí listener na MIDI vstup
   */
  private attachInputListener(input: MIDIInput): void {
    console.log('Připojování listeneru na MIDI vstup:', input.name);
    input.onmidimessage = (event: MIDIMessageEvent) => {
      this.handleMIDIMessage(event);
    };
  }

  /**
   * Zpracuje MIDI zprávu
   */
  private handleMIDIMessage(event: MIDIMessageEvent): void {
    if (!event.data) return;
    const [status, data1, data2] = event.data;
    const command = status & 0xf0;
    const channel = status & 0x0f;

    const message: MIDIMessage = {
      command,
      channel,
      data1,
      data2,
    };

    // Debug logování (můžeme později odstranit)
    if (command === 0x90 || command === 0x80) {
      console.log('MIDI zpráva:', {
        command: command.toString(16),
        note: data1,
        velocity: data2,
        channel
      });
    }

    // Zavolat všechny registrované handlery
    this.handlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        console.error('Chyba v MIDI handleru:', error);
      }
    });
  }

  /**
   * Zaregistruje handler pro MIDI zprávy
   */
  onMessage(handler: MIDIMessageHandler): () => void {
    this.handlers.add(handler);
    // Vrátit funkci pro odregistrování
    return () => {
      this.handlers.delete(handler);
    };
  }

  /**
   * Získá seznam dostupných MIDI vstupů
   */
  getInputs(): MIDIInput[] {
    if (!this.access) {
      return [];
    }

    return Array.from(this.access.inputs.values());
  }

  /**
   * Vybere konkrétní MIDI vstup
   */
  selectInput(inputId: string): void {
    if (!this.access) return;

    // Odpojit všechny vstupy
    for (const input of this.access.inputs.values()) {
      input.onmidimessage = null;
    }

    // Připojit vybraný vstup
    const input = this.access.inputs.get(inputId);
    if (input) {
      console.log('Připojování MIDI vstupu:', input.name, inputId);
      this.attachInputListener(input);
    } else {
      console.warn('MIDI vstup nenalezen:', inputId);
    }
  }

  /**
   * Zavře MIDI přístup
   */
  close(): void {
    if (this.access) {
      // Odpojit všechny vstupy
      for (const input of this.access.inputs.values()) {
        input.onmidimessage = null;
      }
      this.handlers.clear();
      this.access = null;
    }
  }
}


