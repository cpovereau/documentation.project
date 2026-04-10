# 📄 60_TESTING_STRATEGY.md

---

## 🎯 Objectif

Définir la stratégie de test du projet **Documentum** afin de garantir :

* la fiabilité fonctionnelle,
* la stabilité du frontend,
* la cohérence des comportements métier,
* la non-régression lors des évolutions.

---

## 🧠 1. Principe fondamental

> **Tout code doit être vérifiable automatiquement.**

Un développement n’est considéré comme valide que si :

* il compile,
* il respecte les règles de qualité,
* il passe les tests automatisés,
* il ne casse pas les scénarios critiques.

---

## 🧩 2. Typologie des tests

### 2.1 Tests statiques (obligatoires)

Objectif : détecter les erreurs avant exécution.

#### Backend

* `ruff check .`
* `python manage.py check`

#### Frontend

* `npm run lint`
* `npm run type-check`

---

### 2.2 Tests unitaires

Objectif : valider les briques isolées.

#### Backend

* logique métier (services, utils)
* serializers
* permissions

#### Frontend

* hooks (ex : `useRubriqueChangeTracker`)
* fonctions utilitaires (`utils.ts`)
* transformations XML ⇄ TipTap

---

### 2.3 Tests d’intégration

Objectif : valider les interactions entre composants.

Exemples :

* CentralEditor ↔ XmlBufferStore
* LeftSidebar ↔ CentralEditor (sélection + guard)
* appels API via client Axios

---

### 2.4 Tests E2E (Playwright) 🔴 PRIORITAIRES

Objectif : simuler un utilisateur réel.

Ces tests sont **la référence pour valider le frontend**.

#### Cas critiques Documentum

* ouverture d’un projet
* sélection d’une rubrique
* modification du contenu
* passage en statut `dirty`
* blocage navigation si non sauvegardé
* sauvegarde → statut `saved`
* import média
* ProductDocSync (sélection + actions)

---

## 🧱 3. Règles fondamentales

### 3.1 Aucun code sans test critique

Toute fonctionnalité impactant :

* le buffer
* la navigation
* la sauvegarde
* la structure documentaire

➡️ doit avoir au moins **1 test E2E**

---

### 3.2 Le frontend est validé par le comportement, pas par le code

Lire le code ne suffit pas.

👉 Seuls les tests Playwright font foi sur :

* les interactions UI
* les états visuels
* les enchaînements utilisateur

---

### 3.3 Interdiction des régressions silencieuses

Tout bug corrigé doit :

* être reproduit en test
* être couvert pour éviter son retour

---

### 3.4 Les zones à risque sont obligatoirement testées

Référence : 

Zones critiques :

* buffer XML
* synchronisation frontend/backend
* versioning
* états globaux
* composants partagés

---

### 3.5 Les tests sont exécutés automatiquement

Tous les tests sont exécutés via CI (CircleCI) :

* à chaque commit
* à chaque Pull Request

---

## ⚙️ 4. Pipeline de validation

### Étapes obligatoires

1. Qualité code
2. Tests backend
3. Tests frontend statiques
4. Tests E2E Playwright
5. Artefacts (screenshots, vidéos)

---

## 📸 5. Exploitation des erreurs

En cas d’échec :

* consulter les logs CI
* analyser :

  * screenshots
  * vidéos
  * traces Playwright

👉 Les artefacts sont la source principale d’analyse.

---

## 🤖 6. Rôle de l’IA (Claude Code / ChatGPT)

Les outils IA peuvent :

* écrire du code
* écrire des tests
* corriger des erreurs

Mais :

> **Ils s’appuient sur les résultats des tests pour être fiables.**

Sans tests → corrections aléatoires
Avec tests → corrections robustes

---

## 🚫 7. Patterns interdits

Référence : 

* code non testé sur flux critique
* validation “à la main uniquement”
* correction sans ajout de test
* test E2E instable ignoré

---

## ✅ 8. Définition de “Done”

Une fonctionnalité est terminée si :

* code propre
* tests passent
* aucun scénario critique cassé
* comportement validé en E2E

---

# ✔️ Fin du document
