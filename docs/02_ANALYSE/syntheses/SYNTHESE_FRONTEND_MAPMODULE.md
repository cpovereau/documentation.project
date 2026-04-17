# Documentum – Synthèse Frontend
## Issue de la cartographie `MapModule`

> **Statut** : validé
> 
> **Source** : Cartographie Frontend — MapModule
> 
> **Objectif** : formaliser la position architecturale de MapModule et confirmer son rôle dans la chaîne frontend.
>
> **Dernière mise à jour** : 2026-04-17

---

## 1. Périmètre couvert

- Composant analysé : **MapModule**
- Nature : composant UI pur (présentation + interaction)
- Rôle : affichage et interaction avec la structure documentaire (arbre de rubriques)

---

## 2. Appels backend

- **Aucun appel backend direct ou indirect**

> Toutes les opérations métier sont déléguées via des handlers passés en props.

---

## 3. Flux métier exposés (intention UI)

| Flux | Déclencheur UI | Implémentation métier | Commentaire |
|------|----------------|-----------------------|-------------|
| Sélection rubrique | clic sur item | Handler parent (`onSelect`) | Conforme — racine non sélectionnable |
| Expansion / repli | clic chevron | Filtrage local (`getVisibleItems`) | UI interne — `expanded` vient des props |
| Indentation | menu contextuel item | Handler parent (`onIndent`) | Dépend backend |
| Désindentation | menu contextuel item | Handler parent (`onOutdent`) | Dépend backend |
| Réordonnancement | drag & drop (DnD kit) | Calcul local → `onReorder` parent | Tri visible calculé localement avant délégation |
| Renommage | double-clic | Handler parent (`onRename` / `onRenameSave`) | Inline edit via prop `editingItemId` |
| Clone / Suppression | barre d'outils | Handler parent (`onClone` / `onDelete`) | Désactivés sur la racine documentaire |

---

## 4. États et données manipulés

- Données reçues exclusivement via props
- DTO manipulé : `MapItem` (UI only)
- Calcul interne : `getVisibleItems()` — filtre les items selon `expanded` pour le rendu et le DnD
- État DnD géré par `@dnd-kit/core` + `@dnd-kit/sortable` (local, sans persistance)
- Aucun état critique persistant

---

## 5. Écarts avec le backend canonique

- Aucun écart direct
- Dépendances indirectes aux endpoints structurels via le composant parent

---

## 6. Risques et impacts

- Faible risque intrinsèque
- Sensibilité dépendante du parent (`LeftSidebar` / `Desktop`)
- Aucun effet de bord métier propre

---

## 7. Verdict architectural

🟢 **Conforme**

- Composant correctement découplé
- Responsabilités strictement UI
- Aligné avec le référentiel backend

---

## 8. Rôle dans la trajectoire globale

- Point d’appui stable pour le réalignement backend
- Ne nécessite aucune correction lors des évolutions backend
- Sert de référence pour les composants UI similaires

---

> **Cette synthèse confirme que MapModule n’est pas une source de dette technique ou métier.**

**Fin de la synthèse Frontend — MapModule**