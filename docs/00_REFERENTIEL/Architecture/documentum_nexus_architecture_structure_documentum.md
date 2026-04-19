# DOCUMENTUM_NEXUS_ARCHITECTURE

## 🎯 Objectif du projet

Ce projet Documentum a pour objectif de documenter l’architecture complète de **Documentum Nexus**, en tant que système modulaire centré sur la connaissance produit.

Il constitue la **source de vérité documentaire** pour :
- l’architecture technique
- les flux métier
- le socle frontend
- les intégrations externes
- les choix structurants du système

---

## 🧠 Positionnement

Ce projet n’est PAS :
- une documentation utilisateur
- une documentation fonctionnelle produit classique

Ce projet EST :
👉 une **documentation d’architecture système vivante et versionnée**

---

## 🗂 Structure recommandée (Maps)

Chaque MAP représente un domaine documentaire indépendant.

---

# 📘 MAP 1 — Vision & Architecture globale

## Objectif
Décrire la vision, les principes et la structure globale de Documentum Nexus.

## Rubriques

### 1. Vision du système
- rôle de Documentum Nexus
- positionnement dans le SI
- objectifs long terme

### 2. Principes d’architecture
- modularité
- séparation des responsabilités
- source de vérité
- découplage

### 3. Sécurité systémique

La sécurité est une propriété transverse et non optionnelle du système.

Elle repose sur :
- la classification des données (publique / interne / sensible)
- le contrôle strict des accès
- le cloisonnement des usages et des clients
- la maîtrise des flux inter-modules
- la traçabilité complète des actions

👉 Aucun module ne peut contourner ces règles.

📌 Référence : `20_SECURITE_SYSTEME.md`

### 4. Vue d’ensemble des modules

L’activation des modules Nexus dépend du **`context_produit`** configuré pour une instance donnée. Tous les modules ne sont pas actifs dans tous les cas d’usage.

Modules du socle Nexus :
- **Documentum Core** — noyau documentaire (toujours actif)
- **Pilotage documentaire** — module générique de suivi des impacts et des évolutions métier
  → spécialisation actuelle : `ProductDocSync` (contexte Ingénierie Logicielle)
- **Base Métier** — source de vérité des règles et référentiels métier
- **Support / Tickets** — gestion des incidents, demandes et anomalies (ITIL)
- **Gestion de production** — suivi des cycles de production métier
- **Publipostage** — fusion documentaire à partir de modèles et de données métier/client
- **IA / Knowledge Engine** — indexation et exploitation de la connaissance structurée
- **Portail client** — exposition des contenus publiés vers l’extérieur

👉 Voir section « Notion de `context_produit` » ci-après pour le mécanisme d’activation des modules.

🔐 Couche transverse — Sécurité

La sécurité ne constitue pas un module isolé mais une couche transverse couvrant :
- Documentum Core
- Base Métier
- IA / Knowledge Engine
- Portail client
- APIs d’intégration

Elle garantit :
- l’isolation des données
- la protection des accès
- la conformité réglementaire
- la sécurisation des échanges

📌 Référence : `20_SECURITE_SYSTEME.md`

### 5. Rôles des modules
- responsabilités
- limites
- interactions

👉 Chaque module est responsable de :
- appliquer les règles de sécurité globales
- respecter les contrôles d’accès
- garantir l’isolation des données manipulées

### 5b. Notion de `context_produit`

Le `context_produit` est le mécanisme qui détermine quel sous-ensemble de modules Nexus est activé pour un usage donné.

**Rôle :**
- activer ou désactiver des modules selon le métier ou le cas d'usage
- influencer la navigation et les écrans visibles
- conditionner les flux disponibles dans l'interface
- déterminer les modèles métier spécialisés utilisés

**Exemples de contextes :**
- `ingenierie_logicielle` — active Pilotage documentaire (ProductDocSync), VersionProduit, EvolutionProduit
- `juridique` — activera à terme le pilotage par dossiers et évolutions réglementaires
- `industrie` — activera à terme le suivi par produit physique et défauts qualité
- `publipostage` — active le module Publipostage (modèles, champs de fusion, données client)

**Principe :**
Un même socle Documentum Core peut être exploité avec des modules différents selon le contexte activé.

👉 Le `context_produit` est un paramètre de configuration d'instance, pas une propriété dynamique au niveau utilisateur.

---

### 6. Schéma global du système
- diagramme d’architecture
- flux principaux

👉 Une couche “Sécurité” entourant :

APIs d’intégration
Documentum
IA
Portail client

Exemple (conceptuel) :

```text
[ Couche Sécurité ]
    ↓
[ APIs ] <--> [ Documentum ] <--> [ IA ]
    ↓
[ Portail client ]
```

#### 7. Base Métier
- rôle
- interactions
- flux

---

# 📘 MAP 2 — Architecture technique

## Objectif
Décrire la structure technique concrète du système.

## Rubriques

### 1. Architecture backend
- services
- API
- organisation Django

### 2. Architecture frontend
- écrans
- composants
- gestion d’état
- navigation

### 3. Architecture des données
- entités pivot
- relations
- versioning

### 4. APIs et contrats
- endpoints principaux
- DTO
- règles d’échange

toute API doit :
- vérifier l’authentification
- appliquer les règles d’autorisation
- filtrer les données exposées

### 5. Publication
- DITA
- export
- pipeline de publication

### 6. Sécurité technique

#### 6.1 Modèle global
Le modèle de sécurité est défini dans :

👉 `20_SECURITE_SYSTEME.md`

Ce document ne doit pas être dupliqué.

#### 6.2 Authentification

À préciser :
- authentification Django pour les utilisateurs internes
- JWT / OAuth2 pour les accès externes
- API keys pour les échanges inter-services

#### 6.3 Autorisation
- contrôle côté backend uniquement
- rôles et permissions
- filtrage systématique des données par contexte

#### 6.4 Cloisonnement des données
- isolation des données par utilisateur / client
- préparation du multi-tenant
- filtrage obligatoire dans toutes les requêtes

#### 6.5 Sécurité des APIs
- authentification obligatoire
- validation des entrées
- limitation du débit
- séparation API internes / externes

#### 6.6 Sécurité du module IA
- accès uniquement via APIs ou exports contrôlés
- interdiction d’accès direct aux données brutes
- filtrage des données sensibles

#### 6.7 Protection des données
- HTTPS obligatoire
- chiffrement recommandé au repos
- gestion sécurisée des secrets

#### 6.8 Audit et logs
- journalisation des actions critiques
- traçabilité des accès
- logs exploitables pour audit

#### 6.9 Conformité
- prise en compte RGPD
- gestion des données sensibles
- traçabilité des traitements

---

# 📘 MAP 3 — Flux métier

## Objectif
Décrire les flux fonctionnels majeurs du système.

## Rubriques

### 1. Flux d’édition documentaire
- création
- modification
- révision

### 2. Flux de versioning
- évolution
- publication
- archivage

### 3. Flux Pilotage documentaire
- objets métier (fonctionnalités dans le contexte logiciel)
- événements métier (évolutions, correctifs)
- impacts documentaires

> Implémentation actuelle : `ProductDocSync` (contexte Ingénierie Logicielle)

### 4. Flux support ↔ documentation
- ticket → doc
- doc → support

### 5. Flux IA ↔ documentation
- indexation
- interrogation

### ### 6. Flux Base Métier
- ingestion des référentiels
- évolution des règles
- validation humaine
- interaction avec IA

---

# 📘 MAP 4 — Frontend & UX

## Objectif
Définir le socle frontend et les règles UX.

## Rubriques

### 1. Écrans principaux
- Desktop (CentralEditor)
- Pilotage documentaire (écran actuel : `ProductDocSync`, contexte Ingénierie Logicielle)
- Dashboard Nexus (à venir) — tableau de bord contextuel

### 2. Navigation globale
- parcours utilisateur
- transitions d’état
- navigation conditionnelle selon le `context_produit`

### 3. États globaux
- `contextProduit` — détermine les modules et écrans accessibles
- produit sélectionné
- version
- objet métier (fonctionnalité dans le contexte logiciel)
- rubrique

> Les écrans et flux disponibles ne sont pas universels : ils dépendent du `context_produit` actif pour l’instance.

### 4. Composants structurants
- arbres
- éditeur
- vues d’impact

### 5. Patterns UX
- gestion du buffer
- navigation sécurisée
- feedback utilisateur

---

# 📘 MAP 5 — Intégrations

## Objectif
Décrire les interactions avec les systèmes externes.

## Rubriques

### 1. Intégration ITIL
- tickets
- incidents
- liens avec fonctionnalités

### 2. Intégration CRM / ERP
- données client
- contexte produit

### 3. Intégration IA
- export des données
- indexation
- usage

### 4. Portail client
- exposition des contenus
- selfcare

---

# 🧩 Typologie des rubriques (DITA)

## Concept
👉 pour décrire :
- modules
- architecture
- principes

## Task
👉 pour décrire :
- flux métier
- processus

## Reference
👉 pour décrire :
- APIs
- modèles de données
- contrats techniques

---

# 🔗 Bonnes pratiques

## 1. Toujours séparer
- structure
- contenu
- flux

## 2. Versionner les décisions
Toute évolution d’architecture doit être tracée.

## 3. Ne pas mélanger avec la doc utilisateur

## 4. Maintenir la cohérence avec le code

## 5. Une information = une seule rubrique
Chaque information doit être définie à un seul endroit dans le système documentaire.

Toute duplication est interdite.

Les autres rubriques doivent référencer cette information plutôt que la recopier.

Objectifs :
- garantir une source de vérité documentaire unique
- éviter les incohérences
- faciliter les mises à jour
  
---

# 🚀 Utilisation future

Ce projet servira :

- de base pour l’IA
- de référence pour les développements
- de support pour les décisions techniques
- de documentation d’intégration

---

# ⚠️ Règle fondamentale

👉 Ce projet doit rester :
- structuré
- lisible
- maintenu

Toute dérive documentaire impactera directement la qualité du système global.

---

# ✔️ Fin du document

