# 🧠 10 — Glossaire Documentum

Ce document définit le **vocabulaire officiel du projet Documentum**.

Il constitue la **source de vérité métier**.

---

# 🎯 Objectifs

- Éliminer toute ambiguïté terminologique
- Aligner frontend, backend et UX
- Servir de référence pour :
  - les développements
  - les documents techniques
  - les échanges entre humains et IA

---

# 🔒 Règle fondamentale

Un terme défini ici :

- a **une seule signification**
- est utilisé **partout avec ce sens**
- ne doit **jamais être redéfini ailleurs**

---

# 📚 Concepts fondamentaux

---

## 📦 Projet

**Définition :**  
Un projet représente une **documentation complète** liée à un produit.

**Rôle :**
- conteneur principal de la documentation
- point d’entrée des publications

**Caractéristiques :**
- possède des versions
- possède une ou plusieurs maps
- possède des rubriques

**À ne pas confondre avec :**
- une version (état figé)
- une map (structure)
- une rubrique (contenu)

---

## 🧾 Version de projet

**Définition :**  
Une version de projet est une **photographie figée de la documentation** à un instant donné.

**Rôle :**
- matérialiser une publication
- permettre la traçabilité

**Caractéristiques :**
- une seule version active
- versions archivées non modifiables
- créée lors d’une publication

**Important :**
- une version ≠ une modification
- une version = un état publié

---

## 🧩 Rubrique

**Définition :**  
Une rubrique est un **composant éditorial réutilisable**.

**Rôle :**
- contenir du contenu XML (DITA)
- être assemblée dans des maps

**Caractéristiques :**
- versionnée indépendamment (révisions)
- peut être liée à plusieurs fonctionnalités
- peut apparaître dans plusieurs maps

**Important :**
- une rubrique n’est pas une page finale
- c’est une unité de contenu

---

## 🔁 Révision de rubrique

**Définition :**  
Une révision est une **évolution du contenu XML d’une rubrique**.

**Déclencheur :**
- uniquement une modification du contenu

**Caractéristiques :**
- numérotée (N, N+1…)
- traçable
- liée à une révision précédente

**Important :**
- une révision ≠ une version de projet
- une révision est interne
- une version est publiée

---

## 🗺 Map

**Définition :**  
Une map est une **structure documentaire**.

**Rôle :**
- organiser les rubriques
- définir l’ordre et la hiérarchie

**Caractéristiques :**
- structure arborescente
- utilisée pour la publication

**Important :**
- une map ne contient pas le contenu
- elle référence des rubriques

---

## 🧱 MapRubrique

**Définition :**  
Un MapRubrique est une **relation structurelle** entre une map et une rubrique.

**Rôle :**
- définir :
  - l’ordre
  - la hiérarchie (parent/enfant)

**Important :**
- c’est un objet de structure
- pas de contenu XML

---

## 🏷 Fonctionnalité

**Définition :**  
Une fonctionnalité représente un **élément du logiciel documenté**.

**Rôle :**
- relier la documentation au produit réel
- piloter la couverture documentaire

---

## 🎯 Impact documentaire

**Définition :**  
Un impact documentaire représente un **besoin de modification d’une rubrique**.

**Rôle :**
- suivre les évolutions produit
- organiser le travail documentaire

**Statuts possibles :**
- à_faire
- en_cours
- prêt
- validé
- ignoré

**Important :**
- un impact ≠ une révision
- il déclenche potentiellement une révision

---

## 🔄 ProductDocSync

**Définition :**  
Module de pilotage permettant de **suivre les impacts documentaires liés aux évolutions produit**.

**Rôle :**
- anticiper les mises à jour documentaires
- suivre la couverture fonctionnelle

**Important :**
- ne modifie pas le contenu XML
- ne crée pas de révision

---

## 📤 Publication

**Définition :**  
Action de générer un livrable documentaire (PDF, HTML, SCORM…).

**Effets :**
- peut créer une nouvelle version de projet
- fige un état de la documentation

---

## 🧠 Buffer de rubrique

**Définition :**  
État temporaire du contenu d’une rubrique en cours d’édition.

**Rôle :**
- stocker les modifications non sauvegardées

**Statuts :**
- ready
- dirty
- saved
- error

**Important :**
- source de vérité côté frontend avant sauvegarde

---

# ⚠️ Concepts critiques (souvent confondus)

---

## Version vs Révision

| Concept | Description |
|--------|-------------|
| Révision | évolution interne du contenu |
| Version | état publié de la documentation |

---

## Structure vs Contenu

| Concept | Description |
|--------|-------------|
| Map / MapRubrique | structure |
| Rubrique | contenu |

---

## Impact vs Modification

| Concept | Description |
|--------|-------------|
| Impact | besoin de modification |
| Révision | modification réelle |

---

# 🔍 Règles d’usage

- Toujours utiliser les termes définis ici
- Ne jamais inventer de synonymes implicites
- Toute ambiguïté doit être résolue dans ce document

---

# 🧭 Évolution du glossaire

Toute modification :
- doit être justifiée
- doit être cohérente avec le modèle existant
- peut nécessiter une mise à jour du `decision-log.md`

---

# ✔️ Fin du document