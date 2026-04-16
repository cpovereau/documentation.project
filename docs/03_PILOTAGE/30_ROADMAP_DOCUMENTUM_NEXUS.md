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

### 🔹 Phase 1 — Valeur Core (court terme)

- Implémenter API export backend
- Intégrer pipeline DITA-OT
- Finaliser publication multi-format (PDF, HTML, SCORM)
- Mettre en place autosave (debounce + indicateur + retry)
- Initialiser XML racine valide

---

### 🔹 Phase 2 — Pilotage documentaire

- Brancher `ProductDocSync` sur API réelle
- Implémenter modèle `ImpactDocumentaire`
- Lier fonctionnalités ↔ rubriques
- Suivre statut documentaire (à faire, en cours, validé…)

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

- ProductDocSync connecté
- ImpactDocumentaire

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