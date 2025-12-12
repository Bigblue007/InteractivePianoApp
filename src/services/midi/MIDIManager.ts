import { MIDIMessage, MIDIMessageHandler } from './types';

export class MIDIManager {
  private access: MIDIAccess | null = null;
  private handlers: Set<MIDIMessageHandler> = new Set();

  /**
   * Zkontroluje dostupnost Web MIDI API
   */
  static isAvailable(): boolean {
    // Zkontrolovat, zda je API dostupné
    const hasAPI = 'requestMIDIAccess' in navigator;
    
    // Pro Firefox: zkontrolovat, zda je to verze s podporou (108+)
    if (hasAPI) {
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('firefox')) {
        const firefoxVersion = userAgent.match(/firefox\/(\d+)/);
        const version = firefoxVersion ? parseInt(firefoxVersion[1], 10) : 0;
        // Firefox 108+ má nativní podporu
        return version >= 108;
      }
    }
    
    return hasAPI;
  }

  /**
   * Zkontroluje, zda je prohlížeč podporován
   */
  static getBrowserInfo(): { name: string; supported: boolean; message?: string } {
    const userAgent = navigator.userAgent.toLowerCase();
    const hasMIDISupport = 'requestMIDIAccess' in navigator;
    
    if (userAgent.includes('chrome') || userAgent.includes('edge') || userAgent.includes('chromium')) {
      return { name: 'Chrome/Edge', supported: hasMIDISupport };
    }
    
    if (userAgent.includes('firefox')) {
      // Firefox 108+ má nativní podporu Web MIDI API
      const firefoxVersion = userAgent.match(/firefox\/(\d+)/);
      const version = firefoxVersion ? parseInt(firefoxVersion[1], 10) : 0;
      
      if (hasMIDISupport) {
        return { 
          name: 'Firefox', 
          supported: true,
          message: version < 108 ? 'Pro Web MIDI API použijte Firefox 108 nebo novější.' : undefined
        };
      } else {
        return { 
          name: 'Firefox', 
          supported: false,
          message: 'Firefox vyžaduje verzi 108 nebo novější pro podporu Web MIDI API. Doporučujeme použít Chrome nebo Edge.'
        };
      }
    }
    
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return { 
        name: 'Safari', 
        supported: hasMIDISupport,
        message: hasMIDISupport ? 'Safari má částečnou podporu Web MIDI API. Ověřte, že používáte nejnovější verzi.' : 'Safari nemá plnou podporu Web MIDI API. Doporučujeme použít Chrome nebo Edge.'
      };
    }
    
    return { 
      name: 'Neznámý', 
      supported: hasMIDISupport 
    };
  }

  /**
   * Zkontroluje, zda je připojení přes HTTPS nebo localhost
   */
  static isSecureContext(): boolean {
    // Firefox může být přísnější s secure context pro HTTP localhost
    const isSecure = window.isSecureContext || 
           location.protocol === 'https:' || 
           location.hostname === 'localhost' || 
           location.hostname === '127.0.0.1' ||
           location.hostname === '[::1]';
    
    // Debug pro Firefox
    if (typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('firefox')) {
      console.log('Secure context check:', {
        windowIsSecureContext: window.isSecureContext,
        protocol: location.protocol,
        hostname: location.hostname,
        result: isSecure
      });
    }
    
    return isSecure;
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
      // Pro Firefox: zkusit s různými možnostmi
      const userAgent = navigator.userAgent.toLowerCase();
      const isFirefox = userAgent.includes('firefox');
      
      // Debug informace
      if (isFirefox) {
        const firefoxVersion = userAgent.match(/firefox\/(\d+)/);
        const version = firefoxVersion ? parseInt(firefoxVersion[1], 10) : 0;
        console.log(`Firefox verze: ${version}, Secure context: ${MIDIManager.isSecureContext()}, MIDI API dostupné: ${'requestMIDIAccess' in navigator}`);
      }
      
      this.access = await navigator.requestMIDIAccess({ sysex: false });
      this.setupEventListeners();
      return this.access;
    } catch (error) {
      const browserInfo = MIDIManager.getBrowserInfo();
      let errorMessage = `Nepodařilo se získat přístup k MIDI: ${error}`;
      let detailedMessage = '';
      
      if (error instanceof Error) {
        if (error.name === 'SecurityError' || error.message.includes('permission') || error.message.includes('denied')) {
          if (browserInfo.name === 'Firefox') {
            errorMessage = 'Nepodařilo se získat oprávnění k MIDI.';
            detailedMessage = `Pokud jste dříve odmítli přístup, resetujte oprávnění:
1. Klikněte na ikonu zámku vlevo od adresního řádku
2. Najděte "Oprávnění" → "MIDI zařízení" → změňte na "Povolit"
Nebo vymazat data stránky: Nastavení → Soukromí → Cookies a data stránek → Odstranit data pro localhost`;
          } else {
            errorMessage = 'Nepodařilo se získat oprávnění k MIDI. Zkontrolujte nastavení prohlížeče a povolte přístup k MIDI zařízením.';
          }
        } else if (error.name === 'NotSupportedError' || error.name === 'NotAllowedError') {
          if (browserInfo.name === 'Firefox') {
            errorMessage = 'Firefox nepodporuje Web MIDI API nebo je přístup zamítnut.';
            detailedMessage = 'Ujistěte se, že používáte Firefox 108 nebo novější. Pokud ano, zkuste resetovat oprávnění (viz výše).';
          } else {
            errorMessage = error.message;
          }
        } else {
          errorMessage = error.message;
        }
      }
      
      const fullMessage = detailedMessage ? `${errorMessage}\n\n${detailedMessage}` : errorMessage;
      throw new Error(fullMessage);
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


