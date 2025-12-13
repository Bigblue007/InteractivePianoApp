---
name: Song Editing and Management
overview: Implementace editace a mazání písní s editačním módem, drag & drop pro sekce a inline editací akordů.
todos:
  - id: install-dnd
    content: Nainstalovat @dnd-kit/core a @dnd-kit/sortable pro drag & drop funkcionalitu
    status: pending
  - id: create-inline-chord-editor
    content: Vytvořit InlineChordEditor komponentu pro inline editaci akordů s validací
    status: pending
  - id: create-editable-section
    content: Vytvořit EditableSection komponentu s dropdown pro typ, input pro label a inline editací akordů
    status: pending
    dependencies:
      - create-inline-chord-editor
  - id: create-song-edit-form
    content: Vytvořit SongEditForm komponentu s drag & drop pro sekce a editací názvu/interpreta
    status: pending
    dependencies:
      - install-dnd
      - create-editable-section
  - id: add-edit-delete-buttons
    content: Přidat tlačítka Editovat a Smazat do SongDetail headeru a implementovat edit mode toggle
    status: pending
    dependencies:
      - create-song-edit-form
  - id: implement-delete-confirmation
    content: Implementovat potvrzovací dialog pro mazání písně
    status: pending
    dependencies:
      - add-edit-delete-buttons
  - id: add-validation
    content: Přidat validaci akordů a formuláře s vizuálním feedbackem
    status: pending
    dependencies:
      - create-inline-chord-editor
  - id: style-edit-mode
    content: Vytvořit CSS styly pro edit mode s konzistentním designem
    status: pending
    dependencies:
      - create-song-edit-form
      - create-editable-section
      - create-inline-chord-editor
---

# Implementace editace a mazání písní

## Přehled

Přidání funkcí pro editaci a mazání písní s uživatelsky přívětivým UI. Uživatel může přepnout do editačního módu, upravit název a interpreta, přidávat/odebírat/přesouvat sekce pomocí drag & drop a editovat akordy inline.

## Architektura

```
SongDetail Component
├── View Mode (default)
│   ├── Header s tlačítky Editovat/Smazat
│   └── ChordProgression (read-only)
└── Edit Mode
    ├── Editable Header (název, interpret)
    ├── SectionList (drag & drop)
    │   └── EditableSection
    │       ├── Section Header (typ, label, akce)
    │       └── Inline Chord Editor
    └── Action Buttons (Uložit, Zrušit)
```

## Komponenty

### 1. SongDetail - rozšíření

**Soubor:** `src/components/SongLibrary/SongDetail.tsx`

**Změny:**

- Přidat state `isEditing: boolean`
- Přidat tlačítka "Editovat" a "Smazat" v headeru (pouze v view módu)
- Podmíněné renderování: `isEditing ? <SongEditForm /> : <ChordProgression />`
- Potvrzovací dialog pro mazání

**Nové props:**

```typescript
interface SongDetailProps {
  // ... existující
  onSongUpdated?: (song: Song) => void;
  onSongDeleted?: (songId: string) => void;
}
```

### 2. SongEditForm komponenta

**Soubor:** `src/components/SongLibrary/SongEditForm.tsx`

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

### 3. EditableSection komponenta

**Soubor:** `src/components/SongLibrary/EditableSection.tsx`

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

### 4. InlineChordEditor komponenta

**Soubor:** `src/components/SongLibrary/InlineChordEditor.tsx`

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

## Store rozšíření

### useSongLibraryStore

**Soubor:** `src/stores/useSongLibraryStore.ts`

**Změny:**

- `updateSong` už existuje - použít pro aktualizaci
- `deleteSong` už existuje - použít pro mazání
- Možná přidat `isDefaultSong: boolean` do Song interface pro ochranu před smazáním výchozích písní (volitelné)

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

1. **Zobrazení písně:**

   - Uživatel vidí píseň v read-only módu
   - Tlačítka "Editovat" a "Smazat" v headeru

2. **Kliknutí na "Editovat":**

   - Přepne do editačního módu
   - Zobrazí SongEditForm
   - Tlačítka se změní na "Uložit" a "Zrušit"

3. **Editace:**

   - Uživatel může upravit název a interpreta
   - Může přetáhnout sekce pro změnu pořadí
   - Může kliknout na akord a upravit ho inline
   - Může přidat/odebrat akordy pomocí tlačítek
   - Může přidat/odebrat sekce

4. **Uložení:**

   - Validace formuláře
   - Aktualizace písně v store pomocí `updateSong`
   - Přepnutí zpět do view módu

5. **Zrušení:**

   - Zahození změn
   - Přepnutí zpět do view módu

6. **Mazání:**

   - Potvrzovací dialog
   - Smazání z store pomocí `deleteSong`
   - Návrat do seznamu písní

## Soubory k vytvoření/úpravě

### Nové soubory:

1. `src/components/SongLibrary/SongEditForm.tsx`
2. `src/components/SongLibrary/SongEditForm.css`
3. `src/components/SongLibrary/EditableSection.tsx`
4. `src/components/SongLibrary/EditableSection.css`
5. `src/components/SongLibrary/InlineChordEditor.tsx`
6. `src/components/SongLibrary/InlineChordEditor.css`
7. `src/components/SongLibrary/DeleteConfirmDialog.tsx` (volitelné)

### Úpravy existujících souborů:

1. `src/components/SongLibrary/SongDetail.tsx` - přidat edit mode a tlačítka
2. `src/components/SongLibrary/SongDetail.css` - styly pro edit mode
3. `package.json` - přidat `@dnd-kit/core` a `@dnd-kit/sortable`

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