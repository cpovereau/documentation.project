# MODELE METIER TRANSVERSE — NIVEAUX

---

## 🎯 Objectif

Ce document structure le **modèle métier transverse** en plusieurs niveaux.

Il permet de :
- identifier le **socle universel** du système
- distinguer les **couches activables selon le domaine métier**
- éviter de surcharger le modèle de base
- guider les choix d’implémentation et de spécialisation

---

## 🧠 Principe fondamental

> Le système repose sur un noyau minimal universel, enrichi par des couches activables selon les besoins métier.

---

# 1. Vue d’ensemble des niveaux

| Niveau | Description | Obligation |
|--------|------------|-----------|
| Niveau 1 | Noyau universel | Obligatoire |
| Niveau 2 | Noyau dossier / processus | Optionnel selon domaine |
| Niveau 3 | Noyaux spécialisés | Optionnel |

---

# 2. Niveau 1 — Noyau universel

## 🎯 Rôle

Ce niveau couvre la **gestion de la connaissance structurée**.

Il est suffisant pour :
- documentation métier
- référentiel de règles
- base de connaissances
- conformité

---

## 🧩 Concepts inclus

- ObjetMétier
- CycleObjet
- ÉlémentMétier
- Évolution
- ImpactDocumentaire
- Rubrique
- Révision
- Publication

---

## 🧠 Base Métier

- RéférentielMétier
- RègleMétier
- VersionRègleMétier
- SourceMétier
- ValidationMétier

---

## 📌 Utilisation typique

- documentation produit
- base de connaissances
- gestion de conformité
- support documentaire

---

## ⚠️ Limites

- pas de gestion d’acteurs
- pas de gestion de processus
- pas de gestion d’instances réelles

---

# 3. Niveau 2 — Noyau dossier / processus

## 🎯 Rôle

Permet de gérer des **cas réels métier** (dossiers, situations, flux opérationnels).

---

## 🧩 Concepts ajoutés

### Acteurs
- ActeurMétier
- RôleActeur

### Processus
- ProcessusMétier
- ÉtapeProcessus
- Transition

### Décision
- DécisionMétier
- InstructionMétier

### Dossier / Instance
- InstanceObjetMétier

### Pièces / preuves
- PièceMétier
- PreuveMétier

### Contexte
- ContexteApplication
- ConditionApplication
- ExceptionMétier

---

## 📌 Utilisation typique

- gestion de dossiers juridiques
- RH
- médico-social
- assurance
- suivi client

---

## ⚠️ Impact

- complexité accrue
- besoin de gouvernance plus forte
- nécessité de workflow explicite

---

# 4. Niveau 3 — Noyaux spécialisés

## 🎯 Rôle

Adapter le système à des métiers spécifiques nécessitant des modèles propres.

---

## 🧩 Exemples de spécialisations

### Support / ITIL
- Ticket
- Incident
- Demande
- Interaction
- Canal

### Production / intervention
- Ressource
- Planification
- ÉvénementOpérationnel
- Contrainte

### Juridique
- TypeDossier
- Procédure
- Acte
- Juridiction

### RH
- Contrat
- Absence
- Évaluation
- Sanction

### Formation
- Module
- Parcours
- Évaluation

---

## 📌 Utilisation typique

- applications métier complètes
- outils spécialisés
- systèmes d’exécution

---

# 5. Règles d’architecture

- le Niveau 1 doit rester minimal et stable
- le Niveau 2 est activé uniquement si nécessaire
- le Niveau 3 ne doit jamais impacter le Niveau 1
- chaque niveau est indépendant mais compatible

---

# 6. Stratégie d’utilisation

## Étape 1
Démarrer avec le Niveau 1 uniquement

## Étape 2
Ajouter le Niveau 2 si gestion de cas réels nécessaire

## Étape 3
Activer des modules spécialisés (Niveau 3)

## Étape 4
Maintenir la séparation des niveaux

---

# 7. Positionnement dans Nexus

Ce document complète :

- le modèle métier transverse
- le modèle Base Métier
- le référentiel d’architecture

---

# ✔️ Fin du document

