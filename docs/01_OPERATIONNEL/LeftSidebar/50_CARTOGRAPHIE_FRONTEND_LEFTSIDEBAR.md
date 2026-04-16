# Documentum — Cartographie Frontend — `LeftSidebar`

> **Objet** : cartographie de l'existant basée sur le modèle officiel
>
> **Statut** : conforme — tous les flux disponibles en v1 branchés sur le backend
>
> **Composant analysé :** `LeftSidebar` (`src/components/ui/LeftSidebar.tsx`)
>
> **Dernière mise à jour** : 2026-04-16

---

## 1. Rôle fonctionnel réel

**Rôle actuel** : Orchestration de la sélection et de la gestion des projets et des maps documentaires. Point d'entrée pour la navigation dans la structure documentaire.

Responsabilités observées :
- Chargement et affichage de la liste des projets (état local `projects`)
- Chargement et affichage de la structure d'une map (rubriques) via `mapRubriques` → transformation en `mapItems` pour l'UI
- Gestion de la sélection projet/map/rubrique
- Protection contre la perte de modifications non sauvegardées (vérification via `useXmlBufferStore.getStatus()`) — **⚠️ garde cassé, voir §6**
- Initialisation du buffer XML pour chaque rubrique de la map (XML vide si absent)
- Création de rubriques dans la map (endpoint canonique `/api/maps/{mapId}/structure/create/`)
- Opérations structurelles : indentation, désindentation, réordonnancement (routes canoniques Sprint 4)
- Délégation de l'affichage visuel à `ProjectModule` et `MapModule`

**Mélange de responsabilités constaté** :
- Génération XML template (`prepareNewRubriqueXml`) dans le composant de structure → logique de contenu dans LeftSidebar
- Initialisation buffer XML pour nouvelles rubriques → frontière structure/contenu

---

## 2. Flux métier pris en charge

| Flux | Déclencheur UI | Hook / Contexte | DTO | Endpoint réel | Conforme canon ? |
|------|----------------|-----------------|-----|---------------|-----------------|
| Chargement structure projet | `useEffect` sur `selectedProjectId` | `useSelectedVersion`, `useProjectStore` | `MapRubriqueDTO[]` | `GET /api/projets/{id}/structure/` | ✅ |
| Ouverture projet | `handleSelect`, `openProject` | `useProjectStore` | `ProjectDTO` | `GET /api/projets/{id}/` | ✅ |
| Ouverture map | `openMap` | État local | `MapRubriqueDTO[]` | `GET /api/maps/{id}/structure/` (via `listMapRubriques`) | ✅ |
| Création rubrique | `handleAddMapItem` | `useSelectedProduct`, `useSelectedVersion` | `MapRubriqueDTO` | `POST /api/maps/{id}/structure/create/` | ✅ |
| Indentation rubrique | `handleIndent` | État local | — | `POST /api/maps/{id}/structure/{mr_id}/indent/` | ✅ |
| Désindentation rubrique | `handleOutdent` | État local | — | `POST /api/maps/{id}/structure/{mr_id}/outdent/` | ✅ |
| Réordonnancement | `handleReorder` | État local | — | `POST /api/maps/{id}/structure/reorder/` | ✅ |
| Sélection rubrique | `handleSelectMapItem` | `useSelectionStore` | — | Aucun | ✅ |
| Renommage rubrique | `handleRenameSave` | `mapRubriques` (dérive `rubriqueId`) | `{ titre }` | `PATCH /api/rubriques/{id}/` puis rechargement structure | ✅ Lot 3 |
| Suppression rubrique | `handleDeleteMapItem` | — | — | **Hors scope v1** — backend bloque DELETE si en map, pas d'endpoint détachement | ⚠️ toast |
| Clonage rubrique | `handleCloneMapItem` | — | — | **Hors scope v1** — pas d'endpoint clone rubrique | ⚠️ toast |
| Suppression projet | `handleDelete` | `useProjectStore` | — | `DELETE /api/projets/{id}/` + reset état map | ✅ Lot 3 |
| Clonage projet | `handleClone` | — | — | **Hors scope v1** — pas d'endpoint clone projet | ⚠️ toast |

---

## 3. Appels backend effectués

### 3.1. `GET /api/projets/{projectId}/`
- **Responsabilité** : Chargement d'un projet (fallback si absent du cache local)
- **Conformité** : ✅ Conforme
- **Usage** : dans `openProject()` fallback

### 3.2. `GET /api/projets/{projectId}/structure/`
- **Responsabilité** : Chargement de la structure documentaire complète
- **Conformité** : ✅ Conforme
- **Réponse attendue** : `{ projet, map: { id }, structure: MapRubriqueDTO[] }`
- **Usage** : `useEffect` synchronisé sur `selectedProjectId`

### 3.3. `GET /api/maps/{mapId}/structure/` (via `listMapRubriques()`)
- **Responsabilité** : Rechargement de la structure d'une map après opération
- **Conformité** : ✅ **Conforme** — migré Lot 2 (2026-04-10)
- **Usage** : `openMap`, `handleAddMapItem`, `handleIndent`, `handleOutdent`, `handleReorder`
- **Note** : `listMapRubriques()` dans `src/api/maps.ts` cible `/structure/`. Aucun appel à `/rubriques/` ne subsiste. DTO inchangé (`MapRubriqueDTO` correspond exactement à `MapRubriqueStructureSerializer`).

### 3.4. `POST /api/maps/{mapId}/structure/create/`
- **Responsabilité** : Création atomique d'une rubrique + rattachement à la map
- **Conformité** : ✅ Conforme (migré Sprint 4)
- **Payload** : `{ titre, contenu_xml, parent }`

### 3.5. `POST /api/maps/{mapId}/structure/{mapRubriqueId}/indent/`
- **Conformité** : ✅ Conforme (migré Sprint 4)

### 3.6. `POST /api/maps/{mapId}/structure/{mapRubriqueId}/outdent/`
- **Conformité** : ✅ Conforme (migré Sprint 4)

### 3.7. `POST /api/maps/{mapId}/structure/reorder/`
- **Conformité** : ✅ Conforme (migré Sprint 4)
- **Payload** : `{ orderedIds }` — confirmé conforme (`MapStructureReorderSerializer` backend attend bien `orderedIds` en camelCase)

### 3.8. `PATCH /api/rubriques/{rubriqueId}/`
- **Responsabilité** : Renommage d'une rubrique (mise à jour du titre)
- **Conformité** : ✅ Conforme — migré Lot 3 (2026-04-10)
- **Payload** : `{ titre: newTitle }` — PATCH partiel, `RubriqueViewSet.update()` supporte `partial=True`
- **Usage** : `handleRenameSave` — dérive `rubriqueId` depuis `mapRubriques.find(r => r.id === mapRubriqueId)`, puis rechargement structure via `listMapRubriques(currentMapId)`

### 3.9. `DELETE /api/projets/{projetId}/`
- **Responsabilité** : Suppression définitive d'un projet
- **Conformité** : ✅ Conforme — migré Lot 3 (2026-04-10)
- **Usage** : `handleDelete` — suppression backend, puis `setProjects(filter)`, reset map/sélection si le projet supprimé était actif

---

## 4. États et contextes consommés

### 4.1. Stores Zustand

#### `useProjectStore`
- `selectedProjectId` : lu via `useSelectedVersion()` ET directement via `useProjectStore()` (double lecture — logs debug présents en production, lignes 89-91)
- `setSelectedProjectId` : utilisé pour changer le projet

#### `useXmlBufferStore`
- `setXml` / `getXml` : initialisation XML vide pour nouvelles rubriques
- `getStatus` : vérification modifications non sauvegardées via `selectedRubriqueId` du `selectionStore` ✅ (actif depuis Lot 1)

### 4.2. Bugs d'état résolus (Lot 1 — 2026-04-10)

**~~Bug A — `selectedMapItemId` local toujours null~~** → ✅ **Résolu**
- Suppression de l'état local `useState<number | null>(null)`
- `selectedMapItemId` et `selectedRubriqueId` proviennent désormais de `useSelectionStore`
- `hasUnsavedChanges` est réellement actif
- Ancienne conséquence résolue :
  - `selectedRubriqueId` dans LeftSidebar = toujours `null`
  - `hasUnsavedChanges` = toujours `false` → garde-fou inactif
  - `mapRubriquesToMapItems` reçoit `selectedMapItemId=null` → pas d'expansion automatique du chemin
  - `MapModule` reçoit `selectedMapItemId={null}` → aucun item surligné visuellement

**Bug B — `Desktop.mapItems` jamais alimenté**
- Desktop déclare `const [mapItems, setMapItems] = useState<MapItem[]>([])` mais `setMapItems` n'est jamais appelé (aucun callback ne remonte les mapItems de LeftSidebar vers Desktop)
- Conséquence : `selectedRubriqueId` dans Desktop = toujours `null` → `CentralEditor` reçoit `rubriqueId={null}` → l'éditeur ne charge jamais aucune rubrique

**Bug C — `handleToggleExpandMapNode` dans Desktop jamais invoqué**
- Desktop passe `onToggleExpand={handleToggleExpandMapNode}` à LeftSidebar
- LeftSidebar passe `onToggleExpand={toggleMapExpand}` (locale) à MapModule — pas la prop Desktop
- `handleToggleExpandMapNode` de Desktop ne sera jamais appelé

### 4.3. États locaux critiques

- `projects` : Cache local des projets chargés (non synchronisé avec backend)
- `mapRubriques` : Structure documentaire brute (source de vérité réelle dans LeftSidebar)
- `mapItems` : Structure transformée pour l'UI (dérivée de `mapRubriques`)
- `currentMapId` : Map active
- `selectedMapItemId` : **Toujours null** (voir Bug A)
- `pendingSelectId` : Sélection différée après création rubrique

---

## 5. DTO manipulés

### DTO consommés

| DTO | Source | Usage |
|-----|--------|-------|
| `ProjectDTO` | `GET /api/projets/{id}/` ou `/structure/` | Cache local `projects`, chargement projet |
| `MapRubriqueDTO` | `GET /api/maps/{id}/rubriques/` ou `/structure/` | Stocké dans `mapRubriques`, transformé en `MapItem[]` |
| `ProjectMap` | Inclus dans `ProjectDTO.maps` | Liste des maps d'un projet |

### DTO produits

| DTO | Source | Usage |
|-----|--------|-------|
| `MapItem` | Transformation de `MapRubriqueDTO[]` via `mapRubriquesToMapItems()` | UI uniquement |

---

## 6. Écarts avec le backend canonique

### 6.1. Routes — état au 2026-04-10 (mis à jour Lot 3)

Tous les appels backend sont désormais conformes au canon :

| Endpoint | Statut |
|----------|--------|
| `GET /api/projets/{id}/structure/` | ✅ Conforme |
| `GET /api/projets/{id}/` | ✅ Conforme |
| `GET /api/maps/{id}/structure/` | ✅ Conforme (migré Lot 2) |
| `POST /api/maps/{id}/structure/create/` | ✅ Conforme |
| `POST /api/maps/{id}/structure/{mr_id}/indent/` | ✅ Conforme |
| `POST /api/maps/{id}/structure/{mr_id}/outdent/` | ✅ Conforme |
| `POST /api/maps/{id}/structure/reorder/` | ✅ Conforme |
| `PATCH /api/rubriques/{id}/` | ✅ Conforme (migré Lot 3) |
| `DELETE /api/projets/{id}/` | ✅ Conforme (migré Lot 3) |

### 6.2. Opérations hors scope v1

| Opération | Comportement actuel | Raison hors scope |
|-----------|--------------------|-|
| Suppression rubrique | toast d'erreur | Backend bloque `DELETE /api/rubriques/{id}/` si rubrique encore en map ; pas d'endpoint `DELETE /api/maps/{id}/structure/{mr_id}/` |
| Clonage rubrique | toast d'erreur | Pas d'endpoint clone rubrique |
| Clonage projet | toast d'erreur | Pas d'endpoint clone projet (clone disponible sur version uniquement) |
| Publication/Export | toast d'erreur | Non implémenté — à traiter en Lot 5 |

### 6.3. Bugs structurels résolus

| Bug | Résolution |
|-----|------------|
| ~~`selectedMapItemId` local = null~~ | ✅ Résolu Lot 1 — `useSelectionStore` |
| ~~`hasUnsavedChanges` = false permanent~~ | ✅ Résolu Lot 1 |
| Double lecture `selectedProjectId` | ✅ Vérifié Lot 4 — pas de double lecture : `useSelectedVersion()` fournit la valeur, `useProjectStore` fournit uniquement le setter. Architecture correcte. |
| `getProjectDetailsValidated` sans préfixe `/api/` | ✅ Vérifié Lot 4 — la route backend est intentionnellement sans `/api/` (`path("projets/<pk>/details/")` à la racine). Le code frontend est correct. C10 était une fausse alerte. |
| Log debug `console.log("Fichier Word sélectionné :", file)` | ✅ Supprimé Lot 4 |

### 6.4. Mélange de responsabilités

- ~~Génération XML template dans `handleAddMapItem`~~ → ✅ **Extrait Lot 4** : `useNewRubriqueXml` hook dédié (`src/hooks/useNewRubriqueXml.ts`). LeftSidebar appelle `generateRubriqueXml("Nouvelle rubrique")`, sans connaître `selectedProduct` ni la construction du payload DITA.
- Initialisation buffer XML dans `useEffect` : frontière structure/contenu — documentation uniquement, comportement intentionnel conservé.

---

## 7. Risques et impacts

### Priorité bloquante
- ~~Bug sélection (A+B)~~ → ✅ Résolu Lot 1
- ~~Garde-fou inactif~~ → ✅ Résolu Lot 1
- ~~Route legacy `listMapRubriques`~~ → ✅ Résolu Lot 2

### Priorité critique
- ~~Rename/delete/clone rubrique locaux~~ → ✅ Rename migré Lot 3 ; delete/clone = toast hors scope v1

### Priorité importante
- ~~Suppression projet locale~~ → ✅ Résolu Lot 3
- Clone projet = toast hors scope v1
- Publication non implémentée → Lot 5

### Priorité mineure
- Double lecture `selectedProjectId` + logs debug → Lot 4
- `getProjectDetailsValidated` préfixe manquant → Lot 4

---

## 8. Verdict architectural

🟢 **Conforme pour tous les flux disponibles en v1 — opérations sans endpoint backend documentées hors scope**

**Résolus (Lots 1–3) :**
1. ✅ Chaîne de sélection LeftSidebar → `selectionStore` → Desktop → CentralEditor (Lot 1)
2. ✅ Garde-fou `hasUnsavedChanges` actif (Lot 1)
3. ✅ Rechargement structure via `/api/maps/{id}/structure/` (Lot 2)
4. ✅ Tous les flux structurels (create, indent, outdent, reorder) en routes canoniques
5. ✅ Renommage rubrique → `PATCH /api/rubriques/{id}/` + rechargement structure (Lot 3)
6. ✅ Suppression projet → `DELETE /api/projets/{id}/` + reset état (Lot 3)
7. ✅ Clone projet/rubrique, delete rubrique → toast hors scope v1, fake IDs supprimés (Lot 3)

**Résolu (Lots 4) :**
8. ✅ `prepareNewRubriqueXml` extrait vers `useNewRubriqueXml` hook — LeftSidebar ne connaît plus `selectedProduct` ni le payload DITA (Lot 4)
9. ✅ C10 et C11 vérifiés non-bugs (Lot 4)
10. ✅ Log debug `console.log` supprimé (Lot 4)

**Restant :**
- Initialisation buffer XML dans `useEffect` : frontière structure/contenu — comportement intentionnel, non bloquant

> **Fin de la cartographie `LeftSidebar` — Mise à jour 2026-04-10 (Lots 1–4)**

> **Fin de la cartographie `LeftSidebar` — Mise à jour 2026-04-10**
