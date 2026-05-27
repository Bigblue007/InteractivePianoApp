# Návod na publikaci aplikace Harmonia

Tento dokument popisuje různé možnosti publikace aplikace Harmonia na web.

## Možnosti publikace

### 1. GitHub Pages (Zdarma, jednoduché)

**Výhody:**
- ✅ Zdarma
- ✅ Automatické deployment z GitHubu
- ✅ HTTPS podpora
- ✅ Vlastní doména (volitelně)

**Nevýhody:**
- ⚠️ Statické soubory (není server-side rendering)
- ⚠️ Omezení na 1 GB velikost repozitáře
- ⚠️ Vyžaduje aktivaci GitHub Pages v nastavení repozitáře

**Poznámka:** GitHub Pages není aktivní v tomto repozitáři. Pokud ho chceš použít, musíš ho aktivovat v Settings → Pages.

---

### 2. Vercel (Doporučeno - zdarma, velmi jednoduché)

**Výhody:**
- ✅ Zdarma pro osobní projekty
- ✅ Automatické deployment z GitHubu
- ✅ HTTPS podpora
- ✅ Vlastní doména (volitelně)
- ✅ CDN pro rychlé načítání
- ✅ Automatické optimalizace

**Nevýhody:**
- ⚠️ Omezení na 100 GB bandwidth/měsíc (zdarma)

**Postup:**
1. Přihlásit se na [vercel.com](https://vercel.com)
2. Importovat GitHub repozitář
3. Vercel automaticky detekuje Vite a nastaví build
4. Aplikace bude dostupná na `https://[project-name].vercel.app`

---

### 3. Netlify (Zdarma, jednoduché)

**Výhody:**
- ✅ Zdarma pro osobní projekty
- ✅ Automatické deployment z GitHubu
- ✅ HTTPS podpora
- ✅ Vlastní doména (volitelně)
- ✅ CDN

**Nevýhody:**
- ⚠️ Omezení na 100 GB bandwidth/měsíc (zdarma)

**Postup:**
1. Přihlásit se na [netlify.com](https://netlify.com)
2. Importovat GitHub repozitář
3. Nastavit build command: `npm run build:web`
4. Nastavit publish directory: `dist`
5. Aplikace bude dostupná na `https://[project-name].netlify.app`

---

### 4. Vlastní server

**Výhody:**
- ✅ Plná kontrola
- ✅ Žádná omezení

**Nevýhody:**
- ⚠️ Vyžaduje vlastní server
- ⚠️ Nutnost konfigurace web serveru (Nginx, Apache)
- ⚠️ Nutnost SSL certifikátu pro HTTPS (Let's Encrypt)

**Postup:**
1. Build aplikace: `npm run build:web`
2. Nahrát obsah složky `dist` na server
3. Nakonfigurovat web server (Nginx/Apache)
4. Nastavit SSL certifikát

---

## GitHub Pages (pokud ho chceš použít)

**Poznámka:** GitHub Pages není aktivní v tomto repozitáři. Pokud ho chceš použít, musíš ho aktivovat v Settings → Pages.

### Krok 1: Vytvořit GitHub Actions workflow

Vytvořit soubor `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build:web
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Krok 2: Upravit vite.config.ts pro GitHub Pages

Pokud bude aplikace na `https://[username].github.io/InteractivePianoApp/`, je potřeba nastavit `base`:

```typescript
export default defineConfig({
  base: '/InteractivePianoApp/', // Název repozitáře
  // ... zbytek konfigurace
})
```

### Krok 3: Aktivovat GitHub Pages

1. Jít do Settings → Pages v repozitáři
2. Source: GitHub Actions
3. Save

### Krok 4: Deployment

Po pushnutí do `main` branch se automaticky spustí workflow a aplikace bude dostupná na:
`https://[username].github.io/InteractivePianoApp/`

**Poznámka:** Workflow pro GitHub Pages byl odstraněn z tohoto repozitáře, protože GitHub Pages není aktivní.

---

## Doporučený postup: Vercel (nejjednodušší)

### Krok 1: Přihlásit se na Vercel

1. Jít na [vercel.com](https://vercel.com)
2. Přihlásit se pomocí GitHub účtu

### Krok 2: Importovat projekt

1. Kliknout na "Add New" → "Project"
2. Vybrat repozitář `InteractivePianoApp`
3. Vercel automaticky detekuje Vite a nastaví:
   - Framework Preset: Vite
   - Build Command: `npm run build:web`
   - Output Directory: `dist`
4. Kliknout na "Deploy"

### Krok 3: Hotovo!

Aplikace bude dostupná na `https://[project-name].vercel.app`

Vercel automaticky nasadí novou verzi při každém pushnutí do `main` branch.

---

## Kontrola před publikací

### 1. Build aplikace lokálně

```bash
npm run build:web
```

Zkontrolovat, že build proběhl bez chyb a složka `dist` obsahuje všechny soubory.

### 2. Testování produkčního buildu

```bash
npm run preview
```

Otevřít `http://localhost:4173` a otestovat všechny funkce.

### 3. Zkontrolovat velikost buildu

```bash
du -sh dist/
```

Velké soubory (např. audio samply) mohou zpomalit načítání. Zvážit optimalizaci.

### 4. Zkontrolovat konzoli prohlížeče

V produkčním buildu by neměly být žádné chyby v konzoli.

---

## Optimalizace pro produkci

### 1. Komprese obrázků a audio

Zkontrolovat velikost souborů v `public/samples/` a případně je zkomprimovat.

### 2. Code splitting

Vite automaticky rozděluje kód do chunků. Pro větší optimalizaci lze použít manual chunks.

### 3. Lazy loading

Komponenty, které se načítají později, lze načítat lazy:

```typescript
const SongLibrary = lazy(() => import('./components/SongLibrary/SongLibrary'));
```

### 4. Environment variables

Pro produkci lze použít environment variables pro různé konfigurace:

```typescript
// .env.production
VITE_API_URL=https://api.example.com
```

---

## Troubleshooting

### Problém: Aplikace se nenačte na GitHub Pages

**Řešení:**
- Zkontrolovat, že `base` v `vite.config.ts` odpovídá názvu repozitáře
- Zkontrolovat, že workflow proběhl úspěšně
- Zkontrolovat konzoli prohlížeče pro chyby

### Problém: Audio samply se nenačítají

**Řešení:**
- Zkontrolovat, že soubory jsou v `public/samples/`
- Zkontrolovat, že cesty k souborům jsou správné (relativní cesty)
- Zkontrolovat CORS nastavení (pokud jsou samply na jiném serveru)

### Problém: MIDI API nefunguje

**Řešení:**
- MIDI API vyžaduje HTTPS v produkci
- Zkontrolovat, že aplikace běží přes HTTPS
- Zkontrolovat, že prohlížeč podporuje Web MIDI API

---

## Doporučení

Pro rychlý start doporučuji **Vercel** - je to nejjednodušší a nejrychlejší způsob publikace.

Pro dlouhodobé řešení s plnou kontrolou doporučuji **GitHub Pages** s automatickým deployment workflow.

---

## Distribuce desktopové verze (Harmonia Desktop)

Desktopová verze se distribuuje jako samostatný spustitelný soubor pro Windows a Linux a je založena na technologii **Electron**. K sestavení a balení se používá `electron-builder` ve spojení s `electron-vite`.

### Sestavení a lokální spuštění

Pro vývoj a testování lokální desktopové verze použijte:

```bash
# Spuštění vývojového prostředí Electronu s HMR (Hot Module Replacement)
npm run dev
```

Pro standardní otestování produkčního sestavení:

```bash
# Sestavení aplikace (výstupy v /out)
npm run build
```

### Balení a distribuce (Packaging)

Pro vytvoření instalátorů pro koncové uživatele slouží následující příkazy:

#### 1. Windows (Primární cílová platforma)
Pro Windows se generuje instalátor typu **NSIS** (.exe).

```bash
# Vytvoření instalátoru pro Windows (výstup v /release)
npm run package:win
```

> [!WARNING]
> **Chyba symbolických odkazů (Symbolic Links Error):**
> Při balení na Windows může dojít k chybě `ERROR: Cannot create symbolic link` (Klient není držitelem požadovaného oprávnění) při rozbalování pomocných balíčků jako `winCodeSign`. K tomu dochází, protože Windows standardně nepovoluje vytváření symbolických odkazů bez administrátorských práv.
>
> **Možná řešení:**
> 1. **Zapnout Vývojářský režim (Developer Mode):** Jděte do *Nastavení systému* -> *Systém* -> *Pro vývojáře* (Settings -> System -> For developers) a zapněte *Vývojářský režim* (Developer Mode). To umožní vytváření symbolických odkazů běžným uživatelům.
> 2. **Spustit jako administrátor:** Spusťte terminál (PowerShell/CMD) nebo VS Code jako Administrátor a poté spusťte `npm run package:win`.

*Výsledek:* V adresáři `release/` vznikne soubor `Harmonia Desktop Setup [verze].exe`. Uživatel jej spustí a nainstaluje aplikaci, která automaticky vytvoří zástupce na ploše a umožní zvolit instalační adresář.

#### 2. Linux (Sekundární cílová platforma)
Pro Linux se generuje balíček typu **AppImage**, který je spustitelný na většině distribucí bez instalace.

```bash
# Vytvoření balíčku pro Linux (výstup v /release)
npm run package:linux
```

*Výsledek:* V adresáři `release/` vznikne soubor `.AppImage`, který stačí označit jako spustitelný a spustit.

### Architektura distribuce prostředků (Assets)

Vzhledem k tomu, že desktopová verze používá velké zvukové soubory (samply a soundfonty), jsou tyto prostředky při balení odděleny od hlavního kódu aplikace:

- **extraResources:** `electron-builder` kopíruje složky `public/samples/` a `public/soundfonts/` přímo do složky `resources/` v instalátoru (mimo hlavní asar archiv).
- **Lokální přístup:** Aplikace v desktopovém režimu tyto soubory nečte přes HTTP fetch, ale přímo z disku přes Node.js `fs` most (vystavený v preload scriptu). To zaručuje nulovou síťovou latenci a fungování kompletně offline.


