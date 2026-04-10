# Documentum – Modèle d’analyse technique frontend

> **Objet** : modèle officiel d’analyse technique frontend
>
> **Statut** : référence méthodologique
>
> **Usage** : analyser en profondeur l’implémentation technique d’un composant frontend afin de :
>
> * préparer une refonte,
> * identifier les dépendances réelles,
> * sécuriser les évolutions backend/frontend.

---

## Règles générales

* L’analyse décrit **l’implémentation réelle**, sans interprétation fonctionnelle.
* Les informations doivent être **précises, techniques et vérifiables dans le code**.
* Les responsabilités doivent être **attribuées clairement** (composant, hook, store, service).
* Les écarts doivent être **factuels**, sans proposition de correction.

---

## Analyse technique — `<NomDuComposant>`

---

### 1. Structure du composant

* Fichier : `<path>`
* Type :

  * composant UI
  * orchestrateur
  * container
* Sous-composants utilisés :

  * liste explicite
* Niveau de complexité estimé :

  * faible / moyen / élevé

---

### 2. Dépendances directes

#### Hooks utilisés

Lister tous les hooks :

* hooks métier
* hooks techniques
* hooks custom

Pour chacun :

* rôle
* responsabilité

---

#### Stores (Zustand / autres)

Lister :

* nom du store
* méthodes utilisées
* rôle réel dans le composant

---

#### Services / API

Lister :

* appels API utilisés (via hook ou service)
* endpoints concernés
* type d’appel (GET, POST, PUT…)

---

### 3. Gestion des données

#### Données entrantes

* props
* données issues des stores
* données issues des hooks

---

#### Données sortantes

* callbacks vers composants parents
* mutations de store
* appels API

---

#### Transformations

* mapping DTO → UI
* transformations locales
* normalisation éventuelle

---

### 4. Cycle de vie et synchronisation

Lister les `useEffect` et logiques associées :

* déclencheur
* effet produit
* dépendances

Identifier :

* effets critiques
* effets potentiellement instables
* dépendances implicites

---

### 5. Gestion des états

#### États locaux

Lister tous les `useState` :

* rôle
* criticité

---

#### États dérivés

* calculs à partir d’autres états
* logique conditionnelle

---

#### Source de vérité

Identifier clairement :

* où se trouve la source de vérité réelle
* si elle est unique ou dupliquée

---

### 6. Points critiques techniques

Identifier :

* zones de complexité élevée
* dépendances fortes
* logique difficile à maintenir

Exemples :

* synchronisation multi-sources
* effets imbriqués
* logique conditionnelle lourde

---

### 7. Couplage et dépendances

Analyser :

* dépendance à d’autres composants
* dépendance aux hooks
* dépendance aux structures backend

Identifier :

* couplage fort
* couplage implicite

---

### 8. Risques techniques

Lister explicitement :

* risques de bug
* risques de régression
* risques de désynchronisation
* risques de performance

---

### 9. Dette technique

Identifier :

* code dupliqué
* logique non centralisée
* incohérences
* zones non testables

---

### 10. Observations générales

* lisibilité du composant
* maintenabilité
* extensibilité

---

> **Ce modèle complète la cartographie.**
>
> * La cartographie répond à : *"Que fait ce composant ?"*
> * L’analyse technique répond à : *"Comment il le fait réellement ?"*

**Fin du modèle d’analyse technique frontend**
