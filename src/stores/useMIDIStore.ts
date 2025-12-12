import { create } from 'zustand';

interface MIDIInput {
  id: string;
  name: string;
  manufacturer?: string;
  state: 'connected' | 'disconnected';
}

interface MIDIState {
  available: boolean;
  inputs: MIDIInput[];
  selectedInputId: string | null;
  access: MIDIAccess | null;

  // Actions
  setAvailable: (available: boolean) => void;
  setInputs: (inputs: MIDIInput[]) => void;
  selectInput: (id: string | null) => void;
  setAccess: (access: MIDIAccess | null) => void;
  updateInputState: (id: string, state: 'connected' | 'disconnected') => void;
}

export const useMIDIStore = create<MIDIState>((set) => ({
  available: false,
  inputs: [],
  selectedInputId: null,
  access: null,

  setAvailable: (available: boolean) => {
    set({ available });
  },

  setInputs: (inputs: MIDIInput[]) => {
    set({ inputs });
  },

  selectInput: (id: string | null) => {
    set({ selectedInputId: id });
  },

  setAccess: (access: MIDIAccess | null) => {
    set({ access });
  },

  updateInputState: (id: string, state: 'connected' | 'disconnected') => {
    set((s) => ({
      inputs: s.inputs.map((input) =>
        input.id === id ? { ...input, state } : input
      ),
    }));
  },
}));





