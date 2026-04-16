# 10 — MODÈLE MÉTIER : BASE MÉTIER

---

## 🎯 Objectif

Ce document définit le **modèle métier canonique du module G — Base Métier** dans Documentum Nexus.

Il constitue la **source de vérité de référence** pour :
- la structuration des règles métier
- leur cycle de vie
- leur gouvernance
- leur interaction avec les modules Produit, Documentum, IA et Support
- la future implémentation backend et API

---

## 🧠 Principe fondamental

> Une règle métier est une information versionnée, traçable, validée humainement, rattachée à une source, et indépendante du code qui l’implémente.

---

## 🔒 Règles structurantes

- Une règle métier n’est **jamais** déduite uniquement du comportement du produit.
- Une règle métier doit toujours être rattachée à **au moins une source**.
- Une proposition issue de l’IA ou de la veille ne devient jamais vérité sans **validation humaine**.
- Le versioning des règles est obligatoire.
- La Base Métier décrit **ce que le domaine impose ou recommande**, pas comment le code est écrit.

---

# 1. Entités principales

## 1.1 RéférentielMétier

### Rôle
Représente un **domaine métier structuré**.

### Exemples
- Droit du travail
- Gestion du temps
- Convention collective
- Règles d’organisation interne
- Doctrine métier validée

### Attributs métier minimaux
- `id`
- `code`
- `nom`
- `description`
- `type_referentiel`
- `statut`
- `date_creation`
- `date_mise_a_jour`

### Statuts recommandés
- `brouillon`
- `actif`
- `archivé`
- `obsolète`

### Invariants
- un référentiel possède un périmètre explicite
- un référentiel peut contenir plusieurs règles
- un référentiel archivé n’est plus alimenté mais reste consultable

---

## 1.2 SourceMétier

### Rôle
Représente l’**origine d’une information métier**.

### Types recommandés
- `officielle` — loi, décret, arrêté, convention, référentiel institutionnel
- `interne` — interprétation ou doctrine validée
- `externe` — source de veille ou publication spécialisée
- `technique` — source applicative ou paramétrique lorsque nécessaire

### Attributs métier minimaux
- `id`
- `type_source`
- `titre`
- `reference`
- `url_ou_identifiant`
- `organisme_emetteur`
- `date_publication`
- `date_effet`
- `date_collecte`
- `niveau_confiance`
- `statut`

### Statuts recommandés
- `à_vérifier`
- `valide`
- `contestée`
- `obsolète`
- `archivée`

### Invariants
- une source doit être identifiable
- une source ne vaut pas automatiquement règle métier
- une source peut alimenter plusieurs règles

---

## 1.3 RègleMétier

### Rôle
Représente une **règle métier fonctionnelle stable**, compréhensible par un humain et exploitable par les autres modules.

### Exemples
- durée maximale quotidienne de travail
- règle de repos minimum
- condition d’éligibilité à un calcul
- contrainte de planification ou de contrôle

### Attributs métier minimaux
- `id`
- `code`
- `titre`
- `description_courte`
- `objectif`
- `portee`
- `niveau_criticite`
- `statut`
- `referentiel_metier_id`
- `version_courante_id`
- `date_creation`
- `date_mise_a_jour`

### Statuts recommandés
- `brouillon`
- `active`
- `suspendue`
- `obsolète`
- `archivée`

### Niveaux de criticité recommandés
- `faible`
- `moyenne`
- `forte`
- `critique`

### Invariants
- une règle appartient à un référentiel
- une règle possède une version courante explicite
- une règle n’est jamais directement modifiée sans création d’une nouvelle version métier

---

## 1.4 VersionRègleMétier

### Rôle
Représente un **état versionné** d’une règle métier.

C’est cette entité qui porte le contenu versionné réel.

### Attributs métier minimaux
- `id`
- `regle_metier_id`
- `numero_version`
- `resume_version`
- `texte_normatif`
- `texte_interprete`
- `conditions_application`
- `exceptions_connues`
- `date_effet`
- `date_fin_effet`
- `statut`
- `cree_par`
- `cree_le`
- `validation_requise`

### Statuts recommandés
- `projet`
- `à_valider`
- `validée`
- `rejetée`
- `remplacée`
- `obsolète`

### Invariants
- une version appartient à une règle
- une règle peut avoir plusieurs versions successives
- une seule version est courante à un instant donné
- une version validée ne doit plus être modifiée, seulement remplacée par une nouvelle version

---

## 1.5 PropositionMiseAJourMétier

### Rôle
Représente une **suggestion de création ou d’évolution** d’une règle métier.

### Origines possibles
- IA
- veille automatique
- utilisateur métier
- support
- équipe produit

### Attributs métier minimaux
- `id`
- `type_proposition`
- `origine`
- `titre`
- `description`
- `regle_metier_cible_id` (nullable si création)
- `version_cible_id` (nullable)
- `source_principale_id`
- `niveau_confiance`
- `statut`
- `cree_le`
- `cree_par_ou_systeme`

### Types recommandés
- `création`
- `modification`
- `abrogation`
- `clarification`

### Statuts recommandés
- `détectée`
- `à_analyser`
- `en_revue`
- `acceptée`
- `rejetée`
- `convertie_en_version`

### Invariants
- une proposition ne modifie jamais directement une règle
- une proposition doit être analysable et traçable
- une proposition acceptée conduit à une validation puis à une nouvelle version

---

## 1.6 ValidationMétier

### Rôle
Représente la **décision humaine formelle** prise sur une proposition ou une version de règle.

### Attributs métier minimaux
- `id`
- `proposition_id`
- `version_regle_id` (nullable selon le flux)
- `decision`
- `commentaire`
- `valide_par`
- `date_decision`
- `niveau_validation`

### Décisions recommandées
- `validée`
- `rejetée`
- `à_compléter`
- `différée`

### Niveaux recommandés
- `métier`
- `juridique`
- `produit`
- `administrateur`

### Invariants
- aucune proposition ne devient effective sans validation
- une validation est toujours datée et attribuée
- le rejet conserve l’historique

---

# 2. Relations principales

```text
RéférentielMétier
  -> RègleMétier
      -> VersionRègleMétier
          -> SourceMétier

PropositionMiseAJourMétier
  -> RègleMétier
  -> SourceMétier
      -> ValidationMétier
```

---

## 2.1 Relations transverses recommandées

### Vers le Produit
Une règle métier peut être liée à :
- une ou plusieurs fonctionnalités
- un ou plusieurs produits
- une ou plusieurs versions produit

### Vers Documentum
Une règle métier peut être liée à :
- une ou plusieurs rubriques
- une ou plusieurs publications
- une ou plusieurs zones documentaires de référence

### Vers le Support
Une règle métier peut être invoquée dans :
- des tickets
- des diagnostics
- des réponses support

### Vers l’IA
L’IA peut :
- consommer les règles validées
- proposer des évolutions
- signaler des incohérences

L’IA ne peut jamais :
- valider une règle
- modifier directement une version validée

---

# 3. Cycle de vie d’une règle métier

## 3.1 Création initiale
1. Création d’un référentiel métier
2. Création d’une règle métier
3. Création d’une version initiale
4. Association à une ou plusieurs sources
5. Validation humaine
6. Activation de la version courante

## 3.2 Évolution
1. Détection d’un besoin d’évolution
2. Création d’une proposition de mise à jour
3. Analyse de la proposition
4. Décision humaine
5. Création d’une nouvelle version si acceptée
6. Mise à jour de la version courante

## 3.3 Fin de vie
Une règle ou une version peut devenir :
- `obsolète`
- `remplacée`
- `archivée`

L’historique reste conservé.

---

# 4. Interaction avec les autres modules

## 4.1 Avec Documentum

### Rôle
- enrichissement des rubriques
- citation ou référence des règles dans la documentation
- alignement des contenus publiés avec les règles métier validées

### Invariant
Documentum ne devient pas la source de vérité métier.
Il consomme la Base Métier.

---

## 4.2 Avec le Produit

### Rôle
- influence les fonctionnalités
- contraint certaines évolutions
- éclaire les décisions de paramétrage ou de calcul

### Invariant
Le produit ne décide pas de la règle métier.
Il l’implémente ou s’y conforme.

---

## 4.3 Avec l’IA

### Rôle
- fournit un socle fiable de connaissance métier
- reçoit des propositions de changement
- permet la veille et le recoupement

### Invariant
L’IA ne valide jamais.
Elle détecte, rapproche, suggère.

---

## 4.4 Avec le Support

### Rôle
- aide à interpréter les tickets
- fournit une base de justification
- améliore la qualité des réponses support

### Invariant
Le support consomme la règle métier validée, mais ne l’altère pas directement.

---

# 5. Règles de gouvernance

## 5.1 Validation humaine obligatoire
Aucune règle métier ne devient effective sans décision humaine explicite.

## 5.2 Versioning systématique
Toute évolution significative d’une règle crée une nouvelle version métier.

## 5.3 Source obligatoire
Toute règle ou proposition doit être rattachée à au moins une source identifiable.

## 5.4 Traçabilité complète
Toute création, proposition, validation ou rejet doit être historisé.

## 5.5 Distinction des niveaux de vérité
Il faut toujours distinguer :
- la source officielle
- l’interprétation interne
- la proposition issue de l’IA ou de la veille
- l’implémentation logicielle

---

# 6. API métier (conceptuel)

## 6.1 Consultation
- `GET /api/metier/referentiels/`
- `GET /api/metier/regles/`
- `GET /api/metier/regles/{id}/`
- `GET /api/metier/regles/{id}/versions/`
- `GET /api/metier/sources/`

## 6.2 Alimentation et évolution
- `POST /api/metier/propositions/`
- `POST /api/metier/validations/`
- `POST /api/metier/regles/`
- `POST /api/metier/regles/{id}/versions/`

## 6.3 Diffusion et exploitation
- `GET /api/metier/knowledge/exports/`
- `GET /api/metier/regles/{id}/impacts/`
- `GET /api/metier/regles/{id}/documentation/`

---

# 7. Positionnement dans Nexus

La Base Métier est :
- indépendante
- centrale
- transversale
- gouvernée

Elle alimente :
- Documentum
- IA
- Produit
- Support
- Portail client indirectement via les modules consommateurs

---

# 8. Cas d’usage structurants

## 8.1 Création d’une règle métier initiale
Un expert métier crée une règle dans un référentiel, rattache une source officielle, soumet la version initiale à validation, puis la règle devient active.

## 8.2 Proposition issue de l’IA
L’IA détecte une évolution réglementaire, crée une proposition, l’expert l’analyse, puis une nouvelle version de règle est créée si la proposition est retenue.

## 8.3 Impact sur la documentation
Une nouvelle version de règle métier est validée. Le système identifie les rubriques concernées et alimente le pilotage documentaire.

## 8.4 Impact sur le produit
Une règle métier mise à jour révèle une contrainte nouvelle sur une fonctionnalité. Le produit doit être analysé et éventuellement ajusté.

---

# 9. Invariants critiques

- une règle métier n’est jamais une simple donnée de paramétrage
- une version validée est immuable
- une proposition n’est jamais la vérité
- une source non vérifiée ne peut pas produire seule une règle active
- l’IA ne peut jamais fermer le cycle de validation

---

# 10. Lecture recommandée

Après ce document, lire :
- le référentiel d’architecture Nexus
- l’architecture technique modulaire
- le futur document de flux métier Base Métier
- le futur contrat d’API métier

---

# ✔️ Fin du document

