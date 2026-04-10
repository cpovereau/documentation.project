# 📄 00_DOCUMENTATION_STRATEGY.md

---

## 🎯 Objectif

Ce document définit la **stratégie documentaire du projet Documentum**.

Il vise à garantir :

* une **cohérence globale** de la documentation,
* une **lisibilité durable** du projet,
* une **séparation claire entre vérité métier et réalité technique**,
* une **utilisation efficace des outils d’IA (Claude Code, ChatGPT)** sans dérive.

---

## 🧠 Principe fondamental

> **Une information ne doit avoir qu’une seule source de vérité.**

Toute duplication entraîne :

* incohérences,
* perte de confiance,
* erreurs de conception.

---

## 🧩 1. Niveaux de documentation

La documentation Documentum est structurée en **3 niveaux distincts**.

---

### 🏛️ 1.1 Référentiel canonique (SOURCE DE VÉRITÉ)

#### 🎯 Rôle

Décrire **ce que le système DOIT être**.

#### 📌 Caractéristiques

* stable
* validé
* décisionnel
* transverse
* indépendant de l’implémentation

#### 📂 Contenu typique

* modèle métier
* architecture cible
* stratégie de test
* règles de gouvernance
* principes invariants

#### 📁 Exemples

* `10_MODELE_METIER_DOCUMENTUM.md`
* `10_VERSIONING_DOCUMENTAIRE.md`
* `20_ARCHITECTURE_FRONTEND.md`
* `60_TESTING_STRATEGY.md`
* `gov_principles.md`
* `gov_risk-areas.md`
* `gov_forbidden-patterns.md`

---

### 🧪 1.2 Documentation opérationnelle (RÉALITÉ DU CODE)

#### 🎯 Rôle

Décrire **comment le système fonctionne réellement aujourd’hui**.

#### 📌 Caractéristiques

* évolutive
* technique
* proche du code
* parfois imparfaite
* reflète l’état réel

#### 📂 Contenu typique

* cartographies des composants
* flux métier réels
* dépendances techniques
* interactions frontend/backend

#### 📁 Exemples

* `cartographie_CentralEditor.md`
* `cartographie_LeftSidebar.md`
* `Documentation_technique_composants_applicatifs.md`
* `Refonte_CentralEditor.md`

---

### 🔍 1.3 Documentation d’analyse (TEMPORAIRE)

#### 🎯 Rôle

Servir à :

* comprendre,
* analyser,
* décider,
* préparer des évolutions.

#### 📌 Caractéristiques

* temporaire
* exploratoire
* non normative
* peut devenir obsolète

#### 📂 Contenu typique

* synthèses
* audits
* réflexions
* plans d’action

#### 📁 Exemples

* `documentum_synthese_frontend_*`
* `audits/`
* notes de refonte

---

## 🧭 2. Organisation des dossiers

Structure recommandée :

```
docs/
│
├── 00_REFERENTIEL/
│   ├── 10_MODELE_METIER.md
│   ├── 20_ARCHITECTURE.md
│   ├── 30_TESTING_STRATEGY.md
│   ├── 40_GOVERNANCE/
│
├── 01_OPERATIONNEL/
│   ├── frontend/
│   ├── backend/
│   ├── CentralEditor/
│   ├── LeftSidebar/
│
├── 02_ANALYSE/
│   ├── audits/
│   ├── syntheses/
│   ├── refontes/
│
├── 00_INDEX_DOCUMENTUM.md
```

---

## 🔗 3. Relations entre les niveaux

### 3.1 Règle de liaison

Chaque document doit référencer explicitement les autres niveaux.

---

### 📌 Depuis l’opérationnel vers le référentiel

```md
## 🔗 Références

- Voir : 20_ARCHITECTURE_FRONTEND.md
- Voir : gov_risk-areas.md
```

---

### 📌 Depuis le référentiel vers l’opérationnel

```md
## 🔍 Implémentation actuelle

Voir :
- 01_OPERATIONNEL/CentralEditor/cartographie_CentralEditor.md
```

---

### 🎯 Objectif

Créer une **navigation bidirectionnelle** entre :

* la théorie (référentiel)
* la réalité (opérationnel)

---

## ⚙️ 4. Règles d’écriture

---

### ✅ Ce qui est obligatoire

* Toute règle métier → **référentiel**
* Toute observation technique → **opérationnel**
* Toute réflexion → **analyse**

---

### ❌ Ce qui est interdit

* dupliquer une règle métier dans plusieurs fichiers
* modifier le référentiel sans décision formalisée
* corriger un problème dans la documentation au lieu du code
* mélanger plusieurs niveaux dans un même document

---

## 🧱 5. Cycle de vie de l’information

---

### 🔄 Évolution normale

```
Analyse → Décision → Référentiel → Implémentation → Opérationnel
```

---

### 📌 Exemple

1. Une réflexion est documentée (ANALYSE)
2. Une décision est prise → `decision-log`
3. Le référentiel est mis à jour
4. Le code évolue
5. La cartographie opérationnelle est mise à jour

---

## 🤖 6. Utilisation des outils IA

---

### ✅ Cas d’usage pertinents

* génération de cartographies
* extraction de règles depuis le code
* analyse de cohérence
* création de tests

---

### ❌ Cas à éviter

* refonte globale de la documentation
* fusion automatique de plusieurs sources
* réécriture massive du référentiel

---

### 🎯 Principe

> L’IA assiste la compréhension, mais ne définit pas la vérité.

---

## 🧭 7. Gouvernance documentaire

---

### 📌 Référentiel

* toute modification doit être :

  * justifiée
  * validée
  * tracée dans `decision-log.md`

---

### 📌 Opérationnel

* peut évoluer librement
* doit rester cohérent avec le code

---

### 📌 Analyse

* peut être supprimée ou archivée
* ne fait pas autorité

---

## 🧠 8. Règle finale

> Si deux documents se contredisent :
>
> * le **référentiel fait foi**
> * l’opérationnel doit être corrigé
> * l’analyse doit être mise à jour ou supprimée

---

# ✔️ Fin du document

Document structurant — à maintenir avec rigueur.
