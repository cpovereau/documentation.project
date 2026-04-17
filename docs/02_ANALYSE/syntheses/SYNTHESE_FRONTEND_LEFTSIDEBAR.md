# Documentum – Synthèse Frontend
## Issue de la cartographie `LeftSidebar`

> **Statut** : validé
>
> **Source** : Cartographie Frontend — LeftSidebar
>
> **Objectif** : fournir une vision synthétique et actionnable des écarts frontend ↔ backend avant la poursuite de la cartographie.
>
> **Dernière mise à jour** : 2026-04-17

---

## 1. Périmètre couvert

- Composant analysé : **LeftSidebar**
- Rôle : point d’entrée de la navigation documentaire
- Nature : composant central, orchestrateur de flux métier frontend

---

## 2. Inventaire des endpoints utilisés

| Endpoint | Responsabilité métier | Statut | Commentaire |
|---------|----------------------|--------|-------------|
| `GET /api/projets/{id}/` | Chargement projet | 🟢 Conforme | Fallback si projet absent du cache local |
| `GET /api/projets/{id}/structure/` | Lecture structure projet + map courante | 🟢 Conforme | Endpoint canonique, retourne `map.id` + `structure[]` |
| `GET /api/maps/{id}/structure/` | Lecture structure map (refresh) | 🟢 Conforme | Via `listMapRubriques()` — remplace l'ancien `/rubriques/` supprimé Sprint 4 |
| `POST /api/maps/{id}/structure/create/` | Création rubrique + rattachement | 🟢 Conforme | Endpoint canonique (remplace l'ancien `/create-rubrique/`) |
| `POST /api/maps/{id}/structure/{mr_id}/indent/` | Indentation structure | 🟡 À vérifier backend | Route canonique confirmée côté frontend |
| `POST /api/maps/{id}/structure/{mr_id}/outdent/` | Désindentation structure | 🟡 À vérifier backend | Route canonique confirmée côté frontend |
| `POST /api/maps/{id}/structure/reorder/` | Réordonnancement structure | 🟡 À vérifier backend | Route canonique confirmée côté frontend |
| `PATCH /api/rubriques/{id}/` | Renommage rubrique | 🟢 Conforme | Nouveau — `{ titre: newTitle }` |
| `DELETE /api/projets/{id}/` | Suppression projet | 🟢 Implémenté | Fonctionnel — nettoie l'état local après suppression |
| `POST /api/publier-map/{map_id}/` | Publication map | 🟢 Conforme | Via `publishMap()` — sélection master / unique automatique |

---

## 3. Typologie des écarts identifiés

### 3.1. Écarts contractuels résolus (depuis audit initial)

- ✅ Endpoints structurels migrés vers `/api/maps/{id}/structure/...`
- ✅ Création rubrique via `/structure/create/` (endpoint canonique)
- ✅ Suppression projet : `DELETE /api/projets/{id}/` opérationnel
- ✅ Publication : `POST /api/publier-map/{map_id}/` désormais utilisée

---

### 3.2. Écarts fonctionnels résiduels

- Clone projet non implémenté (toast d’information à l’utilisateur)
- Clone rubrique non implémenté (toast d’information à l’utilisateur)
- Suppression rubrique non implémentée (backend bloque DELETE si rubrique encore en map)

---

### 3.3. Écarts architecturaux

- LeftSidebar reste orchestrateur fort (logique projet + map + sélection + publication)
- Enrichissement en cours mais toujours au-delà d’un rôle de navigation pure

---

## 4. Logiques avancées frontend

- Calcul local du parent d’insertion (`getInsertionParentId`)
- Sélection différée après création (`pendingSelectId`)
- Rechargement complet après chaque modification structurelle (`listMapRubriques`)
- **Navigation gardée** : `UnsavedChangesDialog` — si buffer `dirty` ou `error`, modale avant toute navigation
- **Store dédié** : `useSelectionStore` (Zustand) — source de vérité unique pour `selectedMapItemId` + `selectedRubriqueId`
- **Initialisation buffer XML** : pour chaque mapItem sans XML en store, injection d’un squelette `<topic>`

---

## 5. Impacts en cascade

- **CentralEditor** : reçoit `rubriqueId` via Desktop ← `useSelectionStore` (découplage amélioré)
- **ProjectModule / MapModule** : dépendants des données normalisées par LeftSidebar
- **XmlBufferStore** : initialisé dans LeftSidebar pour chaque rubrique chargée

---

## 6. Verdict global

- Composant **en cours de réalignement** — endpoints canoniques adoptés
- Fonctions compensatoires réduites mais composant toujours orchestrateur fort
- Suppression et publication désormais fonctionnelles ; clone reste hors périmètre v1

---

## 7. Recommandations de pilotage

- Valider côté backend la disponibilité des routes indent / outdent / reorder
- Envisager d’extraire la gestion de publication dans un hook dédié
- Utiliser cette synthèse comme **référence transverse**

---

> **Cette synthèse constitue un point de passage obligatoire avant toute correction.**

**Fin de la synthèse Frontend — LeftSidebar**

