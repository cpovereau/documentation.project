# CONTEXTE PROJET – Documentum

## Sommaire

- [CONTEXTE PROJET – Documentum](#contexte-projet--documentum)
  - [Sommaire](#sommaire)
  - [Présentation du projet](#présentation-du-projet)
  - [Stack technique](#stack-technique)
  - [Architecture backend](#architecture-backend)
    - [Modèles principaux](#modèles-principaux)
    - [Points clés](#points-clés)
  - [Architecture frontend](#architecture-frontend)
    - [Écrans principaux](#écrans-principaux)
    - [Composants partagés](#composants-partagés)
    - [Hooks personnalisés### Hooks personnalisés](#hooks-personnalisés-hooks-personnalisés)
  - [Formats de publication supportés](#formats-de-publication-supportés)
  - [Spécificités métier](#spécificités-métier)
  - [Fonctionnalités avancées](#fonctionnalités-avancées)
  - [🔌 API REST – Documentation interactive](#-api-rest--documentation-interactive)
    - [Accès à la documentation :](#accès-à-la-documentation-)
    - [Export manuel du schéma YAML :](#export-manuel-du-schéma-yaml-)
  - [Historique des évolutions](#historique-des-évolutions)

---

## Présentation du projet

**Nom :** Documentum
**Type :** CCMS (Content Component Management System)
**Objectif :** Créer, gérer, versionner et publier de la documentation technique et pédagogique sur les produits logiciels d’Océalia Informatique.
**Utilisateurs cibles :** Rédacteurs techniques, formateurs, chefs de projet.

---

## Stack technique

* **Backend :** Django (Python) + Django REST Framework
* **Base de données :** PostgreSQL
* **Frontend :** React.js + TypeScript + Tailwind CSS
* **Interopérabilité :** Formats DITA XML, PDF, HTML5, SCORM, WebHelp, Moodle, Chatbot
* **Outils complémentaires :**

  * Docker (LanguageTool pour correction orthographique)
  * lodash.debounce (optimisation UX)
  * Axios (client HTTP avec intercepteurs)

---

## Architecture backend

### Modèles principaux

* **Gamme / Produit** : hiérarchisation des offres.
* **Projet** : entité centrale, associée à des versions, maps et rubriques.
* **VersionProjet** : versionnage avec statut actif/archivé, clonage.
* **Rubrique** : contenu structuré (concept, tâche, référence…), lié à un projet et à une version.
* **Map** : organisation des rubriques en arborescence documentaire.
* **Fonctionnalité, Audience, Tag** : classification et ciblage de contenu.
* **ProfilPublication** : paramètres pour export multi-formats.

### Points clés

* **Versioning strict** (1 seule version active par projet)
* **Clonage de versions** avec duplication des rubriques
* **Archivage automatique** des anciennes versions
* **Publication** : export vers DITA-OT en plusieurs formats
* **Validation XML** et génération de gabarits DITA

---

## Architecture frontend

### Écrans principaux

* **Desktop** : interface principale d’édition (CentralEditor, sidebars, gestion des maps).
* **ProductDocSync** : synchronisation documentation/produit avec sélection produit/version.

### Composants partagés

* `TopBar` : barre de navigation commune aux écrans Desktop et ProductDocSync.
* `VerticalDragHandle` : redimensionnement dynamique vertical.
* `components/ui/` : bibliothèque UI (boutons, inputs, select…)
* `Settings/SettingsScreen` : fenêtre regroupant les paramètres de l'application.
* `Import-Modal` : composant de modale contextuelle unique pour l’import de données. La logique est centralisée via useImportModal + GlobalImportModal.
* `GlobalImportModal` : Composant monté globalement dans App.tsx.
Permet à n’importe quel écran de déclencher un import via openImportModal(...), sans avoir à déclarer manuellement la modale dans chaque écran.

### Hooks personnalisés### Hooks personnalisés
* `useGammes`, `useProduits`, `useFonctionnalites`, `useInterfaces`, `useTags`, `useAudiences` :
  hooks typés dédiés à la récupération des entités dictionnaires depuis l’API REST.
* `useAllDictionnaireData` : centralise les appels aux hooks ci-dessus et retourne les données typées (`DictionnaireData`) avec support `isLoading` et `refetch()`.


* `useSpeechCommands` : dictée vocale + commandes d’édition
* `useGrammarChecker` : vérification orthographique (LanguageTool via Docker)
* `useFindReplaceTipTap` : recherche/remplacement dans TipTap
* `useRubriqueChangeTracker` : détection de modifications non sauvegardées
* `useEditorHistoryTracker` : suivi d’historique local

---

## Formats de publication supportés

* **DITA XML** (source pivot)
* **PDF**
* **HTML5 / XHTML**
* **SCORM** (contenu e-learning)
* **WebHelp**
* **Moodle**
* **Chatbot**

---

## Spécificités métier

* **Gestion multi-audiences**
* **Lien rubrique ↔ fonctionnalité** avec statut documentaire
* **Import CSV** (fonctionnalités)
* **Médias** : gestion des images, vidéos, timecodes
* **Journalisation** : logs d’édition, publication, connexion

---

## Fonctionnalités avancées

* Clonage d’une version projet avec duplication automatique des rubriques actives.
* Import CSV guidé avec mapping des colonnes.
* Dictée vocale intégrée à l’éditeur TipTap avec commandes (gras, italique, nouveau paragraphe…).
* Correction orthographique et grammaticale via LanguageTool (API locale Docker).
* Redimensionnement dynamique des zones d’édition (Desktop et ProductDocSync).

---

## 🔌 API REST – Documentation interactive

L'application expose automatiquement la documentation de son API REST via la librairie `drf-spectacular`.

### Accès à la documentation :

- **Interface Swagger** : [`http://localhost:8000/docs/`](http://localhost:8000/docs/)
- **Schéma OpenAPI brut (JSON)** : [`http://localhost:8000/schema/`](http://localhost:8000/schema/)

### Export manuel du schéma YAML :

Pour exporter la spécification OpenAPI dans un fichier local (`schema.yaml`) :

```bash
python manage.py spectacular --file schema.yaml


## Structure du code

```
backend/
  documentation/
    admin.py
    apps.py
    models.py
    views.py
    serializers.py
    utils.py
    exporters.py
    exceptions.py
frontend/
  src/
    api/
    contexts/
    extensions/
    screens/
      Desktop/
      Login/
      ProductDocSync/
      Settings/
    components/ui/
    lib/utils.ts
```

---

## Historique des évolutions

* **2025-08** : Centralisation des hooks dictionnaires (useGammes, useProduits...) et typage global avec DictionnaireData
* **2025-07** : Intégration dictée vocale + correcteur orthographique
* **2025-06** : Mise en place versioning projet et clonage
* **2025-05** : Migration frontend en TypeScript
* **2024-12** : Début développement backend Django + API REST
