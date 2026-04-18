# Documentum – Référentiel Backend Canonique

> **Objet** : définir la vérité métier, les responsabilités backend et les contrats d’API afin de garantir la cohérence globale du système Documentum
>
> **Statut** : document normatif — fait foi pour toute évolution backend et sert de socle d’alignement pour le frontend
>
> **Périmètre backend :** `ProjetViewSet`, `MapViewSet`, `RubriqueViewSet`, `VersionProduitViewSet`, `FonctionnaliteViewSet` — apps `projets`, `maps`, `rubriques`, `produits`
>
> **Dernière mise à jour** : 2026-04-18

---

## 1. Principes directeurs

### 1.1. Séparation stricte des responsabilités

Le backend distingue **sans ambiguïté** :

- **Structure documentaire** : organisation hiérarchique des rubriques dans une map
- **Contenu documentaire** : contenu éditorial d’une rubrique

Ces deux notions ne doivent **jamais** être confondues dans les API, les services ou les DTO.

---

### 1.2. Modèles de référence

| Modèle | Rôle |
|------|------|
| Projet | Entité racine métier |
| Map | Conteneur documentaire logique |
| MapRubrique | **Structure** : lien ordonné parent/enfant |
| Rubrique | **Contenu** éditorial (XML DITA) |

> 🔒 **Règle d’or** :
> - `MapRubrique` = structure
> - `Rubrique` = contenu

---

## 2. Création et cycle de vie d’un projet

### 2.1. Porte d’entrée unique

**Une seule API de création de projet est autorisée** :

```
POST /api/projets/
```

Cette API est **canonique**.

---

### 2.2. Invariants de création

À la création d’un projet, le backend garantit systématiquement :

- création du projet
- création de la version active
- création d’une **map master**
- création d’une **rubrique racine**
- création du lien structurel `MapRubrique` racine

> ❌ Aucun projet ne peut exister sans ces éléments.

---

### 2.3. Implémentation recommandée

- Logique portée par `ProjetViewSet.create()`
- Orchestration déléguée à un **service métier unique**
- Aucune route alternative autorisée (`/projet/create/` est supprimée)

---

## 3. Gestion des maps

### 3.1. Point d’accès unique

Toutes les opérations sur les maps passent par :

```
/api/maps/
```

> ❌ Aucun handler concurrent n’est autorisé sur cette route.

---

### 3.2. Lecture de la structure

Deux lectures sont autorisées :

```
GET /api/projets/{id}/structure/
GET /api/maps/{id}/structure/
```

Ces endpoints retournent **exclusivement** :

- la structure `MapRubrique`
- les métadonnées nécessaires à l’affichage

Ils **ne retournent jamais** le contenu XML.

---

## 4. Gestion de la structure documentaire

### 4.1. Principe fondamental

La **structure documentaire** est une responsabilité backend.

Le frontend **ne manipule jamais directement** `MapRubrique`.

---

### 4.2. Endpoints structurels canoniques

| Action | Endpoint |
|------|---------|
| Lire structure map | `GET /api/maps/{id}/structure/` |
| Attacher une rubrique existante | `POST /api/maps/{id}/structure/attach/` |
| Créer une rubrique dans la map | `POST /api/maps/{id}/structure/create/` |
| Réordonner la structure | `POST /api/maps/{id}/structure/reorder/` |
| Indenter / désindenter | `POST /api/maps/{id}/structure/{mapRubriqueId}/indent` |

> 🔒 Toutes ces opérations s’appuient sur les services métiers existants (`add_rubrique_to_map`, `create_rubrique_in_map`).

---

## 5. Gestion du contenu documentaire

### 5.1. Principe fondamental

Le **contenu** d’une rubrique est indépendant de la structure.

Il est manipulé **uniquement** via l’entité `Rubrique`.

---

### 5.2. Endpoint canonique de contenu

```
PATCH /api/rubriques/{id}/
```

Payload minimal :

```json
{
  "contenu_xml": "<topic>...</topic>"
}
```

> ❌ Aucun endpoint structurel ne modifie le contenu.
> ❌ Aucun endpoint de contenu ne modifie la structure.

---

## 6. DTO et contrats d’échange

### 6.1. DTO de structure

- `MapStructureDTO`
- contient :
  - identifiants
  - relations parent/enfant
  - ordre
  - métadonnées minimales

> ❌ Pas de XML

---

### 6.2. DTO de contenu

- `RubriqueContentDTO`
- contient :
  - `rubrique_id`
  - `contenu_xml`

---

### 6.3. Règle d’usage frontend

- le frontend consomme **des DTO**, jamais des modèles
- les DTO sont **contextuels à un flux** (navigation, édition, publication)

---

## 7. Règles non négociables

- ❌ Pas de doublon d’endpoint
- ❌ Pas de logique métier dans les ViewSets
- ❌ Pas de confusion structure / contenu
- ❌ Pas de création partielle d’entités

- ✅ Services métiers atomiques
- ✅ Transactions explicites
- ✅ Nommage strict et cohérent

---

## 9. Pilotage documentaire — ProductDocSync (2026-04-18)

> ⚠️ Les entités de cette section sont **à implémenter**. Ce document les définit avant toute implémentation frontend, conformément à la règle de gouvernance.

### 9.1. Entité `VersionProduit`

**Décision** : cf. `gov_decision-log.md` — 2026-04-18.

`VersionProduit` représente une version logicielle d'un `Produit`. Elle est **indépendante** de `VersionProjet` (cycle documentaire) — les deux cycles de vie ne sont pas couplés.

**Modèle Django** :

| Champ | Type | Contraintes |
|---|---|---|
| `produit` | ForeignKey → `Produit` | `on_delete=CASCADE`, `related_name='versions'` |
| `numero` | CharField(50) | ex. `"2.1"` |
| `statut` | CharField(choices) | `en_preparation` / `publiee` / `archivee` — défaut : `en_preparation` |
| `date_publication` | DateTimeField | nullable, blank |
| `created_at` | DateTimeField | auto_now_add |

Contrainte d'unicité : `unique_together = [('produit', 'numero')]`

**Règles métier** :
- Seule l'action `/publier/` peut passer une version au statut `publiee`.
- La publication est irréversible (pas de retour à `en_preparation`).
- Archivage via `PATCH statut=archivee` uniquement si version non `publiee`.

**Service** : `publier_version_produit(version_id)` — atomic, pose `statut=publiee` + `date_publication=now()`.

**Endpoints canoniques** :

| Méthode | Endpoint | Rôle |
|---|---|---|
| `GET` | `/api/versions-produit/?produit={id}` | Liste les versions d'un produit (non archivées par défaut) |
| `POST` | `/api/versions-produit/` | Crée une nouvelle version |
| `PATCH` | `/api/versions-produit/{id}/` | Met à jour (numéro, statut `archivee`) |
| `POST` | `/api/versions-produit/{id}/publier/` | Publie la version via `publier_version_produit()` |

**Règle ViewSet** : aucune logique métier dans le ViewSet — tout dans `services.publier_version_produit()`.

---

### 9.2. Entité `EvolutionProduit`

**Décision** : cf. `gov_decision-log.md` — 2026-04-18.

`EvolutionProduit` est l'unité centrale du suivi de version. Elle représente une occurrence d'évolution ou de correctif dans une `VersionProduit`, en référençant une `Fonctionnalite` du référentiel.

**Modèle Django** :

| Champ | Type | Contraintes |
|---|---|---|
| `version_produit` | ForeignKey → `VersionProduit` | `on_delete=CASCADE`, `related_name='evolutions'` |
| `fonctionnalite` | ForeignKey → `Fonctionnalite` | `on_delete=PROTECT`, `related_name='evolutions'` |
| `type` | CharField(choices) | `evolution` / `correctif` |
| `description` | TextField | nullable, blank |
| `ordre` | PositiveIntegerField | défaut : `0` |
| `statut` | CharField(choices) | `draft` / `valide` — défaut : `draft` |
| `created_at` | DateTimeField | auto_now_add |

**Endpoints canoniques** :

| Méthode | Endpoint | Rôle |
|---|---|---|
| `GET` | `/api/evolutions-produit/?version_produit={id}` | Liste les évolutions d'une version |
| `POST` | `/api/evolutions-produit/` | Crée une évolution |
| `PATCH` | `/api/evolutions-produit/{id}/` | Met à jour (description, type, statut) |
| `PATCH` | `/api/evolutions-produit/{id}/archive/` | Archive (suppression logique) |
| `PATCH` | `/api/evolutions-produit/reorder/` | Payload `{ "orderedIds": [...] }` — réordonne en transaction |

**Service** : `reorder_evolutions_produit(ordered_ids)` — atomic, recalcule les valeurs `ordre`.

---

### 9.3. ImpactDocumentaire

**Modèle Django** (à créer — Phase 3 roadmap) :

| Champ | Type | Contraintes |
|---|---|---|
| `evolution_produit` | ForeignKey → `EvolutionProduit` | `on_delete=CASCADE`, `related_name='impacts'` |
| `rubrique` | ForeignKey → `Rubrique` | `on_delete=CASCADE` |
| `statut` | CharField(choices) | `a_faire` / `en_cours` / `pret` / `valide` / `ignore` — défaut : `a_faire` |
| `created_at` | DateTimeField | auto_now_add |
| `updated_at` | DateTimeField | auto_now |

Contrainte d'unicité : `unique_together = [('evolution_produit', 'rubrique')]`

**Endpoints canoniques** :

| Méthode | Endpoint | Rôle |
|---|---|---|
| `GET` | `/api/impacts/?evolution_produit={id}` | Liste les impacts d'une évolution |
| `POST` | `/api/impacts/` | Déclare un impact |
| `PATCH` | `/api/impacts/{id}/` | Met à jour le statut |
| `DELETE` | `/api/impacts/{id}/` | Supprime un impact |

**Règle** : `ImpactDocumentaire` ne modifie jamais le contenu XML d'une rubrique — il est une déclaration de travail à faire.

---

## 8. Rôle de ce document

Ce document :

- fait foi en cas de doute
- sert de base à la cartographie frontend
- permet des suppressions de code sans crainte
- protège le projet des dérives futures

Toute évolution backend doit :

1. s’y conformer
2. ou faire l’objet d’une **mise à jour explicite de ce référentiel**

---

**Fin du document de référence backend**

