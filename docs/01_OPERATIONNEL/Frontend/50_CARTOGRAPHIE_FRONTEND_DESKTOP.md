# Documentum – Cartographie frontend — `Desktop`

> **Objet** : cartographie de l’existant basée sur le modèle officiel
>
> **Statut** : conforme — orchestrateur UI pur, chaîne de sélection fonctionnelle
>
> **Composant analysé :** `Desktop` (`src/screens/Desktop/Desktop.tsx`)
>
> **Dernière mise à jour** : 2026-04-16

---

## 1. Rôle fonctionnel réel

- **Rôle actuel** :  
  `Desktop` orchestre l’affichage principal du mode « bureau » de l’application Documentum. Il gère la composition du layout en assemblant `TopBar`, `LeftSidebar`, `CentralEditor` et `RightSidebar`.  
  Il s’occupe de la gestion locale des états d’affichage (expansion, flottant, sélection de map, mode aperçu, hauteur des docks) et de la transmission des callbacks aux sous-composants pour piloter l’UI et la navigation entre les éléments éditoriaux (rubriques, maps, etc).
- **Écart éventuel** :  
  Aucun écart ne peut être déterminé sans référentiel théorique plus précis – le composant semble correspondre à une responsabilité de principal orchestrateur d’UI pour l’écran desktop, sans logique métier complexe.

---

## 2. Flux métier pris en charge

| Flux                                   | Déclencheur UI                  | Hook / Contexte        | DTO              | Endpoint actuel | Endpoint cible |
|-----------------------------------------|----------------------------------|------------------------|------------------|-----------------|---------------|
| Sélection d’un item dans la map         | Clic dans LeftSidebar            | -- (lifted state)      | MapItem          | --              | --            |
| Toggle des sidebars (display/floating)  | Icônes/flèches, boutons, options | -- (lifted state)      | --               | --              | --            |
| Passage en mode aperçu                  | Bouton/commande CentralEditor    | -- (voir prop)         | --               | --              | --            |
| Gestion dock Editor (question/exercice) | Bouton dans CentralEditor        | -- (voir prop)         | --               | --              | --            |

> Aucune interaction métier profonde (appel API) depuis Desktop lui-même, tout est délégué aux sous-composants.

---

## 3. Appels backend effectués

- **Endpoints actuels** :  
  Aucun appel backend direct depuis `Desktop.tsx`.  
  Les interactions API sont déléguées à des sous-composants (`LeftSidebar`, `CentralEditor`…), non analysés ici.
- **Responsabilité métier réelle** :  
  --  
- **Conformité avec le référentiel backend** :  
  --  

---

## 4. États et contextes consommés

- **États locaux critiques** :
  - Affichage sidebars (expansion/flottant)
  - Mode aperçu (`isPreviewMode`)
  - État dock Editor (question/exercice)
  - Hauteur dock Editor
- **Store Zustand** :
  - `useSelectionStore` → `selectedRubriqueId` : passé en prop `rubriqueId` à `CentralEditor` ✅ (Lot 1)
- **Propriétaire réel** : états layout locaux à Desktop ; sélection rubrique centralisée dans `selectionStore`.
- **Rôle fonctionnel** : orchestration du layout uniquement — aucune logique métier, aucun appel API.

---

## 5. DTO manipulés

- **DTO consommés** :
  - `selectedRubriqueId: number | null` — lu depuis `useSelectionStore`, passé à `CentralEditor`
- **DTO produits** : aucun.
- **Transformations locales** : aucune — Desktop ne transforme pas de données métier.

---

## 6. Écarts avec le backend canonique

Aucun appel backend direct dans `Desktop.tsx`.

### ~~Bug A — `mapItems` toujours vide → `selectedRubriqueId` toujours null~~ ✅ Résolu Lot 1

État `mapItems` et calcul local `selectedRubriqueId` supprimés. Desktop lit désormais `selectedRubriqueId` directement depuis `useSelectionStore` et le passe en prop à `CentralEditor`. `CentralEditor` reçoit le vrai identifiant rubrique.

### ~~Bug B — `handleToggleExpandMapNode` jamais invoqué~~ ✅ Résolu Lot 1

Handler mort supprimé. `LeftSidebar` gère son expansion localement via `toggleMapExpand`.

---

## 7. Risques et impacts

- **Impact potentiel d’un réalignement backend** :
  - Faible tant que les props attendues des sous-composants restent inchangées
  - Si le backend ou les DTOs changent, l’impact sera absorbé d’abord par les sous-composants ou les hooks plus profonds.
- **Sensibilité du composant** : central (pivot du layout principal)
- **Dépendances en cascade** : toute évolution des structures descendantes (props des sidebars, CentralEditor…) pourrait avoir un fort effet domino.

---

## 8. Verdict architectural

🟢 **Conforme — orchestrateur UI pur, chaîne de sélection fonctionnelle**

1. ✅ `selectedRubriqueId` lu depuis `useSelectionStore` → `CentralEditor` alimenté correctement (Lot 1)
2. ✅ Handlers morts (`handleToggleExpandMapNode`, état `mapItems`) supprimés (Lot 1)
3. ✅ Aucun état mort résiduel confirmé à l’audit Lot 4 (2026-04-10)

Desktop est un orchestrateur de layout sans logique métier ni appel API direct. Son rôle est bien délimité.

> Mise à jour 2026-04-10 — Lot 4 (audit confirmé propre)

---

**Fin de la cartographie frontend pour `Desktop`.**  
> (Une analyse complète des flux backend et des DTOs exigerait l’audit approfondi des sous-composants, notamment `LeftSidebar`, `CentralEditor`, etc.)

