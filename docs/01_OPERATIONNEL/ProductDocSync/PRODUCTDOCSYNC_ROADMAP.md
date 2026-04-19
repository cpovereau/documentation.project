# ProductDocSync — Roadmap & Suivi

Document de référence pour suivre l'évolution de l'écran `ProductDocSync` et de ses sous-composants (`SyncLeftSidebar`, `SyncEditor`, `SyncBottombar`, `SyncRightSidebar`, `ImpactMapModal`, `TestPlanModal`).  
Ce document est synthétique, durable, et conçu pour un travail non linéaire dans le temps.

> 📄 **Spécification métier** : [PRODUCTDOCSYNC_SPEC_METIER.md](PRODUCTDOCSYNC_SPEC_METIER.md) — entités métier, acteurs, flux, règles et points ouverts (arbitrages à trancher).

---

# 🧭 Vue d'ensemble du plan

L'évolution est organisée en **5 phases** :

1. **Phase 1 — Branchement API évolutions (LIVRÉ ✅)**
2. **Phase 2 — Branchement API produits et versions (LIVRÉ ✅)**
3. **Phase 3 — ImpactDocumentaire : modèle, API, SyncBottombar, ImpactMapModal, Notes, Usages (LIVRÉ ✅)**
4. **Phase 4 — Plan de test et carte d'impact (PARTIELLEMENT LIVRÉ ⚠️)**
5. **Phase 5 — Nettoyage et stabilisation technique (LIVRÉ ✅ — 2026-04-19)**

---

# ✅ État actuel (2026-04-19 — Phases 1, 2, 3 livrées intégralement)

### Ce qui fonctionne
- Layout complet en 4 zones : `SyncLeftSidebar`, `SyncEditor`, `SyncBottombar`, `SyncRightSidebar`
- Navigation entre évolutions (sélection, expansion, collapse)
- **Réordonnancement drag & drop persisté** → `PATCH /api/evolutions-produit/reorder/` ✅
- Copier / coller une évolution → `POST /api/evolutions-produit/` (persisté) ✅
- Archivage d'une évolution → `PATCH /api/evolutions-produit/{id}/archive/` (persisté) ✅
- Ajout d'une évolution → dialog + `POST /api/evolutions-produit/` (persisté) ✅
- **Produits** depuis `GET /api/produits/` via `useProduits` ✅
- **Versions** depuis `GET /api/versions-produit/?produit={id}` via `useVersionProduitList` ✅
- **EvolutionProduit** depuis `GET /api/evolutions-produit/?version_produit={id}` via `useEvolutionProduitList` ✅
- **Création de version** → `POST /api/versions-produit/` via `useVersionProduitCreate` ✅
- **Publication de version** → `POST /api/versions-produit/{id}/publier/` + toast ✅
- **ImpactDocumentaire dans `SyncBottombar`** — branché API ✅
  - Chargement → `GET /api/impacts/?evolution_produit={id}` via `useImpactList` ✅
  - Ajout d'impact → dialog rubrique + `POST /api/impacts/` via `useImpactCreate` ✅
  - Mise à jour statut inline → `PATCH /api/impacts/{id}/update_statut/` via `useImpactUpdateStatut` ✅
  - Suppression → `DELETE /api/impacts/{id}/` via `useImpactDelete` ✅
  - Sélection ligne → highlight visuel + `onImpactSelect` → `selectedImpact` dans ProductDocSync ✅
  - Usages rubrique → `GET /api/rubriques/{id}/usages/` via `useRubriqueUsages` + panneau inline ✅
- **Notes d'impact dans `SyncEditor`** — édition via TipTap (§ 3.4) ✅
  - Clic sur ligne → SyncEditor charge les notes dans TipTap avec Toolbar complète + dictée ✅
  - Bandeau contextuel (rubrique, type) en lecture seule ✅
  - Bouton "Enregistrer les notes" → `PATCH /api/impacts/{id}/update_notes/` ✅
- Bascule type d'article (évolution / correctif) dans `SyncEditor`
- Redimensionnement vertical de `SyncBottombar` par drag
- `ImpactMapModal` : graphe ReactFlow avec données réelles (§3.3) — sélection nœuds → plan de test ✅
- `TestPlanModal` : ouverture / fermeture / réordonnancement des tâches

### Ce qui ne fonctionne pas / reste à faire
- **Génération du plan de test** → fermeture modale sans action backend (Phase 4)
- **Fonctionnalites du référentiel** : pas de filtre `?produit=` côté backend — filtré en frontend

---

# ✅ Phase 1 — Branchement API évolutions (LIVRÉ — 2026-04-18)

### 🎯 Objectifs
- Charger les fonctionnalités depuis `FonctionnaliteViewSet` (déjà disponible côté backend).
- Persister les mutations (ajout, suppression, réordonnancement, indentation).

> Ce lot correspond à P4 dans le plan d'actions du gap analysis (`DOCUMENTUM_NEXUS_GAP_VALIDATION.md`).

### 🧩 Tâches

> ⚠️ **RÉVISION REQUISE (v0.2 spec — 2026-04-18)** : suite à l'introduction de `EvolutionProduit`, les tâches de la Phase 1 qui portaient sur `Fonctionnalite` comme unité d'évolution sont à réviser. `Fonctionnalite` est désormais un référentiel stable — les évolutions sont portées par `EvolutionProduit`. Voir `PRODUCTDOCSYNC_SPEC_METIER.md` et `gov_decision-log.md`.

#### 1.1 — Chargement initial (EvolutionProduit)

- [x] Créer `src/api/versionsProduit.ts` — types `EvolutionProduit` + fonction `getEvolutionsProduit`
- [x] Créer `useEvolutionProduitList(versionProduitId)` → `GET /api/evolutions-produit/?version_produit={id}`
- [x] Mapper `EvolutionProduit` vers `FeatureItem` (nom = `fonctionnalite_nom`, type → `hasEvolution`/`hasCorrectif`)
- [ ] Filtrage backend par produit (`?produit={id}`) sur `Fonctionnalite` — toujours côté frontend

#### 1.2 — Persistance des mutations (EvolutionProduit)

- [x] `handleAddFeature` → dialog (Fonctionnalite + type + description) + `POST /api/evolutions-produit/` ✅
- [x] `handleDeleteFeature` → `PATCH /api/evolutions-produit/{id}/archive/` via `useEvolutionProduitArchive` ✅
- [x] `handleReorder(newItems)` → `PATCH /api/evolutions-produit/reorder/` via `useEvolutionProduitReorder` ✅
- [x] Copier / coller → copie une `EvolutionProduit` avec même `fonctionnalite` + type ✅
- [ ] `handleIndent(id)` / `handleOutdent(id)` → non implémenté, cadrage mono-niveau (2026-04-16)

#### 1.3 — Nettoyage

- [x] Type `MinimalTask` gardé en local (Phase A) — à déplacer vers `src/types/` (Phase 5)

### 📝 Notes
Suite à la décision du 2026-04-18, l'arbre affiché dans `SyncLeftSidebar` représente des `EvolutionProduit` (et non plus des `Fonctionnalite`). `Fonctionnalite` est sélectionnée lors de la création d'une `EvolutionProduit` depuis un référentiel.

---

# ✅ Phase 2 — Branchement API produits et versions (LIVRÉ — 2026-04-18)

### 🎯 Objectifs
- Charger les produits disponibles depuis le référentiel DataTab.
- Charger les versions associées au produit sélectionné.
- Permettre la création de nouvelles versions avec persistance.

### 🧩 Tâches

#### 2.1 — Chargement produits

- [x] Remplacer la liste hardcodée par `GET /api/produits/` via `useProduits()`
- [x] `selectedProductId` est l'ID technique backend (number | null)
- [x] `productOptions` alignés sur les IDs backend

#### 2.2 — Chargement versions

- [x] Créer `useVersionProduitList(produitId)` → `GET /api/versions-produit/?produit={id}` ✅
- [x] Remplacer `useState(["1.0", "1.1", "1.2"])` hardcodé par ce hook ✅
- [x] `selectedVersion` = ID backend en string (valeur VersionSelect) ; label = `numero` ✅

#### 2.3 — Création de version

- [x] `handleAddVersion` → dialog (numéro de version) + `POST /api/versions-produit/` via `useVersionProduitCreate` ✅

#### 2.4 — Publication de version

- [x] `handlePublishVersion` → `POST /api/versions-produit/{id}/publier/` + toast succès/erreur ✅
- [x] Guard : statut `publiee` vérifié avant appel — toast d'erreur si déjà publiée ✅

### 📝 Notes
**Arbitrage tranché (2026-04-18)** : `VersionProduit` est une entité indépendante liée à `Produit` (pas à `Projet`). Les cycles documentaire et produit restent découplés. Voir `gov_decision-log.md` et `PRODUCTDOCSYNC_SPEC_METIER.md § 8.1`.

> ⚠️ Prérequis impératif : le modèle backend `VersionProduit` et ses endpoints doivent être documentés dans `10_BACKEND_CANONIQUE.md` **avant** toute implémentation frontend (règle de gouvernance).

---

# ✅ Phase 3 — ImpactDocumentaire : modèle, API, SyncBottombar, ImpactMapModal, Notes, Usages (LIVRÉ — 2026-04-19)

### 🎯 Objectifs
- Implémenter le modèle `ImpactDocumentaire` absent du backend.
- Permettre le pilotage documentaire : quelle rubrique est impactée par quelle fonctionnalité.

> Ce lot correspond à M1 + P5 dans le plan d'actions du gap analysis (`DOCUMENTUM_NEXUS_GAP_VALIDATION.md`).

### 🧩 Tâches

#### 3.1 — Backend : modèle `ImpactDocumentaire`

- [x] Créer le modèle `ImpactDocumentaire` : `EvolutionProduit` → `Rubrique` avec statuts `a_faire / en_cours / pret / valide / ignore` ✅
- [x] Exposer `GET/POST/PATCH/DELETE /api/impacts/` + action `PATCH /api/impacts/{id}/update_statut/` ✅
- [x] Modèle et endpoints documentés dans `10_BACKEND_CANONIQUE.md § 9.3` ✅
- [x] Services `create_impact_documentaire` et `update_statut_impact` avec logique métier ✅
- [x] 7 tests d'intégration verts (`ImpactDocumentaireAPITest`) ✅
- [x] Migration `0013_impactdocumentaire` appliquée ✅

#### 3.2 — Frontend : intégration dans `SyncBottombar`

- [x] Charger les rubriques impactées par l'évolution sélectionnée → `GET /api/impacts/?evolution_produit={id}` ✅
- [x] Afficher le statut d'avancement par rubrique ✅
- [x] Permettre la mise à jour du statut → `PATCH /api/impacts/{id}/update_statut/` ✅
- [x] Supprimer l'état local `ImpactItem` — remplacé par `ImpactDocumentaire` depuis `src/api/impacts.ts` ✅
- [x] Dialog d'ajout : sélection de rubrique via `GET /api/rubriques/` ✅
- [x] Suppression d'un impact → `DELETE /api/impacts/{id}/` ✅

#### 3.3 — Intégration dans `ImpactMapModal` (LIVRÉ ✅ — 2026-04-19)

- [x] Alimenter `ImpactMapGraph` via `useImpactList(evolutionId)` → `GET /api/impacts/?evolution_produit={id}` ✅
- [x] Remplacer les données statiques (mock ReactFlow) par les impacts réels ✅
- [x] Nœud central = évolution sélectionnée ; nœuds feuilles = rubriques impactées colorées par statut ✅
- [x] Sélection de nœuds → plan de test via `onGenerateTestPlan` ✅
- [x] États loading / empty / error / evolutionId null gérés ✅
- [x] `ImpactMapModal` reçoit `evolutionId` + `evolutionLabel` depuis `ProductDocSync` ✅

#### 3.4 — Notes par impact (LIVRÉ ✅ — 2026-04-19)

Décision (2026-04-18) : chaque `ImpactDocumentaire` porte ses propres `notes` — la même évolution peut s'exprimer différemment dans chaque rubrique impactée (ex : mise à jour du module Absences → description différente dans l'écran de saisie, le rapport mensuel, la fiche employé).

- [x] Backend : champ `notes = TextField(blank=True, default="")` sur `ImpactDocumentaire` (migration 0014) ✅
- [x] Backend : service `update_notes_impact(impact_id, notes)` + action `PATCH /api/impacts/{id}/update_notes/` ✅
- [x] Frontend : `updateNotesImpact()` dans `src/api/impacts.ts` + hook `useImpactUpdateNotes()` ✅
- [x] Frontend : clic sur une ligne du tableau SyncBottombar → SyncEditor charge les notes dans TipTap ✅
- [x] Frontend : prop `selectedImpact` passée de ProductDocSync → SyncEditor ; bouton "Enregistrer les notes" persiste via `update_notes` ✅
- [x] Tests : 3 cas couverts (`ImpactDocumentaireNotesTest`) ✅

**Implémentation finale (2026-04-19) :** les notes sont éditées directement dans l'éditeur TipTap de SyncEditor avec Toolbar complète et dictée vocale — pas de textarea séparé. Un bandeau contextuel non interactif affiche le nom de la rubrique et le type d'évolution. Le sélecteur Évolution/Correctif de ToolbarCorrection passe en lecture seule (pointer-events-none) quand un impact est sélectionné. En l'absence de sélection, un message d'invite remplace la zone d'édition.

#### 3.5 — Usages d'une rubrique + navigation vers Doc Principale (LIVRÉ ✅ — 2026-04-19)

Objectif : depuis une ligne du tableau, voir dans quels documents une rubrique est utilisée et l'ouvrir dans CentralEditor (Doc Principale).

- [x] Backend : action `GET /api/rubriques/{id}/usages/` sur `RubriqueViewSet` → liste `[{map_id, map_nom, version_projet_id, version_projet_nom, projet_id, projet_nom}]` via `MapRubrique` ✅
- [x] Frontend : `getRubriqueUsages(rubriqueId)` dans `src/api/rubriques.ts` + hook `useRubriqueUsages(rubriqueId)` ✅
- [x] Frontend : bouton ExternalLink par ligne → panneau inline `UsagePanel` avec liste des usages ✅
- [ ] Frontend : câblage navigation vers CentralEditor (dépend du routeur — TODO à préciser)
- [x] Tests : rubrique dans N maps → N entrées retournées ; rubrique sans usage → liste vide ✅

> ⚠️ **Point ouvert Nexus** : une couche IA de suggestion de rubriques impactées est envisagée pour un horizon futur. À spécifier dans une décision dédiée avant implémentation. Référence : `gov_decision-log.md` entrée 2026-04-18 "Stratégie suggestion rubriques".

### 📝 Notes
Backend livré le 2026-04-18 (migration `0013`, 7 tests verts, rubrique `on_delete=PROTECT`). `rubrique_titre` dénormalisé en read-only dans le serializer. Frontend `SyncBottombar` branché API le 2026-04-18. §3.4 (notes TipTap) et §3.5 (usages rubrique + `UsagePanel`) livrés le 2026-04-19. §3.3 (`ImpactMapGraph` données réelles, sélection nœuds, `onGenerateTestPlan`) livré le 2026-04-19 — Phase 3 intégralement complète. Voir `gov_decision-log.md` entrées 2026-04-18 / 2026-04-19.

---

# ⚠️ Phase 4 — Plan de test et carte d'impact (PARTIELLEMENT LIVRÉ — 2026-04-19)

### 🎯 Objectifs
- Brancher la génération du plan de test sur une action backend réelle.
- Alimenter la carte d'impact avec des données réelles.

### 🧩 Tâches

#### 4.1 — `TestPlanModal` : génération réelle (BLOQUÉ — dépend Gestion de Production)

- [ ] Définir l'action backend cible (génération d'une map de test ? export ? simple enregistrement ?)
- [ ] Remplacer `console.log("Plan de test validé :", tasks)` par l'appel backend
- [ ] Gérer le retour (toast succès / erreur, fermeture conditionnelle)

> ⛔ **Bloqué** : la génération d'un plan de test implique le module **Gestion de Production** de Documentum Nexus, qui n'est pas encore développé. Cette tâche est déplacée en dépendance de ce module. Voir `gov_decision-log.md` entrée 2026-04-19.

#### 4.2 — `ImpactMapModal` : graphe d'impact réel (LIVRÉ ✅ — 2026-04-19 — avancé en Phase 3)

- [x] Alimenter `ImpactMapGraph` avec des données réelles depuis `GET /api/impacts/?evolution_produit={id}` via `useImpactList` ✅
- [x] Relier les nœuds du graphe aux entités backend réelles (colorisation par statut, nœud central = évolution) ✅

#### 4.3 — `ImpactMapModal` : vue multi-évolutions (REPORTÉ)

- [ ] Permettre l'affichage de toutes les évolutions d'une version produit (et non d'une seule `EvolutionProduit`)
- [ ] Adapter le graphe ReactFlow : nœud central = version produit ; nœuds intermédiaires = évolutions ; feuilles = rubriques impactées
- [ ] Adapter `useImpactList` ou créer `useImpactListByVersion(versionId)` → `GET /api/impacts/?version_produit={id}`
- [ ] Adapter `ImpactMapModal` pour recevoir `versionId` en alternative à `evolutionId`

> 📋 Cette tâche est reportée. Elle sera conduite lors d'une itération dédiée à la vue "version produit complète".

### 📝 Notes
Phase 4 sautée : §4.2 livré en avance (Phase 3 §3.3). §4.1 bloqué par l'absence du module Gestion de Production (Nexus). §4.3 (vue multi-évolutions) identifiée et reportée — la carte d'impact fonctionne pour une évolution sélectionnée, l'extension à la vue version est une amélioration future. Décision actée le 2026-04-19.

---

# ✅ Phase 5 — Nettoyage et stabilisation technique (LIVRÉ — 2026-04-19)

### 🧩 Tâches

#### 5.1 — Suppression `console.log` production (LIVRÉ ✅)

- [x] Supprimer les `console.log` debug dans `apiClient.ts` (bloc `[FLOW][CreateProject]` — payload + raw response) ✅
- [x] Supprimer les `console.log` debug dans `xmlToTiptap.ts` (xmlString brut, conteneur, JSON TipTap généré) ✅
- Note : `handleCopyFeature` et `TestPlanModal.onGenerate` étaient déjà propres au moment de l'audit

#### 5.2 — `TOTAL_HEIGHT` recalculé à chaque rendu (LIVRÉ ✅)

- [x] `const TOTAL_HEIGHT = window.innerHeight - 130` est calculé une seule fois au montage
- [x] Hook `useWindowHeight` créé dans `src/hooks/useWindowHeight.ts` — resize listener avec cleanup ✅

#### 5.3 — Type `MinimalTask` délocalisé (LIVRÉ ✅)

- [x] Type `MinimalTask` déplacé vers `src/types/MinimalTask.ts` — import ajouté dans `ProductDocSync.tsx` ✅

#### 5.4 — Classe CSS incorrecte sur la div conteneur `SyncRightSidebar` (LIVRÉ ✅)

- [x] La div wrapper dans `ProductDocSync.tsx` utilisait un template literal dynamique `` `${isRightSidebarExpanded ? "w-[248px]" : "w-0"} ...` `` — remplacé par `cn("transition-all duration-300 h-full", isRightSidebarExpanded ? "w-[248px]" : "w-0")` + import `cn` ajouté ✅
- Note : `SyncRightSidebar.tsx` utilisait déjà `cn()` correctement — le bug était dans le composant parent

---

# 📘 Annexes

### 🔍 Dépendances entre phases

| Phase | Prérequis |
|-------|-----------|
| Phase 1 | `FonctionnaliteViewSet` disponible ✅ |
| Phase 2 | `GET /api/produits/` disponible (DataTab) ✅ — endpoint versions à confirmer |
| Phase 3 | Décision architecture `ImpactDocumentaire` backend |
| Phase 4 | Phase 3 terminée |
| Phase 5 | Indépendante — corrections techniques pures |

### 🔗 Liens avec d'autres composants

| Composant | Lien |
|-----------|------|
| `DataTab` (Settings) | Alimente le référentiel produits/fonctionnalités utilisé par ProductDocSync |
| `LeftSidebar` | Partage le concept de version projet — aligner les endpoints |
| Backend `FonctionnaliteViewSet` | Disponible sur `GET /api/fonctionnalites/` |
| Backend `ImpactDocumentaire` | À créer (M1 gap analysis) |

### 📌 TODO futurs (non priorisés)

- 1️⃣ Mode collaboratif : plusieurs utilisateurs pilotent les impacts simultanément — nécessite gestion de conflits
- 2️⃣ Filtres avancés : filtrer les fonctionnalités par statut d'impact, par rubrique concernée
- 3️⃣ Export du plan de synchronisation : rapport PDF ou CSV de l'état d'avancement doc/produit

---

# ✔️ Fin du document
