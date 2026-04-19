# 🧠 10 — Modèle métier transverse simplifié

---

## 🎯 Objectif

Ce document définit un **modèle métier transverse simplifié** pour Documentum Nexus.

Il sert de :
- référence conceptuelle
- socle d’alignement entre modules
- guide pour les évolutions futures

👉 Il ne remplace pas les modèles existants, il les **structure et les généralise**.

---

## 🧱 Principe fondamental

> Tout besoin documentaire provient d’un **changement métier**.

Ce changement est modélisé par un enchaînement simple :

```text
ObjetMétier
    → ÉvénementMétier
        → ImpactDocumentaire
            → Rubrique
```

---

## 🧩 1. ObjetMétier

### Définition

Représente une **entité du domaine métier**.

### Exemples

- Fonctionnalité (logiciel)
- Produit physique (industrie)
- Règle métier (juridique)
- Ticket récurrent (support)
- Document type (publipostage)

### Rôle

- point d’ancrage du pilotage
- élément stable dans le temps

---

## ⚡ 2. ÉvénementMétier

### Définition

Représente un **changement affectant un objet métier**.

### Exemples

- évolution produit
- correctif
- incident
- changement réglementaire
- défaut qualité
- mise à jour de procédure

### Rôle

- déclencheur du besoin documentaire
- porte le contexte du changement

---

## 📌 3. ImpactDocumentaire

### Définition

Représente le **besoin de mise à jour documentaire**.

### Rôle

- lien entre le métier et la documentation
- suivi de l’état d’avancement

### Statuts typiques

- à_faire
- en_cours
- prêt
- validé
- ignoré

👉 L’impact ne modifie pas le contenu.
👉 Il exprime un besoin.

---

## 📄 4. Rubrique

### Définition

Unité de contenu éditorial dans Documentum.

### Rôle

- contient le contenu XML
- est versionnée
- est modifiée dans l’éditeur

---

## 🔗 5. Relation globale

```text
ObjetMétier
    → ÉvénementMétier
        → ImpactDocumentaire
            → Rubrique
```

---

## 🧠 6. Spécialisation actuelle (Ingénierie logicielle)

Le modèle actuellement implémenté dans Documentum est une **spécialisation** du modèle transverse :

| Modèle transverse | Implémentation actuelle |
|------------------|------------------------|
| ObjetMétier      | Fonctionnalité         |
| ÉvénementMétier  | ÉvolutionProduit       |
| ImpactDocumentaire | ImpactDocumentaire   |
| Rubrique         | Rubrique               |

---

## 🌍 7. Autres contextes possibles

### 🏭 Industrie

- ObjetMétier : Produit physique
- ÉvénementMétier : défaut / évolution

### ⚖️ Juridique

- ObjetMétier : Règle ou dossier
- ÉvénementMétier : évolution réglementaire

### 🧑‍💼 Support

- ObjetMétier : problème récurrent
- ÉvénementMétier : incident

### 🧾 Publipostage

- ObjetMétier : modèle de document
- ÉvénementMétier : mise à jour de contenu ou structure

---

## 🔄 8. Règles de gestion

- Un **événement métier** est toujours lié à un objet métier
- Un **impact documentaire** est toujours lié à un événement métier
- Une **rubrique** peut être liée à plusieurs impacts
- Une modification réelle du contenu → création d’une **révision**
- Un impact seul → ne crée pas de révision

---

## 🧭 9. Positionnement dans Nexus

Ce modèle permet :

- de généraliser le pilotage documentaire
- de supporter plusieurs métiers
- de découpler contenu et pilotage
- de préparer l’intégration avec la Base Métier et l’IA

---

## ⚠️ 10. Limites actuelles

- le backend implémente uniquement la spécialisation logicielle
- les entités ObjetMétier et ÉvénementMétier ne sont pas encore matérialisées
- le modèle transverse est une **cible d’architecture**

---

## 🧠 11. Principe clé

> Documentum ne gère pas uniquement du contenu.
> Il gère l’alignement entre **réalité métier et documentation**.

---

# ✔️ Fin du document