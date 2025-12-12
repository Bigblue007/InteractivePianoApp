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
   * @param midiNotes Pole MIDI not
   * @param clef Typ klíče ('treble' nebo 'bass')
   * @returns Objekt s notami a informací o potřebě oktávových značek
   */
  private midiToVexNotes(
    midiNotes: number[], 
    clef: 'treble' | 'bass' = 'treble'
  ): { notes: StaveNote[]; needsOttavaAlta: boolean; needsOttavaBassa: boolean } {
    // Mapování MIDI not na základní noty (bez křížků v názvu)
    const baseNoteMap: Record<number, string> = {
      0: 'c',   // C
      1: 'c',   // C# (bude mít accidental)
      2: 'd',   // D
      3: 'd',   // D# (bude mít accidental)
      4: 'e',   // E
      5: 'f',   // F
      6: 'f',   // F# (bude mít accidental)
      7: 'g',   // G
      8: 'g',   // G# (bude mít accidental)
      9: 'a',   // A
      10: 'a',  // A# (bude mít accidental)
      11: 'b',  // B
    };

    const notes: string[] = [];
    const accidentals: number[] = []; // Indexy not, které potřebují křížek
    let needsOttavaAlta = false; // Pro vysoké noty (8va)
    let needsOttavaBassa = false; // Pro nízké noty (8vb)
    
    // Hranice pro oktávové značky:
    // Houslový klíč: nad C6 (96) nebo noty s více než 3 pomocnými linkami = 8va (zobrazit o oktávu níž)
    // Basový klíč: pod C2 (36) nebo noty s více než 3 pomocnými linkami = 8vb (zobrazit o oktávu výš)
    // Pro zjednodušení použijeme: houslový klíč nad C6 (96), basový klíč pod C2 (36)
    const ottavaAltaThreshold = clef === 'treble' ? 96 : 999; // C6 pro houslový klíč
    const ottavaBassaThreshold = clef === 'bass' ? 36 : 0; // C2 pro basový klíč
    
    for (let i = 0; i < midiNotes.length; i++) {
      const midi = midiNotes[i];
      let octave = Math.floor(midi / 12) - 1;
      const note = midi % 12;
      const baseNote = baseNoteMap[note];
      
      if (baseNote) {
        // Zkontrolovat, zda potřebujeme oktávovou značku
        if (midi >= ottavaAltaThreshold) {
          // Vysoká nota - zobrazit o oktávu níž
          octave -= 1;
          needsOttavaAlta = true;
        } else if (midi <= ottavaBassaThreshold) {
          // Nízká nota - zobrazit o oktávu výš
          octave += 1;
          needsOttavaBassa = true;
        }
        
        // VexFlow formát: "c/4" (bez křížku v názvu)
        const vexNote = `${baseNote}/${octave}`;
        notes.push(vexNote);
        
        // Zaznamenat, které noty potřebují křížek
        // Křížky jsou na pozicích: 1 (C#), 3 (D#), 6 (F#), 8 (G#), 10 (A#)
        if ([1, 3, 6, 8, 10].includes(note)) {
          accidentals.push(i);
        }
      }
    }

    if (notes.length === 0) {
      return { notes: [], needsOttavaAlta: false, needsOttavaBassa: false };
    }

    try {
      console.log('Konverze MIDI not na VexFlow:', midiNotes, '->', notes, 'accidentals:', accidentals);
      
      // VexFlow vyžaduje, aby součet délek not odpovídal num_beats (4 pro 4/4 takt)
      // Použijeme celou notu (w = whole note = 4 beatů) pro akord nebo jednotlivou notu
      const staveNote = new StaveNote({ 
        keys: notes, 
        duration: 'w' // Celá nota = 4 beatů, což odpovídá 4/4 taktu
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

