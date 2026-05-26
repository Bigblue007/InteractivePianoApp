/**
 * Správce audio přehrávání (AudioManager).
 * V nové architektuře je tato komponenta prázdná, protože spouštění a zastavování tónů
 * a ovládání sustain pedálu je řešeno přímo (synchronně) přes akce Zustand storu `usePianoStore`.
 * 
 * Ponecháno pro zpětnou kompatibilitu importů v App.tsx.
 */
export function AudioManager() {
  return null;
}
