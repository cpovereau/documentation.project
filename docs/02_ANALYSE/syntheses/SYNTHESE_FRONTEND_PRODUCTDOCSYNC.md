# 📘 SYNTHESE — ProductDocSync — Cadrage fonctionnel

---

## 🎯 Objectif du document

Ce document sert de **pont entre le besoin métier et l’implémentation frontend actuelle** de l’écran `ProductDocSync`.

Il permet de :
- clarifier les règles fonctionnelles validées
- identifier les écarts avec l’IHM actuelle
- préparer le travail de Claude Code sans dérive métier
- sécuriser le futur raccordement backend

---

# 🧩 1. Règles fonctionnelles validées

## 1.1 Contexte métier

L’écran `ProductDocSync` permet de gérer :
- le **suivi des versions d’un produit**
- les **évolutions et correctifs associés aux fonctionnalités**
- les **impacts documentaires** associés

👉 Il s’agit d’un écran **métier distinct** du module de documentation classique.

---

## 1.2 Sélection Produit / Version

### Règle

L’utilisateur sélectionne :
- un **Produit**
- une **Version Produit**

⚠️ Important :
> Il s’agit bien d’une **version Produit** (et non d’une version de projet documentaire).

---

## 1.3 Création de version

### Règle

Le bouton `+` à droite du sélecteur de version permet de :

👉 **Créer une nouvelle version Produit**

### Comportement attendu

- création d’une nouvelle version
- ajout dans la liste déroulante
- sélection automatique de la nouvelle version

⚠️ Mapping backend NON défini à ce stade

---

## 1.4 Affichage des fonctionnalités

### Règle

Après sélection Produit + Version :

👉 afficher la **liste des fonctionnalités du produit**

### Source fonctionnelle

- référentiel géré dans `Settings > Fonctionnalités`

---

## 1.5 Structure des fonctionnalités

### Règle

👉 Les fonctionnalités sont **mono-niveau**

### Conséquences

- suppression de la hiérarchie
- suppression de :
  - indentation
  - désindentation
  - niveaux (`level`)

⚠️ La hiérarchie pourra être réintroduite plus tard si nécessaire

---

## 1.6 Gestion des évolutions / correctifs

### Règle

Pour une fonctionnalité donnée :

👉 on peut créer un élément de type :
- **Correctif**
- **Évolution**

---

## 1.7 Tableau des impacts (bloc central principal)

### Règle

Un tableau liste :
- les fonctionnalités impactées
- les éléments créés (correctifs / évolutions)

### Ajout

Le bouton `+` permet de :

👉 ajouter une ligne associée à une fonctionnalité

---

## 1.8 Bloc texte (éditeur)

### Règle

Pour une ligne sélectionnée :

👉 afficher / modifier un texte décrivant :
- le correctif
- ou l’évolution

---

# 🔄 2. Réorganisation de l’IHM

## 2.1 Ordre des blocs centraux

### État actuel

1. éditeur texte
2. tableau des impacts

### Cible

1. **tableau des impacts** (prioritaire)
2. **éditeur texte** (secondaire)

👉 Le tableau devient l’entrée principale

---

## 2.2 Logique utilisateur cible

1. sélection Produit
2. sélection Version
3. affichage des fonctionnalités
4. ajout d’un correctif / évolution via le tableau
5. édition du contenu associé

---

# ⚠️ 3. Écarts avec l’implémentation actuelle

## 3.1 Fonctionnalités hiérarchiques (à supprimer)

Actuellement :
- `level`
- indent / outdent
- drag & drop hiérarchique

👉 À désactiver / simplifier

---

## 3.2 Données hardcodées

Actuellement :
- produits
- versions
- fonctionnalités

👉 Conserver temporairement MAIS :
- préparer remplacement par API

---

## 3.3 Mauvais positionnement du bloc texte

👉 À corriger (voir section 2)

---

# 🔗 4. Questions de mapping métier ↔ code

⚠️ À NE PAS trancher automatiquement côté frontend

---

## 4.1 Version Produit

Questions :
- correspond-elle à `VersionProjet` ?
- ou à une nouvelle entité ?

---

## 4.2 Fonctionnalités

- utiliser directement `FonctionnaliteViewSet` ?
- filtrer par produit ?

---

## 4.3 Correctif / Évolution

Options possibles :
- simple structure frontend temporaire
- future entité backend
- lien avec `ImpactDocumentaire`

---

## 4.4 Tableau des impacts

- correspond à une future table pivot ?
- ou à un objet métier dédié ?

---

# 🚧 5. Périmètre de travail pour Claude Code

## Autorisé

- modification UI
- réorganisation des blocs
- simplification logique fonctionnalités
- préparation des points de branchement API

---

## Interdit

- inventer un modèle backend
- créer des endpoints arbitraires
- modifier le modèle métier existant

---

# 🎯 6. Objectif court terme

Obtenir un écran :

- cohérent fonctionnellement
- aligné avec le besoin métier
- prêt pour raccordement backend futur

---

# ✔️ Fin du document

