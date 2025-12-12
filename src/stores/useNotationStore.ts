import { create } from 'zustand';

export type NotationStandard = 'jazz' | 'classical';

interface NotationState {
  standard: NotationStandard;
  setStandard: (standard: NotationStandard) => void;
  
  // Funkce pro normalizaci názvu akordu podle standardu
  normalizeChordName: (chordName: string) => string;
}

export const useNotationStore = create<NotationState>((set, get) => ({
  standard: 'jazz', // Výchozí jazz standard (C místo CM)
  
  setStandard: (standard) => set({ standard }),
  
  normalizeChordName: (chordName: string) => {
    const { standard } = get();
    
    if (standard === 'jazz') {
      // Jazz standard: odstranit "M" pro dur akordy (CMadd9 -> Cadd9, CM7 -> C7, CMmaj7 -> Cmaj7)
      // Ale zachovat "m" pro moll (Am -> Am)
      
      if (chordName.includes('/')) {
        // Pro slash akordy normalizovat každou část zvlášť
        const parts = chordName.split('/');
        const normalizedParts = parts.map(part => {
          // Odstranit "M" pokud není součástí "m" (moll)
          // Regex: najít [A-G][#b]?M a nahradit za [A-G][#b]? (pokud není následováno "m")
          // Poznámka: "maj" je samostatné slovo, takže CMmaj7 -> Cmaj7 je správně
          return part.replace(/([A-G][#b]?)M(?!m)/g, '$1');
        });
        return normalizedParts.join('/');
      } else {
        // Pro běžné akordy - odstranit "M" pokud není součástí "m" (moll)
        // Poznámka: "maj" je samostatné slovo, takže CMmaj7 -> Cmaj7 je správně
        return chordName.replace(/([A-G][#b]?)M(?!m)/g, '$1');
      }
    } else {
      // Classical standard: zachovat "M" pro dur akordy
      return chordName;
    }
  },
}));

