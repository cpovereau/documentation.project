# ProductDocSync — Spécification Métier

📅 Version 0.2 — Mise à jour structurante — Avril 2026

---

> ⚠️ Cette version introduit une évolution majeure du modèle métier :
> l'ajout de l'entité **EvolutionProduit** comme unité centrale du suivi de version,
> et la redéfinition de **Fonctionnalite** en entité de référentiel stable.

> 📌 **Positionnement Nexus (décision 2026-04-18)** : `ProductDocSync` est la **spécialisation actuelle** du module générique **Pilotage documentaire** pour le contexte `ingenierie_logicielle`. Ce document décrit cette spécialisation. Le schéma générique est documenté dans `10_MODELE_METIER_DOCUMENTUM.md` et `documentum_architecture_technique_modulaire.md`.

---

# 1. Objet du document

Ce document décrit les spécifications métier de l'écran **ProductDocSync** dans Documentum Nexus.

`ProductDocSync` est la **spécialisation actuelle** du module générique **Pilotage documentaire** pour le contexte `ingenierie_logicielle`. Il constitue la référence pour comprendre les entités manipulées, les acteurs impliqués, les flux de travail et les règles métier à implémenter dans ce contexte.

Le schéma conceptuel générique (ObjetMétier → ÉvénementMétier → ImpactDocumentaire) est documenté dans `10_MODELE_METIER_DOCUMENTUM.md` et `documentum_architecture_technique_modulaire.md`.

---

# 2. Positionnement dans Documentum Nexus

## 2.0 Positionnement dans Nexus — généralisation

Le module **Pilotage documentaire** est un module générique de Documentum Nexus. Il permet de piloter les impacts documentaires issus d'événements métier, quel que soit le contexte d'usage.

**Schéma générique :**

```text
ObjetMétier → ÉvénementMétier → ImpactDocumentaire → Rubrique
```

**Spécialisation logicielle (`ProductDocSync`) :**

| Abstraction générique | Entité logicielle |
|---|---|
| `ObjetMétier` | `Fonctionnalité` |
| `ÉvénementMétier` | `EvolutionProduit` |
| `ImpactDocumentaire` | `ImpactDocumentaire` (pivot inchangé) |

`ProductDocSync` est aujourd'hui la seule implémentation du module Pilotage documentaire. D'autres spécialisations sont possibles à terme (juridique, industrielle, support…), chacune activée via un `context_produit` différent.

---

## 2.1 Vue d'ensemble de l'application

Documentum est un CCMS (Component Content Management System) basé sur DITA XML. Il constitue le noyau de Documentum Nexus, une plateforme plus large destinée à couvrir plusieurs corps de métier (ingénierie logicielle, juridique, gestion de patrimoine…).

L'application est organisée autour de deux écrans principaux accessibles selon le profil utilisateur :

- **Page Documentation (CentralEditor)** — gestion de la documentation structurée, édition de rubriques DITA XML, publication multi-formats. 1 Projet = 1 documentation.
- **Page ProductDocSync** — module Pilotage documentaire dans le contexte Ingénierie Logicielle (gestion des documentations liées aux versions logicielles).

Un espace **Tableau de bord** transversal sera ajouté ultérieurement. Il sera le point d'entrée commun à tous les modules, composé de widgets de pilotage personnalisables.

## 2.2 Les deux cycles indépendants

| Cycle | Entité | Module |
|---|---|---|
| Cycle documentaire | `VersionProjet` | CentralEditor (Desktop) |
| Cycle produit | `VersionProduit` | ProductDocSync |

> ⚠️ **RÈGLE MÉTIER FONDAMENTALE** : ces deux cycles de vie sont **strictement indépendants** et ne doivent pas être couplés structurellement.

---

# 3. Acteurs et profils

L'accès aux fonctionnalités est conditionné par le profil utilisateur.

| Profil | Rôle dans ProductDocSync | Accès CentralEditor |
|---|---|---|
| Chargé de produit | Crée les `EvolutionProduit`, déclare les `ImpactDocumentaire` | Non (lecture seule éventuellement) |
| Rédacteur | Consulte les impacts documentaires, met à jour les rubriques dans CentralEditor | Oui — édition complète |
| Administrateur | Gère les paramètres : produits, fonctionnalités, droits, DTD, journalisation | Oui |

---

# 4. Entités métier

## 4.1 Hiérarchie globale

```
Produit
 └── VersionProduit
       └── EvolutionProduit
             ├── référence Fonctionnalite  (référentiel)
             └── ImpactDocumentaire
                   └── référence Rubrique
```

## 4.2 Produit

Un Produit est une application ou un logiciel dont la documentation est gérée dans Documentum. Il est créé et maintenu dans **Settings > DataTab**.

- **Attributs** : nom, code, description, statut (actif / archivé).
- Un Produit peut avoir plusieurs `VersionProduit`.

## 4.3 VersionProduit

Une `VersionProduit` représente une version logicielle publiée ou en cours de préparation. Elle est propre au cycle produit et **indépendante** du cycle documentaire (`VersionProjet`).

- **Attributs** : numéro de version (ex. `2.1`), statut (`en_preparation` / `publiee` / `archivee`), date de publication.
- Une `VersionProduit` contient plusieurs `EvolutionProduit`.
- La publication d'une `VersionProduit` change son statut et génère un document **suivi de version** (Option C — cf. § 8.1).

## 4.4 Fonctionnalité — entité de référentiel

> ⚠️ **Redéfinition v0.2** : `Fonctionnalite` est désormais une entité de **référentiel stable**. Elle représente une fonctionnalité pérenne du produit. Elle ne porte plus directement les évolutions ni les correctifs d'une version.

- **Rôle** : référentiel métier — catalogue des fonctionnalités d'un produit.
- **Attributs** : nom, code identifiant, description, statut (actif / archivé).
- Gérée dans **Settings > DataTab**.
- Une `Fonctionnalite` peut être **référencée** par plusieurs `EvolutionProduit`, dans différentes versions.

## 4.5 EvolutionProduit — entité centrale du suivi de version

> 🆕 **Entité introduite en v0.2.** C'est l'unité réelle du suivi de version.

Une `EvolutionProduit` représente une **occurrence d'évolution ou de correctif** déclarée dans le cadre d'une `VersionProduit`. Elle est liée à une `Fonctionnalite` du référentiel et peut impacter une ou plusieurs rubriques documentaires.

- **Attributs** :
  - `type` : `evolution` / `correctif`
  - `description` : texte résumant le correctif ou l'évolution
  - `ordre` : position dans la liste de la version
  - `statut` : `draft` / `valide`
- **Relations** :
  - appartient à une `VersionProduit`
  - référence une `Fonctionnalite` (du référentiel)
  - possède des `ImpactDocumentaire`

> ℹ️ La séparation `Fonctionnalite` (référentiel stable) / `EvolutionProduit` (événement versionné) permet de tracer l'historique d'une fonctionnalité à travers plusieurs versions sans dupliquer le référentiel.

## 4.6 ImpactDocumentaire

Un `ImpactDocumentaire` est le lien entre une `EvolutionProduit` (côté produit) et une `Rubrique` (côté documentation). Il matérialise le fait qu'une rubrique doit être mise à jour suite à une évolution ou un correctif.

- **Statuts** : `a_faire` / `en_cours` / `pret` / `valide` / `ignore`.
- Créé par le chargé de produit dans ProductDocSync.
- Mis à jour par le rédacteur dans CentralEditor ou ProductDocSync.
- **N'entraîne PAS de modification directe du contenu XML** ni de création de révision. Il s'agit d'une déclaration de travail à faire.

> ℹ️ `ImpactDocumentaire` est l'entité centrale de la valeur Nexus. Son implémentation backend est un prérequis pour que ProductDocSync soit fonctionnellement complet (Phase 3 de la roadmap).

---

# 5. Flux métier principaux

## 5.1 Création d'une version produit

1. Le chargé de produit sélectionne le **Produit** (chargé depuis `GET /api/produits/`).
2. Il crée une nouvelle `VersionProduit` (ex. `v2.1`) — `POST /api/versions-produit/`.
3. Il ajoute des `EvolutionProduit` à cette version, chacune référençant une `Fonctionnalite` du référentiel.
4. Quand la version est prête, il la **publie** → statut `publiee` + génération du document « suivi de version ».

> ⚠️ **RÈGLE** : la publication d'une `VersionProduit` ne déclenche **pas** automatiquement la publication documentaire (`VersionProjet`). Les deux cycles restent indépendants.

## 5.2 Gestion des évolutions dans une version

Le chargé de produit gère la liste des `EvolutionProduit` d'une `VersionProduit` :

- **Créer** : sélection d'une `Fonctionnalite` du référentiel + saisie type + description → `POST /api/evolutions-produit/`.
- **Réordonner** par drag & drop → persisté via le champ `ordre` sur `EvolutionProduit`.
- **Archiver** (suppression logique) → `PATCH /api/evolutions-produit/{id}/archive/`.

## 5.3 Déclaration d'un impact documentaire

Le chargé de produit identifie, pour une `EvolutionProduit` donnée, les rubriques documentaires à mettre à jour :

1. Dans le volet inférieur (`SyncBottombar`), il consulte la liste des rubriques associées à l'évolution.
2. Il ajoute un `ImpactDocumentaire` en sélectionnant la rubrique cible (via `+` initialement). Quand le module Production sera disponible, cette association sera automatisée.
3. Il définit le statut initial : `a_faire`.
4. Le rédacteur accède à la rubrique dans CentralEditor, effectue la modification documentaire (création d'une `RevisionRubrique`).
5. Le statut de l'`ImpactDocumentaire` est mis à jour : `a_faire` → `en_cours` → `pret` → `valide` (ou `ignore` si la rubrique n'est finalement pas concernée).

> ℹ️ Les statuts de l'`ImpactDocumentaire` sont des **métadonnées de pilotage**. Ils n'affectent pas le versioning documentaire.

## 5.4 Publication du suivi de version

**Décision validée (§ 8.1) : Option C.**

Quand toutes les `EvolutionProduit` d'une `VersionProduit` sont documentées et validées :

1. Le chargé de produit publie la version.
2. La `VersionProduit` passe au statut `publiee` avec horodatage.
3. Un document **suivi de version** est généré, listant l'ensemble des évolutions et correctifs avec les liens vers les rubriques impactées.

---

# 6. Interface et zones fonctionnelles

L'écran ProductDocSync est organisé en 4 zones (structure inchangée) :

| Zone | Composant React | Rôle |
|---|---|---|
| Gauche | `SyncLeftSidebar` | Sélection du Produit, de la VersionProduit, navigation dans la liste des EvolutionProduit |
| Centre | `SyncEditor` | Affichage et édition du détail d'une EvolutionProduit (description, type, Fonctionnalite référencée) |
| Bas | `SyncBottombar` | Liste des `ImpactDocumentaire` associés à l'EvolutionProduit sélectionnée ; mise à jour des statuts |
| Droite | `SyncRightSidebar` | Informations complémentaires (évolution future) |

## 6.1 Actions disponibles dans la toolbar

| Action | Statut actuel | Notes |
|---|---|---|
| Ajouter une fonctionnalité au référentiel | ✅ Opérationnel (API) | `POST /api/fonctionnalites/` — Settings > DataTab |
| Créer une EvolutionProduit | ⬜ À implémenter | `POST /api/evolutions-produit/` |
| Archiver une EvolutionProduit | ⬜ À implémenter | `PATCH /api/evolutions-produit/{id}/archive/` |
| Réordonner (drag & drop) | ⬜ À implémenter | Champ `ordre` sur `EvolutionProduit` |
| Exporter le suivi de version | ⬜ À implémenter | Format à définir (§ 8.2) |
| Publier la version | ⚠️ Stub (`alert()`) | Bloqué — `VersionProduit` et `EvolutionProduit` absentes du backend |

---

# 7. Périmètre V1

## Inclus en V1

- `VersionProduit` — création, gestion, publication
- `EvolutionProduit` — création, réordonnancement, archivage
- `ImpactDocumentaire` — déclaration, suivi de statut
- Publication du suivi de version (Option C : statut + génération document)

## Exclu de V1

- ❌ `TestPlanModal` — hors périmètre V1, sémantique à définir ultérieurement

---

# 8. Points ouverts — Arbitrages à trancher

> ⚠️ Chaque décision doit être tracée dans `gov_decision-log.md` avant implémentation.

## 8.1 ✅ [RÉSOLU] VersionProduit et publication — Option C

**Décision (2026-04-18)** : `VersionProduit` est une entité indépendante liée à `Produit`. La publication produit à la fois un changement de statut et un document de suivi de version (Option C). Cf. `gov_decision-log.md`.

## 8.2 ✅ [RÉSOLU] EvolutionProduit — nouvelle entité centrale

**Décision (2026-04-18)** : `EvolutionProduit` est introduite comme entité centrale du suivi de version. `Fonctionnalite` devient une entité de référentiel stable. `ImpactDocumentaire` lie `EvolutionProduit` → `Rubrique`. Cf. `gov_decision-log.md`.

## 8.3 🟠 Format du document de suivi de version

**Question** : quel format pour le document généré à la publication ? PDF / HTML / les deux ?

À définir avant l'implémentation du pipeline d'export.

## 8.4 🟠 Sémantique du `TestPlanModal`

Hors périmètre V1. À définir dans une version ultérieure de cette spec.

---

# 9. Contraintes techniques non négociables

- Aucune logique métier dans les composants React — tout dans les hooks.
- Tous les appels API via `apiClient` centralisé uniquement.
- `ImpactDocumentaire` ne modifie jamais le contenu XML d'une rubrique.
- ProductDocSync ne crée jamais de `RevisionRubrique` directement.
- Les statuts de l'`ImpactDocumentaire` sont des métadonnées de pilotage — ils n'affectent pas le versioning documentaire.
- Toute nouvelle entité backend doit être documentée dans `10_BACKEND_CANONIQUE.md` avant toute implémentation frontend.

---

# 10. Intégration avec les autres modules

## 10.1 CentralEditor (Desktop)

ProductDocSync et CentralEditor partagent l'entité `Rubrique` via `ImpactDocumentaire`. Le lien est **déclaratif** : ProductDocSync référence des rubriques existantes, il ne les crée ni ne les modifie directement.

- **Lecture** : `GET /api/rubriques/` pour sélectionner la rubrique cible d'un impact.
- **Écriture** : aucune — la modification du contenu XML est réservée à CentralEditor.

## 10.2 Settings > DataTab

Le référentiel `Fonctionnalite` est géré dans Settings. ProductDocSync référence ces données via `GET /api/fonctionnalites/` lors de la création d'une `EvolutionProduit`.

## 10.3 Module Production (futur)

Un module dédié à la gestion de production sera développé dans Documentum Nexus. Il sera la source principale des `EvolutionProduit` transmises à ProductDocSync. L'association manuelle est la solution provisoire.

## 10.4 Espace Tableau de bord (futur)

ProductDocSync exposera des widgets de pilotage (avancement des impacts, évolutions en cours…) dans le Tableau de bord transversal de Nexus. Ces widgets existeront en 3 tailles personnalisables.

---

# 11. Synthèse du modèle

| Entité | Rôle |
|---|---|
| `Fonctionnalite` | Référentiel stable — catalogue pérenne des fonctionnalités du produit |
| `EvolutionProduit` | Événement versionné — occurrence d'évolution ou correctif dans une version |
| `ImpactDocumentaire` | Travail documentaire — déclaration d'une rubrique à mettre à jour |

---

# 12. Impact documentaire

| Action | Document cible | Statut |
|---|---|---|
| Mettre à jour | `gov_decision-log.md` — entrée `EvolutionProduit` | ✅ Fait (2026-04-18) |
| Mettre à jour | `10_BACKEND_CANONIQUE.md` §§ 9.2 / 9.3 — `EvolutionProduit` + `ImpactDocumentaire` | ✅ Fait (2026-04-18) |
| Mettre à jour | `PRODUCTDOCSYNC_ROADMAP.md` — phases 1 et 3 révisées | ✅ Fait (2026-04-18) |

---

> ✔️ Fin du document
