# MAP_FRONTEND_ROADMAP

---

> ⚠️ Ce document décrit la roadmap frontend de la structure Map.
> La vérité backend est définie dans :
> - `10_CARTOGRAPHIE_BACKEND_CANONIQUE_EXPOSE.md`

---

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

### ✅ 1️⃣ Création de rubrique — terminé (Sprint 4)

La création est désormais **atomique et en une seule requête** :

- `POST /api/maps/{id}/structure/create/` — crée la Rubrique et le lien MapRubrique en transaction atomique.
- Le parent est transmis via le champ `parent` du payload ; l’ordre est calculé côté backend.
- Le rechargement de la structure se fait via `GET /api/maps/{id}/structure/`.

Les routes legacy (`POST /api/rubriques/` + `POST /api/maps/{id}/rubriques/`) ont été supprimées (Sprint 4 Phase B).

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

### ✅ 3️⃣ Persistance backend de la structure — terminé (Sprint 4)

Les routes canoniques de persistance structurelle sont en place et appelées par le frontend :

| Opération | Route canonique |
|---|---|
| Réordonnancement | `POST /api/maps/{id}/structure/reorder/` — payload `{ orderedIds, parentId }` |
| Indentation | `POST /api/maps/{id}/structure/{map_rubrique_id}/indent/` |
| Désindentation | `POST /api/maps/{id}/structure/{map_rubrique_id}/outdent/` |
| Attachement rubrique existante | `POST /api/maps/{id}/structure/attach/` |

> La route `PATCH /maps/{mapId}/rubriques/{id}/` n'a jamais existé et est définitivement hors scope.

Le rechargement systématique après chaque opération est à la charge du frontend (voir section 4).

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

1. ✅ Stabilisation de la Map (Sprint 1–3)
2. ✅ Création de rubrique via route canonique atomique (Sprint 4)
3. 🔜 Étape 4 — Projection `level → parent / ordre` (drag & drop cross-niveau) ➡️ Permettra le drag & drop multi-niveaux fiable
4. ✅ Persistance backend (reorder / indent / outdent) + routes canoniques (Sprint 4)
5. 🔜 Rechargement systématique côté frontend après chaque opération structurelle
6. 🔜 Ajustements UX optionnels

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
> Implémenter côté frontend le **rechargement systématique de la structure** après chaque opération structurelle (create, indent, outdent, reorder), puis traiter la **projection `level → parent/ordre`** pour le drag & drop cross-niveau.

