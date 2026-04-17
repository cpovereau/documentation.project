# Documentum – Synthèse Frontend
## Issue de la cartographie `CentralEditor`

> **Statut** : validé
> 
> **Source** : Cartographie Frontend — CentralEditor
> 
> **Objectif** : formaliser le rôle métier de CentralEditor et ses contraintes dans l’architecture frontend Documentum.
>
> **Dernière mise à jour** : 2026-04-17

---

## 1. Périmètre couvert

- Composant analysé : **CentralEditor**
- Nature : composant métier frontend (éditeur documentaire)
- Rôle : édition du contenu XML des rubriques, gestion du buffer, sauvegarde et outils d’assistance

---

## 2. Appels backend

| Endpoint | Responsabilité métier | Statut | Commentaire |
|---------|----------------------|--------|-------------|
| `PATCH /api/rubriques/{id}/` | Sauvegarde du contenu XML | 🟢 Conforme | Via `useRubriqueSave` — payload `{ contenu_xml }` |
| `POST /api/validate-xml/` *(via hook)* | Validation XML backend | 🟢 Conforme | Via `useXmlValidation` — déclenché explicitement |

> CentralEditor ne déclenche aucun chargement structurel.
> Note : l'ancien `PUT` a été remplacé par `PATCH` (mise à jour partielle — DRF `ModelViewSet` l'accepte).

---

## 3. Flux métier pris en charge

- Édition du contenu XML via TipTap (recréé au changement de `rubriqueId`)
- Synchronisation TipTap ↔ buffer XML (`useXmlBufferSync`)
- Chargement XML → TipTap au changement de rubrique (`useDitaLoader`)
- Suivi des modifications (`useRubriqueChangeTracker` — `hasChanges`)
- Sauvegarde explicite (`useRubriqueSave` → `PATCH`)
- Validation XML backend (`useXmlValidation` + `XmlValidationPanel`)
- Historique des actions éditeur (`useEditorHistoryTracker`)
- Recherche / remplacement (`useFindReplaceTipTap`)
- Assistance à la saisie (grammaire : `useGrammarChecker`, popup : `useGrammarPopup`)
- Dictée vocale (`useDictation`)
- Raccourcis clavier (`useEditorShortcuts`)
- Éditeurs dock : `QuestionEditor` / `ExerciceEditor` (intégrés en zone inférieure)

---

## 4. États et contextes consommés

- Store Zustand : `useXmlBufferStore` (lecture XML, statut buffer)
- Prop entrant : `rubriqueId: number | null` — transmis par Desktop via `useSelectionStore`
- Hooks métier : `useRubriqueSave`, `useRubriqueChangeTracker`, `useDitaLoader`, `useXmlBufferSync`, `useXmlValidation`, `useGrammarChecker`, `useDictation`, `useFindReplaceTipTap`, `useEditorHistoryTracker`, `useEditorShortcuts`
- Hooks UI extraits : `useEditorDialogs`, `useEditorUIState`, `useGrammarPopup`
- États locaux : `findValue`, `replaceValue`, `batchMode`, `wordCount`, DnD resize dock

> Le buffer local est un invariant fort de l’architecture.
> CentralEditor ne lit jamais la sélection depuis le store — il reçoit `rubriqueId` en prop (découplage volontaire).

---

## 5. Écarts avec le backend canonique

- ✅ Incohérence de routage résolue : `useRubriqueSave` utilise systématiquement `/api/rubriques/${rubriqueId}/`
- ✅ Méthode HTTP corrigée : `PATCH` (était `PUT`) — cohérent avec DRF `ModelViewSet`

Aucun écart structurel identifié à ce jour.

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