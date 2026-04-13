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

---

## 8. Implémentation technique (Chantier 6)

### 8.1 Entités créées

#### `RevisionRubrique`

Snapshot immuable de chaque modification réelle du contenu XML d'une rubrique.

| Champ | Type | Description |
|---|---|---|
| `rubrique` | FK Rubrique | Rubrique concernée |
| `numero` | PositiveIntegerField | Séquentiel par rubrique (1, 2, 3…) |
| `contenu_xml` | TextField | Copie immuable du XML au moment de la révision |
| `hash_contenu` | CharField(64) | SHA-256 normalisé — base de détection de changement |
| `auteur` | FK User | Auteur de la modification |
| `date_creation` | DateTimeField | Horodatage auto |

Contrainte : `unique_together = (rubrique, numero)`

#### `SnapshotPublication`

Jointure figée entre une `VersionProjet` publiée et les révisions exactes de chaque rubrique.

| Champ | Type | Description |
|---|---|---|
| `version_projet` | FK VersionProjet | Version de projet publiée |
| `rubrique` | FK Rubrique | Rubrique incluse |
| `revision` | FK RevisionRubrique | Révision exacte publiée |

Contrainte : `unique_together = (version_projet, rubrique)`

Périmètre v1 : **map master uniquement** (limitation documentée, à étendre en v2).

### 8.2 Utilitaire `compute_xml_hash`

Fonction dans `utils.py`. Normalisation :
1. Strip des espaces
2. Parsing `ET.fromstring()` → re-sérialisation `ET.tostring(encoding='unicode')`
3. Cas vide → `sha256(b"")` (rubriques racines)
4. XML invalide → hash du texte brut (défense en profondeur, pas de blocage)

Garantit : deux XML sémantiquement identiques (attributs réordonnés, espacements différents) produisent le même hash.

### 8.3 Stratégie de version (D2 — validée MOA)

- Format : semver, bump **mineur** automatique (`1.0.0 → 1.1.0`)
- Pas de saisie manuelle en v1
- Paramétrabilité reportée à une version ultérieure

### 8.3b Limites de normalisation XML documentées (Lot 2)

Propriétés garanties par `compute_xml_hash` :
- Même chaîne → même hash (trivial)
- Déclaration `<?xml ...?>` strippée → hash identique avec ou sans déclaration
- Chaîne vide / null → `sha256(b"")` stable

Limites (comportement Python 3.13 / ElementTree) :
- **Whitespace text nodes** entre balises (`<root>  <child/>  </root>` ≠ `<root><child/></root>`) : hashes distincts. Non-significatif car TipTap sérialise de façon cohérente.
- **Ordre des attributs** (`a="1" b="2"` ≠ `b="2" a="1"`) : hashes distincts. Non-significatif car TipTap produit un ordre constant.

### 8.3c Point de concurrence (Lot 2)

Mécanisme : `select_for_update(of=("self",))` sur la ligne `Rubrique` dans `create_revision_if_changed()`.

Effet : deux transactions simultanées sur la même rubrique sont sérialisées. La seconde attend la fin de la première avant d'acquérir le verrou et de relire le hash courant.

Garde-fou DB final : `unique_together(rubrique, numero)` sur `RevisionRubrique`.

### 8.4 Champs dépréciés (D4 — validée MOA)

À **ne pas utiliser** dans les nouveaux flux. Suppression planifiée dans un lot ultérieur.

| Champ | Modèle | Remplacé par |
|---|---|---|
| `revision_numero` | `Rubrique` | `RevisionRubrique.numero` |
| `version` | `Rubrique` | Sans objet (ambigu) |
| `version_precedente` | `Rubrique` | `RevisionRubrique` (historique séquentiel) |
| `version_numero` | `Projet` | `VersionProjet.version_numero` |