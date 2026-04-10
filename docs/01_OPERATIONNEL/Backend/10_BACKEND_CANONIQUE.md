# Documentum – Référentiel Backend Canonique

> **Statut** : document de référence
>
> **Objectif** : définir la vérité métier, les responsabilités backend et les contrats d’API afin de garantir la cohérence globale du système Documentum.
>
> Ce document fait foi pour toute évolution backend et sert de socle d’alignement pour le frontend.

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
PUT /api/rubriques/{id}/
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

