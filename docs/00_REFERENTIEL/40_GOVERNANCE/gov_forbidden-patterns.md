# Documentum – Forbidden Patterns

Ce document liste les **patterns explicitement interdits** dans le projet Documentum.

Ils correspondent à :
- des pratiques abandonnées,
- des raccourcis techniques identifiés comme dangereux,
- des choix déjà évalués et rejetés.

Tout retour vers l’un de ces patterns est considéré comme :
- une régression,
- ou une dette technique volontaire,
et doit faire l’objet d’une décision formelle documentée.

---

## 1. Patterns d’architecture

### 1.1 Logique métier dans les composants UI
Il est interdit d’implémenter de la logique métier directement dans :
- les composants React,
- les modales,
- les sidebars.

Les composants doivent :
- afficher,
- déclencher,
- déléguer.

Toute logique complexe doit être portée par un hook ou un service dédié.

---

### 1.2 Appels API non centralisés
Il est interdit d’effectuer des appels API :
- via `fetch`,
- via une instance axios locale,
- ou directement dans un composant.

Tous les appels passent obligatoirement par le client centralisé (`apiClient`).

---

### 1.3 Duplication d’état global
Il est interdit de :
- dupliquer un état global dans un state local,
- maintenir deux sources de vérité pour une même donnée.

Toute donnée globale doit avoir une source unique clairement identifiée.

---

## 2. Patterns Frontend / UX

### 2.1 Édition inline dans les Paramètres
L’édition inline dans les écrans de Paramètres est interdite.

Raisons principales :
- complexité UX,
- difficulté de validation,
- incohérence avec le backend.

Les ajouts et modifications se font exclusivement via des modales dédiées.

---

### 2.2 Bypass des hooks existants
Il est interdit de :
- contourner un hook existant,
- réimplémenter une logique “pour aller plus vite”,
- dupliquer un comportement déjà centralisé.

Tout besoin nouveau doit :
- étendre le hook existant,
- ou justifier la création d’un nouveau hook.

---

### 2.3 Comportements implicites non signalés
Tout comportement ayant un impact utilisateur doit être :
- explicite,
- visible,
- compréhensible.

Sont interdits :
- les sauvegardes silencieuses,
- les resets implicites,
- les modifications automatiques non signalées.

---

## 3. Patterns Éditeur (TipTap / contenu)

### 3.1 Manipulation directe du DOM
Toute manipulation directe du DOM de l’éditeur est interdite.

Les interactions avec le contenu doivent passer par :
- l’API TipTap,
- les extensions dédiées,
- les transactions contrôlées.

---

### 3.2 Extensions locales ou non référencées
Il est interdit de créer une extension TipTap :
- non exportée de manière nommée,
- non référencée dans le point d’entrée centralisé,
- utilisée uniquement dans un écran spécifique.

Toute extension est considérée comme globale par défaut.

---

### 3.3 Altération silencieuse de la structure documentaire
Il est interdit de :
- modifier la structure DITA sans action explicite,
- supprimer ou déplacer des balises sans contrôle utilisateur,
- corriger automatiquement un contenu sans visibilité.

Toute transformation structurelle doit être :
- volontaire,
- traçable,
- compréhensible.

---

## 4. Patterns de gestion des données

### 4.1 Réinitialisation du buffer sans contrôle
Il est interdit de :
- réinitialiser un buffer de rubrique,
- écraser un contenu en cours,
sans vérification explicite de son statut (`saved`, `modified`, etc.).

Toute perte de contenu implicite est inacceptable.

---

### 4.2 Génération de noms non déterministe
Il est interdit de :
- générer des noms de fichiers aléatoires,
- ajouter des suffixes arbitraires,
- casser la nomenclature définie.

La génération des noms doit être :
- déterministe,
- conforme aux règles de nomenclature,
- validée côté backend.

---

## 5. Patterns de conception

### 5.1 Décisions non documentées
Toute décision structurante non documentée est considérée comme invalide.

Une décision non traçable :
- ne fait pas autorité,
- peut être remise en cause à tout moment.

---

### 5.2 Solutions temporaires devenues permanentes
Il est interdit de laisser une solution “temporaire” sans :
- date,
- condition de sortie,
- traçabilité.

Le temporaire non cadré devient une dette.

---

## 6. Règle finale

Tout pattern interdit peut être remis en question **uniquement** si :
- le contexte a fondamentalement changé,
- une analyse est menée,
- une décision est consignée dans le `decision-log.md`.

En l’absence de cela, le pattern reste interdit.
