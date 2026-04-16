# Aller à la racine du projet
Set-Location "$PSScriptRoot\..\.."

# Activer le bon venv
& ".\env\Scripts\Activate.ps1"

# Aller dans le backend
Set-Location "apps/documentum-core-backend"

# Lancer Django
python manage.py runserver