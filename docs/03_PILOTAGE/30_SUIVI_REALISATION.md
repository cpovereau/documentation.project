# 📜 Suivi de réalisation — Documentum

> Ce document archive le détail des chantiers terminés.
> Il sert de référence historique et de traçabilité technique.
> Le pilotage des travaux en cours est dans `30_PILOTAGE_PROJET.md`.

---

## Chantier 1 — Backend réalignement

### Objectif
Aligner le backend réel avec le référentiel canonique.

### Documents liés
- `docs/01_OPERATIONNEL/Backend/10_BACKEND_CANONIQUE.md`
- `docs/02_ANALYSE/archive/BACKEND_REALIGNMENT_SPRINT_*.md`

### Statut
✅ TERMINÉ — Sprints 1–5 soldés le 2026-04-10

### Avancées

- **Sprint 1** : uniformisation des erreurs via `custom_exception_handler`, protection `DELETE /rubriques/{id}/`, route canonique `POST /api/maps/{id}/structure/attach/`
- **Sprint 2** : service `create_project()` atomique, `ProjetViewSet.create()` pleinement opérationnel
- **Sprint 3** : suppression du code mort (`CreateMapView`, `map_rubriques_view`), sécurisation des vues legacy
- **Sprint 4** : migration frontend vers routes canoniques (Phase A) + suppression complète des routes legacy (Phase B)
- **Sprint 5** : logs métier propres sur tous les flux structurels, endpoint `/health/`, nettoyage sérialiseurs morts

---

## Chantier 2 — Intégration frontend du backend canonique

### Objectif
- Brancher réellement le frontend sur les routes et contrats canoniques
- Supprimer les restes de logique transitoire
- Fiabiliser les reloads et la source de vérité backend

### Statut
✅ TERMINÉ — Audit réalisé le 2026-04-10, tous les lots soldés le 2026-04-10

### Résultats de l'audit (2026-04-10)

**Points déjà conformes (Sprint 4 backend migré dans le code) :**
- `POST /api/maps/{id}/structure/create/` — création rubrique ✅
- `POST /api/maps/{id}/structure/{mr_id}/indent/` ✅
- `POST /api/maps/{id}/structure/{mr_id}/outdent/` ✅
- `POST /api/maps/{id}/structure/reorder/` ✅
- `POST /api/projets/` — création projet ✅
- `GET /api/projets/{id}/structure/` — chargement structure ✅

**Écarts identifiés et traitement :**

| # | Écart | Statut |
|---|-------|--------|
| C1 | `Desktop.mapItems` jamais alimenté → `rubriqueId=null` → CentralEditor mort | ✅ Résolu Lot 1 |
| C2 | `LeftSidebar.selectedMapItemId` local toujours null → garde-fou inactif | ✅ Résolu Lot 1 |
| C3 | `listMapRubriques` appelle `/api/maps/{id}/rubriques/` (legacy supprimé) | ✅ Résolu Lot 2 |
| C4 | Rename rubrique : local uniquement, non persisté | ✅ Résolu Lot 3 |
| C5 | Delete rubrique : hors scope v1 (pas d'endpoint détachement) | Toast info — hors scope |
| C6 | Clone rubrique : hors scope v1 (pas d'endpoint) | Toast info — hors scope |
| C7 | Delete projet : local uniquement | ✅ Résolu Lot 3 |
| C8 | Clone projet : hors scope v1 (pas d'endpoint) | Toast info — hors scope |
| C9 | Publication/export : non implémenté (console.log) | ✅ Résolu Lot 5 |
| C10 | `getProjectDetailsValidated` : préfixe `/api/` manquant → 404 | ✅ Vérifié Lot 4 — fausse alerte |
| C11 | Double lecture `selectedProjectId` + logs debug prod | ✅ Vérifié Lot 4 — fausse alerte ; log supprimé |

### Lot 1 — Fiabilisation de la chaîne de sélection ✅ TERMINÉ 2026-04-10

- Créé `src/store/selectionStore.ts` : store Zustand dédié (`selectedMapItemId`, `selectedRubriqueId`, `setSelection`, `clearSelection`)
- Corrigé `LeftSidebar.tsx` : suppression état local null, écriture via `setSelection`/`clearSelection`, `selectMapItem()`, `hasUnsavedChanges` réel
- Corrigé `Desktop.tsx` : suppression `mapItems` mort, lecture `selectedRubriqueId` depuis store, `CentralEditor` correctement alimenté
- Effet : CentralEditor charge réellement la rubrique sélectionnée, garde-fou actif

### Lot 2 — Migration endpoint structure ✅ TERMINÉ 2026-04-10

- `src/api/maps.ts` : `listMapRubriques` cible `GET /api/maps/${mapId}/structure/`
- Suppression de `loadMapRubriques` (code mort legacy)
- Suppression des fonctions CRUD legacy dans `mapRubriques.ts` (`createMapRubrique`, `updateMapRubrique`, `deleteMapRubrique` — inutilisées, ciblaient `/rubriques/`)
- DTO inchangé : `MapRubriqueStructureSerializer` ↔ `MapRubriqueDTO` correspondance exacte
- Zéro appel `/api/maps/{id}/rubriques/` dans le code source
- Rechargement structure entièrement canonique après chaque opération structurelle

### Lot 3 — Persistance des opérations non implémentées ✅ TERMINÉ 2026-04-10

- Renommage rubrique : `PATCH /api/rubriques/{id}/` — implémenté avec rechargement structure
- Suppression rubrique : hors scope v1 — backend bloque `DELETE /api/rubriques/{id}/` si encore en map, pas d'endpoint de détachement disponible → toast
- Suppression projet : `DELETE /api/projets/{id}/` — implémenté avec reset état map/sélection
- Clone projet / clone rubrique : hors scope v1 — pas d'endpoint backend disponible → toast, fake IDs `Math.max()+1` supprimés

### Lot 4 — Nettoyage dette technique ✅ TERMINÉ 2026-04-10

- `getProjectDetailsValidated` : vérifié correct — route backend intentionnellement sans `/api/`, code frontend conforme. C10 était une fausse alerte.
- Double lecture `selectedProjectId` : vérifiée non-existante — `useSelectedVersion()` fournit la valeur, `useProjectStore` fournit uniquement le setter. C11 était une fausse alerte.
- `prepareNewRubriqueXml` extrait dans `src/hooks/useNewRubriqueXml.ts` — LeftSidebar délègue via `generateRubriqueXml()`, séparation structure/contenu respectée.
- Log debug production `console.log("Fichier Word sélectionné :", file)` supprimé.
- État mort `Desktop.mapItems` et handlers morts : déjà supprimés en Lot 1 — confirmé propre à l'audit Lot 4.

### Lot 5 — Publication réelle ✅ TERMINÉ 2026-04-10

- IHM de publication existante (ProjectModule) réellement branchée au backend
- `publishMap(mapId, format)` ajouté dans `src/api/maps.ts` — `POST /api/publier-map/{map_id}/`
- `PUBLISH_FORMATS` alignés sur `DITA_OUTPUT_FORMATS` backend (`pdf`, `html5`, `xhtml`, `scorm`, `markdown`, `eclipsehelp`)
- `handleExport` implémenté dans LeftSidebar — règle de sélection map explicite : `is_master` → map unique → blocage
- Ambiguïté "publier projet vs publier map" résolue et documentée
- Feedback utilisateur réel : message backend en succès, toast erreur en échec
- `console.log` + toast simulé supprimés

---

## Chantier 2BIS — Réalignement Paramètres > Données sur le backend canonique

### Objectif
Corriger le désalignement entre le frontend et le backend concernant la notion d'archivage dans les écrans **Paramètres > Données**.

### Statut
✅ TERMINÉ — 2026-04-13

### Cause racine

Le backend expose toutes les ressources sous le préfixe `/api/` (`router` enregistré dans `path("api/", include(router.urls))`). Or `useArchivableList` appelait `/${resource}/` (sans préfixe) → 404 systématiques sur gammes, produits, fonctionnalités, audiences, tags, profils-publication, interfaces.

L'archivage est **pleinement supporté** par le backend (`ArchivableModelViewSet` → filtre `?archived=true|false` + actions `/{id}/archive/` et `/{id}/restore/`). Le problème était uniquement côté URL frontend.

### Décision retenue

**Option A — archivage conservé** : le toggle "Afficher archivés" est conservé dans l'UI.

### Fichiers modifiés

| Fichier | Changement |
|---|---|
| `src/hooks/useArchivableList.ts` | Préfixe `/api/` sur tous les appels ; ajout de `create()` et `update()` ; correction du bug de tri (`sortedData`) ; `getArchivableHooks` → `useArchivableHooks` (conformité règle des hooks React) |
| `src/lib/resources.ts` | Préfixe `/api/` sur `toggleArchivableResource` |
| `src/screens/Settings/tabs/DataTab.tsx` | Suppression du `useEffect` de préchargement debug ; `handleCreate` et `onUpdate` délèguent au `currentHook` ; `AddItemModal` reçoit `allData.gammes` et `allData.produits` depuis React Query |

### Points hors scope

- Ajout d'une interface d'archivage sur les Produits et Gammes depuis l'écran Paramètres — la fonctionnalité fonctionne mais aucun test UI approfondi n'a été réalisé.
- Profils de publication : `shouldShowActions = selectedItem !== "profils_publication"` — le bouton Ajouter reste masqué, ce comportement est intentionnel.

---

## Chantier 8 — Versioning documentaire

### Objectif
Mettre en place un modèle de versioning métier cohérent et exploitable :
- distinction claire révision (modification de contenu) / version (publication)
- traçabilité des évolutions documentaires
- base pour ProductDocSync et l'analyse d'impact

### Statut
✅ TERMINÉ — Lots 1, 2, 3, 4 soldés (2026-04-11 → 2026-04-12)

### Audit initial (2026-04-11) — Écarts bloquants constatés

| Écart | Gravité |
|---|---|
| Pas de `RevisionRubrique` entité séparée — `revision_numero` figé à 1, jamais incrémenté | BLOQUANT |
| Sauvegarde rubrique (`PUT /api/rubriques/{id}/`) : aucune comparaison XML, aucune révision créée | BLOQUANT |
| Publication (`POST /api/publier-map/`) : export DITA uniquement, pas de `VersionProjet` figée créée | BLOQUANT |
| Pas de jointure `VersionProjet` ↔ révisions — impossible de répondre "quelles révisions étaient publiées ?" | BLOQUANT |
| `clone_version()` : copie physique des rubriques (`pk=None`) — non conforme au référentiel | MOYEN |
| `Rubrique.version`, `Rubrique.version_precedente` : champs ambigus / design par copie inutilisés | MOYEN |
| `Projet.version_numero` : champ mort doublon de `VersionProjet.version_numero` | FAIBLE |

### Modèle cible retenu

**`RevisionRubrique`** : snapshot immuable de chaque modification réelle du XML.
- Champs : `rubrique` FK, `numero` (1, 2, 3…), `contenu_xml`, `hash_contenu` (SHA-256), `auteur`, `date_creation`
- Invariant : immuable après création

**`PublicationSnapshot`** : jointure figée entre une version publiée et les révisions exactes publiées.
- Champs : `version_projet` FK, `rubrique` FK, `revision` FK → `RevisionRubrique`
- Invariant : immuable après création, unique par (version_projet, rubrique)

**Règles métier :**
- Révision créée uniquement si `hash(nouveau_xml) ≠ hash(xml_courant)`
- Renommage, opérations structurelles, ProductDocSync → ne créent JAMAIS de révision
- Publication avec changements → nouvelle `VersionProjet` + `PublicationSnapshot` + export DITA
- Publication sans changement → HTTP 200 `no_change`, pas de VersionProjet créée

### Lot 1 ✅ TERMINÉ 2026-04-11

| Fichier | Nature |
|---|---|
| `documentation/models.py` | Ajout `RevisionRubrique`, `PublicationSnapshot` ; dépréciations commentées |
| `documentation/utils.py` | Ajout `compute_xml_hash()` |
| `documentation/migrations/0009_add_versioning_tables.py` | Schéma — CreateModel additif |
| `documentation/migrations/0010_backfill_revision_initiale.py` | Data — backfill `RevisionRubrique(numero=1)` |
| `documentation/admin.py` | Enregistrement read-only des nouveaux modèles |

**Champs dépréciés (commentés dans models.py, non supprimés) :**
- `Rubrique.revision_numero`, `Rubrique.version`, `Rubrique.version_precedente`
- `Projet.version_numero`, `Projet.date_lancement`, `Projet.notes_version`

### Lot 2 ✅ TERMINÉ 2026-04-11

| Fichier | Nature |
|---|---|
| `documentation/models.py` | Renommage `PublicationSnapshot`, related_names mis à jour |
| `documentation/services.py` | Ajout `create_revision_if_changed()` + `_create_initial_revision()` ; intégration dans `create_project()`, `create_rubrique_in_map()`, `RubriqueViewSet.create()` |
| `documentation/serializers.py` | Ajout `revision_courante_numero` (SerializerMethodField) dans `RubriqueSerializer` |
| `documentation/tests/test_versioning.py` | 29 tests — 51 tests pré-existants verts. Zéro régression. |

**Contrat API mis à jour :**
- `GET /api/rubriques/{id}/` et `PUT /api/rubriques/{id}/` exposent désormais `revision_courante_numero` (int | null)
- `revision_numero` conservé (déprécié, rétrocompatibilité)

### Lot 3 ✅ TERMINÉ 2026-04-12

| Fichier | Nature |
|---|---|
| `documentation/services.py` | Ajout `bump_minor_version()`, `_get_last_published_version()`, `_build_rubrique_revision_map()`, `_detect_changes()`, `_create_publication_snapshot()` (atomique), `publish_project()`, `get_publication_diff()` |
| `documentation/views.py` | Migration `publier_map()` depuis utils.py ; ajout `publication_diff_view` |
| `documentation/urls.py` | Ajout route `api/projets/<projet_id>/publication-diff/` |
| `documentation/tests/test_publication.py` | 37 nouveaux tests — 117/117 total. Zéro régression. |

**Architecture :** séparation nette versionnage métier (atomique) / export technique (hors transaction). Un échec export ne remet pas en cause la version figée.

**Contrainte v1 maintenue :** seule la map master est publiable.

### Lot 4 ✅ TERMINÉ 2026-04-12

| Fichier | Nature |
|---|---|
| `documentation/serializers.py` | Ajout `RevisionRubriqueSerializer` (lecture seule) |
| `documentation/views.py` | Action `@action revisions` sur `RubriqueViewSet` |
| `documentation/tests/test_revisions_endpoint.py` | 13 nouveaux tests — 130/130 total. Zéro régression. |

**Route auto-générée :** `GET /api/rubriques/{id}/revisions/` — tri décroissant, select_related auteur, 0 N+1.

### Travaux restants (hors scope réalisation initiale)

| Lot | Contenu |
|---|---|
| Lot 5 | Tests unitaires et d'intégration supplémentaires |
| Lot 6 | Exposition frontend minimale : révision courante dans CentralEditor, diff pré-publication dans ProjectModule |

---

## 📋 Journal de bord

| Date | Chantier | Avancée |
|---|---|---|
| 2026-04-10 | Chantier 1 — Backend réalignement | Sprints 1–5 terminés. Backend canonique, routes legacy supprimées, frontend migré, logs/monitoring/sérialiseurs stabilisés. |
| 2026-04-10 | Chantier 2 — Lot 1 | Création `selectionStore.ts`. CentralEditor charge réellement la rubrique sélectionnée. Garde-fou actif. |
| 2026-04-10 | Chantier 2 — Lot 2 | `listMapRubriques` migré vers `GET /api/maps/{id}/structure/`. Zéro appel legacy. |
| 2026-04-10 | Chantier 2 — Lot 3 | Renommage rubrique et suppression projet persistés. Clone projet/rubrique et suppression rubrique documentés hors scope v1. |
| 2026-04-10 | Chantier 2 — Lot 4 | `prepareNewRubriqueXml` extrait dans `useNewRubriqueXml`. Log debug supprimé. C10 et C11 vérifiés fausses alertes. |
| 2026-04-10 | Chantier 2 — Lot 5 | Publication réellement branchée sur `POST /api/publier-map/{map_id}/`. Feedback utilisateur réel. |
| 2026-04-11 | Chantier 8 — Audit | 4 écarts bloquants identifiés. Modèle cible `RevisionRubrique` + `PublicationSnapshot` défini. Plan 4 lots validé. |
| 2026-04-11 | Chantier 8 — Lot 1 | Migration additive : `RevisionRubrique`, `PublicationSnapshot`, `compute_xml_hash`. Backfill révision initiale. Zéro régression. |
| 2026-04-11 | Chantier 8 — Lot 2 | Renommage `PublicationSnapshot`. Service `create_revision_if_changed()`. `revision_courante_numero` dans `RubriqueSerializer`. 29 tests + 51 pré-existants verts. |
| 2026-04-12 | Chantier 8 — Lot 3 | Service `publish_project()` : versionnage atomique + export DITA délégué hors transaction. Endpoint `publication-diff`. 37 nouveaux tests — 117/117. |
| 2026-04-12 | Chantier 8 — Lot 4 | `RevisionRubriqueSerializer`. Action `revisions` sur `RubriqueViewSet`. 13 nouveaux tests — 130/130. |
| 2026-04-13 | Chantier 2BIS | Cause racine : préfixe `/api/` manquant dans `useArchivableList`. Archivage backend pleinement opérationnel. Option A retenue — toggle conservé. |
