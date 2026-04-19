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

## 2026-04-19 – ProductDocSync Phase 4 : saut partiel et blocage TestPlanModal

**Sujet**  
Décision de sauter la Phase 4 de ProductDocSync et de bloquer `TestPlanModal` §4.1

**Contexte**  
La Phase 4 visait deux objectifs : (1) alimenter `ImpactMapModal` avec des données réelles, (2) brancher `TestPlanModal` sur un backend de génération de plan de test. §4.2 a été livré en avance dans Phase 3 §3.3. §4.1 nécessite un backend de "Gestion de Production" qui n'existe pas encore dans Nexus.

**Décision**  
- Phase 4 considérée comme **partiellement livrée** et sautée.
- §4.1 (`TestPlanModal` backend) : **bloqué** jusqu'au développement du module **Gestion de Production** de Documentum Nexus. Aucune implémentation frontend ne sera conduite avant que ce module soit spécifié et livré.
- §4.3 (vue multi-évolutions dans `ImpactMapModal`) : **reporté** — la carte d'impact fonctionne pour une évolution sélectionnée ; l'extension à la vue "version produit complète" est une amélioration future à planifier dans une itération dédiée.

**Justification**  
- Implémenter `TestPlanModal` sans backend réel produirait un stub non maintenable.
- Le module Gestion de Production est une dépendance métier non négociable (plan de test = objet de production, pas de documentation pure).
- La vue multi-évolutions est une amélioration non bloquante.

**Conséquences**  
- `TestPlanModal` reste en mode stub (`console.log`) jusqu'à livraison Gestion de Production.
- `ImpactMapModal` affiche les impacts d'une seule `EvolutionProduit` à la fois.
- La prochaine action ProductDocSync est **Phase 5** (nettoyage & stabilisation).
- Le module Gestion de Production est ajouté au backlog Nexus comme prérequis §4.1.

**Statut** Active

---

## 2026-04-19 – RightSidebar Phase 3 : insertion image dans CentralEditor

**Sujet**
Couplage RightSidebar (médiathèque) ↔ CentralEditor (éditeur TipTap) pour l'insertion d'une image DITA depuis le panel média.

**Contexte**
RightSidebar et CentralEditor sont des composants sibling dans Desktop. Aucun mécanisme n'existait pour passer un `MediaItem` sélectionné depuis la médiathèque vers l'éditeur. Le mode floating (portal) de RightSidebar rendait le prop drilling techniquement fragile.

**Décision**
- Couplage via un store Zustand dédié : `usePendingMediaStore` (`pendingImage / setPendingImage / clearPendingImage`).
- UX : bouton "Insérer" explicite sur chaque `MediaCard` (le clic image existant → `ImagePreview` n'est pas modifié).
- `SyncEditor` : hors scope (éditeur HTML libre, pas DITA — Image extension non chargée).
- Fix sérialisation : `tiptapToXml.ts` gère désormais `image` en cas spécial — l'attribut TipTap interne `src` est renommé en `href` à la sérialisation, conformément au format DITA canonique `<image href="..." alt="..." />`.
- `Desktop.tsx` : aucune modification (le store est le pont — Desktop reste découplé).

**Justification**
- Le store Zustand est le pattern établi dans le projet pour les états transverses (cf. `useSelectionStore`, `useXmlBufferStore`).
- Le prop drilling aurait nécessité de modifier Desktop pour passer un callback RightSidebar → CentralEditor, fragilisant la composition et rendant le mode floating plus complexe.
- Le fix `src` → `href` est non négociable : le backend Django et les outils DITA attendent `href` sur `<image>`.

**Conséquences**
- `src/store/usePendingMediaStore.ts` créé.
- `MediaCard`, `MediaPanel`, `RightSidebar` : prop `onInsertImage` propagée jusqu'au store.
- `CentralEditor` : `useEffect` sur `pendingImage` → `editor.chain().focus().setImage(...)` → `clearPendingImage()`.
- Round-trip XML → TipTap → XML : `<image href="FILE.png" alt="FILE.png" />` préservé.

**Statut** Active

---

## 2026-04-19 – Blocage outdent sur nœud de premier niveau

**Sujet**  
Correction du bug "Plusieurs racines documentaires détectées"

**Contexte**  
Un nœud de niveau 2 (enfant direct de la racine documentaire) pouvait être désindentté, ce qui lui assignait `parent = null` et créait une deuxième racine. L'erreur se manifestait dans `mapRubriquesToMapItems` à la reconstruction des `MapItem`.

**Décision**  
- Bloquer l'outdent à deux niveaux :
  1. **Frontend** : `canOutdent` vérifie que `parent.parentId != null` (pas de second root) ; guard dans `handleOutdent` avant appel API.
  2. **Backend** : `outdent_map_rubrique` lève `ValidationError` si `grandparent is None`.
- Principe : défense en profondeur — le frontend empêche l'action, le backend rejette en dernier recours.

**Justification**  
La racine documentaire est un invariant structurel de la map. Il ne peut exister qu'un seul nœud sans parent. Toute opération produisant un second nœud sans parent est structurellement invalide.

**Conséquences**  
- `MapItem.tsx` : `canOutdent(item, items)` — signature étendue
- `LeftSidebar.tsx` : guard pré-appel API dans `handleOutdent`
- `services.py` : guard post-verrouillage parent dans `outdent_map_rubrique`

**Statut** Active

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

## 2026-04-18 – Implémentation backend ImpactDocumentaire (Phase 3)

**Sujet**
Décisions d'implémentation prises lors de la création du modèle `ImpactDocumentaire`, ses services, son ViewSet et sa migration.

**Contexte**
Phase 3 du roadmap ProductDocSync. `ImpactDocumentaire` est l'entité centrale de la valeur Nexus : elle relie une `EvolutionProduit` à une `Rubrique` avec un statut de pilotage documentaire. Modèle et endpoints documentés dans `10_BACKEND_CANONIQUE.md § 9.3` avant implémentation.

**Décisions**

1. **`rubrique` : `on_delete=PROTECT` (pas `CASCADE`)**
   - La spec mentionne `on_delete=CASCADE`. Décision : utiliser `PROTECT` pour éviter la suppression silencieuse d'impacts documentaires lors de la suppression d'une rubrique.
   - Un impact représente un engagement de travail documentaire — perdre cet historique par cascade serait une perte métier. La rubrique doit d'abord être détachée de ses impacts.

2. **`create_impact_documentaire` : vérification applicative AVANT insertion DB**
   - La contrainte `unique_together` au niveau DB aurait suffi (DRF la détecte aussi via `UniqueTogetherValidator` automatique du serializer ModelSerializer).
   - La vérification applicative dans le service est une défense en profondeur pour les appels directs au service hors API (tests service, tâches asynchrones futures).

3. **Action `update_statut` dédiée plutôt que PATCH standard**
   - Choix : `PATCH /api/impacts/{id}/update_statut/` plutôt que `PATCH /api/impacts/{id}/`.
   - Justification : la mise à jour du statut est l'opération principale sur `ImpactDocumentaire`. Une action dédiée la rend explicite, valide le choix via `ChoiceField`, et délègue au service — pas de logique dans le ViewSet.
   - Le PATCH standard DRF reste accessible pour les autres champs si besoin.

4. **Filtrage double : `?evolution_produit` ET `?rubrique`**
   - Les deux filtres sont orthogonaux et cumulables (`AND`).
   - `?evolution_produit` : usage principal (SyncBottombar — "quelles rubriques sont impactées par cette évolution ?")
   - `?rubrique` : usage secondaire (analytics — "quelle évolution impacte cette rubrique ?")

5. **Tests : Rubrique créée avec `contenu_xml` XML valide**
   - `Rubrique.clean()` valide le XML via `ET.fromstring()`. Les fixtures de test utilisent `<topic><title>Test</title></topic>`.
   - Pas de mock du model.clean() — les tests d'intégration testent le système complet.

**Conséquences**
- Migration `0013_impactdocumentaire.py` appliquée.
- 7 tests d'intégration verts (`ImpactDocumentaireAPITest`), total 28 tests ProductDocSync OK.
- `10_BACKEND_CANONIQUE.md § 9.3` complété avec endpoints réels, services et notes.
- Frontend Phase 3 peut désormais brancher `SyncBottombar` sur `GET /api/impacts/?evolution_produit={id}` et `PATCH /api/impacts/{id}/update_statut/`.

**Statut**
Active — Phase 3 backend terminée. Phase 3 frontend SyncBottombar livré (voir entrée 2026-04-18 – Phase 3 frontend). ImpactMapModal reste en Phase 4.

---

## 2026-04-18 – Généralisation Nexus par contexte produit

**Décision**
- Introduction du concept de context_produit
- Généralisation de ProductDocSync → Pilotage documentaire
- Généralisation du modèle :
  - Fonctionnalité → ObjetMétier
  - ÉvolutionProduit → ÉvénementMétier

**Impact**
- architecture modulaire Nexus
- modèle métier Documentum
- frontend (activation des modules)
- nomenclature des modules

**Statut**
Active

---

## 2026-04-18 – Phase 3 frontend ImpactDocumentaire livré (SyncBottombar)

**Sujet**
Branchement du composant `SyncBottombar` sur l'API `ImpactDocumentaire` — remplacement de l'état local par des données persistées.

**Contexte**
Phase 3 frontend du roadmap ProductDocSync. Le backend ImpactDocumentaire étant livré (`/api/impacts/`), le composant `SyncBottombar` consommait encore un état React local (`ImpactItem[]`) sans persistance. L'objectif est de brancher tous les handlers sur les endpoints canoniques.

**Décisions**

1. **`useRubriqueListForImpact` créé dans `useImpactDocumentaire.ts` (staleTime 60s)**
   - La liste des rubriques pour le dialog d'ajout d'impact est chargée une fois et mise en cache 60 secondes.
   - Justification : les rubriques changent rarement dans un contexte de session ProductDocSync — une requête par session suffit. `staleTime 10_000` (pattern standard des autres hooks) aurait provoqué des rechargements inutiles à chaque ouverture du dialog.
   - Alternative rejetée : hook dédié `useRubriqueList` dans un fichier séparé. Rejeté car l'usage est spécifique aux impacts — aucun autre composant ne l'utilise pour l'instant.

2. **`selectedEvolutionId` passé depuis `ProductDocSync` vers `SyncBottombar`**
   - `selectedFeature` (type `number | null`) dans `ProductDocSync` est l'ID de l'`EvolutionProduit` sélectionnée — c'est exactement `selectedEvolutionId`.
   - Pas de dérivation nécessaire : le même état sert les deux usages (sidebar gauche + bottombar).
   - `SyncBottombar` reçoit `selectedEvolutionId` et désactive le bouton `+` si null.

3. **`ImpactItem` local supprimé — remplacé par `ImpactDocumentaire` de `src/api/impacts.ts`**
   - Le type local avait des champs spécifiques à l'UI (featureName, type, titre) qui ne correspondent pas au modèle backend.
   - `ImpactDocumentaire` expose `rubrique_titre` (dénormalisé côté backend) — aucun mapping nécessaire.
   - Le tableau `SyncBottombar` est simplifié : Rubrique impactée / Statut / Actions (suppression).

4. **`features: FeatureItem[]` supprimé de `SyncBottombarProps`**
   - Cette prop alimentait le select "fonctionnalité" de l'ancien dialog d'ajout. Avec `ImpactDocumentaire`, le dialog sélectionne une rubrique (chargée via `useRubriqueListForImpact`), pas une fonctionnalité.
   - Le composant est désormais autonome : il charge ses propres données via les hooks.

5. **Dialog d'ajout : sélection de rubrique sur `GET /api/rubriques/`**
   - Limitation connue : la liste retourne toutes les rubriques non archivées, sans filtre par projet.
   - Justification Phase 3 : la relation Produit → Projet n'est pas encore modélisée côté frontend. Un filtre par projet sera ajouté en Phase 4 si la relation est exposée.

**Conséquences**
- `src/api/impacts.ts` créé — types `StatutImpact`, `ImpactDocumentaire`, 4 fonctions API.
- `src/hooks/useImpactDocumentaire.ts` créé — 5 hooks TanStack Query v5 avec invalidation ciblée.
- `SyncBottombar.tsx` réécrit — 0 état local métier, tout via hooks.
- `ProductDocSync.tsx` : prop `features` retirée du call `<SyncBottombar>`, `selectedEvolutionId` ajouté.
- Build Vite : 2265 modules, 0 erreur.

**Statut**
Active — Phase 3 frontend SyncBottombar livré. ImpactMapModal avec données réelles reste en Phase 4.

---

## 2026-04-18 – Stratégie de suggestion des rubriques impactées dans ImpactDocumentaire

**Sujet**
Stratégie de suggestion automatique des rubriques cibles lors de la création d'un `ImpactDocumentaire`.

**Contexte**
En V1, l'utilisateur sélectionne manuellement la rubrique impactée dans un select exhaustif (`GET /api/rubriques/`). Cette approche est fonctionnelle mais peu ergonomique : un projet peut contenir des centaines de rubriques. Deux options d'amélioration ont été évaluées :

- **Option A — Auto-détection textuelle** : analyser le contenu des rubriques pour détecter des correspondances avec la description de l'évolution.
- **Option B — Suggestion par historique** : si une `Fonctionnalite` a déjà impacté une `Rubrique` dans une version précédente, la proposer comme suggestion lors de la création d'un nouvel `ImpactDocumentaire` pour la même `Fonctionnalite`.

**Décision**

- **V1 (actuel)** : sélection manuelle de la rubrique cible par l'utilisateur.
- **V1.1 (planifié)** : suggestion automatique par historique — requête `GET /api/impacts/?fonctionnalite={id}` (ou jointure via `EvolutionProduit`) pour pré-cocher les rubriques déjà associées à cette fonctionnalité dans des versions antérieures.
- **Horizon Nexus** : couche IA de suggestion de rubriques impactées — point ouvert, à spécifier dans une décision dédiée avant toute implémentation.

**Justification**
L'Option A (auto-détection textuelle) est rejetée : taux de faux positifs élevé, coût algorithmique non négligeable, résultat difficile à expliquer à l'utilisateur. L'Option B (historique) est pertinente métier, déterministe, et ne nécessite aucun modèle IA — elle exploite des données déjà persistées.

**Conséquences**
- V1.1 requiert un endpoint ou une jointure exposant l'historique des impacts par `Fonctionnalite`.
- Aucune modification backend pour V1 — la suggestion est côté frontend (filtre sur les impacts existants).
- Le scope Nexus (IA) fera l'objet d'une entrée dédiée dans ce log avant implémentation.

**Statut**
Active — V1 implémentée. V1.1 à planifier (pas de milestone défini). Nexus IA : point ouvert.

---

## 2026-04-18 – Champ `notes` sur ImpactDocumentaire

**Sujet**
Ajout d'un champ `notes` au modèle `ImpactDocumentaire` pour capturer les consignes de rédaction spécifiques à chaque rubrique impactée.

**Contexte**
Une `EvolutionProduit` peut impacter N rubriques, chacune avec une expression documentaire différente de la modification. Exemple : une mise à jour d'un module — la description dans l'écran de saisie diffère de celle dans le rapport de conformité, qui diffère elle-même de celle dans la fiche employé. Le champ `description` de `EvolutionProduit` capture la description globale de l'évolution, pas les instructions spécifiques à chaque rubrique.

**Décision**
Ajouter `notes = models.TextField(blank=True, default="")` sur `ImpactDocumentaire`.

Les deux niveaux de notes coexistent et sont complémentaires :
- `EvolutionProduit.description` = description globale de l'évolution (contexte produit)
- `ImpactDocumentaire.notes` = consigne de rédaction spécifique à cette rubrique (instruction documentaire)

Convention Django respectée : `TextField` sans `null=True` — la chaîne vide représente l'absence de note (cf. décision 2026-04-18 – Implémentation backend VersionProduit et EvolutionProduit, point 1).

**Justification**
Sans ce champ, la nuance rédactionnelle par rubrique est perdue — l'auteur documentaire n'a pas de guidage précis sur ce qu'il doit modifier dans chaque rubrique. Le champ est facultatif (`blank=True`) : il n'alourdit pas le workflow pour les impacts simples.

**Conséquences**
- Migration `0014_impactdocumentaire_notes` à créer.
- `ImpactDocumentaireSerializer` : ajouter `notes` dans `fields`.
- `SyncBottombar` : afficher/éditer `notes` dans le tableau ou un panneau de détail (à spécifier en Phase 4).
- Aucune modification des services — `notes` est un champ libre sans règle métier.

**Statut**
Active — implémentation backend à faire (migration `0014`). Frontend Phase 4.

---

## 2026-04-18 – Format de stockage des notes ImpactDocumentaire : HTML TipTap

**Sujet**
Format de données utilisé pour stocker le contenu du champ `ImpactDocumentaire.notes`.

**Contexte**
`SyncEditor` utilise TipTap pour l'édition. Deux options de sérialisation étaient possibles pour persister les notes : HTML (sortie native TipTap) ou DITA XML (format canonique Documentum).

**Décision**
Le champ `notes` stocke du **HTML TipTap** — pas du DITA XML.

**Justification**
Les notes d'impact sont des consignes de rédaction à usage interne du suivi de version. Elles ne sont pas destinées à être :
- réutilisées dans d'autres rubriques ou documents,
- publiées dans un format exporté (PDF, HTML, SCORM),
- parsées ou transformées par le pipeline DITA-OT.

Structurer ces notes en DITA XML n'apporterait aucune valeur métier et imposerait une contrainte inutile à l'auteur. Le HTML TipTap est suffisant, lisible, et directement rendu par l'éditeur.

**Conséquences**
- `ImpactDocumentaire.notes` = `TextField` acceptant du HTML — aucune validation XML.
- `SyncEditor` en mode notes : `editor.getHTML()` est la source de vérité à persister.
- `getAllExtensions()` peut être utilisé dans SyncEditor mais les extensions DITA (Body, Section, Steps…) ne produiront jamais de valeur dans ce contexte. Une version allégée `getRichTextExtensions()` (StarterKit + TextStyle + Color + TextAlign + GrammarHighlight) est recommandée pour une future refactorisation — non prioritaire.
- **Règle** : ne jamais appeler `editor.getJSON()` ni tenter de sérialiser en DITA XML depuis SyncEditor.

**Statut**
Active.

## 2026-04-19 – NodeView React requis pour l'extension Image TipTap

Décision : l'extension Image doit exposer un NodeView React
pour que TipTap puisse rendre les balises <image> dans l'éditeur.
Sans NodeView, le node est ignoré silencieusement à l'affichage.

Règle : toute extension TipTap gérant un élément visuel
doit implémenter un NodeView — ne pas se fier au rendu HTML natif.

**Statut**
Active.

---

## Règle de clôture

Toute décision listée ici :
- fait autorité,
- s’impose au projet,
- peut être remise en question uniquement via une nouvelle entrée documentée.

La mémoire du projet est un actif, pas une contrainte.
