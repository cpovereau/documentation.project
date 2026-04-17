# Documentum – Synthèse Frontend
## Issue de la cartographie `ProjectModule`

> **Statut** : validé
> 
> **Source** : Cartographie Frontend — ProjectModule
> 
> **Objectif** : fournir une vision synthétique et décisionnelle des écarts frontend ↔ backend liés à la gestion des projets, avant poursuite de la cartographie.
>
> **Dernière mise à jour** : 2026-04-17

---

## 1. Périmètre couvert

- Composant analysé : **ProjectModule**
- Nature : composant UI présentationnel (dumb component)
- Rôle : exposition des intentions métier liées aux projets (sélection, création, clonage, suppression, publication)

---

## 2. Inventaire des endpoints impliqués (indirectement)

| Endpoint                           | Responsabilité métier  | Statut                       | Commentaire                            |
| ---------------------------------- | ---------------------- | ---------------------------- | -------------------------------------- |
| `GET /api/projets/{id}/`           | Chargement d’un projet | 🟢 Conforme                  | Appelé indirectement via LeftSidebar   |
| `GET /api/projets/?archived=false` | Liste des projets      | 🟢 Conforme                  | Utilisé par LoadProjectDialog          |
| `POST /api/projets/`               | Création de projet     | 🟢 Conforme (résolu)         | Via `createProjectValidated()` — remplace l’ancien `/projet/create/` |
| `POST /api/publier-map/{map_id}/`  | Publication d’une map  | 🟢 Conforme et utilisé       | Via `publishMap()` — sélection master / unique automatique |
| `POST /api/versions/{id}/clone/`   | Clonage version/projet | 🔴 Non implémenté            | Toast d’information à l’utilisateur (v1) |
| `DELETE /api/projets/{id}/`        | Suppression projet     | 🟢 Implémenté (résolu)       | Fonctionnel — nettoyage état local inclus |


---

## 3. Typologie des écarts identifiés

### 3.1. Écarts résolus (depuis audit initial)

- ✅ Création de projet : endpoint `/projet/create/` remplacé par `/api/projets/` (canonique, validé Zod)
- ✅ Suppression de projet : `DELETE /api/projets/{id}/` implémenté et opérationnel
- ✅ Publication : `POST /api/publier-map/{map_id}/` désormais appelé avec sélection intelligente de la map (master > unique > blocage)
- ✅ Ambiguïté projet/map résolue par la logique de sélection dans `handleExport` (LeftSidebar)

---

### 3.2. Écarts fonctionnels résiduels

- Clone projet : non implémenté — toast explicite à l’utilisateur (`"Clonage de projet non disponible (v1)."`)

---

### 3.3. Écarts conceptuels

- Publication d’un **projet** côté UI → publication d’une **map** côté backend : décision tranchée par règle de sélection (master > unique)
- Format de publication : choix utilisateur via `PUBLISH_FORMATS` (pdf, html5, xhtml, scorm, markdown, eclipsehelp)

---

## 4. Logiques frontend actuelles

- Export card dans ProjectModule : sélection format + bouton Publier → délégation à `onExport(format)` (handler LeftSidebar)
- Clone : délibérément hors scope v1, sans simulation locale

> Les logiques compensatoires locales (génération d’identifiants, suppression sans backend) ont été supprimées.

---

## 5. Impacts en cascade

- **LeftSidebar** : porte les callbacks simulant les opérations critiques
- **Dialogs (Create / Load)** : dépendants des endpoints projet
- **UX globale** : risque de fausse perception de succès par l’utilisateur

---

## 6. Verdict global

- Composant **sain architecturalement**
- Problèmes **non localisés dans le composant** mais dans le périmètre backend
- Nécessite des décisions backend avant toute correction frontend

---

## 7. Recommandations de pilotage

- Implémenter le clonage de projet côté backend (seul écart restant)
- Lorsque disponible, remplacer le `toast.error` clone par l’appel réel
- Utiliser cette synthèse comme **référence transverse** pour la suite de la cartographie frontend

---

> **Cette synthèse acte formellement l’écart entre intentions UI et capacités backend.**

**Fin de la synthèse Frontend — ProjectModule**