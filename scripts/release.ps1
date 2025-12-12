# Release script pro Harmonia
# Automaticky vytvori release: commitne zmeny, pushne na GitHub, vytvori tag
# 
# Pouziti:
#   npm run release                    # Pouzije verzi z package.json
#   npm run release -- 0.2.0          # Vlastni verze
#   npm run release -- 0.2.0 "Custom message"

param(
    [string]$version = "",
    [string]$message = ""
)

# Nacist verzi z package.json pokud neni zadana
if ([string]::IsNullOrEmpty($version)) {
    try {
        $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
        $version = $packageJson.version
        if ([string]::IsNullOrEmpty($version)) {
            Write-Host "Chyba: Verze nebyla nalezena v package.json" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "Chyba: Nepodarilo se nacist package.json" -ForegroundColor Red
        exit 1
    }
}

# Vytvorit default message pokud neni zadana
if ([string]::IsNullOrEmpty($message)) {
    $message = "Release version $version"
}

# Zkontrolovat, ze verze ma spravny format (v0.1.0 nebo 0.1.0)
if ($version -match "^v") {
    $version = $version.Substring(1)
}

$tagName = "v$version"

Write-Host ""
Write-Host "Vytvareni release $tagName..." -ForegroundColor Cyan
Write-Host "   Zprava: $message" -ForegroundColor Gray
Write-Host ""

# 1. Zkontrolovat git status
Write-Host "1. Kontroluji git status..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host "   Nalezeny zmeny, commitnu je..." -ForegroundColor Yellow
    git add .
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   Chyba pri git add" -ForegroundColor Red
        exit 1
    }
    
    git commit -m "chore: pripraveno pro release $tagName"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   Chyba pri git commit" -ForegroundColor Red
        exit 1
    }
    Write-Host "   Zmeny commitnuty" -ForegroundColor Green
} else {
    Write-Host "   Zadne zmeny k commitnuti" -ForegroundColor Green
}

# 2. Zjistit aktualni branch
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host ""
Write-Host "2. Pushuji zmeny na GitHub (branch: $currentBranch)..." -ForegroundColor Yellow
git push origin $currentBranch
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Chyba pri pushovani na GitHub" -ForegroundColor Red
    Write-Host "   Zkontroluj, ze mas nastaveny remote a mas opravneni" -ForegroundColor Yellow
    exit 1
}
Write-Host "   Zmeny pushnuty" -ForegroundColor Green

# 3. Zkontrolovat, jestli tag uz existuje
Write-Host ""
Write-Host "3. Kontroluji, jestli tag $tagName uz existuje..." -ForegroundColor Yellow
$existingTag = git tag -l $tagName
if ($existingTag) {
    Write-Host "   Tag $tagName uz existuje!" -ForegroundColor Yellow
    $response = Read-Host "   Chces ho smazat a vytvorit znovu? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        git tag -d $tagName
        git push origin :refs/tags/$tagName
        Write-Host "   Stary tag smazan" -ForegroundColor Green
    } else {
        Write-Host "   Zruseno" -ForegroundColor Red
        exit 1
    }
}

# 4. Vytvorit tag
Write-Host ""
Write-Host "4. Vytvarim tag $tagName..." -ForegroundColor Yellow
git tag -a $tagName -m $message
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Chyba pri vytvareni tagu" -ForegroundColor Red
    exit 1
}
Write-Host "   Tag vytvoren" -ForegroundColor Green

# 5. Pushnout tag
Write-Host ""
Write-Host "5. Pushuji tag na GitHub..." -ForegroundColor Yellow
git push origin $tagName
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Chyba pri pushovani tagu" -ForegroundColor Red
    exit 1
}
Write-Host "   Tag pushnut" -ForegroundColor Green

Write-Host ""
Write-Host "Hotovo! Release $tagName byl vytvoren." -ForegroundColor Green
Write-Host ""
Write-Host "GitHub Actions nyni automaticky vytvori release." -ForegroundColor Cyan
Write-Host "   Zkontroluj za chvili: https://github.com/Bigblue007/InteractivePianoApp/releases" -ForegroundColor Cyan
Write-Host ""
