# LeftSidebar — Roadmap & Suivi

Document de référence pour suivre l'évolution du composant `LeftSidebar` et de ses modules délégués (`ProjectModule`, `MapModule`, `MapItem`).  
Ce document est synthétique, durable, et conçu pour un travail non linéaire dans le temps.

---

# 🧭 Vue d'ensemble du plan

L'évolution est organisée en **5 lots**, menés progressivement :

1. **Lot 1 — Correction de la chaîne de sélection (TERMINÉ)**
2. **Lot 2 — Migration des routes vers le canon (TERMINÉ)**
3. **Lot 3 — CRUD projets et rubriques (TERMINÉ)**
4. **Lot 4 — Qualité code et hooks (TERMINÉ)**
5. **Lot 5 — Publication / Export (TERMINÉ)**

Travaux restants :
- **Lot 6 — Opérations hors scope v1** : endpoints non disponibles côté backend
- **Lot 7 — Évolutions UX** : améliorations non prioritaires

---

# ✅ Lot 1 — Correction de la chaîne de sélection (TERMINÉ)

### 🎯 Objectifs
- Corriger la sélection de rubrique cassée (mapItemId local toujours null).
- Activer réellement le garde-fou contre la perte de modifications.
- Alimenter correctement CentralEditor via le store partagé.

### ✔ Réalisé

- [X] Suppression de l'état local `useState<number | null>(null)` pour `selectedMapItemId`
- [X] Lecture de `selectedMapItemId` et `selectedRubriqueId` depuis `useSelectionStore`
- [X] Écriture dans `selectionStore.setSelection({ mapItemId, rubriqueId })` à chaque clic rubrique
- [X] `hasUnsavedChanges` désormais réellement actif (lit `getStatus(selectedRubriqueId)` du `xmlBufferStore`)
- [X] `MapModule` reçoit `selectedMapItemId` réel → surlignage visuel fonctionnel
- [X] Desktop lit `selectedRubriqueId` depuis `useSelectionStore` → `CentralEditor` reçoit le `rubriqueId` réel
- [X] Sélection différée après création : `pendingSelectId` → `selectionStore.setSelection()` post-rechargement

### 📝 Notes
Ce lot a corrigé trois bugs bloquants (A, B, C) qui rendaient l'édition des rubriques impossible. La chaîne `LeftSidebar → selectionStore → Desktop → CentralEditor` est désormais pleinement câblée.

---

# ✅ Lot 2 — Migration des routes vers le canon (TERMINÉ)

### 🎯 Objectifs
- Supprimer tous les appels à l'ancienne route `/api/maps/{id}/rubriques/`.
- Aligner le rechargement de structure sur l'endpoint canonique.

### ✔ Réalisé

- [X] `listMapRubriques(mapId)` → redirigé vers `GET /api/maps/{id}/structure/`
- [X] Rechargement après `create`, `indent`, `outdent`, `reorder` via la route canonique
- [X] Aucun appel résiduel vers `/rubriques/` confirmé

### 📝 Notes
Le DTO `MapRubriqueDTO` est resté inchangé — `MapRubriqueStructureSerializer` retourne la même structure que l'ancien endpoint. Migration transparente pour le frontend.

---

# ✅ Lot 3 — CRUD projets et rubriques (TERMINÉ)

### 🎯 Objectifs
- Implémenter la suppression de projet avec persistance backend.
- Implémenter le renommage de rubrique.
- Clarifier le périmètre hors scope v1 (delete/clone rubrique, clone projet).

### ✔ Réalisé

- [X] `handleDelete(projectId)` → `DELETE /api/projets/{id}/` + reset état map + déselection projet supprimé
- [X] `handleRenameSave(mapRubriqueId, newTitle)` → dérive `rubriqueId` depuis `mapRubriques.find()` → `PATCH /api/rubriques/{id}/` + rechargement structure
- [X] `handleClone(projectId)` → toast informatif hors scope v1 (clone backend non disponible)
- [X] `handleDeleteMapItem(mapRubriqueId)` → toast informatif hors scope v1 (endpoint détachement non disponible)
- [X] `handleCloneMapItem(mapRubriqueId)` → toast informatif hors scope v1
- [X] Suppression des fake IDs et mutations locales sans backend

### 📝 Notes
Les opérations hors scope v1 (clone rubrique, delete rubrique, clone projet) affichent un toast explicite. Le backend bloque `DELETE /api/rubriques/{id}/` si la rubrique est encore rattachée à une map — comportement correct documenté.

---

# ✅ Lot 4 — Qualité code et hooks (TERMINÉ)

### 🎯 Objectifs
- Extraire la logique de génération XML template hors de LeftSidebar.
- Supprimer les logs debug en production.
- Vérifier les fausses alertes identifiées.

### ✔ Réalisé

- [X] `prepareNewRubriqueXml()` extrait dans le hook dédié `useNewRubriqueXml` (`src/hooks/useNewRubriqueXml.ts`)
- [X] LeftSidebar appelle `generateRubriqueXml("Nouvelle rubrique")` sans connaître `selectedProduct` ni la construction du payload DITA
- [X] `console.log("Fichier Word sélectionné :", file)` supprimé
- [X] C10 — double lecture `selectedProjectId` : **vérifiée non-bug** — `useSelectedVersion()` fournit la valeur, `useProjectStore` uniquement le setter
- [X] C11 — `getProjectDetailsValidated` préfixe `/api/` manquant : **vérifiée non-bug** — route backend intentionnellement sans `/api/`

### 📝 Notes
LeftSidebar ne connaît plus la construction du payload DITA. La frontière structure/contenu est mieux respectée. La génération XML reste dans le composant via `useEffect` d'initialisation du buffer (comportement intentionnel, non bloquant).

---

# ✅ Lot 5 — Publication / Export (TERMINÉ)

### 🎯 Objectifs
- Implémenter la publication d'une map depuis l'UI projet.
- Brancher `ProjectModule` sur le backend de publication.

### ✔ Réalisé

- [X] `handlePublish(projectId)` → affiche le formulaire d'export (`showExportCard = true`)
- [X] `handleExport(format)` → détermine la map cible via la règle `is_master` sur `projectMaps`
- [X] `publishMap(mapId, format)` → `POST /api/publier-map/{map_id}/` — payload `{ format }`
- [X] Réponse traitée : toast succès avec `result.message` ou toast erreur (message backend ou générique)
- [X] Formats publication alignés sur `PUBLISH_FORMATS` du backend (`pdf`, `html5`, `xhtml`, `scorm`, `markdown`, `eclipsehelp`)
- [X] Règle de sélection map documentée : master en priorité → unique sans master → blocage si plusieurs sans master

### 📝 Notes
L'UI de publication reste déclenchée depuis le module Projet. La résolution projet → map est entièrement dans `LeftSidebar.handleExport`. `ProjectModule` délègue via `onExport(format)` sans connaître la logique de résolution.

---

# 🔜 Lot 6 — Opérations hors scope v1 (BLOQUÉ — backend manquant)

### 🎯 Objectifs
Ces opérations sont actuellement bloquées par l'absence d'endpoints backend.  
Ce lot ne sera activable qu'après décision et implémentation backend.

### 🧩 Tâches en attente

#### 6.1 — Suppression de rubrique depuis la map

- [ ] Implémenter `DELETE /api/maps/{mapId}/structure/{mapRubriqueId}/` côté backend (endpoint de détachement)
- [ ] Remplacer le toast par un appel `handleDeleteMapItem(mapRubriqueId)` réel
- [ ] Gérer la distinction : détachement de la map (MapRubrique) vs suppression de la rubrique (Rubrique)

> ⚠️ Le backend bloque actuellement `DELETE /api/rubriques/{id}/` si la rubrique est rattachée à une map. Il n'existe pas d'endpoint de détachement de MapRubrique.

#### 6.2 — Clonage de rubrique

- [ ] Définir la sémantique de clonage (clone profond ? clone référence ?)
- [ ] Implémenter l'endpoint backend
- [ ] Brancher `handleCloneMapItem` sur l'appel backend

#### 6.3 — Clonage de projet

- [ ] Implémenter `POST /api/versions/{id}/clone/` côté backend (VersionProjet)
- [ ] Brancher `handleClone(projectId)` sur le nouvel endpoint

### 📝 Notes
Ces trois opérations affichent aujourd'hui un toast informatif. La décision de priorisation appartient au pilotage (voir `03_PILOTAGE/30_PILOTAGE_PROJET.md`).

---

# 🔜 Lot 7 — Évolutions UX (NON PRIORITAIRES)

### 🧩 Tâches envisagées

#### 7.1 — Initialisation buffer XML

- [ ] L'initialisation du buffer XML pour chaque rubrique (template vide) reste dans un `useEffect` de LeftSidebar
- [ ] Cette frontière structure/contenu est intentionnelle mais pourrait migrer dans un hook dédié si la complexité augmente

#### 7.2 — Cache projets

- [ ] L'état local `projects` est un cache non synchronisé avec le backend (pas de TTL)
- [ ] Envisager un mécanisme d'invalidation ou une migration vers un store dédié

#### 7.3 — Performance grandes listes

- [ ] MapModule n'est pas virtualisé pour les listes de rubriques de grande taille
- [ ] À évaluer si des projets dépassent ~200 rubriques

---

# 📘 Annexes

### 🔍 Historique des lots

| Lot | Date | Résultat |
|-----|------|---------|
| Lot 1 | 2026-04-10 | Chaîne de sélection corrigée — CentralEditor alimenté |
| Lot 2 | 2026-04-10 | Routes canoniques — `/api/maps/{id}/structure/` |
| Lot 3 | 2026-04-10 | CRUD projets backend + périmètre hors scope v1 clarifié |
| Lot 4 | 2026-04-10 | `useNewRubriqueXml` extrait, logs nettoyés, fausses alertes vérifiées |
| Lot 5 | 2026-04-10 | Publication `POST /api/publier-map/{map_id}/` branchée |

### 📌 TODO futurs (non priorisés)

- 1️⃣ Import Word depuis LeftSidebar : bouton présent dans MapModule, logique non implémentée
- 2️⃣ Drag & drop cross-niveau : réorganisation cross-niveau fiable nécessite la projection `level → parent/ordre` (voir `MAP_FRONTEND_ROADMAP.md`)
- 3️⃣ Scroll vers rubrique sélectionnée : après chargement d'une map, la rubrique active n'est pas scrollée dans le viewport automatiquement

---

# ✔️ Fin du document
