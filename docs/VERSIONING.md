# Verzování a Release proces

Tento dokument popisuje, jak správně verzovat a vytvářet releases v projektu Harmonia.

## Semantic Versioning

Projekt používá [Semantic Versioning](https://semver.org/lang/cs/) ve formátu `MAJOR.MINOR.PATCH`:

- **MAJOR** (1.0.0) - Breaking changes, nekompatibilní změny API
- **MINOR** (0.1.0) - Nové funkce, zpětně kompatibilní
- **PATCH** (0.0.1) - Opravy bugů, zpětně kompatibilní

Aktuální verze: **0.1.0** (MVP)

## Workflow pro vytvoření release

### Rychlý způsob (doporučeno) - Automatický script

Nejjednodušší způsob je použít automatický release script:

```bash
npm run release
```

Script automaticky:
1. ✅ Zkontroluje git status
2. ✅ Commitne všechny změny (pokud jsou)
3. ✅ Pushne změny na GitHub
4. ✅ Vytvoří tag s verzí z `package.json`
5. ✅ Pushne tag na GitHub

**S vlastní verzí:**
```bash
npm run release -- 0.2.0
```

**S vlastní verzí a zprávou:**
```bash
npm run release -- 0.2.0 "Release version 0.2.0 - Nové funkce"
```

### Ruční způsob (pokud potřebuješ více kontroly)

#### 1. Aktualizace verze

Před vytvořením release aktualizujte verzi v `package.json`:

```json
{
  "version": "0.2.0"  // nebo 0.1.1, 0.3.0, atd.
}
```

#### 2. Aktualizace CHANGELOG.md

Přesuňte změny z sekce `[Unreleased]` do nové sekce s verzí:

```markdown
## [0.2.0] - 2025-12-15

### Přidáno
- Nová funkce X
- Nová funkce Y

### Změněno
- Vylepšení funkce Z

### Opraveno
- Oprava bugu A
```

#### 3. Commit změn

```bash
git add package.json docs/CHANGELOG.md
git commit -m "chore: bump version to 0.2.0"
```

#### 4. Vytvoření tagu

```bash
git tag -a v0.2.0 -m "Release version 0.2.0"
```

#### 5. Push do GitHubu

```bash
git push origin main
git push origin v0.2.0
```

### GitHub Release (automatický)

Po pushnutí tagu se automaticky spustí GitHub Actions workflow, který:
- Vytvoří build aplikace
- Vytvoří GitHub Release s poznámkami
- Přiloží build artifacts

Release bude dostupný na: `https://github.com/Bigblue007/InteractivePianoApp/releases`

## Formát commit messages

Pro lepší sledovatelnost změn používejte konvenční formát commit messages:

```
<typ>: <stručný popis>

<detailnější popis, pokud je potřeba>
```

### Typy commitů:

- `feat:` - Nová funkce
- `fix:` - Oprava bugu
- `docs:` - Změny v dokumentaci
- `style:` - Formátování, chybějící středníky atd.
- `refactor:` - Refaktoring kódu
- `test:` - Přidání testů
- `chore:` - Údržba (build, dependencies, verzování)

### Příklady:

```bash
feat: přidáno ovládání klávesnicí počítače

- Implementován keyboard mapping pro QWERTY layout
- Přidány event listenery pro keydown/keyup
- Podpora základních kláves A-S-D-F-G-H-J

fix: oprava CSS pro podbarvené černé klávesy

- Odstraněn viditelný stroke u highlighted černých kláves
- Upravena opacity pro lepší zobrazení

docs: aktualizace README s novým HTTPS scriptem
```

## Pravidla pro verzování

### Kdy zvýšit PATCH (0.1.0 → 0.1.1)?
- Opravy bugů
- Opravy bezpečnostních chyb
- Drobné opravy dokumentace

### Kdy zvýšit MINOR (0.1.0 → 0.2.0)?
- Nové funkce (zpětně kompatibilní)
- Vylepšení existujících funkcí
- Nové komponenty nebo služby

### Kdy zvýšit MAJOR (0.9.0 → 1.0.0)?
- Breaking changes v API
- Nekompatibilní změny
- První stabilní verze (MVP → 1.0.0)

## Aktualizace CHANGELOG.md

Při každé změně přidejte záznam do sekce `[Unreleased]`:

```markdown
## [Unreleased]

### Přidáno
- Nová funkce X

### Opraveno
- Oprava bugu Y
```

Před release přesuňte změny do sekce s verzí a datem.

## GitHub Releases

GitHub Releases jsou vytvářeny automaticky při pushnutí tagu. Můžete je také vytvořit ručně:

1. Jděte na GitHub → Releases → "Draft a new release"
2. Vyberte tag (např. `v0.2.0`)
3. Název: `v0.2.0 - Release Name`
4. Popis: Zkopírujte relevantní sekci z CHANGELOG.md
5. Publikujte

---

*Dokument vytvořen: 11. 12. 2025*

