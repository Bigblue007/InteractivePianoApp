export interface SoundFontEngine {
  loadSoundFont(url: string): Promise<void>;
  noteOn(midi: number, velocity: number): void;
  noteOff(midi: number): void;
  setSustain(sustain: boolean): void;
  dispose(): void;
}

export interface AudioVoice {
  midi: number;
  gainNode: GainNode;
  sourceNode: AudioBufferSourceNode | null;
}





