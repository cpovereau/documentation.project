# Dépendances du projet Documentum Frontend

Ce document recense toutes les dépendances utilisées dans le projet, classées par catégorie, avec leur rôle et version actuelle (issue de `package-lock.json`).

---

## 📦 Dépendances de production (`dependencies`)

### 🔹 Gestion de l’UI & Composants
- **@headlessui/react** ^2.2.4 — Composants d'interface accessibles et non stylés.
- **@radix-ui/react-*** — Suite de composants Radix (checkbox, dialog, dropdown, label, navigation-menu, scroll-area, select, separator, slot, switch, tooltip).
- **lucide-react** ^0.511.0 — Icônes SVG pour React.
- **tailwind-merge** ^3.3.0 — Fusion intelligente de classes Tailwind.
- **classnames** ^2.5.1 / **clsx** ^2.1.1 — Gestion conditionnelle des classes CSS.

### 🖱 Drag & Drop
- **@dnd-kit/core** ^6.3.1 — Moteur de drag & drop pour React.
- **@dnd-kit/modifiers** ^9.0.0 — Modificateurs pour dnd-kit.
- **@dnd-kit/sortable** ^10.0.0 — Support du tri via drag & drop.

### 📝 Éditeur de texte enrichi (TipTap v3)
- **@tiptap/core**, **@tiptap/react**, **@tiptap/starter-kit** — Noyau et extensions de base.
- **@tiptap/extension-color**, **table**, **text-align**, **text-style**, **underline** — Extensions personnalisées.

### 📂 Traitement de données & parsing
- **axios** ^1.10.0 — Client HTTP.
- **papaparse** ^5.5.3 — Parsing CSV.
- **@xmldom/xmldom** ^0.9.8 — Manipulation DOM XML côté client.
- **glob** ^11.0.2 — Recherche de fichiers via motifs globaux.
- **lodash.debounce** ^4.0.8 — Anti-rebond pour événements fréquents.

### 🔄 Routing & navigation
- **react-router-dom** ^7.6.0 — Gestion des routes côté client.

### 🎯 State Management
- **zustand** ^5.0.6 — Store léger pour React.

### 🎨 Notifications
- **sonner** ^2.0.5 — Système de toast/alertes.

---

## 🛠 Dépendances de développement (`devDependencies`)

### 🖥 Build & Dev
- **vite** ^4.4.9 — Bundler et serveur de dev.
- **@vitejs/plugin-react** ^4.0.4 — Support JSX/TSX pour Vite.
- **vite-tsconfig-paths** ^5.1.4 — Support des chemins TypeScript dans Vite.

### 🎨 Styles
- **tailwindcss** ^3.3.2 — Framework CSS utility-first.
- **postcss** ^8.4.21 — Transformations CSS.
- **autoprefixer** ^10.4.14 — Ajout automatique des préfixes CSS.

### 🧩 Typage
- **typescript** ^5.8.3 — Superset typé de JavaScript.
- **@types/react**, **@types/react-dom** — Typages React.
- **@types/papaparse** — Typage TypeScript pour PapaParse.

### 🛠 Outils Dev
- **@tanstack/react-query-devtools** ^5.83.0 — Outils de debug pour React Query.

---

## 📌 Notes de maintenance
- Effectuer `npm audit` **au moins une fois par mois** pour détecter les vulnérabilités.
- Utiliser `npx npm-check-updates` pour vérifier les mises à jour disponibles.
- Conserver `package-lock.json` versionné dans Git pour garantir des builds identiques.
- Après mise à jour majeure, tester **toutes les fonctionnalités clés** : drag & drop, éditeur TipTap, routage, API Axios, etc.

---
