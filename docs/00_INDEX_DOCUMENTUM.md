# 📚 Index documentaire — Documentum

Ce dossier contient la documentation technique, fonctionnelle et métier du projet **Documentum**.

La documentation est organisée selon une stratégie explicite décrite dans `00_DOCUMENTATION_STRATEGY.md`.

Son objectif est de :

* garantir une séparation claire entre **vérité métier**, **réalité technique** et **documents d'analyse**,
* éviter les incohérences,
* faciliter la navigation dans le projet,
* fournir un référentiel exploitable aussi bien par les humains que par les outils d'IA.

---

## 🧭 Vue d'ensemble

La documentation est structurée en **3 niveaux principaux**.

### 1. `00_REFERENTIEL`

Contient les documents qui font autorité.

On y trouve :

* les concepts métier,
* les règles invariantes,
* les principes d'architecture,
* la gouvernance,
* les stratégies structurantes.

👉 Ce niveau décrit **ce que le système doit être**.

---

### 2. `01_OPERATIONNEL`

Contient la documentation technique décrivant l'état réel du système.

On y trouve :

* les cartographies de composants,
* les flux réels,
* les dépendances,
* les cahiers techniques locaux,
* les descriptions de l'implémentation actuelle,
* les roadmaps de refonte en cours.

👉 Ce niveau décrit **comment le système fonctionne réellement aujourd'hui**.

---

### 3. `02_ANALYSE`

Contient les documents d'étude, d'audit, de synthèse et de préparation des évolutions.

On y trouve :

* des audits,
* des synthèses,
* des documents de travail temporaires,
* des archives de sprints passés.

👉 Ce niveau sert à **analyser, décider et préparer**.

---

## 📁 Arborescence logique

```text
DOCS/
│
├── 00_DOCUMENTATION_STRATEGY.md
├── 00_INDEX_DOCUMENTUM.md
│
├── 00_REFERENTIEL/
│   ├── 00_CONTEXTE_PROJET.md
│   ├── 10_GLOSSAIRE.md
│   ├── 10_MODELE_METIER_DOCUMENTUM.md
│   ├── 10_VERSIONING_DOCUMENTAIRE.md
│   ├── 20_ARCHITECTURE_FRONTEND.md
│   ├── 30_PILOTAGE_PROJET.md
│   ├── 40_EDITION_RUBRIQUE.md
│   ├── 60_TESTING_STRATEGY.md
│   ├── 40_GOVERNANCE/
│   └── Frontend/                          
│       └── 20_XML_TIPTAP_CONVERSION_SPEC.md
│
├── 01_OPERATIONNEL/
│   ├── Backend/
│   ├── CentralEditor/
│   ├── Frontend/
│   └── LeftSidebar/
│
├── 02_ANALYSE/
│   ├── archive/
│   ├── audits/
│   └── syntheses/
│
└── tools/
```

---

## 🧠 Référentiel canonique (`00_REFERENTIEL`)

Le référentiel regroupe les documents qui définissent la vérité du projet.

### Documents principaux

* `00_CONTEXTE_PROJET.md` : cadre général, objectifs et périmètre du projet
* `10_GLOSSAIRE.md` : vocabulaire officiel du projet
* `10_MODELE_METIER_DOCUMENTUM.md` : concepts métier structurants
* `10_VERSIONING_DOCUMENTAIRE.md` : logique de versioning et de publication
* `20_ARCHITECTURE_FRONTEND.md` : architecture cible et principes frontend
* `30_PILOTAGE_PROJET.md` : pilotage des travaux en cours
* `40_EDITION_RUBRIQUE.md` : principes et règles d'édition
* `60_TESTING_STRATEGY.md` : stratégie de tests et règles fondamentales

### Gouvernance (`00_REFERENTIEL/40_GOVERNANCE`)

* `gov_principles.md` : principes invariants du projet
* `gov_risk-areas.md` : zones à risque identifiées
* `gov_forbidden-patterns.md` : patterns interdits
* `gov_decision-log.md` : décisions structurantes prises dans le temps
* `README.md` : point d'entrée de la gouvernance

### Spécifications (`00_REFERENTIEL/Frontend`)

* `20_XML_TIPTAP_CONVERSION_SPEC.md` : spécification de conversion XML ↔ TipTap

👉 Le référentiel fait foi en cas de contradiction avec les autres niveaux.

---

## ⚙️ Documentation opérationnelle (`01_OPERATIONNEL`)

Cette section décrit l'implémentation réelle du projet.

### `Backend/`

* `10_BACKEND_CANONIQUE.md` : description canonique du backend Django
* `10_CARTOGRAPHIE_BACKEND_CANONIQUE_EXPOSE.md` : cartographie des endpoints exposés

👉 Référence backend structurante, décrivant les APIs et modèles réels.

### `CentralEditor/`

* `50_CARTOGRAHIE_CENTRALEDITOR.md` : cartographie du composant CentralEditor
* `51_ANALYSE_TECHNIQUE_CENTRALEDITOR.md` : analyse technique détaillée

👉 Zone dédiée à l'éditeur central, au parsing XML ⇄ TipTap et aux flux techniques associés.

### `Frontend/`

* `50_CARTOGRAPHIE_FRONTEND_DESKTOP.md` : cartographie du composant Desktop
* `51_ANALYSE_TECHNIQUE_FRONTEND_GLOBAL.md` : analyse technique globale du frontend
* `CENTRALEDITOR_REFACTOR_ROADMAP.md` : roadmap de refactoring du CentralEditor
* `MAP_FRONTEND_ROADMAP.md` : roadmap d'évolution du module Map côté frontend

👉 Point d'entrée sur le fonctionnement réel du frontend et les évolutions planifiées.

### `LeftSidebar/`

* `50_CARTOGRAPHIE_FRONTEND_LEFTSIDEBAR.md` : cartographie du composant LeftSidebar
* `50_CARTOGRAPHIE_FRONTEND_MAPMODULE.md` : cartographie du module Map
* `50_CARTOGRAPHIE_FRONTEND_PROJECTMODULE.md` : cartographie du module Project

👉 Documentation détaillée des modules de navigation et de structure documentaire.

---

## 🔍 Documents d'analyse (`02_ANALYSE`)

Ces documents ne font pas autorité. Ils servent à comprendre, préparer et piloter les évolutions.

### `audits/`

* `BACKEND_GAP_ANALYSIS.md` : analyse des écarts entre le backend réel et le référentiel
* `dependencies.md` : état des dépendances du projet
* `deps_installed.json` : liste des packages installés
* `deps_licences.json` : licences des dépendances
* `deps_vulnerabilities.json` : vulnérabilités détectées

### `syntheses/`

* `SYNTHESE_FRONTEND_CENTRALEDITOR.md`
* `SYNTHESE_FRONTEND_DESKTOP.md`
* `SYNTHESE_FRONTEND_LEFTSIDEBAR.md`
* `SYNTHESE_FRONTEND_MAPMODULE.md`
* `SYNTHESE_FRONTEND_PROJECTMODULE.md`
* `SYNTHESE_FRONTEND_GLOBALE.md`

### `archive/`

Contient les documents de sprints passés, conservés pour traçabilité.

* `ARCHIVE_PLAN_REALIGNEMENT_BACKEND.md`
* `ARCHIVE_SUIVI_REALIGNEMENT_BACKEND.md`
* `BACKEND_REALIGNMENT_SPRINT_1.md`
* `BACKEND_REALIGNMENT_SPRINT_2.md`
* `BACKEND_REALIGNMENT_SPRINT_3.md`
* `BACKEND_REALIGNMENT_SPRINT_4.md`
* `BACKEND_REALIGNEMENT_SPRINT_5.md`

👉 Ces documents ne doivent pas être édités. Ils servent uniquement de référence historique.

---

## 🧰 Outils (`tools`)

* `modèle_analyse_technique_frontend.md` : gabarit pour produire une analyse technique
* `modèle_cartographie_frontend.md` : gabarit pour produire une cartographie de composant

👉 Contient les gabarits ou outils d'aide à la production documentaire.

---

## 🔍 Je cherche…

| Besoin                                   | Document recommandé                                                                 |
| ---------------------------------------- | ----------------------------------------------------------------------------------- |
| Comprendre la stratégie documentaire     | `00_DOCUMENTATION_STRATEGY.md`                                                      |
| Comprendre le contexte global du projet  | `00_REFERENTIEL/00_CONTEXTE_PROJET.md`                                              |
| Comprendre le vocabulaire Documentum     | `00_REFERENTIEL/10_GLOSSAIRE.md`                                                    |
| Comprendre le modèle métier              | `00_REFERENTIEL/10_MODELE_METIER_DOCUMENTUM.md`                                     |
| Comprendre le versioning                 | `00_REFERENTIEL/10_VERSIONING_DOCUMENTAIRE.md`                                      |
| Comprendre l'architecture frontend cible | `00_REFERENTIEL/20_ARCHITECTURE_FRONTEND.md`                                        |
| Comprendre les règles d'édition          | `00_REFERENTIEL/40_EDITION_RUBRIQUE.md`                                             |
| Comprendre la stratégie de test          | `00_REFERENTIEL/60_TESTING_STRATEGY.md`                                             |
| Comprendre les principes invariants      | `00_REFERENTIEL/40_GOVERNANCE/gov_principles.md`                                    |
| Identifier les zones à risque            | `00_REFERENTIEL/40_GOVERNANCE/gov_risk-areas.md`                                    |
| Comprendre la spec XML ↔ TipTap          | `00_REFERENTIEL/Fontend/20_XML_TIPTAP_CONVERSION_SPEC.md`                           |
| Comprendre le frontend réel              | `01_OPERATIONNEL/Frontend/50_CARTOGRAPHIE_FRONTEND_DESKTOP.md`                      |
| Comprendre les APIs backend              | `01_OPERATIONNEL/Backend/10_CARTOGRAPHIE_BACKEND_CANONIQUE_EXPOSE.md`               |
| Comprendre CentralEditor                 | `01_OPERATIONNEL/CentralEditor/50_CARTOGRAHIE_CENTRALEDITOR.md`                     |
| Comprendre LeftSidebar et modules liés   | `01_OPERATIONNEL/LeftSidebar/`                                                      |
| Consulter les roadmaps frontend          | `01_OPERATIONNEL/Frontend/CENTRALEDITOR_REFACTOR_ROADMAP.md`                        |
| Consulter les synthèses frontend         | `02_ANALYSE/syntheses/`                                                             |
| Consulter les audits                     | `02_ANALYSE/audits/`                                                                |
| Consulter l'historique des sprints       | `02_ANALYSE/archive/`                                                               |

---

## 🧭 Parcours de lecture recommandés

### Nouveau sur le projet

1. `00_DOCUMENTATION_STRATEGY.md`
2. `00_REFERENTIEL/00_CONTEXTE_PROJET.md`
3. `00_REFERENTIEL/10_GLOSSAIRE.md`
4. `00_REFERENTIEL/10_MODELE_METIER_DOCUMENTUM.md`
5. `00_REFERENTIEL/20_ARCHITECTURE_FRONTEND.md`

### Développeur frontend

1. `00_DOCUMENTATION_STRATEGY.md`
2. `00_REFERENTIEL/20_ARCHITECTURE_FRONTEND.md`
3. `00_REFERENTIEL/Fontend/20_XML_TIPTAP_CONVERSION_SPEC.md`
4. `01_OPERATIONNEL/Frontend/50_CARTOGRAPHIE_FRONTEND_DESKTOP.md`
5. `01_OPERATIONNEL/CentralEditor/`
6. `01_OPERATIONNEL/LeftSidebar/`
7. `00_REFERENTIEL/60_TESTING_STRATEGY.md`

### Développeur backend

1. `00_DOCUMENTATION_STRATEGY.md`
2. `00_REFERENTIEL/10_MODELE_METIER_DOCUMENTUM.md`
3. `01_OPERATIONNEL/Backend/10_BACKEND_CANONIQUE.md`
4. `01_OPERATIONNEL/Backend/10_CARTOGRAPHIE_BACKEND_CANONIQUE_EXPOSE.md`
5. `00_REFERENTIEL/60_TESTING_STRATEGY.md`

### Pilotage / produit

1. `00_DOCUMENTATION_STRATEGY.md`
2. `00_REFERENTIEL/00_CONTEXTE_PROJET.md`
3. `00_REFERENTIEL/10_MODELE_METIER_DOCUMENTUM.md`
4. `00_REFERENTIEL/10_VERSIONING_DOCUMENTAIRE.md`
5. `00_REFERENTIEL/30_PILOTAGE_PROJET.md`
6. `00_REFERENTIEL/40_GOVERNANCE/gov_decision-log.md`

---

## 🧭 Gouvernance documentaire

### Règle fondamentale

Une information ne doit exister **qu'à un seul endroit comme source de vérité**.

### Conséquences

* le métier est défini dans le **référentiel**,
* l'implémentation est décrite dans l'**opérationnel**,
* les réflexions et constats intermédiaires restent dans l'**analyse**.

### En cas de contradiction

1. le **référentiel** fait foi,
2. l'**opérationnel** doit être corrigé,
3. l'**analyse** doit être mise à jour, archivée ou supprimée.

---

## 🎯 Objectif de cet index

Cet index doit permettre :

* une navigation rapide dans le corpus documentaire,
* une compréhension claire du rôle de chaque document,
* une collaboration fiable entre humains et IA,
* une réduction durable des incohérences,
* une meilleure capacité de refonte et d'industrialisation.

---

## ⚠️ Points de maintenance identifiés

* **`00_REFERENTIEL/Fontend/`** : faute de frappe dans le nom du dossier, à renommer en `Frontend`.
* Le dossier `02_ANALYSE/refontes/` n'existe plus — les documents de refonte en cours sont à créer si besoin ou à maintenir dans `01_OPERATIONNEL/`.

---

# ✔️ Fin du document
