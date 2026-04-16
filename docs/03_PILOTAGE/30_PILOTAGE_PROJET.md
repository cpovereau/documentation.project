# 🧭 30 — Pilotage du projet Documentum

> Ce document pilote les **travaux en cours et à venir**.
> Le détail des chantiers terminés est dans `30_SUIVI_REALISATION.md`.
>
> **Transition en cours :** stabilisation technique → structuration métier

---

# 📊 Tableau de bord

| # | Chantier | Statut | Priorité |
|---|---|---|---|
| 1 | Backend réalignement | ✅ Terminé | — |
| 2 | Intégration frontend backend canonique | ✅ Terminé | — |
| 2BIS | Réalignement Paramètres > Données | ✅ Terminé | — |
| 3 | Stabilisation CentralEditor | 🔄 En cours — Phase 4 | 🔥 Haute |
| 4 | Socle frontend & orchestration applicative | 🚧 À lancer | 🔥 Haute |
| 5 | Flux métier Documentum | 📋 À implémenter | 🔥 Haute |
| 6 | Journalisation & audit | 📋 À faire | 🟠 Moyenne-Haute |
| 7 | Insertion images RightSidebar | 🚧 À planifier | ⚙️ Moyenne-Haute |
| 8 | Versioning documentaire | ✅ Terminé (Lots 1–4) | — |
| 9 | Import assisté PDF → Rubriques | 🚧 À planifier | ⚙️ Moyenne |

---

# 🔒 Règle fondamentale

Ce document organise :
- ce qui doit être fait
- dans quel ordre
- avec quel niveau de priorité

Il ne définit pas la vérité métier. Il ne remplace pas le référentiel.

---

# 🧩 Chantiers en cours et à venir

---

## 🔄 Chantier 3 — Stabilisation CentralEditor

### Objectif
Finaliser la fiabilisation du cœur éditorial :
- buffer XML
- parsing XML ⇄ TipTap
- sauvegarde backend
- validation XML DITA

### Documents liés
- `docs/01_OPERATIONNEL/CentralEditor/50_CARTOGRAHIE_CENTRALEDITOR.md`
- `docs/01_OPERATIONNEL/CentralEditor/51_ANALYSE_TECHNIQUE_CENTRALEDITOR.md`
- `docs/01_OPERATIONNEL/Frontend/CENTRALEDITOR_REFACTOR_ROADMAP.md`

### Avancement
- Phase 1 — Buffer & synchronisation TipTap : ✅ TERMINÉE
- Phase 2 — Allègement structurel : ✅ TERMINÉE
- Phase 3 — Parsing XML ⇄ TipTap complet : ✅ TERMINÉE
- Phase 4 — Sauvegarde backend & validation XML : 🔄 EN COURS

### Statut
🔄 EN COURS

---

## 🚧 Chantier 4 — Socle frontend & orchestration applicative

### Objectif
Mettre en place un socle frontend robuste, extensible et cohérent permettant :
- une communication fiable avec le backend
- une cohérence globale des comportements utilisateurs
- une traçabilité compatible ITIL
- une intégration future avec des modules externes (IA, support ITIL, portail client)

### Axes structurants

#### 4A — Socle API unifié
- Client API unique (`apiClient`)
- Normalisation des erreurs
- Routes exclusivement `/api/...`
- Aucune construction d'URL dans les composants

#### 4B — Socle hooks métier

Chaque ressource expose un hook standard :
```ts
{
  items, isLoading, error,
  create(data), update(id, data), delete(id),
  archive(id), restore(id)
}
```
- Aucune logique API dans les composants
- Mutations encapsulées dans les hooks
- React Query comme source de vérité

#### 4C — Socle administration (Paramètres)
- Pattern commun pour toutes les listes (affichage, création, modification, archivage)
- Modales standardisées, typage unifié
- Comportement cohérent entre onglets

#### 4D — Socle permissions & gouvernance
- Gestion des rôles côté frontend
- Helpers de permissions (`canEdit`, `canArchive`, `canPublish`)
- Préparation aux workflows (validation, publication)

#### 4E — Socle traçabilité & événements
- Toutes les actions passent par des hooks identifiables
- Préparation à la journalisation (Chantier 6)

### Règles fondamentales
- Aucun appel API direct dans les composants
- Aucune duplication d'état
- Aucune logique métier implicite
- Aucun `useEffect` technique pour charger des données

### Plan d'exécution
1. **Audit** — appels directs, hooks non homogènes, duplications d'état, effets parasites
2. **Normalisation** — homogénéiser les hooks, centraliser les mutations, aligner les types
3. **Nettoyage** — simplifier les composants, supprimer les `useEffect` techniques
4. **Validation** — zéro appel direct, zéro URL reconstruite, hooks cohérents, TypeScript propre

### Statut
🚧 À LANCER (structurant)

### Priorité
🔥 PRIORITÉ HAUTE

---

## 📋 Chantier 5 — Flux métier Documentum

### Objectif
Implémenter les flux métier complets dans le système, en alignant frontend, backend et modèle métier.

### Référence
La description des flux est dans `docs/00_REFERENTIEL/10_MODELE_METIER_DOCUMENTUM.md`.

### Flux à implémenter

| Flux | Description | Dépendances |
|---|---|---|
| 1 | Gestion de projet documentaire (création, ouverture, suppression) | ✅ Partiellement en place |
| 2 | Construction documentaire (structure, rubriques) | ✅ Partiellement en place |
| 3 | Édition de rubrique (buffer, validation XML, sauvegarde) | Chantier 3 en cours |
| 4 | Pilotage documentaire (ProductDocSync, impacts) | À implémenter |
| 5 | Publication (diff pré-publication, version, export) | Backend ✅, frontend partiel |

### Statut
📋 À IMPLÉMENTER (progressif selon les autres chantiers)

### Priorité
🔥 PRIORITÉ HAUTE

---

## 📋 Chantier 6 — Journalisation & audit

### Objectif
Mettre en place une journalisation complète, cohérente et exploitable :
- actions utilisateur
- événements métier (révision, publication, impact)
- opérations techniques critiques

### Périmètre

**Backend — Modèle `LogEntry` (champs minimum) :**
```
id · date · utilisateur · type_action · objet_type · objet_id · description · metadata_json
```

**Points d'injection :**
- Middleware → connexions/déconnexions
- Services métier → publication, révision
- Utilitaire central → `log_action()`

**Frontend — Évolutions prévues :**
- Filtres dynamiques (type, utilisateur, objet)
- Pagination
- Liens cliquables vers les objets

### Règles
- Centralisation backend obligatoire
- Logs persistés uniquement (pas de logs UI seuls)
- Structure exploitable (pas de texte libre)

### Plan de mise en œuvre
1. Modèle `LogEntry` + utilitaire `log_action()` + log création/modification rubrique
2. Log publication, versioning, enrichissement UI (filtres)
3. Intégration ProductDocSync, exploitation pour analyse / IA

### Statut
📋 À FAIRE

### Priorité
🟠 PRIORITÉ MOYENNE-HAUTE

---

## 🚧 Chantier 7 — Insertion et gestion des images (RightSidebar)

### Objectif
Permettre l'insertion et la gestion contrôlée des images dans les rubriques depuis le `RightSidebar`.

### Périmètre
- Sélection d'une image depuis le `RightSidebar`
- Insertion de la référence dans la rubrique en cours
- Gestion du lien rubrique ↔ média
- Cohérence frontend / buffer XML / backend / structure DITA

### Points de vigilance
- Ne pas contourner le système d'import média existant
- Distinguer ressource média stockée et référence insérée dans la rubrique
- Prévoir : remplacement d'image, suppression du lien, édition des attributs (alt, titre, légende)

### Dépendances
- Chantier 3 (CentralEditor stabilisé)
- Panneau média / RightSidebar opérationnel
- Décisions sur les extensions TipTap Image / Figure

### Statut
🚧 À PLANIFIER

### Priorité
⚙️ PRIORITÉ MOYENNE-HAUTE

---

## 🚧 Chantier 9 — Import assisté de documentation existante (PDF → Rubriques)

### Objectif
Permettre l'import de documents PDF via un assistant guidé, capable de découper automatiquement le contenu en rubriques exploitables dans Documentum.

### Principe
Un assistant utilisateur permettant de :
1. Importer un PDF
2. Analyser sa structure (niveaux de titres, blocs)
3. Proposer une découpe en rubriques
4. Injecter le contenu dans un projet nouveau ou existant

### Fonctionnalités attendues
- Détection des niveaux de titres → arborescence logique
- Découpe proposée, ajustable manuellement
- Extraction des images + import dans le système média
- Transformation vers XML DITA
- Création ou insertion dans une map existante

### Points de vigilance
- Qualité très variable des PDF (structure implicite)
- Transformation DITA non triviale
- Contrôle utilisateur obligatoire à chaque étape
- Ne pas viser une automatisation totale dès le départ

### Dépendances
- Chantier 3 (CentralEditor fonctionnel)
- Chantier 7 (insertion images)
- Système média opérationnel

### Statut
🚧 À PLANIFIER

### Priorité
⚙️ PRIORITÉ MOYENNE (après versioning et gestion des images)

---

# 🔴 Zones critiques

| Zone | Niveau | Note |
|---|---|---|
| Buffer XML | 🔴 Critique | Risque de perte de données |
| Conversion XML ⇄ TipTap | 🔴 Critique | Parsing incomplet = contenu corrompu |
| Synchronisation Front / Back (couche contenu) | 🟠 Important | Couche structurelle résolue — reste : buffer, sauvegarde rubrique |
| Duplication d'état frontend | 🟠 Important | Chantier 4 |
| Cohérence ProductDocSync | 🟠 Important | Chantier 5 |
| UX fine / performance | 🟢 Secondaire | — |

---

# 📋 Backlog structuré

## 🔥 Priorité haute
- Finaliser Phase 4 CentralEditor (sauvegarde backend + validation XML)
- Lancer Chantier 4 — Socle frontend
- Implémenter Flux 3 (édition rubrique complète)

## ⚙️ Priorité moyenne
- Chantier 6 — Journalisation
- Chantier 7 — Insertion images
- Flux 4 (ProductDocSync)
- Flux 5 frontend (diff pré-publication, affichage version)

## 🧩 Priorité basse
- Chantier 9 — Import PDF
- UX avancée (drag & drop cross-niveau, rendu racine)
- Fonctionnalités secondaires

---

# 🔭 Hors pilotage opérationnel

Les éléments suivants sont identifiés mais ne doivent **pas impacter le court terme** :

* Documentum Nexus (vision plateforme)
* IA / base de connaissance
* Portail client / support

👉 Ces sujets sont traités dans `30_ROADMAP_DOCUMENTUM_NEXUS.md`.

---

# 🧭 Méthode de travail

**Cycle recommandé :**
Analyse → Décision → Référentiel → Implémentation → Cartographie

**Utilisation IA :**
Claude / Cursor utilisés pour cartographier le code existant, identifier les écarts, générer du code aligné.

**Règle de suivi :**
Toute avancée significative doit être reportée dans `30_SUIVI_REALISATION.md`.
