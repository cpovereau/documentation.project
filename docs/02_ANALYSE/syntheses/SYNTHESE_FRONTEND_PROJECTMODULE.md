# Documentum – Synthèse Frontend
## Issue de la cartographie `ProjectModule`

> **Statut** : validé
> 
> **Source** : Cartographie Frontend — ProjectModule
> 
> **Objectif** : fournir une vision synthétique et décisionnelle des écarts frontend ↔ backend liés à la gestion des projets, avant poursuite de la cartographie.

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
| `POST /projet/create/`             | Création de projet     | 🔴 Non conforme              | Doit être remplacé par `/api/projets/` |
| `POST /api/publier-map/{map_id}/`  | Publication d’une map  | 🟡 Conforme mais non utilisé | Ambiguïté projet vs map                |
| `POST /api/versions/{id}/clone/`   | Clonage version/projet | 🔴 Non implémenté            | Fonctionnalité simulée frontend        |
| `DELETE /api/projets/{id}/`        | Suppression projet     | 🔴 Non implémenté            | Fonctionnalité simulée frontend        |


---

## 3. Typologie des écarts identifiés

### 3.1. Écarts fonctionnels

- Publication de projet non implémentée
- Clonage de projet simulé localement
- Suppression de projet simulée localement

Ces fonctionnalités sont **visuellement disponibles mais techniquement inopérantes**.

---

### 3.2. Écarts contractuels

- Utilisation persistante de l’endpoint `/projet/create/`
- Absence d’endpoint backend dédié au clonage et à la suppression de projet

---

### 3.3. Écarts conceptuels

- Confusion d’intention : publication d’un **projet** côté frontend vs publication d’une **map** côté backend
- Absence de décision métier explicite sur ce point

---

## 4. Logiques compensatoires frontend

- Génération locale d’identifiants lors du clonage
- Suppression immédiate de l’état local sans confirmation backend

> Ces logiques sont des **simulations**, non des implémentations métier.

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

- Ne pas corriger ProjectModule tant que :
  - la création de projet n’est pas alignée backend
  - la notion de publication (projet vs map) n’est pas tranchée
  - le clonage et la suppression ne sont pas implémentés backend

- Utiliser cette synthèse comme **référence transverse** pour la suite de la cartographie frontend

---

> **Cette synthèse acte formellement l’écart entre intentions UI et capacités backend.**

**Fin de la synthèse Frontend — ProjectModule**