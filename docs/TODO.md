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

### 3. Doladit barvy podbarvených černých kláves
**Problém:** Uprostřed podbarvené "černé" klávesy je vidět čára (pravděpodobně border nebo outline).

**Požadavky:**
- Opravit zobrazení podbarvených černých kláves
- Zajistit, aby podbarvení bylo jednotné bez viditelných čar
- Možná úprava CSS pro `highlighted` třídu u černých kláves

**Technické poznámky:**
- Zkontrolovat CSS pro `.black-key.highlighted`
- Možná problém s `border` nebo `outline` vlastnostmi
- Zajistit, aby podbarvení pokrývalo celou plochu klávesy

**Soubory k úpravě:**
- `src/components/PianoKeyboard/PianoKeyboard.css`
- Možná `src/components/PianoKeyboard/PianoKeyboard.tsx` (logika vykreslování)

---

### 4. Vypínání podbarvení vybraného akordu při hraní
**Popis:** Automaticky vypnout podbarvení vybraného akordu, když uživatel zahraje stejný akord na kontroleru nebo klávesnici.

**Požadavky:**
- Detekce, zda zahrané noty odpovídají vybranému akordu
- Automatické vymazání `selectedChordNotes` při detekci
- Funguje pro MIDI kontroler i virtuální klávesnici (myš/touch)

**Technické poznámky:**
- Porovnání `activeNotes` s `selectedChordNotes`
- Možná tolerance pro detekci (např. všechny noty akordu musí být přítomny)
- Implementace v `App.tsx` nebo nový hook

**Soubory k úpravě:**
- `src/App.tsx` (logika pro porovnání not)
- Možná nový utility soubor pro porovnání akordů

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

*Poslední aktualizace: 11. 12. 2025*




