# Documentum – Synthèse Frontend Globale

> **Statut** : document de référence validé
> 
> **Périmètre** : ensemble du frontend Documentum
> 
> **Objectif** : fournir une vision consolidée de l’architecture frontend, de ses écarts avec le backend canonique et des priorités de réalignement.
>
> **Dernière mise à jour** : 2026-04-17

---

## 1. Vue d’ensemble

Le frontend Documentum repose sur une architecture clairement stratifiée :

- **UI pure** (présentation et interaction)
- **Orchestration UI**
- **Orchestration métier frontend**
- **Composants métier frontend**

La cartographie détaillée de chaque composant permet aujourd’hui de **localiser précisément la dette**, sans ambiguïté.

---

## 2. Cartographie consolidée des composants

| Composant | Nature | Verdict | Lecture synthétique |
|---------|-------|--------|--------------------|
| LeftSidebar | Orchestration structurelle | 🟡 | Endpoints canoniques adoptés, endpoints structure à confirmer backend, logiques avancées (nav. gardée, selectionStore) |
| ProjectModule | UI projet | 🟢 | Création, suppression, publication opérationnelles — seul le clone reste hors scope |
| MapModule | UI structure | 🟢 | Composant sain, référence UI, DnD interne maîtrisé |
| Desktop | Orchestration UI | 🟢 | Socle stable, consomme `useSelectionStore`, RightSidebar et DockEditors intégrés |
| CentralEditor | Métier éditorial | 🟢 | Architecture saine, routage corrigé, nombreux hooks métier extraits, validations XML ajoutées |

---

## 3. Évolution des écarts (depuis audit initial)

### 3.1. Écarts résolus

- ✅ Endpoints structurels frontend migrés vers `/api/maps/{id}/structure/...`
- ✅ Création projet : `/projet/create/` → `/api/projets/` (canonique, validé Zod)
- ✅ Suppression projet : `DELETE /api/projets/{id}/` opérationnel
- ✅ Publication : `publishMap()` via `POST /api/publier-map/{map_id}/` avec sélection intelligente
- ✅ Sauvegarde rubrique : `PUT` → `PATCH /api/rubriques/{id}/`
- ✅ Incohérence de routage CentralEditor résolue
- ✅ Ambiguïté publication projet/map tranchée (règle master > unique)

---

### 3.2. Écarts résiduels à traiter

- Clone projet : non implémenté (toast informatif — attend backend)
- Clone / suppression rubrique : non implémentés (backend bloque DELETE si encore en map)
- Indent / outdent / reorder : endpoints frontend canoniques — à valider côté backend

---

### 3.3. Zones saines confirmées

- MapModule (inchangé)
- Desktop (enrichi mais stable)
- CentralEditor (enrichi, dette résolue)

---

## 4. Frontend ↔ Backend : lecture croisée

| Domaine | Backend canonique | Frontend actuel | Statut |
|------|------------------|-----------------|--------|
| Création projet | `/api/projets/` | Via `createProjectValidated()` | 🟢 Résolu |
| Structure documentaire | `/api/maps/{id}/structure/...` | Endpoints canoniques adoptés | 🟡 À confirmer backend (indent/outdent/reorder) |
| Contenu rubrique | `PATCH /api/rubriques/{id}/` | `useRubriqueSave` — PATCH | 🟢 |
| Publication | `POST /api/publier-map/{map_id}/` | `publishMap()` avec sélection master | 🟢 Résolu |
| Suppression projet | `DELETE /api/projets/{id}/` | `handleDelete` — opérationnel | 🟢 Résolu |
| Clonage projet | Non implémenté | Toast informatif (v1) | 🟡 Attend backend |
| Clone / suppression rubrique | Non implémenté | Toast informatif (v1) | 🟡 Attend backend |

---

## 5. Priorisation des chantiers restants

### 5.1. Priorité 1 — Validation backend des routes structurelles

- Confirmer que `indent` / `outdent` / `reorder` sont opérationnels côté Django
- Ces routes sont appelées depuis le frontend, mais leur disponibilité backend n’est pas vérifiée

---

### 5.2. Priorité 2 — Implémentation backend du clonage

- Clonage projet (`POST /api/versions/{id}/clone/` ou équivalent)
- Clonage rubrique (endpoint à définir)
- Suppression rubrique (endpoint à définir — actuellement bloqué backend)

---

### 5.3. Priorité 3 — Allègement progressif de LeftSidebar

- Envisager l’extraction de la logique de publication en hook dédié
- LeftSidebar reste orchestrateur fort — acceptable à court terme

---

## 6. Principes de conduite du réalignement

- Ne pas toucher aux composants 🟢 sans raison
- Ne corriger le frontend qu’après correction backend
- Documenter chaque décision
- Préserver l’expérience utilisateur

---

## 7. Rôle de ce document

Ce document :

- clôt la phase de cartographie frontend
- sert de base au plan d’action backend
- protège les zones saines
- permet un réalignement maîtrisé, sans refonte brutale

---

> **Cette synthèse globale constitue le point de bascule entre analyse et action.**

**Fin de la synthèse Frontend Globale**