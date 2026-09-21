@echo off
title AI Cybersecurity Super-Agent SOC Launcher
echo ============================================================
echo   Starting AI Cybersecurity Incident Response Super-Agent
echo ============================================================

cd /d "%~dp0"

echo [1/3] Checking server dependencies...
if not exist "server\node_modules" (
    echo Installing server dependencies...
    cd server
    call npm install
    cd ..
)

echo [2/3] Checking client dependencies...
if not exist "client\node_modules" (
    echo Installing client dependencies...
    cd client
    call npm install
    cd ..
)

echo [3/3] Launching SOC Backend Server on port 5000...
start "SOC Backend (Super-Agent)" cmd /k "cd /d %~dp0server && npm run dev"

timeout /t 3 /nobreak >nul

echo Launching SOC Frontend Dashboard on port 3000...
start "SOC Frontend (Dashboard)" cmd /k "cd /d %~dp0client && npm run dev"

timeout /t 2 /nobreak >nul

start http://localhost:3000

echo ============================================================
echo   AEGIS SOC Command Center is running!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000/api
echo ============================================================
