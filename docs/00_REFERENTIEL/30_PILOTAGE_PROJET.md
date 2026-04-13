# 🧭 30 — Pilotage du projet Documentum

---

# 🎯 Objectif

Ce document permet de :

- piloter les évolutions du projet
- prioriser les travaux
- suivre l’avancement
- aligner documentation et développement

---

# 🔒 Règle fondamentale

👉 Ce document ne définit pas la vérité.

Il organise :
- ce qui doit être fait
- dans quel ordre
- avec quel niveau de priorité

---

# 🧩 1. Vision globale

## 🎯 Objectif actuel

Stabiliser et aligner :
- le backend
- le frontend
- le modèle métier
- les flux critiques

---

## 📌 Axes principaux

1. Alignement Backend / Référentiel
2. Stabilisation CentralEditor
3. Nettoyage Frontend (architecture)
4. Finalisation des flux métier
5. Préparation publication réelle

---

# 📊 2. Chantiers actifs

---

## 🔧 Chantier 1 — Backend réalignement

### Objectif
Aligner le backend réel avec le référentiel canonique

### Documents liés
- documentum_referentiel_backend_canonique.md
- BACKEND_REALIGNMENT_SPRINT_*.md

### Avancées (Sprints 1–5, terminés le 2026-04-10)
- **Sprint 1** : uniformisation des erreurs via `custom_exception_handler`, protection `DELETE /rubriques/{id}/`, route canonique `POST /api/maps/{id}/structure/attach/`
- **Sprint 2** : service `create_project()` atomique, `ProjetViewSet.create()` pleinement opérationnel
- **Sprint 3** : suppression du code mort (`CreateMapView`, `map_rubriques_view`), sécurisation des vues legacy
- **Sprint 4** : migration frontend vers routes canoniques (Phase A) + suppression complète des routes legacy (Phase B)
- **Sprint 5** : logs métier propres sur tous les flux structurels, endpoint `/health/`, nettoyage sérialiseurs morts

### Statut
✅ TERMINÉ

---

## Chantier 2 — Intégration frontend du backend canonique

### Objectif :
- brancher réellement le frontend sur les routes et contrats canoniques
- supprimer les restes de logique transitoire
- fiabiliser les reloads et la source de vérité backend

### Statut :
EN COURS — Audit réalisé le 2026-04-10

### Résultats de l'audit (2026-04-10)

**Points déjà conformes (Sprint 4 backend migré dans le code) :**
- `POST /api/maps/{id}/structure/create/` — création rubrique ✅
- `POST /api/maps/{id}/structure/{mr_id}/indent/` ✅
- `POST /api/maps/{id}/structure/{mr_id}/outdent/` ✅
- `POST /api/maps/{id}/structure/reorder/` ✅
- `POST /api/projets/` — création projet ✅
- `GET /api/projets/{id}/structure/` — chargement structure ✅

**Écarts critiques restants :**

| # | Écart | Composant | Risque |
|---|-------|-----------|--------|
| ~~C1~~ | ~~`Desktop.mapItems` jamais alimenté → `rubriqueId=null` → CentralEditor mort~~ | ~~Desktop + LeftSidebar~~ | ✅ Résolu Lot 1 |
| ~~C2~~ | ~~`LeftSidebar.selectedMapItemId` local toujours null → garde-fou inactif~~ | ~~LeftSidebar~~ | ✅ Résolu Lot 1 |
| ~~C3~~ | ~~`listMapRubriques` appelle `/api/maps/{id}/rubriques/` (legacy supprimé)~~ | ~~`src/api/maps.ts`~~ | ✅ Résolu Lot 2 |
| ~~C4~~ | ~~Rename rubrique : local uniquement, non persisté~~ | ~~LeftSidebar~~ | ✅ Résolu Lot 3 |
| C5 | Delete rubrique : hors scope v1 (pas d'endpoint détachement) | LeftSidebar | Toast info |
| C6 | Clone rubrique : hors scope v1 (pas d'endpoint) | LeftSidebar | Toast info |
| ~~C7~~ | ~~Delete projet : local uniquement~~ | ~~LeftSidebar~~ | ✅ Résolu Lot 3 |
| C8 | Clone projet : hors scope v1 (pas d'endpoint) | LeftSidebar | Toast info |
| ~~C9~~ | ~~Publication/export : non implémenté (console.log)~~ | ~~ProjectModule~~ | ✅ Résolu Lot 5 |
| ~~C10~~ | ~~`getProjectDetailsValidated` : préfixe `/api/` manquant → 404~~ | ~~apiClient.ts~~ | ✅ Vérifié Lot 4 — fausse alerte, code correct |
| ~~C11~~ | ~~Double lecture `selectedProjectId` + logs debug prod~~ | ~~LeftSidebar~~ | ✅ Vérifié Lot 4 — pas de double lecture ; log debug supprimé |

### Découpage en lots

**Lot 1 — Fiabilisation de la chaîne de sélection ✅ TERMINÉ 2026-04-10**
- Créé `src/store/selectionStore.ts` : store Zustand dédié (`selectedMapItemId`, `selectedRubriqueId`, `setSelection`, `clearSelection`)
- Corrigé `LeftSidebar.tsx` : suppression état local null, écriture via `setSelection`/`clearSelection`, `selectMapItem()`, `hasUnsavedChanges` réel
- Corrigé `Desktop.tsx` : suppression `mapItems` mort, lecture `selectedRubriqueId` depuis store, `CentralEditor` correctement alimenté
- Effet : CentralEditor charge réellement la rubrique sélectionnée, garde-fou actif

**Lot 2 — Migration endpoint structure ✅ TERMINÉ 2026-04-10**
- `src/api/maps.ts` : `listMapRubriques` cible `GET /api/maps/${mapId}/structure/`
- Suppression de `loadMapRubriques` (code mort legacy)
- Suppression des fonctions CRUD legacy dans `mapRubriques.ts` (`createMapRubrique`, `updateMapRubrique`, `deleteMapRubrique` — inutilisées, ciblaient `/rubriques/`)
- DTO inchangé : `MapRubriqueStructureSerializer` ↔ `MapRubriqueDTO` correspondance exacte
- Zéro appel `/api/maps/{id}/rubriques/` dans le code source
- Rechargement structure entièrement canonique après chaque opération structurelle

**Lot 3 — Persistance des opérations non implémentées ✅ TERMINÉ 2026-04-10**
- Renommage rubrique : `PATCH /api/rubriques/{id}/` — implémenté avec rechargement structure
- Suppression rubrique : hors scope v1 — backend bloque `DELETE /api/rubriques/{id}/` si encore en map, pas d'endpoint de détachement disponible → toast
- Suppression projet : `DELETE /api/projets/{id}/` — implémenté avec reset état map/sélection
- Clone projet / clone rubrique : hors scope v1 — pas d'endpoint backend disponible → toast, fake IDs `Math.max()+1` supprimés

**Lot 4 — Nettoyage dette technique ✅ TERMINÉ 2026-04-10**
- `getProjectDetailsValidated` : vérifié correct — route backend intentionnellement sans `/api/`, code frontend conforme. C10 était une fausse alerte.
- Double lecture `selectedProjectId` : vérifiée non-existante — `useSelectedVersion()` fournit la valeur, `useProjectStore` fournit uniquement le setter. C11 était une fausse alerte.
- `prepareNewRubriqueXml` extrait dans `src/hooks/useNewRubriqueXml.ts` — LeftSidebar délègue via `generateRubriqueXml()`, séparation structure/contenu respectée.
- Log debug production `console.log("Fichier Word sélectionné :", file)` supprimé.
- État mort `Desktop.mapItems` et handlers morts : déjà supprimés en Lot 1 — confirmé propre à l'audit Lot 4.

**Lot 5 — Publication réelle ✅ TERMINÉ 2026-04-10**
- IHM de publication existante (ProjectModule) réellement branchée au backend
- `publishMap(mapId, format)` ajouté dans `src/api/maps.ts` — `POST /api/publier-map/{map_id}/`
- `PUBLISH_FORMATS` alignés sur `DITA_OUTPUT_FORMATS` backend (`pdf`, `html5`, `xhtml`, `scorm`, `markdown`, `eclipsehelp`)
- `handleExport` implémenté dans LeftSidebar — règle de sélection map explicite : `is_master` → map unique → blocage
- Ambiguïté "publier projet vs publier map" résolue et documentée
- Feedback utilisateur réel : message backend en succès, toast erreur en échec
- `console.log` + toast simulé supprimés

---

## 🛠 Chantier 2BIS — Réalignement Paramètres > Données sur le backend canonique

### Objectif

Corriger le désalignement entre le frontend et le backend concernant la notion d’archivage dans les écrans **Paramètres > Données**.

### Contexte

Un nettoyage métier a supprimé ou rendu inopérante la notion d’archivage sur certaines données de référence.

Conséquence :
- le frontend continue d’appeler des listes filtrées avec `?archived=false`
- certains endpoints ne répondent plus au contrat attendu
- des erreurs 404 HTML remontent côté UI à la place d’une réponse API JSON

Exemple constaté :
- `GET /audiences/?archived=false` → 404 HTML

### Symptômes

- listes vides ou cassées dans Paramètres
- toggle "Afficher archivés" devenu incohérent
- divergence entre UI existante et backend réel
- risque de duplication de correctifs locaux dans les hooks ou composants

### Enjeux

- rétablir un contrat frontend/backend cohérent
- décider explicitement si l’archivage reste une notion métier pour les données de dictionnaire
- éviter tout retour à des appels legacy ou non centralisés

### Décision à prendre

#### Option A — Réintroduire l’archivage ciblé
À appliquer uniquement aux entités où cela a un sens métier :
- fonctionnalités
- audiences
- tags
- autres dictionnaires à confirmer

Travaux associés :
- rétablir un champ d’archivage backend
- rétablir le filtrage API
- conserver le toggle frontend "Afficher archivés"

#### Option B — Supprimer l’archivage sur ces écrans
Travaux associés :
- suppression du toggle frontend
- nettoyage des hooks de données
- suppression des paramètres `archived` dans les appels API

### Recommandation

Privilégier une **Option A ciblée** :
réintroduire l’archivage uniquement sur les entités de dictionnaire pour lesquelles la désactivation logique a une vraie utilité métier.

### Plan d’action

#### Étape 1 — Audit rapide
- lister les hooks impactés :
  - `useAudiences`
  - `useFonctionnalites`
  - `useTags`
  - autres hooks dictionnaires
- identifier les routes réellement appelées
- identifier les composants Paramètres utilisant `archived` / `showArchived`

#### Étape 2 — Arbitrage métier
- confirmer les entités qui doivent supporter l’archivage
- exclure celles pour lesquelles cette notion n’a pas de valeur métier

#### Étape 3 — Correctif backend
- rétablir les endpoints canoniques nécessaires
- rétablir le filtrage sur archivage si retenu
- uniformiser les réponses d’erreur JSON

#### Étape 4 — Correctif frontend
- réaligner les hooks sur les routes canoniques
- supprimer tout appel legacy
- conserver ou retirer le toggle selon la décision métier
- gérer proprement l’absence de filtre côté UI

#### Étape 5 — Validation
- test des listes dans Paramètres
- test avec archivés masqués / affichés
- test des erreurs API normalisées
- vérification de non-régression sur les autres dictionnaires

### Risques

- réintroduire l’archivage partout sans justification
- corriger seulement l’URL sans corriger le contrat métier
- laisser des hooks divergents selon les onglets Paramètres

### Priorité

🟠 PRIORITÉ MOYENNE À HAUTE

### Statut

✅ TERMINÉ — 2026-04-13

### Résolution (2026-04-13)

**Cause racine identifiée :**
Le backend expose toutes les ressources sous le préfixe `/api/` (`router` enregistré dans `path("api/", include(router.urls))`). Or `useArchivableList` appelait `/${resource}/` (sans préfixe) → 404 systématiques sur gammes, produits, fonctionnalités, audiences, tags, profils-publication, interfaces.

L'archivage est **pleinement supporté** par le backend (`ArchivableModelViewSet` → filtre `?archived=true|false` + actions `/{id}/archive/` et `/{id}/restore/`). Le problème était uniquement côté URL frontend.

**Décision retenue sur l'archivage : Option A — archivage conservé**
Le backend supporte nativement le filtrage et les actions archive/restore sur toutes les entités du dictionnaire. Le toggle "Afficher archivés" est conservé dans l'UI.

**Fichiers modifiés :**

| Fichier | Changement |
|---|---|
| `src/hooks/useArchivableList.ts` | Préfixe `/api/` sur tous les appels ; ajout de `create()` et `update()` pour encapsuler les mutations ; correction du bug de tri (`sortedData` au lieu de `res.data`) ; import de `ArchivableItem` depuis `@/types/archivable` ; `getArchivableHooks` → `useArchivableHooks` (conformité règle des hooks React) |
| `src/lib/resources.ts` | Préfixe `/api/` sur `toggleArchivableResource` (`/api/${resource}/${id}/${action}/`) |
| `src/screens/Settings/tabs/DataTab.tsx` | Suppression du `useEffect` de préchargement debug `/gammes/` ; `handleCreate` et `onUpdate` délèguent au `currentHook` (fini les appels directs `api.post/patch` avec URL manuelle) ; `AddItemModal` reçoit `allData.gammes` et `allData.produits` (toujours chargés via React Query, au lieu de `hooks["gammes"]?.items` vide hors onglet) |

**Points hors scope (non traités dans ce chantier) :**
- Ajout d'une interface d'archivage sur les Produits et Gammes depuis l'écran Paramètres — la fonctionnalité fonctionne mais aucun test UI approfondi de la sélection d'archivage n'a été réalisé.
- Profils de publication : `shouldShowActions = selectedItem !== "profils_publication"` — le bouton Ajouter reste masqué, ce comportement est intentionnel et conservé.

---

## 🧠 Chantier 3 — Stabilisation CentralEditor

### Objectif
Finaliser la fiabilisation du cœur éditorial :
- buffer XML
- parsing XML ⇄ TipTap
- sauvegarde backend
- validation XML DITA

### Documents liés
- Refonte_CentralEditor.md
- cartographie_CentralEditor.md

### Avancement
- Phase 1 — Buffer & synchronisation TipTap : ✅ TERMINÉE
- Phase 2 — Allègement structurel : ✅ TERMINÉE
- Phase 3 — Parsing XML ⇄ TipTap complet : ✅ TERMINÉE
- Phase 4 — Sauvegarde backend & validation XML : EN COURS

### Statut
EN COURS

---

## 🧩 Chantier 4 — Socle frontend & orchestration applicative

### 🎯 Objectif

Mettre en place un socle frontend robuste, extensible et cohérent permettant :

* une communication fiable avec le backend
* une intégration future avec des modules externes (IA, support ITIL, portail client)
* une cohérence globale des comportements utilisateurs
* une traçabilité et une gouvernance compatibles ITIL

---

### 🧠 Positionnement

Ce chantier n’est pas un simple nettoyage technique.

👉 Il constitue le **socle d’orchestration du système Documentum**.

Il supporte directement :

* les flux métier (chantier 5)
* la journalisation (chantier 6)
* le versioning (chantier 7)
* les futurs modules IA et support

---

### 🧩 Axes structurants

#### 4A — Socle API unifié

* client API unique (`apiClient`)
* normalisation des erreurs
* routes exclusivement `/api/...`
* aucune construction d’URL dans les composants

---

#### 4B — Socle hooks métier

Chaque ressource expose un hook standard :

```ts
{
  items,
  isLoading,
  error,
  create(data),
  update(id, data),
  delete(id),
  archive(id),
  restore(id)
}
```

Règles :

* aucune logique API dans les composants
* mutations encapsulées dans les hooks
* comportements homogènes entre toutes les ressources
* utilisation de React Query comme source de vérité

---

#### 4C — Socle administration (Paramètres)

* pattern commun pour toutes les listes :

  * affichage
  * création
  * modification
  * archivage

* modales standardisées

* typage unifié

* comportement cohérent entre onglets

Exemple attendu :

* `Gammes`, `Produits`, `Fonctionnalités`, `Audiences`, etc.
* même structure, mêmes interactions

---

#### 4D — Socle permissions & gouvernance

* gestion des rôles côté frontend
* helpers de permissions (`canEdit`, `canArchive`, `canPublish`, etc.)
* cohérence UI selon les droits
* préparation à des workflows (validation, publication, etc.)

---

#### 4E — Socle traçabilité & événements

* toutes les actions passent par des hooks identifiables
* préparation à la journalisation (chantier 6)
* possibilité d’instrumenter facilement :

  * création
  * modification
  * suppression
  * publication
  * import

---

### ⚠️ Règles fondamentales

* aucun appel API direct dans les composants
* aucune duplication d’état
* aucune logique métier implicite
* aucune divergence de contrat entre ressources
* aucun `useEffect` technique pour charger des données

---

### 🛠 Plan d’exécution

#### Étape 1 — Audit

Identifier :

* appels API directs dans les composants
* hooks non homogènes
* duplications d’état
* effets techniques parasites
* incohérences de typage

---

#### Étape 2 — Normalisation

* homogénéiser les hooks
* centraliser les mutations
* aligner les types
* supprimer les appels directs API

---

#### Étape 3 — Nettoyage

* simplifier les composants
* supprimer les `useEffect` techniques
* supprimer les logs inutiles

---

#### Étape 4 — Validation

Vérifier :

* zéro appel API direct dans les composants
* zéro URL reconstruite manuellement
* hooks cohérents
* aucune erreur TypeScript
* comportements homogènes

---

### 🎯 Résultat attendu

Un frontend :

* **fort** → robuste et déterministe
* **souple** → extensible sans refactor massif
* **cohérent** → comportements homogènes
* **compatible ITIL** → traçable et gouvernable

---

### 📊 Statut

🚧 À lancer (structurant)

---

### 🧭 Priorité

🔥 PRIORITÉ HAUTE


---

# 🧭 Chantier 5 — Flux métier Documentum

---

## 🎯 Objectif

Formaliser les **flux métier complets** de Documentum afin de :

* aligner frontend, backend et modèle métier
* sécuriser les comportements utilisateurs
* préparer les évolutions futures (impact, IA, automatisation)

👉 Ce document décrit **comment le système est utilisé**, du point de vue métier.

---

# 🧩 1. Flux — Gestion de projet documentaire

## 🎯 Objectif

Créer et gérer les conteneurs documentaires.

## 👤 Acteurs

* Rédacteur
* Gestionnaire

## 🔄 Étapes

1. Création d’un projet

   * API : `POST /api/projets/`
   * Effets :

     * création Projet
     * création VersionProjet active
     * création Map master
     * création Rubrique racine

2. Ouverture d’un projet

   * Chargement structure : `GET /api/projets/{id}/structure/`

3. Clonage d’un projet

   * (hors scope v1 backend)

4. Suppression d’un projet

   * API : `DELETE /api/projets/{id}/`

## ⚠️ Règles métier

* Un projet existe toujours avec une version active
* Une map master est obligatoire

---

# 🧩 2. Flux — Construction documentaire

## 🎯 Objectif

Construire la structure documentaire (maps + rubriques).

## 👤 Acteurs

* Rédacteur

## 🔄 Étapes

1. Création d’une rubrique

   * API : `POST /api/maps/{id}/structure/create/`

2. Organisation de la structure

   * reorder / indent / outdent

3. Import de contenu

   * Word / PDF (futur assistant)

4. Import ou gestion des médias

   * API : `/import/media/`

## ⚠️ Règles métier

* Structure ≠ contenu
* Aucune modification structurelle ne modifie le XML

---

# 🧩 3. Flux — Édition de rubrique

## 🎯 Objectif

Modifier le contenu documentaire de manière sécurisée.

## 👤 Acteurs

* Rédacteur

## 🔄 Étapes

1. Ouverture d’une rubrique

   * Chargement XML → TipTap

2. Initialisation buffer

   * statut : `ready`

3. Modification

   * statut : `dirty`

4. Validation XML

   * API : `/api/validate-xml/`

5. Sauvegarde

   * API : `PUT /api/rubriques/{id}/`

6. Création de révision (si contenu modifié)

7. Passage statut `saved`

## ⚠️ Règles métier

* Une révision est créée uniquement si le contenu change
* Aucune action structurelle ne crée de révision
* Aucun reset de buffer sans confirmation

---

# 🧩 4. Flux — Pilotage documentaire (ProductDocSync)

## 🎯 Objectif

Identifier et suivre les impacts documentaires liés aux évolutions produit.

## 👤 Acteurs

* Chef de produit
* Support
* Rédacteur

## 🔄 Étapes

1. Sélection Produit / Version

2. Gestion des fonctionnalités

   * ajout / modification / suppression

3. Déclaration d’un impact documentaire

4. Association aux rubriques

5. Suivi des statuts :

   * à_faire
   * en_cours
   * prêt
   * validé
   * ignoré

6. Traitement dans CentralEditor

   * modification → nouvelle révision

## ⚠️ Règles métier

* ProductDocSync ne modifie jamais le XML
* ProductDocSync ne crée jamais de révision

---

# 🧩 5. Flux — Publication

## 🎯 Objectif

Transformer l’état de travail en version documentaire figée.

## 👤 Acteurs

* Gestionnaire de publication

## 🔄 Étapes

1. Sélection de la map (master uniquement)

2. Analyse des changements

   * API : `/api/projets/{id}/publication-diff/`

3. Décision de publication

4. Création VersionProjet (si changements)

5. Création des PublicationSnapshot

6. Export documentaire

   * API : `POST /api/publier-map/{map_id}/`

## ⚠️ Règles métier

* Une publication peut créer une version
* Une modification seule ne crée jamais de version
* Si aucun changement → pas de nouvelle version

---

# 🧩 6. Statuts métier

## 📌 Buffer

* ready
* dirty
* saved
* error

## 📌 Impact documentaire

* à_faire
* en_cours
* prêt
* validé
* ignoré

## 📌 Version projet

* active
* archivée

---

# 🧩 7. Responsabilités

| Rôle                     | Responsabilité      |
| ------------------------ | ------------------- |
| Rédacteur                | édition contenu     |
| Relecteur                | validation métier   |
| Gestionnaire publication | publication         |
| Chef produit             | déclaration impacts |

---

# 🎯 Synthèse

Le système repose sur 5 flux principaux :

1. Gérer un projet
2. Construire la documentation
3. Éditer le contenu
4. Piloter les impacts
5. Publier

👉 Ces flux constituent la base du fonctionnement métier de Documentum.


---

# 📜 Chantier 6 — Journalisation & audit

---

## 🎯 Objectif

Mettre en place une **journalisation complète, cohérente et exploitable** du système Documentum, couvrant :

* les actions utilisateur
* les événements métier
* les opérations techniques critiques

👉 Finalité :

* audit
* traçabilité
* debug
* pilotage produit (ProductDocSync à terme)

---

## 📚 Périmètre fonctionnel

### 1. Journalisation des actions utilisateur

* Connexions / déconnexions
* Création / modification / suppression :

  * rubriques
  * projets
  * fonctionnalités
* Actions critiques :

  * publication
  * import
  * remplacement de média

📌 Exemples :

* "Modification de rubrique"
* "Export PDF"
* "Connexion"

---

### 2. Journalisation métier (niveau supérieur)

* création de révision de rubrique
* publication (création de version)
* traitement d’impact documentaire

👉 Objectif : tracer les événements structurants du système

---

### 3. Journalisation technique

* erreurs API (400 / 500)
* exceptions backend
* appels sensibles :

  * import CSV
  * génération DITA
  * publication

---

## 🧱 Architecture cible

### Backend (Django)

#### Modèle recommandé : `LogEntry`

Champs minimum :

```
id
date
utilisateur
type_action
objet_type
objet_id
description
metadata_json
```

#### Points d’injection

* Middleware → connexions
* Services métier → publication, révision
* Utilitaire central → `log_action()`

---

### Frontend

#### Existant

* écran d’historique des actions

#### Évolutions à prévoir

* filtres dynamiques (type, utilisateur, objet)
* pagination
* liens cliquables vers les objets

---

## ⚠️ Règles importantes

* centralisation backend obligatoire
* aucune logique de log dispersée
* logs persistés uniquement (pas de logs UI seuls)
* structure exploitable (pas seulement du texte libre)

---

## 🔴 Risques si non traité

* perte de traçabilité
* impossibilité d’audit
* debug difficile
* incohérences invisibles

---

## 📊 Statut

👉 À FAIRE

---

## 🧭 Priorité

👉 MOYENNE → HAUTE

---

## 🚀 Plan de mise en œuvre

### Étape 1 — Base

* modèle `LogEntry`
* utilitaire `log_action()`
* log création / modification de rubrique

---

### Étape 2 — Extension

* log publication
* log versioning
* enrichissement UI (filtres)

---

### Étape 3 — Exploitation

* intégration ProductDocSync
* exploitation pour analyse / IA

---

## 🧠 Positionnement dans le projet

Ce chantier est transverse et soutient :

* le versioning
* la publication
* le pilotage documentaire

👉 Il devient un socle pour les évolutions futures du projet Documentum.

---

## 🧬 Chantier 8 — Versioning documentaire

### Objectif

Mettre en place un modèle de versioning métier cohérent et exploitable :

* distinction claire :

  * révision (modification de contenu)
  * version (publication)
* traçabilité des évolutions documentaires
* base pour ProductDocSync et l’analyse d’impact

### Enjeux

* cœur métier du CCMS Documentum
* cohérence entre backend, frontend et modèle métier
* préparation des fonctionnalités avancées (impact, couverture, IA)

### Périmètre initial

* formalisation du modèle :

  * révisions de rubrique
  * versions de projet
* définition des flux :

  * modification → révision
  * publication → version figée
* alignement avec :

  * `10_VERSIONING_DOCUMENTAIRE.md`
  * `10_MODELE_METIER_DOCUMENTUM.md`

### Audit (2026-04-11)

#### Écarts bloquants constatés dans le code réel

| Écart | Gravité |
|---|---|
| Pas de `RevisionRubrique` entité séparée — `revision_numero` figé à 1, jamais incrémenté | BLOQUANT |
| Sauvegarde rubrique (`PUT /api/rubriques/{id}/`) : aucune comparaison XML, aucune révision créée | BLOQUANT |
| Publication (`POST /api/publier-map/`) : export DITA uniquement, pas de `VersionProjet` figée créée | BLOQUANT |
| Pas de jointure `VersionProjet` ↔ révisions — impossible de répondre "quelles révisions étaient publiées ?" | BLOQUANT |
| `clone_version()` : copie physique des rubriques (`pk=None`) — non conforme au référentiel | MOYEN |
| `Rubrique.version`, `Rubrique.version_precedente` : champs ambigus / design par copie inutilisés | MOYEN |
| `Projet.version_numero` : champ mort doublon de `VersionProjet.version_numero` | FAIBLE |

#### Ce qui est réutilisable

* `VersionProjet` correctement créée à la création de projet (v1.0.0)
* `PUT /api/rubriques/{id}/` — endpoint canonique à enrichir
* `POST /api/publier-map/{map_id}/` — endpoint à enrichir avec service de publication
* Mécanisme de verrouillage rubrique (`locked_by`, `locked_at`) — existant mais non exploité

### Modèle cible retenu

#### Nouvelles entités

**`RevisionRubrique`** : snapshot immuable de chaque modification réelle du XML.
* Champs : `rubrique` FK, `numero` (1, 2, 3…), `contenu_xml`, `hash_contenu` (SHA-256), `auteur`, `date_creation`
* Invariant : immuable après création

**`PublicationSnapshot`** : jointure figée entre une version publiée et les révisions exactes publiées.
* Champs : `version_projet` FK, `rubrique` FK, `revision` FK → `RevisionRubrique`
* Invariant : immuable après création, unique par (version_projet, rubrique)

#### Règles métier

* Révision créée uniquement si `hash(nouveau_xml) ≠ hash(xml_courant)`
* Renommage, opérations structurelles, ProductDocSync → ne créent JAMAIS de révision
* Publication avec changements → nouvelle `VersionProjet` + `PublicationSnapshot` + export DITA
* Publication sans changement → HTTP 200 `no_change`, pas de VersionProjet créée
* Création initiale d’une rubrique → `RevisionRubrique(numero=1)` automatique

### Plan d’implémentation retenu

| Lot | Contenu | Risque |
|---|---|---|
| **Lot 1** | Migration : `RevisionRubrique`, `PublicationSnapshot` + data migration (révision 1 pour chaque rubrique existante) | Faible — ajout pur |
| **Lot 2** | Service `create_revision_if_changed()`, intégration dans `RubriqueViewSet.update()` et `create_rubrique_in_map()` | Moyen — cœur métier |
| **Lot 3** | Service `publish_project()` atomique : diff, VersionProjet, snapshots, export + endpoint `publication-diff` ✅ | Moyen — transactionnel |
| **Lot 4** | Sérialiseurs + endpoints : `GET /rubriques/{id}/revisions/` ✅ | Faible |
| **Lot 5** | Tests unitaires et d’intégration ✅ inclus dans Lot 3 et 4 | — |
| **Lot 6** | Exposition frontend minimale : révision courante dans CentralEditor, diff pré-publication dans ProjectModule | Faible |

### Décisions à arbitrer avant implémentation

| # | Décision | Défaut proposé |
|---|---|---|
| D1 | Source de vérité `Rubrique.contenu_xml` vs dernière révision | `contenu_xml` = WIP courant, révision = snapshot — passer systématiquement par le service |
| D2 | Numérotation de version (semver auto vs manuelle) | Minor bump auto (`1.0.0 → 1.1.0`), override optionnel |
| D3 | Rubrique dans plusieurs maps : quelle map fait foi ? | Map master uniquement en v1 |
| D4 | Champs obsolètes (`revision_numero`, `version`, `version_precedente`) | Déprécier d’abord, supprimer dans un lot ultérieur post-stabilisation |

### Statut

🟢 EN COURS — Lots 1, 2, 3, 4 terminés (2026-04-12)

### Priorité

🔥 PRIORITÉ HAUTE

### Avancement Lot 1 (2026-04-11)

**Fichiers modifiés / créés :**

| Fichier | Nature |
|---|---|
| `documentation/models.py` | Ajout `RevisionRubrique`, `SnapshotPublication` ; dépréciations commentées |
| `documentation/utils.py` | Ajout `compute_xml_hash()` |
| `documentation/migrations/0009_add_versioning_tables.py` | Schéma — CreateModel additif |
| `documentation/migrations/0010_backfill_revision_initiale.py` | Data — backfill `RevisionRubrique(numero=1)` |
| `documentation/admin.py` | Enregistrement read-only des nouveaux modèles |

**Champs dépréciés (commentés dans models.py, non supprimés) :**
- `Rubrique.revision_numero`
- `Rubrique.version`
- `Rubrique.version_precedente`
- `Projet.version_numero`, `Projet.date_lancement`, `Projet.notes_version`

**Décisions consolidées :**
- Nommage : `SnapshotPublication` (français, concis, domain-first)
- Hash : SHA-256 via `ET.fromstring()` → `ET.tostring()` (déterministe, XML invalide toléré)
- Semver auto : bump mineur (1.0.0 → 1.1.0) — implémenté en Lot 3
- Map master uniquement pour les snapshots v1

**Lot 1 soldé.**

### Avancement Lot 2 (2026-04-11)

**Correction MOA appliquée :** `SnapshotPublication` renommé en `PublicationSnapshot` — migration 0011.

**Fichiers modifiés / créés :**

| Fichier | Nature |
|---|---|
| `documentation/models.py` | Renommage `PublicationSnapshot`, related_names mis à jour |
| `documentation/utils.py` | Type hint `str \| None` sur `compute_xml_hash` |
| `documentation/services.py` | Ajout `create_revision_if_changed()` + `_create_initial_revision()` ; intégration dans `create_project()` et `create_rubrique_in_map()` |
| `documentation/views.py` | Import `create_revision_if_changed`, `compute_xml_hash`, `RevisionRubrique` ; intégration dans `RubriqueViewSet.update()` et `create()` |
| `documentation/serializers.py` | Ajout `revision_courante_numero` (SerializerMethodField) dans `RubriqueSerializer` |
| `documentation/admin.py` | Renommage `PublicationSnapshotAdmin` |
| `documentation/migrations/0011_rename_snapshotpublication_publicationsnapshot.py` | RenameModel schéma |
| `documentation/tests/test_versioning.py` | 29 tests (hash, service, intégration création, intégration API) |

**Résultats tests :**
- 29/29 nouveaux tests passent
- 51/51 tests pré-existants passent
- Zéro régression

**Limites documentées dans les tests :**
- Whitespace text nodes entre balises : préservés par ElementTree → hashes distincts (non-significatif en pratique : TipTap sérialise de façon cohérente)
- Ordre des attributs : Python 3.13 ne trie pas → hashes distincts si ordre différent (non-significatif : TipTap produit un ordre constant)

**Point de concurrence documenté :**
- `select_for_update(of=("self",))` sur la ligne Rubrique sérialise les modifications concurrentes
- PostgreSQL : row-level lock
- SQLite (tests) : table-level lock, fonctionnel
- Garde-fou DB final : `unique_together(rubrique, numero)`

**Contrat API mis à jour :**
- `GET /api/rubriques/{id}/` et `PUT /api/rubriques/{id}/` exposent désormais `revision_courante_numero` (int \| null)
- `revision_numero` conservé (déprécié, rétrocompatibilité)

**Lot 2 soldé.**

### Avancement Lot 3 (2026-04-12)

**Objectif :** Versionnage métier réel — le simple export DITA devient une publication versionnante avec bump semver, snapshots et diff.

**Fichiers modifiés / créés :**

| Fichier | Nature |
|---|---|
| `documentation/services.py` | Ajout `bump_minor_version()`, `_get_last_published_version()`, `_build_rubrique_revision_map()`, `_detect_changes()`, `_create_publication_snapshot()` (atomique), `publish_project()`, `get_publication_diff()` ; import `export_map_to_dita` |
| `documentation/utils.py` | Suppression `publier_map()` + `get_formats_publication()` (migrées vers views.py) ; suppression imports HTTP/REST devenus inutiles |
| `documentation/views.py` | Migration `publier_map()` + `get_formats_publication()` depuis utils.py ; ajout `publication_diff_view` (`GET /api/projets/{id}/publication-diff/`) ; imports `publish_project`, `get_publication_diff`, `DITA_OUTPUT_FORMATS` |
| `documentation/urls.py` | Import `publier_map`, `get_formats_publication`, `publication_diff_view` depuis views.py (supprimé depuis utils.py) ; ajout route `api/projets/<projet_id>/publication-diff/` |
| `documentation/tests/test_publication.py` | 37 nouveaux tests (8 classes) |

**Architecture du service `publish_project()` :**

Séparation nette entre deux responsabilités :
1. **Versionnage métier** (atomique, `_create_publication_snapshot()`) : gel WIP → `PublicationSnapshot` → nouvelle WIP
2. **Export technique** (hors transaction, `export_map_to_dita()`) : délégué après validation métier

Un échec export ne remet pas en cause la version figée.

**Helpers :**
- `bump_minor_version("1.0.0")` → `"1.1.0"` (patch remis à zéro)
- `_build_rubrique_revision_map(map_obj)` → `{rubrique_id: RevisionRubrique}` via Subquery/annotation (zéro N+1)
- `_detect_changes()` → `{nouvelles, modifiees, retirees, has_changes}`
- `get_publication_diff()` → lecture seule, 0 écriture

**Nouveau endpoint :**
- `GET /api/projets/{id}/publication-diff/` → diff pré-publication pour le frontend
- `POST /api/publier-map/{map_id}/` — réécrit : appelle `publish_project()` au lieu du stub DITA direct

**Contrainte v1 maintenue :** seule la map master est publiable (validé dans la vue).

**Résultats tests :**
- 37/37 nouveaux tests passent (8 classes : bump, last_published, revision_map, detect_changes, publish_project, diff, API publish, API diff)
- 117/117 tests totaux — zéro régression

**Lot 3 soldé.**

### Avancement Lot 4 (2026-04-12)

**Objectif :** Exposer l'historique des révisions d'une rubrique via une API dédiée en lecture seule.

**Fichiers modifiés / créés :**

| Fichier | Nature |
|---|---|
| `documentation/serializers.py` | Import `RevisionRubrique` ; ajout `RevisionRubriqueSerializer` (lecture seule : `id`, `numero`, `hash_contenu`, `contenu_xml`, `auteur_username`, `date_creation`) |
| `documentation/views.py` | Import `RevisionRubriqueSerializer` ; ajout action `@action(detail=True, methods=["get"], url_path="revisions")` sur `RubriqueViewSet` |
| `documentation/tests/test_revisions_endpoint.py` | 13 nouveaux tests |

**Route auto-générée par DRF router** (aucune modification `urls.py`) :
`GET /api/rubriques/{id}/revisions/`

**Comportement :**
- Tri par `numero` décroissant (révision la plus récente en premier)
- 404 si la rubrique n'existe pas (via `get_object()`)
- POST → 405 Method Not Allowed
- Non authentifié → 401/403
- `auteur_username` exposé via `source="auteur.username"` + `select_related("auteur")` (zéro N+1)

**Résultats tests :**
- 13/13 nouveaux tests passent
- 130/130 tests totaux — zéro régression

**Lot 4 soldé.**

---

## 🖼️ Chantier 7 — Insertion et gestion des images dans les rubriques (RightSidebar)

### Objectif

Permettre l’insertion et la gestion contrôlée des images dans les rubriques depuis le `RightSidebar`, avec création et maintenance correctes des liens vers les médias.

### Enjeux

* relier proprement le panneau média / RightSidebar à l’éditeur de rubrique
* garantir une insertion cohérente dans le XML DITA
* éviter les liens cassés, les insertions ambiguës ou les comportements locaux non persistés
* préparer une gestion plus complète des médias dans la documentation

### Périmètre initial

* sélection d’une image depuis le `RightSidebar`
* insertion de la référence dans la rubrique en cours
* gestion du lien entre rubrique et média
* cohérence entre :

  * frontend
  * buffer XML
  * backend
  * structure DITA attendue

### Points de vigilance

* ne pas contourner le système d’import média existant
* ne pas insérer de contenu non conforme au XML DITA attendu
* distinguer clairement :

  * ressource média stockée
  * référence insérée dans la rubrique
* prévoir la gestion future :

  * remplacement d’image
  * suppression du lien
  * édition des attributs éventuels (alt, titre, légende, etc.)

### Dépendances

* CentralEditor stabilisé
* panneau média / RightSidebar
* modèle de gestion des médias déjà en place
* futures décisions sur les extensions TipTap Image / Figure

### Statut

🚧 À PLANIFIER

### Priorité

⚙️ PRIORITÉ MOYENNE À HAUTE

### Notes

Ce chantier est transverse.
Il devra être traité comme un flux complet :
sélection média → insertion dans la rubrique → sérialisation XML → persistance cohérente.

---

## 📥 Chantier 9 — Import assisté de documentation existante (PDF → Rubriques)

### Objectif

Permettre l’import de documents existants (PDF) via un assistant guidé, capable de découper automatiquement le contenu en rubriques exploitables dans Documentum.

### Enjeux

* accélérer la reprise de documentation existante
* transformer un contenu non structuré en contenu structuré DITA
* automatiser au maximum la création de rubriques et l’intégration des médias
* réduire drastiquement le travail manuel de migration

### Principe

Un assistant utilisateur permet de :

* importer un document PDF
* analyser sa structure
* proposer une découpe en rubriques
* injecter le contenu dans :

  * un nouveau projet
  * ou un projet existant

### Fonctionnalités attendues

#### 1. Analyse du document

* détection des niveaux de titres (H1, H2, H3…)
* reconstruction d’une arborescence logique
* segmentation en blocs exploitables

#### 2. Découpage en rubriques

* proposition automatique de découpe
* possibilité d’ajustement manuel par l’utilisateur
* mapping vers types de rubriques (concept, tâche, référence…)

#### 3. Gestion des images

* extraction des images du PDF
* import dans le système média Documentum
* détection des images existantes (remplacement ou réutilisation)
* insertion correcte des références dans les rubriques

#### 4. Génération du contenu

* transformation vers XML compatible DITA
* insertion dans le buffer des rubriques
* respect des contraintes structurelles existantes

#### 5. Intégration dans le projet

* création d’un nouveau projet OU
* insertion dans une map existante
* positionnement des rubriques dans la structure

### Points de vigilance

* qualité très variable des PDF (structure implicite)
* ambiguïté des niveaux de titres
* gestion des images complexes (position, répétition, qualité)
* transformation vers DITA non triviale
* nécessité d’un contrôle utilisateur à chaque étape

### Approche recommandée

* ne pas viser une automatisation totale dès le départ
* privilégier un assistant guidé avec validation utilisateur
* découper en plusieurs étapes :

  1. parsing brut
  2. structuration
  3. validation
  4. insertion

### Dépendances

* modèle de rubrique stabilisé
* CentralEditor fonctionnel (injection contenu)
* système média opérationnel
* chantier insertion d’images (RightSidebar)

### Statut

🚧 À PLANIFIER

### Priorité

⚙️ PRIORITÉ MOYENNE (après versionning et gestion des images)

### Notes

Ce chantier pourra évoluer vers :

* intégration d’IA pour améliorer la segmentation
* suggestions automatiques de structuration
* enrichissement du contenu importé

---


# 🧪 3. Zones critiques

---

## 🔴 Critique

- Buffer XML (perte de données)
- Conversion XML ⇄ TipTap
- ~~Synchronisation Front / Back~~ → ✅ résolue pour la couche structurelle (routes canoniques, Sprint 4) — reste ouverte sur la couche contenu (buffer, sauvegarde rubrique)

---

## 🟠 Important

- duplication d’état frontend
- logique résiduelle dans LeftSidebar (rechargement systématique après opération structurelle)
- cohérence ProductDocSync

---

## 🟢 Secondaire

- UX fine
- optimisation performance

---

# 📋 4. Backlog structuré

---

## 🔥 Priorité haute

- sécuriser buffer
- ~~finaliser sauvegarde backend~~ → ✅ routes canoniques en place (Sprint 4) ; reste : rechargement systématique côté frontend
- stabiliser parsing XML

---

## ⚙️ Priorité moyenne

- nettoyage LeftSidebar (rechargement après create / indent / outdent / reorder)
- centralisation API frontend (partiel : création projet + opérations structurelles migrées en Sprint 4)
- ~~amélioration gestion erreurs~~ → ✅ `custom_exception_handler` unifié (Sprint 1)

---

## 🧩 Priorité basse

- UX avancée (rendu racine, masquage partiel, actions contextuelles)
- projection `level → parent/ordre` pour drag & drop cross-niveau
- fonctionnalités secondaires

---

# 🧭 5. Méthode de travail

---

## Cycle recommandé

Analyse → Décision → Référentiel → Implémentation → Cartographie

---

## Utilisation IA

Claude / Cursor doivent être utilisés pour :

- cartographier le code existant
- identifier les écarts
- générer du code aligné

---

# 🧠 6. Suivi

---

## Règles

- toute avancée significative doit être notée
- tout blocage doit être explicité
- toute dérive doit être corrigée

---

## Journal

| Date | Chantier | Avancée |
|---|---|---|
| 2026-04-10 | Backend réalignement | Sprints 1–5 terminés. Backend canonique, routes legacy supprimées, frontend migré, logs/monitoring/sérialiseurs stabilisés. |
| 2026-04-10 | Intégration frontend (Lot 3) | Renommage rubrique migré vers `PATCH /api/rubriques/{id}/`. Suppression projet migrée vers `DELETE /api/projets/{id}/`. Clone projet/rubrique et suppression rubrique documentés hors scope v1 (pas d'endpoint disponible) — fake IDs supprimés, toasts d'information ajoutés. |
| 2026-04-10 | Intégration frontend (Lot 5) | Publication réellement branchée sur `POST /api/publier-map/{map_id}/`. IHM ProjectModule conservée, formats alignés sur backend, règle map master documentée, feedback utilisateur réel. `console.log` / toast simulé supprimés. |
| 2026-04-10 | Nettoyage dette technique (Lot 4) | `prepareNewRubriqueXml` extrait dans `useNewRubriqueXml` hook. Log debug supprimé. C10 et C11 vérifiés fausses alertes. Desktop confirmé propre. Chantier 2 soldé. |
| 2026-04-11 | Chantier 6 — Versioning documentaire | Audit complet du code réel : 4 écarts bloquants identifiés (pas de RevisionRubrique, pas de création de révision à la sauvegarde, pas de VersionProjet figée à la publication, pas de snapshot). Modèle cible défini : `RevisionRubrique` + `PublicationSnapshot`. Plan 6 lots validé. Décisions D1–D4 à arbitrer avant Lot 1. |
| 2026-04-11 | Chantier 6 — Lot 1 | Migration additive : `RevisionRubrique`, `PublicationSnapshot`, `compute_xml_hash`. Backfill révision initiale (n°1) pour toutes les rubriques existantes. Dépréciations commentées. Zéro régression sur les modèles existants. |
| 2026-04-11 | Chantier 6 — Lot 2 | Renommage `PublicationSnapshot` (migration 0011). Service `create_revision_if_changed()` + révision initiale dans `create_project()` / `create_rubrique_in_map()` / `RubriqueViewSet.create()`. `revision_courante_numero` dans `RubriqueSerializer`. 29 tests versioning + 51 tests pré-existants verts. Zéro régression. |
| 2026-04-12 | Chantier 6 — Lot 3 | Service `publish_project()` : versionnage atomique (`_create_publication_snapshot`) + export DITA délégué hors transaction. Helpers `bump_minor_version`, `_build_rubrique_revision_map` (Subquery/annotation, zéro N+1), `_detect_changes`. Endpoint `GET /api/projets/{id}/publication-diff/`. Migration `publier_map()` de utils.py vers views.py (suppression import circulaire potentiel). 37 nouveaux tests — 117/117 total. Zéro régression. |
| 2026-04-12 | Chantier 6 — Lot 4 | `RevisionRubriqueSerializer` (lecture seule). Action `@action revisions` sur `RubriqueViewSet` → route auto DRF `GET /api/rubriques/{id}/revisions/`. Tri décroissant, select_related auteur, 0 N+1. 13 nouveaux tests — 130/130 total. Zéro régression. |

---
