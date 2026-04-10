# BACKEND_GAP_ANALYSIS.md

> **Statut** : document d'audit vivant
>
> **Base factuelle** : cartographie du code réel effectuée le 2026-04-09
>
> **Référentiel** : `documentum_referentiel_backend_canonique.md`
>
> **Documents croisés** :
> - `documentum_suivi_projet_backend_validations_ajustements.md`
> - `documentum_plan_daction_backend_realignement_sur_referentiel_canonique.md`
> - `gov_decision-log.md`
>
> **Convention criticité** :
> - 🔴 **Bloquant** — violation directe d'un invariant canonique ou ambiguïté de comportement observable
> - 🟠 **Important** — dette technique active, route à supprimer, doublon fonctionnel
> - 🟡 **Amélioration** — manque de normalisation, DTO incomplet, nommage incohérent
>
> **Convention décision** :
> - ▶ **à exécuter** — action validée, sans dépendance bloquante
> - ❓ **à confirmer** — action identifiée, décision non encore actée
> - ⏸ **à différer** — action connue, conditionnée à un prérequis externe (migration frontend, Gate)
> - 🗑 **à supprimer après migration** — suppression conditionnée à la confirmation que le frontend n'appelle plus la route

---

## 1. Module : Création de projet

### 1.1 Cible canonique

| Critère | Valeur attendue |
|---------|----------------|
| Porte d'entrée | `POST /api/projets/` — unique |
| Orchestrateur | `ProjetViewSet.create()` |
| Service dédié | oui — orchestration déléguée à un service métier |
| Invariants garantis | version active + map master + rubrique racine + MapRubrique racine |
| Routes alternatives | ❌ aucune autorisée |

### 1.2 Réalité observée dans le code

| Élément | Fichier | Lignes |
|---------|---------|--------|
| Route active réelle | `POST /projet/create/` → `CreateProjectAPIView` | `views.py:719-861` |
| Route canonique | `POST /api/projets/` → `ProjetViewSet.create()` | `views.py:262-271` |
| Comportement `ProjetViewSet.create()` | Lève `ValidationError` et redirige vers `/projet/create/` | `views.py:265-271` |
| Orchestration complète | Dans `CreateProjectAPIView`, en transaction atomique | `views.py:722-843` |
| Service dédié | Absent — logique inline dans la APIView | — |

**Séquence réelle dans `CreateProjectAPIView` :**

1. `ProjetSerializer.save()` → `Projet` avec `auteur=request.user`
2. `VersionProjet.objects.create(version_numero="1.0.0", is_active=True, notes_version="Version initiale")`
3. `MapSerializer.create()` → `Map(is_master=True, nom="Carte par défaut")`
4. `Rubrique.objects.create(titre="Racine documentaire", is_active=True)`
5. `MapRubrique.objects.create(ordre=1, parent=None)`
6. Réponse : `{"projet": ..., "map": ...}`

### 1.3 Endpoints réels

| Méthode | URL | Handler | Fonctionnel |
|---------|-----|---------|-------------|
| POST | `/projet/create/` | `CreateProjectAPIView` | ✅ (orchestration complète) |
| POST | `/api/projets/` | `ProjetViewSet.create()` | ❌ (désactivé volontairement) |
| GET | `/api/projets/` | `ProjetViewSet.list()` | ✅ |
| GET | `/api/projets/<id>/` | `ProjetViewSet.retrieve()` | ✅ |
| PATCH | `/api/projets/<id>/` | `ProjetViewSet.partial_update()` | ✅ |
| GET | `/projets/<id>/details/` | `get_project_details` | ✅ |

### 1.4 Services impliqués

Aucun service métier dédié. L'orchestration est intégralement portée par `CreateProjectAPIView.post()` (`views.py:722-843`).

### 1.5 Écarts

#### Conforme

- Les 5 invariants de création sont respectés (`views.py:722-843`) : projet, version active, map master, rubrique racine, MapRubrique racine
- Transaction atomique en place (`@transaction.atomic`)
- `auteur` injecté depuis `request.user` (non falsifiable par le payload)
- `ProjetViewSet.create()` neutralisé pour bloquer les créations incomplètes

#### Divergent

- La porte d'entrée réelle est `/projet/create/` — hors namespace `/api/`, hors `ProjetViewSet`
- L'orchestration est dans une `APIView` ad hoc, non dans `ProjetViewSet.create()`
- Aucun service métier isolé : la logique métier est dans une vue

#### Manquant

- Service métier `create_project()` encapsulant l'orchestration complète
- `ProjetViewSet.create()` qui appelle ce service et garantit les invariants
- Suppression de `/projet/create/` (Gate 2 non franchie)

#### Surplus / dette

- `CreateProjectAPIView` (`views.py:719-861`) — transitoire, à supprimer après migration
- Route `/projet/create/` — hors architecture `/api/`

### 1.6 Criticité

| Écart | Preuve code | Criticité |
|-------|-------------|-----------|
| Gate 2 non franchie — porte d'entrée hors `/api/` | `views.py:719`, `urls.py` | 🔴 Bloquant |
| Orchestration dans une APIView au lieu d'un service | `views.py:722-843` | 🟠 Important |
| `ProjetViewSet.create()` volontairement non fonctionnel | `views.py:265-271` | 🟠 Important |
| Absence de service `create_project()` isolé | `services.py` (absent) | 🟡 Amélioration |

---

## 2. Module : Maps

### 2.1 Cible canonique

| Critère | Valeur attendue |
|---------|----------------|
| Handler unique | `MapViewSet` sur `/api/maps/` |
| Handlers concurrents | ❌ aucun autorisé |

### 2.2 Réalité observée dans le code

| Élément | Fichier | Lignes |
|---------|---------|--------|
| `MapViewSet` | `views.py:444-571` | CRUD complet sur `/api/maps/` |
| `CreateMapView` | `views.py:873-883` | POST sur `/api/maps/` également |
| Enregistrement URLs | `urls.py` | Les deux sont enregistrés |

**Comportement sur `POST /api/maps/` :** non déterministe selon l'ordre de résolution d'URL — `MapViewSet` ou `CreateMapView` peut répondre.

### 2.3 Endpoints réels

| Méthode | URL | Handler | Statut |
|---------|-----|---------|--------|
| POST | `/api/maps/` | `MapViewSet` ET `CreateMapView` | ❌ doublon |
| GET | `/api/maps/` | `MapViewSet.list()` | ✅ |
| GET | `/api/maps/<id>/` | `MapViewSet.retrieve()` | ✅ |
| PATCH/PUT | `/api/maps/<id>/` | `MapViewSet.update()` | ✅ |
| DELETE | `/api/maps/<id>/` | `MapViewSet.destroy()` | ✅ |
| GET | `/api/maps/<id>/structure/` | `MapViewSet.structure` | ✅ canonique |
| POST | `/api/maps/<id>/structure/create` | `MapViewSet.structure_create` | ✅ canonique |
| POST | `/api/maps/<id>/structure/reorder` | `MapViewSet.structure_reorder` | ✅ canonique |
| POST | `/api/maps/<id>/structure/<mr_id>/indent` | `MapViewSet.structure_indent` | ✅ canonique |
| POST | `/api/maps/<id>/structure/<mr_id>/outdent` | `MapViewSet.structure_outdent` | ✅ canonique |
| POST | `/api/maps/<id>/create-rubrique` | `MapViewSet.create_rubrique` | 🟠 doublon de `structure/create` |
| GET | `/api/maps/<id>/rubriques/` | `MapViewSet.rubriques` ET `map_rubriques_view` | 🟠 doublon |
| POST | `/api/maps/<id>/rubriques/` | `MapViewSet.rubriques (POST)` | 🟠 remplacé par `structure/attach` |
| GET | `/api/projets/<proj_id>/structure/` | `projet_structure_view` | ✅ canonique |

### 2.4 Écarts

#### Conforme

- `MapViewSet` présent et fonctionnel
- Tous les endpoints structurels canoniques implémentés : `structure/`, `structure/create`, `structure/reorder`, `structure/<id>/indent`, `structure/<id>/outdent`
- `GET /api/projets/<id>/structure/` présent

#### Divergent

- `POST /api/maps/` enregistré deux fois (`MapViewSet` + `CreateMapView`) — comportement non déterministe

#### Manquant

- `POST /api/maps/<id>/structure/attach/` — endpoint canonique pour attacher une rubrique existante

#### Surplus / dette

| Route | Handler | Preuve code | Motif |
|-------|---------|-------------|-------|
| `POST /api/maps/` (doublon) | `CreateMapView` | `views.py:873-883`, `urls.py` | Remplacé par `MapViewSet` |
| `POST /api/maps/<id>/create-rubrique` | `MapViewSet.create_rubrique` | `views.py:537-571` | Doublon de `structure/create` |
| `GET/POST /api/maps/<id>/rubriques/` | `MapViewSet.rubriques` + `map_rubriques_view` | `views.py:449-466`, `views.py:416-440` | Doublons de `structure/` et `structure/attach` |
| `POST /api/maps/<map_id>/reorder/` | `MapReorderCompatView` | `views.py:607-636` | Route compat — remplacée par `structure/reorder` |
| `POST /api/map-rubriques/<pk>/indent/` | `MapRubriqueIndentView` | `views.py:575-587` | Route compat — remplacée par `structure/<id>/indent` |
| `POST /api/map-rubriques/<pk>/outdent/` | `MapRubriqueOutdentView` | `views.py:591-603` | Route compat — remplacée par `structure/<id>/outdent` |

### 2.5 Criticité

| Écart | Preuve code | Criticité |
|-------|-------------|-----------|
| Double handler sur `POST /api/maps/` | `views.py:873`, `urls.py` | 🟠 Important — code mort masquant un doublon historique |
| `POST /api/maps/<id>/structure/attach/` absent | `urls.py` (absent) | 🟠 Important |
| `GET /api/maps/<id>/rubriques/` doublon | `views.py:416`, `views.py:449` | 🟠 Important |
| Routes de compatibilité maintenues | `views.py:575-636` | 🟡 Amélioration (à supprimer après migration frontend) |
| `create-rubrique` doublon de `structure/create` | `views.py:537-571` | 🟡 Amélioration |

---

## 3. Module : Structure documentaire (MapRubrique)

### 3.1 Cible canonique

| Critère | Valeur attendue |
|---------|----------------|
| Rôle MapRubrique | Structure pure — pas de CRUD exposé |
| Manipulation frontend | Jamais directe |
| Endpoints canoniques | `GET /api/maps/{id}/structure/`, `POST structure/attach/`, `POST structure/create/`, `POST structure/reorder/`, `POST structure/{id}/indent`, `POST structure/{id}/outdent` |
| Services | `add_rubrique_to_map`, `create_rubrique_in_map`, `reorder_map_rubriques`, `indent_map_rubrique`, `outdent_map_rubrique` |

### 3.2 Réalité observée

| Élément | Fichier | Lignes |
|---------|---------|--------|
| Modèle `MapRubrique` | `models.py:188-202` | FK map, rubrique, ordre, parent self-referential |
| `add_rubrique_to_map()` | `services.py:13-80` | atomique, `select_for_update`, validations métier |
| `create_rubrique_in_map()` | `services.py:83-196` | atomique, insert_before/after, shift frères |
| `reorder_map_rubriques()` | `services.py:314-349` | atomique, `select_for_update`, anti-duplicate |
| `indent_map_rubrique()` | `services.py:199-254` | atomique, règle frère précédent requis |
| `outdent_map_rubrique()` | `services.py:257-311` | atomique, règle parent requis |

**Endpoints qui exposent `MapRubrique` directement (hors canon) :**

| Route | Preuve code | Nature de la violation |
|-------|-------------|------------------------|
| `POST /api/map-rubriques/` | `views.py:325-368` | Expose CRUD direct sur MapRubrique |
| `POST /api/map-rubriques/<pk>/indent/` | `views.py:575-587` | Route compat hors namespace structure |
| `POST /api/map-rubriques/<pk>/outdent/` | `views.py:591-603` | Route compat hors namespace structure |
| `POST /api/maps/<id>/rubriques/` (POST) | `views.py:449-466` | Doublon non canonique de `structure/attach` |

### 3.3 Endpoints structurels réels

| Endpoint | Preuve code | Statut | Conforme |
|----------|-------------|--------|---------|
| `GET /api/maps/<id>/structure/` | `views.py:468-479` | ✅ implémenté | ✅ |
| `POST /api/maps/<id>/structure/create` | `views.py:481-497` | ✅ implémenté | ✅ |
| `POST /api/maps/<id>/structure/reorder` | `views.py:499-511` | ✅ implémenté | ✅ |
| `POST /api/maps/<id>/structure/<mr_id>/indent` | `views.py:513-523` | ✅ implémenté | ✅ |
| `POST /api/maps/<id>/structure/<mr_id>/outdent` | `views.py:525-535` | ✅ implémenté | ✅ |
| `POST /api/maps/<id>/structure/attach/` | `urls.py` (absent) | ❌ absent | ❌ |
| `GET /api/projets/<id>/structure/` | `views.py:372-412` | ✅ implémenté | ✅ |
| `POST /api/map-rubriques/` | `views.py:325-368` | ✅ implémenté | ❌ expose MapRubrique directement |
| `POST /api/maps/<id>/rubriques/` | `views.py:449-466` | ✅ implémenté | ❌ doublon non canonique |
| `POST /api/map-rubriques/<pk>/indent/` | `views.py:575-587` | ✅ implémenté | ❌ route compat hors canon |
| `POST /api/map-rubriques/<pk>/outdent/` | `views.py:591-603` | ✅ implémenté | ❌ route compat hors canon |
| `POST /api/maps/<map_id>/reorder/` | `views.py:607-636` | ✅ implémenté | ❌ route compat hors canon |

### 3.4 Services métier réellement utilisés

| Service | Preuve code | Utilisé par |
|---------|-------------|-------------|
| `add_rubrique_to_map()` | `services.py:13` | `add_rubrique_to_map_view` (`views.py:325`), `MapViewSet.rubriques` POST (`views.py:449`) |
| `create_rubrique_in_map()` | `services.py:83` | `MapViewSet.structure_create` (`views.py:481`), `MapViewSet.create_rubrique` (`views.py:537`) |
| `reorder_map_rubriques()` | `services.py:314` | `MapViewSet.structure_reorder` (`views.py:499`), `MapReorderCompatView` (`views.py:607`) |
| `indent_map_rubrique()` | `services.py:199` | `MapViewSet.structure_indent` (`views.py:513`), `MapRubriqueIndentView` (`views.py:575`) |
| `outdent_map_rubrique()` | `services.py:257` | `MapViewSet.structure_outdent` (`views.py:525`), `MapRubriqueOutdentView` (`views.py:591`) |

Observation : chaque service est appelé via **deux routes** — canonique + compat. Aucune logique métier dupliquée dans les vues.

### 3.5 Invariants visibles dans le code — conformes

| Invariant | Preuve code |
|-----------|-------------|
| `rubrique.projet_id == map.projet_id` | `services.py:39`, `serializers.py:89` |
| `parent.map_id == map.id` | `serializers.py:93` |
| Unicité `(map, rubrique)` | `services.py:48-53` |
| `ordre = max(frères) + 1` si non fourni | `services.py:62-68` |
| Décalage frères sur insert_before/after | `services.py:167-178` |
| Frère précédent requis pour indent | `services.py:218-220` |
| Parent requis pour outdent | `services.py:271-273` |
| Verrou pessimiste `select_for_update` sur toutes les opérations | `services.py:22, 206, 264, 323` |

### 3.6 Écarts

#### Conforme

- Services métiers atomiques, correctement utilisés pour toutes les opérations hiérarchiques
- `MapRubrique` ne stocke aucun contenu (structure pure)
- `MapRubriqueStructureSerializer` → `RubriqueMiniSerializer` : pas de `contenu_xml` dans les réponses de structure (`serializers.py:211-221`)
- Tous les invariants métier sont appliqués dans `services.py`

#### Divergent

- `POST /api/map-rubriques/` expose `MapRubrique` via CRUD direct — violation du canon ("frontend ne manipule jamais directement MapRubrique")
- `POST /api/maps/<id>/rubriques/` (POST) doublon non canonique de `structure/attach`

#### Manquant

- `POST /api/maps/<id>/structure/attach/` — endpoint canonique pour attacher une rubrique existante

#### Surplus / dette

| Élément | Preuve code | Motif |
|---------|-------------|-------|
| `POST /api/map-rubriques/` | `views.py:325-368`, `urls.py` | Exposition directe MapRubrique — violation canon |
| `POST /api/maps/<id>/rubriques/` (POST) | `views.py:449-466` | Doublon de `structure/attach` |
| `GET /api/maps/<id>/rubriques/` doublon | `views.py:416-440` + `views.py:449-466` | Deux handlers identiques |
| `MapRubriqueIndentView` | `views.py:575-587` | Route compat, remplacée |
| `MapRubriqueOutdentView` | `views.py:591-603` | Route compat, remplacée |
| `MapReorderCompatView` | `views.py:607-636` | Route compat, remplacée |
| `MapViewSet.create_rubrique` | `views.py:537-571` | Doublon de `structure_create` |

### 3.7 Criticité

| Écart | Preuve code | Criticité |
|-------|-------------|-----------|
| `POST /api/map-rubriques/` expose MapRubrique directement | `views.py:325-368` | 🔴 Bloquant — violation du canon |
| `POST /api/maps/<id>/structure/attach/` absent | `urls.py` (absent) | 🟠 Important |
| Doubles handlers GET `/api/maps/<id>/rubriques/` | `views.py:416`, `views.py:449` | 🟠 Important |
| Routes compat (`map-rubriques/*`, `reorder`) | `views.py:575-636` | 🟡 Amélioration — assumées transitoires |
| `create-rubrique` doublon de `structure/create` | `views.py:537-571` | 🟡 Amélioration |

---

## 4. Module : Contenu documentaire (Rubrique)

### 4.1 Cible canonique

| Critère | Valeur attendue |
|---------|----------------|
| Endpoint édition | `PUT /api/rubriques/{id}/` |
| Effet de bord structurel | ❌ aucun |
| DTO contenu | `RubriqueContentDTO` minimal : `rubrique_id` + `contenu_xml` |
| Isolation | Aucun endpoint structurel ne modifie le contenu. Aucun endpoint de contenu ne modifie la structure. |

### 4.2 Réalité observée

| Élément | Fichier | Lignes |
|---------|---------|--------|
| `RubriqueViewSet` | `views.py:640-716` | CRUD complet, `IsAuthenticated` |
| `RubriqueSerializer` | `serializers.py:236-294` | Tous champs (lecture + écriture) |
| `RubriqueMiniSerializer` | `serializers.py:199-208` | id, titre, revision_numero, is_active, is_archived — pas de `contenu_xml` |
| Validation XML | `models.py:161-166` | `ET.fromstring()`, lève `ValidationError` si `ParseError` |
| Injection version active | `views.py:660-670` | `VersionProjet.is_active=True` requis pour create |
| Verrou `select_for_update` sur update | `views.py:694` | Présent |
| Transaction atomique sur update | `views.py:694` | Présent |

### 4.3 Endpoint canonique réel

`PUT /api/rubriques/<id>/` → `RubriqueViewSet.update()` (`views.py:681-716`)

- valide `version_projet.projet == projet` (`views.py:700`)
- verrou `select_for_update()` (`views.py:694`)
- transaction atomique
- retourne `RubriqueSerializer` complet

`PATCH /api/rubriques/<id>/` → `RubriqueViewSet.partial_update()` — même chemin.

### 4.4 Effets de bord éventuels

- `create_rubrique_in_map()` (`services.py:83`) crée une `Rubrique` ET un `MapRubrique` dans la même transaction. Ce couplage est localisé dans `services.py`, non dans `RubriqueViewSet`. Pas d'effet de bord structurel depuis `update()`.
- `RubriqueViewSet.destroy()` supprime la `Rubrique` → la FK `MapRubrique.rubrique` est `on_delete=CASCADE` (`models.py:191`) → **suppression en cascade silencieuse des `MapRubrique` liés**. Effet de bord structurel non protégé, non documenté.

### 4.5 Écarts

#### Conforme

- `PUT /api/rubriques/<id>/` fonctionnel
- Validation XML en modèle (`models.py:161`)
- Champs `version`, `version_precedente`, `revision_numero` en read-only (`serializers.py:274-283`)
- `auteur` injecté depuis `request.user` à la création
- Version active requise pour créer (`views.py:660-670`)
- Pas d'effet de bord structurel dans `update()` / `partial_update()`
- `RubriqueMiniSerializer` (réponses de structure) n'expose pas `contenu_xml`

#### Divergent

- `RubriqueViewSet.destroy()` supprime en cascade les `MapRubrique` (effet de bord structurel non signalé, non protégé)
- `RubriqueSerializer` est polyvalent : utilisé pour création standalone, update contenu, et réponses CRUD — pas de DTO orienté flux

#### Manquant

- Protection ou vérification préalable sur `DELETE /api/rubriques/<id>/`
- `RubriqueContentDTO` minimal (`rubrique_id` + `contenu_xml`) pour l'édition isolée
- DTO de navigation distincts selon flux (édition / navigation / publication)

#### Surplus / dette

- `RubriqueSerializer` couvre trop de flux — `fonctionnalite` nested alourdit les réponses de contenu (`serializers.py:236-294`)
- `GET /api/rubriques/` retourne `contenu_xml` pour toutes les rubriques sans filtre ni pagination forcée

##### Dette métier identifiée — contenu XML racine

| Élément | Preuve code | Problème | Nature |
|--------|------------|----------|--------|
| `Rubrique.contenu_xml = ""` lors de la création racine | `CreateProjectAPIView` / `create_project()` | Le champ XML est vide alors que `clean()` impose un XML valide | Dette métier |

**Description :**

La rubrique racine est créée avec un `contenu_xml` vide (`""`), ce qui :

- contourne la validation XML (`clean()` non appelé via `objects.create()`)
- introduit un état non conforme au modèle DITA
- peut provoquer des incohérences lors :
  - de l’édition
  - de l’export DITA
  - des validations futures

**Analyse :**

Ce n’est pas uniquement une dette technique, mais une **ambiguïté métier** :
- une rubrique est censée contenir un XML valide
- mais la racine est créée dans un état invalide toléré

**Options de correction (hors sprint courant) :**

1. Générer un XML minimal valide (template DITA)
2. Ajouter une validation explicite au moment de la création
3. Autoriser explicitement un état "vide" (à formaliser)

**Décision :**
⏸ à différer — à traiter lors de la normalisation contenu / DITA

### 4.6 Criticité

| Écart | Preuve code | Criticité |
|-------|-------------|-----------|
| `DELETE /api/rubriques/<id>/` → suppression en cascade `MapRubrique` non protégée | `models.py:191`, `views.py:640` (destroy hérité) | 🔴 Bloquant — absence de garde métier explicite sur un effet de bord structurel implicite |
| Absence de `RubriqueContentDTO` minimal | `serializers.py:236-294` | 🟠 Important |
| `RubriqueSerializer` polyvalent sans distinction de flux | `serializers.py:236-294` | 🟡 Amélioration |
| `GET /api/rubriques/` retourne `contenu_xml` sans filtre | `views.py:640` (list hérité) | 🟡 Amélioration |

---

## 5. Synthèse transversale

### 5.1 Incohérences majeures

| # | Incohérence | Module | Preuve code | Criticité |
|---|------------|--------|-------------|-----------|
| I-1 | Porte d'entrée projet hors `/api/`, hors `ProjetViewSet` | Création projet | `views.py:719`, `urls.py` | 🔴 |
| I-2 | Double handler sur `POST /api/maps/` | Maps | `views.py:873`, `urls.py` | 🔴 |
| I-3 | `POST /api/map-rubriques/` expose `MapRubrique` directement | Structure | `views.py:325-368` | 🔴 |
| I-4 | `DELETE /api/rubriques/<id>/` supprime en cascade `MapRubrique` sans protection | Contenu | `models.py:191`, `views.py:640` | 🔴 |
| I-5 | `POST /api/maps/<id>/structure/attach/` absent | Structure | `urls.py` (absent) | 🟠 |
| I-6 | `GET /api/maps/<id>/rubriques/` mappé deux fois | Maps / Structure | `views.py:416`, `views.py:449` | 🟠 |

### 5.2 Compatibilités transitoires assumées

Ces routes existent par décision de compatibilité frontend (acté dans le suivi) et ne constituent pas des violations tant que la migration frontend n'est pas effectuée :

| Route | Handler | Preuve code | Remplacée par |
|-------|---------|-------------|--------------|
| `POST /api/map-rubriques/<pk>/indent/` | `MapRubriqueIndentView` | `views.py:575-587` | `POST /api/maps/<id>/structure/<mr_id>/indent` |
| `POST /api/map-rubriques/<pk>/outdent/` | `MapRubriqueOutdentView` | `views.py:591-603` | `POST /api/maps/<id>/structure/<mr_id>/outdent` |
| `POST /api/maps/<map_id>/reorder/` | `MapReorderCompatView` | `views.py:607-636` | `POST /api/maps/<id>/structure/reorder` |
| `POST /projet/create/` | `CreateProjectAPIView` | `views.py:719-861` | `POST /api/projets/` (Gate 2) |

### 5.3 Dette technique explicite

| Dette | Preuve code | Volume estimé |
|-------|-------------|---------------|
| Logique orchestration projet dans une APIView | `views.py:719-861` | ~120 lignes à extraire |
| Routes compat maintenues | `urls.py` + `views.py:575-636` | 5 handlers, ~150 lignes |
| `MapViewSet.create_rubrique` doublon de `structure_create` | `views.py:537-571` | ~35 lignes |
| `CreateMapView` doublon | `views.py:873-883` | ~10 lignes |
| `MapViewSet.rubriques` (POST) doublon de `structure/attach` | `views.py:449-466` | ~18 lignes |
| `RubriqueSerializer` polyvalent | `serializers.py:236-294` | à split en DTO orientés flux |

### 5.4 Prochain lot de réalignement recommandé

| Ordre | Action | Preuve code | Gate | Décision |
|-------|--------|-------------|------|----------|
| 1 | Supprimer `CreateMapView` — vérifier handler unique `POST /api/maps/` | `views.py:873-883` | Gate 1 | ▶ à exécuter |
| 2 | Implémenter `POST /api/maps/<id>/structure/attach/` | `urls.py` (absent) | Gate 1 | ▶ à exécuter |
| 3 | Protéger `DELETE /api/rubriques/<id>/` contre suppression cascade silencieuse | `models.py:191`, `views.py:640` | Gate 3 | ▶ à exécuter |
| 4 | Extraire orchestration création projet dans `create_project()` service | `views.py:722-843` | Gate 2 | ❓ à confirmer |
| 5 | Migrer `ProjetViewSet.create()` vers le service, supprimer `/projet/create/` | `views.py:262-271`, `views.py:719` | Gate 2 | ⏸ à différer (après #4) |
| 6 | Supprimer `MapViewSet.create_rubrique` (doublon `structure/create`) | `views.py:537-571` | — | ❓ à confirmer |
| 7 | Définir `RubriqueContentDTO` minimal pour édition | `serializers.py:236-294` | Gate 3 | ❓ à confirmer |
| 8 | Supprimer routes compat `map-rubriques/*` et `reorder` après migration frontend | `views.py:575-636` | Post-Gate | 🗑 à supprimer après migration |
| 9 | Supprimer `GET/POST /api/maps/<id>/rubriques/` après migration frontend | `views.py:416-466` | Post-Gate | 🗑 à supprimer après migration |
| 10 | Supprimer `CreateProjectAPIView` et route `/projet/create/` | `views.py:719-861` | Post-Gate 2 | 🗑 à supprimer après migration |

---

## 6. Inventaire exhaustif des routes exposées

> Sources : `documentation/urls.py`, `documentation_project/urls.py`
>
> **Note de résolution d'URL** : le routeur DRF est enregistré à la ligne 63 de `urls.py` via `path("api/", include(router.urls))`. Les routes explicites enregistrées après lui sur le même préfixe (`path("api/maps/", CreateMapView...)` ligne 64, `path("api/maps/<int:map_id>/rubriques/", map_rubriques_view)` ligne 87) ne sont **jamais atteintes** : Django s'arrête au premier pattern correspondant. Ces handlers sont du **code mort**.
>
> **Légende statut** :
> - ✅ **canonique** — conforme au référentiel, à maintenir
> - 🔄 **compat transitoire** — assumé temporairement, à supprimer après migration frontend
> - ❌ **historique à supprimer** — doublon non canonique ou violation du référentiel
> - 💀 **mort** — enregistré dans urls.py mais jamais atteint (résolution Django)

---

### 6.1 Projets

| Méthode | Route exacte | Handler | Preuve code | Statut |
|---------|-------------|---------|-------------|--------|
| GET | `/api/projets/` | `ProjetViewSet.list()` | `urls.py:44`, `views.py:257` | ✅ canonique |
| POST | `/api/projets/` | `ProjetViewSet.create()` → lève `ValidationError` | `urls.py:44`, `views.py:262-271` | ❌ historique à supprimer (désactivé volontairement, Gate 2) |
| GET | `/api/projets/{pk}/` | `ProjetViewSet.retrieve()` | `urls.py:44`, `views.py:257` | ✅ canonique |
| PUT | `/api/projets/{pk}/` | `ProjetViewSet.update()` | `urls.py:44`, `views.py:257` | ✅ canonique |
| PATCH | `/api/projets/{pk}/` | `ProjetViewSet.partial_update()` | `urls.py:44`, `views.py:257` | ✅ canonique |
| DELETE | `/api/projets/{pk}/` | `ProjetViewSet.destroy()` | `urls.py:44`, `views.py:257` | ❓ non évalué (risque faible) |
| POST | `/projet/create/` | `CreateProjectAPIView` | `urls.py:61`, `views.py:719-861` | 🔄 compat transitoire (seule route de création active, hors `/api/`) |
| GET | `/projets/{pk}/details/` | `get_project_details` | `urls.py:62`, `views.py:865-869` | ❌ historique à supprimer (hors `/api/`, doublon de `retrieve()`) |
| GET | `/api/projets/{projet_id}/structure/` | `projet_structure_view` | `urls.py:83-86`, `views.py:372-412` | ✅ canonique |

---

### 6.2 Maps — CRUD

| Méthode | Route exacte | Handler | Preuve code | Statut |
|---------|-------------|---------|-------------|--------|
| GET | `/api/maps/` | `MapViewSet.list()` | `urls.py:45`, `views.py:444` | ✅ canonique |
| POST | `/api/maps/` | `MapViewSet.create()` | `urls.py:45`, `views.py:444` | ✅ canonique |
| GET | `/api/maps/{pk}/` | `MapViewSet.retrieve()` | `urls.py:45`, `views.py:444` | ✅ canonique |
| PUT | `/api/maps/{pk}/` | `MapViewSet.update()` | `urls.py:45`, `views.py:444` | ✅ canonique |
| PATCH | `/api/maps/{pk}/` | `MapViewSet.partial_update()` | `urls.py:45`, `views.py:444` | ✅ canonique |
| DELETE | `/api/maps/{pk}/` | `MapViewSet.destroy()` | `urls.py:45`, `views.py:444` | ✅ canonique |
| POST | `/api/maps/` | `CreateMapView` | `urls.py:64`, `views.py:873-883` | 💀 mort — enregistré après le routeur, jamais atteint |

---

### 6.3 Maps — Structure documentaire

| Méthode | Route exacte | Handler | Preuve code | Statut |
|---------|-------------|---------|-------------|--------|
| GET | `/api/maps/{pk}/structure/` | `MapViewSet.structure` | `urls.py:45`, `views.py:468-479` | ✅ canonique |
| POST | `/api/maps/{pk}/structure/create` | `MapViewSet.structure_create` | `urls.py:45`, `views.py:481-497` | ✅ canonique |
| POST | `/api/maps/{pk}/structure/reorder` | `MapViewSet.structure_reorder` | `urls.py:45`, `views.py:499-511` | ✅ canonique |
| POST | `/api/maps/{pk}/structure/{map_rubrique_id}/indent` | `MapViewSet.structure_indent` | `urls.py:45`, `views.py:513-523` | ✅ canonique |
| POST | `/api/maps/{pk}/structure/{map_rubrique_id}/outdent` | `MapViewSet.structure_outdent` | `urls.py:45`, `views.py:525-535` | ✅ canonique |
| — | `/api/maps/{pk}/structure/attach/` | — | absent | ❌ manquant (endpoint canonique non implémenté) |
| GET | `/api/maps/{pk}/rubriques/` | `MapViewSet.rubriques` (GET) | `urls.py:45`, `views.py:449-466` | 🔄 compat transitoire (doublon de `structure/`) |
| POST | `/api/maps/{pk}/rubriques/` | `MapViewSet.rubriques` (POST) | `urls.py:45`, `views.py:449-466` | 🔄 compat transitoire (doublon de `structure/attach/`) |
| POST | `/api/maps/{pk}/create-rubrique` | `MapViewSet.create_rubrique` | `urls.py:45`, `views.py:537-571` | ❌ historique à supprimer (doublon exact de `structure/create`) |
| POST | `/api/maps/{map_id}/reorder/` | `MapReorderCompatView` | `urls.py:76-80`, `views.py:607-636` | 🔄 compat transitoire (doublon de `structure/reorder`) |
| GET | `/api/maps/{map_id}/rubriques/` | `map_rubriques_view` | `urls.py:87`, `views.py:416-440` | 💀 mort — enregistré après le routeur, jamais atteint |

---

### 6.4 Map-rubriques

| Méthode | Route exacte | Handler | Preuve code | Statut |
|---------|-------------|---------|-------------|--------|
| POST | `/api/map-rubriques/` | `add_rubrique_to_map_view` | `urls.py:65`, `views.py:325-368` | ❌ historique à supprimer (expose `MapRubrique` directement — violation canon) |
| POST | `/api/map-rubriques/{pk}/indent/` | `MapRubriqueIndentView` | `urls.py:66-70`, `views.py:575-587` | 🔄 compat transitoire (doublon de `structure/{id}/indent`) |
| POST | `/api/map-rubriques/{pk}/outdent/` | `MapRubriqueOutdentView` | `urls.py:71-75`, `views.py:591-603` | 🔄 compat transitoire (doublon de `structure/{id}/outdent`) |

---

### 6.5 Rubriques

| Méthode | Route exacte | Handler | Preuve code | Statut |
|---------|-------------|---------|-------------|--------|
| GET | `/api/rubriques/` | `RubriqueViewSet.list()` | `urls.py:46`, `views.py:640` | ✅ canonique |
| POST | `/api/rubriques/` | `RubriqueViewSet.create()` | `urls.py:46`, `views.py:649-679` | ✅ canonique |
| GET | `/api/rubriques/{pk}/` | `RubriqueViewSet.retrieve()` | `urls.py:46`, `views.py:640` | ✅ canonique |
| PUT | `/api/rubriques/{pk}/` | `RubriqueViewSet.update()` | `urls.py:46`, `views.py:681-716` | ✅ canonique |
| PATCH | `/api/rubriques/{pk}/` | `RubriqueViewSet.partial_update()` | `urls.py:46`, `views.py:640` | ✅ canonique |
| DELETE | `/api/rubriques/{pk}/` | `RubriqueViewSet.destroy()` | `urls.py:46`, `views.py:640` | ❌ historique à supprimer (suppression en cascade `MapRubrique` non protégée — I-4) |

---

### 6.6 Synthèse par statut

| Statut | Nombre | Routes concernées |
|--------|--------|------------------|
| ✅ canonique | 17 | CRUD projets/maps/rubriques + endpoints structure/* |
| 🔄 compat transitoire | 6 | `/projet/create/`, rubriques/, reorder, indent compat, outdent compat |
| ❌ historique à supprimer | 5 | `ProjetViewSet.create()` désactivé, `create-rubrique`, `map-rubriques/`, `DELETE rubriques/`, `projets/<pk>/details/` |
| 💀 mort (dead code) | 2 | `CreateMapView`, `map_rubriques_view` |
| ❌ manquant | 1 | `structure/attach/` |

---

## 7. Plan de réalignement progressif

> **Principe** : aucune suppression avant que le remplacement soit en place et validé.
> Les endpoints de compatibilité coexistent tant que le frontend n'est pas migré.
> Aucune logique métier n'est déplacée vers le frontend.

---

### 7.1 Corrections sans risque

Ces corrections ne touchent pas aux routes actives utilisées par le frontend. Elles peuvent être exécutées immédiatement et de manière indépendante.

| # | Correction | Preuve code | Impact frontend | Risque |
|---|-----------|-------------|-----------------|--------|
| C1 | Supprimer `CreateMapView` du registre URL (`urls.py`) — `MapViewSet` devient le seul handler de `POST /api/maps/` | `views.py:873-883`, `urls.py` | Aucun — `MapViewSet` gère déjà cette route | Faible |
| C2 | Supprimer l'action `create_rubrique` de `MapViewSet` (`views.py:537-571`) — doublon exact de `structure_create` | `views.py:537-571` | Aucun si le frontend appelle déjà `structure/create` | Faible — vérifier logs d'accès |
| C3 | Protéger `RubriqueViewSet.destroy()` : vérifier l'existence de `MapRubrique` liés avant suppression, renvoyer 409 si des liens actifs existent | `views.py:640`, `models.py:191` | Aucun — ajoute une protection, ne change pas le flux nominal | Nul |

**Prérequis pour C1 :** vérifier dans les logs ou tests que `POST /api/maps/` est appelé exclusivement par le `MapViewSet` (aucun comportement spécifique de `CreateMapView` utilisé).

**Prérequis pour C2 :** vérifier dans les logs ou tests que l'URL `/api/maps/<id>/create-rubrique` n'est plus appelée par le frontend.

---

### 7.2 Corrections avec compat transitoire

Ces corrections introduisent les endpoints canoniques manquants **en parallèle** des routes existantes, sans les supprimer. La suppression est différée.

| # | Correction | Preuve code | Compat maintenue | Notes |
|---|-----------|-------------|------------------|-------|
| T1 | Implémenter `POST /api/maps/<id>/structure/attach/` : route canonique appelant `add_rubrique_to_map()` | `services.py:13-80` (service existant) | `POST /api/map-rubriques/` reste actif jusqu'à migration frontend | Le service existe déjà — seule la route est à créer |
| T2 | Extraire l'orchestration de `CreateProjectAPIView` dans un service `create_project()` dans `services.py` | `views.py:722-843` | `POST /projet/create/` reste actif jusqu'à migration frontend | Service à créer ; invariants déjà connus |
| T3 | Faire appeler `ProjetViewSet.create()` ce nouveau service `create_project()` | `views.py:265-271` (à remplacer) | `POST /projet/create/` reste actif | Unblock Gate 2 |

**Dépendances :** T3 dépend de T2. T1 est indépendant.

**Invariants à préserver dans `create_project()` (T2) :**

1. `Projet` créé avec `auteur=request.user`
2. `VersionProjet(version_numero="1.0.0", is_active=True)` — `services.py` (à créer)
3. `Map(is_master=True)` — `models.py:173`
4. `Rubrique(titre="Racine documentaire", is_active=True)` — `models.py:128`
5. `MapRubrique(ordre=1, parent=None)` — `models.py:188`

Toute la séquence en `@transaction.atomic`.

---

### 7.3 Suppressions différées

Ces suppressions ne peuvent intervenir qu'**après confirmation** que le frontend n'appelle plus les routes concernées. Elles sont conditionnées à la migration frontend.

| # | Élément à supprimer | Preuve code | Condition de suppression | Remplacé par |
|---|--------------------|-----------|--------------------------|----|
| S1 | `POST /api/map-rubriques/` (`add_rubrique_to_map_view`) | `views.py:325-368`, `urls.py` | Frontend migré vers `structure/attach/` | `POST /api/maps/<id>/structure/attach/` (T1) |
| S2 | `POST /api/map-rubriques/<pk>/indent/` (`MapRubriqueIndentView`) | `views.py:575-587`, `urls.py` | Frontend migré vers `structure/<mr_id>/indent` | `POST /api/maps/<id>/structure/<mr_id>/indent` |
| S3 | `POST /api/map-rubriques/<pk>/outdent/` (`MapRubriqueOutdentView`) | `views.py:591-603`, `urls.py` | Frontend migré vers `structure/<mr_id>/outdent` | `POST /api/maps/<id>/structure/<mr_id>/outdent` |
| S4 | `POST /api/maps/<map_id>/reorder/` (`MapReorderCompatView`) | `views.py:607-636`, `urls.py` | Frontend migré vers `structure/reorder` | `POST /api/maps/<id>/structure/reorder` |
| S5 | `GET /api/maps/<id>/rubriques/` doublon (`map_rubriques_view`) | `views.py:416-440`, `urls.py` | Frontend migré vers `structure/` | `GET /api/maps/<id>/structure/` |
| S6 | `POST /api/maps/<id>/rubriques/` (action `MapViewSet.rubriques` POST) | `views.py:449-466` | Frontend migré vers `structure/attach/` | `POST /api/maps/<id>/structure/attach/` (T1) |
| S7 | `POST /projet/create/` (`CreateProjectAPIView`) | `views.py:719-861`, `urls.py` | Gate 2 franchie, frontend migré vers `POST /api/projets/` | `POST /api/projets/` (T3) |

---

### 7.4 Prérequis de tests

Avant toute exécution des corrections, les cas suivants doivent être couverts par des tests (automatisés ou vérification manuelle) :

| Test | Couvre | Nécessaire avant |
|------|--------|-----------------|
| T-01 | `POST /api/projets/` crée projet + version active + map master + rubrique racine + MapRubrique racine en une seule requête | T3, S7 |
| T-02 | `POST /api/projets/` sans version active → retourne 400, aucun objet partiel créé | T3 |
| T-03 | `POST /api/maps/` → une seule réponse après suppression `CreateMapView` | C1 |
| T-04 | `POST /api/maps/<id>/structure/attach/` avec rubrique d'un autre projet → 400 | T1 |
| T-05 | `POST /api/maps/<id>/structure/attach/` avec doublon (map, rubrique) → 400 | T1 |
| T-06 | `DELETE /api/rubriques/<id>/` avec MapRubrique liés → 409 (après C3) | C3 |
| T-07 | `DELETE /api/rubriques/<id>/` sans MapRubrique liés → 204 | C3 |
| T-08 | Indent d'une rubrique sans frère précédent → 400 | Validation services existants |
| T-09 | Outdent d'une rubrique racine (parent=None) → 400 | Validation services existants |
| T-10 | Reorder avec IDs n'appartenant pas au même parent → 400 | Validation `reorder_map_rubriques` |

---

### 7.5 Ordre recommandé

```
Phase A — Sans risque, sans dépendance
  C1  Supprimer CreateMapView du routeur
  C2  Supprimer MapViewSet.create_rubrique (doublon)
  C3  Protéger DELETE /api/rubriques/<id>/ contre cascade silencieuse

  → Prérequis : T-03, T-06, T-07

Phase B — Endpoints manquants (parallèle, sans suppression)
  T1  Implémenter POST /api/maps/<id>/structure/attach/

  → Prérequis : T-04, T-05

Phase C — Canonisation création projet
  T2  Extraire create_project() dans services.py
  T3  Migrer ProjetViewSet.create() vers create_project()

  → Prérequis : T-01, T-02
  → Dépend de : T2 avant T3

Phase D — Gate de validation (post-C + post-T)
  ↳ Gate 1 : POST /api/maps/ handler unique ✅ (après C1)
              POST /api/maps/<id>/structure/attach/ présent ✅ (après T1)
  ↳ Gate 2 : POST /api/projets/ garantit les 5 invariants ✅ (après T3)

Phase E — Suppressions (après migration frontend confirmée)
  S1  Supprimer POST /api/map-rubriques/
  S2  Supprimer POST /api/map-rubriques/<pk>/indent/
  S3  Supprimer POST /api/map-rubriques/<pk>/outdent/
  S4  Supprimer POST /api/maps/<map_id>/reorder/
  S5  Supprimer GET /api/maps/<id>/rubriques/ (doublon map_rubriques_view)
  S6  Supprimer POST /api/maps/<id>/rubriques/ (action MapViewSet.rubriques POST)
  S7  Supprimer POST /projet/create/ + CreateProjectAPIView

  → Condition : chaque suppression individuelle est conditionnée à la
    confirmation que le frontend n'appelle plus la route concernée.
    Les suppressions S1–S6 sont indépendantes entre elles.
    S7 dépend de Gate 2.

Phase F — Normalisation DTO (progressif, sans urgence)
  Définir RubriqueContentDTO minimal (rubrique_id + contenu_xml)
  Séparer RubriqueSerializer en DTO orientés flux (édition / navigation)
```

---

## 8. Audit de robustesse — flux critiques

> Sources : `documentation/views.py`, `documentation/services.py`, `documentation/exceptions.py`
>
> **Règle de référence** : `exceptions.py` définit un `custom_exception_handler` comme point de normalisation unique des erreurs. Il appelle le handler DRF standard, logue l'exception, et produit un fallback 500 `{"error": "...", "detail": "..."}` pour les exceptions non gérées par DRF. La règle implicite est : **toute exception doit remonter** jusqu'à ce handler ; aucune vue ne doit retourner une `Response` d'erreur directement sans passer par lui.
>
> **Légende** :
> - ✅ conforme
> - ⚠️ partiellement conforme ou incohérent
> - ❌ absent ou violation

---

### 8.1 Flux par flux

#### Flux 1 — Création de projet (`CreateProjectAPIView.post` — `views.py:719-861`)

| Critère | État | Preuve code | Détail |
|---------|------|-------------|--------|
| Transaction | ✅ | `views.py:722` | `@transaction.atomic` sur `post()` — séquence complète atomique |
| Validations métier | ✅ | `views.py:731-736`, `views.py:779-783` | Sérializer projet + sérializer map validés explicitement |
| Logs | ⚠️ | `views.py:729` | `logger.error("[DEBUG][CreateProject]...")` — niveau `error` utilisé pour un log de debug |
| Format erreurs — validation | ⚠️ | `views.py:731-736` | `return Response({"error": ..., "fields": ...}, 400)` avant le try — format maison, court-circuite `custom_exception_handler` |
| Format erreurs — ValidationError | ⚠️ | `views.py:852-854` | `raise e` → remonte vers `custom_exception_handler` — format DRF standard (`{"detail": ...}`) — **différent** du format avant-try |
| Format erreurs — Exception | ⚠️ | `views.py:856-861` | `return Response({"error": "Erreur interne", "detail": str(e)}, 500)` — format maison, court-circuite `custom_exception_handler` |
| Écarts exceptions.py | ❌ | `views.py:731-861` | **3 chemins de sortie d'erreur** depuis un seul handler, avec 3 formats différents |

**Note complémentaire** : `Rubrique.objects.create(...)` ligne 796 ne passe pas `contenu_xml`. Django `TextField` vaudra `""`. `Rubrique.clean()` (`models.py:161`) validerait `ET.fromstring("")` → `ParseError`. Mais `objects.create()` n'appelle pas `full_clean()` — la validation XML est silencieusement court-circuitée sur la rubrique racine.

---

#### Flux 2 — Création de rubrique dans map (`MapViewSet.structure_create` — `views.py:481-497`)

| Critère | État | Preuve code | Détail |
|---------|------|-------------|--------|
| Transaction | ✅ | `services.py:83` | `@transaction.atomic` dans `create_rubrique_in_map()` |
| Validations métier | ✅ | `services.py:99-146` | insert_after/before exclusifs, map existe, version active, parent dans map, ancre cohérente |
| Logs | ⚠️ | `services.py:188-194` | Un seul `logger.info` en fin de service ; aucun log d'erreur en vue (tout délégué à `custom_exception_handler`) |
| Format erreurs | ✅ | `views.py:484` | `raise_exception=True` + pas de try/except → propagation vers `custom_exception_handler` |
| Écarts exceptions.py | ✅ | — | Conforme — le handler canonique est le seul point de sortie |

**Note** : l'action doublon `create_rubrique` (`views.py:537-571`) a un `try/except` manuel avec format `{"error": "Erreur métier", ...}` — **comportement d'erreur différent** pour la même opération selon la route appelée.

---

#### Flux 3 — Attach de rubrique dans map (`add_rubrique_to_map_view` — `views.py:325-368`)

| Critère | État | Preuve code | Détail |
|---------|------|-------------|--------|
| Transaction | ✅ | `services.py:13` | `@transaction.atomic` dans `add_rubrique_to_map()` |
| Validations métier | ✅ | `services.py:29-55` | Map existe, rubrique existe, même projet, parent dans map, doublon interdit |
| Logs | ⚠️ | `views.py:367` | `logger.exception` uniquement sur `Exception` générique ; aucun log sur `ValidationError` ; aucun log de succès en vue |
| Format erreurs — ValidationError | ❌ | `views.py:359-364` | `return Response({"error": "Erreur métier", "fields"/"detail": ...}, 400)` — `custom_exception_handler` **complètement contourné** |
| Format erreurs — Exception | ❌ | `views.py:366-368` | `return Response({"error": "Erreur interne", "detail": str(e)}, 500)` — `custom_exception_handler` **contourné** |
| Écarts exceptions.py | ❌ | `views.py:359-368` | `custom_exception_handler` n'est jamais appelé depuis ce handler — ni pour ValidationError ni pour Exception |

---

#### Flux 4 — Reorder (`MapViewSet.structure_reorder` — `views.py:499-511`)

| Critère | État | Preuve code | Détail |
|---------|------|-------------|--------|
| Transaction | ✅ | `services.py:314` | `@transaction.atomic` + `select_for_update()` |
| Validations métier | ✅ | `services.py:324-341` | Liste non vide, tous IDs dans map/parent, count cohérent, pas de doublons |
| Logs | ❌ | `services.py:314-348` | **Aucun log** de succès ni d'erreur dans le service ni dans la vue |
| Format erreurs | ✅ | `views.py:502` | `raise_exception=True` + pas de try/except → propagation vers `custom_exception_handler` |
| Écarts exceptions.py | ✅ | — | Conforme pour le chemin d'erreur |

**Note performance** : `reorder_map_rubriques` effectue un `mr.save()` individuel par élément dans la boucle (`services.py:346-348`). Un `bulk_update()` serait plus efficace pour des reorders larges.

---

#### Flux 5 — Indent (`MapViewSet.structure_indent` — `views.py:513-523`)

| Critère | État | Preuve code | Détail |
|---------|------|-------------|--------|
| Transaction | ✅ | `services.py:199` | `@transaction.atomic` + `select_for_update()` sur cible et siblings |
| Validations métier | ✅ | `services.py:208-235` | Élément existe dans la map, a un frère précédent (index > 0) |
| Logs | ❌ | `services.py:199-254` | Aucun `logger.info` après `mr.save()` — opération silencieuse |
| Format erreurs | ✅ | `views.py:518-523` | Pas de try/except → propagation vers `custom_exception_handler` |
| Écarts exceptions.py | ✅ | — | Conforme |

---

#### Flux 6 — Outdent (`MapViewSet.structure_outdent` — `views.py:525-535`)

| Critère | État | Preuve code | Détail |
|---------|------|-------------|--------|
| Transaction | ✅ | `services.py:257` | `@transaction.atomic` + `select_for_update()` sur cible, parent et siblings du futur niveau |
| Validations métier | ✅ | `services.py:265-293` | Élément existe, a un parent (non racine), parent cohérent dans la map |
| Logs | ❌ | `services.py:257-311` | Aucun `logger.info` après `mr.save()` — opération silencieuse |
| Format erreurs | ✅ | `views.py:530-535` | Pas de try/except → propagation vers `custom_exception_handler` |
| Écarts exceptions.py | ✅ | — | Conforme |

---

#### Flux 7 — Update rubrique (`RubriqueViewSet.update` — `views.py:681-716`)

| Critère | État | Preuve code | Détail |
|---------|------|-------------|--------|
| Transaction | ✅ | `views.py:694` | `with transaction.atomic()` + `select_for_update()` |
| Validations métier | ✅ | `views.py:702-706` | `version_projet.projet == projet` vérifié explicitement |
| Logs | ✅ | `views.py:709-711`, `views.py:714` | Log succès + log exception |
| Format erreurs — validation | ⚠️ | `views.py:687-691` | `return Response({"error": ..., "fields": ...}, 400)` — format maison, court-circuite `custom_exception_handler` |
| Format erreurs — Exception | ⚠️ | `views.py:713-715` | `return Response({"error": "Erreur interne", "detail": str(e)}, 500)` — format maison, court-circuite `custom_exception_handler` |
| Écarts exceptions.py | ⚠️ | `views.py:686-715` | Exception catch manuel — `custom_exception_handler` contourné pour les exceptions inattendues |

---

### 8.2 Problème transversal : les permissions des vues compat

Les vues de compatibilité `MapRubriqueIndentView`, `MapRubriqueOutdentView` et `MapReorderCompatView` n'ont pas de `permission_classes` déclarées explicitement.

| Vue | Preuve code | `permission_classes` explicites |
|-----|-------------|--------------------------------|
| `MapRubriqueIndentView` | `views.py:575-587` | ❌ absentes — hérite du défaut global |
| `MapRubriqueOutdentView` | `views.py:591-603` | ❌ absentes — hérite du défaut global |
| `MapReorderCompatView` | `views.py:607-636` | ❌ absentes — hérite du défaut global |
| `CreateProjectAPIView` | `views.py:720` | ✅ `[IsAuthenticated]` explicite |
| `MapViewSet` | `views.py:447` | ✅ `[IsAuthenticated]` explicite |
| `RubriqueViewSet` | `views.py:647` | ✅ `[IsAuthenticated]` explicite |

Ces vues sont **sécurisées uniquement si** `DEFAULT_PERMISSION_CLASSES = [IsAuthenticated]` est configuré globalement dans `settings.py`. L'absence de déclaration explicite est une dépendance implicite à la configuration globale — risque si cette configuration venait à changer.

---

### 8.3 Synthèse robustesse

#### Tableau récapitulatif par flux

| Flux | Transaction | Validations | Logs succès | Format erreurs | Permissions |
|------|------------|-------------|-------------|----------------|-------------|
| Création projet | ✅ | ✅ | ✅ | ❌ 3 formats | ✅ |
| Création rubrique dans map | ✅ | ✅ | ⚠️ minimal | ✅ | ✅ |
| Attach rubrique | ✅ | ✅ | ❌ | ❌ handler contourné | ⚠️ implicite |
| Reorder | ✅ | ✅ | ❌ | ✅ | ✅ |
| Indent | ✅ | ✅ | ❌ | ✅ | ✅ |
| Outdent | ✅ | ✅ | ❌ | ✅ | ✅ |
| Update rubrique | ✅ | ✅ | ✅ | ⚠️ 2 formats | ✅ |

#### Problèmes transversaux

| # | Problème | Preuve code | Criticité |
|---|---------|-------------|-----------|
| R-1 | **4 formats de réponse d'erreur coexistent** : DRF standard, `{"error":..., "fields":...}` maison, `{"error":..., "detail":...}` maison | `views.py:733`, `views.py:852`, `views.py:858` | 🟠 Important |
| R-2 | `custom_exception_handler` contourné dans `add_rubrique_to_map_view` — `ValidationError` et `Exception` gérées manuellement | `views.py:359-368` | 🟠 Important |
| R-3 | `custom_exception_handler` partiellement contourné dans `CreateProjectAPIView` — `Exception` gérée manuellement | `views.py:856-861` | 🟠 Important |
| R-4 | `custom_exception_handler` partiellement contourné dans `RubriqueViewSet.update` — `Exception` gérée manuellement | `views.py:713-715` | 🟠 Important |
| R-5 | `logger.error` utilisé pour un log de debug (`[DEBUG][CreateProject]`) | `views.py:729` | 🟡 Amélioration |
| R-6 | Aucun log de succès pour reorder, indent, outdent | `services.py:314-348`, `services.py:199-254`, `services.py:257-311` | 🟡 Amélioration |
| R-7 | Vues compat sans `permission_classes` explicites | `views.py:575`, `views.py:591`, `views.py:607` | 🟠 Important |
| R-8 | `Rubrique.clean()` non appelée sur `objects.create()` — rubrique racine créée avec `contenu_xml=""` invalide | `views.py:796-801`, `models.py:161-166` | 🟠 Important |
| R-9 | Doublon `create_rubrique` vs `structure_create` : comportement d'erreur **différent** pour la même opération selon la route | `views.py:481-497` vs `views.py:537-571` | 🟠 Important |
| R-10 | `reorder_map_rubriques` : N `save()` individuels en boucle au lieu d'un `bulk_update()` | `services.py:346-348` | 🟡 Amélioration |

---

### 8.4 Format d'erreur canonique attendu (rappel exceptions.py)

`exceptions.py` produit deux formats selon le type d'exception :

```python
# Via DRF exception_handler (ValidationError, etc.)
→ {"field": ["message"]}       # format DRF natif

# Via fallback générique (Exception non reconnue par DRF)
→ {"error": "Une erreur interne est survenue.", "detail": str(exc)}
```

**Formats effectivement émis dans le code (4 en circulation) :**

| Format | Exemple | Émis par |
|--------|---------|----------|
| DRF standard | `{"field": ["msg"]}` | `structure_create`, `structure_reorder`, `structure_indent`, `structure_outdent` |
| Maison validation | `{"error": "Erreur de validation", "fields": {...}}` | `CreateProjectAPIView`, `RubriqueViewSet.create`, `RubriqueViewSet.update`, `create_rubrique` |
| Maison métier | `{"error": "Erreur métier", "fields"/"detail": ...}` | `add_rubrique_to_map_view`, `create_rubrique` |
| Maison interne | `{"error": "Erreur interne", "detail": str(e)}` | `CreateProjectAPIView`, `RubriqueViewSet.create`, `RubriqueViewSet.update`, `add_rubrique_to_map_view`, `create_rubrique` |

Le frontend reçoit des formats d'erreur différents selon la route appelée pour la même opération.

---

> **Dernière mise à jour** : 2026-04-09
>
> **Auteur** : audit automatisé sur code réel — à valider par Christophe
