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
    - [🧩 Validation des réponses API avec Zod](#-validation-des-réponses-api-avec-zod)
      - [Objectifs](#objectifs)
      - [Implémentation](#implémentation)
      - [Exemple](#exemple)
  - [Structure du code](#structure-du-code)
  - [📝 Backlog / TODO](#-backlog--todo)
    - [Améliorations techniques - AGENT\_IA](#améliorations-techniques---agent_ia)
    - [UI / UX](#ui--ux)
    - [Unification des balises XML autorisées avec les extensions TipTap](#unification-des-balises-xml-autorisées-avec-les-extensions-tiptap)
      - [Problème actuel](#problème-actuel)
      - [Solution envisagée](#solution-envisagée)
      - [Points d’attention](#points-dattention)
    - [Fonctionnalités futures](#fonctionnalités-futures)
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

### 🧩 Validation des réponses API avec Zod

Afin de fiabiliser les échanges entre le frontend (React/TypeScript) et le backend (Django REST), une couche de validation a été ajoutée via **Zod**.  
Les schémas sont centralisés dans `src/types/api.zod.ts`.

#### Objectifs
- Garantir que les données reçues du backend respectent les structures attendues.  
- Détecter rapidement les divergences de contrat (champ manquant, type incorrect).  
- Générer automatiquement les types TypeScript (`z.infer`) à partir des schémas.  
- Uniformiser la gestion des erreurs de parsing et les messages renvoyés au frontend.

#### Implémentation
- Définition des schémas Zod pour chaque payload critique (ex. `ProjectReadSchema`, `CreateProjectResponseSchema`).  
- Les fonctions d’API validées (`createProjectValidated`, `getProjectDetailsValidated`) passent toujours par `parseOrThrow`.  
- En cas de divergence, une exception est levée et interceptée par l’intercepteur Axios → affichage cohérent côté UI.

#### Exemple
```ts
export const ProjectReadSchema = z.object({
  id: z.number(),
  nom: z.string(),
  gamme: z.object({
    id: z.number(),
    nom: z.string(),
  }),
  versions: z.array(z.object({
    id: z.number(),
    numero: z.string(),
  })),
  maps: z.array(z.any()),
});
export type ProjectReadZ = z.infer<typeof ProjectReadSchema>;

// Usage dans l’API client :
const res = await api.get(`/projets/${id}/details/`);
return parseOrThrow(ProjectReadSchema, res.data, "ProjectDetails: payload serveur inattendu");

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

### 📥 Import et intégration de contenus

- **Import CSV des fonctionnalités**  
  - Endpoint : `POST /import/fonctionnalites/`  
  - Lecture d’un fichier CSV (UTF-8, séparateur `;`) avec mapping dynamique des colonnes (`nom`, `code`, `id_fonctionnalite`).  
  - Validation stricte (unicité code/identifiant, longueurs max).  
  - Association directe à un produit (`produit_id`).  
  - Retour d’un rapport détaillé (succès/erreurs par ligne).

- **Import et remplacement de médias (images)**  
  - Endpoint : `POST /import/media/`  
  - Vérification des formats autorisés (`.jpg`, `.jpeg`, `.png`, `.gif`).  
  - Génération d’un nom de fichier basé sur triplet `Produit-Fonctionnalité-Interface`.  
  - Endpoint associé `GET /medias-check-nom/` pour lister les noms existants et proposer automatiquement le prochain disponible.  
  - Support du remplacement d’un média existant (avec conservation du nom pour mise à jour automatique).  
  - Création en base d’un objet `Media` (nom, chemin, produit, type, rubrique nullable).  

- **Génération de gabarits XML DITA**  
  - Endpoint : `POST /api/dita-template/`  
  - Utilisation de `generate_dita_template()` pour produire un squelette XML valide (balises `<title>`, `<prolog>`, `<body>` pré-remplies).  
  - Métadonnées dynamiques injectées : auteur, audience, produit, version active du projet, codes fonctionnalités.  
  - Validation XML intégrée au modèle `Rubrique` (parser `xml.etree.ElementTree`).  

- **Publication DITA-OT (simulation actuelle)**  
  - Endpoint : `POST /api/publier-map/<id>/`  
  - Support multi-formats (`pdf`, `html5`, `xhtml`, `scorm`, `markdown`, `eclipsehelp`).  
  - Fonction `export_map_to_dita()` pour préparer les exports à partir des maps et rubriques.

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
    hooks/
    screens/
      Desktop/
      Login/
      ProductDocSync/
      Settings/
    store/
    types/
    components/ui/
    lib/utils.ts
    utils/csrf.ts
docs/
  CONTEXTE_PROJET.md
  DEPENDENCIES.md
```

---

## 📝 Backlog / TODO

### Améliorations techniques - AGENT_IA
- [ ] Ajouter des exemples d’entrée/sortie pour les endpoints API (payload attendu, réponse).
- [ ] Compléter les tests rapides (`curl`, `fetch`, ou scripts) pour valider les endpoints sensibles.
- [ ] Formaliser un journal de progression simplifié en fin de session (mini changelog).
- [ ] Prioriser explicitement les tâches dans chaque demande (urgent vs amélioration future).

### UI / UX
- [ ] Améliorations visuelles du **MediaPanel** (post-import).
- [ ] Ajout de la **liste des commandes vocales** dans la modale d’aide du CentralEditor.
- [ ] Amélioration ergonomique du **popup suggestion** (fermeture automatique, réanalyse après correction).

### Unification des balises XML autorisées avec les extensions TipTap

📌 **Objectif à traiter ultérieurement** : fiabiliser la gestion des balises XML converties en nodes TipTap en liant dynamiquement les extensions déclarées avec une whitelist XML unique.

#### Problème actuel
- La fonction `parseXmlToTiptap` repose sur une whitelist (`WHITELISTED_TAGS`) définie manuellement.
- Les extensions TipTap utilisées sont déclarées dans `getAllExtensions()` (ex : `DocTag`, `Task`, etc.).
- Il existe un **décalage potentiel** entre ces deux sources si une extension est ajoutée sans mettre à jour la whitelist.

#### Solution envisagée
- Ajouter un champ `xmlTag` dans chaque extension TipTap personnalisée (ex : `DocTag.xmlTag = "doc-tag"`).
- Générer automatiquement la liste des balises autorisées via une fonction `getAllowedXmlTags()` dérivée de `getAllExtensions()`.
- Supprimer la maintenance manuelle de la whitelist `WHITELISTED_TAGS`.

#### Points d’attention
- Certaines extensions ne correspondent pas à des balises XML (ex: `StarterKit`, `Color`, etc.).
- Il faudra ignorer les extensions non-annotées (`xmlTag` absent).
- Cette évolution est sensible et devra être bien testée, notamment sur les documents XML complexes ou importés.

### Fonctionnalités futures
- Pas pour le moment



---

## Historique des évolutions

- **2025-09** : Import CSV des fonctionnalités + import/remplacement médias (images) + génération gabarits XML DITA + publication simulée via DITA-OT.
- **2025‑08** : Centralisation des hooks dictionnaires + `DictionnaireData`.  
- **2025‑07** : Dictée vocale + correcteur orthographique dans l’éditeur.  
- **2025‑06** : Versioning strict (VersionProjet) + clonage.  
- **2025‑05** : Migration frontend en TypeScript.  
- **2024‑12** : Démarrage backend Django + API REST.
