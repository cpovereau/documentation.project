# documentation.project
+
+Ce dépôt contient deux parties principales :
+
+- **Backend Django**
+  - `documentation` : application Django regroupant modèles, vues et API.
+  - `documentation_project` : projet Django avec les paramètres et la configuration.
+- **Frontend React**
+  - `documentum_react_frontend` : interface utilisateur construite avec React et Vite.
+
+## Lancer le projet avec Docker Compose
+
+Un fichier `docker-compose.yml` est fourni à la racine. Il définit trois services :
+
+1. **backend** : l’application Django.
+2. **frontend** : l’application React.
+3. **db** : une base PostgreSQL pour le backend.
+
+Pour démarrer l’ensemble :
+
+```bash
+docker-compose up --build
+```
+
+Les services seront accessibles sur :
+
+- http://localhost:8000 pour le backend
+- http://localhost:3000 pour le frontend
+
+## Scripts utiles
+
+Plusieurs scripts `.bat` permettent de lancer le serveur selon le contexte :
+
+- `runserveur_local.bat` : démarre Django localement.
+- `runserveur_docker.bat` : démarre Django en environnement Docker.
+- `run_shell.bat` : ouvre un shell Python via `manage.py shell`.
+
+Pour exécuter les tests Django :
+
+```bash
+python manage.py test
+```
+
+## Ressources complémentaires
+
+- [Documentation officielle de Django](https://docs.djangoproject.com/fr/stable/)
+- [Documentation React et Vite](https://vitejs.dev/guide/)
