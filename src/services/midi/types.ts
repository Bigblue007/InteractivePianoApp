export interface MIDIMessage {
  command: number;
  channel: number;
  data1: number;
  data2: number;
}

export type MIDIMessageHandler = (message: MIDIMessage) => void;





