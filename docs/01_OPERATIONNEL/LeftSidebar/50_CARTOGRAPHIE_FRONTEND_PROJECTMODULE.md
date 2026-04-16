# Cartographie Frontend — `ProjectModule`

> **Objet** : cartographie de l'existant — composant présentationnel de gestion des projets dans la sidebar gauche
>
> **Statut** : 🟢 Conforme — tous les flux disponibles branchés sur le backend ; clone/suppression hors scope v1
>
> **Composant(s) analysé(s) :** `ProjectModule` (`src/components/ui/ProjectModule.tsx`)
>
> **Dernière mise à jour** : 2026-04-16

---

## 1. Rôle fonctionnel réel

- **Rôle actuel** : composant UI présentant la liste des projets dans la sidebar gauche, avec des actions de gestion (créer, charger, cloner, supprimer, publier) et un formulaire d'export conditionnel.

- **Écart éventuel** : le composant est **purement présentationnel** (dumb component). Toute la logique métier est déléguée au composant parent `LeftSidebar` via des callbacks (`onAdd`, `onLoad`, `onClone`, `onDelete`, `onPublish`, `onSelect`). Le composant ne fait **aucun appel backend direct**.

---

## 2. Flux métier pris en charge

| Flux | Déclencheur UI | Hook / Contexte | DTO | Endpoint actuel | Endpoint cible |
|------|----------------|----------------|-----|-----------------|---------------|
| Sélection de projet | Clic sur un projet dans la liste | `onSelect(projectId)` → `handleSelect` dans LeftSidebar | `ProjectDTO` | `GET /api/projets/{id}/` (via `openProject`) | `GET /api/projets/{id}/` |
| Création de projet | Bouton "Créer" (FilePlus) | `onAdd()` → `handleAdd` → `CreateProjectDialog` | `ProjectCreateZ` | `POST /api/projets/` | `POST /api/projets/` ✅ migré Sprint 4 |
| Chargement de projet | Bouton "Charger" (Download) | `onLoad()` → `handleLoad` → `LoadProjectDialog` | `ProjectDTO[]` | `GET /api/projets/?archived=false` | `GET /api/projets/?archived=false` |
| Clonage de projet | Bouton "Cloner" (Copy) | `onClone(projectId)` → `handleClone` dans LeftSidebar | `ProjectDTO` | ❌ **Aucun appel backend** (clone local uniquement) | `POST /api/versions/{id}/clone/` (VersionProjet) |
| Suppression de projet | Bouton "Supprimer" (Trash) | `onDelete(projectId)` → `handleDelete` dans LeftSidebar | - | ❌ **Aucun appel backend** (suppression locale uniquement) | `DELETE /api/projets/{id}/` |
| Publication/Export | Bouton "Publier" (Upload) → choix format → "Publier" | `onPublish(projectId)` → affiche `showExportCard` ; `onExport(format)` → `handleExport` dans LeftSidebar | `{ format }` | `POST /api/publier-map/{map_id}/` | ✅ Lot 5 |

> **Règle de sélection de la map à publier (LeftSidebar.handleExport) :**
> 1. map avec `is_master === true` → publiée en priorité
> 2. si pas de master et map unique → publiée automatiquement
> 3. si plusieurs maps sans master → blocage explicite, toast d'erreur

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
| `POST /api/projets/` | Création de projet (via `CreateProjectDialog`) | ✅ **Conforme** — migré Sprint 4 |
| `POST /api/publier-map/{map_id}/` | Publication d'une map — payload `{ format }` | ✅ Conforme — connecté Lot 5 |

> **Note** : L'entrée UI part du projet sélectionné, mais le backend publie une **map**. `LeftSidebar.handleExport` résout cette ambiguïté en déterminant la map cible depuis `projectMaps` (règle `is_master`). `ProjectModule` délègue l'appel backend via `onExport(format)`, il ne fait aucun appel direct.

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
| `selectedFormat` | `string` | Format d'export sélectionné — valeurs alignées sur `PUBLISH_FORMATS` de `src/api/maps.ts` : `pdf`, `html5`, `xhtml`, `scorm`, `markdown`, `eclipsehelp` |
| `isPublishing` | `boolean` | Désactivation du bouton "Publier" pendant l'appel backend |

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
| ~~Création via endpoint non canonique~~ | ✅ **Résolu Sprint 4** : `CreateProjectDialog` utilise désormais `POST /api/projets/` via `createProjectValidated()` | — |
| ~~Publication non implémentée~~ | ✅ **Résolu Lot 5** : `handleExport` dans LeftSidebar appelle `POST /api/publier-map/{map_id}/`, `ProjectModule` délègue via `onExport(format)` | — |
| Clonage projet | toast hors scope v1 (Lot 3) — pas d'endpoint backend disponible | ⚠️ Documenté |
| ~~Suppression locale sans backend~~ | ✅ **Résolu Lot 3** : `DELETE /api/projets/{id}/` | — |

### 6.2. Logiques métier frontend compensatoires

| Logique compensatoire | Justification observée | Risque |
|----------------------|------------------------|--------|
| ~~Clone local avec génération d'ID~~ | ✅ Supprimé Lot 3 — `handleClone` affiche un toast hors scope v1, aucun fake ID | — |
| ~~Suppression locale sans validation~~ | ✅ Supprimé Lot 3 — `handleDelete` appelle `DELETE /api/projets/{id}/` | — |

### 6.3. Confusions entre structure et contenu

**Aucune confusion identifiée** dans ce composant (il ne manipule pas de structure ni de contenu documentaire).

### 6.4. Concept projet vs map

| Concept | Clarification |
|---------|---------------|
| Publication de projet vs map | ✅ **Résolu Lot 5** — L'IHM reste déclenchée depuis le module Projet, mais `LeftSidebar.handleExport` détermine la map cible (règle `is_master`) et appelle `POST /api/publier-map/{map_id}/`. L'ambiguïté conceptuelle est documentée et résolue explicitement dans le code. |

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

### 🟢 Conforme — tous les flux disponibles branchés sur le backend

**Résolu (Lots 3 & 5) :**
1. ✅ Publication/export : `POST /api/publier-map/{map_id}/` — IHM existante branchée, règle `is_master` explicite (Lot 5)
2. ✅ Suppression projet : `DELETE /api/projets/{id}/` (Lot 3)
3. ✅ Clonage projet : toast hors scope v1 — pas d'endpoint backend (Lot 3)
4. ✅ Formats publication : alignés sur `PUBLISH_FORMATS` du backend (`pdf`, `html5`, `xhtml`, `scorm`, `markdown`, `eclipsehelp`)
5. ✅ Ambiguïté projet vs map : résolue et documentée dans `handleExport`

**Restant :**
- Clone projet : hors scope v1 (pas d'endpoint backend disponible)

---

> **Ce document décrit l'existant tel qu'il est, sans proposition de correction.**

**Fin de la cartographie ProjectModule**


