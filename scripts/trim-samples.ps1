# Script pro ořezání piano samplů na optimální délku
# Level1/Level2 samply: 1 sekunda (0.5s attack + 0.5s sustain pro loopování)
# RT samply: 1 sekunda

$ErrorActionPreference = "Continue"

$samplesDir = Join-Path $PSScriptRoot "..\public\samples\piano-acoustic"
$backupDir = Join-Path $samplesDir "backup"

Write-Host "Ořezávání samplů v: $samplesDir" -ForegroundColor Cyan

# Zkontrolovat, zda FFmpeg je dostupný
$ffmpegPath = Get-Command ffmpeg -ErrorAction SilentlyContinue
if (-not $ffmpegPath) {
    Write-Host "CHYBA: FFmpeg není nainstalován nebo není v PATH" -ForegroundColor Red
    Write-Host "Stáhněte FFmpeg z: https://ffmpeg.org/download.html" -ForegroundColor Yellow
    exit 1
}

# Vytvořit backup adresář
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
    Write-Host "Vytvořen backup adresář: $backupDir" -ForegroundColor Green
}

# Zálohovat původní samply
Write-Host "`nZálohování původních samplů..." -ForegroundColor Yellow
Get-ChildItem "$samplesDir\*.mp3" | ForEach-Object {
    $backupPath = Join-Path $backupDir $_.Name
    if (-not (Test-Path $backupPath)) {
        Copy-Item $_.FullName $backupPath
    }
}
Write-Host "Záloha dokončena" -ForegroundColor Green

# Ořezat Level1/Level2 samply na 1 sekundu (0.5s attack + 0.5s sustain pro loopování)
Write-Host "`nOřezávání Level1/Level2 samplů na 1 sekundu (0.5s attack + 0.5s sustain)..." -ForegroundColor Yellow
$levelSamples = Get-ChildItem "$samplesDir\*.mp3" | Where-Object { 
    ($_.Name -like "*Level1*" -or $_.Name -like "*Level2*") -and
    $_.Name -notlike "*RT*" -and
    $_.Name -notlike "*Pedal*" -and
    $_.Name -notlike "*Pads*"
}

$trimmedCount = 0
foreach ($sample in $levelSamples) {
    $tempFile = $sample.FullName -replace '\.mp3$', '_temp.mp3'
    
    try {
        # Zkontrolovat, zda soubor existuje a není prázdný
        if (-not (Test-Path $sample.FullName)) {
            Write-Host "  [SKIP] Přeskočeno: $($sample.Name) - soubor neexistuje" -ForegroundColor Yellow
            continue
        }
        
        $originalSize = (Get-Item $sample.FullName).Length
        if ($originalSize -eq 0) {
            Write-Host "  [SKIP] Přeskočeno: $($sample.Name) - soubor je prázdný" -ForegroundColor Yellow
            continue
        }
        
        # Ořezat na 1 sekundu (0.5s attack + 0.5s sustain pro loopování)
        $ffmpegOutput = & ffmpeg -i $sample.FullName -t 1.0 -c:a libmp3lame -q:a 2 -y $tempFile 2>&1
        $exitCode = $LASTEXITCODE
        
        if ($exitCode -eq 0 -and (Test-Path $tempFile)) {
            # Zkontrolovat, zda soubor není prázdný
            $fileInfo = Get-Item $tempFile
            if ($fileInfo.Length -gt 0) {
                Move-Item -Force $tempFile $sample.FullName
                $trimmedCount++
                Write-Host "  [OK] $($sample.Name)" -ForegroundColor Green
            } else {
                Remove-Item $tempFile -ErrorAction SilentlyContinue
                Write-Host "  [ERROR] $($sample.Name) - výstupní soubor je prázdný" -ForegroundColor Red
            }
        } else {
            if (Test-Path $tempFile) {
                Remove-Item $tempFile -ErrorAction SilentlyContinue
            }
            $errorMsg = ($ffmpegOutput | Where-Object { $_ -match "error|Error|ERROR" }) -join "; "
            if ($errorMsg) {
                Write-Host "  [ERROR] Chyba při ořezávání $($sample.Name): $errorMsg" -ForegroundColor Red
            } else {
                Write-Host "  [ERROR] Chyba při ořezávání $($sample.Name) (exit code: $exitCode)" -ForegroundColor Red
            }
        }
    } catch {
        Write-Host "  [ERROR] Chyba při ořezávání $($sample.Name): $_" -ForegroundColor Red
        if (Test-Path $tempFile) {
            Remove-Item $tempFile -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "Ořezáno $trimmedCount Level1/Level2 samplů" -ForegroundColor Green

# Ořezat RT samply na 1 sekundu
Write-Host "`nOřezávání RT samplů na 1 sekundu..." -ForegroundColor Yellow
$rtSamples = Get-ChildItem "$samplesDir\*.mp3" | Where-Object { 
    $_.Name -like "*RT*" -and
    $_.Name -notlike "*Pedal*" -and
    $_.Name -notlike "*Pads*"
}

$rtTrimmedCount = 0
foreach ($sample in $rtSamples) {
    $tempFile = $sample.FullName -replace '\.mp3$', '_temp.mp3'
    
    try {
        # Zkontrolovat, zda soubor existuje a není prázdný
        if (-not (Test-Path $sample.FullName)) {
            Write-Host "  [SKIP] Přeskočeno: $($sample.Name) - soubor neexistuje" -ForegroundColor Yellow
            continue
        }
        
        $originalSize = (Get-Item $sample.FullName).Length
        if ($originalSize -eq 0) {
            Write-Host "  [SKIP] Přeskočeno: $($sample.Name) - soubor je prázdný" -ForegroundColor Yellow
            continue
        }
        
        # Ořezat na 1 sekundu
        $ffmpegOutput = & ffmpeg -i $sample.FullName -t 1.0 -c:a libmp3lame -q:a 2 -y $tempFile 2>&1
        $exitCode = $LASTEXITCODE
        
        if ($exitCode -eq 0 -and (Test-Path $tempFile)) {
            # Zkontrolovat, zda soubor není prázdný
            $fileInfo = Get-Item $tempFile
            if ($fileInfo.Length -gt 0) {
                Move-Item -Force $tempFile $sample.FullName
                $rtTrimmedCount++
                Write-Host "  [OK] $($sample.Name)" -ForegroundColor Green
            } else {
                Remove-Item $tempFile -ErrorAction SilentlyContinue
                Write-Host "  [ERROR] $($sample.Name) - výstupní soubor je prázdný" -ForegroundColor Red
            }
        } else {
            if (Test-Path $tempFile) {
                Remove-Item $tempFile -ErrorAction SilentlyContinue
            }
            $errorMsg = ($ffmpegOutput | Where-Object { $_ -match "error|Error|ERROR" }) -join "; "
            if ($errorMsg) {
                Write-Host "  [ERROR] Chyba při ořezávání $($sample.Name): $errorMsg" -ForegroundColor Red
            } else {
                Write-Host "  [ERROR] Chyba při ořezávání $($sample.Name) (exit code: $exitCode)" -ForegroundColor Red
            }
        }
    } catch {
        Write-Host "  [ERROR] Chyba při ořezávání $($sample.Name): $_" -ForegroundColor Red
        if (Test-Path $tempFile) {
            Remove-Item $tempFile -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "Ořezáno $rtTrimmedCount RT samplů" -ForegroundColor Green

Write-Host "`nHotovo! Celkem ořezáno $($trimmedCount + $rtTrimmedCount) samplů" -ForegroundColor Cyan
Write-Host "Původní samply jsou zálohované v: $backupDir" -ForegroundColor Yellow

