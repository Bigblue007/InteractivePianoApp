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
        chords: ["C", "G", "Am", "F"]
      },
      {
        type: "chorus",
        chords: ["C", "G", "F", "C"]
      },
      {
        type: "verse",
        label: "Verse 2",
        chords: ["C", "G", "Am", "F"]
      },
      {
        type: "chorus",
        chords: ["C", "G", "F", "C"]
      }
    ]
  },
  {
    title: "Wonderwall",
    artist: "Oasis",
    chords: ["Em", "G", "D", "C", "Em", "G", "D", "C"],
    sections: [
      {
        type: "verse",
        label: "Verse 1",
        chords: ["Em", "G", "D", "C"]
      },
      {
        type: "chorus",
        chords: ["Em", "G", "D", "C"]
      }
    ]
  },
  {
    title: "Hallelujah",
    artist: "Leonard Cohen",
    chords: ["C", "Am", "C", "Am", "F", "G", "C", "G", "Am"],
    sections: [
      {
        type: "verse",
        label: "Verse 1",
        chords: ["C", "Am", "C", "Am"]
      },
      {
        type: "chorus",
        chords: ["F", "G", "C", "G", "Am"]
      }
    ]
  },
  {
    title: "Stand By Me",
    artist: "Ben E. King",
    chords: ["C", "Am", "F", "G", "C", "Am", "F", "G"]
  },
  {
    title: "Hey Jude",
    artist: "The Beatles",
    chords: ["C", "F", "C", "F", "C", "G", "F", "C"]
  },
  {
    title: "Hotel California",
    artist: "Eagles",
    chords: ["Am", "E", "G", "D", "F", "C", "Dm", "E"]
  },
  {
    title: "Sweet Home Alabama",
    artist: "Lynyrd Skynyrd",
    chords: ["D", "C", "G", "D", "C", "G"]
  },
  {
    title: "Free Fallin'",
    artist: "Tom Petty",
    chords: ["F", "C", "G", "Am", "F", "C", "G"]
  },
  {
    title: "Knockin' on Heaven's Door",
    artist: "Bob Dylan",
    chords: ["G", "D", "Am", "G", "D", "C"]
  },
  {
    title: "Country Roads",
    artist: "John Denver",
    chords: ["G", "Em", "C", "D", "G", "Em", "C", "D"]
  },
  {
    title: "Imagine",
    artist: "John Lennon",
    chords: ["C", "Cmaj7", "F", "C", "F", "C", "Dm", "G"]
  },
  {
    title: "Horse with No Name",
    artist: "America",
    chords: ["Em", "D6", "Em", "D6", "Em", "D6", "Em"]
  },
  {
    title: "Wish You Were Here",
    artist: "Pink Floyd",
    chords: ["Am", "C", "D", "F", "Am", "C", "G", "Am"]
  },
  {
    title: "Stairway to Heaven",
    artist: "Led Zeppelin",
    chords: ["Am", "C", "D", "F", "Am", "C", "D", "F", "G"]
  },
  {
    title: "Blackbird",
    artist: "The Beatles",
    chords: ["G", "Am", "G", "Am", "C", "D", "G"]
  },
  {
    title: "Dust in the Wind",
    artist: "Kansas",
    chords: ["C", "Am", "C", "Am", "F", "G", "C"]
  },
  {
    title: "House of the Rising Sun",
    artist: "The Animals",
    chords: ["Am", "C", "D", "F", "Am", "C", "E", "Am"]
  },
  {
    title: "The Sound of Silence",
    artist: "Simon & Garfunkel",
    chords: ["Am", "C", "G", "Am", "F", "C", "G", "Am"]
  },
  {
    title: "Blowin' in the Wind",
    artist: "Bob Dylan",
    chords: ["G", "C", "G", "C", "G", "C", "D", "G"]
  },
  {
    title: "Take Me Home, Country Roads",
    artist: "John Denver",
    chords: ["G", "Em", "C", "D", "G", "Em", "C", "D", "G"]
  }
];

