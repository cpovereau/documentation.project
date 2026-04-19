# Architecture technique modulaire — Vision cible autour de Documentum

## 1. Objet du document

Ce document formalise une **architecture technique modulaire** dans laquelle **Documentum** n’est plus seulement un outil documentaire, mais le **noyau de connaissance** d’un ensemble plus large, applicable à différents contextes métier.

L’objectif n’est pas de fusionner tous les besoins dans un seul monolithe, mais d’organiser plusieurs modules spécialisés autour d’un **socle documentaire central**, exposé par API.

---

## 2. Intention d’architecture

### Positionnement

Documentum devient le **référentiel central de connaissance produit et documentaire**.

Autour de lui gravitent plusieurs modules spécialisés :

- un module de **pilotage produit / production**
- un module de **support ITIL**
- un module **IA / base de connaissances augmentée**
- un **portail client**
- éventuellement un module **formation / e-learning**

### Principe directeur

Chaque module a une responsabilité claire.

Un **`context_produit`** détermine quel sous-ensemble de modules est activé pour une instance Nexus donnée. L'architecture est donc à la fois **modulaire** et **contextuelle** : un même noyau Documentum peut être exploité avec des modules différents selon le métier ou le cas d'usage.

**Documentum ne remplace pas** :
- un CRM
- un ERP
- un outil ITSM complet
- un outil de planification de développement

**Documentum alimente** ces briques et reçoit d’elles des informations utiles à la boucle documentaire.

---

## 3. Vision d’ensemble

```text
                        [ Portail Client ]
                               |
                               v
                    [ Support / Selfcare / Formation ]
                               |
                               v
[ Outil ITIL / Support ] <--> [ APIs d’intégration ] <--> [ Documentum ] <--> [ IA / Knowledge Engine ]
                               ^              ^               |
                               |              |               v
                      [ Gestion Produit ]   [ Base Métier ]   [ Publication / Export ]
```

---

## 4. Rôle de Documentum dans la cible

Documentum porte les responsabilités suivantes :

### 4.1 Référentiel documentaire
- gestion des rubriques
- structuration par maps
- révisions éditoriales
- publications versionnées
- métadonnées métier
- traçabilité des changements

### 4.2 Référentiel de connaissance produit
- rattachement des rubriques aux fonctionnalités
- suivi des impacts documentaires
- couverture documentaire par version
- préparation de la publication

### 4.3 Point d’alimentation transverse
Documentum devient source pour :
- la recherche documentaire interne
- la base de connaissances exposée au support
- la base de connaissances IA
- le portail client
- les supports de formation

---

## 5. Découpage modulaire cible

## 5.1 Module A — Documentum Core

### Rôle
Cœur documentaire et référentiel de connaissance.

### Responsabilités
- gestion des projets documentaires
- gestion des versions de projet
- gestion des rubriques et révisions
- gestion des maps et de la structure documentaire
- publication multi-format
- APIs documentaires canoniques

### Technologies pressenties
- Backend : Django + DRF
- Base : PostgreSQL
- Frontend : React + TypeScript
- Moteur de publication : DITA-OT

---

## 5.2 Module B — Pilotage documentaire

### Rôle
Suivre les événements métier et leurs impacts documentaires, quel que soit le contexte d'usage.

### Principe générique

Ce module fonctionne selon un schéma invariant :

```text
ObjetMétier
  → ÉvénementMétier
      → ImpactDocumentaire
          → Rubrique
```

### Spécialisation actuelle — contexte Ingénierie Logicielle

L'implémentation actuelle (`ProductDocSync`) instancie ce schéma avec :
- `Fonctionnalité` comme `ObjetMétier`
- `ÉvolutionProduit` comme `ÉvénementMétier`
- `ImpactDocumentaire` → lien vers une `Rubrique`

### Responsabilités (génériques)
- gestion des objets métier (fonctionnalités, produits, dossiers…)
- gestion des événements (évolutions, correctifs, incidents, changements réglementaires…)
- rattachement à une version ou échéance cible
- déclaration des impacts documentaires
- suivi du statut de couverture documentaire

### Remarque
Ce module peut être :
- intégré fonctionnellement à Documentum au départ (cas actuel)
- puis isolé ensuite comme sous-module métier distinct selon le contexte

### Données clés (spécialisation logicielle actuelle)
- produit
- version cible (`VersionProduit`)
- fonctionnalité (`Fonctionnalité` = `ObjetMétier`)
- évolution (`ÉvolutionProduit` = `ÉvénementMétier`)
- criticité
- statut documentaire

---

## 5.3 Module C — Support ITIL / Exploitation

### Rôle
Gérer les tickets, incidents, demandes et problèmes.

### Responsabilités
- réception des demandes client
- qualification
- lien avec fonctionnalités / versions / anomalies
- enrichissement de la connaissance de support
- remontée des cas fréquents vers la documentation

### Positionnement recommandé
Ce module doit être **séparé de Documentum**, mais **intégré par API**.

### Flux avec Documentum
- interrogation de la documentation liée à une fonctionnalité
- suggestion d’articles ou rubriques liées à un incident
- création de signalements d’impact documentaire
- consultation des versions publiées

---

## 5.4 Module D — IA / Knowledge Engine

### Rôle
Exploiter la connaissance structurée pour assister les équipes internes et externes.

### Responsabilités
- indexation des contenus Documentum
- vectorisation / embeddings
- recherche sémantique
- génération assistée par récupération de contexte
- support conversationnel
- proposition de rapprochements ticket ↔ documentation ↔ fonctionnalité

### Positionnement recommandé
Service séparé, consommant des exports ou APIs Documentum.

### Règle importante
L’IA ne doit jamais être la source de vérité.

La source de vérité reste :
- la documentation validée
- les métadonnées métier
- les publications tracées

---

## 5.5 Module E — Portail client

### Rôle
Exposer vers l’extérieur la connaissance utile au client.

### Responsabilités
- consultation de la base documentaire publiée
- parcours de support
- formulaires de contact / tickets
- chatbot ou assistant documentaire
- e-learning / formation
- espace personnalisé par produit / profil

### Règle importante
Le portail ne modifie pas la vérité documentaire.
Il consomme les contenus publiés et les services exposés.

---

## 5.6 Module F — Formation / e-learning

### Rôle
Transformer une partie de la documentation en contenu pédagogique.

### Responsabilités
- publication SCORM ou format LMS
- parcours thématiques
- quiz / exercices
- suivi de consommation si nécessaire

### Positionnement
Peut rester un sous-domaine de publication de Documentum dans un premier temps.

---

## 5.6b Module — Gestion de production

### Rôle
Suivre les cycles de production métier (fabrication, services, procédures).

### Responsabilités
- gestion des ordres ou cycles de production
- suivi des défauts, non-conformités ou incidents qualité
- lien avec la documentation technique et les procédures
- alimentation du module Pilotage documentaire en événements métier

### Positionnement
- module spécialisé activé selon le `context_produit`
- vision cible — pas encore implémenté

---

## 5.6c Module — Publipostage

### Rôle
Produire des documents personnalisés par fusion entre modèles documentaires et données métier ou client.

### Responsabilités
- gestion de modèles de fusion (templates)
- gestion des champs de fusion et des sources de données
- fusion automatisée ou à la demande
- génération de documents personnalisés (courriers, notices, attestations, rapports…)
- lien possible avec la Base Métier et le module IA

### Positionnement
- module activé selon le `context_produit`
- vision cible — pas encore implémenté
- alimenté par Documentum Core (structure) + données métier externes ou Base Métier

---

## 5.7 Module G — Base Métier

### Rôle
Fournir une source de vérité métier indépendante du produit et de la documentation.

### Responsabilités
- stockage de règles métier (ex : droit du travail, règles de gestion)
- structuration des référentiels métiers
- versioning des règles
- traçabilité des évolutions
- validation humaine des modifications

### Positionnement
- module indépendant
- consommé par Documentum, IA, Support et Produit

### Règle fondamentale
La base métier est une source de vérité.

Elle ne dépend pas :
- de la documentation
- du code
- de l’IA

### Interaction avec l’IA
- l’IA propose
- la base métier valide

---

## 6. Principes d’architecture transverses

## 6.1 Architecture modulaire et non monolithique fonctionnellement

Même si plusieurs briques peuvent cohabiter dans le même socle technique au départ, l’architecture doit être pensée comme un assemblage de modules à responsabilités nettes.

## 6.2 Source de vérité unique

Pour chaque type de donnée, une seule source de vérité :

- documentation validée → Documentum
- règles métier / référentiels → Base Métier
- tickets support → module ITIL
- données commerciales → CRM/ERP externe
- index sémantique → moteur IA dérivé, jamais source maître

## 6.3 Intégration par API

Les échanges entre modules doivent passer prioritairement par :
- API REST
- événements métier si nécessaire ultérieurement
- exports contrôlés pour l’IA ou la publication

## 6.4 Découplage fort

Aucun module externe ne doit dépendre directement des tables internes de Documentum.

Le couplage se fait via :
- identifiants fonctionnels
- contrats d’API
- DTO explicites

## 6.5 Publication distincte de l’édition

Les contenus exposés à l’extérieur doivent reposer sur une logique de publication stable.

Ce qui est en cours d’édition ne doit pas être visible comme vérité publique.

---

## 7. Noyau de données pivot

## 7.1 Entités pivots recommandées

Les pivots métier du système cible sont :

**Cœur produit / documentaire**
- Produit
- VersionProduit
- Fonctionnalité
- ÉvolutionProduit
- ImpactDocumentaire
- Rubrique
- RévisionRubrique
- Publication

**Support**
- TicketSupport

**Base Métier**
- RéférentielMétier
- RègleMétier
- VersionRègleMétier
- SourceMétier
- PropositionMiseAJourMétier
- ValidationMétier

## 7.2 Relation pivot centrale

### Schéma générique (tout contexte)

```text
RéférentielMétier
  -> RègleMétier
      -> VersionRègleMétier
          -> (influence)
              ObjetMétier
                  -> ÉvénementMétier
                      -> ImpactDocumentaire
                          -> Rubrique
                              -> RévisionRubrique
                                  -> Publication
```

### Spécialisation actuelle — contexte Ingénierie Logicielle

```text
ObjetMétier       → Fonctionnalité
ÉvénementMétier   → ÉvolutionProduit
```

Lecture métier (contexte actuel) :
- une règle métier influence une ou plusieurs fonctionnalités
- une évolution produit peut être contrainte ou déclenchée par une règle métier
- une évolution touche une fonctionnalité (`ObjetMétier`)
- une évolution (`ÉvénementMétier`) génère un impact documentaire
- un impact concerne une ou plusieurs rubriques
- une rubrique évolue via des révisions
- une publication fige un état exploitable

---

## 8. Architecture applicative recommandée

## 8.1 Couche Frontend

### Applications possibles
- Frontend Documentum interne
- Frontend pilotage produit
- Frontend support
- Portail client

### Recommandation
Conserver une logique de composants et hooks spécialisés par domaine, avec client API centralisé.

---

## 8.2 Couche API / Orchestration

### Rôle
Exposer des contrats stables aux consommateurs.

### Types d’APIs à prévoir
- APIs documentaires
- APIs de pilotage produit
- APIs de publication
- APIs de consultation portail
- APIs d’export IA
- APIs métier (Base Métier)

### Exemple de familles d’endpoints
- `/api/metier/referentiels/`
- `/api/metier/regles/`
- `/api/metier/versions/`
- `/api/metier/propositions/`
- `/api/metier/validations/`
- `/api/projets/`
- `/api/maps/`
- `/api/rubriques/`
- `/api/fonctionnalites/`
- `/api/impacts/`
- `/api/publications/`
- `/api/knowledge/exports/`

---

## 8.3 Couche métier / services

### Rôle
Porter la logique métier centrale.

### Exemples de services
- création atomique de projet
- gestion structurelle des maps
- sauvegarde de rubrique
- calcul d’impact documentaire
- préparation de publication
- export vers moteur IA

### Services Base Métier
- ingestion de référentiels métier
- création et versioning de règles
- gestion des sources métier
- analyse des évolutions réglementaires
- gestion des propositions IA
- validation humaine des mises à jour
- diffusion des règles vers les modules consommateurs

---

## 8.4 Couche persistance

### Socle principal
- PostgreSQL pour les données métiers structurées

### Stores spécialisés possibles à terme
- stockage fichiers / médias
- index vectoriel pour l’IA
- stockage de logs techniques ou d’audit

### Sécurité
- chiffrement des données sensibles
- séparation possible des données critiques
- sécurisation des accès DB

---

## 9. Intégrations externes cibles

## 9.1 CRM / ERP

### Usage
- remonter le contexte client
- rattacher incidents ou parcours à un produit
- enrichir le portail et le support

### Règle
Documentum ne réplique pas les données ERP/CRM.
Il ne consomme que ce qui lui est utile.

### Sécurité
- tous les échanges passent par des APIs sécurisées
- aucun accès direct aux bases internes
- contrôle strict des données exposées

---

## 9.2 Outil ITIL

### Usage
- consulter la documentation liée
- relier tickets et fonctionnalités
- identifier les trous documentaires

---

## 9.3 Moteur IA

### Usage
- indexation régulière
- recherche augmentée
- assistance au support et à la rédaction

### Stratégie recommandée
Démarrer par des exports maîtrisés, pas par des connexions temps réel complexes.

---

## 9.4 Portail client

### Usage
- consultation de contenus publiés
- aide au diagnostic
- selfcare
- formation

---

## 10. Sécurité et gouvernance

## 10.1 Cloisonnement des usages

Les usages internes et externes doivent être séparés :
- édition interne
- pilotage interne
- support interne
- consultation externe

## 10.2 Authentification / autorisation

À prévoir selon les modules :
- authentification interne Documentum
- rôles métier
- authentification portail client
- clés d’API ou OAuth pour intégrations inter-applicatives

## 10.3 Gouvernance des contenus

La documentation utilisée par l’IA ou le portail doit être :
- validée
- publiée
- traçable

### Gouvernance métier

Les règles métier doivent être :
- validées humainement
- historisées (versioning obligatoire)
- associées à des sources identifiées
- distinguées entre :
  - source officielle
  - interprétation interne
  - proposition IA

## 10.4 Auditabilité

Toute décision ou action sensible doit être traçable :

Documentation :
- publication
- changement d’état documentaire

Métier :
- création ou modification de règle métier
- validation ou rejet d’une proposition
- évolution d’un référentiel métier

---

## 11. Trajectoire d’implémentation recommandée

## Phase 1 — Consolider le noyau Documentum

Objectif : rendre le cœur irréprochable.

À finaliser :
- structure documentaire canonique
- contenu / buffer / sauvegarde
- versioning et publication
- lien fonctionnalité ↔ rubrique ↔ impact

## Phase 2 — Stabiliser le module pilotage produit

Objectif : rendre visible la couverture documentaire.

À mettre en place :
- évolution produit
- version cible
- impact documentaire
- statuts de traitement
- vues d’analyse

## Phase 3 — Structurer la Base Métier

Objectif : créer la source de vérité métier

À mettre en place :
- modèle de données métier
- ingestion des référentiels
- gestion des règles
- versioning
- validation humaine

## Phase 4 — Exposer les APIs de connaissance

Objectif : faire de Documentum une plateforme exploitable.

À mettre en place :
- endpoints de consultation métier
- endpoints d’export documentaire
- contrats pour modules externes

## Phase 5 — Brancher un premier module externe

Objectif : valider la valeur réelle de l’écosystème.

Choix recommandé :
- soit le support ITIL
- soit la base IA

Mais pas les deux en même temps.

## Phase 6 — Ouvrir le portail client

Objectif : exposer de la valeur à l’extérieur.

À prévoir :
- base publiée
- moteur de recherche
- parcours support / formation

---

## 12. Risques majeurs à surveiller

## 12.1 Risque de dérive monolithique
Tout vouloir mettre “dans Documentum”.

## 12.2 Risque de confusion des vérités
Confondre contenu publié, contenu brouillon, index IA et données support.

## 12.3 Risque de couplage fort
Faire dépendre les modules des schémas internes de base de données.

## 12.4 Risque d’IA non gouvernée
Exposer des contenus non validés ou non publiés.

## 12.5 Risque de dispersion produit
Construire trop de modules sans verrouiller d’abord le noyau.

---

## 13. Décisions d’architecture à acter

Les décisions suivantes devront être confirmées formellement :

1. Documentum est le **référentiel documentaire central**.
2. Documentum n’a pas vocation à devenir un ITSM complet.
3. Les modules externes communiquent par API, jamais par accès direct à la base.
4. L’IA consomme une connaissance dérivée, jamais la donnée brute non gouvernée comme vérité.
5. Le portail client ne consomme que des contenus validés et publiés.
6. Le pivot métier principal est : **ObjetMétier → ÉvénementMétier → ImpactDocumentaire → Rubrique → Publication**. Dans le contexte Ingénierie Logicielle : Fonctionnalité → ÉvolutionProduit → ImpactDocumentaire.
7. La Base Métier est la source de vérité des règles métier
8. L’IA ne peut proposer que des évolutions, jamais les valider

---

## 14. Conclusion

La vision cible n’est pas celle d’un outil unique, mais celle d’un **écosystème modulaire et contextuel centré sur la connaissance documentaire et métier**.

Dans cette architecture :

- **Documentum** est le noyau de vérité documentaire
- la **Base Métier** est le noyau de vérité métier
- le **Pilotage documentaire** apporte l’intention de changement (via les événements métier du contexte actif)
- le support apporte la réalité terrain
- l’IA augmente l’exploitation de la connaissance
- le portail client restitue la valeur

👉 Le cœur du système devient :

Connaissance documentaire + Connaissance métier + Connaissance produit

La réussite du système repose sur trois conditions :

- un noyau documentaire solide
- des responsabilités clairement séparées
- des contrats d’intégration stables

