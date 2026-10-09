@echo off
title SK AI Gateway Proxy
echo Dang khoi dong AI Gateway Proxy tren port 3001...
cd /d "%~dp0"
node scripts/gateway-proxy.mjs
pause
