# DOCUMENTUM NEXUS — VALIDATION DU GAP ANALYSIS GLOBAL

> **Statut** : document de vérité opérationnelle — remplace le gap analysis pour le pilotage
>
> **Produit le** : 2026-04-15
>
> **Périmètre** : Backend · Frontend · CentralEditor · Flux métier · Vision Nexus

---

## Réponse directe à la question principale

> **"Que reste-t-il VRAIMENT à faire pour aligner Documentum avec Documentum Nexus ?"**

**Le Core documentaire est fonctionnel et consolidé. L'essentiel du travail restant porte sur la couche valeur Nexus : publication complète, ProductDocSync, Base Métier (module G), et les modules non entamés.**

Le gap analysis initial datait du 2026-04-09 et contenait **8 écarts désormais obsolètes**, résolus lors du Sprint 4 (Phases A et B) et des lots CentralEditor. Ces écarts **ne doivent plus servir de base à une estimation de charge**.

---

## Convention de lecture

| Verdict | Signification |
|---------|---------------|
| ✅ Confirmé | L'écart est réel et non résolu |
| ❌ Obsolète | L'écart a été résolu depuis la rédaction du gap analysis |
| ⚠️ Partiel | L'écart est partiellement résolu — reformulation nécessaire |

| Type | Signification |
|------|---------------|
| 🧩 Réel | Code non conforme ou absent — à développer |
| 📄 Documentaire | Doc non à jour — à corriger dans le gap analysis |
| ⚠️ Perception | Résolu mais partiellement visible — à clarifier |

---

## 1. Sources inspectées

| Fichier | Ce qui a été vérifié |
|---------|----------------------|
| `documentation/urls.py` | Routes actives, absence de routes legacy |
| `documentation/views.py` (1122 lignes) | ProjetViewSet, MapViewSet, RubriqueViewSet, vues utilitaires |
| `documentation/models.py` (342 lignes) | RevisionRubrique, PublicationSnapshot, Fonctionnalite, ImpactDocumentaire |
| `hooks/useXmlValidation.ts` | Phase 4 — validation XML temps réel |
| `hooks/useSaveRubrique.ts` | Sauvegarde PATCH, gestion erreurs |
| `components/ui/CentralEditor.tsx` | Intégration hooks, validation, navigation guard |
| `screens/ProductDocSync/ProductDocSync.tsx` | État du branchement API |
| `components/ui/ProjectExportPanel.tsx` | État de l'UI de publication |
| `tests/dita_concept_roundtrip.spec.ts` | Tests round-trip XML ↔ TipTap |
| `docs/40_GOVERNANCE/gov_decision-log.md` | Décisions clôturées Sprint 4 |
| `docs/01_OPERATIONNEL/Frontend/CENTRALEDITOR_REFACTOR_ROADMAP.md` | Phases CentralEditor |

---

## 2. Synthèse des verdicts

| # | Écart (résumé) | Type | Verdict |
|---|----------------|------|---------|
| B1 | Route `/projet/create/` hors canon | 📄 Documentaire | ❌ Obsolète |
| B2 | CRUD direct `/api/map-rubriques/` | 📄 Documentaire | ❌ Obsolète |
| B3 | `structure/attach` manquant | 📄 Documentaire | ❌ Obsolète |
| B4 | DELETE rubrique cascade non protégée | 📄 Documentaire | ❌ Obsolète |
| B5 | Routes compat legacy actives | 📄 Documentaire | ❌ Obsolète |
| B6 | Formats d'erreur inconsistants (vues utilitaires) | 🧩 Réel | ⚠️ Partiel |
| B7 | Rubrique racine créée avec `contenu_xml=""` vide | 🧩 Réel | ✅ Confirmé |
| F1 | CentralEditor Phase 3 non terminée | 📄 Documentaire | ❌ Obsolète |
| F2 | CentralEditor Phase 4 non terminée | 📄 Documentaire | ❌ Obsolète |
| F3 | Autosave absent | 🧩 Réel | ✅ Confirmé |
| F4 | Gestion de conflits absente | 🧩 Réel | ✅ Confirmé |
| F5 | Publication UI absente | ⚠️ Perception | ⚠️ Partiel |
| F6 | API publication absente + DITA-OT absent | 🧩 Réel | ✅ Confirmé |
| F7 | ProductDocSync non implémenté | ⚠️ Perception | ⚠️ Partiel |
| M1 | ImpactDocumentaire non implémenté | 🧩 Réel | ✅ Confirmé |
| M2 | Module G — Base Métier absent | 🧩 Réel | ✅ Confirmé |
| M3 | Modules C, D, E, F absents | 🧩 Réel | ✅ Confirmé |
| T1 | Tests round-trip absents | 📄 Documentaire | ❌ Obsolète |

---

## 3. Typologie des écarts

| Type | Nombre | Description |
|------|--------|-------------|
| 🧩 Écarts réels | 7 | Code absent ou non conforme — à développer ou corriger |
| 📄 Écarts documentaires | 8 | Résolus dans le code, non mis à jour dans le gap analysis |
| ⚠️ Écarts de perception | 3 | Composants partiellement présents — à reformuler et compléter |
| ❌ Obsolètes à supprimer | 8 | À retirer du gap analysis avant toute estimation |

**Total : 18 écarts examinés. 7 réels actifs. 8 à purger du gap analysis.**

---

## 4. Écarts OBSOLÈTES — résolus depuis le gap analysis

Ces écarts figurent encore dans `DOCUMENTUM_NEXUS_GAP_ANALYSIS_GLOBAL.md` comme actifs. Ils doivent en être retirés.

---

### B1 — Route `/projet/create/` hors canon

**Ce que disait le gap analysis :** Gate 2 non franchie, route hors namespace `/api/`, service absent.

**Ce que dit le code :**
```python
# views.py:276–295
class ProjetViewSet(viewsets.ModelViewSet):
    def create(self, request, *args, **kwargs):
        serializer.is_valid(raise_exception=True)
        projet = create_project(data=serializer.validated_data, user=request.user)
```
```
gov_decision-log.md → CLÔTURÉE 2026-04-10 (Sprint 4)
```

**Verdict : ❌ OBSOLÈTE** — `ProjetViewSet.create()` appelle le service `create_project()`. Aucune route `/projet/create/` dans `urls.py`.

---

### B2 — CRUD direct `/api/map-rubriques/`

**Ce que disait le gap analysis :** Violation du principe — MapRubrique exposé directement au frontend.

**Ce que dit le code :**
```
urls.py — aucun router.register pour MapRubrique
aucune route path('map-rubriques/', ...)
gov_decision-log.md → CLÔTURÉE 2026-04-10 (Sprint 4 Phase B)
```

**Verdict : ❌ OBSOLÈTE** — toutes les opérations structurelles passent par `/api/maps/{id}/structure/*`.

---

### B3 — `structure/attach` manquant

**Ce que disait le gap analysis :** Endpoint `POST /api/maps/{id}/structure/attach/` absent.

**Ce que dit le code :**
```python
# views.py:486–503
@action(detail=True, methods=['post'], url_path='structure/attach')
def structure_attach(self, request, pk=None):
    ...
```

**Verdict : ❌ OBSOLÈTE** — implémenté dans `MapViewSet`.

---

### B4 — DELETE rubrique cascade non protégée

**Ce que disait le gap analysis :** `DELETE /api/rubriques/{id}/` déclenche une suppression en cascade silencieuse des `MapRubrique` liés.

**Ce que dit le code :**
```python
# views.py:584–598
def destroy(self, request, *args, **kwargs):
    if MapRubrique.objects.filter(rubrique=instance).exists():
        raise ValidationError(
            "Impossible de supprimer une rubrique rattachée à une ou plusieurs maps."
        )
```

**Verdict : ❌ OBSOLÈTE** — protection active, `ValidationError` explicite.

---

### B5 — Routes compat legacy actives

**Ce que disait le gap analysis :** 6 routes de compatibilité (`indent`, `outdent`, `reorder`, etc.) maintenues, double canal actif.

**Ce que dit le code :**
```
urls.py — aucune route : indent, outdent, reorder, MapRubriqueIndentView,
           MapRubriqueOutdentView, MapReorderCompatView, CreateProjectAPIView
gov_decision-log.md → CLÔTURÉE 2026-04-10 (Sprint 4 Phase B)
```

**Verdict : ❌ OBSOLÈTE** — aucune route legacy dans le codebase.

---

### F1 — CentralEditor Phase 3 non terminée

**Ce que disait le gap analysis :** Phase 3 (parsing XML ↔ TipTap complet) non terminée, gravité 🔴 Critique.

**Ce que dit le code :**
```
CENTRALEDITOR_REFACTOR_ROADMAP.md → Phase 3 : TERMINÉ
CentralEditor réduit 444 → ~200 lignes (-55%)
```
```typescript
// dita_concept_roundtrip.spec.ts — 795 lignes, 22 tests
// concept, task, reference, table, codeblock, fig, glossentry, stress tests
```

**Verdict : ❌ OBSOLÈTE** — Phase 3 terminée, suite de 22 tests round-trip opérationnelle.

---

### F2 — CentralEditor Phase 4 non terminée

**Ce que disait le gap analysis :** Phase 4 (validation XML DITA) non terminée, gravité 🟠.

**Ce que dit le code :**
```typescript
// useXmlValidation.ts — appel validateXml() API, états validating/result
// CentralEditor.tsx — import XmlValidationPanel, handleValidateXml
// CENTRALEDITOR_REFACTOR_ROADMAP.md → Phase 4 : TERMINÉ / Phase 5 : TERMINÉ
```

**Verdict : ❌ OBSOLÈTE** — Phases 4 (validation XML) et 5 (navigation guard + modal) terminées.

---

### T1 — Tests round-trip absents

**Ce que disait le gap analysis :** Aucun test automatisé du round-trip XML ↔ TipTap.

**Ce que dit le code :**
```
dita_concept_roundtrip.spec.ts — 22 tests, couverture :
concept / task / reference / table / codeblock / fig / glossentry / stress
```

**Verdict : ❌ OBSOLÈTE** — suite de tests implémentée avec couverture significative.

---

## 5. Écarts PARTIELLEMENT VRAIS — à reformuler

### B6 — Formats d'erreur inconsistants

**Ce que disait le gap analysis :** 4 formats d'erreur coexistent — `custom_exception_handler` contourné.

**Vérification :**
- ViewSets principaux (`ProjetViewSet`, `RubriqueViewSet`, `MapViewSet`) : format DRF unifié via `raise_exception=True` ✅
- Vues utilitaires (`validate_xml_view`, `publier_map`, `publication_diff_view`) : formats custom persistants (`{"valid": ...}`, `{"status": "ok"}`, `{"error": ...}`) ⚠️

**Reformulation de l'écart réel :**
Les vues CRUD sont conformes. L'inconsistance subsiste uniquement dans les **vues fonctionnelles utilitaires** (3 endpoints). Le risque est circonscrit.

**Verdict : ⚠️ PARTIEL** — Type 🧩 Réel, périmètre réduit

---

### F5 — Publication UI absente

**Ce que disait le gap analysis :** UI de publication totalement absente.

**Vérification :**
```typescript
// ProjectExportPanel.tsx — composant UI complet
// Sélection format : PDF, WebHelp, Moodle, Fiche
// TODO: branchement vers POST /api/export/
```

**Reformulation de l'écart réel :**
Le composant UI `ProjectExportPanel` existe avec l'interface de sélection de format. Ce qui manque : l'**API backend d'export** et le **pipeline DITA-OT**. L'écart n'est pas "UI absente" mais "API export et pipeline absents".

**Verdict : ⚠️ PARTIEL** — Type ⚠️ Perception

---

### F7 — ProductDocSync non implémenté

**Ce que disait le gap analysis :** Aucun écran ProductDocSync, aucune API exposée.

**Vérification :**
```typescript
// ProductDocSync.tsx — écran existant, données hardcodées statiques
const features = [{ id: 1, name: "Congés payés", ... }];  // aucun appel API
```
```python
# urls.py → router.register('fonctionnalites', FonctionnaliteViewSet)  ← backend disponible
```

**Reformulation de l'écart réel :**
L'écran existe. Le backend `FonctionnaliteViewSet` est exposé. Ce qui manque : le **branchement frontend → API** et le modèle `ImpactDocumentaire` absent du backend.

**Verdict : ⚠️ PARTIEL** — Type ⚠️ Perception

---

## 6. Écarts CONFIRMÉS — réels et actifs

### 🧩 Écarts réels (code à développer)

---

#### B7 — Rubrique racine créée avec `contenu_xml=""` invalide

**Constat :** À la création d'un projet, la rubrique racine est initialisée avec `contenu_xml=""` (XML vide), contournant le `clean()` du modèle via `objects.create()`. Ce contenu est DITA-invalide.

**Impact :** Incohérence de données à la création ; risque lors de la validation XML au premier chargement dans CentralEditor.

**Gravité** : 🟠 Moyen
**Effort** : XS — initialiser avec un template DITA minimal valide dans `create_project()`

---

#### F3 — Autosave absent

**Constat :** Aucun mécanisme de sauvegarde automatique ou différée. La sauvegarde reste un acte explicite de l'utilisateur. Aucun `setInterval`, aucun debounce sur modification dans `useSaveRubrique.ts`.

**Impact :** Toute fermeture accidentelle = perte du travail non sauvegardé.

**Gravité** : 🟠 Moyen
**Effort** : M — debounce configurable + indicateur visuel + retry réseau

---

#### F4 — Gestion de conflits absente

**Constat :** Si deux sessions éditent la même rubrique, la dernière sauvegarde écrase la précédente sans avertissement. Aucun mécanisme de détection de divergence ou de verrouillage optimiste.

**Impact :** Acceptable en usage solo actuel ; critique dès l'introduction de la collaboration.

**Gravité** : 🟠 Moyen (faible en usage solo)
**Effort** : M (gestion conflit simple) / XL (collaboration temps réel)

---

#### F6 — API publication absente et pipeline DITA-OT absent

**Constat :** `ProjectExportPanel` existe côté UI (sélection format), mais :
- Aucun endpoint `POST /api/export/` côté backend
- Aucun pipeline DITA-OT intégré
- Aucun export multi-format (PDF, HTML, SCORM)

Le mécanisme `SnapshotPublication` backend est opérationnel mais inaccessible depuis l'UI.

**Impact :** La publication — promesse centrale du CCMS — est bloquée.

**Gravité** : 🔴 Critique (valeur produit)
**Effort** : L — endpoint déclenchement + sélection périmètre + pipeline DITA-OT

---

#### M1 — ImpactDocumentaire non implémenté

**Constat :** Le modèle `ImpactDocumentaire` (liant `ÉvolutionProduit` → `Rubrique` avec statuts `à_faire` / `en_cours` / `prêt` / `validé`) est absent de `documentation/models.py`.

**Impact :** Le pilotage documentaire (quelle rubrique est impactée par quelle évolution produit) est impossible.

**Gravité** : 🔴 Critique (axe stratégique Nexus)
**Effort** : L — modèle + API + intégration ProductDocSync

---

#### M2 — Module G — Base Métier absent

**Constat :** Aucun des modèles suivants n'existe dans le codebase : `RéférentielMétier`, `RègleMétier`, `VersionRègleMétier`, `SourceMétier`, `ValidationMétier`, `PropositionMiseAJourMétier`. Aucune route `/api/metier/*`.

**Impact :** La gouvernance des règles métier reste hors du système. Risque de fragmentation si les règles commencent à être stockées ailleurs.

**Gravité** : 🔴 Critique (stratégique)
**Effort** : XL — modèle complet + API + UI + gouvernance

---

#### M3 — Modules C, D, E, F absents

**Constat :** Les modules ITIL (C), IA / Knowledge Engine (D), Portail client (E) et Formation (F) ne sont pas présents dans le codebase.

**Impact :** Ces modules constituent la majeure partie de la vision Nexus. Leur absence est structurelle et attendue à ce stade — mais leur développement futur exige des décisions d'architecture (frontières, FK inter-modules, APIs de connaissance) avant tout code.

**Gravité** : hors périmètre immédiat
**Effort** : non chiffré

---

### 📄 Écarts documentaires (gap analysis à corriger)

Ces 8 écarts sont résolus dans le code mais encore présentés comme actifs dans `DOCUMENTUM_NEXUS_GAP_ANALYSIS_GLOBAL.md` :

| Écart résolu | Section dans le gap analysis | Correction à apporter |
|--------------|-----------------------------|-----------------------|
| B1 Route `/projet/create/` | §4.1.1, §5, §8 Lot 2 | Marquer "Résolu Sprint 4" |
| B2 CRUD direct MapRubrique | §4.1.2, §5, §8 Lot 1 | Marquer "Résolu Sprint 4 Phase B" |
| B3 `structure/attach` | §4.1.2, §5, §8 Lot 1 | Marquer "Résolu" |
| B4 DELETE cascade | §4.1.3, §5, §6 R2 | Marquer "Résolu" |
| B5 Routes compat | §4.1.5, §5, §6 R5 | Marquer "Résolu Sprint 4 Phase B" |
| F1 Phase 3 CentralEditor | §4.3, §3, §5, §8 Lot 2 | Marquer "TERMINÉ" |
| F2 Phases 4 et 5 CentralEditor | §4.3, §3, §5, §8 Lot 2 | Marquer "TERMINÉ" |
| T1 Tests round-trip | §7.1, §9 prérequis | Marquer "Implémenté (22 tests)" |

---

## 7. Récapitulatif par domaine

### Backend

| Écart | Type | Verdict | Gravité |
|-------|------|---------|---------|
| Route `/projet/create/` hors canon | 📄 | ❌ Obsolète | — |
| CRUD direct MapRubrique | 📄 | ❌ Obsolète | — |
| `structure/attach` manquant | 📄 | ❌ Obsolète | — |
| DELETE cascade non protégée | 📄 | ❌ Obsolète | — |
| Routes compat actives | 📄 | ❌ Obsolète | — |
| Formats d'erreur vues utilitaires | 🧩 | ⚠️ Partiel | 🟠 |
| Rubrique racine XML vide | 🧩 | ✅ Confirmé | 🟠 |
| ImpactDocumentaire absent | 🧩 | ✅ Confirmé | 🔴 |
| Module G Base Métier absent | 🧩 | ✅ Confirmé | 🔴 |
| Modules C, D, E, F absents | 🧩 | ✅ Confirmé | hors périmètre |

### Frontend / CentralEditor

| Écart | Type | Verdict | Gravité |
|-------|------|---------|---------|
| Phase 3 refactoring | 📄 | ❌ Obsolète | — |
| Phase 4 validation XML | 📄 | ❌ Obsolète | — |
| Tests round-trip | 📄 | ❌ Obsolète | — |
| Autosave absent | 🧩 | ✅ Confirmé | 🟠 |
| Gestion de conflits | 🧩 | ✅ Confirmé | 🟠 |
| Publication UI "absente" | ⚠️ | ⚠️ Partiel | — |
| API export absente + DITA-OT | 🧩 | ✅ Confirmé | 🔴 |
| ProductDocSync "non implémenté" | ⚠️ | ⚠️ Partiel | — |

---

## 8. Risques actualisés

| Risque | Statut | Gravité actuelle |
|--------|--------|-----------------|
| R1 — Perte de contenu XML (phase 3) | ❌ Levé — Phase 3 TERMINÉE, 22 tests | 🟢 |
| R2 — CASCADE DELETE rubrique | ❌ Levé — protection active views.py:584 | 🟢 |
| R3 — Incohérence champs dépréciés Rubrique | ✅ Actif — champs read-only, à supprimer | 🟠 |
| R4 — Désync buffer frontend / backend | ✅ Actif — useSaveRubrique gère l'état "error", autosave manquant | 🟠 |
| R5 — Dette routes compat | ❌ Levé — routes supprimées Sprint 4 Phase B | 🟢 |
| R6 — Dérive monolithique Nexus | ✅ Actif — sans frontières modules, risque croissant | 🔴 |
| R7 — Fragmentation Base Métier | ✅ Actif — module G non commencé, règles métier sans gouvernance | 🔴 |

---

## 9. Impact sur l'estimation de charge

### Charges retirées du gap analysis

| Domaine | Charge estimée (gap analysis) | Statut réel |
|---------|-------------------------------|-------------|
| Canonisation routes backend (Gate 2) | S | ✅ Terminé Sprint 4 |
| Suppression routes compat | M | ✅ Terminé Sprint 4 Phase B |
| Implémentation `structure/attach` | XS | ✅ Terminé |
| Protection DELETE rubrique | XS | ✅ Terminé |
| CentralEditor Phase 3 (refactoring + parsing) | L | ✅ Terminé |
| CentralEditor Phase 4 (validation XML) | M | ✅ Terminé |
| CentralEditor Phase 5 (navigation guard) | M | ✅ Terminé |
| Tests round-trip | S | ✅ Implémentés (22 tests) |
| **Total retiré** | **~3XL équivalent** | |

### Charges actives recalibrées

| Domaine | Charge gap analysis | Charge réelle recalibrée |
|---------|--------------------|-----------------------|
| Autosave (debounce + indicateur + retry) | M | M — maintenu |
| Rubrique racine XML vide | XS | XS — maintenu |
| Formats d'erreur vues utilitaires | S | XS–S — périmètre réduit |
| API export backend + pipeline DITA-OT | L–XL | L — UI existante, pipeline manquant |
| Branchement ProductDocSync → API | L | M — écran et backend existants |
| ImpactDocumentaire (modèle + API + flux) | inclus dans XL ProductDocSync | L — entité centrale manquante |
| Module G Base Métier | XL | XL — maintenu |
| APIs de connaissance Nexus | M–L | M–L — maintenu |
| Modules C, D, E, F | hors périmètre | hors périmètre — maintenu |

---

## 10. Plan d'actions immédiat

### 🔧 Correction code

| Priorité | Action | Effort | Dépendance |
|----------|--------|--------|-----------|
| **P1** | Initialiser `contenu_xml` avec un template DITA minimal valide dans `create_project()` | XS | — |
| **P2** | Normaliser les formats de réponse de `validate_xml_view`, `publier_map`, `publication_diff_view` vers `custom_exception_handler` | XS–S | — |
| **P3** | Implémenter autosave (debounce 30s + indicateur visuel + retry réseau) dans CentralEditor | M | — |
| **P4** | Brancher `ProductDocSync.tsx` sur `FonctionnaliteViewSet` (API déjà disponible) | M | — |
| **P5** | Implémenter `ImpactDocumentaire` : modèle + API + intégration ProductDocSync | L | P4 |
| **P6** | Implémenter API export backend + pipeline DITA-OT minimal | L | — |
| **P7** | Définir frontières modules Django avant tout développement Lot 3+ | — | Décision architecture |
| **P8** | Implémenter Module G Base Métier (modèle + API + UI) | XL | P7 |

---

### 📚 Mise à jour documentation

| Priorité | Action | Document cible |
|----------|--------|---------------|
| **D1** | Marquer les 8 écarts obsolètes dans le gap analysis (voir §6) | `02_ANALYSE/audits/DOCUMENTUM_NEXUS_GAP_ANALYSIS_GLOBAL.md` |
| **D2** | Recalibrer les sections §3 (synthèse), §4 (backend/CentralEditor), §5 (cartographie), §8 (lots) du gap analysis | `DOCUMENTUM_NEXUS_GAP_ANALYSIS_GLOBAL.md` |
| **D3** | Créer la cartographie opérationnelle de ProductDocSync | `01_OPERATIONNEL/Frontend/` (nouveau fichier) |
| **D4** | Mettre à jour `10_CARTOGRAPHIE_BACKEND_CANONIQUE_EXPOSE.md` pour refléter routes actuelles (sans compat) | `01_OPERATIONNEL/Backend/` |
| **D5** | Formaliser les décisions frontières modules dans `gov_decision-log.md` avant Lot 3 | `00_REFERENTIEL/40_GOVERNANCE/gov_decision-log.md` |

---

### 🚀 Alignement Nexus

| Priorité | Action | Horizon |
|----------|--------|---------|
| **N1** | Définir le modèle de publication multi-périmètre (périmètre sélecteur, formats cibles, v2 Snapshot) avant d'implémenter l'UI | Lot 2 |
| **N2** | Créer les APIs de connaissance `/api/knowledge/` en lecture seule (contenus publiés, rubriques, fonctionnalités) comme prérequis aux intégrations externes | Lot 3 prérequis |
| **N3** | Décider explicitement de l'architecture modulaire Django (apps séparées vs namespaces) et l'inscrire dans `gov_decision-log.md` | Avant Lot 3 |
| **N4** | Planifier la stratégie de migration vers le modèle transverse générique (shadow migration, pas de refonte directe) | Lot 4 |

---

## 10bis. Priorisation réelle

P0 — Bloquant valeur produit
- API export + DITA-OT

P1 — Sécurisation UX
- Autosave
- XML racine valide

P2 — Activation valeur Nexus
- ProductDocSync branché
- ImpactDocumentaire

P3 — Structuration long terme
- Module G
- Architecture Nexus

---

## 11. Impact sur le projet

### Évolution du niveau de maturité

| Périmètre | Maturité (gap analysis initial) | Maturité actuelle |
|-----------|--------------------------------|-------------------|
| Core documentaire — édition, structure, versioning | Moyen | **Moyen à Fort** |
| Frontend — Desktop, LeftSidebar, stores | Moyen à Fort | **Fort** |
| CentralEditor — parsing, validation, navigation | Faible (phases en cours) | **Moyen à Fort** |
| Flux publication — API, pipeline, UI | Absent | **Faible** (UI existe, API manquante) |
| ProductDocSync | Absent | **Faible** (écrans et API partiels) |
| Module G Base Métier | Absent | **Absent** |
| Modules C, D, E, F | Absents | **Absents** |

### Nouvelle réalité du projet

**Ce qui est solide aujourd'hui — le Core :**
- Édition documentaire fonctionnelle (chargement XML → TipTap, sauvegarde, révision par hash)
- Structure documentaire canonique (maps, rubriques, MapRubrique via endpoints `structure/*`)
- Versioning backend opérationnel (`RevisionRubrique`, `SnapshotPublication`)
- Frontend consolidé (Zustand stores, hooks dédiés, navigation guard)
- Tests round-trip en place (22 cas DITA)

**Ce qui reste à construire — la couche valeur :**
- Publication accessible à l'utilisateur (API + pipeline DITA-OT)
- Pilotage documentaire (ImpactDocumentaire + ProductDocSync branché)
- Base Métier (Module G — gouvernance des règles)
- APIs de connaissance (prérequis intégrations Nexus)
- Modules C, D, E, F (vision à long terme)

### Évolution de l'effort global estimé

| Phase | Effort gap analysis | Effort recalibré |
|-------|--------------------|--------------------|
| Lot 1 — Sécurisation | S (2–5 jours) | **Terminé à ~85%** — reste P1 + P2 (XS) |
| Lot 2 — Noyau Core | L (3–6 semaines) | **Terminé à ~70%** — reste autosave, API publication, DITA-OT (M+L) |
| Lot 3 — ProductDocSync | XL (6–10 semaines) | **À revoir** — branchement M + ImpactDocumentaire L + reste XL |
| Lot 4 — Base Métier + Nexus | XL (8–12 semaines) | **Maintenu** |

**L'effort total a baissé de ~3XL sur les Lots 1 et 2. Les Lots 3 et 4 restent entiers.**

### Décision stratégique maintenue

La recommandation du gap analysis est confirmée : **évolution progressive**, pas de refonte totale.

Le Core est sain. La valeur future de Nexus s'y construit par couches successives :

```
Core documentaire (✅ solide)
  → Publication accessible (Lot 2 résiduel)
    → Pilotage documentaire (Lot 3)
      → Base Métier (Lot 4)
        → Modules Nexus (vision long terme)
```
---

## 12. Chemin critique

1. API export + pipeline DITA-OT
2. Autosave
3. ImpactDocumentaire
4. ProductDocSync connecté

Sans ces éléments, la valeur produit Documentum Nexus reste incomplète.

---

## Historique

| Date | Action |
|------|--------|
| 2026-04-15 | Version initiale — validation factuelle des verdicts |
| 2026-04-15 | Version 2 — refactoring opérationnel : types d'écarts, plan d'actions, impact projet |

---

# ✔️ Fin du document
