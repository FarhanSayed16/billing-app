@echo off
REM ============================================================
REM DANGEROUS: This script removes ALL files from the git index.
REM It is intentionally disabled. Do not re-enable unless you
REM fully understand the impact on your repository.
REM ============================================================
echo.
echo cleanup.bat is DISABLED for safety.
echo It previously ran: git rm -r --cached .
echo.
echo If you really need to refresh gitignore tracking, do it
echo manually and carefully with explicit paths.
echo.
exit /b 1
