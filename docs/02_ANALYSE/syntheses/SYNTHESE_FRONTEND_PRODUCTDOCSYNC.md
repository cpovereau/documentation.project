# 📘 SYNTHESE — ProductDocSync — Cadrage fonctionnel

> **Statut** : document vivant — réalignement après sessions de travail 2026-04-16/17
>
> **Périmètre** : écran `ProductDocSync` — sélection Produit/Version, liste des fonctionnalités, tableau Correctifs/Évolutions, éditeur associé · Frontend React/TypeScript + raccordement API Django/DRF
>
> **Objectif** : tracer l'état d'implémentation réel de l'écran, documenter les décisions de mapping métier arrêtées, et identifier les bloquants pour les phases suivantes (versions Produit, ImpactDocumentaire)
>
> **Dernière mise à jour** : 2026-04-17

---

## 🎯 Objectif du document

Ce document sert de **pont entre le besoin métier et l'implémentation frontend actuelle** de l'écran `ProductDocSync`.

Il permet de :
- clarifier les règles fonctionnelles validées
- identifier les écarts avec l'IHM actuelle
- préparer le travail de Claude Code sans dérive métier
- sécuriser le futur raccordement backend

---

# 🧩 1. Règles fonctionnelles validées

## 1.1 Contexte métier

L'écran `ProductDocSync` permet de gérer :
- le **suivi des versions d'un produit**
- les **évolutions et correctifs associés aux fonctionnalités**
- les **impacts documentaires** associés

👉 Il s'agit d'un écran **métier distinct** du module de documentation classique.

---

## 1.2 Sélection Produit / Version

### Règle

L'utilisateur sélectionne :
- un **Produit**
- une **Version Produit**

⚠️ Important :
> Il s'agit bien d'une **version Produit** (et non d'une version de projet documentaire).

### État d'implémentation (2026-04-17)

| Élément | État | Détail |
|---------|------|--------|
| Sélection Produit | ✅ Branché API | `useProduits()` → `GET /api/produits/` ; `selectedProductId: number \| null` |
| Sélection Version | ⚠️ Local | Liste statique `["1.0", "1.1", "1.2"]` — entité "version Produit" non définie en backend |

---

## 1.3 Création de version

### Règle

Le bouton `+` à droite du sélecteur de version permet de créer une nouvelle version Produit, l'ajouter dans la liste et la sélectionner automatiquement.

### État d'implémentation (2026-04-17)

⚠️ **Local uniquement** — incrémentation automatique du numéro mineur (ex. `1.2` → `1.3`).

**Pourquoi le backend n'est pas branché :**
`VersionProjet` (seule entité de versioning disponible) est liée à `Projet`, pas à `Produit`. Brancher les versions sur `VersionProjet` serait une erreur de modèle. L'entité "version Produit" doit être définie avec l'équipe avant tout raccordement.

> **TODO (Phase 2 — bloqué)** : définir l'entité "version Produit" avec l'équipe, puis créer `useVersionProduitList(selectedProductId)` et brancher sur `POST /api/versions-produit/`.

---

## 1.4 Affichage des fonctionnalités

### Règle

Après sélection Produit + Version : afficher la **liste des fonctionnalités du produit**.

Source fonctionnelle : référentiel géré dans `Settings > Fonctionnalités`.

### État d'implémentation (2026-04-17)

✅ **Branché API** — `useFonctionnaliteList(selectedProductId)` :
- Chargement : `GET /api/fonctionnalites/?archived=false`
- Filtrage par produit : côté frontend (`f.produit === produitId`) — pas de `?produit=` backend (TODO Phase 2)
- Affichage conditionnel : uniquement si Produit **ET** Version sélectionnés (`showFeatures`)
- Ajout : `POST /api/fonctionnalites/` avec `nom`, `code` (auto), `id_fonctionnalite` (auto)
- Archivage : `PATCH /api/fonctionnalites/{id}/archive/` (DELETE → HTTP 405 bloqué par `ArchivableModelViewSet`)

---

## 1.5 Structure des fonctionnalités

### Règle (validée 2026-04-16)

👉 Les fonctionnalités sont **mono-niveau**

Suppression de : indentation, désindentation, niveaux (`level`), hiérarchie drag & drop.

⚠️ La hiérarchie pourra être réintroduite si nécessaire — décision explicite requise.

### État d'implémentation (2026-04-17)

✅ **Implémenté** :
- `onIndent` / `onOutdent` supprimés de `FeatureItem`, `FeatureModule`, `SyncLeftSidebar`
- `level` forcé à `1` dans `toFeatureItem()` (hook)
- `handleToggleExpand` dormant (no-op) — expand/collapse sans effet en mono-niveau

---

## 1.6 Gestion des évolutions / correctifs

### Règle

Pour une fonctionnalité donnée : créer un élément de type **Correctif** ou **Évolution**.

### État d'implémentation (2026-04-17)

⚠️ **Local uniquement** — `ImpactItem` est un type frontend sans entité backend :
```typescript
type ImpactItem = {
  id: number; featureId: number; featureName: string;
  type: "correctif" | "evolution"; titre: string;
  statut: "à_faire" | "en_cours" | "prêt" | "validé";
};
```
Le tableau `SyncBottombar` permet d'ajouter/lister ces items localement. Aucune persistance pour l'instant.

---

## 1.7 Tableau des impacts (bloc central principal)

### Règle

Un tableau liste les fonctionnalités impactées et les éléments créés (correctifs / évolutions).
Le bouton `+` permet d'ajouter une ligne associée à une fonctionnalité.

### État d'implémentation (2026-04-17)

✅ **Réorganisation effectuée** — tableau (`SyncBottombar`) en position **principale (haut)**, éditeur (`SyncEditor`) en position **secondaire (bas)**.

⚠️ **Données locales** — `ImpactItem[]` géré en état React local dans `SyncBottombar`. Pas de persistance backend.

> **TODO (Phase 3 — bloqué sur M1)** : `ImpactDocumentaire` absent du modèle Django. Implémenter modèle + API + intégration avant de brancher ce tableau.

---

## 1.8 Bloc texte (éditeur)

### Règle

Pour une ligne sélectionnée : afficher / modifier un texte décrivant le correctif ou l'évolution.

### État d'implémentation (2026-04-17)

⚠️ **Non branché** — `SyncEditor` affiche un éditeur avec sélection de type (`evolution` / `correctif`), mais sans lien avec la sélection du tableau. Pas de persistance.

---

# 🔄 2. Réorganisation de l'IHM

## 2.1 Ordre des blocs centraux

| | Avant | Après (2026-04-17) |
|-|-------|---------------------|
| Position 1 | éditeur texte | ✅ **tableau des impacts** (`SyncBottombar`) |
| Position 2 | tableau des impacts | ✅ **éditeur texte** (`SyncEditor`) |

✅ **Implémenté** — le tableau est l'entrée principale.

---

## 2.2 Logique utilisateur cible

| Étape | État |
|-------|------|
| 1. sélection Produit | ✅ branché API |
| 2. sélection Version | ⚠️ local |
| 3. affichage fonctionnalités | ✅ branché API |
| 4. ajout correctif / évolution via tableau | ⚠️ local (ImpactItem) |
| 5. édition du contenu associé | ⚠️ non branché |

---

# ✅ 3. Résolution des écarts initiaux

## 3.1 Fonctionnalités hiérarchiques

✅ **Résolu** — indent/outdent/level supprimés. Hiérarchie désactivée. Code nettoyé dans `FeatureItem.tsx`, `FeatureModule.tsx`, `SyncLeftSidebar.tsx`.

---

## 3.2 Données hardcodées

| Élément | État initial | État 2026-04-17 |
|---------|-------------|-----------------|
| Produits | hardcodé | ✅ API `GET /api/produits/` |
| Fonctionnalités | hardcodé | ✅ API `GET /api/fonctionnalites/` |
| Versions | hardcodé | ⚠️ local — entité backend manquante |
| Correctifs/Évolutions | hardcodé | ⚠️ local — `ImpactDocumentaire` absent |

---

## 3.3 Mauvais positionnement du bloc texte

✅ **Résolu** — tableau en haut, éditeur en bas. Redimensionnement vertical drag & drop corrigé (sens et blocage sélection texte).

---

# 🔗 4. Questions de mapping métier ↔ code — Réponses arrêtées

## 4.1 Version Produit

**Question initiale** : correspond-elle à `VersionProjet` ou à une nouvelle entité ?

**Réponse (2026-04-17)** : ❌ `VersionProjet` est lié à `Projet` (FK `projet → Projet`), **pas à `Produit`**. Brancher dessus serait une erreur de modèle. Une nouvelle entité "version Produit" doit être définie avec l'équipe.

> Statut : **bloqué Phase 2** — décision métier requise.

---

## 4.2 Fonctionnalités

**Question initiale** : utiliser `FonctionnaliteViewSet` ? Filtrer par produit ?

**Réponse (2026-04-17)** : ✅ `FonctionnaliteViewSet` utilisé directement. Filtrage par `produit` effectué côté **frontend** (`f.produit === produitId`) car le backend n'expose pas de paramètre `?produit=`.

> TODO Phase 2 : ajouter `?produit={id}` côté backend pour éviter de charger toutes les fonctionnalités.

---

## 4.3 Correctif / Évolution

**Question initiale** : structure frontend temporaire, future entité backend, ou lien avec `ImpactDocumentaire` ?

**Réponse (2026-04-17)** : ⚠️ Structure frontend temporaire (`ImpactItem`) pour l'instant. Le lien avec `ImpactDocumentaire` est la cible, mais le modèle Django `ImpactDocumentaire` est **absent** — c'est l'écart M1 du GAP_ANALYSIS (gravité 🔴 Critique).

> Statut : **bloqué Phase 3** — implémentation `ImpactDocumentaire` backend requise avant tout branchement.

---

## 4.4 Tableau des impacts

**Question initiale** : future table pivot ou objet métier dédié ?

**Réponse (2026-04-17)** : Objet métier dédié — `ImpactDocumentaire` (modèle Django à créer) reliant `ÉvolutionProduit → Rubrique` avec statuts (`à_faire` / `en_cours` / `prêt` / `validé`). Pas une simple table pivot.

> Statut : **bloqué Phase 3** — même dépendance que 4.3.

---

# 🚧 5. Périmètre de travail restant

## Autorisé — prochaines sessions

- Définir l'entité "version Produit" avec l'équipe → brancher `VersionSelect`
- Ajouter `?produit=` côté backend → simplifier le filtrage frontend
- Implémenter `ImpactDocumentaire` (modèle + API) → brancher `SyncBottombar`
- Brancher `SyncEditor` sur la ligne sélectionnée du tableau

## Interdit — invariants

- Réutiliser `VersionProjet` pour les versions Produit
- Créer des endpoints arbitraires hors modèle métier validé
- Modifier le modèle `Fonctionnalite` sans décision backend

---

# 🎯 6. Objectif court terme résiduel

| Objectif | État |
|----------|------|
| Écran cohérent fonctionnellement | ✅ Atteint |
| Alignement cadrage métier | ✅ Atteint |
| Produits + Fonctionnalités sur API | ✅ Atteint |
| Versions Produit sur API | ❌ Bloqué — entité backend manquante |
| ImpactDocumentaire branché | ❌ Bloqué — modèle Django manquant |
| Éditeur lié au tableau | ❌ Non commencé |

---

# ✔️ Fin du document
