import { Song } from '../stores/useSongLibraryStore';

export const POPULAR_SONGS: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: "Let It Be",
    artist: "The Beatles",
    chords: ["C", "G", "Am", "F", "C", "G", "F", "C"], // Fallback pro backward compatibility
    sections: [
      {
        type: "verse",
        label: "Verse 1",
        chords: ["C", "G", "Am", "F", "C", "G", "F", "C"]
      },
      {
        type: "chorus",
        chords: ["Am", "G", "F", "C"]
      }
    ]
  },
  {
    title: "Wonderwall",
    artist: "Oasis",
    chords: ["Em", "G", "D", "A", "Em", "G", "D", "A"], // Fallback pro backward compatibility
    sections: [
      {
        type: "verse",
        label: "Verse 1",
        chords: ["Em", "G", "D", "A", "Em", "G", "D", "A", "C"]
      },
      {
        type: "chorus",
        chords: ["C", "D", "Emi"]
      }
    ]
  },
  {
    title: "Hallelujah",
    artist: "Leonard Cohen",
    chords: ["C", "Am", "C", "Am", "F", "G", "C", "G", "Am"], // Fallback pro backward compatibility
    sections: [
      {
        type: "verse",
        label: "Verse 1",
        chords: ["C", "Am", "C", "Am"]
      },
      {
        type: "chorus",
        chords: ["F", "Am", "F", "C", "G", "C", "G"]
      }
    ]
  },
  {
    title: "Stand By Me",
    artist: "Ben E. King",
    chords: ["C", "Am", "F", "G", "C", "Am", "F", "G"], // Fallback pro backward compatibility
    sections: [
      {
        type: "verse",
        label: "Verse 1",
        chords: ["G", "Em", "C", "D", "G"]
      },
      {
        type: "chorus",
        label: "Chorus 1",
        chords: ["G", "Em", "C", "D", "G"]
      }
    ]
  },
  {
    title: "Hey Jude",
    artist: "The Beatles",
    chords: ["C", "F", "C", "F", "C", "G", "F", "C"], // Fallback pro backward compatibility
  },
  {
    title: "Hotel California",
    artist: "Eagles",
    chords: ["Am", "E", "G", "D", "F", "C", "Dm", "E"], // Fallback pro backward compatibility
  },
  {
    title: "Sweet Home Alabama",
    artist: "Lynyrd Skynyrd",
    chords: ["D", "C", "G", "D", "C", "G"], // Fallback pro backward compatibility
  },
  {
    title: "Free Fallin",
    artist: "Tom Petty",
    chords: ["F", "C", "G", "Am", "F", "C", "G"], // Fallback pro backward compatibility
  },
  {
    title: "Knockin",
    artist: "Bob Dylan",
    chords: ["G", "D", "Am", "G", "D", "C"], // Fallback pro backward compatibility
  },
  {
    title: "Country Roads",
    artist: "John Denver",
    chords: ["G", "Em", "C", "D", "G", "Em", "C", "D"], // Fallback pro backward compatibility
  },
  {
    title: "Imagine",
    artist: "John Lennon",
    chords: ["C", "Cmaj7", "F", "C", "F", "C", "Dm", "G"], // Fallback pro backward compatibility
  },
  {
    title: "Horse with No Name",
    artist: "America",
    chords: ["Em", "D6", "Em", "D6", "Em", "D6", "Em"], // Fallback pro backward compatibility
  },
  {
    title: "Wish You Were Here",
    artist: "Pink Floyd",
    chords: ["Am", "C", "D", "F", "Am", "C", "G", "Am"], // Fallback pro backward compatibility
  },
  {
    title: "Stairway to Heaven",
    artist: "Led Zeppelin",
    chords: ["Am", "C", "D", "F", "Am", "C", "D", "F", "G"], // Fallback pro backward compatibility
  },
  {
    title: "Blackbird",
    artist: "The Beatles",
    chords: ["G", "Am", "G", "Am", "C", "D", "G"], // Fallback pro backward compatibility
  },
  {
    title: "Dust in the Wind",
    artist: "Kansas",
    chords: ["C", "Am", "C", "Am", "F", "G", "C"], // Fallback pro backward compatibility
  },
  {
    title: "House of the Rising Sun",
    artist: "The Animals",
    chords: ["Am", "C", "D", "F", "Am", "C", "E", "Am"], // Fallback pro backward compatibility
  },
  {
    title: "The Sound of Silence",
    artist: "Simon & Garfunkel",
    chords: ["Am", "C", "G", "Am", "F", "C", "G", "Am"], // Fallback pro backward compatibility
  },
  {
    title: "Blowin",
    artist: "Bob Dylan",
    chords: ["G", "C", "G", "C", "G", "C", "D", "G"], // Fallback pro backward compatibility
  },
  {
    title: "Take Me Home, Country Roads",
    artist: "John Denver",
    chords: ["G", "Em", "C", "D", "G", "Em", "C", "D", "G"], // Fallback pro backward compatibility
  }
];