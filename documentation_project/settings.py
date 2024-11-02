import os
from pathlib import Path

# Chemin de base du projet
BASE_DIR = Path(__file__).resolve().parent.parent

# Applications installées
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'documentation',  # Votre application principale
]

# Middlewares requis
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Configuration des templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Configuration de la base de données
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',  # Moteur pour PostgreSQL
        'NAME': os.getenv('POSTGRES_DB', 'documentationocealia'),  # Nom de la base de données
        'USER': os.getenv('POSTGRES_USER', 'gitadmin'),           # Utilisateur PostgreSQL
        'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'Ocealia31520'),  # Mot de passe de l'utilisateur
        'HOST': os.getenv('POSTGRES_HOST', 'localhost'),          # Hôte PostgreSQL (ex: localhost)
        'PORT': os.getenv('POSTGRES_PORT', '5432'),               # Port PostgreSQL par défaut
    }
}

# Clé primaire automatique par défaut
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Configurations statiques
STATIC_URL = '/static/'

# Définissez ALLOWED_HOSTS pour la production
ALLOWED_HOSTS = ['localhost', '127.0.0.1']  # À adapter pour le déploiement

# Autres configurations utiles
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Europe/Paris'
USE_I18N = True
USE_TZ = True
