# 🧭 30 — Pilotage du projet Documentum

📅 Dernière mise à jour : 2026-04-17

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
    → Publication réelle          ← en cours (CentralEditor Phase 4)
        → Pilotage documentaire   ← à activer (ProductDocSync)
            → Base Métier         ← phase 3 Nexus
                → Nexus complet   ← phase 4 Nexus
```

Trois axes :
- **Core documentaire** — édition, structure, sauvegarde, export
- **Pilotage documentaire** — ProductDocSync, ImpactDocumentaire
- **Nexus** — Base Métier, API knowledge, modules externes

---

# 🗂 Cartographie des roadmaps

## CentralEditor
📄 [docs/01_OPERATIONNEL/CentralEditor/CENTRALEDITOR_REFACTOR_ROADMAP.md](../01_OPERATIONNEL/CentralEditor/CENTRALEDITOR_REFACTOR_ROADMAP.md)
📊 Phase 4 en cours — sauvegarde backend & validation XML DITA

| Phase | Statut |
|---|---|
| Phase 1 — Buffer & sync TipTap | ✅ Terminée |
| Phase 2 — Allègement structurel | ✅ Terminée |
| Phase 3 — Parsing XML ⇄ TipTap | ✅ Terminée |
| Phase 4 — Sauvegarde backend + validation XML | 🔄 En cours |

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
1. [MAINTENANT] CentralEditor Phase 4 — sauvegarde backend + validation XML
2. [SUIVANT]    Socle frontend (Chantier 4) — hooks, apiClient, React Query
3. [APRÈS]      ProductDocSync — débloquer versions + réordonnancement persisté
4. [APRÈS]      RightSidebar Phase 1 — branchement API médiathèque
5. [MOYEN TERME] ImpactDocumentaire + Journalisation
6. [LONG TERME]  Base Métier (Phase 3 Nexus) + Nexus complet
```

---

# 🚀 Alignement avec Documentum Nexus

📄 [docs/03_PILOTAGE/30_ROADMAP_DOCUMENTUM_NEXUS.md](30_ROADMAP_DOCUMENTUM_NEXUS.md)

| Phase Nexus | Description | Modules concernés | Statut |
|---|---|---|---|
| Phase 1 — Valeur Core | Publication réelle (export, DITA-OT, autosave) | CentralEditor, LeftSidebar | 🔄 En cours |
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
| Centralisation API | `apiClient` unique, routes `/api/...` exclusivement | 🚧 Partiel (Chantier 4) |
| Gestion erreurs | Normalisation, feedback utilisateur | 🚧 À structurer |
| Cohérence UX | Modales, patterns, comportements uniformes | 🚧 Partiel (Settings) |
| Synchronisation frontend/backend | Hooks React Query, mutations persistées | 🔄 En cours |
| Journalisation & audit | `LogEntry`, `log_action()`, UI filtres | 📋 Chantier 6 |

---

# 🔴 Zones critiques

| Zone | Niveau | Risque |
|---|---|---|
| Buffer XML | 🔴 Critique | Perte de données si désynchronisation |
| Conversion XML ⇄ TipTap | 🔴 Critique | Contenu corrompu si parsing incomplet |
| Synchronisation contenu frontend/backend | 🟠 Important | Incohérences buffer / sauvegarde rubrique |
| Duplication d'état frontend | 🟠 Important | Chantier 4 — hooks non homogènes |
| ProductDocSync persistance | 🟠 Important | Réordonnancement local non persisté |

---

# 📋 Backlog priorisé

## 🔥 Haute priorité
- Finaliser CentralEditor Phase 4 (sauvegarde backend + validation XML)
- Lancer Chantier 4 — socle frontend (apiClient, hooks React Query, zéro appel direct)
- Débloquer ProductDocSync Phase 2 (arbitrage VersionProjet ↔ Produit)

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

👉 **CentralEditor Phase 4 — sauvegarde backend & validation XML**

Objectif immédiat :
1. Implémenter la sauvegarde depuis le buffer XML vers le backend (rubrique)
2. Valider la conformité XML DITA
3. Tester le cycle complet : édition TipTap → XML → buffer → sauvegarde → rechargement

Roadmap : [CENTRALEDITOR_REFACTOR_ROADMAP.md](../01_OPERATIONNEL/CentralEditor/CENTRALEDITOR_REFACTOR_ROADMAP.md)

---

# 📊 Suivi

| Date | Action | Statut |
|---|---|---|
| 2026-04-10 | Chantier 2 — Intégration frontend/backend canonique | ✅ Terminé |
| 2026-04-10 | LeftSidebar Lots 1–5 | ✅ Terminé |
| 2026-04-16 | Map Sprint 4 — persistence + routes canoniques | ✅ Terminé |
| 2026-04-17 | ProductDocSync — fonctionnalités branchées API | ⚠️ Partiel |
| 2026-04-17 | CentralEditor Phase 4 | 🔄 En cours |

---

# ⚠️ Gouvernance

- Toute tâche doit être tracée dans une roadmap de module
- Aucune logique métier dans les composants React
- Aucun appel API hors `apiClient`
- Toute décision d'architecture → decision log obligatoire
- Ce document est mis à jour à chaque avancée significative

👉 Historique des chantiers terminés : [30_SUIVI_REALISATION.md](30_SUIVI_REALISATION.md)
