# 🔄 40 — Flux métier : Édition d’une rubrique

Ce document décrit le **flux complet d’édition d’une rubrique dans Documentum**.

Il constitue la référence pour :
- le frontend (CentralEditor, LeftSidebar)
- le backend (API Rubrique)
- la gestion du buffer
- la logique de révision

---

# 🎯 Objectifs

- Décrire précisément le cycle d’édition
- Éviter toute perte de contenu
- Garantir la cohérence entre :
  - UI
  - buffer
  - backend

---

# 🔒 Règle fondamentale

👉 Une modification de contenu doit toujours passer par :

**Utilisateur → TipTap → Buffer → Sauvegarde → Révision**

---

# 🧩 Vue globale du flux

1. Sélection d’une rubrique  
2. Chargement du contenu  
3. Édition dans l’éditeur  
4. Mise à jour du buffer  
5. Sauvegarde  
6. Création de révision  

---

# 🧱 1. Sélection d’une rubrique

---

## Déclencheur

- clic utilisateur dans `LeftSidebar`

---

## Comportement

1. Vérifier le statut du buffer courant
2. Si `dirty` :
   - bloquer la navigation
   - ou demander confirmation

3. Si OK :
   - changer `selectedMapItemId`
   - transmettre à `CentralEditor`

---

## Invariant

❗ Aucun changement de rubrique ne doit détruire un buffer non sauvegardé

---

# 📥 2. Chargement du contenu

---

## Source

- `useXmlBufferStore.getXml(rubriqueId)`
- ou backend si absent

---

## Étapes

1. Récupérer XML
2. Convertir XML → TipTap JSON
3. Injecter dans l’éditeur

---

## Effets

- affichage du contenu
- reset du tracker de modification

---

## Statut buffer

- `ready` ou `saved`

---

# ✍️ 3. Édition utilisateur

---

## Déclencheur

- saisie dans TipTap

---

## Comportement

1. Modification du document TipTap
2. Conversion TipTap → XML
3. Mise à jour du buffer

---

## Effets

- `setXml(rubriqueId, xml)`
- `setStatus("dirty")`

---

## Invariant

👉 Le buffer est la **source de vérité locale**

---

# 🧠 4. Gestion du buffer

---

## Rôle

Le buffer contient :
- le contenu XML courant
- le statut d’édition

---

## Statuts

- `ready` → contenu initial
- `dirty` → modifié non sauvegardé
- `saved` → synchronisé backend
- `error` → problème de sauvegarde

---

## Règles

- toute modification → `dirty`
- toute sauvegarde réussie → `saved`
- aucune navigation si `dirty` sans validation

---

# 💾 5. Sauvegarde

---

## Déclencheur

- bouton "Enregistrer"

---

## Étapes

1. Récupérer XML depuis buffer
2. Appeler API : `PUT /api/rubriques/{id}/`
3. Backend traite la modification

---

## Réponse attendue

- succès → OK
- erreur → message structuré

---

## Effets frontend

- `setStatus("saved")`
- reset du change tracker

---

# 🔁 6. Création de révision

---

## Principe

👉 Une sauvegarde avec modification crée une **nouvelle révision**

---

## Conditions

- XML différent de la version précédente

---

## Effets backend

- création d’une nouvelle révision
- mise à jour de la rubrique active

---

## Rappel métier

- une révision = modification réelle  
- une sauvegarde sans modification ≠ révision  

---

# ⚠️ Cas critiques

---

## 1. Navigation avec buffer dirty

- doit être bloquée ou confirmée
- jamais silencieuse

---

## 2. Échec de sauvegarde

- statut → `error`
- afficher message utilisateur
- ne pas perdre le buffer

---

## 3. Rechargement de page

- risque de perte buffer
- à terme → autosave ou persistence

---

## 4. Modification concurrente (future)

- gérer conflits
- version serveur vs client

---

# 🔗 Interactions frontend

---

## LeftSidebar

- déclenche la sélection
- protège le buffer

---

## CentralEditor

- gère l’édition
- synchronise XML ↔ TipTap
- déclenche la sauvegarde

---

## XmlBufferStore

- stocke le contenu
- expose :
  - `getXml`
  - `setXml`
  - `getStatus`
  - `setStatus`

---

# 🔗 Interactions backend

---

## Endpoint principal

`PUT /api/rubriques/{id}/`


---

## Responsabilités backend

- valider XML
- créer révision si nécessaire
- garantir cohérence

---

# 🧠 Invariants critiques

---

## 1. Source de vérité

- frontend → buffer
- backend → persistance

---

## 2. Aucune perte de contenu

- toute perte est un bug critique

---

## 3. Séparation stricte

- structure (maps) ≠ contenu (rubrique)

---

## 4. Révision contrôlée

- uniquement via sauvegarde

---

# ❌ Anti-patterns

---

❌ Sauvegarde implicite non visible  
❌ Reset du buffer sans validation  
❌ Modification du contenu hors CentralEditor  
❌ Création de révision sans modification  
❌ Lecture directe backend sans buffer  

---

# 🧭 Évolutions prévues

---

- autosave configurable
- gestion des conflits
- historique avancé
- validation XML enrichie

---

# ✔️ Fin du document