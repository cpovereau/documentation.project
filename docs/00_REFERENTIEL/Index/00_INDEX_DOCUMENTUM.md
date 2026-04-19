# 📚 Index documentaire — Documentum

Ce dossier contient la documentation technique, fonctionnelle et métier du projet **Documentum**.

La documentation est organisée selon une stratégie explicite décrite dans `00_REFERENTIEL/Strategie/00_DOCUMENTATION_STRATEGY.md`.

Son objectif est de :

* garantir une séparation claire entre **vérité métier**, **réalité technique** et **documents d'analyse**,
* éviter les incohérences,
* faciliter la navigation dans le projet,
* fournir un référentiel exploitable aussi bien par les humains que par les outils d'IA.

---

## 🧭 Vue d'ensemble

La documentation est structurée en **4 niveaux principaux**.

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

### 4. `03_PILOTAGE`

Contient les documents de pilotage opérationnel, les roadmaps et les guides de migration.

On y trouve :

* le tableau de bord de pilotage projet,
* la roadmap d'évolution vers Documentum Nexus,
* les guides de migration Claude Code,
* les plans de restructuration du dépôt.

👉 Ce niveau pilote les **transformations structurelles et l'avancement opérationnel du projet**.

---

## 📁 Arborescence logique

```text
DOCS/
│
├── 00_REFERENTIEL/
│   ├── Index/
│   │   └── 00_INDEX_DOCUMENTUM.md          ← ce fichier
│   ├── Strategie/
│   │   └── 00_DOCUMENTATION_STRATEGY.md
│   ├── Architecture/
│   │   ├── documentum_architecture_technique_modulaire.md
│   │   ├── documentum_nexus_architecture_structure_documentum.md
│   │   ├── modele_metier_transverse.md
│   │   └── modele_metier_transverse_niveaux.md
│   ├── Frontend/
│   │   └── 20_XML_TIPTAP_CONVERSION_SPEC.md
│   ├── 40_GOVERNANCE/
│   ├── 00_CONTEXTE_PROJET.md
│   ├── 10_GLOSSAIRE.md
│   ├── 10_MODELE_METIER_BASE_METIER.md
│   ├── 10_MODELE_METIER_DOCUMENTUM.md
│   ├── 10_MODELE_METIER_TRANSVERSE_SIMPLIFIE.md
│   ├── 10_VERSIONING_DOCUMENTAIRE.md
│   ├── 20_ARCHITECTURE_FRONTEND.md
|   |── 20_SECURITE_SYSTEME.md
│   ├── 40_EDITION_RUBRIQUE.md
│   └── 60_TESTING_STRATEGY.md
│
├── 01_OPERATIONNEL/
│   ├── Backend/
│   ├── CentralEditor/
│   ├── Frontend/
│   ├── LeftSidebar/
│   ├── ProductDocSync/
│   ├── RightSidebar/
│   └── Settings/
│
├── 02_ANALYSE/
│   ├── archive/
│   ├── audits/
│   └── syntheses/
│
├── 03_PILOTAGE/
│   ├── 30_MASTER_PILOTAGE_DOCUMENTUM.md
│   ├── 30_PILOTAGE_PROJET.md
│   ├── 30_SUIVI_REALISATION.md
│   ├── 30_ROADMAP_DOCUMENTUM_NEXUS.md
│   └── migrations/
│       └── 2026-04-15_documentum_nexus_restructuration_guide_claude_code.md
│
└── tools/
```

---

## 🧠 Référentiel canonique (`00_REFERENTIEL`)

Le référentiel regroupe les documents qui définissent la vérité du projet.

### Documents principaux

* `00_CONTEXTE_PROJET.md` : cadre général, objectifs et périmètre du projet
* `10_GLOSSAIRE.md` : vocabulaire officiel du projet
* `10_MODELE_METIER_DOCUMENTUM.md` : concepts métier structurants (orienté logiciel)
* `10_MODELE_METIER_TRANSVERSE_SIMPLIFIE.md` : modèle métier transverse générique — schéma `ObjetMétier → ÉvénementMétier → ImpactDocumentaire → Rubrique`, spécialisations multi-contextes, limites actuelles de l'implémentation
* `10_MODELE_METIER_BASE_METIER.md` : modèle canonique du module G — Base Métier
* `10_VERSIONING_DOCUMENTAIRE.md` : logique de versioning et de publication
* `20_ARCHITECTURE_FRONTEND.md` : architecture cible et principes frontend
* `20_SECURITE_SYSTEME.md` : modèle de sécurité global
* `40_EDITION_RUBRIQUE.md` : principes et règles d'édition
* `60_TESTING_STRATEGY.md` : stratégie de tests et règles fondamentales

### Architecture (`00_REFERENTIEL/Architecture`)

* `documentum_architecture_technique_modulaire.md` : vision cible de l'architecture modulaire autour de Documentum comme noyau de connaissance
* `documentum_nexus_architecture_structure_documentum.md` : source de vérité sur l'architecture complète de Documentum Nexus
* `modele_metier_transverse.md` : abstraction du modèle métier vers un modèle générique multi-domaines
* `modele_metier_transverse_niveaux.md` : structuration du modèle transverse en niveaux (socle universel → spécifique)

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
* `CENTRALEDITOR_REFACTOR_ROADMAP.md` : roadmap de refactoring du CentralEditor

👉 Zone dédiée à l'éditeur central, au parsing XML ⇄ TipTap et aux flux techniques associés.

### `Frontend/`

* `50_CARTOGRAPHIE_FRONTEND_DESKTOP.md` : cartographie du composant Desktop
* `51_ANALYSE_TECHNIQUE_FRONTEND_GLOBAL.md` : analyse technique globale du frontend
* `FRONTEND_MAP_ROADMAP.md` : roadmap d'évolution du module Map côté frontend
* `FRONTEND_CHANTIER4_SOCLE_ROADMAP.md` : roadmap Chantier 4 — apiClient centralisé, TanStack Query, zéro appel direct

👉 Point d'entrée sur le fonctionnement réel du frontend.

### `LeftSidebar/`

* `50_CARTOGRAPHIE_FRONTEND_LEFTSIDEBAR.md` : cartographie du composant LeftSidebar
* `50_CARTOGRAPHIE_FRONTEND_MAPMODULE.md` : cartographie du module Map
* `50_CARTOGRAPHIE_FRONTEND_PROJECTMODULE.md` : cartographie du module Project
* `LEFTSIDEBAR_ROADMAP.md` : roadmap & suivi des lots d'évolution (Lots 1–5 terminés, Lots 6–7 en attente backend)

👉 Documentation détaillée des modules de navigation et de structure documentaire.

### `RightSidebar/`

* `50_CARTOGRAPHIE_FRONTEND_RIGHTSIDEBAR.md` : cartographie du composant RightSidebar (modes ancré/flottant, données hardcodées)
* `RIGHTSIDEBAR_ROADMAP.md` : roadmap & suivi (Phase 1 — branchement API médiathèque à faire)

👉 Panneau de ressources médias. Fonctionnel visuellement, non branché au backend.

### `ProductDocSync/`

* `50_CARTOGRAPHIE_FRONTEND_PRODUCTDOCSYNC.md` : cartographie de l'écran ProductDocSync (données hardcodées, aucune API branchée)
* `PRODUCTDOCSYNC_ROADMAP.md` : roadmap & suivi (5 phases — branchement API, ImpactDocumentaire, plan de test)
* `PRODUCTDOCSYNC_SPEC_METIER.md` : spécification métier de ProductDocSync — entités (Produit, VersionProduit, Fonctionnalité, ImpactDocumentaire), acteurs, flux, règles métier, points ouverts

👉 Écran de pilotage documentaire Nexus. Backend `FonctionnaliteViewSet` disponible, branchement à faire (P4 gap analysis).

### `Settings/`

* `50_CARTOGRAPHIE_FRONTEND_SETTINGS.md` : cartographie de l'écran Settings et de ses 7 onglets (DataTab opérationnel, autres locaux)
* `SETTINGS_ROADMAP.md` : roadmap & suivi par onglet (Phase 1 DataTab terminée, Phases 2–6 à faire)

👉 Écran de configuration. DataTab pleinement branché API. Les 6 autres onglets fonctionnent en local.

---

## 🔍 Documents d'analyse (`02_ANALYSE`)

Ces documents ne font pas autorité. Ils servent à comprendre, préparer et piloter les évolutions.

### `audits/`

* `DOCUMENTUM_NEXUS_GAP_ANALYSIS_GLOBAL.md` : analyse d'écart complète entre le référentiel Documentum Nexus et l'implémentation actuelle — base d'estimation de charge (produit le 2026-04-15)
* `DOCUMENTUM_NEXUS_GAP_VALIDATION.md` : validation du gap analysis global — remplace le gap analysis pour le pilotage ; identifie les écarts obsolètes (résolus) vs confirmés (produit le 2026-04-15)
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
* `SYNTHESE_FRONTEND_PRODUCTDOCSYNC.md`
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

## 🚀 Pilotage (`03_PILOTAGE`)

Cette section regroupe les documents de pilotage opérationnel, les roadmaps et les guides de migration.

### Documents principaux

* `30_MASTER_PILOTAGE_DOCUMENTUM.md` : **point d'entrée de pilotage** — oriente vers le bon document selon le besoin ; synthèse de l'état du projet et de la transition vers Documentum Nexus
* `30_PILOTAGE_PROJET.md` : tableau de bord + détail des chantiers **en cours et à venir** uniquement
* `30_SUIVI_REALISATION.md` : archive des chantiers terminés avec détail technique et journal de bord
* `30_ROADMAP_DOCUMENTUM_NEXUS.md` : roadmap structurée en phases pour aligner Documentum avec Documentum Nexus (valeur produit : publication, ProductDocSync, Base Métier)

### `migrations/`

* `2026-04-15_documentum_nexus_restructuration_guide_claude_code.md` : guide de restructuration progressive du dépôt vers l'organisation Documentum Nexus

👉 Démarrer par `30_MASTER_PILOTAGE_DOCUMENTUM.md` pour obtenir une orientation rapide. Les guides de migration servent de référence pendant les opérations structurelles.

---

## 🧰 Outils (`tools`)

* `modèle_analyse_technique_frontend.md` : gabarit pour produire une analyse technique
* `modèle_cartographie_frontend.md` : gabarit pour produire une cartographie de composant

👉 Contient les gabarits ou outils d'aide à la production documentaire.

---

## 🔍 Je cherche…

| Besoin                                   | Document recommandé                                                                 |
| ---------------------------------------- | ----------------------------------------------------------------------------------- |
| Comprendre la stratégie documentaire     | `00_REFERENTIEL/Strategie/00_DOCUMENTATION_STRATEGY.md`                             |
| Comprendre le contexte global du projet  | `00_REFERENTIEL/00_CONTEXTE_PROJET.md`                                              |
| Comprendre le vocabulaire Documentum     | `00_REFERENTIEL/10_GLOSSAIRE.md`                                                    |
| Comprendre le modèle métier              | `00_REFERENTIEL/10_MODELE_METIER_DOCUMENTUM.md`                                     |
| Comprendre le modèle métier générique (multi-contextes) | `00_REFERENTIEL/10_MODELE_METIER_TRANSVERSE_SIMPLIFIE.md`          |
| Comprendre le versioning                 | `00_REFERENTIEL/10_VERSIONING_DOCUMENTAIRE.md`                                      |
| Comprendre l'architecture frontend cible | `00_REFERENTIEL/20_ARCHITECTURE_FRONTEND.md`                                        |
| Comprendre les règles d'édition          | `00_REFERENTIEL/40_EDITION_RUBRIQUE.md`                                             |
| Comprendre la stratégie de test          | `00_REFERENTIEL/60_TESTING_STRATEGY.md`                                             |
| Comprendre les principes invariants      | `00_REFERENTIEL/40_GOVERNANCE/gov_principles.md`                                    |
| Identifier les zones à risque            | `00_REFERENTIEL/40_GOVERNANCE/gov_risk-areas.md`                                    |
| Comprendre la spec XML ↔ TipTap          | `00_REFERENTIEL/Frontend/20_XML_TIPTAP_CONVERSION_SPEC.md`                          |
| Comprendre l'architecture modulaire Nexus | `00_REFERENTIEL/Architecture/documentum_architecture_technique_modulaire.md`        |
| Comprendre le modèle métier Base Métier  | `00_REFERENTIEL/10_MODELE_METIER_BASE_METIER.md`                                    |
| Obtenir un point de pilotage rapide      | `03_PILOTAGE/30_MASTER_PILOTAGE_DOCUMENTUM.md`                                      |
| Piloter les prochains travaux            | `03_PILOTAGE/30_PILOTAGE_PROJET.md`                                                 |
| Consulter l'historique des chantiers terminés | `03_PILOTAGE/30_SUIVI_REALISATION.md`                                          |
| Comprendre la roadmap Nexus              | `03_PILOTAGE/30_ROADMAP_DOCUMENTUM_NEXUS.md`                                        |
| Analyser les écarts avec Documentum Nexus | `02_ANALYSE/audits/DOCUMENTUM_NEXUS_GAP_VALIDATION.md`                             |
| Piloter une migration / restructuration  | `03_PILOTAGE/migrations/`                                                           |
| Comprendre le frontend réel              | `01_OPERATIONNEL/Frontend/50_CARTOGRAPHIE_FRONTEND_DESKTOP.md`                      |
| Comprendre les APIs backend              | `01_OPERATIONNEL/Backend/10_CARTOGRAPHIE_BACKEND_CANONIQUE_EXPOSE.md`               |
| Comprendre CentralEditor                 | `01_OPERATIONNEL/CentralEditor/50_CARTOGRAHIE_CENTRALEDITOR.md`                     |
| Comprendre LeftSidebar et modules liés   | `01_OPERATIONNEL/LeftSidebar/`                                                      |
| Suivre l'évolution de LeftSidebar        | `01_OPERATIONNEL/LeftSidebar/LEFTSIDEBAR_ROADMAP.md`                                |
| Comprendre RightSidebar                  | `01_OPERATIONNEL/RightSidebar/50_CARTOGRAPHIE_FRONTEND_RIGHTSIDEBAR.md`             |
| Suivre l'évolution de RightSidebar       | `01_OPERATIONNEL/RightSidebar/RIGHTSIDEBAR_ROADMAP.md`                              |
| Comprendre ProductDocSync                | `01_OPERATIONNEL/ProductDocSync/50_CARTOGRAPHIE_FRONTEND_PRODUCTDOCSYNC.md`         |
| Comprendre les règles métier ProductDocSync | `01_OPERATIONNEL/ProductDocSync/PRODUCTDOCSYNC_SPEC_METIER.md`                   |
| Suivre l'évolution de ProductDocSync     | `01_OPERATIONNEL/ProductDocSync/PRODUCTDOCSYNC_ROADMAP.md`                          |
| Comprendre Settings                      | `01_OPERATIONNEL/Settings/50_CARTOGRAPHIE_FRONTEND_SETTINGS.md`                     |
| Suivre l'évolution de Settings           | `01_OPERATIONNEL/Settings/SETTINGS_ROADMAP.md`                                      |
| Consulter les roadmaps frontend          | `01_OPERATIONNEL/CentralEditor/CENTRALEDITOR_REFACTOR_ROADMAP.md`                   |
| Suivre le Chantier 4 — socle frontend    | `01_OPERATIONNEL/Frontend/FRONTEND_CHANTIER4_SOCLE_ROADMAP.md`                      |
| Consulter les synthèses frontend         | `02_ANALYSE/syntheses/`                                                             |
| Consulter les audits                     | `02_ANALYSE/audits/`                                                                |
| Consulter l'historique des sprints       | `02_ANALYSE/archive/`                                                               |

---

## 🧭 Parcours de lecture recommandés

### Nouveau sur le projet

1. `00_REFERENTIEL/Strategie/00_DOCUMENTATION_STRATEGY.md`
2. `00_REFERENTIEL/00_CONTEXTE_PROJET.md`
3. `00_REFERENTIEL/10_GLOSSAIRE.md`
4. `00_REFERENTIEL/10_MODELE_METIER_DOCUMENTUM.md`
5. `00_REFERENTIEL/10_MODELE_METIER_TRANSVERSE_SIMPLIFIE.md`
6. `00_REFERENTIEL/20_ARCHITECTURE_FRONTEND.md`

### Développeur frontend

1. `00_REFERENTIEL/Strategie/00_DOCUMENTATION_STRATEGY.md`
2. `00_REFERENTIEL/20_ARCHITECTURE_FRONTEND.md`
3. `00_REFERENTIEL/Frontend/20_XML_TIPTAP_CONVERSION_SPEC.md`
4. `01_OPERATIONNEL/Frontend/50_CARTOGRAPHIE_FRONTEND_DESKTOP.md`
5. `01_OPERATIONNEL/CentralEditor/`
6. `01_OPERATIONNEL/LeftSidebar/`
7. `01_OPERATIONNEL/RightSidebar/`
8. `01_OPERATIONNEL/ProductDocSync/`
9. `01_OPERATIONNEL/Settings/`
10. `00_REFERENTIEL/60_TESTING_STRATEGY.md`

### Développeur backend

1. `00_REFERENTIEL/Strategie/00_DOCUMENTATION_STRATEGY.md`
2. `00_REFERENTIEL/10_MODELE_METIER_DOCUMENTUM.md`
3. `01_OPERATIONNEL/Backend/10_BACKEND_CANONIQUE.md`
4. `01_OPERATIONNEL/Backend/10_CARTOGRAPHIE_BACKEND_CANONIQUE_EXPOSE.md`
5. `00_REFERENTIEL/60_TESTING_STRATEGY.md`

### Pilotage / produit

1. `03_PILOTAGE/30_MASTER_PILOTAGE_DOCUMENTUM.md`
2. `03_PILOTAGE/30_PILOTAGE_PROJET.md`
3. `03_PILOTAGE/30_ROADMAP_DOCUMENTUM_NEXUS.md`
4. `02_ANALYSE/audits/DOCUMENTUM_NEXUS_GAP_VALIDATION.md`
5. `00_REFERENTIEL/00_CONTEXTE_PROJET.md`
6. `00_REFERENTIEL/10_VERSIONING_DOCUMENTAIRE.md`
7. `00_REFERENTIEL/40_GOVERNANCE/gov_decision-log.md`

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


---

## 🔄 Cycle de vie documentaire (obligatoire)

La documentation Documentum est gouvernée par le principe suivant :

👉 Toute évolution du système doit être reflétée dans le référentiel documentaire **avant implémentation**.

---

### 🔴 Règle bloquante

Une évolution est considérée comme invalide si :

- elle n’est pas documentée,
- ou si son impact documentaire n’est pas explicitement traité,
- ou si l’index n’est pas mis à jour.

---

### 📌 Mise à jour de l’index (obligatoire)

#### Cas 1 — Création d’un document

Toute création de document doit :

- être immédiatement ajoutée dans cet index,
- être positionnée dans la bonne section (`00_REFERENTIEL`, `01_OPERATIONNEL`, etc.),
- être référencée dans les parcours de lecture si nécessaire.

👉 Un document non indexé est considéré comme inexistant.

---

#### Cas 2 — Modification d’un document existant

Toute modification impactant :

- le métier
- l’architecture
- le backend
- le frontend
- les flux

doit entraîner :

- une mise à jour du document concerné,
- une vérification de cohérence dans cet index,
- une mise à jour des liens ou parcours si nécessaire.

---

#### Cas 3 — Suppression ou déplacement

Toute suppression ou déplacement de document doit :

- être répercuté immédiatement dans l’index,
- éviter toute référence cassée,
- être tracé si nécessaire dans le `decision-log.md`.

---

### 📚 Synchronisation avec la gouvernance

Cette règle est alignée avec :

- `gov_principles.md` (5.2 — décisions traçables)
- `gov_forbidden-patterns.md` (décisions non documentées interdites)
- `gov_decision-log.md` (traçabilité des décisions)

---

### 🤖 Règle IA (ChatGPT / Claude)

Toute interaction impliquant une évolution doit inclure :

## Impact documentaire

- documents à modifier ou créer
- position dans l’index
- nature de la modification

👉 L’IA doit systématiquement proposer ces impacts.

---

### ✔️ Critère de complétude

Une évolution est terminée uniquement si :

- le code est implémenté
- les tests sont validés
- la documentation est à jour
- l’index est cohérent

👉 Sinon, elle est incomplète.

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

* Le dossier `02_ANALYSE/refontes/` n'existe plus — les documents de refonte en cours sont maintenus dans `01_OPERATIONNEL/`.
* `30_PILOTAGE_PROJET.md` a été déplacé de `00_REFERENTIEL/` vers `03_PILOTAGE/` — ne pas recréer une copie dans le référentiel.
* Le gap analysis `DOCUMENTUM_NEXUS_GAP_ANALYSIS_GLOBAL.md` (2026-04-15) contient des écarts désormais obsolètes — se référer à `DOCUMENTUM_NEXUS_GAP_VALIDATION.md` pour le pilotage actuel.

---

# ✔️ Fin du document
