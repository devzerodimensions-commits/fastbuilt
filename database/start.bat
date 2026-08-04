@echo off
REM Start the portable PostgreSQL instance for Fastbuilt (port 5434)
set PGBIN=C:\Users\Admin\Desktop\Virava Chemicals\database\pgsql\bin
cd /d "%~dp0"
"%PGBIN%\pg_ctl.exe" -D "%~dp0data" -o "-p 5434" -l "%~dp0log.txt" start
echo PostgreSQL started on port 5434 (data: %~dp0data)
