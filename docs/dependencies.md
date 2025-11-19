# 📦 DEPENDENCIES – Documentum
*Installation & configuration des dépendances Backend / Frontend / Outils*

---

## 📚 Table des matières
- [📦 DEPENDENCIES – Documentum](#-dependencies--documentum)
  - [📚 Table des matières](#-table-des-matières)
  - [🎯 Objectif du document](#-objectif-du-document)
  - [🐍 Backend – Python / Django](#-backend--python--django)
    - [Dépendances principales](#dépendances-principales)
    - [🧪 Tests : Pytest](#-tests--pytest)
    - [🧹 Qualité : Ruff](#-qualité--ruff)
    - [🐞 Debug : Django Debug Toolbar](#-debug--django-debug-toolbar)
    - [📊 Modélisation : Django Extensions + pygraphviz](#-modélisation--django-extensions--pygraphviz)
    - [🔌 API : DRF + Spectacular](#-api--drf--spectacular)
  - [⚛️ Frontend – React / TypeScript](#️-frontend--react--typescript)
    - [Dépendances de production](#dépendances-de-production)
    - [Éditeur TipTap v3](#éditeur-tiptap-v3)
    - [Gestion État & API](#gestion-état--api)
    - [Qualité Code : ESLint + Prettier](#qualité-code--eslint--prettier)
    - [Dépendances de développement](#dépendances-de-développement)
  - [🐳 Docker](#-docker)
  - [📝 Scripts de vérification](#-scripts-de-vérification)
  - [📌 Notes de maintenance](#-notes-de-maintenance)

---

## 🎯 Objectif du document
Ce fichier liste **toutes les dépendances utilisées dans Documentum**, côté Backend & Frontend, ainsi que les **outils installés** (Ruff, Pytest, ESLint, Prettier, React Query, Docker…).

Il sert de référence rapide pour :
- configurer un nouvel environnement,
- vérifier les versions installées,
- rejouer une installation complète.

---

# 🐍 Backend – Python / Django

## Dépendances principales
```
Django==5.2.4  
djangorestframework==3.16.0  
psycopg2-binary  
python-decouple  
drf-spectacular  
drf-spectacular-sidecar  
django-cors-headers  
```

---

## 🧪 Tests : Pytest
Installation :  
```
pip install pytest pytest-django pytest-cov
```

Fichier `pytest.ini` :
```
[pytest]
DJANGO_SETTINGS_MODULE = documentation_project.settings
python_files = tests.py test_*.py *_tests.py
```

---

## 🧹 Qualité : Ruff
Installation :  
```
pip install ruff
```

Fichier `ruff.toml` recommandé :
```toml
line-length = 120
extend-select = ["E", "F", "I"]
```

Commande :
```
ruff check .
```

---

## 🐞 Debug : Django Debug Toolbar
Installation :
```
pip install django-debug-toolbar
```

Ajouts :
- `INSTALLED_APPS += ["debug_toolbar"]`
- `MIDDLEWARE.insert(0, "debug_toolbar.middleware.DebugToolbarMiddleware")`
- `INTERNAL_IPS = ["127.0.0.1"]`

---

## 📊 Modélisation : Django Extensions + pygraphviz
Installation :
```
pip install django-extensions
```

Si pygraphviz n’est pas installable sous Windows → **utilisation Docker**.

Commande via Docker (recommandée) :
```
docker run --rm -v "${PWD}:/app" continuumio/miniconda3 \
bash -lc "apt-get update && apt-get install -y graphviz graphviz-dev && \
pip install django-extensions pygraphviz && \
cd /app && python manage.py graph_models -a -g -o schema.png"
```

---

## 🔌 API : DRF + Spectacular
```
pip install drf-spectacular drf-spectacular-sidecar
```

Documentation interactive :
- Swagger : http://localhost:8000/docs/
- OpenAPI JSON : http://localhost:8000/schema/

---

# ⚛️ Frontend – React / TypeScript

## Dépendances de production

### UI / Composants
- `@headlessui/react`
- `@radix-ui/react-*`
- `lucide-react`
- `tailwind-merge`
- `classnames`, `clsx`

### Éditeur TipTap v3
- `@tiptap/core`, `@tiptap/react`, `@tiptap/starter-kit`
- `@tiptap/extension-underline`
- `@tiptap/extension-table`
- `@tiptap/extension-color`
- `@tiptap/extension-text-align`
- Extensions custom Documentum

### Drag & Drop
- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/modifiers`

### Parsing / données
- `axios`
- `papaparse`
- `@xmldom/xmldom`
- `lodash.debounce`

### Routing
- `react-router-dom`

### State
- `zustand`

### Notifications
- `sonner`

---

## Éditeur TipTap v3
(Toutes les extensions sont listées dans `extensions/index.ts`)

Extensions principales :
- DITA : `Body`, `Shortdesc`, `Task`, `Section`, ...
- Metadata : `RubriqueMetadata`
- Spécifiques Documentum : `DocTag`, `StatusMarker`, `InlineVariable`, `GrammarHighlight`

---

## Gestion État & API

### React Query
```
npm install @tanstack/react-query
npm install @tanstack/react-query-devtools --save-dev
```

Ajout dans `main.tsx` :
```tsx
<QueryClientProvider client={queryClient}>
  <AuthProvider>
    <App />
  </AuthProvider>
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Zustand
Déjà installé :
```
npm install zustand
```

---

## Qualité Code : ESLint + Prettier
Installation :
```
npm install -D eslint prettier eslint-plugin-react eslint-config-prettier eslint-plugin-prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

Fichiers :
- `.eslintrc.cjs`
- `.prettierrc`

---

## Dépendances de développement
- `vite`
- `@vitejs/plugin-react`
- `tailwindcss`, `autoprefixer`, `postcss`
- `typescript`
- `@tanstack/react-query-devtools`

---

# 🐳 Docker

### LanguageTool
```
docker run -d --name languagetool -p 8081:8081 erikvl87/languagetool
```

Utilisé pour :
- correction grammaticale,
- surlignage TipTap (GrammarHighlight),
- suggestions via popup.

---

# 📝 Scripts de vérification

## Backend
```
ruff check .
pytest
python manage.py check
python manage.py spectacular --file schema.yaml
```

## Frontend
```
npm run lint
npm run format
npm run type-check
npm run dev
```

## Docker
```
docker ps
curl http://localhost:8081/v2/check
```

---

# 📌 Notes de maintenance
- Exécuter `npm audit` chaque mois.
- Garder `package-lock.json` versionné.
- Après mise à jour majeure, tester :
  - éditeur TipTap,
  - dictionnaires API,
  - ProductDocSync,
  - import médias,
  - CentralEditor (dictée + correcteur).

---

# ✔️ Fin du document
Document prêt pour GitHub — lisible, propre et complet.

