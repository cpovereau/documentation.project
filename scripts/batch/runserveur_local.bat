@echo off
set ENVIRONMENT=local
cd /d "%~dp0..\..\apps\documentum-core-backend"
python manage.py runserver