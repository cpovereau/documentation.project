# Cartographie Frontend — `LeftSidebar`

---

## 1. Rôle fonctionnel réel

**Rôle actuel** : Orchestration de la sélection et de la gestion des projets et des maps documentaires. Point d'entrée pour la navigation dans la structure documentaire.

Responsabilités observées :
- Chargement et affichage de la liste des projets (état local `projects`)
- Chargement et affichage de la structure d'une map (rubriques) via `mapRubriques` → transformation en `mapItems` pour l'UI
- Gestion de la sélection projet/map/rubrique
- Protection contre la perte de modifications non sauvegardées (vérification via `useXmlBufferStore.getStatus()`)
- Initialisation du buffer XML pour chaque rubrique de la map (XML vide si absent)
- Création de rubriques dans la map (endpoint `/api/maps/{mapId}/create-rubrique/`)
- Opérations structurelles : indentation, désindentation, réordonnancement (endpoints appelés mais non implémentés backend)
- Délégation de l'affichage visuel à `ProjectModule` et `MapModule`

**Écart éventuel** : Aucun écart identifié entre le rôle observé et le rôle théorique attendu.

---

## 2. Flux métier pris en charge

| Flux | Déclencheur UI | Hook / Contexte | DTO | Endpoint actuel | Endpoint cible |
|------|----------------|-----------------|-----|-----------------|----------------|
| Chargement structure projet | `useEffect` sur `selectedProjectId` | `useSelectedVersion`, `useProjectStore` | `MapRubriqueDTO[]` | `GET /api/projets/{id}/structure/` | `GET /api/projets/{id}/structure/` |
| Ouverture projet | `handleSelect`, `openProject` | `useProjectStore` | `ProjectDTO` | `GET /api/projets/{id}/` | `GET /api/projets/{id}/` |
| Ouverture map | `openMap` | État local | `MapRubriqueDTO[]` | `GET /api/maps/{id}/rubriques/` (via `listMapRubriques`) | `GET /api/maps/{id}/structure/` |
| Création rubrique | `handleAddMapItem` | `useSelectedProduct`, `useSelectedVersion` | `MapRubriqueDTO` | `POST /api/maps/{mapId}/create-rubrique/` | `POST /api/maps/{id}/structure/create/` |
| Indentation rubrique | `handleIndent` | État local | - | `POST /api/map-rubriques/{id}/indent/` | `POST /api/maps/{id}/structure/{mapRubriqueId}/indent` |
| Désindentation rubrique | `handleOutdent` | État local | - | `POST /api/map-rubriques/{id}/outdent/` | `POST /api/maps/{id}/structure/{mapRubriqueId}/outdent` |
| Réordonnancement | `handleReorder` | État local | - | `POST /api/maps/{mapId}/reorder/` | `POST /api/maps/{id}/structure/reorder/` |
| Sélection rubrique | `handleSelectMapItem` | Props `setSelectedMapItemId` | - | - | - |

---

## 3. Appels backend effectués

### 3.1. `GET /api/projets/{projectId}/`
- **Responsabilité métier réelle** : Chargement d'un projet (fallback si absent du cache local)
- **Conformité avec le référentiel backend** : 🟢 Conforme
- **Usage** : Ligne 338, dans `openProject()` en fallback

### 3.2. `GET /api/projets/{projectId}/structure/`
- **Responsabilité métier réelle** : Chargement de la structure documentaire complète (projet + map master + structure MapRubrique)
- **Conformité avec le référentiel backend** : 🟢 Conforme
- **Usage** : Ligne 455, dans `useEffect` synchronisé avec `selectedProjectId`
- **Réponse attendue** : `{ projet, map: { id }, structure: MapRubriqueDTO[] }`

### 3.3. `GET /api/maps/{mapId}/rubriques/` (via `listMapRubriques()`)
- **Responsabilité métier réelle** : Chargement de la structure d'une map spécifique
- **Conformité avec le référentiel backend** : 🟡 Toléré temporairement
- **Usage** : Lignes 301, 381, 409, 421, 438
- **Note** : Endpoint cible canonique : `GET /api/maps/{id}/structure/`

### 3.4. `POST /api/maps/{mapId}/create-rubrique/`
- **Responsabilité métier réelle** : Création atomique d'une rubrique + rattachement à la map
- **Conformité avec le référentiel backend** : 🟡 Toléré temporairement
- **Usage** : Ligne 292, dans `handleAddMapItem()`
- **Payload** : `{ titre, contenu_xml, parent }`
- **Note** : Endpoint cible canonique : `POST /api/maps/{id}/structure/create/`

### 3.5. `POST /api/map-rubriques/{mapRubriqueId}/indent/`
- **Responsabilité métier réelle** : Indentation d'une rubrique dans la structure
- **Conformité avec le référentiel backend** : 🔴 À supprimer ou refactorer
- **Usage** : Ligne 408, dans `handleIndent()`
- **Problème** : Endpoint non implémenté dans le backend (404 attendu)
- **Note** : Endpoint cible canonique : `POST /api/maps/{id}/structure/{mapRubriqueId}/indent`

### 3.6. `POST /api/map-rubriques/{mapRubriqueId}/outdent/`
- **Responsabilité métier réelle** : Désindentation d'une rubrique dans la structure
- **Conformité avec le référentiel backend** : 🔴 À supprimer ou refactorer
- **Usage** : Ligne 419, dans `handleOutdent()`
- **Problème** : Endpoint non implémenté dans le backend (404 attendu)
- **Note** : Endpoint cible canonique : `POST /api/maps/{id}/structure/{mapRubriqueId}/outdent`

### 3.7. `POST /api/maps/{mapId}/reorder/`
- **Responsabilité métier réelle** : Réordonnancement de la structure documentaire
- **Conformité avec le référentiel backend** : 🟡 Toléré temporairement
- **Usage** : Ligne 434, dans `handleReorder()`
- **Payload** : `{ ordered_ids: number[] }`
- **Problème** : Endpoint non implémenté dans le backend (404 attendu)
- **Note** : Endpoint cible canonique : `POST /api/maps/{id}/structure/reorder/`

---

## 4. États et contextes consommés

### 4.1. Stores Zustand

#### `useProjectStore`
- **Propriétaire réel** : Store global Zustand (`src/store/projectStore.ts`)
- **Rôle fonctionnel** : Gestion de l'état global du projet sélectionné
- **Dépendances principales** :
  - `selectedProjectId` : lu via `useSelectedVersion()` (ligne 80) et directement (ligne 87)
  - `setSelectedProjectId` : utilisé pour changer le projet (lignes 82, 194, 201, 360)
- **Observation** : Double lecture de `selectedProjectId` (via hook et directement) avec logs de debug (lignes 89-91)

#### `useXmlBufferStore`
- **Propriétaire réel** : Store global Zustand (`src/store/xmlBufferStore.ts`)
- **Rôle fonctionnel** : Buffer XML par rubrique + statut (saved/dirty/error)
- **Dépendances principales** :
  - `setXml` : initialisation XML vide pour nouvelles rubriques (lignes 137-145)
  - `getXml` : vérification existence XML (ligne 134)
  - `getStatus` : vérification modifications non sauvegardées (lignes 227-228, 161, 215, 327, 373, 397)
- **Usage critique** : Protection contre perte de modifications (blocage changement projet/map/rubrique si `status === "dirty"`)

### 4.2. Hooks métier

#### `useSelectedProduct`
- **Propriétaire réel** : Hook personnalisé (`src/hooks/useSelectedProduct.ts`)
- **Rôle fonctionnel** : Produit sélectionné (pour génération XML template)
- **Dépendances principales** : `useProductStore` (store Zustand)
- **Usage** : Ligne 81, utilisé dans `handleAddMapItem()` pour générer le XML (ligne 288)

#### `useSelectedVersion`
- **Propriétaire réel** : Hook personnalisé (`src/hooks/useSelectedVersion.ts`)
- **Rôle fonctionnel** : Version active du projet sélectionné + `selectedProjectId`
- **Dépendances principales** : `useProjectStore`
- **Usage** : Ligne 80, fournit `selectedProjectId` (dérivé du store)

### 4.3. États locaux critiques

- `projects` : Cache local des projets chargés (ligne 94)
- `mapRubriques` : Structure documentaire brute (MapRubriqueDTO[]) (ligne 67)
- `mapItems` : Structure transformée pour l'UI (MapItem[]) (ligne 64)
- `currentMapId` : Map active (ligne 68)
- `selectedMapItemId` : Rubrique sélectionnée (ligne 69, mais aussi en props ligne 30)
- `pendingSelectId` : Sélection différée après création rubrique (ligne 78)

---

## 5. DTO manipulés

### 5.1. DTO consommés

#### `ProjectDTO`
- **Source** : `GET /api/projets/{id}/` ou `GET /api/projets/{id}/structure/`
- **Structure** : `{ id, nom, description?, maps: ProjectMap[] }`
- **Usage** : Cache local `projects`, chargement projet
- **Polyvalence** : Utilisé pour navigation et affichage liste

#### `MapRubriqueDTO`
- **Source** : `GET /api/maps/{id}/rubriques/` ou `GET /api/projets/{id}/structure/`
- **Structure** : `{ id, ordre, parent, rubrique: { id, titre, revision_numero, is_active, is_archived } }`
- **Usage** : Stocké dans `mapRubriques`, transformé en `MapItem[]` via `mapRubriquesToMapItems()`
- **Polyvalence** : Structure documentaire (pas de contenu XML)

#### `ProjectMap`
- **Source** : Inclus dans `ProjectDTO.maps`
- **Structure** : `{ id, nom, is_master }`
- **Usage** : Liste des maps d'un projet (ligne 363)

### 5.2. DTO produits

#### `MapItem`
- **Source** : Transformation de `MapRubriqueDTO[]` via `mapRubriquesToMapItems()`
- **Structure** : `{ id, rubriqueId, title, isMaster, level, expanded?, active?, versionOrigine?, isRoot?, parentId }`
- **Usage** : UI uniquement (affichage hiérarchique dans `MapModule`)
- **Transformation** : Ajout de métadonnées UI (level, expanded, isRoot) + titre dérivé

### 5.3. Transformations locales appliquées

- `MapRubriqueDTO[]` → `MapItem[]` : Transformation hiérarchique avec calcul des niveaux et expansion automatique (lignes 108-124, via `mapRubriquesToMapItems()`)
- Initialisation XML vide : Création de template XML DITA minimal pour nouvelles rubriques (lignes 128-148)

### 5.4. DTO surchargés ou mal alignés

- Aucun DTO explicitement surchargé identifié
- `MapItem` est un DTO UI pur (non envoyé au backend)

---

## 6. Écarts avec le backend canonique

### 6.1. Appels hors contrat

1. `POST /api/map-rubriques/{id}/indent/` : Endpoint non implémenté backend (404 attendu)
2. `POST /api/map-rubriques/{id}/outdent/` : Endpoint non implémenté backend (404 attendu)
3. `POST /api/maps/{mapId}/reorder/` : Endpoint non implémenté backend (404 attendu)

### 6.2. Logiques métier frontend compensatoires

- Calcul du parent d'insertion : `getInsertionParentId()` (ligne 278) détermine le parent logique avant création
- Sélection différée : `pendingSelectId` (lignes 78, 97-105, 305) pour sélectionner une rubrique après création (attente du rebuild de `mapItems`)
- Rechargement complet après modification structurelle : Après chaque opération (indent/outdent/reorder/create), rechargement complet via `listMapRubriques()` (lignes 301, 409, 421, 438)

### 6.3. Confusions entre structure et contenu

- Initialisation XML dans le composant structure : Le composant initialise le buffer XML (lignes 128-148), responsabilité à la frontière entre structure et contenu
- Génération XML template : `prepareNewRubriqueXml()` appelé dans `handleAddMapItem()` (ligne 284), logique de contenu dans un composant structure

---

## 7. Risques et impacts

### 7.1. Impact si le backend est corrigé ou réaligné

- Endpoints indent/outdent/reorder : Échec immédiat si non implémentés (404). Impact : fonctionnalités inutilisables.
- Migration vers endpoints canoniques : Refactoring nécessaire si changement de routes (`/api/maps/{id}/structure/*`). Impact : modifications locales, tests à refaire.
- Suppression de `/api/maps/{id}/rubriques/` : Remplacement par `/api/maps/{id}/structure/`. Impact : modification de `listMapRubriques()` dans `src/api/maps.ts`.

### 7.2. Sensibilité du composant

- Central : Point d'entrée navigation documentaire, utilisé par `Desktop.tsx`
- Critique : Blocage navigation si endpoints manquants
- Périphérique : Délègue l'affichage à `ProjectModule` et `MapModule`

### 7.3. Dépendances en cascade

- `CentralEditor` : Dépend de `selectedMapItemId` (via props) pour charger le contenu
- `RightSidebar` : Peut dépendre de la sélection pour afficher les métadonnées
- `ProjectModule` / `MapModule` : Dépendent des données fournies par `LeftSidebar`
- `useXmlBufferStore` : Utilisé par `CentralEditor` pour la sauvegarde, initialisé ici

---

## 8. Verdict architectural

🔴 À réaligner impérativement

**Justification** :
1. Trois endpoints critiques non implémentés backend (indent/outdent/reorder) → fonctionnalités cassées
2. Endpoints utilisés non conformes au référentiel canonique (`/api/maps/{id}/rubriques/` vs `/api/maps/{id}/structure/`)
3. Logique de contenu (génération XML) mélangée avec logique de structure
4. Dépendances critiques : composant central, impact en cascade sur l'application

**Priorité** : Haute — Le composant est central et plusieurs fonctionnalités sont actuellement non fonctionnelles.

---

> **Fin de la cartographie `LeftSidebar`**

