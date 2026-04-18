# ProductDocSync — Roadmap & Suivi

Document de référence pour suivre l'évolution de l'écran `ProductDocSync` et de ses sous-composants (`SyncLeftSidebar`, `SyncEditor`, `SyncBottombar`, `SyncRightSidebar`, `ImpactMapModal`, `TestPlanModal`).  
Ce document est synthétique, durable, et conçu pour un travail non linéaire dans le temps.

> 📄 **Spécification métier** : [PRODUCTDOCSYNC_SPEC_METIER.md](PRODUCTDOCSYNC_SPEC_METIER.md) — entités métier, acteurs, flux, règles et points ouverts (arbitrages à trancher).

---

# 🧭 Vue d'ensemble du plan

L'évolution est organisée en **5 phases** :

1. **Phase 1 — Branchement API fonctionnalités (PARTIEL ✅)**
2. **Phase 2 — Branchement API produits et versions (PARTIEL ⚠️ — versions bloquées)**
3. **Phase 3 — ImpactDocumentaire : modèle et API (À FAIRE — prérequis Nexus)**
4. **Phase 4 — Plan de test et carte d'impact (À FAIRE)**
5. **Phase 5 — Nettoyage et stabilisation technique (À FAIRE)**

---

# ✅ État actuel (2026-04-18 — Phase A Phases 1 + 2 livrée)

### Ce qui fonctionne
- Layout complet en 4 zones : `SyncLeftSidebar`, `SyncEditor`, `SyncBottombar`, `SyncRightSidebar`
- Navigation entre évolutions (sélection, expansion, collapse)
- **Réordonnancement drag & drop persisté** → `PATCH /api/evolutions-produit/reorder/` via `useEvolutionProduitReorder` ✅
- Copier / coller une évolution → colle via `POST /api/evolutions-produit/` (persisté) ✅
- Archivage d'une évolution → `PATCH /api/evolutions-produit/{id}/archive/` (persisté) ✅
- Ajout d'une évolution → dialog (Fonctionnalite + type + description) + `POST /api/evolutions-produit/` (persisté) ✅
- **Produits chargés depuis `GET /api/produits/`** via `useProduits`
- **Versions chargées depuis `GET /api/versions-produit/?produit={id}`** via `useVersionProduitList` ✅ (plus hardcodé)
- **EvolutionProduit chargées depuis `GET /api/evolutions-produit/?version_produit={id}`** via `useEvolutionProduitList` ✅
- **Création de version** → dialog + `POST /api/versions-produit/` via `useVersionProduitCreate` ✅ (plus incrémentation locale)
- **Publication de version** → `POST /api/versions-produit/{id}/publier/` + toast succès/erreur ✅ (plus `alert()`)
- Bascule type d'article (évolution / correctif) dans `SyncEditor`
- Redimensionnement vertical de `SyncBottombar` par drag
- `ImpactMapModal` : ouverture / fermeture
- `TestPlanModal` : ouverture / fermeture / réordonnancement des tâches

### Ce qui ne fonctionne pas / reste à faire
- **`ImpactDocumentaire`** : modèle backend Phase 3 — non démarrée
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

# 🔜 Phase 3 — ImpactDocumentaire : modèle et API (À FAIRE — prérequis Nexus)

### 🎯 Objectifs
- Implémenter le modèle `ImpactDocumentaire` absent du backend.
- Permettre le pilotage documentaire : quelle rubrique est impactée par quelle fonctionnalité.

> Ce lot correspond à M1 + P5 dans le plan d'actions du gap analysis (`DOCUMENTUM_NEXUS_GAP_VALIDATION.md`).

### 🧩 Tâches

#### 3.1 — Backend : modèle `ImpactDocumentaire`

- [ ] Créer le modèle `ImpactDocumentaire` : `EvolutionProduit` → `Rubrique` avec statuts `a_faire / en_cours / pret / valide / ignore`
- [ ] Exposer `GET/POST/PATCH/DELETE /api/impacts/` (filtrable par `evolution_produit` et `rubrique`)
- [ ] Modèle et endpoints documentés dans `10_BACKEND_CANONIQUE.md § 9.3` ✅

#### 3.2 — Frontend : intégration dans `SyncBottombar`

- [ ] Charger les rubriques impactées par la fonctionnalité sélectionnée
- [ ] Afficher le statut d'avancement par rubrique
- [ ] Permettre la mise à jour du statut depuis `SyncBottombar`

#### 3.3 — Intégration dans `ImpactMapModal`

- [ ] Alimenter `ImpactMapModal` avec les données réelles d'impact
- [ ] Remplacer les données statiques (si présentes) par un appel `GET /api/impacts/?fonctionnalite={id}`

### 📝 Notes
`ImpactDocumentaire` est l'entité centrale de la valeur Nexus. Son absence bloque le pilotage documentaire complet. Cette phase est un prérequis pour que ProductDocSync soit fonctionnellement utile au-delà de la gestion des fonctionnalités.

---

# 🔜 Phase 4 — Plan de test et carte d'impact (À FAIRE)

### 🎯 Objectifs
- Brancher la génération du plan de test sur une action backend réelle.
- Alimenter la carte d'impact avec des données réelles.

### 🧩 Tâches

#### 4.1 — `TestPlanModal` : génération réelle

- [ ] Définir l'action backend cible (génération d'une map de test ? export ? simple enregistrement ?)
- [ ] Remplacer `console.log("Plan de test validé :", tasks)` par l'appel backend
- [ ] Gérer le retour (toast succès / erreur, fermeture conditionnelle)

#### 4.2 — `ImpactMapModal` : graphe d'impact réel

- [ ] Alimenter `ImpactMapGraph` avec des données réelles depuis `GET /api/impacts/` (Phase 3)
- [ ] Relier les nœuds du graphe aux entités backend réelles

### 📝 Notes
Cette phase est dépendante de la Phase 3 (ImpactDocumentaire). La sémantique exacte de "générer un plan de test" reste à définir dans `03_PILOTAGE/`.

---

# 🔜 Phase 5 — Nettoyage et stabilisation technique (À FAIRE)

### 🧩 Tâches

#### 5.1 — Correction `console.log` production

- [ ] Supprimer `console.log("Fonctionnalité collée :", newFeature.name)` (ligne 144)
- [ ] Supprimer `console.log("Plan de test validé :", tasks)` (ligne 210, dans `TestPlanModal.onGenerate`)

#### 5.2 — `TOTAL_HEIGHT` recalculé à chaque rendu

- [ ] `const TOTAL_HEIGHT = window.innerHeight - 130` est calculé une seule fois au montage
- [ ] Envisager un `useEffect` sur `resize` ou un hook `useWindowHeight` si le panneau doit s'adapter au redimensionnement

#### 5.3 — Type `MinimalTask` délocalisé

- [ ] Déplacer `type MinimalTask = { id: string; label: string }` (défini localement ligne 147) vers `src/types/`

#### 5.4 — Classe CSS incorrecte dans `SyncRightSidebar`

- [ ] La div conteneur SyncRightSidebar utilise `` `$${isRightSidebarExpanded ? "w-[248px]" : "w-0"}` `` (double `$`) — bug de template literal, la classe ne s'applique probablement pas correctement

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
