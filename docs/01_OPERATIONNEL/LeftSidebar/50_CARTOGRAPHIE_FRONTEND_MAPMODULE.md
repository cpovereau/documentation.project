# Documentum — Cartographie Frontend — `MapModule`

> **Objet** : cartographie de l’existant basée sur le modèle officiel
>
> **Statut** : conforme — composant de présentation pur, aucun appel backend direct
>
> **Composant analysé :** `MapModule` (`src/components/ui/MapModule.tsx`)
>
> **Dernière mise à jour** : 2026-04-16

---

## Cartographie Frontend — `MapModule`

---

### 1. Rôle fonctionnel réel

- **Rôle actuel :**
  - `MapModule` sert de composant central pour l’affichage et la gestion interactive d’une arborescence de rubriques (la "Map documentaire") dans l’UI : navigation, sélection, création, suppression, renommage, duplication, import/export, réorganisation par drag & drop.
- **Écart éventuel :**
  - Aucun écart direct repéré entre l’intention apparente du composant (gestion de carte documentaire) et sa responsabilité observée. 

---

### 2. Flux métier pris en charge

| Flux                        | Déclencheur UI                       | Hook / Contexte    | DTO         | Endpoint actuel | Endpoint cible   |
|-----------------------------|--------------------------------------|--------------------|-------------|-----------------|------------------|
| Sélection de rubrique       | Clic sur un item (`onSelect`)        | –                  | MapItem     | ?               | À déterminer     |
| Renommage de rubrique       | Clic / action UI (`onRenameSave`)    | –                  | MapItem     | ?               | À déterminer     |
| Création de rubrique        | Clic bouton "Créer" (`onAdd`)        | –                  | MapItem     | ?               | À déterminer     |
| Import Word                 | Clic bouton "Importer Word"          | –                  | –           | ?               | À déterminer     |
| Rechargement map            | Clic bouton "Charger map"            | –                  | MapItem[]   | ?               | À déterminer     |
| Duplication rubrique        | Clic bouton "Dupliquer" (`onClone`)  | –                  | MapItem     | ?               | À déterminer     |
| Suppression rubrique        | Clic bouton "Supprimer" (`onDelete`) | –                  | MapItem     | ?               | À déterminer     |
| Réorganisation drag & drop  | Drag & drop                          | dnd-kit           | –           | –               | –                |

> 💡 Les endpoints ne sont pas visibles dans ce composant — les props correspondent à des callbacks probablement connectées à des hooks/API ailleurs. L’identification des endpoints cibles requiert l’analyse du chaînage ascendant.

---

### 3. Appels backend effectués

- **Constat** : Aucun appel backend direct ni via hooks/axios dans `MapModule.tsx` lui-même. Toute interaction backend passe via les props/callbacks déléguées, non définies ici.
- **Responsabilité métier réelle** : Rôle strictement présentateur/contrôleur UI, sans accès réseau direct.
- **Conformité backend** : 
  - 🟢 Aucun détournement ou appel hors normes dans ce composant.

---

### 4. États et contextes consommés

- **Props reçues :**
  - `mapItems`, `selectedMapItemId`, `editingItemId`, etc. — fournis par le parent, non gérés localement.
- **États locaux :**
  - Aucun état React local sensible. 
  - Utilisation locale de la factory `useSensors` de `dnd-kit` pour le Drag & Drop, non persistant.
- **Contextes/Stores extérieurs :**
  - ⚠️ Rien n’est consommé en direct (ni Zustand ni React Context explicite).
  - Toutes les modifications d’état sont déléguées via props.

---

### 5. DTO manipulés

- `MapItem` (type importé) — structure des items de la map documentaire, utilisée partout.
- Le composant ne transforme ni ne surcharge directement le DTO ; il relaie et mappe les objets reçus.

---

### 6. Écarts avec le backend canonique

- Aucune logique métier compensatoire ni appel hors contrat détecté dans ce composant.
- La structure (arborescence) vs. le contenu semble correctement distinguée (usage de `isStructuralOnlyNode`).
- Toute transformation ou requête métier passe en amont.

---

### 7. Risques et impacts

- **Impact potentiel d’un réalignement backend :**
  - Faible direct : le composant dépend de props pour les flux métier, la casse ne viendrait qu’en cas d’invalidation des DTO ou des handlers en amont.
- **Sensibilité du composant :**
  - Modulable mais central concernant l’UI de navigation documentaire.
- **Dépendances :**
  - Dépendance forte au contrat `MapItem` et à la signature des callbacks props.

---

### 8. Verdict architectural

- 🟢 Conforme

---

**Fin de la cartographie. Toute incertitude concerne les handlers passés en props, nécessitant traçage supplémentaire hors de ce composant.**

