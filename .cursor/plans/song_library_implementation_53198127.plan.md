---
name: Song Library Implementation
overview: Implementace knihovny písniček s vyhledáváním, zobrazením chord progression a interaktivními akordy, které se zobrazí na klaviatuře, přehrají a zobrazí v notové osnově.
todos:
  - id: create-data-file
    content: Vytvořit src/data/popularSongs.ts s 20 populárními písněmi a jejich chord progression
    status: completed
  - id: create-chord-utils
    content: Vytvořit src/utils/chordUtils.ts s funkcí chordToMidiNotes pro konverzi názvu akordu na MIDI noty
    status: completed
  - id: extend-song-store
    content: Rozšířit useSongLibraryStore o vyhledávání, selectedSongId a inicializaci výchozích písní
    status: completed
    dependencies:
      - create-data-file
  - id: create-search-bar
    content: Vytvořit SearchBar komponentu pro vyhledávání písní podle interpreta a názvu
    status: completed
    dependencies:
      - extend-song-store
  - id: create-song-list
    content: Vytvořit SongList komponentu pro zobrazení seznamu výsledků vyhledávání
    status: completed
    dependencies:
      - extend-song-store
  - id: create-chord-progression
    content: Vytvořit ChordProgression komponentu pro vertikální zobrazení klikatelných akordů
    status: completed
    dependencies:
      - create-chord-utils
  - id: create-song-detail
    content: Vytvořit SongDetail komponentu pro zobrazení detailu vybrané písně s chord progression
    status: completed
    dependencies:
      - create-chord-progression
  - id: create-song-library
    content: Vytvořit hlavní SongLibrary komponentu integrující všechny subkomponenty
    status: completed
    dependencies:
      - create-search-bar
      - create-song-list
      - create-song-detail
  - id: integrate-app
    content: Integrovat SongLibrary do App.tsx a přidat handler pro kliknutí na akord z knihovny
    status: completed
    dependencies:
      - create-song-library
      - create-chord-utils
  - id: update-score-view
    content: Upravit ScoreView pro zobrazení not z vybraného akordu z knihovny (přidat prop displayNotes)
    status: completed
    dependencies:
      - integrate-app
  - id: add-styling
    content: Vytvořit CSS soubory pro všechny SongLibrary komponenty s tmavým motivem konzistentním s aplikací
    status: completed
    dependencies:
      - create-song-library
---

# Implementace knihovny písniček

## Přehled

Implementace kompletní knihovny písniček s vyhledáváním, zobrazením chord progression a interaktivními akordy. Uživatel může vyhledávat písně podle interpreta a názvu, zobrazit chord progression a kliknutím na akord ho zobrazit na klaviatuře, přehrát a zobrazit v notové osnově.

## Architektura

```
SongLibrary Component
├── SearchBar (vyhledávání podle interpreta/názvu)
├── SongList (seznam výsledků vyhledávání)
└── SongDetail (zobrazení vybrané písně)
    └── ChordProgression (vertikální seznam klikatelných akordů)
```

## Data struktura

### Song interface (rozšíření existujícího)

```typescript
interface Song {
  id: string;
  title: string;
  artist: string; // Povinné (místo optional)
  chords: string[]; // ["C", "Am", "F", "G"]
  createdAt: Date;
  updatedAt: Date;
}
```

### Výchozí data

- Vytvořit `src/data/popularSongs.ts` s 20 populárními písněmi
- Formát: pole objektů Song (bez id, createdAt, updatedAt - ty se přidají při načtení)

## Komponenty

### 1. SongLibrary komponenta

**Soubor:** `src/components/SongLibrary/SongLibrary.tsx`

**Funkce:**

- Hlavní komponenta pro knihovnu písniček
- Obsahuje vyhledávací pole a seznam písní
- Zobrazuje detail vybrané písně s chord progression

**Props:** Žádné (používá stores)

**Struktura:**

```typescript
<div className="song-library">
  <div className="song-library-header">
    <h3>Knihovna písniček</h3>
  </div>
  <SearchBar />
  <SongList />
  {selectedSong && <SongDetail song={selectedSong} />}
</div>
```

### 2. SearchBar komponenta

**Soubor:** `src/components/SongLibrary/SearchBar.tsx`

**Funkce:**

- Input pole pro vyhledávání
- Vyhledává podle interpreta a názvu písně (case-insensitive)
- Real-time filtrování

**Props:**

```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
}
```

### 3. SongList komponenta

**Soubor:** `src/components/SongLibrary/SongList.tsx`

**Funkce:**

- Zobrazuje seznam výsledků vyhledávání
- Zobrazuje název písně a interpreta
- Kliknutím vybere píseň

**Props:**

```typescript
interface SongListProps {
  songs: Song[];
  onSelectSong: (song: Song) => void;
  selectedSongId?: string;
}
```

### 4. SongDetail komponenta

**Soubor:** `src/components/SongLibrary/SongDetail.tsx`

**Funkce:**

- Zobrazuje detail vybrané písně
- Zobrazuje název, interpreta a chord progression
- Obsahuje tlačítko pro přidání vlastní písně (pokud je potřeba)

**Props:**

```typescript
interface SongDetailProps {
  song: Song;
  onChordClick: (chordName: string) => void;
}
```

### 5. ChordProgression komponenta

**Soubor:** `src/components/SongLibrary/ChordProgression.tsx`

**Funkce:**

- Zobrazuje vertikální seznam akordů
- Každý akord je klikatelný
- Zobrazuje pořadí akordu (1, 2, 3, ...)

**Props:**

```typescript
interface ChordProgressionProps {
  chords: string[];
  onChordClick: (chordName: string) => void;
  selectedChordIndex?: number;
}
```

## Store rozšíření

### useSongLibraryStore

**Soubor:** `src/stores/useSongLibraryStore.ts`

**Nové metody:**

```typescript
interface SongLibraryState {
  // ... existující
  selectedSongId: string | null;
  searchQuery: string;
  
  // Nové actions
  selectSong: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  searchSongs: (query: string) => Song[];
  initializeDefaultSongs: () => void; // Načte výchozí písně při startu
}
```

**Logika vyhledávání:**

- Vyhledává v `title` a `artist` (case-insensitive)
- Vrací pole Song objektů

## Integrace s existujícími komponentami

### 1. App.tsx

**Změny:**

- Přidat `SongLibrary` komponentu do pravé části `bottom-section`
- Přidat handler pro kliknutí na akord z knihovny
- Handler bude:
  - Konvertovat název akordu na MIDI noty (použít logiku z ChordSelector)
  - Nastavit `selectedChordNotes` pro zobrazení na klaviatuře
  - Přehrát akord pomocí audio engine
  - Zobrazit noty v ScoreView (přes activeNotes nebo nový prop)

**Nový handler:**

```typescript
const handleLibraryChordClick = useCallback((chordName: string) => {
  // 1. Konvertovat chord name na MIDI noty (stejná logika jako v ChordSelector)
  // 2. Nastavit selectedChordNotes pro zobrazení na klaviatuře
  // 3. Přehrát akord
  // 4. Zobrazit v ScoreView (možná přes nový state nebo prop)
}, []);
```

### 2. ScoreView.tsx

**Změny:**

- Možnost zobrazit noty z vybraného akordu (ne jen z activeNotes)
- Přidat prop `displayNotes?: number[]` pro zobrazení not z knihovny
- Pokud je `displayNotes` nastaveno, zobrazit tyto noty místo `activeNotes`

### 3. PianoKeyboard.tsx

**Změny:**

- Už podporuje `highlightedNotes` prop - žádné změny potřeba

## Utility funkce

### chordToMidiNotes

**Soubor:** `src/utils/chordUtils.ts` (nový soubor)

**Funkce:**

- Konvertuje název akordu (string) na pole MIDI not
- Použije stejnou logiku jako v ChordSelector
- Podporuje všechny formáty akordů podporované @tonaljs/tonal
```typescript
export function chordToMidiNotes(
  chordName: string,
  octave: number = 4
): number[];
```


## Data soubor

### popularSongs.ts

**Soubor:** `src/data/popularSongs.ts`

**Struktura:**

```typescript
export const POPULAR_SONGS: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: "Let It Be",
    artist: "The Beatles",
    chords: ["C", "G", "Am", "F", "C", "G", "F", "C"]
  },
  // ... dalších 19 písní
];
```

**Výběr písní:**

- 20 populárních písní různých žánrů
- Různé obtížnosti chord progression
- Známé písně pro snadné testování

## Styling

### SongLibrary.css

**Soubor:** `src/components/SongLibrary/SongLibrary.css`

**Styly:**

- Tmavý motiv konzistentní s aplikací
- Responzivní design
- Klikatelné akordy s hover efekty
- Vertikální seznam akordů s čísly pořadí

## Workflow

1. **Inicializace:**

   - Při startu aplikace načíst výchozí písně do store
   - Pokud store je prázdný, inicializovat z `popularSongs.ts`

2. **Vyhledávání:**

   - Uživatel zadá dotaz do SearchBar
   - Store filtruje písně podle dotazu
   - SongList zobrazí výsledky

3. **Výběr písně:**

   - Uživatel klikne na píseň v SongList
   - SongDetail zobrazí detail s chord progression

4. **Kliknutí na akord:**

   - Uživatel klikne na akord v ChordProgression
   - Handler konvertuje akord na MIDI noty
   - Nastaví `selectedChordNotes` pro zobrazení na klaviatuře
   - Přehrává akord pomocí audio engine
   - Zobrazí noty v ScoreView

5. **Přidání vlastní písně:**

   - Uživatel klikne na tlačítko "Přidat píseň"
   - Zobrazí se formulář (budoucí rozšíření)
   - Uloží se do store

## Soubory k vytvoření/úpravě

### Nové soubory:

1. `src/components/SongLibrary/SongLibrary.tsx`
2. `src/components/SongLibrary/SongLibrary.css`
3. `src/components/SongLibrary/SearchBar.tsx`
4. `src/components/SongLibrary/SongList.tsx`
5. `src/components/SongLibrary/SongList.css`
6. `src/components/SongLibrary/SongDetail.tsx`
7. `src/components/SongLibrary/SongDetail.css`
8. `src/components/SongLibrary/ChordProgression.tsx`
9. `src/components/SongLibrary/ChordProgression.css`
10. `src/data/popularSongs.ts`
11. `src/utils/chordUtils.ts`

### Úpravy existujících souborů:

1. `src/stores/useSongLibraryStore.ts` - přidat vyhledávání a selectedSongId
2. `src/App.tsx` - přidat SongLibrary komponentu a handler pro kliknutí na akord
3. `src/components/ScoreView/ScoreView.tsx` - přidat prop pro zobrazení not z knihovny
4. `src/services/score/ScoreRenderer.ts` - možná úpravy pro zobrazení not z prop

## Testování

1. **Vyhledávání:**

   - Testovat vyhledávání podle názvu
   - Testovat vyhledávání podle interpreta
   - Testovat case-insensitive vyhledávání

2. **Zobrazení akordů:**

   - Testovat kliknutí na akord
   - Ověřit zobrazení na klaviatuře
   - Ověřit přehrání
   - Ověřit zobrazení v notové osnově

3. **Přidání vlastní písně:**

   - Testovat přidání nové písně
   - Ověřit, že se zobrazí v seznamu
   - Ověřit, že se uloží do store

## Poznámky

- Chord progression je jednoduché pole stringů - žádné timing informace
- Vertikální seznam akordů pro snadné procházení
- Klikatelné akordy používají stejnou logiku jako ChordSelector
- Integrace s existujícími komponentami je minimální - většina logiky je v nových komponentách