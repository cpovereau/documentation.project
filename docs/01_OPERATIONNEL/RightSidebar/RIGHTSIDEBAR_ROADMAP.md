# RightSidebar — Roadmap & Suivi

Document de référence pour suivre l'évolution du composant `RightSidebar` et de son sous-composant `MediaPanel`.  
Ce document est synthétique, durable, et conçu pour un travail non linéaire dans le temps.

---

# 🧭 Vue d'ensemble du plan

L'évolution est organisée en **4 phases** :

1. **Phase 1 — Branchement API médiathèque (À FAIRE — priorité haute)**
2. **Phase 2 — Pagination et chargement différé (À FAIRE)**
3. **Phase 3 — Intégration CentralEditor (À FAIRE)**
4. **Phase 4 — Évolutions UX (NON PRIORITAIRE)**

---

# ✅ État actuel (2026-04-18)

### Ce qui fonctionne
- Affichage correct en mode **ancré** (panneau fixe droit, toggle expansion)
- Affichage correct en mode **flottant** (fenêtre libre via `createPortal`, drag, resize bords gauche/droit)
- Passage ancré ↔ flottant opérationnel
- `MediaPanel` : filtres type (image/vidéo), recherche texte, tri, modes d'affichage (grille/compact/liste)
- **API médiathèque branchée** — `useMedias` connecté à `/api/media-items/` via `apiClient`
- **Filtre `type_media`** actif — affichage séparé images / vidéos selon toggle
- **Import fonctionnel** — `useImportMedia` + `useMediaNomCheck` corrigés et opérationnels
- **Invalidation cache post-import** — `queryClient.invalidateQueries(["medias"])` au lieu de `mediaRefreshKey`
- **Modules mutualisés** — `MediaPanel` identique entre `RightSidebar` (Desktop) et `SyncRightSidebar` (ProductDocSync)

### Ce qui reste à faire
- **Pagination non implémentée** (Phase 2)
- **Aucune insertion dans l'éditeur** (Phase 3 — dépend de CentralEditor Phase 4 ✅)
- **Aucune action sur les médias** : prévisualisation plein écran (Phase 4)

---

# ✅ Phase 1 — Branchement API médiathèque (TERMINÉE — 2026-04-18)

### 🎯 Objectifs atteints
- Données hardcodées remplacées par un chargement depuis le backend.
- Panneau fonctionnel pour les utilisateurs — affichage, filtre, import opérationnels.

### 🧩 Tâches réalisées

#### 1.1 — Endpoint backend (existait déjà)

- [x] Endpoint `GET /api/media-items/` — `MediaViewSet` DRF opérationnel
- [x] Upload via `POST /import/media/` — `upload_media` view opérationnelle
- [x] Génération de nom via `GET /medias-check-nom/` — `check_media_names` opérationnelle

#### 1.2 — Hook de chargement frontend

- [x] `useMedias` connecté à `/api/media-items/` via `apiClient`
- [x] Filtrage client-side : `produitId`, `fonctionnaliteCode`, `interfaceCode`, `searchTerm`, `typeMedia`
- [x] `useImportMedia` — URL corrigée (`/import/media/` au lieu de `/api/import/media/`)
- [x] `useMediaNomCheck` — URL corrigée (`/medias-check-nom/` au lieu de `/api/medias-check-nom/`)

#### 1.3 — Nettoyage et branchement

- [x] `RightSidebar` : données mock supprimées, état cassé `const [setPage] = useState(1)` supprimé
- [x] `SyncRightSidebar` : données mock supprimées, doublon `ImportModal` local supprimé
- [x] `MediaPanel` : filtre `typeMedia` branché depuis `isImageMode`, sort non mutatif corrigé
- [x] Invalidation cache post-import via `queryClient.invalidateQueries(["medias"])` (remplace `mediaRefreshKey`)

#### 1.4 — Correction bug `import-modal.tsx`

- [x] `setExistingImages([])` supprimé du `useEffect` (n'était pas un state — variable dérivée de `nomCheckData`)

### 📝 Notes
Les endpoints custom (`/medias-check-nom/`, `/import/media/`) sont enregistrés **sans préfixe `/api/`** dans `documentation/urls.py`. Les hooks corrigés en conséquence.

---

# 🔜 Phase 2 — Pagination et chargement différé (À FAIRE)

### 🎯 Objectifs
- Permettre le chargement progressif des médias (listes potentiellement longues).
- Activer la pagination dans l'UI.

### 🧩 Tâches

#### 2.1 — Pagination backend

- [ ] Ajouter la pagination DRF à l'endpoint `GET /api/medias/` (page + page_size)
- [ ] Retourner `{ count, next, previous, results }` en format standard DRF

#### 2.2 — Hook `useMediaList` paginé

- [ ] Ajouter `page`, `pageSize` aux paramètres
- [ ] Exposer `totalCount`, `hasNextPage`, `loadNextPage`

#### 2.3 — Activer le state `setPage` dans `RightSidebar`

- [ ] Corriger la déclaration : `const [page, setPage] = useState(1)` (actuellement destructuré incorrectement)
- [ ] Brancher `setPage` sur les contrôles de pagination de `MediaPanel`

### 📝 Notes
La variable `setPage` est actuellement déclarée de façon incorrecte (position 0 de `useState`, pas le setter). C'est un dead code — prérequis à corriger avant tout branchement pagination.

---

# 🔜 Phase 3 — Intégration avec CentralEditor (À FAIRE)

### 🎯 Objectifs
- Permettre l'insertion d'un média dans le contenu XML édité.
- Lier le panneau droit à l'éditeur central.

### 🧩 Tâches

#### 3.1 — Action "Insérer dans l'éditeur"

- [ ] Ajouter un bouton ou double-clic sur `MediaCard` → callback `onInsertMedia(item)`
- [ ] Définir le format d'insertion DITA (balise `<image>` avec `href`, `alt`)
- [ ] Implémenter dans `CentralEditor` la réception d'un médiaItem et l'insertion via TipTap

#### 3.2 — Contexte actif

- [ ] RightSidebar devrait idéalement connaître le contexte de la rubrique active (pour filtrer les médias déjà utilisés)
- [ ] Décision : accès via `useSelectionStore.selectedRubriqueId` ou prop passée depuis Desktop

### 📝 Notes
Cette phase est dépendante de la Phase 1 (données réelles) et suppose une décision sur le format DITA des images. Voir `00_REFERENTIEL/Frontend/20_XML_TIPTAP_CONVERSION_SPEC.md` pour l'alignement avec la spec XML.

---

# 🔜 Phase 4 — Évolutions UX (NON PRIORITAIRE)

### 🧩 Tâches envisagées

#### 4.1 — Position flottante adaptative

- [ ] Initialisation de `position.x` via `window.innerWidth - 248` : recalculer à chaque ouverture flottante plutôt qu'au premier montage
- [ ] Gérer le recadrage si la fenêtre est redimensionnée pendant le mode flottant

#### 4.2 — Mémoire de l'état utilisateur

- [ ] Persister `isExpanded`, `isFloating`, `displayMode` dans `localStorage` ou un store dédié pour retrouver l'état au rechargement

#### 4.3 — Prévisualisation haute résolution

- [ ] Clic sur `MediaCard` → ouverture d'une modale de prévisualisation plein écran
- [ ] Support vidéo inline

#### 4.4 — Nettoyage contrat de props

- [ ] Clarifier la distinction `onToggle` / `onExpand` (comportements qui se recoupent partiellement)
- [ ] Documenter le comportement attendu dans chaque cas

---

# 📘 Annexes

### 🔍 Dépendances externes

| Phase | Prérequis |
|-------|-----------|
| Phase 1 | Endpoint backend `GET /api/medias/` à créer |
| Phase 2 | Phase 1 terminée |
| Phase 3 | Phase 1 terminée + décision format DITA `<image>` |
| Phase 4 | Indépendante |

### 📌 TODO futurs (non priorisés)

- 1️⃣ Upload de média depuis le panneau : bouton upload direct → `POST /api/medias/` sans passer par les Paramètres
- 2️⃣ Gestion du drag-and-drop fichier : déposer un fichier dans le panneau pour l'uploader directement
- 3️⃣ Filtres avancés : filtrage par date de modification, par projet ou par rubrique associée

---

# ✔️ Fin du document
