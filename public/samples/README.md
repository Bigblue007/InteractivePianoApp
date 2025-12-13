# Audio Samples Directory

Tento adresář obsahuje audio samply pro sampler-based nástroje.

## Struktura

```
samples/
  piano-acoustic/
    C2-soft.mp3
    C2-medium.mp3
    C2-hard.mp3
    D#2-soft.mp3
    D#2-medium.mp3
    D#2-hard.mp3
    F#2-soft.mp3
    ...
    C7-soft.mp3
    C7-medium.mp3
    C7-hard.mp3
```

## Naming Convention

Formát názvu souboru: `{Note}{Octave}-{Layer}.mp3`

- **Note**: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
- **Octave**: 2-7
- **Layer**: soft, medium, hard

## Piano Acoustic Preset

Preset `piano-acoustic` používá samply pro každou 3. notu (C, D#, F#, A) v oktávách 2-7.

- Celkem: 4 noty × 6 oktáv × 3 vrstvy = 72 samplů
- Pitch shifting se používá pro mezilehlé noty (max ±2 oktávy)

## Formát souborů

- Formát: MP3
- Doporučená kvalita: 44.1kHz, 16-bit nebo vyšší
- Doporučená délka: 2-5 sekund (dostatečně dlouhé pro sustain)

## Poznámky

- Samply jsou lazy-loaded při výběru nástroje
- Cache samplů zůstává v paměti pro rychlý přístup
- Pro noty mimo rozsah samplů se používá pitch shifting


