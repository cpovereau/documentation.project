# Documentum – Synthèse Frontend Globale

> **Statut** : document de référence validé
> 
> **Périmètre** : ensemble du frontend Documentum
> 
> **Objectif** : fournir une vision consolidée de l’architecture frontend, de ses écarts avec le backend canonique et des priorités de réalignement.

---

## 1. Vue d’ensemble

Le frontend Documentum repose sur une architecture clairement stratifiée :

- **UI pure** (présentation et interaction)
- **Orchestration UI**
- **Orchestration métier frontend**
- **Composants métier frontend**

La cartographie détaillée de chaque composant permet aujourd’hui de **localiser précisément la dette**, sans ambiguïté.

---

## 2. Cartographie consolidée des composants

| Composant | Nature | Verdict | Lecture synthétique |
|---------|-------|--------|--------------------|
| LeftSidebar | Orchestration structurelle | 🔴 | Compense des lacunes backend, porte une dette critique |
| ProjectModule | UI projet | 🟡 | Expose des intentions métier non implémentées |
| MapModule | UI structure | 🟢 | Composant sain, référence UI |
| Desktop | Orchestration UI | 🟢 | Socle stable, sans dette |
| CentralEditor | Métier éditorial | 🟡 | Composant critique, sain mais exigeant |

---

## 3. Typologie globale des écarts

### 3.1. Écarts backend bloquants

- Endpoints structurels manquants (indent / outdent / reorder)
- Doublons ou incohérences d’API historiques
- Ambiguïtés conceptuelles (projet vs map)

> Ces écarts expliquent l’essentiel de la complexité frontend observée.

---

### 3.2. Écarts frontend compensatoires

- Orchestration excessive dans LeftSidebar
- Logiques de sélection et de rechargement complexes
- Simulations locales de fonctionnalités non disponibles backend

---

### 3.3. Zones saines à préserver

- MapModule
- Desktop
- CentralEditor (architecture, hors contraintes)

---

## 4. Frontend ↔ Backend : lecture croisée

| Domaine | Backend canonique | Frontend actuel | Statut |
|------|------------------|-----------------|--------|
| Création projet | Unique, complète | Double entrée historique | 🔴 |
| Structure documentaire | MapRubrique interne | Compensée frontend | 🔴 |
| Contenu rubrique | Rubrique XML | Buffer local maîtrisé | 🟢 |
| Publication | Map | Projet (UI) | 🟡 |
| Clonage / suppression | Non implémenté | Simulé frontend | 🟡 |

---

## 5. Priorisation des chantiers

### 5.1. Priorité 1 — Réalignement backend

- Implémenter les endpoints structurels canoniques
- Supprimer les doublons
- Clarifier les concepts métier (publication, clonage, suppression)

> Tant que cette étape n’est pas faite, aucune correction frontend n’est recommandée.

---

### 5.2. Priorité 2 — Allègement de LeftSidebar

- Déporter la logique structurelle vers le backend
- Simplifier les flux de sélection
- Réduire les rechargements complets

---

### 5.3. Priorité 3 — Alignement UI progressif

- ProjectModule (désactivation / clarification des actions)
- CentralEditor (sécurisation des invariants)

---

## 6. Principes de conduite du réalignement

- Ne pas toucher aux composants 🟢 sans raison
- Ne corriger le frontend qu’après correction backend
- Documenter chaque décision
- Préserver l’expérience utilisateur

---

## 7. Rôle de ce document

Ce document :

- clôt la phase de cartographie frontend
- sert de base au plan d’action backend
- protège les zones saines
- permet un réalignement maîtrisé, sans refonte brutale

---

> **Cette synthèse globale constitue le point de bascule entre analyse et action.**

**Fin de la synthèse Frontend Globale**