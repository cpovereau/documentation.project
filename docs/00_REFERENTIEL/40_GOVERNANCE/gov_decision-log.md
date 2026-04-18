# Documentum – Decision Log

Ce document recense les **décisions structurantes** prises pour le projet Documentum.

Il a pour objectifs :
- de conserver la mémoire des choix forts,
- d’éviter les débats cycliques,
- de permettre une remise en question éclairée si le contexte évolue.

Une décision non consignée ici est considérée comme :
- provisoire,
- ou non stabilisée.

---

## Format des décisions

Chaque décision suit le format suivant :

- **Date**
- **Sujet**
- **Contexte**
- **Décision**
- **Justification**
- **Conséquences**
- **Statut** (Active / À réévaluer)

---

## 2024-11-17 – Architecture générale Documentum

**Sujet**  
Architecture globale du projet Documentum

**Contexte**  
Besoin d’un outil de documentation structuré, versionné, extensible et orienté publication multi-formats.

**Décision**  
- Backend : Django REST + PostgreSQL  
- Frontend : React + TypeScript + Tailwind  
- Éditeur : TipTap v3 avec extensions personnalisées  
- Formats : DITA XML comme source canonique

**Justification**  
- Séparation claire frontend / backend  
- Écosystème mature  
- Compatibilité avec les objectifs long terme (PDF, Web Help, SCORM)

**Conséquences**  
- Nécessité de respecter strictement la structure DITA  
- Complexité initiale assumée

**Statut**  
Active

---

## 2025-06-22 – Abandon de l’édition inline dans les Paramètres

**Sujet**  
UX des écrans de Paramètres

**Contexte**  
Les premières maquettes prévoyaient de l’édition inline pour certaines entités.

**Décision**  
Abandon total de l’édition inline au profit de modales dédiées.

**Justification**  
- Complexité UX élevée  
- Validation difficile  
- Incohérence avec le backend  
- Maintenance coûteuse

**Conséquences**  
- Uniformisation des écrans Paramètres  
- Simplification des flux utilisateur  
- Réduction des cas limites

**Statut**  
Active

---

## 2025-06-22 – Centralisation de la gestion des erreurs

**Sujet**  
Gestion des erreurs frontend / backend

**Contexte**  
Multiplication de formats d’erreurs hétérogènes et gestion locale.

**Décision**  
- Centralisation backend via `custom_exception_handler`  
- Normalisation frontend via intercepteur Axios

**Justification**  
- Lisibilité  
- Cohérence UX  
- Facilité de maintenance

**Conséquences**  
- Obligation de respecter le format d’erreur standard  
- Simplification des composants consommateurs

**Statut**  
Active

---

## 2025-06-23 – Centralisation des extensions TipTap

**Sujet**  
Gestion des extensions TipTap personnalisées

**Contexte**  
Multiplication d’extensions dispersées dans le projet.

**Décision**  
- Export nommé obligatoire  
- Point d’entrée unique (`src/extensions/index.ts`)

**Justification**  
- Lisibilité  
- Réutilisabilité  
- Compatibilité TipTap v3

**Conséquences**  
- Discipline stricte sur la création d’extensions  
- Meilleure maintenance globale

**Statut**  
Active

---

## 2025-07-22 – Gestion explicite du buffer de rubrique

**Sujet**  
Prévention de la perte de contenu non sauvegardé

**Contexte**  
Risque identifié de reset implicite du contenu lors de changements de contexte.

**Décision**  
Introduction d’un statut explicite du buffer (`ready`, `modified`, `saved`, etc.).

**Justification**  
- Sécurité du contenu  
- UX maîtrisée  
- Prévention des pertes silencieuses

**Conséquences**  
- Complexification contrôlée de la gestion d’état  
- Nécessité d’UX explicite (popup, avertissements)

**Statut**  
Active

---

## 2025-08-14 – Import et remplacement des médias

**Sujet**  
Gestion des images et médias partagés

**Contexte**  
Besoin d’un système fiable d’import et de remplacement sans rupture de liens.

**Décision**  
- Nommage déterministe côté backend  
- Remplacement en conservant le nom original  
- Confirmation utilisateur explicite

**Justification**  
- Cohérence documentaire  
- Fiabilité des publications  
- UX sécurisante

**Conséquences**  
- Couplage frontend / backend assumé  
- Complexité accrue mais maîtrisée

**Statut**  
Active

---

## 2025-09-29 – Centralisation de la sauvegarde des rubriques

**Sujet**  
Stratégie de sauvegarde des contenus

**Contexte**  
Multiples points potentiels de sauvegarde implicite.

**Décision**  
Centralisation de la logique de sauvegarde dans un hook dédié (`saveRubrique()`).

**Justification**  
- Cohérence  
- Traçabilité  
- Prévention des conflits

**Conséquences**  
- Discipline d’appel  
- Facilite l’évolution vers autosave ou warning utilisateur

**Statut**  
Active

---

## 2026-04-09 – Coexistence temporaire des endpoints structurels backend

**Sujet**
Coexistence temporaire des endpoints structurels canoniques et des endpoints historiques de compatibilité.

**Contexte**
Le frontend historique (LeftSidebar) appelle encore :
- POST /api/map-rubriques/{id}/indent/
- POST /api/map-rubriques/{id}/outdent/
- POST /api/maps/{id}/reorder/

Le backend a été réaligné pour :
- conserver ces routes de compatibilité,
- ajouter en parallèle les routes canoniques :
    - GET /api/maps/{id}/structure/
    - POST /api/maps/{id}/structure/create/
    - POST /api/maps/{id}/structure/reorder/
    - POST /api/maps/{id}/structure/{mapRubriqueId}/indent
    - POST /api/maps/{id}/structure/{mapRubriqueId}/outdent

**Décision**
- Maintenir temporairement une double exposition :
    - canonique pour la cible backend,
    - compatible pour le frontend existant, en réutilisant les mêmes services métiers.

**Justification**
- éviter toute régression frontend,
- supprimer les 404 bloquantes,
- préparer une migration progressive sans déplacer la logique métier dans l’UI.

**Conséquences**
- la documentation doit distinguer cible et état transitoire
- les routes de compatibilité sont temporaires
- elles devront être supprimées après migration frontend

**Statut**
~~Active — à réévaluer après migration du frontend vers /structure/*~~
**Clôturée – 2026-04-10** : migration frontend effectuée (Sprint 4 Phase A) + routes legacy supprimées (Sprint 4 Phase B). Voir décision 2026-04-10 – Stratégie 2 phases.

---

## 2026-04-09 – Neutralisation défensive de POST /api/projets/

**Sujet**
Création de projet non canonique temporairement interdite.

**Contexte**
Le référentiel cible prévoit que POST /api/projets/ soit la porte d’entrée unique. Mais l’orchestration complète n’a pas encore été rapatriée dans ProjetViewSet.create(). Aujourd’hui, la seule route garantissant les invariants métier reste POST /projet/create/.

**Décision**
POST /api/projets/ est explicitement bloqué par une erreur métier, afin d’empêcher toute création partielle ou incohérente.

**Justification**
Mieux vaut une interdiction explicite qu’une création silencieusement incomplète.

**Conséquences**
- /projet/create/ reste provisoirement obligatoire
- le canon n’est pas encore atteint sur la création projet
- la migration future devra déplacer l’orchestration dans ProjetViewSet.create()

**Statut**
~~Active — temporaire~~
**Clôturée – 2026-04-10** : service `create_project()` implémenté et `ProjetViewSet.create()` pleinement opérationnel (Sprint 2). Route `/projet/create/` supprimée (Sprint 4 Phase B). Voir décision 2026-04-10 – Service create_project().

---

## 2026-04-10 – Service create_project() comme point d'entrée unique

**Sujet**
Centralisation de la création de projet dans un service atomique.

**Contexte**
`ProjetViewSet.create()` créait le Projet sans garantir les objets dérivés (VersionProjet, Map master, Rubrique racine, MapRubrique racine). La route legacy `/projet/create/` assurait les invariants mais n'était pas canonique DRF.

**Décision**
- Extraction de toute la logique de création dans `services.create_project(*, data, user)`.
- `ProjetViewSet.create()` délègue entièrement à ce service.
- La vue ne contient plus aucune logique métier de création.

**Justification**
- Atomicité garantie par `@transaction.atomic`.
- Invariants explicites et testables indépendamment de la couche HTTP.
- Suppression du code dupliqué entre route legacy et route canonique.

**Conséquences**
- `ProjetSerializer.create()` est mort — supprimé (Sprint 5).
- Tout futur clone ou variante de création projet **doit** passer par `create_project()`.
- La réponse canonique `{projet, map}` est la seule forme contractuelle du frontend.

**Statut**
Active

---

## 2026-04-10 – Stratégie 2 phases pour la suppression des routes legacy

**Sujet**
Ordre de migration : d'abord le frontend, ensuite le backend.

**Contexte**
Après l'ajout des routes canoniques (Sprint 1–2), les routes legacy coexistent. Supprimer le backend en premier crée des régressions frontend immédiates. Migrer le frontend en premier sans supprimer le backend laisse du code mort à risque.

**Décision**
Adopter une stratégie systématique en 2 phases pour toute suppression de route legacy :
- **Phase A** : migrer les appels frontend vers la route canonique, sans toucher le backend.
- **Phase B** : supprimer les handlers et routes backend legacy, uniquement après validation de la Phase A.

**Justification**
- Zéro régression frontend à chaque étape.
- Rollback simple si un appel est manqué (route encore présente).
- Séparation claire des responsabilités de migration.

**Conséquences**
- Toute future refonte de route applique ce pattern Phase A / Phase B.
- Les tests backend vérifient explicitement l'absence de `NoReverseMatch` sur les routes supprimées.
- Les tests frontend (ou leurs substituts d'intégration) valident les nouvelles routes avant Phase B.

**Statut**
Active

---

## 2026-04-11 – PATCH vs PUT pour la sauvegarde de rubrique

**Sujet**
Méthode HTTP utilisée pour `useRubriqueSave`

**Contexte**
La cartographie backend canonique (`10_CARTOGRAPHIE_BACKEND_CANONIQUE_EXPOSE.md`) liste `PUT /api/rubriques/{id}/` pour la mise à jour de contenu. Le hook `useRubriqueSave` utilise `PATCH`.

**Décision**
Conserver `PATCH /api/rubriques/{id}/` pour la sauvegarde de rubrique depuis le CentralEditor.

**Justification**
- DRF `ModelViewSet` expose les deux méthodes sur la même action `update`
- `PATCH` est sémantiquement correct : seul `contenu_xml` est envoyé (mise à jour partielle)
- `PATCH` était déjà utilisé pour le renommage (Lot 3) et fonctionne en production
- Le référentiel peut être mis à jour pour refléter `PATCH` comme méthode officielle sur ce endpoint

**Conséquences**
- La cartographie backend (`10_CARTOGRAPHIE_BACKEND_CANONIQUE_EXPOSE.md`) doit être mise à jour : `PUT` → `PATCH` pour `RubriqueViewSet.update`
- Toute future route de contenu rubrique doit utiliser `PATCH` pour les mises à jour partielles

**Statut**
Active

---

## 2026-04-11 – Guard de navigation étendu à "error"

**Sujet**
Condition de blocage du guard de navigation rubrique

**Contexte**
Le guard dans `LeftSidebar` ne bloquait la navigation que sur `status === "dirty"`. Après un échec de sauvegarde, le buffer passe à `"error"` — la navigation restait alors autorisée, exposant à une perte de contenu silencieuse.

**Décision**
La condition `hasUnsavedChanges` couvre désormais les deux statuts bloquants :
- `"dirty"` — modification non sauvegardée
- `"error"` — tentative de sauvegarde échouée

**Justification**
- Un buffer `"error"` contient du contenu non persisté : la navigation sans avertissement serait une perte silencieuse.
- Diff minimal : une seule ligne modifiée dans `LeftSidebar.tsx`, alignement dans `useConfirmBeforeUnloadRubriqueChange.ts`.
- Aucune modification sémantique des statuts ni du store.

**Conséquences**
- Navigation bloquée si `status === "dirty"` ou `status === "error"`
- Navigation autorisée uniquement si `status === "saved"`
- `useConfirmBeforeUnloadRubriqueChange` aligné par cohérence (actuellement dead code — non branché)

**Statut**
Active

---

## 2026-04-11 – Modale de navigation "Quitter sans enregistrer ?"

**Sujet**
UX de sortie lors d'une tentative de navigation avec buffer non sauvegardé

**Contexte**
Le guard de navigation (Lot D) bloquait sèchement toute navigation si le buffer était `"dirty"` ou `"error"`, sans proposer d'action à l'utilisateur. UX inacceptable en production.

**Décision**
Introduction d'une modale `UnsavedChangesDialog` avec 3 choix :
1. **Enregistrer** → save API → si succès : navigation ; si échec : modale fermée, navigation annulée, toast d'erreur visible
2. **Quitter sans enregistrer** → navigation immédiate, buffer non persisté
3. **Annuler** → retour à l'édition sans changement

Architecture adoptée :
- `pendingNavigation: (() => void) | null` — callback de navigation différée dans `LeftSidebar`
- `requestNavigation(action)` — helper qui intercepte et stocke l'action si buffer bloquant
- Guard au niveau des **points d'entrée UI** (handlers), pas dans les fonctions métier (`openProject`, `openMap`)
- `useRubriqueSave(selectedRubriqueId)` instancié dans `LeftSidebar` — appel API indépendant du CentralEditor

**Justification**
- Aucune logique métier dans les composants
- Diff minimal : seul `LeftSidebar.tsx` modifié (+ création `UnsavedChangesDialog.tsx`)
- Réutilisation du hook de sauvegarde existant — pas de duplication
- Pas de falsification du buffer pour contourner le guard

**Conséquences**
- Sur échec de sauvegarde : modale fermée, navigation bloquée, buffer reste `"error"`
- `useRubriqueChangeTracker.resetAfterSave()` n'est pas appelé depuis LeftSidebar (hors périmètre) — cosmétique uniquement, sans impact sur la sécurité du contenu
- `useConfirmBeforeUnloadRubriqueChange` reste dead code (beforeunload navigateur non branché — hors périmètre)

**Statut**
Active

---

## 2026-04-17 – Adoption de TanStack Query v5 pour le data-fetching frontend

**Sujet**  
Choix du socle de récupération et synchronisation des données côté frontend.

**Contexte**  
Le Chantier 4 vise à centraliser les appels API, homogénéiser les hooks métier et supprimer les appels directs au backend depuis les composants.

**Décision**  
Adoption de TanStack Query v5 comme bibliothèque standard de data-fetching et de gestion de cache serveur côté frontend.

**Justification**  
- standard éprouvé
- cohérence avec l’objectif de centralisation
- gestion robuste du cache, invalidation, états loading/error
- adapté à la structuration de hooks métier homogènes

**Conséquences**  
- les nouveaux hooks métier frontend s’appuient sur TanStack Query v5
- les appels directs `fetch` / `axios` dans les composants sont interdits
- le Chantier 4 doit créer le cadre commun d’utilisation

**Statut**  
Active

---

## 2026-04-17 – Interdiction du fallback `?? []` instable dans les hooks TanStack Query

**Sujet**
Référence instable comme dépendance `useEffect` — boucle de rendu infinie.

**Contexte**
Lors du Chantier 4, `useMapStructure.ts` retournait `mapRubriques: query.data ?? []`. Quand `query.data` est `undefined` (query désactivée ou en chargement), cette expression crée une nouvelle référence `[]` à chaque rendu. `mapRubriques` étant en dépendance de `useEffect` dans `LeftSidebar`, l'effet se déclenchait à chaque rendu, appelait `setMapItems([])` (autre nouvelle référence), provoquant une nouvelle passe, et ainsi de suite. Résultat : `Maximum update depth exceeded` dès l'ouverture d'un projet.

**Décision**
- Tout hook retournant un tableau depuis TanStack Query **doit** utiliser une constante module-level stable comme fallback.
- Le pattern `query.data ?? []` est explicitement interdit si le tableau résultant est utilisé comme dépendance `useEffect`.
- Règle ajoutée dans `gov_forbidden-patterns.md` (§ 4.3).

**Justification**
- `Object.is([], [])` est `false` — deux tableaux vides distincts ne sont jamais égaux pour React.
- Le bug est silencieux à l'écriture (le code compile) mais catastrophique à l'exécution.
- La constante module-level est la correction minimale, sans impact sur le comportement métier.

**Conséquences**
- Tous les hooks TanStack Query exposant des tableaux doivent être audités (`useAllDictionnaireData`, etc.).
- Le Chantier 4 n'est pas clôturé tant que le correctif n'est pas validé en runtime.
- Pattern ajouté au référentiel de gouvernance.

**Statut**
Active

---

## 2026-04-17 – Format canonique de `contenu_xml` : wrapper `<body>`

**Sujet**
Définition du format attendu pour le champ `contenu_xml` des rubriques.

**Contexte**
L'analyse du bug "contenu XML invalide" a révélé que `tiptapToXml()` retourne une concaténation de nœuds TipTap sans wrapper racine (ex. `<p>a</p>\n<p>b</p>`). Ce fragment multi-racines est stocké dans `xmlBufferStore` puis envoyé directement au backend via `useRubriqueSave`. Le backend (`Rubrique.clean()`) utilise `ET.fromstring()` qui exige un seul élément racine — le XML multi-racines est donc rejeté ou produit une erreur silencieuse. L'erreur "contenu XML invalide" apparaît au rechargement de la rubrique, car `parseXmlToTiptap` utilise aussi `DOMParser` avec `application/xml`, qui produit un `<parsererror>` sur les fragments multi-racines.

**Décision**
Le champ `contenu_xml` d'une rubrique doit **toujours** contenir un XML bien formé à racine unique `<body>`.

- Le wrapper est ajouté dans `useXmlBufferSync` **avant** stockage dans le buffer, pas dans `tiptapToXml`.
- `tiptapToXml` conserve son contrat de sérialiseur de nœuds (sans responsabilité de wrapping).
- `useDitaLoader` applique une tolérance de chargement : si le XML stocké est un fragment sans racine unique (détecté par `<parsererror>` DOMParser), il est wrappé avec `<body>` avant parsing — gère les données dégradées existantes en base sans migration.
- Le template d'initialisation des nouvelles rubriques (LeftSidebar) est aligné sur `<body>` au lieu de `<topic>`.

**Justification**
- `<body>` est cohérent avec le parser existant `parseXmlToTiptap` (ligne 450 : `if container.tagName === "body"` → aplatit les enfants — c'est le seul wrapper nativement supporté sans effet de bord structurel).
- `<topic>` est détruit lors du round-trip : `parseXmlToTiptap` ne le liste pas dans `STRUCTURAL_ROOTS` → cherche `<body>` enfant → aplatit → `tiptapToXml` reconstruit sans wrapper. Résultat : le wrapper `<topic>` disparaît à la première édition.
- `ET.fromstring("<body>...</body>")` est valide — aucune modification backend requise.
- La tolérance au chargement dans `useDitaLoader` évite une migration base de données.

**Conséquences**
- `useXmlBufferSync` : wrapping `<body>` obligatoire après `tiptapToXml`.
- `useDitaLoader` : tolérance de chargement pour données dégradées (fragment → `<body>` avant parsing).
- `LeftSidebar` : template init aligné sur `<body>` (suppression de `<topic>`).
- Backend : aucune modification requise.
- Données existantes en base : gérées à la lecture par la tolérance `useDitaLoader`, sans migration.
- Toute autre partie du code construisant ou lisant `contenu_xml` (export DITA, diff de révisions) doit traiter le wrapper `<body>`.

**Statut**
Active — validée le 2026-04-18

**Validation (2026-04-18)**
- `useXmlBufferSync` : wrapping `<body>` confirmé avant stockage dans le buffer ✅
- `useDitaLoader` : tolérance appliquée sur fragment XML sans racine (données dégradées) ✅
- `LeftSidebar` : template d'initialisation utilise bien `<body>` ✅
- Round-trip complet (édition → sauvegarde → rechargement → vérification contenu) : OK ✅

---

## 2026-04-18 – Entité VersionProduit indépendante de VersionProjet

**Sujet**
Modèle de versioning côté produit dans ProductDocSync.

**Contexte**
ProductDocSync gère les versions d'un logiciel (ex. "v2.1") et leurs fonctionnalités associées. L'entité existante `VersionProjet` est liée à `Projet` (cycle documentaire). Brancher ProductDocSync sur `VersionProjet` aurait été une erreur métier fondamentale : les deux cycles de vie sont indépendants.

**Décision**
Créer une entité `VersionProduit` **indépendante**, liée à `Produit` (et non à `Projet`).

Modèle cible :
- `produit` : ForeignKey → `Produit`
- `numero` : CharField (ex. `"2.1"`)
- `statut` : Choices `en_preparation` / `publiee` / `archivee`
- `date_publication` : DateTimeField nullable
- Contrainte d'unicité : `(produit, numero)`

Endpoints canoniques à créer :
- `GET /api/versions-produit/?produit={id}` — liste les versions d'un produit
- `POST /api/versions-produit/` — crée une version
- `PATCH /api/versions-produit/{id}/` — met à jour (ex. numéro, statut)
- `POST /api/versions-produit/{id}/publier/` — publie la version (statut → `publiee`, horodatage)

**Justification**
- `VersionProjet` appartient au cycle éditorial (publication documentaire) — il ne doit pas être pollué par le cycle produit.
- Une `VersionProduit` peut coexister avec plusieurs `VersionProjet` sans dépendance structurelle.
- La séparation respecte le principe fondamental de découplage des cycles de vie (cf. `10_VERSIONING_DOCUMENTAIRE.md`).
- Cohérent avec le principe `structure ≠ contenu` étendu ici à `versioning documentaire ≠ versioning produit`.

**Conséquences**
- Backend : nouveau modèle `VersionProduit` + migration + `VersionProduitViewSet` + service `publier_version_produit()`.
- `10_BACKEND_CANONIQUE.md` : documenter les nouveaux endpoints avant implémentation frontend.
- `10_CARTOGRAPHIE_BACKEND_CANONIQUE_EXPOSE.md` : ajouter les routes `/api/versions-produit/*`.
- Frontend : hook `useVersionProduitList(produitId)` + `useVersionProduitCreate()`.
- `handleAddVersion` et `handlePublishVersion` dans ProductDocSync peuvent être branchés sur l'API.
- Phase 2 de `PRODUCTDOCSYNC_ROADMAP.md` est débloquée.
- `PRODUCTDOCSYNC_SPEC_METIER.md` section 8.1 est résolue.

**Statut**
Active — implémentation à faire (backend en premier, frontend ensuite)

---

## 2026-04-18 – EvolutionProduit comme entité centrale du suivi de version

**Sujet**
Modèle de suivi de version dans ProductDocSync — introduction de l'entité `EvolutionProduit`.

**Contexte**
La v0.1 de la spec attribuait à `Fonctionnalite` le double rôle de référentiel stable et d'unité d'évolution versionnée. Ce couplage posait un problème : une même fonctionnalité peut être concernée par plusieurs évolutions dans des versions différentes, et son historique devenait difficile à tracer sans dupliquer les données.

**Décision**
Introduire `EvolutionProduit` comme entité centrale du suivi de version, et redéfinir `Fonctionnalite` comme entité de référentiel stable.

Séparation des rôles :
- `Fonctionnalite` : référentiel pérenne des fonctionnalités d'un produit (géré dans Settings > DataTab).
- `EvolutionProduit` : occurrence d'évolution ou de correctif dans une `VersionProduit` spécifique, qui référence une `Fonctionnalite`.
- `ImpactDocumentaire` : lie désormais une `EvolutionProduit` à une `Rubrique` (et non plus `Fonctionnalite` → `Rubrique`).

Modèle `EvolutionProduit` :
- `version_produit` : ForeignKey → `VersionProduit`
- `fonctionnalite` : ForeignKey → `Fonctionnalite` (référentiel)
- `type` : Choices `evolution` / `correctif`
- `description` : TextField
- `ordre` : PositiveIntegerField
- `statut` : Choices `draft` / `valide`

Statut `ignore` ajouté à `ImpactDocumentaire` : permet de marquer un impact comme non pertinent sans le supprimer.

**Justification**
- Sépare proprement le référentiel (stable, multi-versions) de l'événement versionné (spécifique à une version).
- Permet de tracer l'historique d'une fonctionnalité à travers plusieurs versions sans duplication.
- Cohérent avec le principe de séparation des responsabilités (référentiel ≠ événement).

**Conséquences**
- Backend : nouveau modèle `EvolutionProduit` + migration + `EvolutionProduitViewSet` + service `reorder_evolutions_produit()`.
- `ImpactDocumentaire` : clé étrangère à modifier de `Fonctionnalite` → `EvolutionProduit`.
- `10_BACKEND_CANONIQUE.md` § 9 : mettre à jour le modèle `EvolutionProduit` et les endpoints.
- `PRODUCTDOCSYNC_ROADMAP.md` : phases 1 et 3 impactées (les tâches liées à `Fonctionnalite` comme unité d'évolution sont à réviser).
- Le champ `ordre` initialement prévu sur `Fonctionnalite` est déplacé sur `EvolutionProduit`.
- `TestPlanModal` est exclu du périmètre V1.

**Statut**
Active — implémentation à faire (backend en premier)

---

## 2026-04-18 – Implémentation backend VersionProduit et EvolutionProduit

**Sujet**
Décisions d'implémentation non triviales prises lors de la création des modèles `VersionProduit` et `EvolutionProduit`.

**Contexte**
Les modèles, services et endpoints définis dans `10_BACKEND_CANONIQUE.md` §§ 9.1 et 9.2 ont été implémentés. Plusieurs choix techniques méritent d'être tracés.

**Décisions**

1. **`EvolutionProduit.description` : `blank=True, default=""` sans `null=True`**
   - Convention Django : les TextFields n'utilisent pas `null=True` — la chaîne vide représente l'absence de valeur.
   - Le référentiel décrit le champ comme "nullable, blank" dans une perspective métier. En base, `null=False` avec `default=""` est équivalent et conforme aux conventions Django (linter S6553).

2. **`EvolutionProduit.is_archived` ajouté au modèle**
   - La spec définit `PATCH /{id}/archive/` sans mentionner explicitement `is_archived`. Le champ a été ajouté pour s'aligner sur le pattern `ArchivableModelViewSet` déjà utilisé par `Fonctionnalite`, `Gamme`, etc.
   - Alternative rejetée : ajouter un statut `archive` dans les choices `EvolutionProduit.statut`. Cela aurait mélangé le statut métier (draft/valide) avec l'état de suppression logique.

3. **`VersionProduitViewSet` n'hérite PAS de `ArchivableModelViewSet`**
   - L'archivage d'une `VersionProduit` se fait via `PATCH statut=archivee` (validé dans le serializer), pas via un endpoint `/archive/`. La spec le confirme.
   - `ArchivableModelViewSet` s'appuie sur `is_archived` — champ absent de `VersionProduit` intentionnellement (le statut est la source de vérité).

4. **Validation de publication dans le serializer, pas dans le service**
   - Le serializer `VersionProduitSerializer.validate()` bloque `statut=publiee` via PATCH et l'archivage d'une version déjà publiée.
   - Le service `publier_version_produit()` gère les mêmes cas pour les appels directs (tests service). Défense en profondeur.

5. **`reorder_evolutions_produit()` : pas de validation cross-version**
   - Le service n'exige pas que tous les IDs appartiennent à la même `VersionProduit`. C'est la responsabilité du client (frontend). Ajouter cette validation serait une sur-spécification non demandée dans le référentiel.

6. **`VersionProduitViewSet.get_queryset()` : exclusion des archivées par défaut**
   - `GET /api/versions-produit/` exclut les versions archivées sauf `?archived=true`. Cohérent avec la spec ("non archivées par défaut") et avec le comportement de `ArchivableModelViewSet.get_queryset()` sur les autres entités.

**Conséquences**
- Migration `0012_versionproduit_evolutionproduit.py` appliquée.
- 21 tests d'intégration verts couvrant tous les invariants de la spec.
- `10_CARTOGRAPHIE_BACKEND_CANONIQUE_EXPOSE.md` mis à jour (§§ 3.7, 3.8, §4).
- Frontend : peut brancher `handleAddVersion`, `handlePublishVersion` sur les endpoints canoniques.

**Statut**
Active — Phase 1 (backend) terminée. Phase 2 (frontend) à démarrer.

---

## 2026-04-18 — Endpoints custom médiathèque : préfixe URL sans `/api/`

**Sujet**
Préfixe des endpoints custom médiathèque dans le routeur Django

**Contexte**
Lors du branchement API RightSidebar Phase 1, les hooks `useMediaNomCheck` et `useImportMedia` appelaient `/api/medias-check-nom/` et `/api/import/media/`. Ces routes renvoyaient 404 car les endpoints custom sont enregistrés sans préfixe `/api/` dans `documentation/urls.py`, inclus à la racine dans `documentation_project/urls.py`.

**Décision**
Les endpoints custom médiathèque sont et restent enregistrés **sans préfixe `/api/`** :
- `GET /medias-check-nom/` → `check_media_names`
- `POST /import/media/` → `upload_media`

Le préfixe `/api/` est réservé exclusivement aux routes du `DefaultRouter` DRF (ViewSets CRUD).

**Justification**
- Cohérence avec l'architecture existante (les vues custom Django ne passent pas par le router DRF)
- Modification du routage backend non souhaitable — les hooks frontend doivent s'y conformer

**Conséquences**
- Hooks corrigés : `useMediaNomCheck` → `/medias-check-nom/`, `useImportMedia` → `/import/media/`
- Règle à respecter pour tout futur endpoint custom : vérifier le préfixe dans `documentation/urls.py` avant d'appeler depuis le frontend

**Statut**
Active

---

## Règle de clôture

Toute décision listée ici :
- fait autorité,
- s’impose au projet,
- peut être remise en question uniquement via une nouvelle entrée documentée.

La mémoire du projet est un actif, pas une contrainte.
