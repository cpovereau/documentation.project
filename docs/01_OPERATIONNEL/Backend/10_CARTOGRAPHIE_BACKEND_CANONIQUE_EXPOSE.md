# 📡 Cartographie Backend Canonique Exposé — Documentum

> **Objet** : cartographie des routes backend réellement exposées — correspondance vues, serializers et services métiers
>
> **Statut** : opérationnel — source de vérité runtime ; §3.1 Projets incomplet (GET list/retrieve + DELETE à ajouter)
>
> **Périmètre backend :** `ProjetViewSet`, `MapViewSet`, `RubriqueViewSet` — apps `projets`, `maps`, `rubriques`
>
> **Dernière mise à jour** : 2026-04-16

---

> ⚠️ Ce document doit rester aligné avec le référentiel backend canonique.
> Toute divergence doit être traitée explicitement.

---

## 1. Règles de lecture

Ce document décrit :

- les routes backend **actives et exposées**
- les vues réellement utilisées
- les services métiers invoqués

Ce document **ne décrit pas** :

- les routes supprimées (voir historique)
- les plans de refonte
- les écarts (voir GAP_ANALYSIS)

---

## 2. Vue d’ensemble

### Backend canonique

- ✔️ une seule porte d’entrée création projet
- ✔️ endpoints structurels unifiés
- ✔️ séparation stricte structure / contenu
- ✔️ aucun endpoint legacy exposé

---

## 3. Routes canoniques

---

### 🧩 3.1 Projets

| Méthode | Route | Vue | Service | Rôle |
|--------|------|-----|--------|------|
| GET | `/api/projets/` | `ProjetViewSet.list` | — | Liste des projets (`?archived=false` supporté) |
| GET | `/api/projets/{id}/` | `ProjetViewSet.retrieve` | — | Lecture d'un projet |
| POST | `/api/projets/` | `ProjetViewSet.create` | `create_project()` | Création complète projet + invariants |
| DELETE | `/api/projets/{id}/` | `ProjetViewSet.destroy` | — | Suppression définitive (Lot 3) |

---

### 🗂 3.2 Maps & Structure

#### Lecture

| Méthode | Route | Vue | Rôle |
|--------|------|-----|------|
| GET | `/api/maps/{id}/structure/` | `MapViewSet.structure` | Lecture structure documentaire |
| GET | `/api/projets/{id}/structure/` | `projet_structure_view` | Vue globale structure |

---

#### Création & modification structure

| Méthode | Route | Vue | Service | Rôle |
|--------|------|-----|--------|------|
| POST | `/api/maps/{id}/structure/create/` | `MapViewSet.structure_create` | `create_rubrique_in_map()` | Créer rubrique dans structure |
| POST | `/api/maps/{id}/structure/attach/` | `MapViewSet.structure_attach` | `add_rubrique_to_map()` | Attacher rubrique existante |
| POST | `/api/maps/{id}/structure/reorder/` | `MapViewSet.structure_reorder` | `reorder_map_rubriques()` | Réordonner |
| POST | `/api/maps/{id}/structure/{id}/indent/` | `MapViewSet.structure_indent` | `indent_map_rubrique()` | Indenter |
| POST | `/api/maps/{id}/structure/{id}/outdent/` | `MapViewSet.structure_outdent` | `outdent_map_rubrique()` | Désindenter |

---

### 📄 3.3 Rubriques (contenu)

| Méthode | Route | Vue | Rôle |
|--------|------|-----|------|
| GET | `/api/rubriques/{id}/` | `RubriqueViewSet.retrieve` | Lecture contenu |
| PATCH | `/api/rubriques/{id}/` | `RubriqueViewSet.update` | Mise à jour partielle contenu XML (seul `contenu_xml` envoyé) |
| DELETE | `/api/rubriques/{id}/` | `RubriqueViewSet.destroy` | Suppression protégée |

---

## 4. Services métiers utilisés

| Service | Rôle |
|--------|------|
| `create_project()` | Création projet + invariants |
| `create_rubrique_in_map()` | Création rubrique dans structure |
| `add_rubrique_to_map()` | Attachement |
| `reorder_map_rubriques()` | Réorganisation |
| `indent_map_rubrique()` | Indentation |
| `outdent_map_rubrique()` | Désindentation |

---

## 5. Garanties système

### Invariants

- ✔️ aucun projet sans map / version / racine
- ✔️ structure manipulée uniquement via backend
- ✔️ contenu XML isolé

---

### Sécurité

- ✔️ toutes les routes nécessitent authentification
- ✔️ suppression contrôlée (pas d’effet de bord structurel)

---

### Cohérence

- ✔️ aucune route dupliquée
- ✔️ aucun endpoint legacy
- ✔️ DTO cohérents

---

## 6. Routes supprimées (historique court)

| Route | Remplacée par |
|------|--------------|
| `/projet/create/` | `/api/projets/` |
| `/api/map-rubriques/` | `/structure/attach/` |
| `/api/maps/{id}/create-rubrique/` | `/structure/create/` |
| `/api/maps/{id}/reorder/` | `/structure/reorder/` |

---

## 7. Dette restante (connue)

- contenu XML racine vide
- `ProjetSerializer.create()` non aligné sur `create_project()`
- DTO à affiner par flux

---

## 8. Position dans la documentation

- 🔹 Référentiel → définit les règles
- 🔹 Ce document → décrit la réalité
- 🔹 Analyse → explique les transformations

---

# ✔️ Fin du document