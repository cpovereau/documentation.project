@echo off
set ENVIRONMENT=docker
cd /d "%~dp0..\..\apps\documentum-core-backend"
python manage.py runserver