@echo off
setlocal
cd /d "%~dp0"
if not exist "Dolphin2.exe" goto missing
if not exist "Dolphin2.pck" goto missing
set "DOLPHIN_LOG=%LOCALAPPDATA%\Dolphin2ShanghaiToon"
if not exist "%DOLPHIN_LOG%" mkdir "%DOLPHIN_LOG%"
"%~dp0Dolphin2.exe" --rendering-method gl_compatibility --log-file "%DOLPHIN_LOG%\runtime.log" %*
if errorlevel 1 (
 echo The game exited with an error. Log: %DOLPHIN_LOG%\runtime.log
 pause
)
exit /b
:missing
echo Extract the complete ZIP first. Dolphin2.exe and Dolphin2.pck must stay together.
pause
