export type MIDINote = number; // 0-127

export interface ActiveNote {
  midi: MIDINote;
  velocity: number;
  startTime: number;
}

export interface SoundFontInfo {
  id: string;
  name: string;
  url: string;
  loaded: boolean;
}





