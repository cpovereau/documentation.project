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

### 5.2 Décisions traçables
Toute décision structurante doit être :
- documentée,
- datée,
- justifiée,
dans le `decision-log.md`.

L’absence de trace est considérée comme une dette de conception.

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
