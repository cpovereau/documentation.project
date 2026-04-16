# MODELE METIER TRANSVERSE

---

## 🎯 Objectif

Ce document définit un **modèle métier générique** permettant d’abstraire le modèle actuel de Documentum (orienté logiciel) vers un modèle **transversal multi-domaines**.

Il sert à :
- identifier les concepts réellement génériques
- isoler les concepts spécifiques au domaine logiciel
- préparer l’évolution vers une architecture réutilisable (Nexus)

---

## 🧠 Principe fondamental

> Le système doit reposer sur des concepts métier génériques, spécialisés ensuite par domaine (logiciel, juridique, RH, etc.).

---

# 1. Mapping des concepts

## 1.1 Noyau métier

| Concept générique | Documentum (logiciel) | Cas juridique |
|------------------|----------------------|---------------|
| ObjetMétier | Produit | Dossier client |
| CycleObjet | VersionProduit | Phase du dossier |
| ÉlémentMétier | Fonctionnalité | Acte / Procédure / Pièce |
| Évolution | ÉvolutionProduit | Événement dossier |
| Impact | ImpactDocumentaire | Impact documentaire |

---

## 1.2 Couche documentaire

| Concept générique | Documentum | Juridique |
|------------------|------------|----------|
| Rubrique | Rubrique | Fiche / procédure / modèle |
| Révision | RévisionRubrique | Version de document |
| Publication | Publication | Diffusion / remise client |

---

## 1.3 Base Métier

| Concept générique | Documentum Nexus | Juridique |
|------------------|------------------|----------|
| RéférentielMétier | Domaine métier | Domaine juridique |
| RègleMétier | Règle fonctionnelle | Règle juridique |
| VersionRègle | Version métier | Version réglementaire |
| Source | Source métier | Texte de loi |
| Validation | Validation métier | Validation juridique |

---

## 1.4 IA

| Concept générique | Logiciel | Juridique |
|------------------|----------|----------|
| Suggestion | Suggestion d’impact | Suggestion réglementaire |
| Analyse | Analyse doc | Analyse dossier |
| Recherche | Recherche doc | Recherche juridique |

---

# 2. Invariants génériques

Les invariants du système sont :

- un objet métier possède un cycle de vie
- un objet métier contient des éléments
- un élément métier peut évoluer
- une évolution génère un impact documentaire
- une information documentaire est versionnée
- une règle métier est versionnée et validée
- toute connaissance doit être traçable

---

# 3. Points non génériques identifiés

Les concepts suivants sont spécifiques au domaine logiciel :

- Produit
- VersionProduit
- Fonctionnalité
- ÉvolutionProduit

Ces concepts doivent être considérés comme des **spécialisations** et non comme le modèle de base.

---

# 4. Modèle pivot générique

## 4.1 Structure cible

```text
ObjetMétier
  -> CycleObjet
  -> ÉlémentMétier
      -> Évolution
          -> ImpactDocumentaire
              -> Rubrique
                  -> Révision
                      -> Publication
```

---

## 4.2 Lecture

- un objet métier structure un domaine
- un cycle décrit son état dans le temps
- un élément représente une unité fonctionnelle ou métier
- une évolution traduit un changement
- un impact déclenche une mise à jour documentaire

---

# 5. Règles d’architecture

- le modèle pivot doit rester générique
- les spécialisations ne doivent pas modifier le socle
- les modules consomment le modèle, ne le redéfinissent pas
- toute extension doit passer par spécialisation

---

# 6. Stratégie d’évolution

## Étape 1
Conserver le modèle actuel Documentum (logiciel)

## Étape 2
Introduire les concepts génériques en parallèle

## Étape 3
Mapper les concepts existants vers le modèle générique

## Étape 4
Tester un second domaine (juridique)

## Étape 5
Valider les invariants

## Étape 6
Faire évoluer le backend progressivement

---

# 7. Positionnement dans Nexus

Ce document se situe entre :

- le référentiel d’architecture
- le modèle métier spécifique

Il sert de **pont conceptuel**.

---

# ✔️ Fin du document

