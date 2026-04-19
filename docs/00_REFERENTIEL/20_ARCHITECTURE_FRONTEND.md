# 🏗 20 — Architecture Frontend Documentum

Ce document décrit l’architecture cible et les invariants du frontend Documentum.

Il fait autorité pour :
- la structure React
- la gestion des états
- les interactions avec le backend
- la séparation des responsabilités

---

# 🎯 Objectifs

- Garantir une architecture cohérente et maintenable
- Éviter les dérives identifiées dans l’existant
- Servir de guide pour tout nouveau développement

---

# 🔒 Règle fondamentale

Le frontend ne contient aucune logique métier critique.

Il doit :
- afficher
- orchestrer
- déléguer

---

# 🧩 Vue d’ensemble

Le frontend repose sur 4 couches principales :

1. UI (composants)
2. Screens (orchestration)
3. Hooks (logique)
4. Services (API)

---

# 🧱 1. Couche UI — Composants

## Rôle

- afficher des données
- déclencher des actions

## Exemples

- MapModule
- ProjectModule
- boutons, panels, menus

## Règles

- pas d’appel API
- pas de logique métier
- pas de transformation complexe

---

# 🧠 2. Couche Orchestration — Screens

## Rôle

Coordonner les composants et les flux UI

## Exemples

- Desktop (CentralEditor)
- ProductDocSync (écran de Pilotage documentaire — contexte Ingénierie Logicielle)

## Responsabilités

- gérer la composition des composants
- orchestrer les interactions
- transmettre les props

## Exemple concret

Desktop :
- connecte LeftSidebar vers CentralEditor
- gère la sélection de rubrique

## Règles

- pas d’appel API direct
- pas de logique métier complexe

---

# ⚙️ 3. Couche Logique — Hooks

## Rôle

Contenir toute la logique frontend

## Types de hooks

Hooks métier :
- useRubriqueSave
- useGrammarChecker
- useFindReplaceTipTap
- useSpeechCommands

Hooks d’état :
- useXmlBufferStore
- useProjectStore

Hooks d’orchestration :
- useSelectedProduct
- useSelectedVersion

Hooks data-fetching (TanStack Query) :
- useQuery → lecture de données backend (liste, détail, structures)
- useMutation → écriture (création, modification, suppression, import)
- invalidateQueries → invalidation de cache après mutation
- setQueryData → pré-population du cache sans appel réseau supplémentaire

## QueryKeys standards

```
["projets"]                 liste projets non archivés
["projet", id]              détail projet (cache individuel)
["projet-structure", id]    structure (mapId + rubriques) d’un projet
["map-structure", mapId]    rubriques d’une map — source de vérité locale
["gammes"]  ["produits"]  ["fonctionnalites"]  ["interfaces"]
["tags"]  ["audiences"]  ["medias"]
["media-nom-check", ...params]   vérification nom média (requête conditionnelle)
```

## Règles

- toute logique complexe doit être dans un hook
- aucune logique métier dans les composants
- tout data-fetching doit utiliser TanStack Query (useQuery / useMutation)
- exception : `useXmlBufferSync` et `useRubriqueSave` — flux XML buffer géré hors TanStack Query intentionnellement

---

# 🔌 4. Couche API — Services

## Rôle

Centraliser tous les appels backend

## Point d'entrée unique

`src/lib/apiClient.ts` — instance Axios centralisée avec :
- headers auth/CSRF automatiques
- intercepteur réponse HTTP (gestion d'erreur normalisée)
- base URL relative (pas d'URL hardcodée)

## Règles

- aucun appel `api.` dans un composant ou un screen
- aucun appel `fetch` / `axios` brut hors `apiClient`
- toutes les routes doivent utiliser le préfixe `/api/...`
- exception : `/csrf/` (hors API, intentionnel)

## Fichiers de la couche API

- `src/api/*.ts` — fonctions pures qui appellent `apiClient`
- `src/hooks/*.ts` — hooks TanStack Query qui consomment `src/api/`

## Objectif

- garantir cohérence
- faciliter refactor
- uniformiser les erreurs

---

# 🧠 Gestion des états

## Principe fondamental

Une donnée = une seule source de vérité

## Stores principaux

useProjectStore :
- projet sélectionné

useXmlBufferStore :
- contenu XML
- statut (dirty, saved, etc.)

usePendingMediaStore :
- `pendingImage: MediaItem | null` — image en attente d'insertion
- Écrit par : `RightSidebar` (via `MediaPanel` → `MediaCard` → clic "Insérer")
- Lu et consommé par : `CentralEditor` (useEffect → `editor.setImage(...)` → `clearPendingImage`)
- Permet le couplage découplé entre composants sibling sans prop drilling via Desktop

useContextProduitStore (cible) :
- `context_produit` actif pour l’instance
- détermine les modules et écrans visibles
- conditionne les flux et données disponibles

> Note : `useContextProduitStore` est la cible d’architecture. Son implémentation est à définir lors du chantier de généralisation Nexus.

## Règles

- pas de duplication d’état
- pas de copie locale inutile

---

# 🔁 Flux critique : édition de rubrique

Le flux repose sur :

- CentralEditor pour l’édition
- XmlBufferStore pour le stockage temporaire
- useRubriqueSave pour la persistance

## Invariant

Le buffer est la source de vérité côté frontend

## Contrat `contenu_xml`

Le champ `contenu_xml` d’une rubrique est un **XML bien formé à racine unique `<body>`** :

```xml
<body>
  <p>...</p>
  <p>...</p>
</body>
```

Règles dérivées :
- `tiptapToXml()` est un sérialiseur de nœuds (pas de responsabilité de wrapping).
- `useXmlBufferSync` applique le wrapper `<body>` **avant** stockage dans le buffer.
- Le backend (`Rubrique.clean()` via `ET.fromstring()`) exige un seul élément racine — le wrapper garantit ce contrat.
- `useDitaLoader` applique une tolérance de chargement : si le XML lu en buffer est un fragment dégradé (détecté via `<parsererror>` DOMParser), il est wrappé `<body>` avant parsing.
- `parseXmlToTiptap` gère nativement `<body>` : aplatit les enfants directs en nœuds TipTap.

Voir `gov_decision-log.md` — `2026-04-17 – Format canonique de contenu_xml`.

---

# 🖼️ Flux critique : insertion image depuis la médiathèque

## Déclencheur

Clic sur le bouton "Insérer" d'une `MediaCard` dans `RightSidebar`.

## Chemin complet

```
MediaCard (onInsert)
  → MediaPanel (onInsertImage)
    → RightSidebar (handleInsertImage)
      → usePendingMediaStore.setPendingImage(item)
        → CentralEditor useEffect [pendingImage]
          → editor.chain().focus().setImage({ src: nom_fichier, alt: nom_fichier })
            → useXmlBufferSync sérialise → tiptapToXml (cas spécial image)
              → <image href="NOM_FICHIER.ext" alt="NOM_FICHIER.ext" />
          → clearPendingImage()
```

## Contrat XML produit

```xml
<image href="CODE_PRODUIT-CODE_FONCTION-TYPE_OBJET-NNN.ext" alt="CODE_PRODUIT-CODE_FONCTION-TYPE_OBJET-NNN.ext" />
```

## Invariants

- `nom_fichier` est la clé de référence stable (nomenclature déterministe imposée à l'import).
- `src` est le nom interne TipTap ; `href` est le nom DITA sérialisé — la conversion est dans `tiptapToXml.ts` (cas spécial `image`).
- Le parser `xmlToTiptap.ts` lit `href` ou `src` indifféremment (tolérance de lecture) → pas de modification nécessaire.
- `SyncEditor` n'est pas concerné : il n'utilise pas `getAllExtensions()` et ne consomme pas `usePendingMediaStore`.

Voir `gov_decision-log.md` — `2026-04-19 – RightSidebar Phase 3 : insertion image dans CentralEditor`.

---

# ⚠️ Problèmes identifiés dans l’existant

## 1. Mélange structure / contenu

Exemple :
- génération XML dans LeftSidebar

Interdit

---

## 2. Appels API dans les composants

~~Présents dans LeftSidebar~~ — **Résolu (Chantier 4, 2026-04-17)**

Tous les appels API sont maintenant dans les hooks TanStack Query.

---

## 3. Logique métier dans UI

Exemples :
- calcul du parent
- logique d’insertion

Doit être externalisé

---

## 4. Duplication d’état

Exemple :
- selectedProjectId utilisé via plusieurs sources

Une seule source de vérité obligatoire

---

# 🔒 Invariants d’architecture

## 1. Séparation stricte

UI → affichage  
Screen → orchestration  
Hook → logique  
Service → API  

---

## 2. Centralisation

- API centralisée
- hooks centralisés
- extensions TipTap centralisées

---

## 3. Pas de logique cachée

Toute logique doit être visible et traçable

---

## 4. Alignement backend

- le frontend consomme uniquement des DTO
- jamais des modèles implicites

---

# ❌ Patterns interdits

- appel API dans un composant
- logique métier dans UI
- duplication d’état global
- manipulation directe du DOM
- contournement des hooks existants

---

# 🔗 Liens avec les autres documents

- 10_MODELE_METIER_DOCUMENTUM.md
- 40_EDITION_RUBRIQUE.md
- 50_CARTOGRAPHIE_*
- 60_BACKEND_REEL.md

---

# 🗂 Architecture contextuelle (cible)

Le frontend cible doit être **contextuel** : la navigation, les écrans visibles et les flux disponibles dépendent du `context_produit` actif pour l'instance.

**Principe :**
- un `contextProduit` est chargé à l'initialisation de la session
- les modules et écrans sont activés ou désactivés selon ce contexte
- un futur shell/dashboard contextuel servira de point d'entrée commun

**Application actuelle :**
- l'écran `ProductDocSync` correspond au Pilotage documentaire dans le contexte `ingenierie_logicielle`
- aucun autre contexte n'est encore implémenté
- cette logique est à anticiper avant de multiplier les modules spécifiques

👉 Documenter le besoin d'architecture contextuelle n'implique pas que cette composition soit déjà livrée.

---

# 🧭 Objectif final

Le frontend doit être :

- prévisible
- modulaire
- **contextuel** (composition adaptée au `context_produit` actif)
- aligné avec le backend
- pilotable par la documentation

---

# ✔️ Fin du document