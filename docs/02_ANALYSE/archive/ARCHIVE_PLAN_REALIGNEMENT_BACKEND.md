# Documentum – Plan d’action Backend

## Réalignement sur le référentiel canonique

> **Base** : Documentum – Suivi projet backend (validations & ajustements) \
> **Objectif** : exécuter un réalignement backend maîtrisé, priorisé et testable, afin de supprimer les ambiguïtés d’API, stabiliser la structure documentaire et permettre l’allègement du frontend.

---

## 0. Principes d’exécution

- **Backend d’abord** : aucune correction frontend structurelle tant que les endpoints canoniques ne sont pas en place.
- **Zéro ambiguïté structure / contenu** :
  - `MapRubrique` = structure interne
  - `Rubrique` = contenu
- **Déploiement progressif** : introduction des endpoints canoniques **en parallèle** (compat), puis dépréciation/suppression.
- **Qualité minimale obligatoire** : erreurs normalisées, transactions, logs structurés.

---

## 1. Phase 1 — Verrouillage du référentiel et gel de périmètre

### 1.1 Livrable

- **Référentiel backend canonique** : validé définitivement.

### 1.2 Actions

-

### 1.3 Critères d’acceptation

- Un seul document canonique « fait foi ».
- Toute évolution backend doit référencer ce référentiel.

### 1.4 Dépendances

- Aucune.

---

## 2. Phase 2 — Suppression des doublons critiques (zéro risque fonctionnel)

### 2.1 Chantier A — Maps : supprimer le doublon `/api/maps/`

**Contexte** : coexistence `MapViewSet` et `CreateMapView` sur la même route.

#### Actions

-

#### Critères d’acceptation

- Une seule route `/api/maps/` mappée vers `MapViewSet`.
- Les opérations existantes sur les maps fonctionnent comme avant.

#### Risques / rollback

- Risque faible : si un comportement spécifique dépendait de `CreateMapView`.
- Rollback : restaurer la view et corriger son chemin (mais l’objectif reste la suppression).

---

## 3. Phase 3 — Création de projet canonique (invariants garantis)

### 3.1 Objectif

- **Une seule porte d’entrée** : `POST /api/projets/`.
- Garantie : version active + map master + rubrique racine + MapRubrique racine.

### 3.2 Actions

-

### 3.3 Etat réel
✅ POST /api/projets/ ne permet plus de création incomplète
✅ protection mise en place
❌ orchestration canonique pas encore migrée dans ProjetViewSet.create()
❌ /projet/create/ encore nécessaire

### 3.4 Critères d’acceptation (tests fonctionnels)

- Créer un projet via `POST /api/projets/` produit systématiquement :
  - 1 version active
  - 1 map master
  - 1 rubrique racine
  - 1 MapRubrique racine
- Aucun projet ne peut être créé « incomplet ».

### 3.5 Dépendances

- Phase 1 validée.

### 3.6 Risques / rollback

- Risque : impacts sur le frontend qui utilisait `/projet/create/`.
- Mitigation : garder un alias temporaire (optionnel) ou mettre à jour le frontend **après** stabilisation.

---

## 4. Phase 4 — Structure documentaire : endpoints canoniques (MapRubrique non exposé)

### 4.1 Objectif

Fournir une API structure **cohérente**, centrée sur la map, sans exposition directe de `MapRubrique`.

### 4.2 Endpoints canoniques à implémenter

- `GET /api/projets/{id}/structure/` (déjà en place côté front)
- `GET /api/maps/{id}/structure/`
- `POST /api/maps/{id}/structure/create/`
- `POST /api/maps/{id}/structure/attach/`
- `POST /api/maps/{id}/structure/reorder/`
- `POST /api/maps/{id}/structure/{mapRubriqueId}/indent`
- (à ajouter pour cohérence) `POST /api/maps/{id}/structure/{mapRubriqueId}/outdent`

> Remarque : le frontend actuel appelle des endpoints inexistants : indent/outdent/reorder (404). C’est **bloquant**.

### 4.3 Etat actuel
✅ GET /api/maps/{id}/structure/ implémenté
✅ POST /api/maps/{id}/structure/create/ implémenté
✅ POST /api/maps/{id}/structure/reorder/ implémenté
✅ POST /api/maps/{id}/structure/{mapRubriqueId}/indent implémenté
✅ POST /api/maps/{id}/structure/{mapRubriqueId}/outdent implémenté
✅ routes de compatibilité ajoutées pour le frontend historique
❌ POST /api/maps/{id}/structure/attach/ encore manquant

### 4.4 Actions (ordonnées)

#### A) Lecture structure map

-

#### B) Création dans la structure

-

#### C) Attacher une rubrique existante

-

#### D) Réordonner

-

#### E) Indent / Outdent

-

#### F) Dépréciation des anciens endpoints

-

### 4.5 Critères d’acceptation

- Les opérations structurelles ne renvoient plus 404.
- Aucun endpoint public ne manipule `MapRubrique` en CRUD.
- Les services structurants sont utilisés (pas de duplication métier).

### 4.6 Dépendances

- Phase 2 (maps) terminée.
- Phase 3 (création projet) recommandée avant, mais pas strictement bloquante.

### 4.7 Risques / rollback

- Risque : payload reorder mal défini.
- Mitigation : commencer par un payload minimal (liste ordonnée) + tests.

---

## 5. Phase 5 — Contenu documentaire : verrouillage des invariants

### 5.1 Objectif

Assurer l’étanchéité totale : structure ≠ contenu.

### 5.2 Actions

-

### 5.3 Critères d’acceptation

- Une sauvegarde de contenu ne change pas les liens `MapRubrique`.
- Les réponses d’erreur respectent le format standard.

### 5.4 Dépendances

- Aucune (mais préférable après Phase 4).

---

## 6. Phase 6 — DTO & contrats d’API (normalisation progressive)

### 6.1 Objectif

Rendre les DTO **orientés flux** : navigation / édition / publication.

### 6.2 Actions

-

### 6.3 Critères d’acceptation

- Chaque endpoint critique a un contrat clair, stable et documenté.

---

## 7. Phase 7 — Robustesse : erreurs, transactions, logs

### 7.1 Objectif

Garantir la robustesse des opérations critiques (structure & création).

### 7.2 Actions

-

### 7.3 Critères d’acceptation

- Toute erreur métier remonte au format standard.
- Les logs permettent de diagnostiquer un échec d’opération structurelle.

---

## 8. Dépendances et ordre d’exécution recommandé

1. Phase 1 — Référentiel (validation)
2. Phase 2 — Doublons maps (suppression)
3. Phase 3 — Création projet canonique
4. Phase 4 — Endpoints structure canoniques (priorité haute)
5. Phase 5 — Verrouillage contenu
6. Phase 7 — Robustesse (en parallèle Phase 4/5)
7. Phase 6 — DTO (progressif, après stabilisation)

---

## 9. Checkpoints (gates) avant passage au frontend

**Gate 1 — Structure opérationnelle**

- `GET /api/maps/{id}/structure/` OK
- `POST /structure/reorder/` OK
- `POST /indent/` + `/outdent/` OK

**Gate 2 — Création projet canonique**

- `/projet/create/` supprimé
- `POST /api/projets/` garantit les invariants
- Gate 2 non franchie
- état intermédiaire : création projet sécurisée mais non canonisée

**Gate 3 — Contrats stables**

- DTO structure et contenu validés
- erreurs normalisées

Une fois ces gates passés, le frontend peut :

- migrer vers les endpoints canoniques
- alléger LeftSidebar

---

**Fin du plan d’action backend**

