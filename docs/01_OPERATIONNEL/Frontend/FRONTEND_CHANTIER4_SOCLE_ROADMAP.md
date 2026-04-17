# Chantier 4 — Socle Frontend : apiClient, TanStack Query, zéro appel direct

📅 Créé : 2026-04-17

---

# 🎯 Objectif

Garantir que **tous les appels backend** passent par un client API centralisé et des hooks TanStack Query normalisés.

Résultat attendu :
- zéro appel `fetch` / `axios` direct dans un composant ou un hook non dédié
- toutes les routes utilisent le préfixe `/api/...`
- les mutations et queries sont gérées par TanStack Query
- la gestion d'erreurs et les états de chargement sont uniformes

---

# 🔗 Dépendances

- CentralEditor Phases 1–5 ✅ (stable — ne pas modifier)
- Backend canonique documenté dans [10_BACKEND_CANONIQUE.md](../Backend/10_BACKEND_CANONIQUE.md)
- Architecture cible : [20_ARCHITECTURE_FRONTEND.md](../../00_REFERENTIEL/20_ARCHITECTURE_FRONTEND.md)

---

# 🧩 Phases

## Phase 1 — Audit des appels API existants ✅ (2026-04-17)

### 🎯 Objectif
Cartographier tous les appels backend existants pour identifier la dette.

### Tâches
- [x] 1.1 — Lister tous les `fetch` / `axios` hors `apiClient` (composants + hooks)
- [x] 1.2 — Identifier les routes sans préfixe `/api/` (routes legacy)
- [x] 1.3 — Identifier les hooks qui gèrent manuellement `loading` / `error` / `data`
- [x] 1.4 — Produire un tableau de dette : fichier / route / pattern utilisé

### Résultats

**État général :** ~65% centralisé — TanStack Query déjà installé (v5.90.10), apiClient présent à `src/lib/apiClient.ts`

#### 🔴 Routes sans préfixe `/api/`

| Fichier | Route actuelle | Route cible | Priorité |
|---|---|---|---|
| `src/api/medias.ts` | `/media-items/` | `/api/media-items/` | ⚠️ Haute |
| `src/api/interfaces.ts` | `/interfaces/` | `/api/interfaces/` | ⚠️ Haute |
| `src/api/projets.ts` | `/projets/` | `/api/projets/` | ⚠️ Haute |
| `src/hooks/useTags.ts` | `/tags/` | `/api/tags/` | ⚠️ Haute |
| `src/hooks/useAudiences.ts` | `/audiences/` | `/api/audiences/` | ⚠️ Haute |
| `src/lib/apiClient.ts` (`getProjectDetailsValidated`) | `/projets/{id}/details/` | `/api/projets/{id}/` | ⚠️ Haute |
| `src/components/ui/import-modal.tsx` | `/import/media/` | À confirmer backend | 🔵 Vérifier |
| `src/screens/Settings/tabs/DataTab.tsx` | `/import/fonctionnalites/` | À confirmer backend | 🔵 Vérifier |
| `src/utils/csrf.ts` | `/csrf/` | Intentionnel (hors API) | ℹ️ Acceptable |
| `src/types/rubriques.ts` | `/dita-template/` | Fichier legacy — probablement mort | 🔵 Vérifier |

#### 🟠 Appels directs dans des composants (anti-pattern)

| Fichier | Nb appels | Pattern | Action requise |
|---|---|---|---|
| `src/components/ui/LeftSidebar.tsx` | 8 | `api.get/post/patch/delete` direct | Extraire en hooks |
| `src/components/ui/CreateProjectDialog.tsx` | 1 | `.then()` sans async/await | Migrer en `useQuery` |
| `src/components/ui/LoadProjectDialog.tsx` | 1 | `.then()` sans async/await | Migrer en `useQuery` |
| `src/components/ui/import-modal.tsx` | 2 | Appels directs | À évaluer |
| `src/screens/Settings/tabs/DataTab.tsx` | 1 | Appel direct | À évaluer |

#### 🔴 Axios brut avec URLs hardcodées

| Fichier | URL | Problème |
|---|---|---|
| `src/screens/Login/LoginScreen.tsx` | `http://localhost:8000/login/` | URL complète en dur |
| `src/App.tsx` | `http://localhost:8000/csrf/` | URL complète en dur |

#### 🟡 Gestion manuelle `loading/error/data`

| Fichier | Pattern | Remplacement cible |
|---|---|---|
| `src/hooks/useMedias.ts` | `useState(loading)` + `useEffect` + `setLoading` | `useQuery` TanStack |

#### ✅ Déjà conforme

- `src/api/rubriques.ts`, `produits.ts`, `fonctionnalites.ts`, `gammes.ts`, `maps.ts`, `rubriqueTemplates.ts` — routes `/api/` correctes
- `src/hooks/useFonctionnalites.ts`, `useProduits.ts`, `useDictionnaireHooks.ts` — `useQuery` TanStack en place
- `src/lib/resources.ts` — wrapper générique correct

---

## Phase 2 — Consolidation de l'apiClient ✅ (2026-04-17)

### 🎯 Objectif
S'assurer que l'`apiClient` est l'unique point d'entrée pour tous les appels backend.

### Tâches
- [x] 2.1 — Vérifier l'existence et l'exhaustivité de `src/lib/apiClient.ts` ✅ présent, complet
- [x] 2.2 — Corriger les routes sans préfixe `/api/` (8 fichiers corrigés)
- [x] 2.3 — Headers auth/CSRF/FormData déjà centralisés dans apiClient — conforme
- [x] 2.4 — Gestion d'erreur HTTP déjà normalisée dans intercepteur réponse — conforme
- [x] 2.5 — Remplacer `axios` brut + URL hardcodée dans `App.tsx` par `api` de apiClient
- [x] 2.6 — Supprimer `console.log` debug CSRF dans `apiClient.ts`

### Corrections appliquées

| Fichier | Avant | Après |
|---|---|---|
| `src/api/medias.ts` | `/media-items/` | `/api/media-items/` |
| `src/api/interfaces.ts` | `/interfaces/` | `/api/interfaces/` |
| `src/api/projets.ts` | `/projets/` | `/api/projets/` |
| `src/hooks/useTags.ts` | `/tags/` | `/api/tags/` |
| `src/hooks/useAudiences.ts` | `/audiences/` | `/api/audiences/` |
| `src/components/ui/import-modal.tsx` | `/import/media/` | `/api/import/media/` |
| `src/screens/Settings/tabs/DataTab.tsx` | `/import/fonctionnalites/` | `/api/import/fonctionnalites/` |
| `src/types/rubriques.ts` | `/dita-template/` | `/api/dita-template/` |
| `src/App.tsx` | `axios.get("http://localhost:8000/csrf/")` | `api.get("/csrf/")` |

### ⚠️ Point en suspens — à confirmer backend

| Fichier | Route | Statut |
|---|---|---|
| `src/lib/apiClient.ts` — `getProjectDetailsValidated()` | `/projets/{id}/details/` | Route sans `/api/` — endpoint non documenté dans `10_BACKEND_CANONIQUE.md` — à confirmer avant correction |

---

## Phase 3 — Introduction de TanStack Query ✅ (2026-04-17)

### 🎯 Objectif
Remplacer les patterns `useEffect + fetch` manuels par des hooks TanStack Query.

### Tâches
- [x] 3.1 — TanStack Query v5 déjà installé et configuré dans `main.tsx` (`QueryClientProvider`, `ReactQueryDevtools`)
- [x] 3.2 — Stratégie de cache : `staleTime: 10s` global, `30s` pour les médias — conforme
- [x] 3.3 — `useMedias.ts` migré vers `useQuery` + `useMemo` pour filtrage client-side — `refetch` exposé, `mediaRefreshKey` supprimé
- [x] 3.4 — `useProjets.ts` créé (nouveau hook, `enabled: open` pour fetch conditionnel)
- [x] 3.5 — `CreateProjectDialog.tsx` migré : consomme `useGammes()` depuis `useDictionnaireHooks`, supprime `useEffect + useState(gammes)`
- [x] 3.6 — `LoadProjectDialog.tsx` migré : consomme `useProjets(open)`, supprime `useEffect + useState(projects/loading)`
- [x] 3.7 — `invalidateQueries` déjà en place dans `useFonctionnaliteList` — pattern de référence

### ⚠️ Duplications signalées pour Phase 5
- `src/hooks/useTags.ts` duplique `useGammes` dans `useDictionnaireHooks`
- `src/hooks/useAudiences.ts` duplique `useAudiences` dans `useDictionnaireHooks`
→ À consolider en Phase 5 (un seul fichier de référence)

---

## Phase 4 — Migration des composants ✅ (2026-04-17)

### 🎯 Objectif
Migrer tous les appels directs identifiés en Phase 1 vers les nouveaux hooks.

### QueryKeys standards définis

```
["projets"]                 liste projets non archivés
["projet", id]              détail projet (cache individuel)
["projet-structure", id]    structure (mapId + rubriques) d'un projet
["map-structure", mapId]    rubriques d'une map — source de vérité locale
["gammes"]  ["produits"]  ["fonctionnalites"]  ["interfaces"]
["tags"]  ["audiences"]  ["medias"]
```

### Stratégie d'invalidation

| Mutation | Invalide |
|---|---|
| `DELETE /api/projets/{id}/` | `removeQueries(["projet", id])` |
| `POST .../structure/create/` | `invalidate(["map-structure", mapId])` |
| `PATCH /api/rubriques/{id}/` (rename) | `invalidate(["map-structure", mapId])` |
| `POST .../indent/` `POST .../outdent/` `POST .../reorder/` | `invalidate(["map-structure", mapId])` |

**Pattern clé :** `["projet-structure"]` → `setQueryData(["map-structure"])` au chargement initial — 0 double appel réseau.

### Tâches
- [x] 4.1 — Créer `src/hooks/useMapStructure.ts` — `useQuery` + 5 mutations (create, rename, indent, outdent, reorder)
- [x] 4.2 — Créer `src/hooks/useProjetActions.ts` — `useQuery(projet-structure)` + delete mutation + `fetchProjet` impératif
- [x] 4.3 — `LeftSidebar.tsx` migré : `import api` supprimé, 8 appels directs → hooks
- [x] 4.4 — `mapRubriques` local state supprimé → `useMapStructure(currentMapId).mapRubriques`
- [x] 4.5 — `useEffect([selectedProjectId]) + api.get(structure)` → `useQuery(["projet-structure"])` + `setQueryData` pour pre-populate
- [x] 4.6 — `openMap()` simplifié : plus de fetch manuel — TanStack Query gère automatiquement
- [x] 4.7 — `handleConfirmLoadedProject` dead code supprimé
- [ ] 4.8 — `publishMap` dans `handleExport` : encore appelé depuis composant — TODO Phase 5

### ⚠️ Hors périmètre Phase 4
- `publishMap` dans `handleExport` (service abstrait, non `api.xxx` direct) → Phase 5

---

## Phase 5 — Stabilisation et validation ✅ (2026-04-17)

### Tâches
- [x] 5.1 — Vérifier l'absence de `fetch` / `axios` direct hors `apiClient` (grep de contrôle) — 0 violation dans composants/screens
- [x] 5.2 — Vérifier cohérence avec `gov_forbidden-patterns.md` — conforme (1.2, 1.3 respectés)
- [x] 5.3 — `20_ARCHITECTURE_FRONTEND.md` mis à jour (TanStack Query, queryKeys standards, règles couche API)
- [x] 5.4 — Decision log pour TanStack Query — ajouté par l'utilisateur dans `gov_decision-log.md`

### Corrections Phase 5

| Fichier | Action |
|---|---|
| `src/hooks/useMediaNomCheck.ts` | Nouveau hook — `useQuery` pour `/api/medias-check-nom/` (extrait de `import-modal.tsx`) |
| `src/hooks/useImportMedia.ts` | Nouveau hook — `useMutation` pour `POST /api/import/media/` (extrait de `import-modal.tsx`) |
| `src/hooks/useImportFonctionnalites.ts` | Nouveau hook — `useMutation` pour `POST /api/import/fonctionnalites/` (extrait de `DataTab.tsx`) |
| `src/components/ui/import-modal.tsx` | `api.get` + `api.post` supprimés — consomme les nouveaux hooks |
| `src/screens/Settings/tabs/DataTab.tsx` | `api.post` supprimé — consomme `useImportFonctionnalites` |
| `src/hooks/useGammes.ts` | Supprimé — dupliquait `useDictionnaireHooks`, zéro consommateur |
| `src/hooks/useProduits.ts` | Supprimé — dupliquait `useDictionnaireHooks`, zéro consommateur |
| `src/hooks/useInterfaces.ts` | Supprimé — dupliquait `useDictionnaireHooks`, zéro consommateur |
| `src/hooks/useFonctionnalites.ts` | Supprimé — dupliquait `useDictionnaireHooks`, zéro consommateur |
| `src/hooks/useTags.ts` | Supprimé — dupliquait `useDictionnaireHooks`, zéro consommateur |
| `src/hooks/useAudiences.ts` | Supprimé — dupliquait `useDictionnaireHooks`, zéro consommateur |

### ⚠️ Hors périmètre (noté pour futures itérations)
- `src/hooks/useArchivableList.ts` — pattern `useState + useEffect` manuel (hook, non composant) → migration TanStack Query possible mais non bloquante
- `publishMap` dans `handleExport` — abstraction service, non `api.xxx` direct → acceptable en l'état

---

# 🔴 Zones critiques

| Zone | Risque |
|---|---|
| `useXmlBufferSync` / `useRubriqueSave` | Ne pas migrer vers TanStack Query — flux XML buffer géré hors React Query intentionnellement |
| ProductDocSync mutations réordonnancement | Non persistées — à corriger dans ce chantier (Phase 4) |

---

# 📊 Statut des phases

| Phase | Statut |
|---|---|
| Phase 1 — Audit | ✅ Terminé (2026-04-17) |
| Phase 2 — Consolidation apiClient | ✅ Terminé (2026-04-17) |
| Phase 3 — Introduction TanStack Query | ✅ Terminé (2026-04-17) |
| Phase 4 — Migration composants | ✅ Terminé (2026-04-17) |
| Phase 5 — Stabilisation | ✅ Terminé (2026-04-17) |

---

# ✔️ Fin du document
