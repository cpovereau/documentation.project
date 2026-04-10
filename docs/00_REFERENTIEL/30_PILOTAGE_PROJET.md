# 🧭 30 — Pilotage du projet Documentum

---

# 🎯 Objectif

Ce document permet de :

- piloter les évolutions du projet
- prioriser les travaux
- suivre l’avancement
- aligner documentation et développement

---

# 🔒 Règle fondamentale

👉 Ce document ne définit pas la vérité.

Il organise :
- ce qui doit être fait
- dans quel ordre
- avec quel niveau de priorité

---

# 🧩 1. Vision globale

## 🎯 Objectif actuel

Stabiliser et aligner :
- le backend
- le frontend
- le modèle métier
- les flux critiques

---

## 📌 Axes principaux

1. Alignement Backend / Référentiel
2. Stabilisation CentralEditor
3. Nettoyage Frontend (architecture)
4. Finalisation des flux métier
5. Préparation publication réelle

---

# 📊 2. Chantiers actifs

---

## 🔧 Chantier 1 — Backend réalignement

### Objectif
Aligner le backend réel avec le référentiel canonique

### Documents liés
- documentum_referentiel_backend_canonique.md
- BACKEND_REALIGNMENT_SPRINT_*.md

### Avancées (Sprints 1–5, terminés le 2026-04-10)
- **Sprint 1** : uniformisation des erreurs via `custom_exception_handler`, protection `DELETE /rubriques/{id}/`, route canonique `POST /api/maps/{id}/structure/attach/`
- **Sprint 2** : service `create_project()` atomique, `ProjetViewSet.create()` pleinement opérationnel
- **Sprint 3** : suppression du code mort (`CreateMapView`, `map_rubriques_view`), sécurisation des vues legacy
- **Sprint 4** : migration frontend vers routes canoniques (Phase A) + suppression complète des routes legacy (Phase B)
- **Sprint 5** : logs métier propres sur tous les flux structurels, endpoint `/health/`, nettoyage sérialiseurs morts

### Statut
✅ TERMINÉ

---

## Chantier 2 — Intégration frontend du backend canonique

### Objectif :
- brancher réellement le frontend sur les routes et contrats canoniques
- supprimer les restes de logique transitoire
- fiabiliser les reloads et la source de vérité backend

### Statut :
EN COURS — Audit réalisé le 2026-04-10

### Résultats de l'audit (2026-04-10)

**Points déjà conformes (Sprint 4 backend migré dans le code) :**
- `POST /api/maps/{id}/structure/create/` — création rubrique ✅
- `POST /api/maps/{id}/structure/{mr_id}/indent/` ✅
- `POST /api/maps/{id}/structure/{mr_id}/outdent/` ✅
- `POST /api/maps/{id}/structure/reorder/` ✅
- `POST /api/projets/` — création projet ✅
- `GET /api/projets/{id}/structure/` — chargement structure ✅

**Écarts critiques restants :**

| # | Écart | Composant | Risque |
|---|-------|-----------|--------|
| ~~C1~~ | ~~`Desktop.mapItems` jamais alimenté → `rubriqueId=null` → CentralEditor mort~~ | ~~Desktop + LeftSidebar~~ | ✅ Résolu Lot 1 |
| ~~C2~~ | ~~`LeftSidebar.selectedMapItemId` local toujours null → garde-fou inactif~~ | ~~LeftSidebar~~ | ✅ Résolu Lot 1 |
| ~~C3~~ | ~~`listMapRubriques` appelle `/api/maps/{id}/rubriques/` (legacy supprimé)~~ | ~~`src/api/maps.ts`~~ | ✅ Résolu Lot 2 |
| ~~C4~~ | ~~Rename rubrique : local uniquement, non persisté~~ | ~~LeftSidebar~~ | ✅ Résolu Lot 3 |
| C5 | Delete rubrique : hors scope v1 (pas d'endpoint détachement) | LeftSidebar | Toast info |
| C6 | Clone rubrique : hors scope v1 (pas d'endpoint) | LeftSidebar | Toast info |
| ~~C7~~ | ~~Delete projet : local uniquement~~ | ~~LeftSidebar~~ | ✅ Résolu Lot 3 |
| C8 | Clone projet : hors scope v1 (pas d'endpoint) | LeftSidebar | Toast info |
| ~~C9~~ | ~~Publication/export : non implémenté (console.log)~~ | ~~ProjectModule~~ | ✅ Résolu Lot 5 |
| ~~C10~~ | ~~`getProjectDetailsValidated` : préfixe `/api/` manquant → 404~~ | ~~apiClient.ts~~ | ✅ Vérifié Lot 4 — fausse alerte, code correct |
| ~~C11~~ | ~~Double lecture `selectedProjectId` + logs debug prod~~ | ~~LeftSidebar~~ | ✅ Vérifié Lot 4 — pas de double lecture ; log debug supprimé |

### Découpage en lots

**Lot 1 — Fiabilisation de la chaîne de sélection ✅ TERMINÉ 2026-04-10**
- Créé `src/store/selectionStore.ts` : store Zustand dédié (`selectedMapItemId`, `selectedRubriqueId`, `setSelection`, `clearSelection`)
- Corrigé `LeftSidebar.tsx` : suppression état local null, écriture via `setSelection`/`clearSelection`, `selectMapItem()`, `hasUnsavedChanges` réel
- Corrigé `Desktop.tsx` : suppression `mapItems` mort, lecture `selectedRubriqueId` depuis store, `CentralEditor` correctement alimenté
- Effet : CentralEditor charge réellement la rubrique sélectionnée, garde-fou actif

**Lot 2 — Migration endpoint structure ✅ TERMINÉ 2026-04-10**
- `src/api/maps.ts` : `listMapRubriques` cible `GET /api/maps/${mapId}/structure/`
- Suppression de `loadMapRubriques` (code mort legacy)
- Suppression des fonctions CRUD legacy dans `mapRubriques.ts` (`createMapRubrique`, `updateMapRubrique`, `deleteMapRubrique` — inutilisées, ciblaient `/rubriques/`)
- DTO inchangé : `MapRubriqueStructureSerializer` ↔ `MapRubriqueDTO` correspondance exacte
- Zéro appel `/api/maps/{id}/rubriques/` dans le code source
- Rechargement structure entièrement canonique après chaque opération structurelle

**Lot 3 — Persistance des opérations non implémentées ✅ TERMINÉ 2026-04-10**
- Renommage rubrique : `PATCH /api/rubriques/{id}/` — implémenté avec rechargement structure
- Suppression rubrique : hors scope v1 — backend bloque `DELETE /api/rubriques/{id}/` si encore en map, pas d'endpoint de détachement disponible → toast
- Suppression projet : `DELETE /api/projets/{id}/` — implémenté avec reset état map/sélection
- Clone projet / clone rubrique : hors scope v1 — pas d'endpoint backend disponible → toast, fake IDs `Math.max()+1` supprimés

**Lot 4 — Nettoyage dette technique ✅ TERMINÉ 2026-04-10**
- `getProjectDetailsValidated` : vérifié correct — route backend intentionnellement sans `/api/`, code frontend conforme. C10 était une fausse alerte.
- Double lecture `selectedProjectId` : vérifiée non-existante — `useSelectedVersion()` fournit la valeur, `useProjectStore` fournit uniquement le setter. C11 était une fausse alerte.
- `prepareNewRubriqueXml` extrait dans `src/hooks/useNewRubriqueXml.ts` — LeftSidebar délègue via `generateRubriqueXml()`, séparation structure/contenu respectée.
- Log debug production `console.log("Fichier Word sélectionné :", file)` supprimé.
- État mort `Desktop.mapItems` et handlers morts : déjà supprimés en Lot 1 — confirmé propre à l'audit Lot 4.

**Lot 5 — Publication réelle ✅ TERMINÉ 2026-04-10**
- IHM de publication existante (ProjectModule) réellement branchée au backend
- `publishMap(mapId, format)` ajouté dans `src/api/maps.ts` — `POST /api/publier-map/{map_id}/`
- `PUBLISH_FORMATS` alignés sur `DITA_OUTPUT_FORMATS` backend (`pdf`, `html5`, `xhtml`, `scorm`, `markdown`, `eclipsehelp`)
- `handleExport` implémenté dans LeftSidebar — règle de sélection map explicite : `is_master` → map unique → blocage
- Ambiguïté "publier projet vs publier map" résolue et documentée
- Feedback utilisateur réel : message backend en succès, toast erreur en échec
- `console.log` + toast simulé supprimés

---

## 🧠 Chantier 3 — CentralEditor

### Objectif
Fiabiliser :
- parsing XML
- buffer
- sauvegarde

### Documents liés
- Refonte_CentralEditor.md
- cartographie_CentralEditor.md

### Statut
EN ATTENTE du raccordement frontend canonique

---

## 🧩 Chantier 4 — Architecture Frontend

### Objectif
Respecter :
- séparation UI / hooks / services
- centralisation API

### Documents liés
- 20_ARCHITECTURE_FRONTEND.md
- cartographies frontend

### Statut
À FAIRE (partiellement engagé)

---

## 🔄 Chantier 5 — Flux métier

### Objectif
Formaliser :
- édition
- publication
- versioning complet

### Documents liés
- 40_EDITION_RUBRIQUE.md
- 10_VERSIONING_DOCUMENTAIRE.md

### Statut
EN COURS

---

# 🧪 3. Zones critiques

---

## 🔴 Critique

- Buffer XML (perte de données)
- Conversion XML ⇄ TipTap
- ~~Synchronisation Front / Back~~ → ✅ résolue pour la couche structurelle (routes canoniques, Sprint 4) — reste ouverte sur la couche contenu (buffer, sauvegarde rubrique)

---

## 🟠 Important

- duplication d’état frontend
- logique résiduelle dans LeftSidebar (rechargement systématique après opération structurelle)
- cohérence ProductDocSync

---

## 🟢 Secondaire

- UX fine
- optimisation performance

---

# 📋 4. Backlog structuré

---

## 🔥 Priorité haute

- sécuriser buffer
- ~~finaliser sauvegarde backend~~ → ✅ routes canoniques en place (Sprint 4) ; reste : rechargement systématique côté frontend
- stabiliser parsing XML

---

## ⚙️ Priorité moyenne

- nettoyage LeftSidebar (rechargement après create / indent / outdent / reorder)
- centralisation API frontend (partiel : création projet + opérations structurelles migrées en Sprint 4)
- ~~amélioration gestion erreurs~~ → ✅ `custom_exception_handler` unifié (Sprint 1)

---

## 🧩 Priorité basse

- UX avancée (rendu racine, masquage partiel, actions contextuelles)
- projection `level → parent/ordre` pour drag & drop cross-niveau
- fonctionnalités secondaires

---

# 🧭 5. Méthode de travail

---

## Cycle recommandé

Analyse → Décision → Référentiel → Implémentation → Cartographie

---

## Utilisation IA

Claude / Cursor doivent être utilisés pour :

- cartographier le code existant
- identifier les écarts
- générer du code aligné

---

# 🧠 6. Suivi

---

## Règles

- toute avancée significative doit être notée
- tout blocage doit être explicité
- toute dérive doit être corrigée

---

## Journal

| Date | Chantier | Avancée |
|---|---|---|
| 2026-04-10 | Backend réalignement | Sprints 1–5 terminés. Backend canonique, routes legacy supprimées, frontend migré, logs/monitoring/sérialiseurs stabilisés. |
| 2026-04-10 | Intégration frontend (Lot 3) | Renommage rubrique migré vers `PATCH /api/rubriques/{id}/`. Suppression projet migrée vers `DELETE /api/projets/{id}/`. Clone projet/rubrique et suppression rubrique documentés hors scope v1 (pas d'endpoint disponible) — fake IDs supprimés, toasts d'information ajoutés. |
| 2026-04-10 | Intégration frontend (Lot 5) | Publication réellement branchée sur `POST /api/publier-map/{map_id}/`. IHM ProjectModule conservée, formats alignés sur backend, règle map master documentée, feedback utilisateur réel. `console.log` / toast simulé supprimés. |
| 2026-04-10 | Nettoyage dette technique (Lot 4) | `prepareNewRubriqueXml` extrait dans `useNewRubriqueXml` hook. Log debug supprimé. C10 et C11 vérifiés fausses alertes. Desktop confirmé propre. Chantier 2 soldé. |

---
