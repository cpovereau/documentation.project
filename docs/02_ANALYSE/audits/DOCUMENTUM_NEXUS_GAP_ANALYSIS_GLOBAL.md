# 🧠 Analyse d'écart — Documentum Nexus

> **Statut** : document d'analyse — ne fait pas autorité
>
> **Produit le** : 2026-04-15
>
> **Périmètre** : Backend · Frontend · CentralEditor · Flux métier · Vision Nexus globale
>
> **Positionnement documentaire** : `02_ANALYSE/audits/` — ce document analyse, ne définit pas.

---

## 1. Objectif du document

Ce document établit une **analyse d'écart complète** entre le référentiel Documentum Nexus (source de vérité documentaire et architecturale) et l'implémentation actuelle du système (backend Django, frontend React, éditeur CentralEditor).

Il sert de base à :
- l'**estimation de charge** des travaux à venir
- la **prise de décision** sur la stratégie d'évolution (refonte progressive vs restructuration)
- le **pilotage opérationnel** des chantiers de réalignement

Il ne remplace ni le référentiel métier, ni la cartographie opérationnelle. Il les croise.

---

## 2. Méthodologie utilisée

### Sources analysées

**Référentiel (source de vérité)**

| Document | Rôle |
|----------|------|
| `documentum_nexus_architecture_structure_documentum.md` | Vision modulaire Nexus (MAPs 1–5) |
| `documentum_architecture_technique_modulaire.md` | Architecture cible modulaire — modules A à G |
| `modele_metier_transverse.md` + `modele_metier_transverse_niveaux.md` | Modèle générique transverse |
| `10_MODELE_METIER_DOCUMENTUM.md` | Modèle métier Core actuel |
| `10_MODELE_METIER_BASE_METIER.md` | Modèle canonique Base Métier (module G) |
| `10_VERSIONING_DOCUMENTAIRE.md` | Logique de révision et publication |
| `20_ARCHITECTURE_FRONTEND.md` | Architecture frontend cible |
| `Frontend/20_XML_TIPTAP_CONVERSION_SPEC.md` | Spécification de conversion XML ↔ TipTap |
| `40_GOVERNANCE/gov_risk-areas.md` | Zones à risque connues |

**Opérationnel (état réel)**

| Document | Rôle |
|----------|------|
| `01_OPERATIONNEL/Backend/10_BACKEND_CANONIQUE.md` | Règles backend de référence |
| `01_OPERATIONNEL/Backend/10_CARTOGRAPHIE_BACKEND_CANONIQUE_EXPOSE.md` | Routes réellement exposées |
| `01_OPERATIONNEL/CentralEditor/50_CARTOGRAHIE_CENTRALEDITOR.md` | État réel du CentralEditor |
| `01_OPERATIONNEL/CentralEditor/51_ANALYSE_TECHNIQUE_CENTRALEDITOR.md` | Analyse technique détaillée |
| `01_OPERATIONNEL/Frontend/50_CARTOGRAPHIE_FRONTEND_DESKTOP.md` | Desktop |
| `01_OPERATIONNEL/LeftSidebar/50_CARTOGRAPHIE_FRONTEND_LEFTSIDEBAR.md` | LeftSidebar (mis à jour Lots 1–4) |
| `02_ANALYSE/audits/BACKEND_GAP_ANALYSIS.md` | Audit backend détaillé (2026-04-09) |
| `02_ANALYSE/syntheses/SYNTHESE_FRONTEND_GLOBALE.md` | Synthèse frontend consolidée |
| `01_OPERATIONNEL/Frontend/CENTRALEDITOR_REFACTOR_ROADMAP.md` | Roadmap refonte CentralEditor |

### Limites de l'analyse

- L'audit backend date du **2026-04-09** — des corrections peuvent avoir été apportées depuis.
- Le **frontend ProductDocSync** n'a pas de cartographie disponible à ce jour.
- Les **modules B à G** (Nexus) n'ont pas d'implémentation : l'analyse de ces domaines porte uniquement sur l'écart entre le modèle cible et l'absence constatée.
- Les données en base ne sont pas analysées (contenu XML, qualité des révisions existantes).

---

## 3. Synthèse exécutive

### Niveau global d'alignement

| Périmètre | Alignement |
|-----------|-----------|
| Module A — Documentum Core (backend) | **Moyen** — noyau fonctionnel, dette structurelle active |
| Module A — Frontend | **Moyen à fort** — Lots 1–4 effectués, phases CentralEditor en cours |
| Module B — Product Knowledge / ProductDocSync | **Faible** — modèle défini, pas d'API exposée, pas d'UI cartographiée |
| Module G — Base Métier | **Absent** — modèle canonique défini, aucune implémentation |
| Modules C, D, E, F (ITIL, IA, Portail, Formation) | **Absents** — vision définie, aucune implémentation |
| Modèle transverse Nexus | **Absent** — abstractions génériques non introduites |

**Niveau global : FAIBLE à MOYEN**

Le cœur documentaire (édition, structure, versioning de base) est fonctionnel. La vision Nexus complète — écosystème modulaire, APIs de connaissance, Base Métier, intégrations — est quasi-absente de l'implémentation.

### Estimation qualitative de l'effort global

**Très élevé** — plusieurs mois-équipe, sur plusieurs lots séquentiels.

Décomposition indicative :

| Domaine | Effort |
|---------|--------|
| Réalignement backend Core (violations + dette) | S–M |
| CentralEditor phases 3–4 (parsing + sauvegarde DITA) | L |
| Publication complète (UI + export + pipeline) | L |
| ProductDocSync complet (backend + frontend) | L–XL |
| Base Métier — module G (modèle + API + UI) | XL |
| APIs de connaissance Nexus | M–L |
| Modules C, D, E, F | hors périmètre immédiat |

### Zones les plus critiques

1. **CentralEditor — parsing XML ↔ TipTap** : phase 3 non terminée, risque de perte de données documentaires.
2. **Backend — violations actives** : route `/projet/create/` hors canon, exposition CRUD directe `MapRubrique`, suppression en cascade non protégée.
3. **ProductDocSync** : fonctionnalité clé de la proposition de valeur Nexus, non implémentée côté API.
4. **Publication** : la logique `RevisionRubrique` / `SnapshotPublication` existe côté backend mais aucune UI ni pipeline DITA n'est en place.

### Risques majeurs

- **Perte de contenu** : transformation XML ↔ TipTap incomplète → publication corrompue
- **Désynchronisation silencieuse** : DELETE rubrique avec cascade MapRubrique sans protection
- **Dette masquée** : 4 formats d'erreur API coexistent, routes compat non supprimées
- **Dérive monolithique** : absence d'architecture modulaire réelle, risque de tout intégrer dans le Core

---

## 4. Analyse détaillée par domaine

---

### 4.1 Backend

#### 4.1.1 Création de projet

**État attendu (référentiel)**
- Porte d'entrée unique : `POST /api/projets/`
- Orchestration via `ProjetViewSet.create()` → service `create_project()`
- Invariants garantis : projet + version active + map master + rubrique racine + MapRubrique racine

**État réel (code)**
- Route active : `POST /projet/create/` via `CreateProjectAPIView` (`views.py:719–861`)
- `ProjetViewSet.create()` désactivé volontairement — lève `ValidationError`
- Logique d'orchestration dans la view, pas dans un service
- Transaction atomique en place, invariants respectés

**Écart identifié**
- Gate 2 non franchie : porte d'entrée hors namespace `/api/`
- Absence du service `create_project()` encapsulant l'orchestration
- 3 formats de réponse d'erreur dans le seul handler de création

**Gravité** : 🔴 Critique (violation canonique de la porte d'entrée)
**Impact** : technique — architecture non conforme ; fonctionnel — faible (les invariants sont respectés)
**Effort** : S (extraction service + migration ProjetViewSet.create)

---

#### 4.1.2 Structure documentaire (Maps / MapRubrique)

**État attendu**
- Handler unique `MapViewSet` sur `/api/maps/`
- MapRubrique jamais exposé directement au frontend
- Endpoints canoniques `structure/*` pour toutes les opérations structurelles
- `POST /api/maps/{id}/structure/attach/` pour l'attachement d'une rubrique existante

**État réel**
- Tous les endpoints `structure/*` sont implémentés et fonctionnels
- `POST /api/map-rubriques/` expose MapRubrique directement (violation canon)
- `POST /api/maps/{id}/structure/attach/` absent
- Routes de compatibilité maintenues (`map-rubriques/indent`, `outdent`, `reorder` legacy)
- `CreateMapView` enregistrée mais mort (dead code — résolution URL Django)
- 6 routes de compat transitoire maintenues pour migration frontend

**Écart identifié**
- Violation du principe "le frontend ne manipule jamais MapRubrique directement"
- Endpoint `structure/attach/` manquant (empêche de compléter la migration frontend)
- Dead code non nettoyé

**Gravité** : 🟠 Moyen (compat en place, mais violation structurelle active)
**Impact** : technique — lisibilité et maintenabilité dégradées
**Effort** : S (implémentation attach + suppression dead code)

---

#### 4.1.3 Contenu documentaire (Rubrique)

**État attendu**
- `PUT /api/rubriques/{id}/` pour édition isolée
- Aucun effet de bord structurel sur update
- `RubriqueContentDTO` minimal (rubrique_id + contenu_xml) pour l'édition
- DELETE rubrique protégé contre la suppression en cascade silencieuse

**État réel**
- `PUT/PATCH /api/rubriques/{id}/` fonctionnel avec verrou et transaction
- `DELETE /api/rubriques/{id}/` → suppression en cascade des MapRubrique sans protection ni signal
- `RubriqueSerializer` polyvalent — utilisé pour tous les flux sans distinction
- Rubrique racine créée avec `contenu_xml=""` (XML vide invalide, `clean()` contourné via `objects.create()`)
- `GET /api/rubriques/` retourne `contenu_xml` sans filtre ni pagination forcée

**Écart identifié**
- Risque de corruption structurelle silencieuse via DELETE non protégé
- Absence de DTO orientés flux (édition / navigation / publication)
- Rubrique racine dans un état XML invalide à la création

**Gravité** : 🔴 Critique (DELETE sans protection — I-4)
**Impact** : fonctionnel — perte de structure documentaire possible ; technique — qualité des données
**Effort** : XS (protection DELETE) + M (DTO orientés flux)

---

#### 4.1.4 Versioning documentaire

**État attendu**
- Révision créée uniquement sur modification réelle du XML (hash comparison)
- Version projet créée uniquement sur publication
- `RevisionRubrique` immuable
- `SnapshotPublication` liant version → rubriques → révisions exactes

**État réel (Chantier 6 implémenté)**
- `RevisionRubrique` implémentée avec `numero`, `contenu_xml`, `hash_contenu` (SHA-256), `select_for_update`
- `SnapshotPublication` implémentée — map master uniquement en v1
- `compute_xml_hash` avec normalisation XML documentée
- Champs dépréciés (`revision_numero`, `version`, `version_precedente` sur Rubrique) documentés et en read-only
- Stratégie semver bump mineur automatique validée

**Écart identifié**
- Périmètre `SnapshotPublication` limité à la map master (v1 assumé, extension v2 non planifiée)
- Aucune API de publication exposée dans la cartographie backend
- Aucune UI de publication
- Pas de pipeline DITA-OT

**Gravité** : 🟠 Moyen (mécanisme en place, pas d'interface)
**Impact** : fonctionnel — publication impossible sans développement complémentaire
**Effort** : L (API publication + UI + pipeline DITA)

---

#### 4.1.5 Robustesse et qualité technique

**État attendu**
- Format d'erreur unifié via `custom_exception_handler`
- Logs structurés sur tous les flux critiques
- Permissions explicites sur toutes les vues

**État réel**
- 4 formats d'erreur coexistent (DRF standard, 3 formats maison)
- `custom_exception_handler` contourné dans `add_rubrique_to_map_view` et partiellement dans `CreateProjectAPIView` et `RubriqueViewSet.update`
- Vues de compatibilité (`MapRubriqueIndentView`, `MapRubriqueOutdentView`, `MapReorderCompatView`) sans `permission_classes` explicites
- Reorder effectue N `save()` individuels (pas de `bulk_update`)

**Gravité** : 🟠 Moyen (pas de bug fonctionnel, mais fragilité systémique)
**Impact** : technique — debugging difficile, comportements frontend imprévisibles
**Effort** : S (normalisation gestion erreurs + permissions explicites)

---

### 4.2 Frontend

#### 4.2.1 Desktop

**État attendu** : orchestrateur UI pur, aucune logique métier

**État réel** : conforme. `selectedRubriqueId` lu depuis `useSelectionStore`, transmis à CentralEditor. Aucun appel API direct. Layout et état de présentation gérés localement.

**Écart** : aucun écart fonctionnel identifié.

**Gravité** : 🟢 Faible
**Effort** : —

---

#### 4.2.2 LeftSidebar

**État attendu** : navigation documentaire, appels uniquement via endpoints canoniques

**État réel (post Lots 1–4)**
- Tous les appels backend conformes aux endpoints canoniques Sprint 4
- Chaîne de sélection fonctionnelle via `useSelectionStore`
- Garde-fou `hasUnsavedChanges` actif
- Génération XML template extraite dans `useNewRubriqueXml`
- Opérations hors scope v1 (suppression/clonage rubrique, clonage projet, publication) : toasts d'erreur explicites

**Écart résiduel**
- Initialisation buffer XML dans `useEffect` : frontière structure/contenu documentée, comportement intentionnel
- Opérations hors scope non planifiées (delete rubrique from map, clone, publication)

**Gravité** : 🟢 Faible pour l'état actuel
**Effort** : M (suppression rubrique depuis map + clone, dépend endpoint backend manquant)

---

#### 4.2.3 États globaux et stores Zustand

**État attendu**
- Une donnée = une seule source de vérité
- `useProjectStore`, `useXmlBufferStore` comme stores canoniques
- Pas de duplication d'état

**État réel**
- `useSelectionStore` : conforme (Lot 1)
- `useXmlBufferStore` : source de vérité XML côté frontend, conforme
- `useProjectStore` : conforme (double lecture résolue Lot 4)
- `useSelectedVersion` / `useSelectedProduct` : hooks d'orchestration en place

**Écart** : conforme pour les flux implémentés

**Gravité** : 🟢 Faible
**Effort** : —

---

### 4.3 CentralEditor (ZONE PRIORITAIRE)

#### Buffer et synchronisation

**État attendu**
- Buffer comme source de vérité côté frontend
- Synchronisation bidirectionnelle XML ↔ TipTap fiable
- Statuts explicites (`dirty`, `saved`, `error`)
- Aucune perte de contenu lors de la navigation

**État réel**
- `useXmlBufferStore` : source de vérité implémentée (Phase 1 terminée)
- `useXmlBufferSync` : synchronisation TipTap → XML active
- `useDitaLoader` : XML → TipTap au chargement
- Statuts `dirty/saved` en place
- Garde-fou navigation actif dans LeftSidebar

**Écart** : Phase 1 terminée, conforme.

**Gravité** : 🟢 Faible pour la synchronisation de base
**Risque résiduel** : absence d'autosave — toute fermeture non sauvegardée = perte

---

#### Parsing XML ↔ TipTap

**État attendu (spec `20_XML_TIPTAP_CONVERSION_SPEC.md`)**
- Parseur XML → TipTap tolérant et auto-réparateur
- Sérialiseur TipTap → XML strict et normé DITA
- Round-trip stable : `XML → TipTap → XML ≈ XML initial`
- Support complet des balises DITA (topics, steps, sections, balises contextuelles, prolog, etc.)

**État réel**
- `parseXmlToTiptap` et `tiptapToXml` existent et fonctionnent pour le flux nominal
- Phase 3 (parsing complet) **non terminée** selon la roadmap
- Limites de normalisation XML documentées (whitespace text nodes, ordre attributs) — non bloquants dans le flux normal TipTap
- Aucun test de round-trip automatisé confirmé
- Support DITA complet non validé

**Écart identifié**
- Parsing potentiellement incomplet pour certaines balises DITA avancées
- Aucune validation automatisée du round-trip
- Risque de perte ou d'altération silencieuse du XML à la sauvegarde

**Gravité** : 🔴 Critique (zone de risque principal — perte de données documentaires possible)
**Impact** : fonctionnel — contenu potentiellement corrompu à la publication ; UX — erreurs invisibles
**Effort** : L (implémentation complète, tests de round-trip, couverture balises DITA)

---

#### Sauvegarde backend

**État attendu**
- `PATCH /api/rubriques/{id}/` seul point de persistance
- Création de révision si contenu modifié (via hash)
- Validation XML DITA avant sauvegarde

**État réel**
- `PATCH /api/rubriques/{id}/` appelé via `useRubriqueSave`
- Phase 4 (validation XML DITA côté frontend) **non terminée**
- Pas d'autosave
- Pas de vérification frontend de cohérence XML avant envoi

**Écart identifié**
- XML invalide ou incomplet peut être sauvegardé sans avertissement frontend
- Pas de fallback / récupération en cas d'erreur réseau

**Gravité** : 🟠 Moyen
**Impact** : fonctionnel — données dégradées possibles ; UX — manque de fiabilité perçue
**Effort** : M (validation XML + autosave + gestion erreurs réseau)

---

#### Absence de gestion de conflits

**État attendu** : détection de divergences entre contenu local et contenu serveur

**État réel** : aucune gestion de conflits — si deux sessions éditent la même rubrique, la dernière sauvegarde écrase la précédente sans avertissement.

**Gravité** : 🟠 Moyen (risque faible en usage solo, critique si collaboration future)
**Effort** : XL (si collaboration temps réel), M (si gestion de conflit simple sur recharge)

---

### 4.4 Flux métier

#### Flux d'édition documentaire

**État attendu** : cycle complet création → modification → révision → sauvegarde

**État réel** : fonctionnel. Chargement XML, édition TipTap, synchronisation buffer, sauvegarde `PATCH /api/rubriques/{id}/`, révision automatique si contenu modifié (hash).

**Écart** : incomplet sur la validation XML (phase 4 CentralEditor) et l'autosave.

**Gravité** : 🟢 Faible (flux nominal fonctionnel)

---

#### Flux de versioning

**État attendu** : révisions automatiques sur modification, versions sur publication

**État réel**
- `RevisionRubrique` créée sur sauvegarde si hash différent : ✅ implémenté
- `SnapshotPublication` : ✅ implémenté (map master uniquement, v1)
- API de déclenchement de publication : ❌ non exposée dans la cartographie
- UI de publication : ❌ absente (toast "hors scope v1" dans LeftSidebar)

**Écart** : le mécanisme backend existe mais est inaccessible depuis l'UI.

**Gravité** : 🟠 Moyen (mécanisme prêt, pas d'interface)
**Impact** : fonctionnel — la publication est bloquée sans développement complémentaire
**Effort** : L (endpoint publication + UI déclenchement + sélection périmètre + export DITA)

---

#### Flux de publication

**État attendu** : pipeline complet — déclenchement → snapshot → export multi-format (DITA-OT, PDF, HTML, SCORM)

**État réel**
- `SnapshotPublication` en base : ✅
- Endpoint API publication : ❌
- DITA-OT intégré : ❌
- Export PDF/HTML/SCORM : ❌
- UI publication : ❌

**Écart** : flux largement absent hors du mécanisme de snapshot.

**Gravité** : 🔴 Critique (feature centrale de la valeur produit)
**Impact** : fonctionnel — le produit ne peut pas livrer sa promesse de CCMS
**Effort** : XL (pipeline complet)

---

#### Flux ProductDocSync

**État attendu** (référentiel)
- Entités `Fonctionnalité` et `ImpactDocumentaire` gérées via API dédiée
- Rattachement rubrique ↔ fonctionnalité
- Déclaration d'impacts documentaires avec statuts (`à_faire`, `en_cours`, `prêt`, `validé`, `ignoré`)
- Écran ProductDocSync frontend
- Ne modifie pas le XML, ne crée pas de révision

**État réel**
- Entités `Fonctionnalité` et `ImpactDocumentaire` présentes dans le modèle Django (selon le référentiel backend)
- Aucun endpoint API pour ces entités dans la cartographie exposée
- Aucun écran ProductDocSync cartographié
- `Rubrique` référence `fonctionnalite` dans le serializer (présence partielle)

**Écart** : flux partiellement modélisé en base, pas exposé, pas d'UI.

**Gravité** : 🔴 Critique (axe stratégique majeur de Nexus)
**Impact** : fonctionnel — pilotage documentaire impossible ; stratégique — différentiateur produit absent
**Effort** : XL (API complète + UI ProductDocSync + lien avec publication)

---

## 5. Cartographie des écarts

| Domaine | Élément | Écart | Gravité | Effort | Risque principal |
|---------|---------|-------|---------|--------|-----------------|
| Backend | Porte d'entrée projet | Route hors `/api/`, service absent | 🔴 | S | Dette architecture |
| Backend | DELETE rubrique | Cascade MapRubrique silencieuse | 🔴 | XS | Perte de structure |
| Backend | `structure/attach` | Endpoint manquant | 🟠 | XS | Blocage migration frontend |
| Backend | CRUD direct MapRubrique | Violation canon — `POST /api/map-rubriques/` | 🔴 | S | Couplage implicite |
| Backend | Formats d'erreur | 4 formats coexistent | 🟠 | S | Débug difficile, frontend imprévisible |
| Backend | Permissions vues compat | Pas de `permission_classes` explicites | 🟠 | XS | Risque sécurité si config globale change |
| Backend | Publication API | Endpoint absent | 🔴 | L | Valeur produit bloquée |
| Backend | ProductDocSync API | Entités modélisées, pas exposées | 🔴 | XL | Différentiateur produit absent |
| Backend | Routes compat | 6 routes transitoires maintenues | 🟠 | M | Dette croissante |
| Backend | Rubrique racine XML vide | `contenu_xml=""` invalide à la création | 🟠 | XS | Incohérence DITA |
| Frontend | LeftSidebar | Conforme post Lots 1–4 | 🟢 | — | Frontière structure/contenu à surveiller |
| Frontend | Desktop | Conforme | 🟢 | — | — |
| Frontend | Publication UI | Absente (toast hors scope) | 🔴 | L | Valeur produit |
| Frontend | Clone/Delete rubrique | Absents (toast hors scope, endpoint manquant) | 🟠 | M | Opérations basiques manquantes |
| CentralEditor | Parsing XML ↔ TipTap | Phase 3 non terminée | 🔴 | L | Perte/corruption données |
| CentralEditor | Validation XML DITA | Phase 4 non terminée | 🟠 | M | Données dégradées possibles |
| CentralEditor | Autosave | Absent | 🟠 | M | Perte contenu non sauvegardé |
| CentralEditor | Gestion conflits | Absente | 🟠 | XL (collab) / M | Écrasement silencieux |
| Flux | Versioning UI | API prête, UI absente | 🟠 | M | Inaccessible utilisateur |
| Flux | Publication pipeline | DITA-OT absent, export absent | 🔴 | XL | Valeur produit bloquée |
| Flux | ProductDocSync | Non implémenté | 🔴 | XL | Différentiateur absent |
| Nexus | Module B — Product Knowledge | Partiellement modélisé, non exposé | 🔴 | XL | Stratégique |
| Nexus | Module G — Base Métier | Modèle défini, zéro implémentation | 🔴 | XL | Stratégique |
| Nexus | Modules C, D, E, F | Totalement absents | — | hors périmètre | Dépendances futures |
| Nexus | Modèle transverse générique | Absent | 🟠 | L | Évolutivité multi-domaine |
| Nexus | APIs de connaissance | Absentes (`/api/knowledge/`, `/api/metier/`) | 🔴 | L | Plateforme inaccessible |

---

## 6. Analyse des risques

### R1 — Perte ou corruption de contenu documentaire

**Description** : La transformation XML ↔ TipTap (phase 3 CentralEditor non terminée) peut altérer silencieusement le XML lors de la sauvegarde. Un contenu visuellement correct peut produire un XML dégradé ou incomplet.

**Probabilité** : Forte (phase non terminée, pas de tests round-trip automatisés)
**Impact** : Fort (le contenu documentaire est la donnée centrale du système)
**Criticité globale** : 🔴 Très haute

**Mesures de mitigation**
- Compléter la phase 3 (parsing) en priorité
- Implémenter des tests de round-trip automatisés sur un corpus DITA représentatif
- Ajouter une validation XML avant toute sauvegarde (phase 4)
- Logger systématiquement les erreurs de transformation côté frontend

---

### R2 — Corruption structurelle silencieuse via DELETE rubrique

**Description** : `DELETE /api/rubriques/{id}/` déclenche une suppression en cascade des `MapRubrique` liés (FK `on_delete=CASCADE`) sans protection, sans avertissement, sans trace.

**Probabilité** : Moyenne (opération possible depuis LeftSidebar si endpoint disponible)
**Impact** : Fort (perte de position dans la structure documentaire, irréversible sans sauvegarde)
**Criticité globale** : 🔴 Haute

**Mesures de mitigation**
- Protéger `RubriqueViewSet.destroy()` : retourner 409 si des MapRubrique actifs existent
- Introduire un endpoint de détachement (`DELETE /api/maps/{id}/structure/{mr_id}/`) distinct de la suppression physique
- Documenter explicitement la règle dans le backend canonique

---

### R3 — Incohérence versioning documentaire

**Description** : Le mécanisme de révision (hash, `RevisionRubrique`) est implémenté mais les champs dépréciés (`revision_numero`, `version` sur Rubrique) existent toujours en base et sont en read-only. Une logique externe pourrait lire ces champs en supposant qu'ils sont à jour.

**Probabilité** : Faible (accès lecture seule documenté)
**Impact** : Moyen (confusion dans les outils tiers ou scripts d'export)
**Criticité globale** : 🟠 Moyenne

**Mesures de mitigation**
- Planifier la suppression des champs dépréciés dans un lot dédié
- Vérifier qu'aucune logique frontend ne lit ces champs

---

### R4 — Désynchronisation frontend / backend

**Description** : Le buffer XML local dans `useXmlBufferStore` est la source de vérité frontend. Si une sauvegarde échoue silencieusement (réseau, erreur 5xx non gérée), l'utilisateur croit son contenu sauvegardé alors qu'il ne l'est pas.

**Probabilité** : Moyenne (pas de gestion d'erreur réseau robuste dans CentralEditor)
**Impact** : Fort (perte de travail)
**Criticité globale** : 🔴 Haute

**Mesures de mitigation**
- Gérer explicitement les erreurs réseau dans `useRubriqueSave` (état `error` dans le buffer)
- Implémenter un autosave avec retry
- Afficher un signal visuel persistant en cas d'échec de sauvegarde

---

### R5 — Dette technique masquée dans les routes de compatibilité

**Description** : 6 routes de compatibilité transitoires coexistent avec les routes canoniques. Le frontend a été migré (Lots 1–4) mais les routes compat ne sont pas supprimées. Leur maintien génère du code mort, des doublons de logique de tests, et un risque de réutilisation involontaire.

**Probabilité** : Faible (migration frontend actée)
**Impact** : Moyen (complexité croissante, risque de réutilisation)
**Criticité globale** : 🟠 Moyenne

**Mesures de mitigation**
- Auditer les logs d'accès pour confirmer la non-utilisation
- Supprimer les routes compat dans un lot dédié après confirmation

---

### R6 — Dérive monolithique Nexus

**Description** : Sans architecture modulaire réelle, tous les nouveaux besoins (ProductDocSync, Base Métier, pilotage produit) seront intégrés dans le Core Django existant. Le risque est d'aboutir à un monolithe ingérable.

**Probabilité** : Forte (chemin de moindre résistance)
**Impact** : Fort (scalabilité, maintenabilité, découplage impossible)
**Criticité globale** : 🔴 Haute à long terme

**Mesures de mitigation**
- Définir explicitement les frontières de module dans le backend Django (apps séparées)
- Introduire les APIs de connaissance avant d'intégrer les modules externes
- Éviter les FK directes entre modules — passer par des identifiants fonctionnels

---

### R7 — Absence de gouvernance documentaire Base Métier

**Description** : Le module G (Base Métier) est entièrement défini dans le référentiel mais n'existe pas dans le code. Si des règles métier commencent à être stockées ailleurs (dans la documentation, dans le code, dans des commentaires), la source de vérité sera fragmentée et incontrôlable.

**Probabilité** : Forte (délai d'implémentation prévisible)
**Impact** : Fort (incoherence réglementaire, IA non gouvernée)
**Criticité globale** : 🔴 Haute stratégiquement

**Mesures de mitigation**
- Créer au minimum un référentiel simple (feuille de calcul, Notion) en attendant l'implémentation
- Ne pas alimenter l'IA avant que les règles métier soient gouvernées

---

## 7. Pistes d'amélioration non envisagées

Ces axes ne sont pas actuellement traités dans les documents de roadmap du projet.

### 7.1 Tests de round-trip XML automatisés

Le parsing XML ↔ TipTap est la zone de risque la plus élevée. Il n'existe pas de suite de tests automatisés qui valide :
- La fidélité de la conversion pour chaque balise DITA supportée
- La stabilité du round-trip sur un corpus de rubriques réelles
- La détection de régression lors de l'évolution des extensions TipTap

**Recommandation** : constituer un corpus de fixtures DITA représentatives et implémenter des tests paramétrés (Jest ou Vitest) avant tout déploiement de la phase 3.

---

### 7.2 Observabilité et instrumentation

Aucun document ne mentionne de stratégie d'observabilité applicative. Le système ne dispose pas de :
- Traces structurées des opérations métier (création, sauvegarde, publication)
- Métriques d'usage (rubriques les plus éditées, fréquence de sauvegarde, erreurs de parsing)
- Alertes sur les erreurs critiques (sauvegarde échouée, XML invalide en base)

**Recommandation** : introduire un logging structuré minimal (JSON) sur les flux critiques et un dashboard d'erreurs (Sentry ou équivalent).

---

### 7.3 Autosave progressif avec stratégie de réconciliation

Le modèle actuel est : "sauvegarde explicite par l'utilisateur". Ce modèle est risqué pour un éditeur documentaire.

**Recommandation** : implémenter un autosave avec :
- Debounce configurable (ex : 30 secondes après dernière modification)
- Indicateur visuel explicite (icône "sauvegarde en cours" / "sauvegardé")
- Retry automatique en cas d'échec réseau
- Conservation locale (localStorage ou IndexedDB) comme fallback dernier recours

---

### 7.4 Stratégie de migration de schéma vers le modèle transverse

Le référentiel définit un modèle générique (`ObjetMétier`, `CycleObjet`, `ÉlémentMétier`, etc.) mais l'implémentation repose sur des entités spécifiques logiciel (`Produit`, `VersionProduit`, `Fonctionnalité`). La migration vers le modèle transverse n'est pas planifiée.

**Recommandation** : planifier une migration en shadow — introduire les concepts génériques en parallèle des concepts existants, puis remapper progressivement. Ne pas tenter une migration directe du schéma.

---

### 7.5 Pipeline de validation continue des documents DITA

Il n'existe pas de mécanisme pour valider la conformité DITA du contenu en base au fil du temps. Un XML sauvegardé peut être valide aujourd'hui et invalide après une évolution des extensions TipTap.

**Recommandation** : un job périodique (tâche Celery ou script CI) qui parcourt les révisions récentes et valide leur XML contre le schéma DITA cible.

---

### 7.6 API de connaissance comme prérequis aux intégrations externes

La vision Nexus place Documentum comme "noyau de connaissance produit". Avant d'intégrer des modules externes (IA, Support, Portail), il faut exposer des APIs de consultation stables.

**Recommandation** : créer une famille d'endpoints `/api/knowledge/` en lecture seule, exposant les contenus publiés, les rubriques, les fonctionnalités et leurs liens — sans dépendre de l'état interne. C'est le prérequis à toute intégration externe.

---

### 7.7 Gestion de la publication multi-périmètre

La v1 de `SnapshotPublication` couvre uniquement la map master. Le référentiel prévoit des publications multi-maps et multi-formats (PDF, HTML, SCORM). Aucune stratégie de gestion des périmètres de publication (quelles maps, quelles rubriques, quelle version cible) n'est documentée dans les chantiers.

**Recommandation** : définir le modèle de publication (sélecteur de périmètre, pipeline, formats cibles) avant d'implémenter l'UI de publication.

---

## 8. Proposition de découpage en lots de refonte

### Lot 1 — Sécurisation (faible risque, sans dépendance)

**Objectif** : Éliminer les violations actives et les dettes bloquantes sans toucher aux flux utilisateurs.

**Périmètre**
- Protéger `DELETE /api/rubriques/{id}/` contre la cascade silencieuse (→ 409)
- Implémenter `POST /api/maps/{id}/structure/attach/` (service existant)
- Supprimer `CreateMapView` du registre URL (dead code)
- Supprimer `MapViewSet.create_rubrique` (doublon exact de `structure_create`)
- Normaliser les formats d'erreur (un seul format via `custom_exception_handler`)
- Ajouter `permission_classes` explicites sur les vues compat

**Dépendances** : aucune
**Risques** : faibles (ajouts et protections, pas de suppressions de routes actives)
**Estimation** : S (2–5 jours)

---

### Lot 2 — Consolidation du noyau Core (structurant)

**Objectif** : Canoniser la création de projet, finaliser le CentralEditor, rendre la publication accessible.

**Périmètre**
- Extraire `create_project()` dans `services.py` et migrer `ProjetViewSet.create()`
- CentralEditor phase 3 : parsing XML ↔ TipTap complet + tests round-trip
- CentralEditor phase 4 : validation XML DITA avant sauvegarde
- Autosave avec indicateur visuel
- API de publication (endpoint déclenchement + sélection périmètre)
- UI publication minimale dans LeftSidebar (remplacement du toast)

**Dépendances** : Lot 1 (protect DELETE, structure/attach)
**Risques** : moyens (CentralEditor est critique — tests obligatoires)
**Estimation** : L (3–6 semaines selon les ressources)

---

### Lot 3 — ProductDocSync et pilotage documentaire (critique)

**Objectif** : Implémenter le différentiateur produit — suivi des impacts documentaires et couverture fonctionnelle.

**Périmètre**
- Exposer les APIs `Fonctionnalité` et `ImpactDocumentaire`
- Implémenter l'écran ProductDocSync frontend
- Lier ImpactDocumentaire → Rubrique → statut de couverture
- Intégrer le cycle de vie : déclaration d'impact → traitement → validation
- Suppression des routes compat backend (conditionnée à confirmation logs)

**Dépendances** : Lot 2 (publication, versioning stable)
**Risques** : élevés (domaine non cartographié, dépendances modèle complexes)
**Estimation** : XL (6–10 semaines)

---

### Lot 4 — Module Base Métier et APIs de connaissance (optimisation / Nexus)

**Objectif** : Poser le deuxième pilier de Nexus — la gouvernance des règles métier et l'exposition de la connaissance.

**Périmètre**
- Implémenter le module G : `RéférentielMétier`, `RègleMétier`, `VersionRègleMétier`, `SourceMétier`, `PropositionMiseAJourMétier`, `ValidationMétier`
- Exposer les APIs `/api/metier/*`
- Créer les APIs de connaissance `/api/knowledge/exports/`
- Introduire le modèle transverse générique en shadow (sans migration forcée)
- Observabilité et instrumentation

**Dépendances** : Lot 3 (pilotage documentaire stable)
**Risques** : moyens sur Base Métier (modèle défini), élevés sur migration transverse
**Estimation** : XL (8–12 semaines)

---

## 9. Recommandations de pilotage

### Ordre recommandé des travaux

```
Lot 1 (sécurisation) → Lot 2 (noyau + CentralEditor) → Lot 3 (ProductDocSync) → Lot 4 (Nexus)
```

Le Lot 1 est un prérequis de sécurité qui ne doit pas attendre. Les Lots 2 et 3 constituent le cœur de la valeur produit court terme. Le Lot 4 est le pivot stratégique long terme.

---

### Points de vigilance

**1. Ne pas avancer le frontend avant le backend**
LeftSidebar est stabilisé. Toute nouvelle opération frontend (suppression rubrique depuis map, export, clone) exige un endpoint backend préalable. Ne pas simuler en toast ce qui doit être implémenté.

**2. Traiter CentralEditor avec une discipline de test absolue**
La phase 3 (parsing XML) est la zone la plus risquée du projet. Aucun merge sans corpus de tests de round-trip validé.

**3. Ne pas multiplier les routes avant de supprimer les anciennes**
La tendance actuelle est d'ajouter des routes canoniques sans supprimer les routes compat. Ce pattern doit être inversé dès le Lot 2 : chaque implémentation canonique doit être couplée à un plan de suppression.

**4. Formaliser les décisions d'architecture Nexus avant le Lot 3**
Les choix structurants (app Django dédiée par module, contrat d'interface entre modules, politique de FK inter-modules) doivent être actés dans `gov_decision-log.md` avant le développement du Lot 3.

---

### Prérequis avant refonte

| Prérequis | Lotcible | État |
|-----------|---------|------|
| Logs d'accès backend pour confirmer non-utilisation routes compat | Lot 1–2 | Non disponibles |
| Corpus DITA représentatif pour tests round-trip | Lot 2 | À constituer |
| Cartographie ProductDocSync frontend | Lot 3 | Absente |
| Décisions architecture Nexus (frontières modules) | Lot 3–4 | À formaliser dans decision-log |
| Stratégie de migration modèle transverse | Lot 4 | À planifier |

---

### Décision stratégique à trancher

Le document de l'architecture modulaire pose explicitement la question :

> Refonte totale vers Nexus vs. évolution progressive du Core ?

**Recommandation de ce document** : **évolution progressive**.

Raisons :
- Le Core documentaire (édition, structure, versioning) est globalement solide — le démanteler serait une perte nette.
- Les modules Nexus (Base Métier, ITIL, IA, Portail) peuvent être développés en apps Django séparées, consommant les APIs Core par contrat.
- La migration vers le modèle transverse peut se faire en shadow sans casser l'existant.

Le risque d'une refonte totale serait d'interrompre la valeur existante pendant une période non maîtrisée.

---

> **Ce document doit être relu et mis à jour à chaque fin de lot majeur.**
>
> Il ne fait pas autorité — il sert à décider et à piloter.

---

# ✔️ Fin du document
