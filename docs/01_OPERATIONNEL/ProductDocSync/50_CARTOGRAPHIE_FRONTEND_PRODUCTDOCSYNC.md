# Documentum – Cartographie Frontend — `ProductDocSync`

> **Objet** : cartographie de l'existant basée sur le modèle officiel
>
> **Statut** : analyse stricte, sans modification de fond ni jugement
>
> **Composant analysé :** `ProductDocSync` (`src/screens/ProductDocSync/ProductDocSync.tsx`)
>
> **Route applicative :** `/product-doc-sync` (protégée par `RequireAuth`)
>
> **Produite le** : 2026-04-16

---

## 1. Rôle fonctionnel réel

- **Rôle actuel** :
  `ProductDocSync` est l'écran de synchronisation documentation-produit. Il vise à piloter la documentation par rapport aux fonctionnalités et versions d'un produit. Il orchestre un layout en quatre zones :
  - `SyncLeftSidebar` : liste des fonctionnalités, sélection produit/version, actions
  - `SyncEditor` : éditeur d'article (type évolution ou correctif)
  - `SyncBottombar` : barre basse redimensionnable avec informations contextuelles
  - `SyncRightSidebar` : panneau droit annexe

  Il gère aussi deux modales : `ImpactMapModal` (visualisation impact produit/version) et `TestPlanModal` (génération plan de test).

- **Écart éventuel** :
  L'ensemble des données (produits, versions, fonctionnalités) est **entièrement hardcodé** en `useState` local. Aucun appel API n'est effectué. Le backend expose `FonctionnaliteViewSet` (route `GET /api/fonctionnalites/`) mais ce composant ne s'y branche pas.

  > Confirmé par gap analysis F7 (verdict ⚠️ Partiel — écran et API existants, branchement manquant).

---

## 2. Flux métier pris en charge

| Flux | Déclencheur UI | Hook / Contexte | DTO | Endpoint actuel | Endpoint cible |
|------|----------------|----------------|-----|-----------------|---------------|
| Sélection produit | `Select` dans SyncLeftSidebar | `setSelectedProduct` (local) | — | Aucun | `GET /api/produits/` |
| Sélection version | `Select` dans SyncLeftSidebar | `setSelectedVersion` (local) | — | Aucun | `GET /api/versions/?produit={id}` |
| Ajout version | Bouton "Ajouter version" | `handleAddVersion` (local) | — | Aucun | À définir |
| Publication version | Bouton "Publier" | `handlePublishVersion` → `alert()` | — | Aucun | À définir |
| Sélection fonctionnalité | Clic item SyncLeftSidebar | `setSelectedFeature` (local) | `FeatureItem` | Aucun | À définir |
| Ajout fonctionnalité | Bouton + | `handleAddFeature` (local) | `FeatureItem` | Aucun | `POST /api/fonctionnalites/` |
| Suppression fonctionnalité | Action contextuelle | `handleDeleteFeature` (local) | `FeatureItem.id` | Aucun | `DELETE /api/fonctionnalites/{id}/` |
| Copie fonctionnalité | Action contextuelle | `handleCopyFeature` (local) + toast | `FeatureItem` | Aucun | — |
| Coller fonctionnalité | Action contextuelle | `handlePasteFeature` (local) | `FeatureItem` | Aucun | — |
| Indentation fonctionnalité | Action contextuelle | `handleIndent` (local) | `FeatureItem.id` | Aucun | À définir |
| Désindentation fonctionnalité | Action contextuelle | `handleOutdent` (local) | `FeatureItem.id` | Aucun | À définir |
| Réordonnancement fonctionnalités | Drag & drop | `handleReorder` (local) | `FeatureItem[]` | Aucun | À définir |
| Affichage carte d'impact | Bouton "Impact map" | `handleShowImpactMap` → `ImpactMapModal` | — | Aucun | À définir |
| Génération plan de test | Dans `ImpactMapModal` | `handleGenerateTestPlan` → `TestPlanModal` | `MinimalTask[]` | Aucun | À définir |
| Changement type article | Toggle évolution/correctif | `setSelectedArticleType` (local) | — | Aucun | — |
| Redimensionnement barre basse | Drag | `setBottomBarHeight` (local) | — | Aucun | — |

---

## 3. Appels backend effectués

**Aucun appel backend** dans `ProductDocSync.tsx`.

Toutes les données et mutations sont gérées localement en mémoire via `useState`.

| Endpoint actuel | Responsabilité | Conformité |
|-----------------|---------------|-----------|
| — | — | — |

### Endpoints backend disponibles (non utilisés)

Les endpoints suivants existent côté backend mais ne sont pas appelés :

| Endpoint disponible | ViewSet backend | Non utilisé car |
|--------------------|----------------|----------------|
| `GET /api/fonctionnalites/` | `FonctionnaliteViewSet` | Données hardcodées en local |
| `GET /api/produits/` | Non vérifié directement | Produits hardcodés (`["Planning", "Usager", "Finance"]`) |

---

## 4. États et contextes consommés

### Stores Zustand

Aucun store Zustand consommé dans `ProductDocSync`.

### États locaux critiques

| État | Type | Rôle |
|------|------|------|
| `selectedProduct` | `string` | Produit sélectionné (valeurs parmi `["Planning", "Usager", "Finance"]`) |
| `selectedVersion` | `string` | Version active (parmi liste locale `versions`) |
| `selectedFeature` | `number \| null` | ID fonctionnalité sélectionnée |
| `features` | `FeatureItem[]` | Liste des fonctionnalités — hardcodée (3 entrées initiales) |
| `versions` | `string[]` | Liste des versions — hardcodée (`["1.0", "1.1", "1.2"]`) |
| `isLeftSidebarExpanded` | `boolean` | Affichage SyncLeftSidebar |
| `isRightSidebarExpanded` | `boolean` | Affichage SyncRightSidebar |
| `copiedFeature` | `FeatureItem \| null` | Buffer copie fonctionnalité |
| `bottomBarHeight` | `number` | Hauteur SyncBottombar (200px par défaut) |
| `selectedArticleType` | `"evolution" \| "correctif"` | Type d'article dans SyncEditor |
| `showImpactMap` | `boolean` | Visibilité ImpactMapModal |
| `showTestPlanModal` | `boolean` | Visibilité TestPlanModal |
| `orderedTasks` | `MinimalTask[]` | Tâches du plan de test |

### Données hardcodées

```typescript
const products = ["Planning", "Usager", "Finance"];
// features : 3 FeatureItem statiques
// versions : ["1.0", "1.1", "1.2"]
```

---

## 5. DTO manipulés

### DTO consommés

| DTO | Source | Usage |
|-----|--------|-------|
| `FeatureItem` | Importé depuis `types/FeatureItem` | Fonctionnalités dans SyncLeftSidebar |

### Structure `FeatureItem` (observée)

```typescript
interface FeatureItem {
  id: number;
  name: string;
  level: number;        // 1 à 5
  expanded: boolean;
  hasUpdate?: boolean;
  hasEvolution?: boolean;
  hasCorrectif?: boolean;
}
```

### DTO produits

| DTO | Destination | Usage |
|-----|------------|-------|
| `FeatureItem` (copie) | `copiedFeature` | Buffer presse-papiers fonctionnalité |

### Type local `MinimalTask`

```typescript
type MinimalTask = {
  id: string;
  label: string;
};
```

Défini localement dans le corps du composant (pas dans `types/`).

---

## 6. Écarts avec le backend canonique

### 6.1 Données entièrement hardcodées

Toutes les listes (produits, versions, fonctionnalités) sont initialisées en `useState` avec des valeurs statiques. Aucune de ces données ne provient du backend.

### 6.2 Opérations locales sans persistance

| Opération | Comportement actuel | Attendu |
|-----------|--------------------|----|
| Ajout version | Incrémente le numéro mineur localement | POST vers un endpoint versions |
| Publication version | `alert()` navigateur | POST backend (non implémenté) |
| Ajout/suppression fonctionnalité | Mutation `useState` uniquement | API CRUD fonctionnalités |
| Réordonnancement, indent/outdent | Mutation `useState` uniquement | API backend si persisté |
| Plan de test | `console.log` + fermeture modale (ligne 210) | Génération map ou appel API |

### 6.3 Console.log de debug en production

```typescript
// ligne 144
console.log("Fonctionnalité collée :", newFeature.name);
// ligne 210 (dans TestPlanModal.onGenerate)
console.log("Plan de test validé :", tasks);
```

Deux `console.log` présents en production.

---

## 7. Risques et impacts

| Risque | Gravité | Note |
|--------|---------|------|
| Données non persistées | 🔴 Critique | Toute action est perdue au rechargement |
| Écran non opérationnel | 🔴 Critique | Aucun branchement API malgré backend disponible |
| `MinimalTask` défini localement | 🟡 Faible | Type non partagé — à déplacer dans `types/` |
| `console.log` debug | 🟡 Faible | Pollution de la console en production |
| `window.innerHeight` à l'init | 🟡 Faible | `TOTAL_HEIGHT` calculé une seule fois au montage |

**Sensibilité** : centrale — ProductDocSync est l'écran de pilotage documentaire Nexus (P2 dans la priorisation du gap analysis).

**Dépendances en cascade** : `ImpactDocumentaire` (absent du backend) conditionne l'opérationnalité complète de cet écran.

---

## 8. Verdict architectural

🔴 **À réaligner impérativement**

L'écran existe avec une UI complète. Le backend expose `FonctionnaliteViewSet`. Mais aucune connexion n'est établie entre les deux. Toutes les données sont locales et aucune persistance n'est assurée.

La prochaine étape documentée dans le plan d'actions (gap analysis P4) consiste à brancher `ProductDocSync.tsx` sur `FonctionnaliteViewSet`. L'implémentation de `ImpactDocumentaire` (P5) est un prérequis pour la fonctionnalité complète de pilotage documentaire.

---

**Fin de la cartographie `ProductDocSync`.**
