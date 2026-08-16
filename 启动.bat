@echo off
chcp 65001 >nul
title 爱宝的太阳系之旅
echo 正在打开《爱宝的太阳系之旅》...
start "" "%~dp0index.html"
echo 已在默认浏览器中打开！如果没反应，请手动双击 index.html
timeout /t 3 >nul
