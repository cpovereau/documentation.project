# 🧭 30 — Pilotage du projet Documentum

📅 Dernière mise à jour : 2026-04-17 (Chantier 4 — clôturé ✅ | Bugs XML + déconnexion corrigés)

---

# 🎯 Objectif

Point d'entrée unique pour :
- piloter le projet au quotidien
- prioriser les actions
- orchestrer les roadmaps par module

👉 Ce document **oriente** — il ne remplace pas les roadmaps détaillées.

---

# 🧠 Vision actuelle

```
Core documentaire (solide)
    → Socle frontend             ✅ stabilisé (Chantier 4 clôturé)
        → Pilotage documentaire  ← MAINTENANT (ProductDocSync)
            → Base Métier        ← phase 3 Nexus
                → Nexus complet  ← phase 4 Nexus
```

Trois axes :
- **Core documentaire** — édition, structure, sauvegarde, export
- **Pilotage documentaire** — ProductDocSync, ImpactDocumentaire
- **Nexus** — Base Métier, API knowledge, modules externes

---

# 🗂 Cartographie des roadmaps

## CentralEditor
📄 [docs/01_OPERATIONNEL/CentralEditor/CENTRALEDITOR_REFACTOR_ROADMAP.md](../01_OPERATIONNEL/CentralEditor/CENTRALEDITOR_REFACTOR_ROADMAP.md)
📊 ✅ Toutes phases terminées — workflow rédaction → sauvegarde → validation opérationnel

| Phase | Statut |
|---|---|
| Phase 1 — Buffer & sync TipTap | ✅ Terminée |
| Phase 2 — Allègement structurel | ✅ Terminée |
| Phase 3 — Parsing XML ⇄ TipTap | ✅ Terminée |
| Phase 4 — Sauvegarde backend + validation XML | ✅ Terminée |
| Phase 5 — Sécurisation guard de navigation | ✅ Terminée |

---

## Map
📄 [docs/01_OPERATIONNEL/Frontend/FRONTEND_MAP_ROADMAP.md](../01_OPERATIONNEL/Frontend/FRONTEND_MAP_ROADMAP.md)
📊 Sprint 4 terminé — création, persistence, routes canoniques validées

| Lot | Statut |
|---|---|
| Stabilisation structure | ✅ Terminé |
| Création rubrique (route canonique atomique) | ✅ Terminé |
| Reorder / indent / outdent + persistance backend | ✅ Terminé |
| Rechargement systématique après chaque opération | ✅ Terminé |
| Clone et suppression depuis toolbar | ⚠️ Stubs v1 (non implémentés) |
| Route `attach` rubrique existante | ⚠️ Backend défini, non appelé côté frontend |
| Drag & drop cross-niveau (projection `level → parent/ordre`) | 🚧 À implémenter |
| Évolutions UX (rendu racine, icônes) | ⬜ Non prioritaire |

---

## LeftSidebar
📄 [docs/01_OPERATIONNEL/LeftSidebar/LEFTSIDEBAR_ROADMAP.md](../01_OPERATIONNEL/LeftSidebar/LEFTSIDEBAR_ROADMAP.md)
📊 Lots 1–5 terminés — sélection, routes, CRUD, hooks, export

| Lot | Statut |
|---|---|
| Lot 1 — Chaîne de sélection | ✅ Terminé |
| Lot 2 — Routes canoniques | ✅ Terminé |
| Lot 3 — CRUD projets & rubriques | ✅ Terminé |
| Lot 4 — Qualité code & hooks | ✅ Terminé |
| Lot 5 — Publication / Export | ✅ Terminé |

---

## ProductDocSync
📄 [docs/01_OPERATIONNEL/ProductDocSync/PRODUCTDOCSYNC_ROADMAP.md](../01_OPERATIONNEL/ProductDocSync/PRODUCTDOCSYNC_ROADMAP.md)
📊 Phase 1 partielle — API fonctionnalités branchée, versions bloquées

| Phase | Statut |
|---|---|
| Phase 1 — Branchement API fonctionnalités | ⚠️ Partiel (mutations réordonnancement non persistées) |
| Phase 2 — Branchement API produits & versions | ⚠️ Bloqué (arbitrage métier `VersionProjet` vs `Produit`) |
| Phase 3 — ImpactDocumentaire modèle + API | 📋 À faire (prérequis Nexus M1) |
| Phase 4 — Plan de test & carte d'impact | 📋 À faire |
| Phase 5 — Nettoyage & stabilisation | 📋 À faire |

---

## RightSidebar
📄 [docs/01_OPERATIONNEL/RightSidebar/RIGHTSIDEBAR_ROADMAP.md](../01_OPERATIONNEL/RightSidebar/RIGHTSIDEBAR_ROADMAP.md)
📊 Données entièrement hardcodées — aucune API branchée

| Phase | Statut |
|---|---|
| Phase 1 — Branchement API médiathèque | 🚧 À faire (priorité haute) |
| Phase 2 — Pagination et chargement différé | 📋 À faire |
| Phase 3 — Intégration CentralEditor (insertion image) | 📋 À faire |
| Phase 4 — Évolutions UX | ⬜ Non prioritaire |

---

## Settings
📄 [docs/01_OPERATIONNEL/Settings/SETTINGS_ROADMAP.md](../01_OPERATIONNEL/Settings/SETTINGS_ROADMAP.md)
📊 Phase 1 (DataTab) terminée — autres onglets à compléter

| Phase | Statut |
|---|---|
| Phase 1 — DataTab | ✅ Terminé |
| Autres onglets | 🚧 En cours / À faire |

---

# 🔗 Dépendances

```
CentralEditor Phase 4
    ↓ (buffer XML stabilisé)
RightSidebar Phase 3 (insertion image)
    ↓
Chantier 9 — Import PDF (CentralEditor + images prêts)

ProductDocSync Phase 2
    → bloqué par arbitrage métier VersionProjet ↔ Produit

ProductDocSync Phase 3 (ImpactDocumentaire)
    → prérequis : modèle backend M1 (gap analysis)
    → prérequis : CentralEditor Phase 4 stable

Journalisation (Chantier 6)
    → prérequis : socle hooks métier (Chantier 4)
```

| Module | Dépend de |
|---|---|
| RightSidebar Phase 3 | CentralEditor Phase 4 |
| ProductDocSync Phase 3 | ImpactDocumentaire backend + CentralEditor stable |
| Chantier 9 — Import PDF | CentralEditor + RightSidebar (images) |
| Journalisation | Socle frontend Chantier 4 |
| Nexus API knowledge | Phases 1–2 stables + ImpactDocumentaire |

---

# 🧭 Ordre d'exécution

```
1. [FAIT]       CentralEditor Phases 4+5 — sauvegarde backend, validation XML, guard navigation
2. [FAIT]       Chantier 4 — Socle frontend (apiClient, TanStack Query, zéro appel direct)
3. [FAIT]       Correctifs bloquants — XML invalide, chargement rubrique, vidage session
4. [MAINTENANT] ProductDocSync — débloquer versions + réordonnancement persisté
5. [APRÈS]      RightSidebar Phase 1 — branchement API médiathèque
6. [MOYEN TERME] ImpactDocumentaire + Journalisation
7. [LONG TERME]  Base Métier (Phase 3 Nexus) + Nexus complet
```

---

# 🚀 Alignement avec Documentum Nexus

📄 [docs/03_PILOTAGE/30_ROADMAP_DOCUMENTUM_NEXUS.md](30_ROADMAP_DOCUMENTUM_NEXUS.md)

| Phase Nexus | Description | Modules concernés | Statut |
|---|---|---|---|
| Phase 1 — Valeur Core | Publication réelle (export, DITA-OT, autosave) | CentralEditor, LeftSidebar | 🔄 En cours (CentralEditor ✅ — export DITA-OT + autosave restants) |
| Phase 2 — Pilotage documentaire | ImpactDocumentaire, ProductDocSync connecté | ProductDocSync | 📋 À activer |
| Phase 3 — Base Métier | Module G (RéférentielMétier, RègleMétier…) | — (non démarré) | ⬜ Non démarré |
| Phase 4 — Nexus ouvert | API knowledge, modules ITIL / IA / Portail | — | ⬜ Non démarré |

**Ce qui est prêt :**
- LeftSidebar : CRUD complet, routes canoniques, export
- Map : structure, persistence backend, rechargement
- Settings : DataTab opérationnel

**Ce qui manque pour débloquer Phase 1 :**
- API export backend + pipeline DITA-OT
- Autosave (debounce + indicateur + retry)
- Initialisation XML racine valide

**Ce qui manque pour débloquer Phase 2 :**
- Modèle `ImpactDocumentaire` backend (M1 gap analysis)
- Arbitrage métier `VersionProjet` ↔ `Produit`
- ProductDocSync persistance mutations

---

# 🧩 Chantiers transverses

| Chantier | Description | Statut |
|---|---|---|
| Centralisation API | `apiClient` unique, routes `/api/...` exclusivement | ✅ Terminé (Chantier 4) |
| Socle TanStack Query | Hooks métier, zéro appel direct dans les composants | ✅ Terminé (Chantier 4) |
| Gestion erreurs | Normalisation, feedback utilisateur | 🚧 À structurer |
| Cohérence UX | Modales, patterns, comportements uniformes | 🚧 Partiel (Settings) |
| Synchronisation frontend/backend | TanStack Query v5 — useQuery + useMutation + invalidation | ✅ En place (Chantier 4) |
| Journalisation & audit | `LogEntry`, `log_action()`, UI filtres | 📋 Chantier 6 |

---

# 🔴 Zones critiques

| Zone | Niveau | Risque |
|---|---|---|
| ~~Buffer XML~~ | ~~🔴 Critique~~ | Résolu — wrapper `<body>`, fetch backend sur sélection, tolérance données dégradées (2026-04-17) |
| ~~Conversion XML ⇄ TipTap~~ | ~~🔴 Critique~~ | Résolu — `serializeAttributes` filtre null, `useDitaLoader` refondu (2026-04-17) |
| ~~Synchronisation contenu frontend/backend~~ | ~~🟠 Important~~ | Résolu — `useDitaLoader` est désormais le point de charge unique |
| ~~Duplication d'état frontend~~ | ~~🟠 Important~~ | Résolu — Chantier 4 (TanStack Query, hooks normalisés) |
| ~~Render loop LeftSidebar~~ | ~~🔴 Critique~~ | Résolu — `EMPTY_RUBRIQUES` stable dans `useMapStructure.ts` (2026-04-17) |
| ~~Vidage session à la déconnexion~~ | ~~🟠 Important~~ | Résolu — `AuthContext.logout()` vide les stores + QueryClient cache (2026-04-17) |
| ProductDocSync persistance | 🟠 Important | Réordonnancement local non persisté |

---

# 📋 Backlog priorisé

## 🔥 Haute priorité
- **ProductDocSync Phase 2** — arbitrage VersionProjet ↔ Produit + réordonnancement persisté ← **MAINTENANT**

## ⚙️ Priorité moyenne
- RightSidebar Phase 1 — branchement API médiathèque
- Chantier 6 — Journalisation (après Chantier 4)
- ImpactDocumentaire — modèle backend + API
- API export + pipeline DITA-OT (Phase 1 Nexus)
- Autosave CentralEditor

## 🧩 Priorité basse
- Chantier 9 — Import PDF
- Map Sprint 5 — drag & drop cross-niveau, rendu racine
- UX avancée (modales, accessibilité)
- Phase 3 Nexus — Base Métier

---

# 🚀 Prochaine action

👉 **ProductDocSync Phase 2 — arbitrage VersionProjet ↔ Produit**

Le socle frontend est stabilisé. Les bugs bloquants sont corrigés. La prochaine étape est le déblocage de ProductDocSync :

1. Trancher l'arbitrage métier `VersionProjet` vs `Produit` (source de vérité pour les versions)
2. Rendre le réordonnancement des fonctionnalités persistant (mutations non persistées actuellement)
3. Connecter l'écran ProductDocSync à l'API versions

Roadmap : [PRODUCTDOCSYNC_ROADMAP.md](../01_OPERATIONNEL/ProductDocSync/PRODUCTDOCSYNC_ROADMAP.md)

---

> ✅ **Chantier 4 — clôturé** — apiClient centralisé, TanStack Query v5 opérationnel, zéro appel direct dans les composants. Bugs bloquants corrigés (XML invalide, chargement rubrique, vidage session). Socle frontend stabilisé.
> Roadmap : [FRONTEND_CHANTIER4_SOCLE_ROADMAP.md](../01_OPERATIONNEL/Frontend/FRONTEND_CHANTIER4_SOCLE_ROADMAP.md)

---

# 📊 Suivi

| Date | Action | Statut |
|---|---|---|
| 2026-04-10 | Chantier 2 — Intégration frontend/backend canonique | ✅ Terminé |
| 2026-04-10 | LeftSidebar Lots 1–5 | ✅ Terminé |
| 2026-04-16 | Map Sprint 4 — persistence + routes canoniques | ✅ Terminé |
| 2026-04-17 | ProductDocSync — fonctionnalités branchées API | ⚠️ Partiel |
| 2026-04-17 | CentralEditor Phase 4 — sauvegarde backend + validation XML | ✅ Terminé |
| 2026-04-17 | CentralEditor Phase 5 — guard navigation + modale "Quitter sans enregistrer" | ✅ Terminé |
| 2026-04-17 | Chantier 4 — Socle frontend (apiClient, TanStack Query, zéro appel direct) | ✅ Terminé |
| 2026-04-17 | Correctif Bug 1 — XML invalide (wrapper `<body>`, fetch backend, attributs null) | ✅ Terminé |
| 2026-04-17 | Correctif Bug 2 — Vidage session à la déconnexion (stores + QueryClient) | ✅ Terminé |
| 2026-04-18 | ProductDocSync — backend `VersionProduit` + `EvolutionProduit` (21/21 tests) | ✅ Terminé |
| 2026-04-18 | ProductDocSync — frontend Phase A (hooks + handlers branchés, build 0 erreur) | ✅ Terminé |

---

# ⚠️ Gouvernance

- Toute tâche doit être tracée dans une roadmap de module
- Aucune logique métier dans les composants React
- Aucun appel API hors `apiClient`
- Toute décision d'architecture → decision log obligatoire
- Ce document est mis à jour à chaque avancée significative

👉 Historique des chantiers terminés : [30_SUIVI_REALISATION.md](30_SUIVI_REALISATION.md)

---

# 📚 Référence backend

La documentation du backend canonique est maintenue dans :

| Document | Contenu |
|---|---|
| [10_BACKEND_CANONIQUE.md](../01_OPERATIONNEL/Backend/10_BACKEND_CANONIQUE.md) | Endpoints canoniques exposés, règles DRF, conventions API |
| [10_CARTOGRAPHIE_BACKEND_CANONIQUE_EXPOSE.md](../01_OPERATIONNEL/Backend/10_CARTOGRAPHIE_BACKEND_CANONIQUE_EXPOSE.md) | Cartographie exhaustive des routes `/api/...` disponibles |

> ⚠️ Si un endpoint backend est absent, incorrect ou non à jour dans ces documents, il doit être **signalé et corrigé ici** avant toute implémentation frontend qui en dépend.
> Un endpoint non documenté = un endpoint non garanti.
