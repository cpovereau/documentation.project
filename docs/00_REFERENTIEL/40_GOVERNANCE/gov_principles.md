# Documentum – Principles

Ce document définit les **principes invariants** du projet Documentum.

Ils servent de :
- boussole de conception,
- garde-fous techniques,
- référence en cas de doute ou de divergence.

Ces principes sont **non négociables**, sauf décision explicite consignée dans le `decision-log.md`.

---

## 1. Principes généraux

### 1.1 Cohérence avant rapidité
Toute décision doit privilégier la cohérence globale du système plutôt qu’un gain ponctuel de vitesse ou de simplicité locale.

Une solution rapide mais incohérente est considérée comme une dette.

---

### 1.2 Centralisation systématique
Toute logique destinée à être réutilisée ou susceptible d’évoluer doit être centralisée.

Cela inclut notamment :
- appels API,
- logique métier,
- règles de validation,
- comportements complexes de l’éditeur.

La duplication est un signal d’alerte.

---

### 1.3 Séparation claire des responsabilités
- Les composants UI affichent et délèguent.
- Les hooks portent la logique.
- Les services gèrent les interactions externes.

Un composant ne doit jamais devenir un point d’accumulation métier.

---

## 2. Principes Frontend (React / TypeScript)

### 2.1 Appels API
Tous les appels API passent par le client centralisé (`apiClient` ou équivalent).

Aucun appel direct (fetch, axios brut) n’est autorisé dans :
- les composants,
- les hooks métier,
- les modales.

---

### 2.2 Gestion des erreurs
Les erreurs API sont :
- normalisées,
- interceptées globalement,
- affichées de manière homogène.

Toute nouvelle fonctionnalité doit respecter le format d’erreur standardisé défini côté backend et frontend.

---

### 2.3 États globaux vs locaux
- Un état global ne doit jamais être dupliqué en local.
- Un état local ne doit pas devenir source de vérité globale.

Toute ambiguïté sur la “source de vérité” doit être résolue explicitement.

---

### 2.4 Performance et UX
Les comportements asynchrones récurrents (analyse, saisie, vérification) doivent intégrer :
- un mécanisme de `debounce`,
- une réflexion UX avant toute optimisation prématurée.

La performance ne doit jamais se faire au détriment de la lisibilité ou du confort utilisateur.

---

## 3. Principes Éditeur (TipTap / contenu)

### 3.1 Centralisation des extensions
Toutes les extensions personnalisées TipTap sont :
- exportées de manière nommée,
- centralisées dans un point d’entrée unique.

Aucune extension “isolée” ou locale n’est acceptée.

---

### 3.2 Respect des structures DITA
Les structures documentaires ne sont pas décoratives.

Toute manipulation de contenu doit :
- respecter la structure DITA définie,
- anticiper les contraintes d’export (PDF, XML, SCORM, etc.).

---

### 3.3 Buffer de rubrique
Le contenu en cours d’édition est considéré comme **potentiellement non sauvegardé**.

Aucune action (navigation, changement de contexte, reset) ne doit :
- détruire le buffer,
- ou le modifier silencieusement,
sans contrôle explicite de son statut.

---

## 4. Principes UX

### 4.1 Décisions UX assumées
Les décisions UX validées (ex. abandon de l’édition inline) sont considérées comme définitives tant qu’elles ne sont pas remises en question formellement.

Revenir en arrière sans analyse est interdit.

---

### 4.2 Symétrie des écrans
Les écrans `Desktop` et `ProductDocSync` doivent rester conceptuellement cohérents.

Toute évolution sur l’un doit être évaluée sur l’autre :
- structure,
- comportement,
- logique de redimensionnement,
- composants partagés.

---

## 5. Principes d’évolution

### 5.1 Anticipation backend
Même en phase de mock ou de maquette :
- les structures de données doivent être réalistes,
- les identifiants doivent être conservés,
- les effets conditionnels doivent être préparés.

Une maquette ne doit jamais bloquer l’intégration backend future.

---

## 5.2 Décisions traçables (renforcé)

Toute évolution du système (fonctionnelle, technique, UX ou architecturale) doit obligatoirement être accompagnée d’une mise à jour documentaire.

Cette règle est **bloquante** :
👉 Une évolution non documentée est considérée comme invalide.

---

### 5.2.1 Moment d’application (obligatoire)

La mise à jour documentaire intervient **immédiatement après la décision et avant l’implémentation**.

Cycle imposé :

Analyse  
→ Décision  
→ 🔴 Mise à jour documentaire (obligatoire)  
→ Implémentation  
→ Vérification

Aucune implémentation ne doit commencer sans mise à jour préalable du référentiel.

---

### 5.2.2 Périmètre de mise à jour

Toute évolution doit entraîner la mise à jour explicite des documents concernés :

- Modèle métier → `10_MODELE_METIER_DOCUMENTUM.md`
- Versioning → `10_VERSIONING_DOCUMENTAIRE.md`
- Backend → référentiel backend canonique
- Frontend → cartographies et architecture frontend
- Flux métier → documents de flux (édition, publication…)
- Décisions structurantes → `decision-log.md`

👉 Aucun impact documentaire ne doit rester implicite.

---

### 5.2.3 Gestion de l’index documentaire

Le référentiel documentaire repose sur un index structuré.

Règles obligatoires :

- Toute création de document :
  - doit être ajoutée immédiatement dans l’index
  - doit être positionnée dans la bonne catégorie

- Toute modification de périmètre (backend, frontend, architecture, métier) :
  - doit être répercutée dans les entrées correspondantes de l’index

👉 Un document non indexé est considéré comme inexistant.

---

### 5.2.4 Traçabilité des décisions

Toute décision structurante doit être enregistrée dans `decision-log.md` avec :

- date
- contexte
- décision
- justification
- conséquences

👉 Une décision non tracée est considérée comme provisoire.

---

### 5.2.5 Formalisation obligatoire dans les échanges (IA incluse)

Toute demande impliquant une évolution doit inclure un bloc :

## Impact documentaire

- Documents à créer / modifier
- Type de modification (création, mise à jour, correction, suppression)
- Priorité

Les réponses produites (IA ou humain) doivent systématiquement renseigner ce bloc.

---

### 5.2.6 Dette documentaire (interdite mais traçable)

Si une mise à jour documentaire ne peut pas être faite immédiatement :

- elle doit être explicitement tracée
- elle doit être ajoutée à un suivi de dette documentaire

👉 Toute dette non tracée est interdite.

---

### 5.2.7 Règle de validation finale

Une évolution est considérée comme terminée uniquement si :

- le code est implémenté
- les tests sont validés
- la documentation est à jour
- l’index est cohérent

👉 Sinon, l’évolution est incomplète.

---

## 6. Esprit du projet

Documentum est conçu comme :
- un outil robuste,
- évolutif,
- maîtrisé techniquement.

La simplicité apparente ne doit jamais masquer une complexité non maîtrisée.

Ce projet privilégie :
- la clarté,
- la cohérence,
- la pérennité.
