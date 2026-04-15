@echo off

echo Documentation : > structure_projet.txt
dir /B documentation >> structure_projet.txt
echo. >> structure_projet.txt

echo Documentation_projet : >> structure_projet.txt
dir /B documentation_projet >> structure_projet.txt
echo. >> structure_projet.txt

echo Documentation_frontend (public) : >> structure_projet.txt
dir /B documentation_frontend\public >> structure_projet.txt
echo. >> structure_projet.txt

echo Documentation_frontend (src) : >> structure_projet.txt
dir /B documentation_frontend\src >> structure_projet.txt
echo. >> structure_projet.txt

echo Env : >> structure_projet.txt
dir /B env >> structure_projet.txt
echo. >> structure_projet.txt

echo Arborescence sauvegardée dans structure_projet.txt
pause
