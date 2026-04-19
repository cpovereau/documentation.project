# 🧭 30 — Pilotage du projet Documentum

📅 Dernière mise à jour : 2026-04-19

> Ce document est orienté **action**. Il ne contient que ce qui est en cours ou à venir.
> L'historique complet est dans [30_SUIVI_REALISATION.md](30_SUIVI_REALISATION.md).
> Ce document **oriente** — il ne remplace pas les roadmaps détaillées par module.

---

# 🧠 Vision actuelle

```
Core documentaire (solide)
    → Socle frontend                  ✅ stabilisé (Chantier 4 clôturé)
        → Pilotage documentaire        ✅  ProductDocSync Phases 1-3 + 5 livrées
        → Généralisation Nexus         ← MOYEN TERME (context_produit)
            → Base Métier              ← phase 3 Nexus
                → Nexus complet        ← phase 4 Nexus
```

Trois axes :
- **Core documentaire** — édition, structure, sauvegarde, export
- **Pilotage documentaire** — ProductDocSync, ImpactDocumentaire
- **Nexus** — Base Métier, API knowledge, modules externes

---

# ✅ Socle réalisé (résumé)

> Détail complet → [30_SUIVI_REALISATION.md](30_SUIVI_REALISATION.md)

- **CentralEditor** — toutes phases terminées (Phases 1–5 ✅)
- **LeftSidebar** — Lots 1–5 terminés (sélection, routes, CRUD, hooks, export ✅)
- **Map** — Sprint 4 terminé (persistence, routes canoniques, reorder/indent/outdent ✅)
- **Settings** — DataTab opérationnel ✅
- **RightSidebar** — Phase 1 terminée (API médiathèque, mutualisé Desktop + ProductDocSync ✅)
- **Chantier 4** — Socle frontend stabilisé (apiClient, TanStack Query v5, zéro appel direct ✅)
- **ProductDocSync** — Phases 1, 2, 3, 5 intégralement livrées (2026-04-18/19 ✅)
  - ImpactDocumentaire backend + frontend de bout en bout (migrations 0013 + 0014, 10 tests)
  - SyncBottombar, SyncEditor TipTap + notes + usages, ImpactMapModal données réelles
  - Phase 4 sautée : §4.2 livré, §4.1 bloqué (Gestion de Production Nexus), §4.3 reporté
  - Phase 5 nettoyage : CSS `cn()` wrapper SyncRightSidebar, console.log purgés (apiClient + xmlToTiptap)

---

# 🔧 Travaux actifs

## ProductDocSync — Phase 5 (nettoyage & stabilisation) ✅ LIVRÉ 2026-04-19

📄 [PRODUCTDOCSYNC_ROADMAP.md](../01_OPERATIONNEL/ProductDocSync/PRODUCTDOCSYNC_ROADMAP.md)

| Tâche | Statut |
|---|---|
| §5.4 — Bug CSS wrapper SyncRightSidebar (template literal → `cn()`) | ✅ Livré |
| §5.1 — `console.log` production supprimés (`apiClient.ts`, `xmlToTiptap.ts`) | ✅ Livré |

## ProductDocSync — §4.3 (reporté)

| Tâche | Statut |
|---|---|
| Vue multi-évolutions dans `ImpactMapModal` (toutes les évos d'une version produit) | 📋 Reporté |

## ProductDocSync — §4.1 (bloqué)

| Tâche | Blocage |
|---|---|
| `TestPlanModal` branché backend réel | ⛔ Bloqué — dépend du module **Gestion de Production** (Nexus, non développé) |

---

# 📋 Prochaines étapes (backlog priorisé)

## 🔥 Haute priorité

1. **RightSidebar Phase 3** — insertion image dans CentralEditor (prérequis levés ✅ — déblocable)
2. **Module Gestion de Production (Nexus)** — spécification requise avant toute implémentation de `TestPlanModal` §4.1

## ⚙️ Priorité moyenne

- RightSidebar Phase 2 — pagination et chargement différé
- **Chantier Généralisation Nexus** — `context_produit`, Pilotage documentaire générique, harmonisation (à conduire avant de multiplier les modules spécifiques)
- Chantier 6 — Journalisation (`LogEntry`, `log_action()`, UI filtres)
- API export backend + pipeline DITA-OT (Phase 1 Nexus)
- Autosave CentralEditor (debounce + indicateur + retry)

## 🧩 Priorité basse

- ProductDocSync §4.3 — vue multi-évolutions `ImpactMapModal`
- Map Sprint 5 — drag & drop cross-niveau, rendu racine
- Chantier 9 — Import PDF
- Widget Tableau de bord (composant 3 tailles — futur)
- UX avancée (responsive tablette/smartphone)
- Phase 3 Nexus — Base Métier (RéférentielMétier, RègleMétier…)

---

# 🔗 Dépendances actives

| Travail | Dépend de | État prérequis |
|---|---|---|
| ProductDocSync §4.1 `TestPlanModal` | Module Gestion de Production (Nexus) | ⛔ Non développé |
| ProductDocSync §4.3 vue multi-évolutions | Itération dédiée à planifier | 📋 Reporté |
| RightSidebar Phase 3 (insertion image) | CentralEditor Phase 4 | ✅ Déblocable |
| Chantier 9 — Import PDF | CentralEditor + RightSidebar Phase 1 | ✅ Déblocable |
| Chantier 6 — Journalisation | Socle frontend Chantier 4 | ✅ Déblocable |
| Chantier Généralisation Nexus | Arbitrage `context_produit` + spec modules | 📋 À initier |

---

# 🚀 Prochaine action

👉 **RightSidebar Phase 3** — insertion image dans CentralEditor (déblocable immédiatement).

---

# 🔍 Points de vigilance documentaires

Points identifiés, à traiter avant de progresser sur les chantiers concernés.

| Point | Document cible | Priorité | Statut |
|---|---|---|---|
| **Incohérence modèle v0.2** : `10_MODELE_METIER_DOCUMENTUM.md` §Relations majeures conserve `Fonctionnalité → ImpactDocumentaire` (direct), alors que le modèle v0.2 positionne l'`ImpactDocumentaire` sous `EvolutionProduit`. | `10_MODELE_METIER_DOCUMENTUM.md` | 🟠 Avant Phase 2 complète | 📋 À corriger |
| **Spec manquante** : modules Gestion de Production et Publipostage introduits dans l'architecture modulaire mais sans spec métier dédiée. | Nouveaux fichiers à créer | 🟡 Avant implémentation | 📋 À créer |
| **Design non arbitré** : `useContextProduitStore` nommé dans `20_ARCHITECTURE_FRONTEND.md` mais périmètre exact non défini. | `20_ARCHITECTURE_FRONTEND.md` + chantier dédié | 🟡 Avant Chantier Généralisation | 📋 À arbitrer |
| **Backend non documenté** : aucun endpoint de récupération du `context_produit` actif dans `10_BACKEND_CANONIQUE.md`. | `10_BACKEND_CANONIQUE.md` | 🟡 Avant Chantier Généralisation | 📋 À documenter |

> ⚠️ Règle : un point de vigilance non résolu bloque l'implémentation des chantiers qui en dépendent.

---

# 🚀 Alignement Documentum Nexus

📄 [30_ROADMAP_DOCUMENTUM_NEXUS.md](30_ROADMAP_DOCUMENTUM_NEXUS.md)

| Phase Nexus | Statut | Restant |
|---|---|---|
| Phase 0 — Généralisation Nexus | 📋 À initier | `context_produit`, harmonisation modules |
| Phase 1 — Valeur Core | 🔄 En cours | API export DITA-OT, autosave, XML racine valide |
| Phase 2 — Pilotage documentaire | ⚠️ Partiel | Phase 3 ProductDocSync ✅ — §4.1 bloqué (Gestion de Production) |
| Phase 3 — Base Métier | ⬜ Non démarré | Module G (RéférentielMétier, RègleMétier…) |
| Phase 4 — Nexus ouvert | ⬜ Non démarré | API knowledge, modules ITIL / IA / Portail |

---

# 🧩 Chantiers transverses

| Chantier | Statut |
|---|---|
| Centralisation API (`apiClient`) | ✅ Terminé — Chantier 4 |
| Socle TanStack Query v5 | ✅ Terminé — Chantier 4 |
| Synchronisation frontend/backend | ✅ En place — Chantier 4 |
| Gestion erreurs (normalisation, feedback) | 🚧 À structurer |
| Cohérence UX (modales, patterns) | 🚧 Partiel |
| Journalisation & audit (`LogEntry`) | 📋 Chantier 6 |
| **Généralisation Nexus** (`context_produit`) | 📋 À conduire |

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

| Document | Contenu |
|---|---|
| [10_BACKEND_CANONIQUE.md](../01_OPERATIONNEL/Backend/10_BACKEND_CANONIQUE.md) | Endpoints canoniques exposés, règles DRF, conventions API |
| [10_CARTOGRAPHIE_BACKEND_CANONIQUE_EXPOSE.md](../01_OPERATIONNEL/Backend/10_CARTOGRAPHIE_BACKEND_CANONIQUE_EXPOSE.md) | Cartographie exhaustive des routes `/api/...` disponibles |

> ⚠️ Un endpoint non documenté = un endpoint non garanti.
