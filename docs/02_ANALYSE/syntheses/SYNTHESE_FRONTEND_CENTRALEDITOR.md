# Documentum – Synthèse Frontend
## Issue de la cartographie `CentralEditor`

> **Statut** : validé
> 
> **Source** : Cartographie Frontend — CentralEditor
> 
> **Objectif** : formaliser le rôle métier de CentralEditor et ses contraintes dans l’architecture frontend Documentum.

---

## 1. Périmètre couvert

- Composant analysé : **CentralEditor**
- Nature : composant métier frontend (éditeur documentaire)
- Rôle : édition du contenu XML des rubriques, gestion du buffer, sauvegarde et outils d’assistance

---

## 2. Appels backend

| Endpoint | Responsabilité métier | Statut | Commentaire |
|---------|----------------------|--------|-------------|
| `PUT /api/rubriques/{id}/` | Sauvegarde du contenu XML | 🟢 Conforme | Point unique de persistance |

> CentralEditor ne déclenche aucun chargement structurel.

---

## 3. Flux métier pris en charge

- Édition du contenu XML via TipTap
- Gestion du buffer local (création, mise à jour, statut)
- Sauvegarde explicite
- Historique local (undo / redo)
- Recherche / remplacement
- Assistance à la saisie (grammaire, dictée vocale)

---

## 4. États et contextes consommés

- Store Zustand : `useXmlBufferStore`
- Hooks métier : grammaire, dictée, historique, find/replace
- États locaux UI (sélection, focus, mode XML)

> Le buffer local est un invariant fort de l’architecture.

---

## 5. Écarts avec le backend canonique

- Incohérence de routage mineure (`/rubriques/{id}/` vs `/api/rubriques/{id}/`)

Aucun autre écart structurel identifié.

---

## 6. Risques et impacts

- Dépendance forte à la discipline du buffer local
- Sensibilité élevée aux évolutions backend sur le contenu
- Composant critique pour l’expérience utilisateur

---

## 7. Verdict architectural

🟡 **Conforme sous contrainte**

- Architecture saine
- Rôle métier assumé
- Nécessite des invariants clairement documentés

---

## 8. Rôle dans la trajectoire globale

- Cœur éditorial stable
- Doit être protégé lors du réalignement backend
- Base saine pour évolutions futures (autosave, collaboration)

---

> **Cette synthèse acte CentralEditor comme composant métier frontend stratégique.**

**Fin de la synthèse Frontend — CentralEditor**