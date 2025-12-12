import { Chord, Note } from '@tonaljs/tonal';
import { useNotationStore } from '../../stores/useNotationStore';

export class ChordDetector {
  /**
   * Detekuje název akordu z aktivních MIDI not
   * @param activeNotes Set MIDI čísel (0-127)
   * @returns Název akordu nebo null
   */
  static detectChord(activeNotes: Set<number>): string | null {
    if (activeNotes.size === 0) {
      return null;
    }

    // Konverze MIDI not na pitch classes
    const pitchClasses = Array.from(activeNotes)
      .map((midi) => {
        try {
          const note = Note.fromMidi(midi);
          return Note.pitchClass(note);
        } catch {
          return null;
        }
      })
      .filter((pc): pc is string => pc !== null)
      .sort();

    if (pitchClasses.length === 0) {
      return null;
    }

    // Detekce akordu pomocí Tonal
    const candidates = Chord.detect(pitchClasses);

    if (candidates.length === 0) {
      return null;
    }

    // Získat basový tón (nejnižší MIDI nota)
    const bassMidi = Math.min(...activeNotes);
    let bassPc: string | null = null;
    try {
      const bassNote = Note.fromMidi(bassMidi);
      bassPc = Note.pitchClass(bassNote);
    } catch {
      // Pokud konverze selže, použít první kandidát
    }

    // Vybrat nejlepšího kandidáta - preferovat dur/moll akordy před alterovanými
    // Pokud basový tón není root, zobrazit jako obrat (slash akord)
    let bestCandidate = candidates[0];
    let bestCandidateScore = 0;
    
    // Skóre pro různé typy akordů (vyšší = lepší)
    const getChordScore = (candidate: string): number => {
      const candidateName = candidate.split('/')[0];
      // Preferovat dur/moll akordy (CM, Am) před alterovanými (#5, b5, atd.)
      if (candidateName.match(/^[A-G][#b]?[Mm]$/)) {
        return 10; // Dur nebo moll
      } else if (candidateName.match(/^[A-G][#b]?[Mm]?[#b]?5$/)) {
        return 5; // Kvintakord
      } else if (candidateName.includes('#') || candidateName.includes('b')) {
        return 1; // Alterované akordy
      }
      return 3; // Ostatní
    };
    
    if (candidates.length > 0) {
      // Najít nejlepšího kandidáta podle skóre
      for (const candidate of candidates) {
        const score = getChordScore(candidate);
        if (score > bestCandidateScore) {
          bestCandidate = candidate;
          bestCandidateScore = score;
        }
      }
    }

    // Získat root tón z detekovaného akordu
    // Pokud je to slash akord (např. "GM/B"), vzít část před lomítkem
    const chordNameWithSlash = bestCandidate;
    const chordNameOnly = chordNameWithSlash.split('/')[0];
    let rootPc: string | null = null;
    
    try {
      // Parsovat root tón z názvu akordu (např. "CM" -> "C", "Am" -> "A")
      const chordInfo = Chord.get(chordNameOnly);
      if (chordInfo.tonic) {
        rootPc = Note.pitchClass(chordInfo.tonic);
      } else {
        // Fallback: zkusit extrahovat první znak z názvu akordu
        const match = chordNameOnly.match(/^([A-G][#b]?)/);
        if (match) {
          rootPc = Note.pitchClass(match[1]);
        }
      }
    } catch {
      // Pokud parsování selže, zkusit extrahovat root z názvu
      const match = chordNameOnly.match(/^([A-G][#b]?)/);
      if (match) {
        try {
          rootPc = Note.pitchClass(match[1]);
        } catch {
          rootPc = null;
        }
      }
    }
    
    // Získat normalizační funkci ze store
    const normalizeChord = useNotationStore.getState().normalizeChordName;
    
    // Pokud basový tón je stejný jako root, použít akord bez slash notace
    if (rootPc && bassPc && rootPc === bassPc && chordNameWithSlash.includes('/')) {
      // Basový tón je root, takže nepotřebujeme slash notaci
      return normalizeChord(chordNameOnly);
    }

    // Zohlednění basového tónu pro slash akordy (bassPc už máme z předchozího kódu)
    try {
      // Pokud basový tón není root, vytvořit slash akord (obrat)
      if (rootPc && bassPc && bassPc !== rootPc) {
        const slashChord = `${chordNameOnly}/${bassPc}`;
        return normalizeChord(slashChord);
      }
    } catch {
      // Pokud konverze selže, použít základní detekci
    }

    return normalizeChord(chordNameOnly);
  }


  /**
   * Získá intervaly mezi notami
   */
  static getIntervals(activeNotes: Set<number>): number[] {
    const sorted = Array.from(activeNotes).sort((a, b) => a - b);
    const intervals: number[] = [];

    for (let i = 1; i < sorted.length; i++) {
      intervals.push(sorted[i] - sorted[i - 1]);
    }

    return intervals;
  }
}


