# ProductDocSync — Roadmap & Suivi

Document de référence pour suivre l'évolution de l'écran `ProductDocSync` et de ses sous-composants (`SyncLeftSidebar`, `SyncEditor`, `SyncBottombar`, `SyncRightSidebar`, `ImpactMapModal`, `TestPlanModal`).  
Ce document est synthétique, durable, et conçu pour un travail non linéaire dans le temps.

---

# 🧭 Vue d'ensemble du plan

L'évolution est organisée en **5 phases** :

1. **Phase 1 — Branchement API fonctionnalités (À FAIRE — priorité haute)**
2. **Phase 2 — Branchement API produits et versions (À FAIRE)**
3. **Phase 3 — ImpactDocumentaire : modèle et API (À FAIRE — prérequis Nexus)**
4. **Phase 4 — Plan de test et carte d'impact (À FAIRE)**
5. **Phase 5 — Nettoyage et stabilisation technique (À FAIRE)**

---

# ⚠️ État actuel (2026-04-16)

### Ce qui fonctionne
- Layout complet en 4 zones : `SyncLeftSidebar`, `SyncEditor`, `SyncBottombar`, `SyncRightSidebar`
- Navigation entre fonctionnalités (sélection, expansion, collapse)
- Réordonnancement drag & drop des fonctionnalités (local)
- Indentation / désindentation des fonctionnalités (local, niveaux 1 à 5)
- Copier / coller une fonctionnalité (local, avec toast de confirmation)
- Suppression d'une fonctionnalité (local)
- Ajout d'une fonctionnalité (local)
- Ajout d'une version (incrémentation locale du numéro mineur)
- Bascule type d'article (évolution / correctif) dans `SyncEditor`
- Redimensionnement vertical de `SyncBottombar` par drag
- `ImpactMapModal` : ouverture / fermeture
- `TestPlanModal` : ouverture / fermeture / réordonnancement des tâches

### Ce qui ne fonctionne pas
- **Toutes les données sont hardcodées** : produits, versions, fonctionnalités — aucun appel API
- **Aucune mutation n'est persistée** : toute action est perdue au rechargement
- **Publication de version** → `alert()` navigateur
- **Génération du plan de test** → `console.log` + fermeture modale sans action backend
- **`ImpactDocumentaire`** : modèle absent du backend (M1 dans le gap analysis)

---

# 🔜 Phase 1 — Branchement API fonctionnalités (À FAIRE — priorité haute)

### 🎯 Objectifs
- Charger les fonctionnalités depuis `FonctionnaliteViewSet` (déjà disponible côté backend).
- Persister les mutations (ajout, suppression, réordonnancement, indentation).

> Ce lot correspond à P4 dans le plan d'actions du gap analysis (`DOCUMENTUM_NEXUS_GAP_VALIDATION.md`).

### 🧩 Tâches

#### 1.1 — Chargement initial

- [ ] Créer le hook `useFonctionnaliteList(produitId, versionId)` → `GET /api/fonctionnalites/?produit={id}`
- [ ] Remplacer le `useState<FeatureItem[]>([...])` hardcodé par `useFonctionnaliteList`
- [ ] Gérer les états `loading`, `error`, liste vide
- [ ] Mapper les champs backend (`id`, `nom`, `code`, `id_fonctionnalite`) vers `FeatureItem` frontend

#### 1.2 — Persistance des mutations

- [ ] `handleAddFeature` → `POST /api/fonctionnalites/` + rechargement
- [ ] `handleDeleteFeature(id)` → `DELETE /api/fonctionnalites/{id}/` + rechargement
- [ ] `handleReorder(newItems)` → décider si l'ordre est persisté (champ `ordre` côté backend ?)
- [ ] `handleIndent(id)` / `handleOutdent(id)` → décider si `level` est persisté ou dérivé de la hiérarchie backend

#### 1.3 — Nettoyage

- [ ] Supprimer `console.log("Fonctionnalité collée :", newFeature.name)` (ligne 144)
- [ ] Déplacer le type `MinimalTask` (défini localement) vers `src/types/`

### 📝 Notes
`FonctionnaliteViewSet` est exposé sur `GET/POST/PATCH/DELETE /api/fonctionnalites/`. Le champ `level` de `FeatureItem` est une abstraction UI — vérifier si le backend stocke une hiérarchie ou un ordre plat avant d'implémenter le persist de l'indentation.

---

# 🔜 Phase 2 — Branchement API produits et versions (À FAIRE)

### 🎯 Objectifs
- Charger les produits disponibles depuis le référentiel DataTab.
- Charger les versions associées au produit sélectionné.
- Permettre la création de nouvelles versions avec persistance.

### 🧩 Tâches

#### 2.1 — Chargement produits

- [ ] Remplacer `const products = ["Planning", "Usager", "Finance"]` par `GET /api/produits/`
- [ ] Brancher `setSelectedProduct` sur la sélection réelle
- [ ] Aligner les valeurs de `productOptions` sur les IDs backend (pas les noms en clair)

#### 2.2 — Chargement versions

- [ ] Créer le hook `useVersionList(produitId)` → `GET /api/versions/?produit={id}` (ou endpoint dédié)
- [ ] Remplacer `useState(["1.0", "1.1", "1.2"])` hardcodé par ce hook
- [ ] Recharger la liste des versions quand `selectedProduct` change

#### 2.3 — Création de version

- [ ] `handleAddVersion` → `POST /api/versions/` (payload : `{ produit, nom }`)
- [ ] Remplacer l'incrémentation locale par l'appel backend + rechargement liste
- [ ] Sélectionner automatiquement la version créée après réponse backend

#### 2.4 — Publication de version

- [ ] `handlePublishVersion` → `POST /api/publier-version/{id}/` ou endpoint à définir
- [ ] Remplacer `alert()` par un appel backend + toast de confirmation

### 📝 Notes
La structure des versions dans Documentum est liée au modèle `VersionProjet` (backend). Vérifier si `ProductDocSync` utilise les mêmes entités que `LeftSidebar` ou un modèle de version propre à ProductDocSync.

---

# 🔜 Phase 3 — ImpactDocumentaire : modèle et API (À FAIRE — prérequis Nexus)

### 🎯 Objectifs
- Implémenter le modèle `ImpactDocumentaire` absent du backend.
- Permettre le pilotage documentaire : quelle rubrique est impactée par quelle fonctionnalité.

> Ce lot correspond à M1 + P5 dans le plan d'actions du gap analysis (`DOCUMENTUM_NEXUS_GAP_VALIDATION.md`).

### 🧩 Tâches

#### 3.1 — Backend : modèle `ImpactDocumentaire`

- [ ] Créer le modèle `ImpactDocumentaire` : `ÉvolutionProduit` → `Rubrique` avec statuts `à_faire / en_cours / prêt / validé`
- [ ] Exposer `GET/POST/PATCH /api/impacts/` (filtrable par fonctionnalité et rubrique)
- [ ] Documenter dans `01_OPERATIONNEL/Backend/` après implémentation

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
