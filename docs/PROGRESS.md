# Harmonia Desktop - Progress Log

## Právě dokončeno
- [x] Fáze 0: Git branch + AI infrastruktura setup
- [x] Fáze 1: Electron skeleton (main/preload)
- [x] Fáze 2: Audio engine refaktoring
- [x] Fáze 3: Sample Library Manager
- [x] Fáze 4: UI úpravy pro desktop
- [x] Fáze 6: Build + packaging + testování
- [x] Integrace lokálních SF2 soundfontů přes WASM (read-wasm-sf2)
- [x] Oprava chování sustain pedálu a zprovoznění MIDI velocity (přímé spouštění zvuku)
- [x] Vyřešení nízké hlasitosti a citlivosti MIDI kláves (nelineární Velocity Curve, zvýšení gainů a DynamicsCompressorNode na výstupu)
- [x] Oprava konfigurace Vercel deploymentu (vercel.json) a vyřešení chyb při kompilaci webové verze (tsconfig.json, tsconfig.main.json, tsconfig.preload.json, SoundFontEngine.ts)

## Plánované úkoly
(všechny fáze dokončeny)

## Pending Documentation/Commits
- [x] Vyřešen a zdokumentován instalační problém s Electron binárkami na Windows (symlinky a path.txt)
- [x] Commit celé migrační větve `desktop/electron-migration` (skripty, main, preload, config, UI, styles, tsconfigs, ikona, dokumentace)
- [x] Commit integrace SF2 soundfontů (nástrojový selektor, WASM syntetizér)
- [x] Commit opravy hlasitosti a citlivosti MIDI (zprovoznění SF2 soundfontů s opravenou cestou public v dev, oprava SpessaSynth API volání)
- [x] Commit opravy Vercel deploymentu a typových chyb web buildu
