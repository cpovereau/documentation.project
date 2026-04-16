# Documentum – Cartographie Frontend — `RightSidebar`

> **Objet** : cartographie de l'existant basée sur le modèle officiel
>
> **Statut** : analyse stricte, sans modification de fond ni jugement
>
> **Composant analysé :** `RightSidebar` (`src/components/ui/RightSidebar.tsx`)
>
> **Produite le** : 2026-04-16

---

## 1. Rôle fonctionnel réel

- **Rôle actuel** :
  `RightSidebar` est un panneau de ressources médias affiché sur le bord droit de l'écran `Desktop`. Il propose deux modes d'affichage :
  - **ancré** (`isFloating = false`) : panneau fixe adossé au bord droit, avec bouton toggle expansion/réduction
  - **flottant** (`isFloating = true`) : fenêtre libre déplaçable par drag-and-drop, redimensionnable par les bords gauche et droit, rendue via `createPortal` sur `document.body`

  Il délègue l'affichage du contenu à `MediaPanel` (images/vidéos, recherche, tri, modes d'affichage).

- **Écart éventuel** :
  Les données médias affichées sont **entièrement hardcodées** dans le composant (tableau de 8 `MediaItem` avec URLs placeholder `https://placehold.co/150x90`). Aucune API n'est appelée. Le panneau est fonctionnel visuellement mais non branché à une source de données réelle.

---

## 2. Flux métier pris en charge

| Flux | Déclencheur UI | Hook / Contexte | DTO | Endpoint actuel | Endpoint cible |
|------|----------------|----------------|-----|-----------------|---------------|
| Affichage médias | Montage composant | — | `MediaItem[]` (hardcodé) | Aucun | À définir |
| Toggle expansion (ancré) | Clic bouton `ArrowRightCircle` | `onExpand` callback | — | Aucun | — |
| Passage en mode flottant | Clic bouton `Move` | `onToggle(true)` callback | — | Aucun | — |
| Retour en mode ancré | Clic bouton `ArrowLeftFromLine` | `onToggle(false)` callback | — | Aucun | — |
| Drag fenêtre flottante | `mousedown` sur icône `Move` | événements mouse natifs | — | Aucun | — |
| Redimensionnement flottant | `mousedown` sur bord L/R | événements mouse natifs | — | Aucun | — |
| Recherche médias | Saisie texte | `setSearchText` (local) | — | Aucun | — |
| Tri médias | Clic label | `setSortOrder` (local) | — | Aucun | — |
| Changement mode affichage | Toggle | `setDisplayMode` (local) | — | Aucun | — |
| Changement type (image/vidéo) | Toggle switch | `setIsImageMode` (local) | — | Aucun | — |

---

## 3. Appels backend effectués

**Aucun appel backend** dans `RightSidebar.tsx`.

Les données `mediaItems` sont déclarées localement comme constante dans le corps du composant (8 éléments statiques). Aucun hook de chargement, aucun appel API.

| Endpoint actuel | Responsabilité | Conformité |
|-----------------|---------------|-----------|
| — | — | — |

---

## 4. États et contextes consommés

### Props reçues

| Prop | Type | Propriétaire | Rôle |
|------|------|-------------|------|
| `isExpanded` | `boolean` | `Desktop` (état local) | Contrôle l'expansion du panneau ancré |
| `isFloating` | `boolean` | `Desktop` (état local) | Contrôle le mode flottant |
| `onToggle` | `(isFloating: boolean) => void` | `Desktop` | Callback toggle flottant ↔ ancré |
| `onExpand` | `(isExpanded: boolean) => void` | `Desktop` | Callback expansion panneau ancré |
| `className?` | `string` | `Desktop` | Classes CSS additionnelles |

### États locaux critiques

| État | Type | Rôle |
|------|------|------|
| `isImageMode` | `boolean` | Filtre image/vidéo dans MediaPanel |
| `searchText` | `string` | Texte de recherche actif |
| `sortOrder` | `"asc" \| "desc"` | Ordre de tri |
| `displayMode` | `"grid" \| "small" \| "list"` | Mode d'affichage MediaPanel |
| `position` | `{ x, y }` | Position fenêtre flottante (initialisée à `window.innerWidth - 248, 103`) |
| `size` | `{ width, height }` | Dimensions fenêtre flottante (largeur min 248px) |

### Stores Zustand

Aucun store consommé.

### Anomalie d'état

```typescript
// RightSidebar.tsx:90
const [setPage] = useState(1);
```

`setPage` est déclaré comme valeur (`const [setPage]`), pas comme setter. Il est extrait à la position 0, pas 1. Le setter `setPage` n'est jamais utilisé. État inutilisé — preuve d'une pagination non implémentée.

---

## 5. DTO manipulés

### DTO consommés

| DTO | Source | Usage |
|-----|--------|-------|
| `MediaItem[]` | Hardcodé localement dans le composant | Passé à `MediaPanel` pour affichage |

### Structure `MediaItem`

```typescript
interface MediaItem {
  id: number;
  title: string;
  updatedText: string;
  imageUrl: string;  // URLs placeholder placehold.co
}
```

### DTO produits

Aucun.

### Transformations locales

Aucune transformation — `mediaItems` est passé directement à `MediaPanel`.

---

## 6. Écarts avec le backend canonique

### 6.1 Données hardcodées

Le tableau `mediaItems` contient 8 entrées statiques avec des URLs placeholder (`https://placehold.co/150x90`). Aucun endpoint backend n'est appelé pour charger des médias réels.

| Écart | Détail | Impact |
|-------|--------|--------|
| Médiathèque non branchée | Données hardcodées, aucune API | Fonctionnalité non opérationnelle |

### 6.2 Pagination non implémentée

Variable `setPage` déclarée mais jamais utilisée. Aucune logique de pagination dans le composant.

### 6.3 Paramètre `onExpand` / `onToggle`

La logique `toggleExpanded` (ligne 99–105) appelle `onExpand` si disponible, sinon `onToggle`. Cela crée une ambiguïté dans le contrat de props : `onExpand` et `onToggle` ont des signatures différentes et des rôles qui se recoupent partiellement.

---

## 7. Risques et impacts

| Risque | Gravité | Note |
|--------|---------|------|
| Données hardcodées | 🟠 Moyen | Panneau non opérationnel fonctionnellement |
| Drag/resize sur événements natifs | 🟡 Faible | Gestion nettoyage addEventListener présente, comportement correct |
| `window.innerWidth` à l'initialisation | 🟡 Faible | Position flottante ne s'adapte pas au redimensionnement de la fenêtre |
| `setPage` inutilisé | 🟢 Faible | Code mort uniquement |
| Ambiguïté `onExpand` / `onToggle` | 🟡 Faible | Fonctionnel mais contrat de props peu clair |

**Sensibilité** : périphérique — RightSidebar est indépendant du flux métier principal (édition XML).

**Dépendances en cascade** : faibles — `MediaPanel` uniquement. Aucun store partagé.

---

## 8. Verdict architectural

🔴 **À réaligner** — UI fonctionnelle, contenu non branché

Le composant gère correctement son affichage (modes ancré/flottant, drag, resize). Cependant, l'intégralité des données médias est hardcodée. Le panneau ne sert actuellement que de maquette statique. Un branchement vers une API de médiathèque est nécessaire pour que ce composant soit opérationnel.

---

**Fin de la cartographie `RightSidebar`.**
