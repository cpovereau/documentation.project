# 🧭 30 — Pilotage du projet Documentum

---

# 🎯 Objectif

Ce document permet de :

- piloter les évolutions du projet
- prioriser les travaux
- suivre l’avancement
- aligner documentation et développement

---

# 🔒 Règle fondamentale

👉 Ce document ne définit pas la vérité.

Il organise :
- ce qui doit être fait
- dans quel ordre
- avec quel niveau de priorité

---

# 🧩 1. Vision globale

## 🎯 Objectif actuel

Stabiliser et aligner :
- le backend
- le frontend
- le modèle métier
- les flux critiques

---

## 📌 Axes principaux

1. Alignement Backend / Référentiel
2. Stabilisation CentralEditor
3. Nettoyage Frontend (architecture)
4. Finalisation des flux métier
5. Préparation publication réelle

---

# 📊 2. Chantiers actifs

---

## 🔧 Chantier 1 — Backend réalignement

### Objectif
Aligner le backend réel avec le référentiel canonique

### Documents liés
- documentum_referentiel_backend_canonique.md
- BACKEND_REALIGNMENT_SPRINT_*.md

### Statut
EN COURS

---

## 🧠 Chantier 2 — CentralEditor

### Objectif
Fiabiliser :
- parsing XML
- buffer
- sauvegarde

### Documents liés
- Refonte_CentralEditor.md
- cartographie_CentralEditor.md

### Statut
EN COURS

---

## 🧩 Chantier 3 — Architecture Frontend

### Objectif
Respecter :
- séparation UI / hooks / services
- centralisation API

### Documents liés
- 20_ARCHITECTURE_FRONTEND.md
- cartographies frontend

### Statut
À FAIRE (partiellement engagé)

---

## 🔄 Chantier 4 — Flux métier

### Objectif
Formaliser :
- édition
- publication
- versioning complet

### Documents liés
- 40_EDITION_RUBRIQUE.md
- 10_VERSIONING_DOCUMENTAIRE.md

### Statut
EN COURS

---

# 🧪 3. Zones critiques

---

## 🔴 Critique

- Buffer XML (perte de données)
- Conversion XML ⇄ TipTap
- Synchronisation Front / Back

---

## 🟠 Important

- duplication d’état frontend
- logique dans LeftSidebar
- cohérence ProductDocSync

---

## 🟢 Secondaire

- UX fine
- optimisation performance

---

# 📋 4. Backlog structuré

---

## 🔥 Priorité haute

- sécuriser buffer
- finaliser sauvegarde backend
- stabiliser parsing XML

---

## ⚙️ Priorité moyenne

- nettoyage LeftSidebar
- centralisation API frontend
- amélioration gestion erreurs

---

## 🧩 Priorité basse

- UX avancée
- fonctionnalités secondaires

---

# 🧭 5. Méthode de travail

---

## Cycle recommandé

Analyse → Décision → Référentiel → Implémentation → Cartographie

---

## Utilisation IA

Claude / Cursor doivent être utilisés pour :

- cartographier le code existant
- identifier les écarts
- générer du code aligné

---

# 🧠 6. Suivi

---

## Règles

- toute avancée significative doit être notée
- tout blocage doit être explicité
- toute dérive doit être corrigée

---
