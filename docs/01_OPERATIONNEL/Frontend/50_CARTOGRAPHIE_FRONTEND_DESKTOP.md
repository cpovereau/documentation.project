# Documentum – Cartographie frontend — `Desktop`

> **Objet** : cartographie de l’existant basée sur le modèle fourni
> 
> **Statut** : analyse stricte, sans modification de fond ni jugement
>
> **Composant analysé :** `Desktop` (`src/screens/Desktop/Desktop.tsx`)

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
  - Sélection mapItem (`selectedMapItemId`)
  - État dock Editor (question/exercice)
  - Hauteur dock Editor
  - Liste des MapItems (stockage local d’un tableau de MapItem)
- **Propriétaire réel** : tous ces états sont locaux à Desktop et passés en props descendantes.
- **Rôle fonctionnel** : gestion d’affichage/layout et de la navigation UI (jamais la donnée métier brute ni sa persistance).
- **Dépendances principales** :  
  Aucun context Zustand ou React directement importé/utilisé ici ; toute la centralisation/réactivité se fait en local.

---

## 5. DTO manipulés

- **DTO consommés** :
  - `MapItem[]` : type stocké localement (fiche de la map éditoriale)
  - `selectedMapItemId: number | null`
- **DTO produits** :
  - Uniquement en local (états d’UI).
- **Transformations locales appliquées** :
  - Mise à jour de propriété `expanded` d’un item (dans `handleToggleExpandMapNode`)
- **DTO polyvalents / mal alignés** :
  - Impossible à évaluer sans voir les détails backend/DTOs métier.

---

## 6. Écarts avec le backend canonique

- Aucune logique d’appel backend ni transformation de données métier dans `Desktop.tsx` — toute divergence ou logique compensatoire doit être recherchée dans les sous-composants ou hooks associés.
- Possibles confusions entre structure (arborescence de map) et contenu éditorial, mais non visible à ce niveau.

---

## 7. Risques et impacts

- **Impact potentiel d’un réalignement backend** :
  - Faible tant que les props attendues des sous-composants restent inchangées
  - Si le backend ou les DTOs changent, l’impact sera absorbé d’abord par les sous-composants ou les hooks plus profonds.
- **Sensibilité du composant** : central (pivot du layout principal)
- **Dépendances en cascade** : toute évolution des structures descendantes (props des sidebars, CentralEditor…) pourrait avoir un fort effet domino.

---

## 8. Verdict architectural

- 🟢 Conforme — orchestrateur d’UI uniquement, sans responsabilité métier ni dépendance directe au backend.

---

**Fin de la cartographie frontend pour `Desktop`.**  
> (Une analyse complète des flux backend et des DTOs exigerait l’audit approfondi des sous-composants, notamment `LeftSidebar`, `CentralEditor`, etc.)

