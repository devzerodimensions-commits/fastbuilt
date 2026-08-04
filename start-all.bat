@echo off
REM ===== Fastbuilt: start database + API + frontend =====
echo Starting Fastbuilt PostgreSQL (port 5434)...
call "%~dp0database\start.bat"
timeout /t 3 >nul

echo Starting API server (port 4000)...
start "Fastbuilt API" cmd /k "cd /d %~dp0server && npm start"

echo Starting frontend (Vite, port 5192)...
start "Fastbuilt Web" cmd /k "cd /d %~dp0web && npm run dev -- --port 5192"

echo.
echo Fastbuilt is starting:
echo   Website : http://localhost:5192
echo   API     : http://localhost:4000/api/projects
echo   Database: PostgreSQL on 127.0.0.1:5434
