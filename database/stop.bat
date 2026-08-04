@echo off
REM Stop the portable PostgreSQL instance for Fastbuilt
set PGBIN=C:\Users\Admin\Desktop\Virava Chemicals\database\pgsql\bin
cd /d "%~dp0"
"%PGBIN%\pg_ctl.exe" -D "%~dp0data" stop
echo PostgreSQL (Fastbuilt) stopped.
