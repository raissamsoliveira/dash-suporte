@echo off
cd /d "%~dp0"
echo Inicializando git...
git init
git add .
git commit -m "feat: dashboard de suporte Sendflow"
git remote add origin https://github.com/raissamsoliveira/dash-suporte.git
git branch -M main
git push -u origin main
echo.
echo Pronto! Pressione qualquer tecla para fechar.
pause
