@echo off
chcp 65001 >nul
setlocal
title Creation du raccourci Bureau - app-gestion

cd /d "%~dp0"

set "PROJECT_DIR=%~dp0"
set "TARGET=%~dp0Lancer-agent.bat"
set "SHORTCUT_NAME=Agent app-gestion.lnk"

if not exist "%TARGET%" (
    echo [ERREUR] Lancer-agent.bat est introuvable dans ce dossier.
    echo.
    pause
    exit /b 1
)

echo Creation du raccourci sur le Bureau...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$desktop = [Environment]::GetFolderPath('Desktop'); $link = Join-Path $desktop $env:SHORTCUT_NAME; $shell = New-Object -ComObject WScript.Shell; $sc = $shell.CreateShortcut($link); $sc.TargetPath = $env:TARGET; $sc.WorkingDirectory = $env:PROJECT_DIR; $sc.Description = 'Relancer l agent dans le dossier app-gestion'; $sc.Save(); if (Test-Path $link) { Write-Host ''; Write-Host ('OK - raccourci cree : ' + $link) } else { Write-Host 'ECHEC - le raccourci n a pas pu etre cree'; exit 1 }"

if errorlevel 1 (
    echo.
    echo Echec de la creation automatique.
    echo Solution manuelle :
    echo   clic droit sur Lancer-agent.bat ^> Creer un raccourci
    echo   puis deplacer le raccourci obtenu sur le Bureau.
)

echo.
pause
endlocal
