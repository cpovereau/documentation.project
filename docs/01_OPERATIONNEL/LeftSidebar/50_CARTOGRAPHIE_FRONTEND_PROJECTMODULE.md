# Cartographie Frontend — `ProjectModule`

---

## 1. Rôle fonctionnel réel

- **Rôle actuel** : composant UI présentant la liste des projets dans la sidebar gauche, avec des actions de gestion (créer, charger, cloner, supprimer, publier) et un formulaire d'export conditionnel.

- **Écart éventuel** : le composant est **purement présentationnel** (dumb component). Toute la logique métier est déléguée au composant parent `LeftSidebar` via des callbacks (`onAdd`, `onLoad`, `onClone`, `onDelete`, `onPublish`, `onSelect`). Le composant ne fait **aucun appel backend direct**.

---

## 2. Flux métier pris en charge

| Flux | Déclencheur UI | Hook / Contexte | DTO | Endpoint actuel | Endpoint cible |
|------|----------------|----------------|-----|-----------------|---------------|
| Sélection de projet | Clic sur un projet dans la liste | `onSelect(projectId)` → `handleSelect` dans LeftSidebar | `ProjectDTO` | `GET /api/projets/{id}/` (via `openProject`) | `GET /api/projets/{id}/` |
| Création de projet | Bouton "Créer" (FilePlus) | `onAdd()` → `handleAdd` → `CreateProjectDialog` | `ProjectCreateZ` | `POST /projet/create/` | `POST /api/projets/` (canonique) |
| Chargement de projet | Bouton "Charger" (Download) | `onLoad()` → `handleLoad` → `LoadProjectDialog` | `ProjectDTO[]` | `GET /api/projets/?archived=false` | `GET /api/projets/?archived=false` |
| Clonage de projet | Bouton "Cloner" (Copy) | `onClone(projectId)` → `handleClone` dans LeftSidebar | `ProjectDTO` | ❌ **Aucun appel backend** (clone local uniquement) | `POST /api/versions/{id}/clone/` (VersionProjet) |
| Suppression de projet | Bouton "Supprimer" (Trash) | `onDelete(projectId)` → `handleDelete` dans LeftSidebar | - | ❌ **Aucun appel backend** (suppression locale uniquement) | `DELETE /api/projets/{id}/` |
| Publication/Export | Bouton "Publier" (Upload) | `onPublish(projectId)` → `handlePublish` → affiche `showExportCard` | - | ❌ **Aucun appel backend** (console.log uniquement dans `handleExport`) | `POST /api/publier-map/{map_id}/` (publication de map, pas de projet) |

> ⚠️ **Observations critiques** :
> - Le flux de publication/export est **non implémenté** : `handleExport` dans ProjectModule ne fait qu'un `console.log` et un toast de succès simulé.
> - Le clonage et la suppression sont **simulés localement** dans LeftSidebar sans persistance backend.
> - La création utilise l'endpoint non canonique `/projet/create/` au lieu de `/api/projets/`.

---

## 3. Appels backend effectués

**Aucun appel backend direct** n'est effectué par `ProjectModule` lui-même.

Tous les appels sont **indirects**, déclenchés par les callbacks passés en props depuis `LeftSidebar` :

### Appels indirects identifiés

| Endpoint actuel | Responsabilité métier réelle | Conformité avec le référentiel backend |
|-----------------|------------------------------|----------------------------------------|
| `GET /api/projets/{id}/` | Récupération d'un projet (via `openProject` dans LeftSidebar) | 🟢 Conforme |
| `GET /api/projets/{id}/structure/` | Récupération de la structure d'un projet (via `useEffect` dans LeftSidebar) | 🟢 Conforme |
| `GET /api/projets/?archived=false` | Liste des projets non archivés (via `LoadProjectDialog`) | 🟢 Conforme |
| `POST /projet/create/` | Création de projet (via `CreateProjectDialog`) | 🔴 **Non conforme** : devrait être `POST /api/projets/` |
| `POST /api/publier-map/{map_id}/` | Publication d'une map (endpoint existant mais non utilisé) | 🟢 Conforme (mais non utilisé) |

> 💡 **Note** : L'endpoint de publication existe pour les maps (`/api/publier-map/{map_id}/`), mais le composant tente de publier un **projet**, ce qui est conceptuellement différent selon le référentiel backend.

---

## 4. États et contextes consommés

### Props reçues (état externe)

| Propriété | Type | Propriétaire réel | Rôle fonctionnel |
|-----------|------|------------------|------------------|
| `projects` | `ProjectDTO[]` | État local `useState` dans `LeftSidebar` | Liste des projets chargés en mémoire |
| `selectedProjectId` | `number \| null` | `useSelectedVersion()` hook → `useProjectStore` (Zustand) | Identifiant du projet sélectionné globalement |
| `isExpanded` | `boolean` | État local `useState` dans `LeftSidebar` | Contrôle l'affichage du module |
| `showExportCard` | `boolean` | État local `useState` dans `LeftSidebar` | Contrôle l'affichage du formulaire d'export |

### Stores Zustand

| Store | Propriété consommée | Rôle fonctionnel | Dépendances principales |
|-------|-------------------|-------------------|-------------------------|
| `useProjectStore` | `selectedProjectId` (via `useSelectedVersion`) | Source de vérité pour le projet sélectionné | `setSelectedProjectId` appelé dans `openProject` |

### États locaux

| État | Type | Rôle fonctionnel |
|------|------|------------------|
| `selectedFormat` | `string` | Format d'export sélectionné dans le formulaire (PDF, Web, Moodle, Fiche, Personnalise) |

> ⚠️ **Observation** : Le composant ne gère **aucun état métier critique**. Il est entièrement contrôlé par son parent.

---

## 5. DTO manipulés

### DTO consommés

| DTO | Source | Usage | Alignement avec intention métier |
|-----|--------|-------|----------------------------------|
| `ProjectDTO` | Props depuis `LeftSidebar` | Affichage de la liste (`project.nom`) | 🟡 **Partiel** : le DTO contient `id`, `nom`, `description?`, `maps[]`, mais le composant n'utilise que `id` et `nom` |

### DTO produits

**Aucun DTO produit** par le composant lui-même.

### Transformations locales appliquées

**Aucune transformation** : le composant affiche directement `project.nom` sans transformation.

> ⚠️ **Observation** : Le DTO `ProjectDTO` est **sous-utilisé** : seuls `id` et `nom` sont exploités, alors que `maps` et `description` sont disponibles mais ignorés.

---

## 6. Écarts avec le backend canonique

### 6.1. Appels hors contrat

| Écart | Détail | Impact |
|-------|--------|--------|
| Création via endpoint non canonique | `CreateProjectDialog` utilise `POST /projet/create/` au lieu de `POST /api/projets/` | 🟡 Toléré temporairement (endpoint fonctionnel mais non standard) |
| Publication non implémentée | `handleExport` ne fait qu'un `console.log`, aucun appel à `/api/publier-map/{map_id}/` | 🔴 **Blocant** : fonctionnalité de publication non opérationnelle |
| Clonage local sans backend | `handleClone` dans LeftSidebar clone localement sans appel backend | 🔴 **Blocant** : pas de persistance, perte de données au rechargement |
| Suppression locale sans backend | `handleDelete` dans LeftSidebar supprime localement sans appel backend | 🔴 **Blocant** : pas de persistance, perte de données au rechargement |

### 6.2. Logiques métier frontend compensatoires

| Logique compensatoire | Justification observée | Risque |
|----------------------|------------------------|--------|
| Clone local avec génération d'ID | `const newId = Math.max(...projects.map((x) => x.id)) + 1` | 🔴 **Risque de collision** si plusieurs utilisateurs créent des projets simultanément |
| Suppression locale sans validation | Suppression immédiate de l'état local sans confirmation backend | 🔴 **Risque de perte de données** si l'opération échoue côté backend |

### 6.3. Confusions entre structure et contenu

**Aucune confusion identifiée** dans ce composant (il ne manipule pas de structure ni de contenu documentaire).

### 6.4. Concept projet vs map

| Problème | Détail |
|----------|--------|
| Publication de projet vs map | Le composant propose de "publier un projet", mais l'endpoint backend existant (`/api/publier-map/{map_id}/`) publie une **map**, pas un projet. Un projet peut contenir plusieurs maps. L'intention métier n'est pas claire. | 🔴 **Ambiguïté conceptuelle** |

---

## 7. Risques et impacts

### 7.1. Impact potentiel si le backend est corrigé ou réaligné

| Scénario backend | Impact sur ProjectModule | Sensibilité |
|------------------|--------------------------|-------------|
| Suppression de `/projet/create/` au profit de `/api/projets/` | 🟡 **Impact moyen** : `CreateProjectDialog` doit être mis à jour, mais `ProjectModule` n'est pas affecté directement |
| Implémentation du clonage de projet via backend | 🔴 **Impact fort** : `handleClone` dans LeftSidebar doit être refactoré pour appeler le backend |
| Implémentation de la suppression de projet via backend | 🔴 **Impact fort** : `handleDelete` dans LeftSidebar doit être refactoré pour appeler le backend |
| Clarification publication projet vs map | 🟡 **Impact moyen** : `handleExport` doit être implémenté avec la bonne logique métier (quelle map publier ?) |

### 7.2. Sensibilité du composant

- **Centralité** : 🟡 **Moyenne** : composant UI périphérique, mais point d'entrée principal pour la gestion des projets
- **Criticité** : 🟡 **Moyenne** : fonctionnalités de clonage/suppression non opérationnelles, mais sélection/création fonctionnelles
- **Dépendances** : 🟢 **Faible** : composant isolé, dépend uniquement de `LeftSidebar` pour la logique

### 7.3. Dépendances en cascade avec d'autres composants

| Composant dépendant | Type de dépendance | Risque de propagation |
|---------------------|-------------------|----------------------|
| `LeftSidebar` | Fournit les callbacks et l'état | 🟡 **Moyen** : si les callbacks changent, ProjectModule doit être mis à jour |
| `CreateProjectDialog` | Appelé via `onAdd` | 🟡 **Moyen** : changement d'endpoint affecte le dialogue, pas ProjectModule |
| `LoadProjectDialog` | Appelé via `onLoad` | 🟢 **Faible** : dialogue indépendant |

---

## 8. Verdict architectural

### 🟡 Conforme sous contrainte

**Justification** :

- ✅ Le composant respecte l'architecture frontend (composant présentationnel, logique dans le parent)
- ✅ Les appels backend indirects sont conformes (sauf `/projet/create/` qui est toléré)
- ⚠️ **Mais** : plusieurs fonctionnalités sont **non implémentées** ou **simulées localement** :
  - Publication/export : non implémenté (console.log uniquement)
  - Clonage : simulé localement sans backend
  - Suppression : simulée localement sans backend
- ⚠️ **Ambiguïté conceptuelle** : publication de "projet" vs "map" non résolue

**Actions requises pour passer à 🟢 Conforme** :

1. Implémenter l'appel backend pour la publication (clarifier projet vs map)
2. Implémenter le clonage via backend (`POST /api/versions/{id}/clone/` si applicable, ou endpoint dédié)
3. Implémenter la suppression via backend (`DELETE /api/projets/{id}/`)
4. Migrer la création vers l'endpoint canonique (`POST /api/projets/`)

---

> **Ce document décrit l'existant tel qu'il est, sans proposition de correction.**

**Fin de la cartographie ProjectModule**


