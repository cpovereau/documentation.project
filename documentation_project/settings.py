# settings.py

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

ALLOWED_HOSTS = [
    'localhost',       # Permet les connexions locales
    '127.0.0.1',       # Permet les connexions locales par IP
]

# Création du dossier logs s'il n'existe pas
LOG_DIR = os.path.join(BASE_DIR, 'logs')
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{asctime} {levelname} {message} {pathname} {lineno} {funcName} {threadName}',
            'style': '{',
        },
        'error': {
            'format': '{asctime} {levelname} {message} {pathname} {lineno}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': os.path.join(LOG_DIR, 'connections.log'),
            'formatter': 'verbose',
        },
        'error_file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': os.path.join(LOG_DIR, 'errors.log'),
            'formatter': 'error',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'error_file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
