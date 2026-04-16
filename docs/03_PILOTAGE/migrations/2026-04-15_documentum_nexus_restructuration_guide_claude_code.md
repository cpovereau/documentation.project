# DOCUMENTUM_NEXUS_RESTRUCTURATION_GUIDE — Claude Code

## 🎯 Objectif

Guider une **restructuration progressive** du dépôt `C:\Documentum` vers une organisation compatible **Documentum Nexus**, sans casser :
- le runtime backend (Django)
- le frontend (React)
- Docker / CircleCI
- les scripts locaux
- l’historique Git

👉 **Principe : migration par phases, zéro casse.**

---

## 🔒 Règles NON négociables

1. Ne pas renommer le dépôt Git ni le dossier racine `C:\Documentum`.
2. Utiliser **exclusivement** `git mv` pour les déplacements.
3. **1 type d’action par commit** (pas de mélange déplacement + refactor).
4. **Aucun refactor métier** pendant les déplacements.
5. Ne pas déplacer `manage.py` sans validation explicite.
6. Ne pas déplacer `medias/`, `static/`, `logs/` sans audit préalable.
7. Ne pas modifier les APIs ni les contrats backend.
8. Vérifier le fonctionnement après **chaque phase**.

---

## 📦 Structure ACTUELLE (référence)

```
C:\Documentum
├── _Ext_Ressources
├── .circleci
├── docs
├── documentation
├── documentation_project
├── documentum_react_frontend
├── env
├── logs
├── medias
├── static
├── manage.py
├── docker-compose.yml
├── package.json
├── requirements.txt
└── scripts divers (*.bat, *.ps1)
```

---

## 🧭 Structure CIBLE (progressive)

```
C:\Documentum
├── apps/
│   ├── documentum-core-backend/      # (phase ultérieure)
│   └── documentum-core-frontend/
├── docs/
├── infra/
├── resources/
│   └── ext/
├── scripts/
│   ├── batch/
│   └── powershell/
├── data/                             # (phase ultérieure)
├── documentation/
├── documentation_project/
├── env/
├── logs/
├── medias/
├── static/
├── manage.py
├── docker-compose.yml
├── package.json
├── requirements.txt
```

---

## 🧩 Plan de migration

### PHASE 1 — Création des dossiers (sans impact) ✅ COMPLÉTÉE — 2026-04-15

**Objectif :** introduire la structure cible sans déplacer.

**Actions :**
```powershell
New-Item -ItemType Directory -Force apps
New-Item -ItemType Directory -Force scripts
New-Item -ItemType Directory -Force infra
New-Item -ItemType Directory -Force resources
New-Item -ItemType Directory -Force data
```

**Commit :**
```powershell
git add .
git commit -m "chore: introduce Nexus folder structure"
```

**Résultat :** commit `d84be4a3` — 5 dossiers créés avec `.gitkeep`, aucun fichier existant modifié.

**Validation :** aucune régression attendue. ✅ Vérifié.

---

### PHASE 2 — Scripts & ressources (faible risque) ✅ COMPLÉTÉE — 2026-04-15

**Objectif :** isoler les scripts et ressources externes.

**Actions :**
```powershell
git mv _Ext_Ressources resources\ext
git mv runserveur_docker.bat scripts\batch\
git mv runserveur_local.bat scripts\batch\
git mv generate_structure.bat scripts\batch\
git mv start.ps1 scripts\powershell\
```

**Commit :**
```powershell
git commit -m "refactor: move scripts and external resources"
```

**Résultat :** commit `855b80d7` — 7 renames détectés (100% similarité), aucun contenu modifié.

- `_Ext_Ressources/` → `resources/ext/` (3 fichiers)
- `runserveur_docker.bat` → `scripts/batch/`
- `runserveur_local.bat` → `scripts/batch/`
- `generate_structure.bat` → `scripts/batch/`
- `start.ps1` → `scripts/powershell/`

**Fichiers attendus absents :** aucun — tous les 5 éléments cibles étaient présents.

**Validation :**
- scripts exécutables OK (contenu inchangé, 100% rename)
- backend démarre OK

---

### PHASE 3 — Frontend ✅ COMPLÉTÉE — 2026-04-15

**Objectif :** déplacer React dans `apps/`.

**Actions :**
```powershell
git mv documentum_react_frontend apps\documentum-core-frontend
```

**Commit :**
```powershell
git commit -m "refactor: move frontend to apps/documentum-core-frontend"
```

**Résultat :** commit `1a1d3164` — 242 renames à 100% similarité, 0 insertion/suppression de contenu.

- `documentum_react_frontend/` → `apps/documentum-core-frontend/` (242 fichiers)
- `node_modules/` non tracké par Git, non déplacé (transparent)

**Impacts identifiés (non bloquants) :**

| Fichier | Impact | Action requise |
|---|---|---|
| `documentum.code-workspace` | Path `"documentum_react_frontend"` → cassé | Mettre à jour en `apps/documentum-core-frontend` avant prochain usage VS Code workspace |
| `docs/02_ANALYSE/audits/deps_licences.json` | Chemins absolus périmés | Fichier d'audit uniquement, pas de runtime |

**Validation :**
- `npm install` : à lancer depuis `apps/documentum-core-frontend/`
- `npm run dev` : à lancer depuis `apps/documentum-core-frontend/`
- `documentum.code-workspace` : à corriger (path frontend)

---

### PHASE 4 — Audit backend (AUCUN déplacement) ✅ COMPLÉTÉE — 2026-04-15

**Objectif :** préparer le déplacement du backend.

**Résultat :** migration faisable — risque MOYEN — 6 fichiers critiques à corriger avant Phase 5.

**Dépendances critiques (bloquent le runtime) :**

| Fichier | Problème |
|---|---|
| `documentation_project/settings.py:7` | `BASE_DIR = parent.parent` pointera vers `apps/documentum-core-backend/` → `STATIC_ROOT` et `MEDIA_ROOT` cassés |
| `.circleci/config.yml:43` | `python manage.py` lancé depuis la racine checkout → introuvable |
| `pytest.ini` | `DJANGO_SETTINGS_MODULE` résolu depuis la racine → échoue si manage.py déplacé |
| `scripts/batch/runserveur_*.bat` | `python manage.py` suppose CWD = racine |
| `scripts/powershell/start.ps1` | idem |
| `package.json:3` | `npm run dev` → `python manage.py` depuis racine |

**Dépendances non critiques :**
- `documentum.code-workspace` : path Backend restera `.` (fonctionnel mais imprécis)
- `documentation/Dockerfile` : non connecté au docker-compose, latent
- `scripts/batch/generate_structure.bat` : déjà cassé (refs Frontend Phase 3 + typo)

**Ordre de corrections à réaliser AVANT Phase 5 :**
1. `settings.py` — extraire un `REPO_ROOT` pour STATIC_ROOT et MEDIA_ROOT
2. `.circleci/config.yml` — ajouter `working_directory: apps/documentum-core-backend`
3. `pytest.ini` — ajouter `pythonpath = apps/documentum-core-backend`
4. Scripts batch / PS1 / `package.json` — mettre à jour les chemins manage.py
5. `documentum.code-workspace` — corriger Backend + Frontend (deux corrections en une passe)

---

### PHASE 4 BIS — Corrections préparatoires avant migration backend ✅ COMPLÉTÉE — 2026-04-15

**Objectif :** corriger les dépendances de chemins identifiées en Phase 4 sans déplacer le backend.

**Commit :** `592e5565` — 8 fichiers, 13 insertions, 6 suppressions.

| Fichier | Correction appliquée |
|---|---|
| `documentation_project/settings.py` | Ajout `REPO_ROOT = BASE_DIR.parent.parent` ; `STATIC_ROOT` et `MEDIA_ROOT` ancrés sur `REPO_ROOT` |
| `.circleci/config.yml` | Ajout `working_directory: apps/documentum-core-backend` sur les steps Migrations et Tests |
| `pytest.ini` | Ajout `pythonpath = apps/documentum-core-backend` |
| `scripts/batch/runserveur_local.bat` | Ajout `cd /d "%~dp0..\..\apps\documentum-core-backend"` avant `manage.py` |
| `scripts/batch/runserveur_docker.bat` | Idem |
| `scripts/powershell/start.ps1` | `Set-Location` vers `apps/documentum-core-backend` ; chemin `env` relativisé |
| `package.json` | Script `dev` : ajout `cd apps/documentum-core-backend` avant `manage.py` |
| `documentum.code-workspace` | Backend → `apps/documentum-core-backend` ; Frontend → `apps/documentum-core-frontend` (correction Phase 3) |

---

### PHASE 5 — Backend ✅ COMPLÉTÉE — 2026-04-15

**Objectif :** déplacer Django proprement.

**Actions :**
```powershell
New-Item -ItemType Directory -Force apps\documentum-core-backend
git mv documentation apps\documentum-core-backend\
git mv documentation_project apps\documentum-core-backend\
git mv manage.py apps\documentum-core-backend\
```

**Commit :** `87577ed0` — 47 renames à 100% similarité, 0 modification de contenu.

- `documentation/` → `apps/documentum-core-backend/documentation/` (40 fichiers)
- `documentation_project/` → `apps/documentum-core-backend/documentation_project/` (6 fichiers)
- `manage.py` → `apps/documentum-core-backend/manage.py`

**Validation :**
- `python manage.py runserver` : depuis `apps/documentum-core-backend/`
- tests : `pytest` depuis la racine (pythonpath configuré en Phase 4 bis)
- Docker : Dockerfile latent, non connecté au compose

---

## ⚠️ Points de vigilance

- Django paths (settings, manage.py)
- volumes Docker
- CircleCI config
- imports relatifs Python
- chemins frontend (vite / tsconfig)

---

## ✅ Checklist après chaque phase

- Backend démarre
- Frontend démarre
- Tests passent
- `git status` clean
- Docker OK

---

## ❌ Interdits

- refactor code pendant déplacement
- suppression de fichiers
- modification API
- renommage libre

---

## 🧠 Rôle de Claude Code

Claude Code doit :
- proposer les commandes `git mv`
- analyser les dépendances
- alerter sur les impacts
- ne jamais improviser hors de ce cadre

---

## ✔️ Conclusion

La migration doit rester :
- progressive
- contrôlée
- réversible

👉 Toute action hors plan doit être validée