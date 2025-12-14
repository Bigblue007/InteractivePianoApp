import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow';

export class ScoreRenderer {
  private renderer: Renderer | null = null;
  private container: HTMLElement | null = null;

  /**
   * Inicializuje renderer
   */
  init(containerId: string): void {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container s ID "${containerId}" nebyl nalezen`);
    }

    // Vyčistit container
    container.innerHTML = '';

    this.container = container;
    this.renderer = new Renderer(container as HTMLDivElement, Renderer.Backends.SVG);
    // Výška bude upravena podle počtu klíčů v renderNotes
    this.renderer.resize(700, 300);
  }

  /**
   * Vykreslí noty
   */
  renderNotes(midiNotes: number[]): void {
    if (!this.renderer || !this.container) {
      console.warn('Renderer není inicializován');
      return;
    }

    try {
      const ctx = this.renderer.getContext();
      ctx.clear();

      if (midiNotes.length === 0) {
        return;
      }

      console.log('Vykreslování not:', midiNotes);

      // Rozdělit noty na houslový a basový klíč (C4 = 60 je hranice)
      const trebleNotes = midiNotes.filter((n) => n >= 60).sort((a, b) => a - b);
      const bassNotes = midiNotes.filter((n) => n < 60).sort((a, b) => a - b);

      // Pokud jsou oba klíče, basový klíč nahoře, houslový dole
      // Pokud je jen jeden klíč, použít střední pozici
      let trebleYPosition = 40;
      let bassYPosition = 40;
      
      if (trebleNotes.length > 0 && bassNotes.length > 0) {
        // Oba klíče - basový nahoře, houslový dole
        bassYPosition = 40;
        trebleYPosition = 160;
      } else if (trebleNotes.length > 0) {
        // Jen houslový klíč
        trebleYPosition = 40;
      } else if (bassNotes.length > 0) {
        // Jen basový klíč
        bassYPosition = 40;
      }

      // Houslový klíč
      if (trebleNotes.length > 0) {
        const staveTreble = new Stave(10, trebleYPosition, 650);
        staveTreble.addClef('treble');
        staveTreble.addTimeSignature('4/4');
        staveTreble.setContext(ctx).draw();

        const notesResult = this.midiToVexNotes(trebleNotes, 'treble');
        if (notesResult.notes.length > 0) {
          try {
            const voice = new Voice({ num_beats: 4, beat_value: 4 });
            voice.addTickables(notesResult.notes);
            const formatter = new Formatter();
            formatter.joinVoices([voice]);
            formatter.format([voice], 600);
            voice.draw(ctx, staveTreble);
            
            // Přidat oktávové značky (8va) pro vysoké noty
            if (notesResult.needsOttavaAlta) {
              try {
                // Přidat text "8va" nad osnovou
                ctx.setFont('Arial', 12, 'normal');
                ctx.fillText('8va', 15, trebleYPosition - 10);
                // Přidat čárkovanou čáru
                ctx.setStrokeStyle('#000');
                ctx.setLineWidth(1);
                ctx.beginPath();
                ctx.moveTo(15, trebleYPosition - 5);
                ctx.lineTo(600, trebleYPosition - 5);
                ctx.setLineDash([5, 5]);
                ctx.stroke();
                ctx.setLineDash([]);
              } catch (error) {
                console.error('Chyba při přidávání 8va:', error);
              }
            }
          } catch (error) {
            console.error('Chyba při vykreslování houslového klíče:', error);
          }
        }
      }

      // Basový klíč
      if (bassNotes.length > 0) {
        const staveBass = new Stave(10, bassYPosition, 650);
        staveBass.addClef('bass');
        staveBass.addTimeSignature('4/4');
        staveBass.setContext(ctx).draw();

        const notesResult = this.midiToVexNotes(bassNotes, 'bass');
        if (notesResult.notes.length > 0) {
          try {
            const voice = new Voice({ num_beats: 4, beat_value: 4 });
            voice.addTickables(notesResult.notes);
            const formatter = new Formatter();
            formatter.joinVoices([voice]);
            formatter.format([voice], 600);
            voice.draw(ctx, staveBass);
            
            // Přidat oktávové značky (8vb) pro nízké noty
            if (notesResult.needsOttavaBassa) {
              try {
                // Přidat text "8vb" pod osnovou
                ctx.setFont('Arial', 12, 'normal');
                ctx.fillText('8vb', 15, bassYPosition + 100);
                // Přidat čárkovanou čáru
                ctx.setStrokeStyle('#000');
                ctx.setLineWidth(1);
                ctx.beginPath();
                ctx.moveTo(15, bassYPosition + 95);
                ctx.lineTo(600, bassYPosition + 95);
                ctx.setLineDash([5, 5]);
                ctx.stroke();
                ctx.setLineDash([]);
              } catch (error) {
                console.error('Chyba při přidávání 8vb:', error);
              }
            }
          } catch (error) {
            console.error('Chyba při vykreslování basového klíče:', error);
          }
        }
      }
    } catch (error) {
      console.error('Chyba při vykreslování not:', error);
    }
  }

  /**
   * Konvertuje MIDI noty na VexFlow noty
   * 
   * Používá přímé mapování pro basový klíč, protože výpočetní přístup nefunguje správně.
   * 
   * Referenční body:
   * - Houslový klíč: G4 (MIDI 67) na druhé lince = "g/4"
   * - Basový klíč: F3 (MIDI 53) na čtvrté lince = "f/3"
   * 
   * @param midiNotes Pole MIDI not
   * @param clef Typ klíče ('treble' nebo 'bass')
   * @returns Objekt s notami a informací o potřebě oktávových značek
   */
  private midiToVexNotes(
    midiNotes: number[], 
    clef: 'treble' | 'bass' = 'treble'
  ): { notes: StaveNote[]; needsOttavaAlta: boolean; needsOttavaBassa: boolean } {
    // Mapování MIDI note (0-11) na základní notu bez křížku
    const baseNoteMap: Record<number, string> = {
      0: 'c', 1: 'c', 2: 'd', 3: 'd', 4: 'e', 5: 'f',
      6: 'f', 7: 'g', 8: 'g', 9: 'a', 10: 'a', 11: 'b',
    };

    // Přímé mapování MIDI → VexFlow pro basový klíč
    // VexFlow pro basový klíč potřebuje noty o 1 oktávu níž než standardní výpočet
    // C3 (MIDI 48) by mělo být mezi 2. a 3. linkou = "c/3" ✓
    // B2 (MIDI 47) by mělo být o oktávu níž = "b/2" (ne "b/3")
    // F3 (MIDI 53) by mělo být na 4. lince = "f/3"
    // C2 (MIDI 36) by mělo být mezi 2. a 3. linkou = "c/3" (ne "c/2")
    const bassClefMap: Record<number, string> = {
      // Velmi nízké noty (s 8vb značkou)
      21: 'a/1', 22: 'a/1', 23: 'b/1',
      24: 'c/2', 25: 'c/2', 26: 'd/2', 27: 'd/2', 28: 'e/2', 29: 'f/2',
      30: 'f/2', 31: 'g/2', 32: 'g/2', 33: 'a/2', 34: 'a/2', 35: 'b/2',
      // Normální rozsah basového klíče
      // Noty pod B2 (MIDI < 47) mají oktávu o 1 nižší
      // B2 (MIDI 47) a výš používají standardní oktávu
      36: 'c/2', 37: 'c/2', 38: 'd/2', 39: 'd/2', 40: 'e/2', 41: 'f/2',
      42: 'f/2', 43: 'g/2', 44: 'g/2', 45: 'a/2', 46: 'a/2', 47: 'b/2', // B2 (MIDI 47) = "b/2" ✓
      48: 'c/3', 49: 'c/3', 50: 'd/3', 51: 'd/3', 52: 'e/3', 53: 'f/3', // C3 (MIDI 48) a výš = standardní oktáva
      54: 'f/3', 55: 'g/3', 56: 'g/3', 57: 'a/3', 58: 'a/3', 59: 'b/3',
    };

    const notes: string[] = [];
    const accidentals: number[] = [];
    let needsOttavaAlta = false;
    let needsOttavaBassa = false;

    for (let i = 0; i < midiNotes.length; i++) {
      const midi = midiNotes[i];
      const note = midi % 12;
      const baseNote = baseNoteMap[note];

      if (!baseNote) continue;

      let vexNote: string;

      if (clef === 'treble') {
        // HOUSLOVÝ KLÍČ - použít standardní výpočet
        // Referenční nota: G4 (MIDI 67) na druhé lince = "g/4"
        // C4 (MIDI 60) = "c/4" je na první pomocné lince pod osnovou
        let octave = Math.floor(midi / 12) - 1;
        
        // Pro velmi vysoké noty (nad C6 = MIDI 96) použít 8va značku
        if (midi >= 96) {
          octave -= 1; // Zobrazit o oktávu níž
          needsOttavaAlta = true;
        }
        
        vexNote = `${baseNote}/${octave}`;
      } else {
        // BASOVÝ KLÍČ - použít přímé mapování
        // Pokud nota není v mapě, použít fallback výpočet
        if (midi in bassClefMap) {
          vexNote = bassClefMap[midi];
          
          // Zkontrolovat, zda potřebujeme 8vb značku (pro noty pod C2)
          if (midi < 36) {
            needsOttavaBassa = true;
          }
        } else {
          // Fallback: použít standardní výpočet
          let octave = Math.floor(midi / 12) - 1;
          vexNote = `${baseNote}/${octave}`;
          console.warn(`MIDI ${midi} není v bassClefMap, použit fallback: ${vexNote}`);
        }
      }

      notes.push(vexNote);

      // Zaznamenat noty, které potřebují křížek (C#, D#, F#, G#, A#)
      if ([1, 3, 6, 8, 10].includes(note)) {
        accidentals.push(i);
      }
    }

    if (notes.length === 0) {
      return { notes: [], needsOttavaAlta: false, needsOttavaBassa: false };
    }

    try {
      console.log('Konverze MIDI not na VexFlow:', midiNotes, '->', notes, 'accidentals:', accidentals);
      
      // VexFlow vyžaduje, aby součet délek not odpovídal num_beats (4 pro 4/4 takt)
      // Použijeme celou notu (w = whole note = 4 beatů) pro akord nebo jednotlivou notu
      // Explicitně specifikovat klíč pro správné zobrazení not
      const staveNote = new StaveNote({ 
        keys: notes, 
        duration: 'w', // Celá nota = 4 beatů, což odpovídá 4/4 taktu
        clef: clef // Explicitně specifikovat klíč
      });
      
      // Přidat křížky k notám, které je potřebují
      for (const index of accidentals) {
        staveNote.addModifier(new Accidental('#'), index);
      }
      
      console.log('StaveNote vytvořen:', staveNote, 'needsOttavaAlta:', needsOttavaAlta, 'needsOttavaBassa:', needsOttavaBassa);
      return { notes: [staveNote], needsOttavaAlta, needsOttavaBassa };
    } catch (error) {
      console.error('Chyba při vytváření StaveNote:', error, 'notes:', notes);
      return { notes: [], needsOttavaAlta: false, needsOttavaBassa: false };
    }
  }

  /**
   * Vyčistí renderer
   */
  clear(): void {
    if (this.renderer) {
      const ctx = this.renderer.getContext();
      ctx.clear();
    }
  }
}

