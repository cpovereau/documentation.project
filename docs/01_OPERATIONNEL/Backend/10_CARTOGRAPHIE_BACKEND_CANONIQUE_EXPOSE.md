# 📡 Cartographie Backend Canonique Exposé — Documentum

> **Objet** : cartographie des routes backend réellement exposées — correspondance vues, serializers et services métiers
>
> **Statut** : opérationnel — source de vérité runtime
>
> **Périmètre backend :** `ProjetViewSet`, `MapViewSet`, `RubriqueViewSet`, `FonctionnaliteViewSet`, `MediaItemViewSet`, vues import — apps `projets`, `maps`, `rubriques`, `documentation`, `medias`
>
> **Dernière mise à jour** : 2026-04-18 (ajout routes ProductDocSync — VersionProduit + EvolutionProduit)

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

### 🖼 3.4 Médias

| Méthode | Route | Vue | Rôle |
|--------|------|-----|------|
| GET | `/api/media-items/` | `MediaItemViewSet.list` | Liste complète des médias |
| GET | `/api/medias-check-nom/` | `medias_check_nom_view` | Vérification/génération du nom automatique (`?produit=&fonctionnalite=&interface=`) |
| POST | `/api/import/media/` | `import_media_view` | Import d'un fichier image (multipart/form-data — `file`, `produit`, `fonctionnalite`, `interface`, `nom_fichier`, `remplacer`) |

---

### 📦 3.5 Import

| Méthode | Route | Vue | Rôle |
|--------|------|-----|------|
| POST | `/api/import/fonctionnalites/` | `import_fonctionnalites_view` | Import CSV de fonctionnalités (multipart/form-data — `file`, `mapping`, `produit`, `skip_header`) |

---

### 🏷 3.6 Fonctionnalités (ProductDocSync)

> Exposé via `ArchivableModelViewSet` — DELETE retourne HTTP 405 ; suppression douce via PATCH `archive/`.

| Méthode | Route | Vue | Rôle |
|--------|------|-----|------|
| GET | `/api/fonctionnalites/` | `FonctionnaliteViewSet.list` | Liste des fonctionnalités (`?archived=false` supporté) |
| POST | `/api/fonctionnalites/` | `FonctionnaliteViewSet.create` | Créer une fonctionnalité (`produit`, `nom`, `code`, `id_fonctionnalite`) |
| GET | `/api/fonctionnalites/{id}/` | `FonctionnaliteViewSet.retrieve` | Lecture d'une fonctionnalité |
| PATCH | `/api/fonctionnalites/{id}/archive/` | `FonctionnaliteViewSet.archive` | Archive (suppression douce) — DELETE → 405 |

**Filtrage produit** : côté frontend (`f.produit === produitId`) — pas de `?produit=` côté backend (TODO Phase 2).

---

### 🗓 3.7 VersionProduit (ProductDocSync)

> Exposé via `VersionProduitViewSet` — DELETE retourne HTTP 405 ; archivage via `PATCH statut=archivee`.
> La publication passe exclusivement par `/publier/` (service `publier_version_produit()`).

| Méthode | Route | Vue | Service | Rôle |
|--------|------|-----|--------|------|
| GET | `/api/versions-produit/` | `VersionProduitViewSet.list` | — | Liste (`?produit={id}`, hors archivées par défaut) |
| POST | `/api/versions-produit/` | `VersionProduitViewSet.create` | — | Créer une version (`produit`, `numero`) |
| PATCH | `/api/versions-produit/{id}/` | `VersionProduitViewSet.partial_update` | — | Mettre à jour (numéro, `statut=archivee` si non publiée) |
| POST | `/api/versions-produit/{id}/publier/` | `VersionProduitViewSet.publier` | `publier_version_produit()` | Publier la version (irréversible) |

**Invariants** :
- `statut=publiee` ne peut être positionné qu'via `/publier/` — bloqué à la validation si PATCH.
- Archivage interdit si `statut=publiee`.
- `unique_together(produit, numero)` — erreur 400 si doublon.

---

### 🔄 3.8 EvolutionProduit (ProductDocSync)

> Exposé via `EvolutionProduitViewSet` (hérite de `ArchivableModelViewSet`).
> Réordonnancement délégué au service `reorder_evolutions_produit()`.

| Méthode | Route | Vue | Service | Rôle |
|--------|------|-----|--------|------|
| GET | `/api/evolutions-produit/` | `EvolutionProduitViewSet.list` | — | Liste (`?version_produit={id}`, hors archivées par défaut) |
| POST | `/api/evolutions-produit/` | `EvolutionProduitViewSet.create` | — | Créer une évolution (`version_produit`, `fonctionnalite`, `type`) |
| PATCH | `/api/evolutions-produit/{id}/` | `EvolutionProduitViewSet.partial_update` | — | Mettre à jour (description, type, statut) |
| PATCH | `/api/evolutions-produit/{id}/archive/` | `EvolutionProduitViewSet.archive` | — | Archiver (suppression logique via `is_archived`) |
| PATCH | `/api/evolutions-produit/reorder/` | `EvolutionProduitViewSet.reorder` | `reorder_evolutions_produit()` | Réordonner — payload `{"orderedIds": [...]}` |

**Invariants** :
- `is_archived=True` exclut l'évolution de la liste par défaut (sauf `?archived=true`).
- `reorder_evolutions_produit()` : transaction atomique, tous les IDs doivent exister.

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
| `publier_version_produit(version_id)` | Publication atomique VersionProduit (statut + horodatage) |
| `reorder_evolutions_produit(ordered_ids)` | Réordonnancement atomique EvolutionProduit |

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

- `contenu_xml=""` invalide à la création de rubrique racine (B7 — XS)
- Formats d'erreur non uniformes sur 3 vues utilitaires : `validate_xml_view`, `publier_map`, `publication_diff_view` (B6 — XS)
- Filtrage `?produit=` absent sur `/api/fonctionnalites/` — filtrage frontend provisoire (TODO Phase 2)
- DTO à affiner par flux (édition / navigation / publication)

---

## 8. Position dans la documentation

- 🔹 Référentiel → définit les règles
- 🔹 Ce document → décrit la réalité
- 🔹 Analyse → explique les transformations

---

# ✔️ Fin du document