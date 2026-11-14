@echo off
chcp 65001 >nul
setlocal
title Relance de l'agent - app-gestion

rem Le script se place toujours dans son propre dossier,
rem donc il fonctionne aussi via un raccourci sur le Bureau.
cd /d "%~dp0"

echo ============================================
echo   app-gestion - relance de l'agent
echo   Dossier : %CD%
echo ============================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Node.js est introuvable dans le PATH.
    echo Installe-le depuis https://nodejs.org puis relance ce script.
    echo.
    pause
    exit /b 1
)

where freebuff >nul 2>&1
if not errorlevel 1 (
    echo Lancement de freebuff...
    echo.
    freebuff %*
    goto fin
)

where opencode >nul 2>&1
if not errorlevel 1 (
    echo freebuff introuvable : lancement de opencode...
    echo.
    opencode %*
    goto fin
)

echo freebuff et opencode introuvables dans le PATH.
echo Tentative via npx freebuff...
echo.
call npx --yes freebuff %*

:fin
echo.
echo Session terminee.
pause
endlocal
