# 🚀 30_ROADMAP_DOCUMENTUM_NEXUS

> **Statut** : document de pilotage
>
> **Objectif** : guider l’exécution des travaux pour aligner Documentum avec Documentum Nexus
>
> **Positionnement** : `30_PILOTAGE_PROJET/`

---

## 🧠 1. Objectif

Aligner progressivement Documentum avec Documentum Nexus en priorisant la **valeur produit** :

- Publication réelle des contenus
- Pilotage documentaire (impact des évolutions)
- Gouvernance métier (Base Métier)

---

## 🚀 2. Phases

### Phase 0 — Généralisation Nexus (transverse)
👉 Poser les bases conceptuelles et documentaires permettant à Nexus de dépasser le seul contexte ingénierie logicielle

### Phase 1 — Finaliser la valeur Core
👉 Rendre Documentum utilisable en production (édition + publication)

### Phase 2 — Activer le pilotage documentaire
👉 Comprendre et suivre les impacts fonctionnels sur la documentation

### Phase 3 — Construire la Base Métier
👉 Centraliser les règles métier et structurer la connaissance

### Phase 4 — Ouvrir Nexus
👉 Exposer la connaissance et préparer les modules futurs

---

## 🔧 3. Détail des phases

### 🔹 Phase 0 — Généralisation Nexus (chantier transverse)

À conduire avant ou en parallèle des phases d'implémentation avancées :

- Introduire et documenter le concept de `context_produit` dans l'architecture
- Généraliser le module Pilotage documentaire (schéma `ObjetMétier → ÉvénementMétier → ImpactDocumentaire`)
- Harmoniser la documentation pour distinguer socle générique / spécialisation logicielle actuelle
- Formaliser la nomenclature des modules Nexus (Pilotage documentaire, Publipostage, Gestion de production…)
- Préparer l'activation contextuelle des modules dans le frontend

> ⚠️ Cette phase ne bloque pas les phases 1 et 2, mais elle doit être conduite avant de multiplier des modules spécifiques non généralisables.

---

### 🔹 Phase 1 — Valeur Core (court terme)

- Implémenter API export backend
- Intégrer pipeline DITA-OT
- Finaliser publication multi-format (PDF, HTML, SCORM)
- Mettre en place autosave (debounce + indicateur + retry)
- Initialiser XML racine valide

---

### 🔹 Phase 2 — Pilotage documentaire

- ~~Brancher `ProductDocSync` sur API réelle~~ ✅ (2026-04-19)
- ~~Implémenter modèle `ImpactDocumentaire`~~ ✅ (2026-04-18)
- ~~Lier fonctionnalités ↔ rubriques~~ ✅ (2026-04-19)
- ~~Suivre statut documentaire (à faire, en cours, validé…)~~ ✅ (2026-04-19)
- **Module Gestion de Production** — prérequis pour `TestPlanModal` (ProductDocSync §4.1) ← à développer
- **Vue multi-évolutions `ImpactMapModal`** — (ProductDocSync §4.3) ← reporté

---

### 🔹 Phase 3 — Base Métier

- Implémenter Module G :
  - RéférentielMétier
  - RègleMétier
  - VersionRègleMétier
  - SourceMétier
  - ValidationMétier
- Créer API `/api/metier/*`
- Structurer gouvernance métier

---

### 🔹 Phase 4 — Nexus

- Créer API `/api/knowledge/` (lecture seule)
- Définir architecture modulaire (apps Django séparées)
- Préparer intégration modules :
  - C — ITIL / Support
  - D — IA / Knowledge Engine
  - E — Portail client
  - F — Formation

---

## ⚠️ 4. Règles de pilotage

- Ne pas développer de module Nexus sans API de connaissance
- Ne pas avancer le frontend sans backend prêt
- Valider chaque phase avant de passer à la suivante
- Supprimer les solutions temporaires une fois remplacées

---

## 🎯 5. Priorités actuelles

### 🔴 P0 — Bloquant valeur produit

- API export + pipeline DITA-OT

### 🟠 P1 — Sécurisation UX

- Autosave
- XML racine valide

### 🟡 P2 — Activation valeur Nexus

- ~~ProductDocSync connecté~~ — livré (Phase 3 ✅, 2026-04-19)
- ~~ImpactDocumentaire~~ — livré (migrations 0013 + 0014, 10 tests, 2026-04-18/19)

### 🟠 P1 bis — Prérequis ProductDocSync §4.1

- **Module Gestion de Production** — à spécifier et développer pour débloquer `TestPlanModal` dans ProductDocSync Phase 4 §4.1. Voir `gov_decision-log.md` entrée 2026-04-19.

---

## 🧭 6. Chemin critique

1. API export + pipeline DITA-OT
2. Autosave
3. ImpactDocumentaire
4. ProductDocSync connecté

👉 Sans ces éléments, la valeur Documentum Nexus reste incomplète.

---

## 📊 7. Vision globale

```
Phase 0 — Généralisation Nexus (transverse)
    ↕
Core documentaire (solide)
    → Publication réelle
        → Pilotage documentaire
            → Base Métier
                → Nexus complet
```

---

## 🧠 8. Principe directeur

Ne pas chercher à tout construire immédiatement.

Construire **par couches de valeur**, dans cet ordre :

1. Rendre le Core réellement utile
2. Ajouter du pilotage
3. Structurer la connaissance
4. Ouvrir vers l’écosystème Nexus

---

# ✔️ Fin du document