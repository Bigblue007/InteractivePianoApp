export interface SamplePack {
  id: string;
  name: string;
  description: string;
  size: string;
  sizeBytes: number;
  downloadUrl: string;
  version: string;
  checksum?: string;
}

export const OFFICIAL_SAMPLE_PACKS: SamplePack[] = [
  {
    id: 'salamander-piano',
    name: 'Salamander Grand Piano',
    description: 'Vysoce kvalitní 16-velocity Yamaha C5 grand piano sample set (16 velocity layers, release samples).',
    size: '230 MB',
    sizeBytes: 241172480,
    downloadUrl: 'https://github.com/Bigblue007/InteractivePianoApp/releases/download/v1.0.0/salamander-piano.zip', // Placeholder URL
    version: '1.0.0'
  },
  {
    id: 'iowa-piano',
    name: 'Iowa Steinway Piano',
    description: 'Akustické Steinway grand piano z University of Iowa Electronic Music Studios.',
    size: '120 MB',
    sizeBytes: 125829120,
    downloadUrl: 'https://github.com/Bigblue007/InteractivePianoApp/releases/download/v1.0.0/iowa-piano.zip', // Placeholder URL
    version: '1.0.0'
  },
  {
    id: 'rhodes-epiano',
    name: 'Rhodes Stage Mark I',
    description: 'Klasické elektrické piano Rhodes Stage Mark I s teplým analogovým tónem.',
    size: '80 MB',
    sizeBytes: 83886080,
    downloadUrl: 'https://github.com/Bigblue007/InteractivePianoApp/releases/download/v1.0.0/rhodes-epiano.zip', // Placeholder URL
    version: '1.0.0'
  }
];

export function getSamplePack(id: string): SamplePack | undefined {
  return OFFICIAL_SAMPLE_PACKS.find(pack => pack.id === id);
}
