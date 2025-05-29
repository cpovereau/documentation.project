# Chemin de base du projet et clé secrète
import os
from pathlib import Path
from decouple import config

ENVIRONMENT = os.getenv('ENVIRONMENT', 'local')
BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = config('SECRET_KEY', default='unsafe-default-key')
# SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'default-insecure-secret-key')

# Applications installées
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',  
    'corsheaders',
    'documentation',
]

# Configuration des middlewares
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
]

# Définit la racine des URLs
ROOT_URLCONF = 'documentation_project.urls'

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
                'django.template.context_processors.i18n',
                'django.template.context_processors.static',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Configuration de la base de données
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB', 'documentationocealia'),
        'USER': os.getenv('POSTGRES_USER', 'gitadmin'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'Ocealia31520'),
        #'HOST': 'db' if is_docker else 'localhost',
        'HOST': 'localhost' if ENVIRONMENT == 'local' else os.getenv('DATABASE_HOST', 'db'),
        'PORT': os.getenv('POSTGRES_PORT', '5432'),
        'OPTIONS': {
            'options': '-c client_encoding=UTF8'
        },
    }
}

# Configuration Django REST Framework pour l'authentification
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',  # Utilisation des jetons
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',  # Limite l'accès aux utilisateurs authentifiés
    ],
}

# Clé primaire automatique et URL statique
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
STATIC_URL = '/static/'

# Hôtes autorisés
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'ngrok-free.app', 'b9e3-2a01-cb19-8a9c-8600-1059-1453-619f-48ad.ngrok-free.app']

# Configuration CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Mode debug
DEBUG = False

# Paramètres régionaux
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Europe/Paris'
USE_I18N = True
USE_TZ = True
