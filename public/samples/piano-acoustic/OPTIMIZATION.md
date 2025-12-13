# Optimalizace Piano Samplů

## Strategie redukce samplů

Aplikace nyní používá **redukovanou strategii samplů** pro lepší výkon a nižší latenci:

### Rozestup samplů
- **Každá 3. nota v oktávě**: C, D#, F#, A
- **Oktávy**: 1-6 (pokrývá celou klaviaturu A0-C8 s pitch shiftem ±2.5 oktávy)
- **Celkem**: 24 samplů místo původních 88

### Délka samplů
- **Level1/Level2 (attack samply)**: 2.5 sekundy
  - Zahrnuje attack, decay a začátek sustain
  - Delší samply zvyšují latenci a spotřebu paměti
- **RT (Release Trigger)**: 1 sekunda
  - Pouze release zvuk
  - Může být i kratší (0.5-1s)

## Ořezání samplů

### Automatické ořezání (doporučeno)

Použijte npm script:

```bash
npm run trim-samples
```

Nebo přímo PowerShell script:

```powershell
cd scripts
.\trim-samples.ps1
```

Script:
- Vytvoří zálohu původních samplů v `backup/`
- Ořízne Level1/Level2 samply na 2.5 sekundy
- Ořízne RT samply na 1 sekundu
- Používá FFmpeg (musí být nainstalován)

### Manuální ořezání

#### FFmpeg (příkazová řádka)

```bash
# Level1/Level2 samply na 2.5 sekundy
ffmpeg -i input.mp3 -t 2.5 -c:a libmp3lame -q:a 2 output.mp3

# RT samply na 1 sekundu
ffmpeg -i input_RT.mp3 -t 1.0 -c:a libmp3lame -q:a 2 output_RT.mp3
```

#### Audacity (GUI)

1. Otevřít sample v Audacity
2. Označit 2.5 sekundy od začátku (pro Level1/Level2) nebo 1 sekundu (pro RT)
3. File → Export → Export Selected Audio
4. Formát: MP3, Quality: 2 (VBR)

## Požadovaná struktura samplů

Aplikace očekává samply v následujícím formátu:

```
TKI_{Note}{Octave}_{Type}_{RR}.mp3
```

Kde:
- `{Note}`: C, D#, F#, A (každá 3. nota)
- `{Octave}`: 1, 2, 3, 4, 5, 6
- `{Type}`: Level1, Level2, RT
- `{RR}`: RR1, RR2, RR3 (Round Robin)

### Příklady názvů souborů

```
TKI_C1_Level1_RR1.mp3
TKI_C1_Level1_RR2.mp3
TKI_C1_Level1_RR3.mp3
TKI_C1_Level2_RR1.mp3
TKI_C1_Level2_RR2.mp3
TKI_C1_Level2_RR3.mp3
TKI_C1_RT_RR1.mp3
TKI_C1_RT_RR2.mp3
TKI_C1_RT_RR3.mp3
...
TKI_A6_Level1_RR1.mp3
...
```

### Požadované samply

Pro každou kombinaci noty a oktávy potřebujete:
- 3 × Level1 samply (RR1, RR2, RR3)
- 3 × Level2 samply (RR1, RR2, RR3)
- 3 × RT samply (RR1, RR2, RR3)

**Celkem**: 9 samplů × 4 noty × 6 oktáv = **216 samplů**

Plus pedal samply (PD, PU) - 6 samplů

## Pitch Shifting

Aplikace používá pitch shifting pro pokrytí not, které nemají vlastní samply:
- **Max pitch shift**: ±2.5 oktávy (±30 semitonů)
- **Kvalita**: Pitch shifting pomocí `playbackRate` na AudioBufferSourceNode
- **Doporučení**: Pro lepší kvalitu použijte samply každé 2-3 noty, ne každou notu

## Výhody redukované strategie

1. **Nižší latence**: Kratší samply = rychlejší načítání a přehrávání
2. **Menší paměť**: Méně samplů = menší spotřeba RAM
3. **Rychlejší načítání**: Méně souborů k načtení při startu
4. **Lepší výkon**: Méně dat k zpracování

## Migrace z původních samplů

Pokud máte původní samply v jiném formátu:

1. **Ořezat samply** na doporučenou délku (2.5s / 1s) pomocí `npm run trim-samples`
2. **Přejmenovat** samply podle nového formátu (pokud je potřeba)
3. **Nebo** aplikace automaticky najde nejbližší existující samply a použije pitch shift

### Automatické hledání nejbližších samplů

Aplikace používá `findNearestSampleConfig()` pro automatické hledání nejbližších samplů.
Pokud samply pro konkrétní noty neexistují (např. C1, D#1), aplikace najde nejbližší
existující samply (např. C0, D#3) a použije pitch shift pro pokrytí požadované noty.

**Výhoda**: Nemusíte mít samply pro každou notu - aplikace automaticky použije
pitch shift pro pokrytí celé klaviatury.

