---
name: Song Editor - Standalone Architecture
overview: Architektura samostatného editoru písní mimo hlavní aplikaci s exportem/importem JSON souborů
---

# Samostatný editor písní - Architektura

## Přehled

Samostatná aplikace pro editaci a správu písní, která funguje nezávisle na hlavní aplikaci. Editor umožňuje vytvářet, upravovat a mazat písně s jejich sekcemi a akordy, a exportovat je do JSON formátu pro import do hlavní aplikace.

## Architektura

```
InteractivePianoApp/
├── src/                    # Hlavní aplikace (read-only zobrazení písní)
│   └── components/
│       └── SongLibrary/    # Pouze zobrazení, žádná editace
│
└── song-editor/            # Samostatný editor (nová aplikace)
    ├── src/
    │   ├── components/
    │   │   ├── SongList/           # Seznam všech písní
    │   │   ├── SongEditForm/       # Formulář pro editaci písně
    │   │   ├── EditableSection/    # Editovatelná sekce
    │   │   └── InlineChordEditor/  # Inline editace akordů
    │   ├── stores/
    │   │   └── useEditorStore.ts   # Store pro editor (nezávislý)
    │   ├── utils/
    │   │   ├── songImporter.ts     # Import z JSON
    │   │   └── songExporter.ts     # Export do JSON
    │   └── types/
    │       └── song.ts             # Sdílené typy (kopie nebo import)
    ├── package.json
    ├── vite.config.ts
    └── index.html
```

## Možnosti implementace

### Varianta 1: Samostatná Vite aplikace (DOPORUČENO)

**Výhody:**
- Úplně nezávislá aplikace
- Vlastní build a deployment
- Snadné sdílení typů (import nebo kopie)
- Může běžet na jiném portu (např. 3001)

**Struktura:**
```
song-editor/
├── package.json          # Vlastní dependencies
├── vite.config.ts        # Vite config pro editor
├── tsconfig.json         # TypeScript config
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── types/
    │   └── song.ts       # Kopie typů z hlavní aplikace
    └── ...
```

**Sdílení typů:**
- Možnost 1: Kopie typů do `song-editor/src/types/song.ts`
- Možnost 2: Import z hlavní aplikace pomocí TypeScript path mapping
- Možnost 3: Sdílený package v `shared/` složce

### Varianta 2: Monorepo s workspaces

**Výhody:**
- Sdílené typy a utilities
- Jednotná správa dependencies
- Snadnější vývoj

**Nevýhody:**
- Složitější setup
- Vyžaduje npm/yarn workspaces

### Varianta 3: Jednoduchá HTML stránka

**Výhody:**
- Nejjednodušší implementace
- Žádný build proces
- Rychlý start

**Nevýhody:**
- Omezené možnosti
- Těžší udržovatelnost

## Doporučená implementace: Varianta 1

### Struktura projektu

```
song-editor/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── App.css
    ├── types/
    │   └── song.ts                    # Song, SongSection typy
    ├── stores/
    │   └── useEditorStore.ts          # Zustand store pro editor
    ├── components/
    │   ├── SongList/
    │   │   ├── SongList.tsx
    │   │   └── SongList.css
    │   ├── SongEditForm/
    │   │   ├── SongEditForm.tsx
    │   │   └── SongEditForm.css
    │   ├── EditableSection/
    │   │   ├── EditableSection.tsx
    │   │   └── EditableSection.css
    │   ├── InlineChordEditor/
    │   │   ├── InlineChordEditor.tsx
    │   │   └── InlineChordEditor.css
    │   └── ImportExport/
    │       ├── ImportExport.tsx
    │       └── ImportExport.css
    └── utils/
        ├── songImporter.ts            # Import JSON souborů
        ├── songExporter.ts             # Export do JSON
        └── chordValidator.ts           # Validace akordů (@tonaljs/tonal)
```

### Sdílené typy

**Soubor:** `song-editor/src/types/song.ts`

```typescript
// Kopie typů z hlavní aplikace
export interface SongSection {
  type: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro';
  label?: string;
  chords: string[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  chords?: string[]; // Deprecated
  sections?: SongSection[];
  createdAt: string; // ISO string pro JSON serializaci
  updatedAt: string;
}

export type SongInput = Omit<Song, 'id' | 'createdAt' | 'updatedAt'>;
```

### Store pro editor

**Soubor:** `song-editor/src/stores/useEditorStore.ts`

```typescript
import { create } from 'zustand';
import { Song, SongInput } from '../types/song';

interface EditorState {
  songs: Song[];
  selectedSongId: string | null;
  
  // Actions
  addSong: (song: SongInput) => void;
  updateSong: (id: string, updates: Partial<Song>) => void;
  deleteSong: (id: string) => void;
  getSong: (id: string) => Song | undefined;
  selectSong: (id: string | null) => void;
  importSongs: (songs: Song[]) => void;
  exportSongs: () => Song[];
  loadFromLocalStorage: () => void;
  saveToLocalStorage: () => void;
}
```

### Import/Export funkcionalita

**Export:**
- Tlačítko "Exportovat písně" → stáhne JSON soubor
- Formát: `{ songs: Song[] }`
- Název souboru: `harmonia-songs-YYYY-MM-DD.json`

**Import:**
- Tlačítko "Importovat písně" → otevře file picker
- Načte JSON soubor a přidá písně do editoru
- Validace formátu a typů
- Možnost merge nebo replace

**Sdílení s hlavní aplikací:**
1. Uživatel exportuje písně z editoru (JSON)
2. Uživatel importuje JSON do hlavní aplikace
3. Hlavní aplikace načte písně do store

### UI/UX editoru

```
┌─────────────────────────────────────────────────────────┐
│  Harmonia Song Editor                                   │
├─────────────────────────────────────────────────────────┤
│  [📥 Importovat] [📤 Exportovat] [➕ Nová píseň]        │
├─────────────────────────────────────────────────────────┤
│  Seznam písní:                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 1. Let It Be - The Beatles        [✏️] [🗑️]      │  │
│  │ 2. Wonderwall - Oasis              [✏️] [🗑️]      │  │
│  └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  Editace písně:                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Název: [Let It Be____________]                    │  │
│  │ Interpret: [The Beatles_______]                   │  │
│  │                                                   │  │
│  │ Sekce:                                            │  │
│  │ ┌───────────────────────────────────────────────┐ │  │
│  │ │ [≡] [Verse ▼] [Label: Verse 1] [× Smazat]   │ │  │
│  │ │     [C] [×] [G] [×] [Am] [×] [F] [×] [+]    │ │  │
│  │ └───────────────────────────────────────────────┘ │  │
│  │ ┌───────────────────────────────────────────────┐ │  │
│  │ │ [≡] [Chorus ▼] [× Smazat]                    │ │  │
│  │ │     [C] [×] [G] [×] [F] [×] [C] [×] [+]      │ │  │
│  │ └───────────────────────────────────────────────┘ │  │
│  │ [+ Přidat sekci]                                  │  │
│  │                                                   │  │
│  │ [💾 Uložit] [❌ Zrušit]                          │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Workflow

### Vytvoření/Editace písně v editoru:

1. Uživatel otevře editor (např. `http://localhost:3001`)
2. Klikne na "Nová píseň" nebo vybere existující
3. Vyplní název a interpreta
4. Přidá sekce (verse, chorus, atd.)
5. Přidá akordy do každé sekce
6. Uloží píseň
7. Exportuje všechny písně do JSON

### Import do hlavní aplikace:

1. Uživatel otevře hlavní aplikaci
2. V SongLibrary klikne na "Importovat písně"
3. Vybere JSON soubor z editoru
4. Písně se načtou do aplikace

## Technické detaily

### Dependencies editoru

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tonaljs/tonal": "^4.10.0",
    "@dnd-kit/core": "^6.0.0",
    "@dnd-kit/sortable": "^7.0.0",
    "zustand": "^4.4.7"
  }
}
```

### Vite config

```typescript
// song-editor/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // Jiný port než hlavní aplikace
  },
});
```

### Package.json scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

## Integrace s hlavní aplikací

### Možnost 1: Import JSON v hlavní aplikaci

**Soubor:** `src/components/SongLibrary/ImportButton.tsx`

```typescript
const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string);
      if (data.songs && Array.isArray(data.songs)) {
        data.songs.forEach((song: Song) => {
          useSongLibraryStore.getState().addSong(song);
        });
      }
    } catch (error) {
      console.error('Chyba při importu:', error);
    }
  };
  reader.readAsText(file);
};
```

### Možnost 2: localStorage sync (volitelné)

Pokud chceme automatickou synchronizaci:
- Editor ukládá do `localStorage` s klíčem `harmonia-songs-editor`
- Hlavní aplikace může načítat z `localStorage` s klíčem `harmonia-songs`
- Nebo sdílený klíč pro obě aplikace

## Deployment

### Editor jako samostatná aplikace

- Může být nasazena na jinou URL (např. `editor.harmonia.app`)
- Nebo na stejnou doménu pod `/editor`
- Build: `npm run build` → `dist/` složka

### Sdílení dat

- Export/import JSON (nejjednodušší)
- Nebo API endpoint pro synchronizaci (pokročilejší)

## Výhody tohoto přístupu

1. **Oddělení zodpovědností** - Editor je samostatná aplikace
2. **Jednodušší hlavní aplikace** - Žádná editace, pouze zobrazení
3. **Flexibilita** - Editor může být rozšířen o další funkce
4. **Sdílení** - JSON soubory lze snadno sdílet
5. **Backup** - Export JSON = backup dat

## Soubory k vytvoření

### Editor aplikace:
1. `song-editor/package.json`
2. `song-editor/vite.config.ts`
3. `song-editor/tsconfig.json`
4. `song-editor/index.html`
5. `song-editor/src/main.tsx`
6. `song-editor/src/App.tsx`
7. `song-editor/src/types/song.ts`
8. `song-editor/src/stores/useEditorStore.ts`
9. `song-editor/src/components/...` (všechny komponenty z plánu)

### Hlavní aplikace:
1. `src/components/SongLibrary/ImportButton.tsx` - Tlačítko pro import JSON
2. `src/utils/songImporter.ts` - Utility pro import písní

## Aktualizace plánu

Původní plán (`song_editing_and_management_8c02fca2.plan.md`) se upraví tak, aby:
- Komponenty byly v `song-editor/` místo `src/components/SongLibrary/`
- Nebyly tlačítka Editovat/Smazat v hlavní aplikaci
- Byl pouze import JSON v hlavní aplikaci

