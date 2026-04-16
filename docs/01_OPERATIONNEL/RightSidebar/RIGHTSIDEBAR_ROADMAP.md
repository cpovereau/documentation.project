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

# ⚠️ État actuel (2026-04-16)

### Ce qui fonctionne
- Affichage correct en mode **ancré** (panneau fixe droit, toggle expansion)
- Affichage correct en mode **flottant** (fenêtre libre via `createPortal`, drag, resize bords gauche/droit)
- Passage ancré ↔ flottant opérationnel
- `MediaPanel` : filtres type (image/vidéo), recherche texte, tri, modes d'affichage (grille/compact/liste)

### Ce qui ne fonctionne pas
- **Données entièrement hardcodées** : 8 `MediaItem` statiques avec URLs placeholder (`placehold.co`)
- **Aucune API branchée** : aucun appel vers un endpoint de médiathèque
- **Pagination non implémentée** : variable `setPage` déclarée mais jamais utilisée
- **Aucune action sur les médias** : pas d'insertion dans l'éditeur, pas de prévisualisation réelle

---

# 🔜 Phase 1 — Branchement API médiathèque (À FAIRE — priorité haute)

### 🎯 Objectifs
- Remplacer les données hardcodées par un chargement depuis le backend.
- Rendre le panneau fonctionnel pour les utilisateurs.

### 🧩 Tâches

#### 1.1 — Définir et implémenter l'endpoint backend

- [ ] Décider de la structure de l'endpoint (ex. `GET /api/medias/`)
- [ ] Définir le `MediaItem` DTO côté backend (id, titre, type, url, date_modification)
- [ ] Implémenter le `ViewSet` Django correspondant
- [ ] Gérer l'upload de médias (`POST /api/medias/`)

#### 1.2 — Créer le hook de chargement frontend

- [ ] Créer `useMediaList(search, sortOrder, type)` — `GET /api/medias/?search=...&type=...&ordering=...`
- [ ] Gérer les états `loading`, `error`, `items`
- [ ] Remplacer le tableau `mediaItems` hardcodé par `useMediaList`

#### 1.3 — Brancher dans `RightSidebar`

- [ ] Supprimer la déclaration locale `const mediaItems: MediaItem[] = [...]`
- [ ] Brancher les props `searchText`, `sortOrder`, `isImageMode` sur les paramètres de `useMediaList`
- [ ] Gérer l'état de chargement (skeleton ou spinner dans `MediaPanel`)

### 📝 Notes
L'endpoint backend n'existe pas encore. Cette phase est bloquée par la décision d'architecture côté backend (scope du module médiathèque). Voir `03_PILOTAGE/30_PILOTAGE_PROJET.md` pour la priorisation.

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
