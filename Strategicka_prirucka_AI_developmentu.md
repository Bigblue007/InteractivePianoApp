# Strategická příručka pro AI-driven vývoj a správu projektů

Tento dokument slouží jako univerzální metodický manuál pro efektivní vývoj softwaru za podpory pokročilých AI agentů a LLM modelů (v prostředích jako Antigravity, Cursor, Project IDX či VS Code). Cílem této metodiky je maximalizovat efektivitu kontextového okna, eliminovat halucinace modelů a zajistit profesionální správu kódu od prvního dne vývoje.

---

## 1. Fáze Discovery: Technologický audit a hardware

Před vygenerováním prvního řádku kódu je kritické provést s AI agentem úvodní konzultaci. Tento krok zabrání tomu, aby se AI zabetonovala v pravidlech pro technologie, které nemusí být pro projekt optimální.

* **Konzultace technického stacku:** AI agentovi předložte high-level vision, klíčové funkce a cíle aplikace. Nechte si doporučit optimální frameworky, databáze a knihovny.
* **Lokalizovaný hardwarový kontext:** Pokud vyvíjíte nebo hostujete aplikace lokálně, explicitně agentovi definujte parametry svého prostředí (např. procesor, kapacita RAM, rychlost SSD). AI pak dokáže přizpůsobit konfigurace, Docker soubory či alokaci paměti vašemu hardwaru na míru.

---

## 2. Standardizace AI Infrastruktury (.md soubory)

Pro udržení dlouhodobé konzistence složitých projektů je nutné v kořenovém adresáři vytvořit sadu specializovaných Markdown souborů. Ty fungují jako externí paměť a mantinely pro AI agenta, což dramaticky snižuje chybovost a šetří kapacitu jeho aktivní paměti (kontextového okna).

| Soubor | Hlavní účel | Klíčový obsah a instrukce pro AI |
| :--- | :--- | :--- |
| **CLAUDE.md** | Globální kotva kontextu | Univerzální rozcestník pro jakéhokoli agenta. Obsahuje pouze přímé reference na ostatní konfigurační soubory (např. `@AGENTS.md`, `@ARCHITECTURE.md`) a definuje, že tento soubor je primárním bodem pro načtení kontextu projektu. |
| **AGENTS.md** | Pravidla, standardy a workflow | Definuje striktní kódovací standardy, verze frameworků a restrikce. Obsahuje příkaz, aby si AI před psaním kódu ověřovala API přímo v lokálních souborech projektu (např. v `node_modules`). Definuje Post-Task Workflow a textové zkratky. |
| **ARCHITECTURE.md** | Strukturální mapa projektu | Stručný, ale vysoce přesný popis souborové struktury. Určuje, kde končí frontend, kde začíná backend, kde je uložena byznys logika, stav aplikace a API routy. Zabraňuje tomu, aby AI prohledávala desítky souborů a hledala správné umístění komponenty. |
| **PROGRESS.md** | Log stavu vývoje a fronta | Dynamický seznam rozdělený na sekce "Právě dokončeno" a "Plánované úkoly". Slouží jako aktivní fronta práce. Pokud uživatel odloží dokumentaci či commit na později, AI si zde udržuje seznam nevyřízených administrativních kroků. |

---

## 3. Model Context Protocol (MCP) a integrace GitHubu

Pro pokročilý vývoj je klíčové, aby AI agent nebyl pouze pasivním generátorem textu, ale měl přímé, zabezpečené propojení s vaším vývojovým prostředím a repozitářem.

* **Využití GitHub MCP:** V projektech se povinně využívá Model Context Protocol (MCP) pro GitHub. Tento protokol umožňuje AI agentovi přímo interagovat s repozitářem – číst issues, spravovat pull requesty, kontrolovat stav větví a synchronizovat kód na základě konverzace.
* **Snížení režie:** Propojení přes MCP odstraňuje nutnost neustálého ručního kopírování chybových hlášení nebo výpisů z terminálu do chatu. Agent získává nativní schopnost pracovat jako plnohodnotný autonomní parťák.

---

## 4. Workflow, Textové zkratky (Shortcuts) and "Definition of Done"

Opakující se administrativní režie (vypisování požadavků na commity a úpravy dokumentace) se eliminuje zavedením pevných pravidel chování přímo do `AGENTS.md`.

### Post-Task Workflow (Definition of Done)

Po každém úspěšně vyřešeném programátorském úkolu nebo významné změně kódu musí AI agent provést následující kroky:

1.  Zeptej se uživatele, zda si přeje aktualizovat soubory dokumentace (`PROGRESS.md`, `README.md`, `ARCHITECTURE.md`).
2.  Navrhni srozumitelnou zprávu pro commit podle standardu Conventional Commits.
3.  **Striktní pravidlo:** Nikdy neprováděj `git push` (ani přes MCP, ani přes skripty) bez explicitního a samostatného potvrzení od uživatele.
4.  Pokud uživatel odpoví "later" nebo "později", poznamenej si tyto změny do `PROGRESS.md` jako "Pending documentation/commit" a připomeň je na konci session.

### Textové zkratky pro ovládání agenta

Pro maximální urychlení komunikace v chatu reaguje AI na tyto standardizované povely:

* `done`: Spustí kompletní dokumentační kolečko (update md souborů), navrhne commit a po schválení pushne změny na GitHub přes MCP.
* `checkpoint`: Provede pouze aktualizaci `PROGRESS.md` a `ARCHITECTURE.md`, ale nevytváří commit (vhodné pro rozpracovanou práci).
* `sync`: Provede okamžitou synchronizaci stavu lokálního prostředí s GitHub repozitářem za využití MCP nástrojů.

---

## 5. Správa verzí a sémantické verzování

I u čistě osobních projektů tvoří správa verzí základní záchrannou síť vývojáře. Historie repozitáře musí zůstat čistá a srozumitelná pro lidi i automatizační nástroje.

### Conventional Commits

Zprávy ke commitům musí striktně dodržovat formát `<typ>(volitelný rozsah): stručný popis v angličtině nebo češtině`. Používají se tyto typy:

* `feat`: Přidání nové funkce pro koncového uživatele (např. přihlašování, nová herní mechanika).
* `fix`: Oprava chyby v kódu aplikace.
* `docs`: Změny výhradně v dokumentaci (úpravy .md souborů).
* `chore`: Údržbové práce, které nemění kód ani vzhled (aktualizace knihoven v `package.json`, nastavení IDE).
* `UI / style`: Změny designu, stylů, barev nebo formátování bez vlivu na logiku aplikace.
* `refactor`: Úprava kódu za účelem zvýšení čitelnosti a čistoty, která nemění chování aplikace.

### Sémantické verzování (SemVer)

Skutečné verze aplikace se netvoří každým commitem, ale jsou definovány pomocí **Git Tagů** (značek) ve formátu `X.Y.Z` (např. `v1.4.2`). Verze se navyšují podle schématu:

* **MAJOR (X):** Zásadní strukturální změny, které nejsou zpětně kompatibilní.
* **MINOR (Y):** Přidání nové kompatibilní funkce (typicky po dokončení logického celku označeného jako `feat`).
* **PATCH (Z):** Opravy chyb, vizuální ladění a údržba (po commitech typu `fix` či `chore`).

### Správa souboru CHANGELOG.md

Soubor `CHANGELOG.md` mapuje historii vydání pro uživatele. Pro jeho správu je nejvhodnější využít kombinaci technických tagů a generování obsahu pomocí AI agenta. Na rozdíl od automatických skriptů, které vygenerují strohý seznam názvů commitů, dokáže AI dodat lidský kontext, rozdělit změny na "Nové funkce" a "Opravy" a srozumitelně popsat skutečný přínos provedených úprav.

---

## 6. Univerzální Initial Project Setup Prompt

Následující prompt zkopírujte a vložte do nového čistého chatu s AI agentem při zahájení jakéhokoli nového projektu. Prompt donutí agenta respektovat správnou posloupnost kroků (Stack -> Pravidla -> Kód).

```text
"Ahoj! Chci začít nový softwarový projekt s názvem [DOPLŇ NÁZEV]. Tvým úkolem je navést mě na správný start a nastavit naši 'AI infrastrukturu' pro maximální efektivitu a konzistenci.

Krok 1: Analýza a potvrzení Stacku
Nejdříve se mnou krátce prober nejvhodnější technologický stack. Moje základní požadavky, vize a hardwarová omezení jsou:
- Cíl a funkce projektu: [DOPLŇ CO STAVÍŠ]
- Lokální hardware / specifikace prostředí: [DOPLŇ hardwarové parametry, např. Ryzen 7 9700X]
- Jaký základní technologický stack navrhuješ a proč? Jsou v něm nějaká specifika, na která si musíme dát pozor?

Krok 2: Vytvoření AI Infrastruktury (provedeme AŽ PO shodě na Kroku 1)
Jakmile si potvrdíme stack, tvým úkolem bude vytvořit v kořenovém adresáři tyto konfigurační soubory:
1. CLAUDE.md: Hlavní kotva kontextu s referencemi na @AGENTS.md a @ARCHITECTURE.md.
2. AGENTS.md: Technické standardy zvoleného stacku, pravidlo pro ověřování API lokálně (např. v node_modules), definice Post-Task Workflow (Definition of Done) a zkratek 'done', 'checkpoint' a 'sync'.
3. ARCHITECTURE.md: Stručná a přehledná mapa struktury složek a klíčových integračních bodů aplikace.
4. PROGRESS.md: Log pro sledování postupu s frontou pro čekající dokumentaci či commity.

Krok 3: Integrace prostředí a Git pravidla
- Při komunikaci s mým repozitářem budeme aktivně využívat GitHub MCP pro přímou správu issues, pull requestů a větví.
- Všechny zprávy ke commitům budou striktně dodržovat standard Conventional Commits (feat:, fix:, chore:, docs:, UI/style:).
- Nikdy neprováděj git push bez mého výslovného a samostatného potvrzení v chatu.

Pojďme na Krok 1: Jaký stack doporučuješ pro mou vizi a jaké architektonické základy položíme?"
```
