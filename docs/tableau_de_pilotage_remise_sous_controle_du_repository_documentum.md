# 🧭 Tableau de pilotage – Remise sous contrôle du repository Documentum

---

## 🎯 Objectif du sprint
Remettre le dépôt Git dans un état :
- sécurisé
- cohérent
- documenté
- aligné avec l’état réel du projet

---

## 📊 1. Inventaire des éléments non actualisés

| ID | Fichier                     | Type | Action    | Statut  |
| -- | --------------------------- | ---- | --------- | ------- |
| 1  | docs/00_REFERENTIEL/*       | C    | PUSH      |         |
| 2  | docs/02_ANALYSE/archive/*   | E    | garder    |         |
| 3  | deps_installed.json         | D    | gitignore |         |
| 4  | dependencies.md             | C    | PUSH      |         |
| 5  | documentation/views.py      | A    | PUSH      |         |
| 6  | documentum_react_frontend/* | B    | PUSH      |         |
| 7  | ancien CONTEXTE_PROJET.md   | E    | supprimer |         |
| 8  | BACKEND_GAP_ANALYSIS.md     | C    | PUSH      |         |


### 🧩 Légende des types
- **A** : Backend à conserver
- **B** : Frontend à conserver
- **C** : Documentation à pousser
- **D** : Artefacts / générés / locaux
- **E** : Obsolète / à archiver

---

## 🔐 2. Sécurisation du dépôt

| Élément | Présent ? | Doit être versionné ? | Action | Fait |
|--------|----------|----------------------|--------|------|
| .env |          | ❌ | ajouter au .gitignore |      |
| Logs |          | ❌ | ignorer + supprimer tracking |      |
| Dumps DB |          | ❌ | ignorer |      |
| Fichiers tests générés |          | ❌ | ignorer |      |
| Médias temporaires |          | ❌ | ignorer |      |
| Config locales |          | ❌ | ignorer |      |

---

## 📚 3. Structuration de la documentation

| Document | Type (Référence / Opérationnel / Historique / Archive) | Action | Statut |
|----------|--------------------------------------------------------|--------|--------|
| CONTEXTE_PROJET.md | | | |
| DEPENDENCIES.md | | | |
| MODELE_METIER | | | |
| CENTRAL_EDITOR | | | |
| DECISION_LOG | | | |
| RISK_AREAS | | | |
| PRINCIPLES | | | |
| BACKEND_CANONIQUE | | | |

---

## ⚙️ 4. Alignement des dépendances

| Élément | État actuel | État documenté | Décision | Action | Statut |
|--------|------------|----------------|----------|--------|--------|
| Django |            |                |          |        |        |
| DRF |            |                |          |        |        |
| Frontend deps |            |                |          |        |        |

---

## 🧾 5. État réel du projet

### ✔️ Stabilisé
- 

### ⚠️ Fonctionnel mais non raccordé
- 

### 🔧 Backend remanié
- 

### 🔌 À raccorder
- 

---

## 🔗 6. Cartographie Frontend ↔ Backend

| Flux | Front actuel | Backend cible | Écart | Priorité | Statut |
|------|-------------|--------------|-------|----------|--------|
| Chargement projet | | | | | |
| Structure map | | | | | |
| Lecture rubrique | | | | | |
| Sauvegarde rubrique | | | | | |

---

## 📦 7. Plan de commits

| Commit | Contenu | Objectif | Statut |
|--------|--------|----------|--------|
| Commit 1 | Sécurité / .gitignore | sécuriser dépôt | |
| Commit 2 | Documentation | poser référentiel | |
| Commit 3 | Dépendances | cohérence installation | |
| Commit 4 | Nettoyage / archive | lisibilité repo | |

---

## 🚀 8. Préparation sprint raccordement

| Étape | Description | Priorité | Statut |
|------|------------|----------|--------|
| 1 | Dictionnaires | Haute | |
| 2 | Projets | Haute | |
| 3 | Maps | Haute | |
| 4 | Rubriques lecture | Haute | |
| 5 | Rubriques sauvegarde | Haute | |
| 6 | Actions structurelles | Moyenne | |
| 7 | Publication | Basse | |

---

## 🧠 9. Suivi des décisions

| Date | Sujet | Décision | Impact | Documenté ? |
|------|------|----------|--------|-------------|
|      |      |          |        |             |

---

## ✅ 10. Bilan de fin de sprint

- Dépôt sécurisé : 
- Documentation alignée : 
- Backend / Front clarifiés : 
- Écarts identifiés : 
- Prochaine étape : 

---

# ✔️ Fin du tableau de pilotage
