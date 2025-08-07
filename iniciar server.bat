@echo off
cd /d %~dp0
echo Iniciando servidor Node.js...
start /B node server.js
timeout /t 2 >nul
start http://localhost:3000