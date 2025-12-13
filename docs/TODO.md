# TODO - Seznam úkolů pro další vývoj

*Vytvořeno: 11. 12. 2025*

## Vysoká priorita

### 1. Ovládání klaviatury klávesnicí počítače
**Popis:** Implementovat možnost ovládat virtuální klaviaturu pomocí fyzické klávesnice počítače.

**Požadavky:**
- Mapování kláves počítače na MIDI noty
- Podpora základních kláves (QWERTY layout pro bílé klávesy, čísla pro černé klávesy)
- Možnost přepínání mezi různými mapováními (např. QWERTY, AZERTY)
- Zobrazení mapování kláves v UI (volitelné)

**Technické poznámky:**
- Použít `keydown`/`keyup` eventy
- Zajistit, aby klávesnice neovlivňovala ostatní prvky UI (např. inputy)
- Možná implementace v `PianoKeyboard` komponentě nebo samostatný hook

**Soubory k úpravě:**
- `src/components/PianoKeyboard/PianoKeyboard.tsx`
- `src/utils/keyboardMapping.ts` (nový soubor)
- `src/components/PianoKeyboard/PianoKeyboard.css` (volitelné - zobrazení mapování)

---

### 2. Chord Inversions v výběru akordů
**Popis:** Přidat možnost vybrat obrat akordu (inversion) v ChordSelector komponentě.

**Požadavky:**
- UI pro výběr obratu akordu (např. dropdown nebo tlačítka)
- Zobrazení obratu v názvu akordu (např. "C/E" pro první obrat C dur)
- Správné výpočty MIDI not pro obraty
- Zobrazení obratu na klaviatuře (podbarvení správných kláves)

**UI návrh:**
- Možnost 1: Dropdown s možnostmi "Základní pozice", "1. obrat", "2. obrat", "3. obrat"
- Možnost 2: Tlačítka pro přepínání mezi obraty
- Možnost 3: Šipky nahoru/dolů pro přepínání obratů (podobně jako transpozice oktáv)

**Technické poznámky:**
- Použít `@tonaljs/tonal` pro výpočet obratů
- Integrace s existující logikou transpozice oktáv
- Aktualizace `chordMidiNotes` při změně obratu

**Soubory k úpravě:**
- `src/components/ChordSelector/ChordSelector.tsx`
- `src/components/ChordSelector/ChordSelector.css`
- Možná nový utility soubor pro výpočet obratů

---

### 3. ✅ Doladit barvy podbarvených černých kláves
**Status:** ✅ **HOTOVÉ** (Release 0.2.1)

**Problém:** Uprostřed podbarvené "černé" klávesy je vidět čára (pravděpodobně border nebo outline).

**Řešení:**
- Opraveno prosvítání černé čáry z bílé klávesy při zvýraznění
- Sjednocena barva zvýraznění pro bílé i černé klávesy (zlatá barva)
- Nastaveno `opacity: 1` pro černé klávesy, `opacity: 0.9` pro bílé klávesy
- Přidán `stroke: #333` a `stroke-width: 2` pro černé klávesy s `paint-order: stroke fill`

**Implementováno v:**
- `src/components/PianoKeyboard/PianoKeyboard.css`
- Release 0.2.1 (2025-12-13)

---

### 4. ✅ Vypínání podbarvení vybraného akordu při hraní
**Status:** ✅ **HOTOVÉ** (Release 0.2.1)

**Popis:** Automaticky vypnout podbarvení vybraného akordu, když uživatel zahraje stejný akord na kontroleru nebo klávesnici.

**Řešení:**
- Implementováno v `App.tsx` pomocí `useEffect` hooku
- Automatické vymazání `selectedChordNotes` při jakémkoli hraní (`activeNotes.size > 0`)
- Funguje pro MIDI kontroler i virtuální klávesnici (myš/touch)

**Implementováno v:**
- `src/App.tsx` (řádky 34-39)
- Release 0.2.1 (2025-12-13)

---

## Střední priorita

### 5. Vylepšení UI pro Chord Inversions
- Po implementaci základní funkce vylepšit UI
- Možná vizualizace obratů na klaviatuře
- Tooltips s vysvětlením obratů

### 6. Keyboard shortcuts
- Přidat keyboard shortcuts pro běžné akce
- Např. Space pro play/pause, čísla pro rychlý výběr akordů

---

## Nízká priorita

### 7. Pokročilé mapování klávesnice
- Podpora více layoutů
- Možnost custom mapování
- Uložení preferencí do localStorage

---

*Poslední aktualizace: 13. 12. 2025*




