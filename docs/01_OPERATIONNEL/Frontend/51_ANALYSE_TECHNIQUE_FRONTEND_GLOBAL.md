# Documentum — Analyse technique des composants frontend

> **Objet** : analyse technique des composants frontend principaux (rôles, dépendances, flux, DTO, règles)
>
> **Statut** : document de référence opérationnelle
>
> **Composants couverts :** `LeftSidebar`, `MapModule`, `ProjectModule`, `Desktop`, `CentralEditor`
>
> **Dernière mise à jour** : 2026-04-16

---

# Documentation technique des composants

## 1. LeftSidebar

### 1. Rôle fonctionnel

- Responsabilité principale : orchestrer la sélection et la gestion des projets et des maps documentaires. Point d’entrée pour la navigation dans la structure documentaire.
- Orchestration :
  - Chargement et affichage de la liste des projets
  - Chargement et affichage de la structure d’une map (rubriques)
  - Gestion de la sélection de projet/map/rubrique
  - Protection contre la perte de modifications non sauvegardées
  - Initialisation du buffer XML pour chaque rubrique
- Ne doit pas :
  - Gérer directement l’affichage visuel (délégué à ProjectModule et MapModule)
  - Manipuler directement le contenu XML des rubriques (via le buffer)
  - Effectuer la sauvegarde des rubriques (responsabilité de CentralEditor)

### 2. Dépendances directes

**Hooks métier :**
- `useSelectedProduct` : produit sélectionné (pour génération XML)
- `useSelectedVersion` : version active du projet sélectionné
- Aucun hook métier dédié (logique intégrée)

**Stores Zustand :**
- `useProjectStore` : `selectedProjectId` (via `useSelectedVersion()`), `setSelectedProjectId` (accès direct setter)
- `useXmlBufferStore` : `setXml`, `getXml`, `getStatus`
- `useSelectionStore` : `selectedMapItemId`, `selectedRubriqueId`, `setSelection`, `clearSelection` ✅ (Lot 1)

**Hooks délégués :**
- `useSelectedVersion()` : source unique de `selectedProjectId`
- `useNewRubriqueXml()` : génération XML template rubrique — encapsule `useSelectedProduct` + payload DITA ✅ (Lot 4)

**DTO manipulés :**
- `ProjectDTO` : lecture (liste projets, chargement projet)
- `MapRubriqueDTO` : lecture/écriture (structure map, création rubrique)
- `MapItem` : transformation UI (dérivé de `MapRubriqueDTO` via `mapRubriquesToMapItems`)
- `ProjectMap` : lecture (maps associées à un projet)

**Services API (état réel au 2026-04-10, Lots 1–5) :**
- `api.get(‘/api/projets/{id}/’)` : chargement projet ✅
- `api.get(‘/api/projets/{id}/structure/’)` : structure map active ✅
- `api.delete(‘/api/projets/{id}/’)` : suppression projet ✅ (Lot 3)
- `api.post(‘/api/maps/{id}/structure/create/’)` : création rubrique + rattachement map ✅ (Sprint 4)
- `listMapRubriques(mapId)` → `GET /api/maps/{id}/structure/` ✅ (migré Lot 2)
- `api.patch(‘/api/rubriques/{id}/’, { titre })` : renommage rubrique ✅ (Lot 3)
- `publishMap(mapId, format)` → `POST /api/publier-map/{map_id}/` ✅ (Lot 5)
- `api.post(‘/api/maps/{id}/structure/{mr_id}/indent/’)` : indentation ✅ (Sprint 4)
- `api.post(‘/api/maps/{id}/structure/{mr_id}/outdent/’)` : désindentation ✅ (Sprint 4)
- `api.post(‘/api/maps/{id}/structure/reorder/’)` : réorganisation drag & drop ✅ (Sprint 4)
- `generateRubriqueXml()` via `useNewRubriqueXml` hook : génération XML initial — externalisé hors de LeftSidebar ✅ (Lot 4)

### 3. Flux métier principaux

**Flux 1 : Ouverture d’un projet**
- Déclencheur : sélection projet via `ProjectModule` → `handleSelect(projectId)`
- Vérification : `hasUnsavedChanges` via `getStatus(selectedRubriqueId)`
- Si OK :
  - `openProject(projectId)` :
    - Cache local ou `GET /api/projets/{id}/`
    - `setSelectedProjectId(projectId)` (store)
    - `GET /api/projets/{id}/structure/` → `setCurrentMapId` + `setMapRubriques`
    - Reset sélection rubrique
- Effet : `useEffect` sur `selectedProjectId` recharge la structure

**Flux 2 : Création d’une rubrique**
- Déclencheur : clic "Ajouter rubrique" → `handleAddMapItem()`
- Étapes :
  1. Calcul parent : `getInsertionParentId()` (logique métier)
  2. Génération XML : `prepareNewRubriqueXml()` (template DITA) — ⚠️ logique contenu dans composant structure
  3. Création backend : `POST /api/maps/{id}/structure/create/` ✅ (route canonique, migré Sprint 4)
  4. Rechargement : `listMapRubriques(mapId)` → `GET /api/maps/{id}/structure/` → `setMapRubriques` ✅ (Lot 2)
  5. Sélection différée : `setPendingSelectId(createdId)` → `selectionStore.setSelection()` (Lot 1)

**Flux 3 : Sélection d’une rubrique**
- Déclencheur : clic rubrique → `handleSelectMapItem(id)`
- Vérification : `hasUnsavedChanges` (garde-fou — actif depuis Lot 1)
- Si OK : `selectMapItem(id)` → `selectionStore.setSelection({ mapItemId, rubriqueId })` → Desktop lit `selectedRubriqueId` depuis store → `CentralEditor` reçoit `rubriqueId` réel ✅ (Lot 1)
- Effet : `useEffect` initialise le buffer XML si absent

**Flux 4 : Réorganisation (drag & drop)**
- Déclencheur : drag & drop dans `MapModule` → `handleReorder(orderedIds)`
- Backend : `POST /api/maps/{id}/structure/reorder/` avec `{ orderedIds }` ✅ (Sprint 4)
- Rechargement : `listMapRubriques(mapId)` → `GET /api/maps/{id}/structure/` ✅ (Lot 2)

**Flux 5 : Indentation / Désindentation**
- Déclencheur : boutons indenter/désindenter → `handleIndent/Outdent(mapRubriqueId)`
- Backend : `POST /api/maps/{id}/structure/{mr_id}/indent|outdent/` ✅ (Sprint 4)
- Rechargement : `listMapRubriques(mapId)` → `GET /api/maps/{id}/structure/` ✅ (Lot 2)

**Flux 6 : Publication**
- Déclencheur : bouton "Publier" (ProjectModule) → `onPublish(projectId)` → `setShowExportCard(true)` ; choix format → bouton "Publier" → `onExport(format)`
- Logique (LeftSidebar.handleExport) : détermine map cible depuis `projectMaps` via règle `is_master`, puis appelle `publishMap(mapId, format)` ✅ (Lot 5)
- Backend : `POST /api/publier-map/{map_id}/` — payload `{ format }` — réponse `{ status, message, map?, rubriques_count?, format? }`
- Feedback : toast succès (`result.message`) ou toast erreur (message backend ou générique)

### 4. Contrats de données (DTO)

**ProjectDTO** (Frontend)
- Origine : Backend (`/api/projets/{id}/`)
- Rôle : représentation projet avec maps associées
- Champs clés : `id`, `nom`, `description?`, `maps: ProjectMap[]`
- Usage : lecture seule (cache local)

**MapRubriqueDTO** (Backend)
- Origine : Backend (`/api/maps/{mapId}/rubriques/`)
- Rôle : structure arborescente rubriques dans une map
- Champs clés : `id`, `ordre`, `parent: number | null`, `rubrique: { id, titre, ... }`
- Usage : lecture/écriture (source de vérité structure)

**MapItem** (Frontend UI)
- Origine : transformation de `MapRubriqueDTO` via `mapRubriquesToMapItems()`
- Rôle : représentation UI avec niveaux, expansion, sélection
- Champs clés : `id`, `rubriqueId`, `title`, `level`, `expanded`, `parentId`
- Usage : lecture/écriture (état UI local)

**ProjectMap** (Backend)
- Origine : Backend (imbriqué dans `ProjectDTO`)
- Rôle : liste des maps d’un projet
- Champs clés : `id`, `nom`, `is_master`
- Usage : lecture seule

### 5. Règles et invariants métier

- Une seule map active par projet (dérivée de `/structure/`)
- Une seule rubrique sélectionnée à la fois (`selectedMapItemId`)
- Protection : changement de rubrique/projet bloqué si `status === "dirty"`
- Structure : présence d’une racine (`parent === null`) requise
- Buffer XML : initialisation automatique pour chaque rubrique (template si absent)
- Sélection différée : après création, sélection via `pendingSelectId` après rechargement

### 6. Points de vigilance / dette potentielle

- ~~**Bug BLOQUANT** : `selectedMapItemId` local toujours null~~ → ✅ Résolu Lot 1
- ~~**Bug BLOQUANT** : `Desktop.mapItems` jamais alimenté~~ → ✅ Résolu Lot 1
- ~~Route `listMapRubriques` legacy~~ → ✅ Résolu Lot 2
- ~~Rename rubrique local~~ → ✅ Résolu Lot 3
- ~~Suppression projet locale~~ → ✅ Résolu Lot 3
- ~~Publication non implémentée~~ → ✅ Résolu Lot 5
- ~~Double lecture `selectedProjectId`~~ → ✅ Vérifié Lot 4 — pas de double lecture (fausse alerte)
- ~~`getProjectDetailsValidated` préfixe manquant~~ → ✅ Vérifié Lot 4 — route correcte (fausse alerte)
- ~~`prepareNewRubriqueXml` dans LeftSidebar~~ → ✅ Extrait dans `useNewRubriqueXml` hook (Lot 4)
- ~~Log debug production~~ → ✅ Supprimé Lot 4
- Delete/clone rubrique : hors scope v1 (toast)
- Clone projet : hors scope v1 (toast)

---

## 2. MapModule

### 1. Rôle fonctionnel

- Responsabilité principale : afficher et gérer l’interaction avec la liste des rubriques d’une map. Composant de présentation délégué par `LeftSidebar`.
- Orchestration :
  - Affichage arborescente rubriques (avec expansion/réduction)
  - Gestion drag & drop pour réorganisation
  - Délégation des actions (création, suppression, indentation) au parent
  - Filtrage des items visibles selon expansion
- Ne doit pas :
  - Appeler directement les APIs backend
  - Gérer l’état de sélection global (reçoit `selectedMapItemId` en prop)
  - Modifier directement la structure de données (reçoit `mapItems` en prop)

### 2. Dépendances directes

**Hooks métier :**
- Aucun hook métier (composant de présentation)

**Stores / Contextes :**
- Aucun store direct (état via props)

**DTO manipulés :**
- `MapItem[]` : lecture seule (affichage)

**Services API :**
- Aucun appel API direct (délégué au parent via callbacks)

**Bibliothèques externes :**
- `@dnd-kit/core` : drag & drop
- `@dnd-kit/sortable` : tri

### 3. Flux métier principaux

**Flux 1 : Affichage de la liste**
- Déclencheur : changement de `mapItems` (prop)
- Filtrage : `getVisibleItems(mapItems)` selon `expanded`
- Rendu : `MapItem` pour chaque item visible

**Flux 2 : Sélection d’une rubrique**
- Déclencheur : clic sur `MapItem`
- Vérification : `isStructuralOnlyNode(item)` (racine non sélectionnable)
- Action : `onSelect(item.id)` → `LeftSidebar.handleSelectMapItem()`

**Flux 3 : Drag & drop**
- Déclencheur : fin de drag → `handleDragEnd(event)`
- Calcul : `arrayMove(visibleItems, oldIndex, newIndex)`
- Action : `onReorder(orderedIds)` → `LeftSidebar.handleReorder()`

**Flux 4 : Actions contextuelles**
- Délégation : boutons → callbacks parent (`onAdd`, `onDelete`, `onIndent`, etc.)
- Désactivation : boutons désactivés si racine sélectionnée ou aucune sélection

### 4. Contrats de données (DTO)

**MapItem** (Frontend UI)
- Origine : prop depuis `LeftSidebar`
- Rôle : représentation UI d’une rubrique dans l’arborescence
- Champs clés : `id`, `rubriqueId`, `title`, `level`, `expanded`, `parentId`, `isMaster`
- Usage : lecture seule (affichage)

### 5. Règles et invariants métier

- Racine documentaire : non sélectionnable, non clonable, non supprimable (`isStructuralOnlyNode`)
- Visibilité : items enfants masqués si parent `expanded === false`
- Drag & drop : opération sur items visibles uniquement
- Sélection : une seule rubrique sélectionnée à la fois

### 6. Points de vigilance / dette potentielle

- Filtrage visibilité : logique `getVisibleItems()` locale, risque d’incohérence avec état parent
- Drag & drop : réorganisation sur items visibles uniquement (pas sur structure complète)
- Couplage : dépendance forte aux callbacks parent (interface large)
- Performance : pas de virtualisation pour grandes listes

---

## 3. ProjectModule

### 1. Rôle fonctionnel

- Responsabilité principale : afficher et gérer l’interaction avec la liste des projets. Composant de présentation délégué par `LeftSidebar`.
- Orchestration :
  - Affichage liste projets avec sélection visuelle
  - Délégation actions (création, chargement, clonage, suppression, publication)
  - Affichage modal export après publication
- Ne doit pas :
  - Appeler directement les APIs backend
  - Gérer l’état de sélection global (reçoit `selectedProjectId` en prop)
  - Modifier directement la liste de projets (reçoit `projects` en prop)

### 2. Dépendances directes

**Hooks métier :**
- Aucun hook métier (composant de présentation)

**Stores / Contextes :**
- Aucun store direct (état via props)

**DTO manipulés :**
- `ProjectDTO[]` : lecture seule (affichage)

**Services API :**
- Aucun appel API direct (délégué au parent via callbacks)

### 3. Flux métier principaux

**Flux 1 : Sélection d’un projet**
- Déclencheur : clic sur projet dans la liste
- Action : `onSelect(project.id)` → `LeftSidebar.handleSelect()`

**Flux 2 : Publication d’un projet**
- Déclencheur : clic "Publier" → `onPublish(projectId)`
- Action : `LeftSidebar.handlePublish()` → affichage `showExportCard`
- Sélection format : `Select` avec options (PDF, Web, Moodle, Fiche, Personnalisé)
- Export : `handleExport()` (logique non implémentée, toast uniquement)

**Flux 3 : Actions contextuelles**
- Délégation : boutons → callbacks parent (`onAdd`, `onLoad`, `onClone`, `onDelete`)
- Désactivation : boutons désactivés si aucun projet sélectionné

### 4. Contrats de données (DTO)

**ProjectDTO** (Frontend)
- Origine : prop depuis `LeftSidebar`
- Rôle : représentation projet dans la liste
- Champs clés : `id`, `nom`, `description?`, `maps: ProjectMap[]`
- Usage : lecture seule (affichage)

### 5. Règles et invariants métier

- Sélection : un seul projet sélectionné à la fois (`selectedProjectId`)
- Publication : nécessite projet sélectionné + format choisi
- Actions : certaines actions nécessitent un projet sélectionné

### 6. Points de vigilance / dette potentielle

- Export : logique non implémentée (toast uniquement)
- Modal export : état local `selectedFormat`, non synchronisé avec backend
- Couplage : dépendance forte aux callbacks parent
- Options export : hardcodées dans le composant (`EXPORT_OPTIONS`)

---

## 4. Desktop

### 1. Rôle fonctionnel

- Responsabilité principale : orchestrer la mise en page et la coordination entre `LeftSidebar`, `CentralEditor`, `RightSidebar`, et `TopBar`. Point d’entrée de l’écran principal.
- Orchestration :
  - Gestion état expansion/réduction des sidebars
  - Gestion mode preview (masquage sidebars)
  - Coordination sélection rubrique entre `LeftSidebar` et `CentralEditor`
  - Gestion dock editors (QuestionEditor, ExerciceEditor)
- Ne doit pas :
  - Gérer directement le contenu des rubriques
  - Appeler directement les APIs backend
  - Gérer l’état métier des projets/maps (délégué à `LeftSidebar`)

### 2. Dépendances directes

**Hooks métier :**
- Aucun hook métier (coordination UI)

**Stores / Contextes :**
- `useSelectionStore` : lit `selectedRubriqueId` (source de vérité pour la rubrique active) ✅ (Lot 1)

**DTO manipulés :**
- Aucun DTO backend ni DTO UI direct — Desktop ne manipule pas de données métier, il transmet `selectedRubriqueId` en prop `rubriqueId` à `CentralEditor`

**Services API :**
- Aucun appel API direct

### 3. Flux métier principaux

**Flux 1 : Sélection d’une rubrique**
- Déclencheur : sélection dans `LeftSidebar` → `selectionStore.setSelection({ mapItemId, rubriqueId })`
- Desktop lit `selectedRubriqueId` directement depuis `useSelectionStore` — aucun calcul local sur mapItems ✅ (Lot 1)
- Propagation : `selectedRubriqueId` (store) → prop `rubriqueId` à `CentralEditor`
- Effet : `CentralEditor` charge la rubrique correspondante

**Flux 2 : Mode preview**
- Déclencheur : toggle preview → `togglePreviewMode()`
- Sauvegarde : état précédent des sidebars
- Action : masquage sidebars en preview, restauration à la sortie

**Flux 3 : Expansion/réduction sidebars**
- Déclencheur : toggles dans `LeftSidebar` / `RightSidebar`
- Calcul marges : `marginLeft` / `marginRight` selon états expansion
- Effet : `CentralEditor` s’adapte aux marges

**Flux 4 : Gestion dock editors**
- Déclencheur : toggles QuestionEditor/ExerciceEditor
- État : `visibleDockEditor: "question" | "exercice" | null`
- Redimensionnement : `dockEditorHeight` avec `VerticalDragHandle`

### 4. Contrats de données (DTO)

Desktop ne maintient aucun DTO de données métier. Il lit `selectedRubriqueId` depuis `useSelectionStore` et le transmet directement en prop `rubriqueId` à `CentralEditor`.

> Mis à jour 2026-04-16 — correction post-Lot 1 : l’état `mapItems` local et le calcul de `selectedRubriqueId` ont été supprimés. La description antérieure décrivait le comportement pré-Lot 1.

### 5. Règles et invariants métier

- Sélection rubrique : une seule rubrique active à la fois, source de vérité dans `useSelectionStore`
- Mode preview : sidebars masquées, pas de modification possible
- Dock editors : un seul dock visible à la fois (`visibleDockEditor`)
- Marges : calculées dynamiquement selon états expansion

### 6. Points de vigilance / dette potentielle

- Props drilling : nombreux états passés en props (candidat pour contexte)
- Responsive : marges fixes, pas d’adaptation mobile

---

## 5. CentralEditor (XCentralEditor)

### 1. Rôle fonctionnel

- Responsabilité principale : éditer le contenu XML DITA d’une rubrique via TipTap. Point central d’édition avec synchronisation XML ↔ TipTap JSON.
- Orchestration :
  - Chargement XML depuis buffer → conversion TipTap → affichage
  - Synchronisation bidirectionnelle modifications TipTap → XML buffer
  - Sauvegarde rubrique (XML → backend)
  - Fonctionnalités : grammaire, recherche/remplacement, historique, commandes vocales, dictée
- Ne doit pas :
  - Gérer la structure des maps (délégué à `LeftSidebar`)
  - Gérer la sélection de rubrique (reçoit `rubriqueId` en prop)
  - Appeler directement les APIs de maps/projets

### 2. Dépendances directes

**Hooks métier :**
- `useDitaLoader` : chargement XML → TipTap
- `useXmlBufferSync` : synchronisation TipTap → XML buffer
- `useRubriqueChangeTracker` : détection modifications non sauvegardées
- `useRubriqueSave` : sauvegarde rubrique (XML → backend)
- `useGrammarChecker` : vérification orthographe/grammaire
- `useFindReplaceTipTap` : recherche/remplacement
- `useEditorHistoryTracker` : historique actions
- `useSpeechCommands` : commandes vocales
- `useSpeechToText` : dictée vocale
- `useEditorShortcuts` : raccourcis clavier

**Stores Zustand :**
- `useXmlBufferStore` : `getXml`, `setXml`, `setStatus` (lecture/écriture buffer XML)

**DTO manipulés :**
- XML string : lecture/écriture (via buffer)
- Aucun DTO structuré direct (XML brut)

**Services API :**
- `useRubriqueSave` → `PUT /api/rubriques/{id}/` (sauvegarde contenu XML)
- `POST /api/orthographe/` (vérification grammaire, via `useGrammarChecker`)

**Bibliothèques externes :**
- `@tiptap/react` : éditeur riche
- Extensions TipTap : `getAllExtensions()` (nodes DITA personnalisés)

### 3. Flux métier principaux

**Flux 1 : Chargement d’une rubrique**
- Déclencheur : changement de `rubriqueId` (prop)
- Étapes :
  1. Récupération XML : `getXml(rubriqueId)` depuis buffer
  2. Chargement : `useDitaLoader` convertit XML → TipTap JSON → injection dans éditeur
  3. État : `isLoading` pendant conversion
  4. Reset : `resetAfterSave()` après chargement
- Effet : éditeur affiche le contenu de la rubrique

**Flux 2 : Modification du contenu**
- Déclencheur : saisie utilisateur dans TipTap
- Synchronisation : `useXmlBufferSync` convertit TipTap JSON → XML → `setXml(rubriqueId, xml)`
- Statut : `setStatus(rubriqueId, "dirty")`
- Détection : `useRubriqueChangeTracker` marque `hasChanges = true`

**Flux 3 : Sauvegarde d’une rubrique**
- Déclencheur : clic "Sauvegarder" → `onSaveRubrique()`
- Étapes :
  1. Récupération XML : `getXml(rubriqueId)` depuis buffer
  2. Sauvegarde : `useRubriqueSave` → `PUT /api/rubriques/{id}/` avec `contenu_xml`
  3. Statut : `setStatus(rubriqueId, "saved")`
  4. Reset : `resetAfterSave()` → `hasChanges = false`

**Flux 4 : Vérification grammaire**
- Déclencheur : `onUpdate` TipTap → `checkGrammar(editor.getText())`
- API : `POST /api/orthographe/` (via `useGrammarChecker`)
- Affichage : erreurs marquées dans l’éditeur, popup suggestions au clic

**Flux 5 : Recherche/remplacement**
- Déclencheur : ouverture dialog "Rechercher" → `dialogs.openDialog("find")`
- Actions : `find()`, `replace()`, `replaceAll()` (via `useFindReplaceTipTap`)
- État : `findValue`, `replaceValue` (local)

**Flux 6 : Dictée vocale**
- Déclencheur : clic "Dictée" → `start()`
- Capture : `useSpeechToText` → insertion texte dans éditeur
- Arrêt : clic utilisateur ou `stop()`

### 4. Contrats de données (DTO)

**XML string** (Frontend/Backend)
- Origine : Backend (`Rubrique.contenu_xml`) ou génération frontend
- Rôle : contenu DITA XML de la rubrique
- Format : XML DITA valide (`<topic>`, `<concept>`, `<task>`, etc.)
- Usage : lecture/écriture (via buffer, sauvegarde backend)

**Rubrique (Backend DTO implicite)**
- Origine : Backend (`PUT /api/rubriques/{id}/`)
- Rôle : mise à jour contenu XML
- Champs clés : `contenu_xml: string`
- Usage : écriture (sauvegarde)

### 5. Règles et invariants métier

- Une seule rubrique éditée à la fois (`rubriqueId`)
- Buffer XML : source de vérité avant sauvegarde
- Synchronisation : modifications TipTap → XML buffer en temps réel
- Statut buffer : `"dirty"` si modifications non sauvegardées, `"saved"` après sauvegarde
- Protection : changement de rubrique bloqué si `status === "dirty"` (géré par `LeftSidebar`)
- Conversion XML ↔ TipTap : bidirectionnelle via `xmlToTiptap` / `tiptapToXml`

### 6. Points de vigilance / dette potentielle

- Conversion XML ↔ TipTap : logique critique, risque de perte de données si incomplète
- Buffer XML : état local, risque de perte en cas de rafraîchissement
- Performance : conversion XML → TipTap peut être lente pour gros documents
- Extensions TipTap : dépendance forte aux nodes DITA personnalisés
- Grammaire : appel API à chaque modification, risque de surcharge
- Historique : stockage local uniquement, non persisté
- Dictée vocale : gestion état complexe (`inputSourceRef`), risque de conflits

---

# Synthèse des dépendances croisées

## Flux de données principal

```
Desktop
  ├─ LeftSidebar
  │   ├─ ProjectModule (présentation)
  │   └─ MapModule (présentation)
  │       └─ MapItem (présentation)
  └─ CentralEditor
      ├─ EditorHeader
      ├─ EditorToolbar
      └─ EditorContent (TipTap)
```

## Stores partagés

- `useProjectStore` : `selectedProjectId` (consommé par `LeftSidebar`, `Desktop`)
- `useXmlBufferStore` : buffer XML rubriques (consommé par `LeftSidebar`, `CentralEditor`)
- `useSelectionStore` : sélection map courante — `selectedMapItemId` + `selectedRubriqueId` (écrit par `LeftSidebar`, lu par `Desktop` → `CentralEditor`)

## Points d’intégration critiques

1. Sélection rubrique : `LeftSidebar` → `selectionStore` → `Desktop` → `CentralEditor` (via `rubriqueId`) — ✅ câblé Lot 1
2. Protection modifications : `CentralEditor` (statut buffer `xmlBufferStore`) → `LeftSidebar` (garde-fou via `selectedRubriqueId` du `selectionStore`) — ✅ actif Lot 1
3. Buffer XML : `LeftSidebar` (initialisation) ↔ `CentralEditor` (lecture/écriture)

---

Cette documentation sert de référence pour comprendre l’architecture, les flux et les points d’attention pour l’évolution du système.