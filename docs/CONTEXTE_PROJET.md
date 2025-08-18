# CONTEXTE PROJET – Documentum

## Sommaire

- [CONTEXTE PROJET – Documentum](#contexte-projet--documentum)
  - [Sommaire](#sommaire)
  - [Présentation du projet](#présentation-du-projet)
  - [Stack technique](#stack-technique)
  - [Architecture backend](#architecture-backend)
    - [Modèles principaux](#modèles-principaux)
    - [Points clés](#points-clés)
    - [Utilitaires Django](#utilitaires-django)
  - [Architecture frontend](#architecture-frontend)
    - [Écrans principaux](#écrans-principaux)
    - [Composants partagés](#composants-partagés)
    - [Hooks personnalisés](#hooks-personnalisés)
    - [Extensions TipTap](#extensions-tiptap)
    - [AuthContext](#authcontext)
  - [Types globaux (frontend)](#types-globaux-frontend)
  - [Types locaux (frontend)](#types-locaux-frontend)
  - [Formats de publication supportés](#formats-de-publication-supportés)
  - [Spécificités métier](#spécificités-métier)
  - [Fonctionnalités avancées](#fonctionnalités-avancées)
  - [🔌 API REST – Documentation interactive](#-api-rest--documentation-interactive)
    - [Accès à la documentation :](#accès-à-la-documentation-)
    - [Export manuel du schéma YAML :](#export-manuel-du-schéma-yaml-)
  - [Structure du code](#structure-du-code)
  - [Historique des évolutions](#historique-des-évolutions)

---

## Présentation du projet

**Nom :** Documentum  
**Type :** CCMS (Content Component Management System)  
**Objectif :** Créer, gérer, versionner et publier de la documentation technique et pédagogique liée aux produits logiciels d’Océalia Informatique.  
**Utilisateurs cibles :** Rédacteurs techniques, formateurs, chefs de projet.

---

## Stack technique

- **Backend :** Django (Python) + Django REST Framework  
- **Base de données :** PostgreSQL  
- **Frontend :** React.js + TypeScript + Tailwind CSS  
- **Interopérabilité :** DITA XML, PDF, HTML5, SCORM, WebHelp, Moodle, Chatbot  
- **Outils complémentaires :** Docker (LanguageTool), lodash.debounce, Axios, TipTap (ProseMirror), Zustand

---

## Architecture backend

### Modèles principaux

- **Gamme / Produit** : hiérarchisation des offres.  
- **Projet** : entité centrale, associée à des versions, maps et rubriques.  
- **VersionProjet** : versionnage avec statut actif/archivé, clonage.  
- **Rubrique** : contenu structuré (concept, tâche, référence…), lié à un projet et à une version.  
- **Map** : organisation des rubriques en arborescence documentaire.  
- **Fonctionnalité, Audience, Tag** : classification et ciblage de contenu.  
- **ProfilPublication** : paramètres pour export multi-formats.

### Points clés

- **Versioning strict** – 1 seule version active par projet.  
- **Clonage de versions** – duplication complète d’une version existante.  
- **Archivage automatique** – passage des anciennes versions en “archivées”.  
- **Publication multi-formats** – export via DITA‑OT (PDF, HTML5, SCORM…).  
- **Validation XML** et **gabarits DITA** lors de la création/édition de rubriques.

### Utilitaires Django

- `get_active_version(projet)` – Retourne la **version active** du projet.  
- `clone_version(version_source)` – Crée une **nouvelle version** et copie les **rubriques actives** de la source.  
- `archive_old_versions(projet)` – Passe les versions non actives en **archivées**.  
- `generate_dita_template(type_dita, auteur, titre, …)` – Génère un **squelette XML DITA** (title, prolog, body).

---

## Architecture frontend

### Écrans principaux

- **Desktop** : interface principale d’édition (éditeur central, arborescence de map, sidebars).  
- **ProductDocSync** : synchronisation documentation/produit (sélection produit/version, couverture documentaire).

### Composants partagés

- `TopBar` : barre de navigation commune Desktop/ProductDocSync.  
- `VerticalDragHandle` : redimensionnement vertical des panneaux.  
- `components/ui/` : bibliothèque UI générique (boutons, inputs, selects).  
- `SettingsScreen` : paramètres de l’application (profils, thèmes, etc.).  
- `GlobalImportModal` : modale d’import centralisée, déclenchée depuis n’importe quel écran.

### Hooks personnalisés

**Données (dictionnaires)**  
- `useGammes`, `useProduits`, `useFonctionnalites`, `useInterfaces`, `useTags`, `useAudiences` – Récupération via API des listes de référence + état de chargement.  
- `useAllDictionnaireData` – Agrégateur renvoyant un objet **DictionnaireData** et un `refetch()` global.

**Édition**  
- `useSpeechCommands` – **Dictée vocale** et **commandes orales** (gras, nouveau paragraphe, etc.).  
- `useGrammarChecker` – **Vérification orthographique/grammaticale** via LanguageTool (Docker).  
- `useFindReplaceTipTap` – **Recherche/Remplacement** dans l’éditeur TipTap.  
- `useRubriqueChangeTracker` – Détection de **modifications non sauvegardées**.  
- `useEditorHistoryTracker` – Historique local des **actions d’édition** (log, clear, affichage).

### Extensions TipTap

- **Blocs DITA** : `Title`, `Shortdesc`, `Body`, `Prolog`, `Note`  
- **Liens & références** : `CrossReference`  
- **Médias** : `Image`, `Figure`, `Video`  
- **Glossaire** : `Glossentry`  
- **Exemple** : `Example`  
- **Code** : `Code`  
- **Pédagogie** : `Question`, `Answer`  
- **Structures DITA** : `Concept`, `Conbody`, `Reference`, `Refbody`, `Section`, `Task`, `Taskbody`, `Steps`, `Step`  
- **DITA Learning** : `LearningAssessment`, `LearningBody`, `LearningContent`, `LearningContentBody`, `LearningSummary`  
- **Tableaux** : `CustomTable`, `CustomTableRow`, `CustomTableHeader`, `CustomTableCell`  
- **Spécifiques Documentum** : `GrammarHighlight`, `StatusMarker`, `DocTag`, `RubriqueMetadata`, `InlineVariable`

### AuthContext

Contexte React centralisant la **session utilisateur** :  
- Stocke le **token** (et son expiration).  
- Ajoute l’entête `Authorization: Bearer <token>` via un **intercepteur Axios**.  
- **Déconnexion automatique** en cas de 401 (nettoyage token + redirection vers Login).  
- **Protection de routes** : accès aux écrans réservé aux utilisateurs authentifiés.

---

## Types globaux (frontend)

- **Gamme, Produit, Fonctionnalite, InterfaceUtilisateur, Tag, Audience** – Interfaces de base utilisées dans tout le front.  
- **`DictionnaireData`** – Agrégat `{ gammes, produits, fonctionnalites, interfaces, tags, audiences }`.  
- **Rubrique** – Représentation front d’une rubrique (id, titre, type, contenu, dates, audience…).  
- **Map** – Carte documentaire (id, nom, projet, master?, enfants…).  
- **VersionProjet** – Version (numéro, dates, `is_active`, `is_archived`).

## Types locaux (frontend)

- **`ProductOption`** – Option de sélection de produit pour *ProductDocSync*.  
- **`VersionOption`** – Option de sélection de version (id, libellé, active?).  
- **`RubriquePayload`** – Charge utile envoyée à l’API pour créer/éditer une rubrique.

---

## Formats de publication supportés

- **DITA XML** (source pivot)  
- **PDF**  
- **HTML5 / XHTML**  
- **SCORM** (e‑learning)  
- **WebHelp**  
- **Moodle**  
- **Chatbot**

---

## Spécificités métier

- **Multi‑audiences** (filtrage/variantes de contenu).  
- **Lien rubrique ↔ fonctionnalité** avec statut documentaire.  
- **Import CSV** (fonctionnalités produit).  
- **Médias enrichis** (images, vidéos, timecodes).  
- **Journalisation** (modifs de rubriques, publications, connexions).

---

## Fonctionnalités avancées

- **Clonage de version de projet** (duplication des rubriques actives).  
- **Import CSV guidé** (mapping des colonnes).  
- **Dictée vocale intégrée** (commandes d’édition).  
- **Correction orthographique & grammaticale** (LanguageTool local).  
- **UI redimensionnable** (panneaux d’édition).

---

## 🔌 API REST – Documentation interactive

L’API est documentée via **drf‑spectacular** (OpenAPI 3).

### Accès à la documentation :
- **Swagger UI** : `http://localhost:8000/docs/`  
- **Schéma OpenAPI JSON** : `http://localhost:8000/schema/`

### Export manuel du schéma YAML :
```bash
python manage.py spectacular --file schema.yaml
```

---

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
docs/
  CONTEXTE_PROJET.md
```

---

## Historique des évolutions

- **2025‑08** : Centralisation des hooks dictionnaires + `DictionnaireData`.  
- **2025‑07** : Dictée vocale + correcteur orthographique dans l’éditeur.  
- **2025‑06** : Versioning strict (VersionProjet) + clonage.  
- **2025‑05** : Migration frontend en TypeScript.  
- **2024‑12** : Démarrage backend Django + API REST.
