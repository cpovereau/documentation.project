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

- Desktop
- ProductDocSync

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

## Règles

- toute logique complexe doit être dans un hook
- aucune logique métier dans les composants

---

# 🔌 4. Couche API — Services

## Rôle

Centraliser tous les appels backend

## Règles

- aucun appel API dans un composant
- aucun appel API direct sans passer par un service centralisé

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

---

# ⚠️ Problèmes identifiés dans l’existant

## 1. Mélange structure / contenu

Exemple :
- génération XML dans LeftSidebar

Interdit

---

## 2. Appels API dans les composants

Présents dans LeftSidebar

Doivent être déplacés

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

# 🧭 Objectif final

Le frontend doit être :

- prévisible
- modulaire
- aligné avec le backend
- pilotable par la documentation

---

# ✔️ Fin du document