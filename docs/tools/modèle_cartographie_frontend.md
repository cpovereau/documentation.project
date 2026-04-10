# Documentum – Modèle de cartographie frontend

> **Objet** : modèle officiel de cartographie frontend
> 
> **Statut** : référence méthodologique
> 
> **Usage** : analyser l’existant frontend sans le modifier, en vue d’un réalignement avec le backend canonique.

---

## Règles générales

- La cartographie décrit **l’existant tel qu’il est**.
- Aucune proposition de correction ou de refactoring n’est attendue à ce stade.
- Chaque information doit être **factuelle et vérifiable dans le code**.
- Toute ambiguïté ou incertitude doit être **signalée explicitement**.

---

## Cartographie Frontend — `<NomDuComposant>`

---

### 1. Rôle fonctionnel réel

- **Rôle actuel** : responsabilité réelle du composant telle qu’implémentée aujourd’hui.
- **Écart éventuel** : différence entre le rôle observé et le rôle théorique attendu (si identifiable).

---

### 2. Flux métier pris en charge

Lister l’ensemble des flux métier dont le composant est responsable.

| Flux | Déclencheur UI | Hook / Contexte | DTO | Endpoint actuel | Endpoint cible |
|------|----------------|----------------|-----|-----------------|---------------|
| Ex. Ouverture de projet | Clic sur un projet | useProjectStore | ProjectDTO | GET /api/projets/{id}/ | GET /api/projets/{id}/ |

> 💡 L’**endpoint cible** est renseigné à titre de comparaison avec le référentiel backend, sans jugement ni correction.

---

### 3. Appels backend effectués

Pour chaque appel backend direct ou indirect :

- **Endpoint actuel**
- **Responsabilité métier réelle**
- **Conformité avec le référentiel backend** :
  - 🟢 Conforme
  - 🟡 Toléré temporairement
  - 🔴 À supprimer ou refactorer

---

### 4. États et contextes consommés

Lister les états et mécanismes de partage utilisés par le composant :

- Stores Zustand
- Contextes React
- États locaux critiques

Pour chacun, préciser :
- **Propriétaire réel**
- **Rôle fonctionnel**
- **Dépendances principales**

---

### 5. DTO manipulés

- DTO consommés
- DTO produits
- Transformations locales appliquées

Indiquer explicitement :
- DTO polyvalents (utilisés dans plusieurs intentions)
- DTO surchargés
- DTO mal alignés avec l’intention métier

---

### 6. Écarts avec le backend canonique

Lister de manière explicite :

- Appels hors contrat
- Logiques métier frontend compensatoires
- Confusions entre structure et contenu

---

### 7. Risques et impacts

Identifier :

- Impact potentiel si le backend est corrigé ou réaligné
- Sensibilité du composant (central, périphérique, critique)
- Dépendances en cascade avec d’autres composants

---

### 8. Verdict architectural

Sélectionner **un seul verdict** pour le composant :

- 🟢 Conforme
- 🟡 Conforme sous contrainte
- 🔴 À réaligner impérativement

---

> **Ce modèle est volontairement strict.**
> 
> Il vise à produire une cartographie exploitable pour la décision, et non une documentation descriptive.

**Fin du modèle de cartographie frontend**