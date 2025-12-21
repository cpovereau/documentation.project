# Gestion de la Map — Reste à faire

Ce document synthétise **les travaux restants** concernant la gestion de la Map dans Documentum, après la stabilisation de la racine documentaire et des comportements UI associés.

---

## ✅ État actuel (validé)

### Structure & UX
- Une **racine documentaire explicite** existe (MapRubrique parent = null).
- La racine est :
  - non supprimable
  - non déplaçable (drag & drop)
  - non indentable / outdentable
- Les autres rubriques conservent les comportements historiques :
  - indentation / outdentation (via `level`)
  - réorganisation par drag & drop
  - expansion / collapse

### Architecture Frontend
- `MapModule` ne manipule **que des `MapItem`** (abstraction UI).
- La notion de racine est portée par `MapItem.isRoot` (donnée dérivée).
- La logique structurelle (racine, insertion) est centralisée dans `mapStructure.ts`.

---

## 🔜 Travaux à venir

### 1️⃣ Finaliser proprement la création de rubrique

**Objectif** : garantir un flux robuste et cohérent entre frontend et backend.

À vérifier / corriger :
- La création de la rubrique (`POST /rubriques/`) est toujours suivie de :
  - la création du lien Map ↔ Rubrique (`POST /maps/{id}/rubriques/`)
- Le parent est déterminé via la règle officielle (helper d’insertion).
- Le rechargement de la structure (`listMapRubriques`) est systématique.

👉 Cette étape est un **pré-requis** avant toute persistance avancée de la Map.

---

### 2️⃣ Étape 4 — Projection `level` → `parent` / `ordre`

**Objectif** : sortir du mode « structure locale » et persister la hiérarchie réelle.

À faire :
- Écrire une fonction de conversion :
  - entrée : `MapItem[]` (linéaire avec `level`)
  - sortie : liste de mutations `{ mapRubriqueId, parentId, ordre }`
- Identifier correctement :
  - le parent réel de chaque rubrique
  - son ordre parmi ses frères

👉 `level` devient **une projection UI temporaire**, plus une vérité métier.

---

### 3️⃣ Persistance backend de la structure

**Objectif** : faire du backend la source de vérité unique.

À faire :
- Appeler `PATCH /maps/{mapId}/rubriques/{id}/` pour :
  - mettre à jour `parent`
  - mettre à jour `ordre`
- Enchaîner **systématiquement** avec un rechargement de la structure.
- Gérer les erreurs (rollback UI si besoin).

---

### 4️⃣ Rechargement systématique de la Map

**Objectif** : éviter toute divergence frontend / backend.

Règle à acter :
> Toute modification structurelle (create, move, indent, reorder) ⇒ reload depuis l’API.

Conséquences :
- Le state local devient un cache temporaire.
- Le backend devient l’unique source de vérité.

---

### 5️⃣ Évolutions UX possibles (non prioritaires)

À envisager ultérieurement :
- Rendu spécifique de la racine (style, icône, tooltip).
- Masquage partiel de la racine en mode « simple ».
- Actions distinctes :
  - « Ajouter une rubrique enfant »
  - « Ajouter une rubrique au même niveau »

---

## 🧭 Ordre recommandé de traitement

1. ✅ Stabilisation de la Map (terminée)
2. 🔜 Finalisation de la création de rubrique
3. 🔜 Étape 4 — Projection `level → parent / ordre`
4. 🔜 Persistance backend + reload systématique
5. 🔜 Ajustements UX optionnels

---

## 🎯 Objectif final

À l’issue de ces étapes :
- La Map est **structurellement fiable**.
- La hiérarchie est **persistée et traçable**.
- Le système est prêt pour :
  - le versioning avancé
  - l’arbre d’impact
  - le travail collaboratif futur

---

📌 **Prochaine étape immédiate conseillée** :
> Reprendre calmement la **création de rubrique** pour la rendre irréprochable, avant d’attaquer l’étape 4 dans un nouveau fil dédié.

