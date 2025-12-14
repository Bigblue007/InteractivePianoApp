---
name: Song Editor - Developer Tool
overview: Implementace samostatného editoru písní jako vývojářského nástroje pro správu song library. Editor umožňuje načítat existující písně z TypeScript souboru, editovat je a exportovat zpět do formátu pro integraci do aplikace.
todos:
  - id: setup-editor-project
    content: Vytvořit nový Vite projekt v song-editor/ složce s vlastním package.json a konfigurací
    status: completed
  - id: copy-shared-types
    content: Zkopírovat typy Song a SongSection do song-editor/src/types/song.ts
    status: completed
  - id: create-editor-store
    content: Vytvořit useEditorStore s funkcionalitou pro správu písní, import a export
    status: completed
  - id: install-dnd
    content: Nainstalovat @dnd-kit/core a @dnd-kit/sortable pro drag & drop funkcionalitu
    status: completed
  - id: create-inline-chord-editor
    content: Vytvořit InlineChordEditor komponentu pro inline editaci akordů s validací
    status: completed
  - id: create-editable-section
    content: Vytvořit EditableSection komponentu s dropdown pro typ, input pro label a inline editací akordů
    status: completed
    dependencies:
      - create-inline-chord-editor
  - id: create-song-edit-form
    content: Vytvořit SongEditForm komponentu s drag & drop pro sekce a editací názvu/interpreta
    status: completed
    dependencies:
      - install-dnd
      - create-editable-section
  - id: create-song-list
    content: Vytvořit SongList komponentu pro zobrazení seznamu písní v editoru
    status: completed
  - id: create-import-export
    content: Vytvořit ImportExport komponentu pro import z TypeScript/JSON a export do TypeScript/JSON formátu
    status: completed
    dependencies:
      - create-editor-store
      - add-typescript-import
      - add-typescript-export
  - id: implement-delete-confirmation
    content: Implementovat potvrzovací dialog pro mazání písně
    status: completed
  - id: add-validation
    content: Přidat validaci akordů a formuláře s vizuálním feedbackem
    status: completed
    dependencies:
      - create-inline-chord-editor
  - id: style-editor
    content: Vytvořit CSS styly pro editor s konzistentním designem
    status: completed
    dependencies:
      - create-song-edit-form
      - create-editable-section
      - create-inline-chord-editor
  - id: add-typescript-import
    content: Implementovat parser pro import z TypeScript souboru (popularSongs.ts)
    status: completed
  - id: add-typescript-export
    content: Implementovat export do TypeScript formátu pro kopírování do popularSongs.ts
    status: completed
---

# Editor písní - Vývojářský nástroj

## Přehled

Vytvoření samostatné aplikace pro správu song library jako vývojářského nástroje. Editor umožňuje:

- Načíst existující písně z `src/data/popularSongs.ts` (import TypeScript souboru nebo JSON)
- Vytvářet, upravovat a mazat písně s jejich sekcemi a akordy
- Exportovat písně do formátu pro kopírování do `src/data/popularSongs.ts` nebo do JSON souboru
- Validovat akordy a strukturu písní

**Použití:** Editor je určen pro vývojáře k úpravě dat, která jsou pak součástí aplikace. Uživatelé aplikace písně nemění.

## Architektura

### Samostatná aplikace editoru

```
song-editor/                    # Nová samostatná aplikace
├── src/
│   ├── App.tsx                # Hlavní komponenta editoru
│   ├── components/
│   │   ├── SongList/         # Seznam písní
│   │   ├── SongEditForm/     # Formulář pro editaci
│   │   ├── EditableSection/  # Editovatelná sekce
│   │   ├── InlineChordEditor/# Inline editace akordů
│   │   └── ImportExport/     # Import/Export JSON
│   ├── stores/
│   │   └── useEditorStore.ts # Store pro editor
│   └── types/
│       └── song.ts           # Sdílené typy
└── package.json              # Vlastní dependencies
```

### Hlavní aplikace (úpravy)

```
src/
└── components/
    └── SongLibrary/
        ├── SongLibrary.tsx   # Read-only zobrazení
        └── ImportButton.tsx  # Nové: Import JSON
```

## Komponenty editoru

### 1. App komponenta (editor)

**Soubor:** `song-editor/src/App.tsx`

**Funkce:**

- Hlavní layout editoru
- Zobrazení seznamu písní a formuláře pro editaci
- Import/Export tlačítka

### 2. SongList komponenta

**Soubor:** `song-editor/src/components/SongList/SongList.tsx`

**Funkce:**

- Zobrazení seznamu všech písní
- Tlačítka pro výběr písně k editaci
- Tlačítka pro smazání písně

### 3. SongEditForm komponenta

**Soubor:** `song-editor/src/components/SongEditForm/SongEditForm.tsx`

**Funkce:**

- Editace názvu písně a interpreta (input pole)
- Zobrazení seznamu sekcí s drag & drop
- Tlačítka pro přidání nové sekce
- Tlačítka Uložit/Zrušit

**Props:**

```typescript
interface SongEditFormProps {
  song: Song;
  onSave: (updatedSong: Song) => void;
  onCancel: () => void;
}
```

### 4. EditableSection komponenta

**Soubor:** `song-editor/src/components/EditableSection/EditableSection.tsx`

**Funkce:**

- Zobrazení sekce s možností editace
- Dropdown pro typ sekce (verse, chorus, bridge, intro, outro)
- Input pro label sekce (volitelný)
- Inline editace akordů (input pole místo každého akordu)
- Tlačítka pro přidání/odebrání akordu
- Tlačítko pro smazání sekce
- Drag handle pro přesouvání

**Props:**

```typescript
interface EditableSectionProps {
  section: SongSection;
  sectionIndex: number;
  onUpdate: (index: number, section: SongSection) => void;
  onDelete: (index: number) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  isDragging?: boolean;
}
```

### 5. InlineChordEditor komponenta

**Soubor:** `song-editor/src/components/InlineChordEditor/InlineChordEditor.tsx`

**Funkce:**

- Zobrazení akordů jako input pole
- Validace názvu akordu (použít @tonaljs/tonal)
- Tlačítko + pro přidání nového akordu
- Tlačítko × pro smazání akordu
- Možnost přetáhnout akordy pro změnu pořadí (volitelné)

**Props:**

```typescript
interface InlineChordEditorProps {
  chords: string[];
  onChordsChange: (chords: string[]) => void;
}
```

## Drag & Drop implementace

### Knihovna

Pro drag & drop použít `react-beautiful-dnd` nebo `@dnd-kit/core`:

- `react-beautiful-dnd` - jednodušší, ale může mít problémy s React 18
- `@dnd-kit/core` - modernější, lepší podpora React 18

**Doporučení:** `@dnd-kit/core` (modernější, lepší podpora)

### Implementace

```typescript
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
```

**Struktura:**

- `DndContext` obalí seznam sekcí
- Každá sekce je `SortableItem`
- `onDragEnd` handler pro aktualizaci pořadí

## UI/UX návrh

### View Mode (default)

```
[← Zpět]  Název písně (tučně)  Interpret  [✏️ Editovat] [🗑️ Smazat]
─────────────────────────────────────────────────────────────
[Akordy horizontálně...]
```

### Edit Mode

```
[← Zpět]  [Input: Název]  [Input: Interpret]  [💾 Uložit] [❌ Zrušit]
─────────────────────────────────────────────────────────────
[+ Přidat sekci]
─────────────────────────────────────────────────────────────
[≡] [Dropdown: Verse] [Input: Label]  [× Smazat]
    [Input: C] [×]  [Input: Am] [×]  [Input: F] [×]  [+] [+ Přidat akord]
─────────────────────────────────────────────────────────────
[≡] [Dropdown: Chorus]  [× Smazat]
    [Input: G] [×]  [Input: D] [×]  [+] [+ Přidat akord]
```

### Detaily UI:

- **Drag handle** (≡) - ikona pro přetahování sekcí
- **Dropdown typ sekce** - výběr verse/chorus/bridge/intro/outro
- **Input label** - volitelný popisek (např. "Verse 1")
- **Inline input akordy** - každý akord jako input pole s tlačítkem ×
- **Tlačítko +** - přidat nový akord na konec sekce
- **Tlačítko ×** - smazat akord nebo sekci
- **Tlačítka ↑↓** - volitelné pro přesouvání sekcí (místo drag & drop)

## Store pro editor

### useEditorStore

**Soubor:** `song-editor/src/stores/useEditorStore.ts`

**Funkce:**

- Správa písní (add, update, delete, get)
- Import písní z JSON
- Export písní do JSON
- Volitelně: localStorage persistence

**Interface:**

```typescript
interface EditorState {
  songs: Song[];
  selectedSongId: string | null;
  
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

## Import/Export funkcionalita

### Import

**Možnost 1: Import z TypeScript souboru**

- Tlačítko "Načíst z popularSongs.ts" → otevře file picker
- Parser načte TypeScript soubor a extrahuje `POPULAR_SONGS` array
- Přidá písně do editoru
- Validace formátu a typů

**Možnost 2: Import z JSON**

- Tlačítko "Importovat z JSON" → otevře file picker
- Načte JSON soubor s formátem `{ songs: Song[] }`
- Přidá písně do editoru
- Validace formátu a typů

**Možnost 3: Vložit TypeScript kód**

- Textarea pro vložení kódu z `popularSongs.ts`
- Parser extrahuje data
- Validace a přidání do editoru

### Export

**Možnost 1: Export do TypeScript formátu**

- Tlačítko "Exportovat do TypeScript" → zobrazí kód
- Formát připravený pro kopírování do `src/data/popularSongs.ts`
- Zahrnuje správný TypeScript syntax s typy

**Možnost 2: Export do JSON**

- Tlačítko "Exportovat do JSON" → stáhne JSON soubor
- Formát: `{ songs: Song[] }`
- Název: `harmonia-songs-YYYY-MM-DD.json`

**Workflow:**

1. Vývojář otevře editor
2. Načte existující písně z `popularSongs.ts` (import nebo vložení kódu)
3. Upraví písně v editoru
4. Exportuje do TypeScript formátu
5. Zkopíruje kód do `src/data/popularSongs.ts`
6. Commitne změny do repozitáře

## Validace

### Validace akordů

- Použít `Chord.get(chordName)` z @tonaljs/tonal
- Zobrazit chybovou zprávu pod neplatným akordem
- Zvýraznit neplatný akord červeně

### Validace formuláře

- Název písně: povinný, min 1 znak
- Interpret: povinný, min 1 znak
- Alespoň jedna sekce s alespoň jedním akordem

## Workflow

### V editoru:

1. **Otevření editoru:**

   - Uživatel otevře editor (např. `http://localhost:3001`)
   - Vidí seznam všech písní

2. **Vytvoření nové písně:**

   - Klikne na "Nová píseň"
   - Zobrazí se prázdný formulář

3. **Editace písně:**

   - Vybere píseň ze seznamu
   - Zobrazí se formulář s daty písně
   - Může upravit název a interpreta
   - Může přetáhnout sekce pro změnu pořadí
   - Může kliknout na akord a upravit ho inline
   - Může přidat/odebrat akordy pomocí tlačítek
   - Může přidat/odebrat sekce

4. **Uložení:**

   - Validace formuláře
   - Aktualizace písně v store
   - Zobrazení aktualizovaného seznamu

5. **Mazání:**

   - Potvrzovací dialog
   - Smazání z store
   - Aktualizace seznamu

6. **Export:**

   - Klikne na "Exportovat písně"
   - Stáhne se JSON soubor se všemi písněmi

### Workflow pro vývojáře:

1. **Načtení existujících písní:**

   - Otevře editor
   - Klikne na "Načíst z popularSongs.ts" nebo vloží kód do textarea
   - Písně se načtou do editoru

2. **Editace:**

   - Upraví písně v editoru
   - Validace akordů a struktury

3. **Export:**

   - Klikne na "Exportovat do TypeScript"
   - Zkopíruje vygenerovaný kód
   - Vloží do `src/data/popularSongs.ts`
   - Commitne změny

**Poznámka:** Hlavní aplikace načítá písně z `src/data/popularSongs.ts` při build, takže změny se projeví po rebuild.

## Soubory k vytvoření/úpravě

### Editor aplikace (nové):

1. `song-editor/package.json`
2. `song-editor/vite.config.ts`
3. `song-editor/tsconfig.json`
4. `song-editor/index.html`
5. `song-editor/src/main.tsx`
6. `song-editor/src/App.tsx`
7. `song-editor/src/App.css`
8. `song-editor/src/types/song.ts` - kopie typů
9. `song-editor/src/stores/useEditorStore.ts`
10. `song-editor/src/components/SongList/SongList.tsx`
11. `song-editor/src/components/SongList/SongList.css`
12. `song-editor/src/components/SongEditForm/SongEditForm.tsx`
13. `song-editor/src/components/SongEditForm/SongEditForm.css`
14. `song-editor/src/components/EditableSection/EditableSection.tsx`
15. `song-editor/src/components/EditableSection/EditableSection.css`
16. `song-editor/src/components/InlineChordEditor/InlineChordEditor.tsx`
17. `song-editor/src/components/InlineChordEditor/InlineChordEditor.css`
18. `song-editor/src/components/ImportExport/ImportExport.tsx`
19. `song-editor/src/components/ImportExport/ImportExport.css`
20. `song-editor/src/utils/songImporter.ts` - import z JSON
21. `song-editor/src/utils/songExporter.ts` - export do JSON
22. `song-editor/src/utils/typescriptParser.ts` - parser pro TypeScript soubory
23. `song-editor/src/utils/typescriptExporter.ts` - export do TypeScript formátu
24. `song-editor/src/utils/chordValidator.ts` - validace akordů

## Technické detaily

### Drag & Drop

- Použít `@dnd-kit/core` a `@dnd-kit/sortable`
- Vertical list sorting strategy
- Keyboard a pointer senzory pro přístupnost
- Visual feedback při drag (opacity, transform)

### Inline editace akordů

- Input pole s validací při blur
- Zvýraznění neplatných akordů
- Automatické zaměření na nový input při přidání akordu

### State management

- Lokální state v SongEditForm pro editaci (neupravovat přímo store)
- Při uložení aktualizovat store
- Při zrušení zahodit změny
- Editor má vlastní store nezávislý na hlavní aplikaci

### Sdílení dat mezi editorem a aplikací

- **Import:** Načtení z `src/data/popularSongs.ts` (TypeScript soubor)
- **Export:** Generování TypeScript kódu pro kopírování do `src/data/popularSongs.ts`
- **Alternativa:** JSON import/export pro flexibilitu
- **Validace:** Kontrola formátu a typů při importu
- **Parser:** Extrakce `POPULAR_SONGS` array z TypeScript kódu

## Testování

1. **Editace písně:**

   - Testovat změnu názvu a interpreta
   - Testovat přidání/odebrání sekcí
   - Testovat drag & drop sekcí
   - Testovat editaci akordů
   - Testovat validaci

2. **Mazání písně:**

   - Testovat potvrzovací dialog
   - Testovat smazání a návrat do seznamu

3. **Zrušení změn:**

   - Testovat, že změny se nezachovají při zrušení