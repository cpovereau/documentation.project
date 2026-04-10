# 🧠 10 — Versioning documentaire

Ce document fait partie du **référentiel métier Documentum**.

Il définit la logique de versioning, en complément de :
- `10_GLOSSAIRE.md`
- `10_MODELE_METIER_DOCUMENTUM.md`

Il formalise la **logique métier de révision et de versionning** du CCMS **Documentum**. Il sert de référence pour :
- le backend (modèles, règles métier, publication),
- le frontend (CentralEditor, ProductDocSync),
- les évolutions futures (audit, couverture documentaire, exports).

---

# 🔒 Règle fondamentale

- Une révision = modification de contenu
- Une version = publication

Ces deux notions ne doivent jamais être confondues.

---

## 1. Principes fondamentaux

### 1.1 Projet = documentation

- **1 Projet = 1 documentation**.
- Le projet est l’entité macro qui représente un livrable documentaire cohérent.
- Le **versionning du projet** correspond exclusivement à des **publications**.

👉 Modifier du contenu **ne crée jamais** une nouvelle version de projet.
👉 **Publier** (exporter) une documentation **peut créer** une nouvelle version de projet.

---

### 1.2 Version de projet = photographie publiée

Une version de projet :
- correspond à un état **figé** de la documentation,
- est **traçable**, **auditée**, **exportable** (PDF, HTML, SCORM, etc.),
- référence un état précis de chaque rubrique utilisée.

Une version de projet n’existe que :
- parce qu’une publication a eu lieu,
- ou parce qu’elle est la version active de travail (cas initial).

---

## 2. Rubriques et révisions

### 2.1 Rubrique = composant éditorial

Une rubrique :
- est un **composant de contenu réutilisable**,
- peut être rattachée à :
  - un projet,
  - une ou plusieurs fonctionnalités,
  - plusieurs maps (structures de sortie),
- vit **dans le temps**.

Elle n’est **pas** intrinsèquement liée à une publication.

---

### 2.2 Révision = évolution de contenu

Une **révision de rubrique** représente :
- une **modification réelle du contenu XML**,
- un nouvel état éditorial de la rubrique.

Caractéristiques :
- créée **uniquement** lorsqu’on sauvegarde un contenu modifié,
- traçable (révision N, N+1, …),
- liée à une révision précédente.

❗ Une révision **n’est pas** une version de documentation.

---

### 2.3 Ce qui ne crée PAS de révision

- rattacher une rubrique à une fonctionnalité,
- déclarer qu’une rubrique est « à revoir »,
- signaler un impact fonctionnel,
- modifier la structure des maps.

👉 Une révision est créée **uniquement** par une modification du XML.

---

## 3. Cycle de vie global

### 3.1 Phase 1 – Travail éditorial (hors publication)

- Les auteurs modifient des rubriques.
- Chaque sauvegarde significative crée une **nouvelle révision**.
- Le projet reste sur la **même version** (ex : 1.0.0).

➡️ Zone libre, interne, itérative.

---

### 3.2 Phase 2 – Pilotage produit (ProductDocSync)

Dans ProductDocSync :

- on enregistre des **évolutions de fonctionnalités**,
- on rattache des **rubriques existantes** à ces fonctionnalités,
- on déclare des **impacts documentaires**.

Important :
- ProductDocSync **ne modifie pas le contenu XML**,
- il **ne crée pas de révision**,
- il **déclare un besoin de révision**.

---

### 3.3 Phase 3 – Traitement des impacts

- Les impacts documentaires sont traités dans CentralEditor.
- Lorsqu’une rubrique est réellement modifiée :
  - une nouvelle révision est créée.

---

### 3.4 Phase 4 – Publication

Lors d’une publication :

- le système identifie les rubriques ayant une révision postérieure à la dernière publication,
- si **au moins une rubrique a évolué** :
  - une **nouvelle version de projet** est créée (ex : 1.1.0),
- cette version devient :
  - figée,
  - référencée,
  - exportable.

---

## 4. ProductDocSync : rôle exact

ProductDocSync est un **outil de pilotage documentaire**, pas un éditeur.

Il permet :
- d’anticiper les impacts documentaires des évolutions produit,
- de suivre la couverture fonctionnelle de la documentation,
- de préparer une future publication.

Il manipule :
- des fonctionnalités,
- des rubriques existantes,
- des **états d’impact**.

Il ne manipule pas :
- le XML,
- les révisions techniques.

---

## 5. Impacts documentaires (concept clé)

Un impact documentaire représente :
- le besoin de faire évoluer une rubrique
- pour une fonctionnalité donnée
- dans le cadre d’une version cible du produit.

Statuts possibles :
- `à_faire`
- `en_cours`
- `prêt`
- `validé`
- `ignoré`

Ces statuts :
- n’affectent pas directement les révisions,
- servent au pilotage et au suivi.

---

## 6. Rôle des maps

- Une **map** est une **structure de sortie** (organisation documentaire).
- Elle définit l’ordre, la hiérarchie et l’inclusion des rubriques dans un livrable.
- Elle est utilisée principalement au moment de la publication.

ProductDocSync peut fonctionner :
- **sans exposer les maps**,
- tant que les rubriques existent et sont versionnées.

Les maps et ProductDocSync convergent lors de la publication.

---

## 7. Synthèse

- Les **révisions** servent à tracer l’évolution du contenu.
- Les **versions de projet** servent à tracer les publications.
- ProductDocSync déclare des **besoins**, pas des révisions.
- La publication est le **seul déclencheur** du versionning projet.

👉 Cette séparation garantit :
- une traçabilité claire,
- une base saine pour ProductDocSync,
- une évolution maîtrisée du CCMS Documentum.

# TODO(versioning):
# Le format de version est paramétrable (1.0.0, 1.0.0.0, etc.)
# La valeur par défaut est temporairement figée à "1.0.0".