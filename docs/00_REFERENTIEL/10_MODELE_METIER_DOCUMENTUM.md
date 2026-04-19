# 🧠 10 — Modèle métier Documentum

Ce document décrit le **modèle métier global du CCMS Documentum**.

Il définit :
- les entités principales
- leurs relations
- leurs responsabilités
- les invariants métier

---

# 🎯 Objectifs

- Structurer le fonctionnement global du système
- Aligner backend, frontend et logique métier
- Servir de référence pour :
  - le modèle de données
  - les API
  - les flux métier

---

# 🔒 Règle fondamentale

Le modèle métier décrit :

- **ce que le système est**
- pas comment il est implémenté

---

# 🧩 Vue d’ensemble

Le système repose sur 4 axes principaux :

1. **Organisation documentaire**
2. **Contenu éditorial**
3. **Versioning & publication**
4. **Pilotage documentaire** (module générique — spécialisation actuelle : `ProductDocSync` pour le contexte Ingénierie Logicielle)

---

# 🏗 1. Organisation documentaire

---

## Entités

- Projet
- VersionProjet
- Map
- MapRubrique

---

## Structure

Projet
└── VersionProjet (1 active)
    └── Map (dont 1 master)
        └── MapRubrique (structure)
            └── Rubrique (contenu)

---

## Invariants

- Un projet possède toujours :
  - une version active
  - une map master
  - une racine documentaire

- Une map est :
  - une structure arborescente
  - indépendante du contenu

- MapRubrique :
  - porte la hiérarchie
  - ne contient aucun contenu

---

# 🧾 2. Contenu éditorial

---

## Entités

- Rubrique
- RévisionRubrique

---

## Logique

Rubrique
└── Révision 1
└── Révision 2
└── Révision N

---

## Invariants

- Une rubrique :
  - existe indépendamment des maps
  - peut être réutilisée

- Une révision :
  - est créée uniquement si le contenu XML change
  - est immuable après création

---

## Règle clé

👉 Structure ≠ Contenu

- MapRubrique = structure
- Rubrique = contenu

---

# 🔄 3. Versioning & publication

---

## Entités

- VersionProjet
- Publication

---

## Logique

Phase de travail :
- modifications → révisions

Phase de publication :
- snapshot → version projet

---

## Invariants

- Une version de projet :
  - est figée
  - est traçable
  - est exportable

- Une version est créée :
  - uniquement lors d’une publication

---

## Règle clé

👉 Une modification ne crée jamais une version  
👉 Une publication peut créer une version

---

# 🎯 4. Pilotage documentaire

---

## Schéma générique

Le pilotage documentaire suit un schéma invariant, quel que soit le contexte métier :

```text
ObjetMétier
  → ÉvénementMétier
      → ImpactDocumentaire
          → Rubrique
```

## Spécialisation actuelle — contexte Ingénierie Logicielle

| Abstraction générique | Spécialisation logicielle |
|---|---|
| `ObjetMétier` | `Fonctionnalité` |
| `ÉvénementMétier` | `ÉvolutionProduit` |
| `ImpactDocumentaire` | `ImpactDocumentaire` (pivot inchangé) |

## Exemples de spécialisations possibles

| Contexte | ObjetMétier | ÉvénementMétier |
|---|---|---|
| Ingénierie logicielle | Fonctionnalité | ÉvolutionProduit / Correctif |
| Industrie | Produit physique | Défaut qualité / Évolution |
| Juridique | Dossier / Règle | Évolution réglementaire |
| Support | Ticket récurrent | Signalement / Incident |

## Entités actuelles

- `Fonctionnalité` (ObjetMétier — spécialisation logicielle)
- `EvolutionProduit` (ÉvénementMétier — spécialisation logicielle)
- `ImpactDocumentaire` (pivot central — inchangé)

---

## Rôle

- identifier les besoins de mise à jour documentaire
- suivre l’état de la documentation liée aux événements métier

---

## Invariants

- Le module Pilotage documentaire :
  - ne modifie pas le contenu XML
  - ne crée pas de révision

- `ImpactDocumentaire` :
  - représente un besoin de mise à jour
  - pas une modification directe de contenu

---

# 🔗 Relations majeures

---

## Projet

- possède → VersionProjet
- possède → Map
- possède → Rubrique

---

## Map

- contient → MapRubrique

---

## MapRubrique

- référence → Rubrique
- référence → parent MapRubrique

---

## Rubrique

- possède → Révisions
- peut être liée → Fonctionnalités

---

## Fonctionnalité

- possède → ImpactsDocumentaires

---

## ImpactDocumentaire

- référence → Rubrique
- référence → Fonctionnalité

---

# ⚠️ Invariants critiques

---

## 1. Séparation structure / contenu

- aucune API ne doit mélanger :
  - MapRubrique
  - contenu XML

---

## 2. Indépendance des rubriques

- une rubrique peut exister :
  - sans map
  - dans plusieurs maps

---

## 3. Versioning strict

- une seule version active
- versions archivées non modifiables

---

## 4. Révision contrôlée

- une révision = modification réelle
- aucun autre événement ne crée de révision

---

## 5. Publication comme pivot

- seule la publication crée une version
- la publication consomme les révisions

---

# 🔍 Anti-patterns métier

---

❌ Confondre version et révision  
❌ Mélanger structure et contenu  
❌ Modifier une rubrique via une map  
❌ Créer une version sans publication  
❌ Créer une révision sans modification réelle  

---

# 🧭 Lecture recommandée

Après ce document :

👉 lire :
- `10_VERSIONING_DOCUMENTAIRE.md`
- `20_ARCHITECTURE_BACKEND.md`
- `40_FLUX_PUBLICATION.md`

---

# ✔️ Fin du document