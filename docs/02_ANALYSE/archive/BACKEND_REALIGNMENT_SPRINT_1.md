# BACKEND_REALIGNMENT_SPRINT_1.md

> **Statut** : plan d’implémentation sprint court
>
> **Source d’entrée** : `BACKEND_GAP_ANALYSIS.md`
>
> **Objectif** : corriger les écarts backend à plus forte valeur immédiate, sans ouvrir un chantier trop large ni casser la compatibilité frontend existante.

---

## 1. Objectif du sprint

Stabiliser le backend Documentum sur trois axes prioritaires :

1. **uniformiser les erreurs backend** pour que toutes les routes critiques remontent un comportement cohérent ;
2. **protéger la suppression des rubriques** pour éviter une suppression structurelle implicite et silencieuse ;
3. **implémenter l’endpoint canonique `POST /api/maps/{id}/structure/attach/`** en parallèle des routes historiques.

Ce sprint ne traite **pas encore** :
- la migration complète de `POST /api/projets/`,
- la suppression des routes de compatibilité frontend,
- la normalisation complète des DTO,
- la suppression immédiate des endpoints historiques encore consommés par le frontend.

---

## 2. Références

- `BACKEND_GAP_ANALYSIS.md`
- `documentum_referentiel_backend_canonique.md`
- `documentum_plan_daction_backend_realignement_sur_referentiel_canonique.md`
- `documentum_suivi_projet_backend_validations_ajustements.md`
- `gov_decision-log.md`

---

## 3. Périmètre du sprint

### Inclus
- `documentation/views.py`
- `documentation/services.py`
- `documentation/serializers.py`
- `documentation/urls.py`
- `documentation/exceptions.py`
- tests backend associés

### Exclus
- frontend React
- migration de consommation des routes côté LeftSidebar
- suppression des routes de compatibilité encore utilisées
- refonte DTO complète
- création projet canonique (`POST /api/projets/`)

---

## 4. Lot 1 — Uniformisation des erreurs backend

### 4.1 Problème à corriger

Le backend expose plusieurs formats d’erreur différents selon les routes :
- DRF standard,
- format maison validation,
- format métier,
- format interne.

Certaines vues court-circuitent `custom_exception_handler` avec des `return Response(...)` manuels sur erreur.

### 4.2 Objectif cible

Toutes les routes critiques doivent :
- laisser remonter les `ValidationError` vers le pipeline DRF,
- éviter les `return Response(...)` manuels pour les erreurs,
- s’appuyer sur `custom_exception_handler` comme point de normalisation unique,
- conserver un format cohérent exploitable par le frontend.

### 4.3 Fichiers ciblés

- `documentation/views.py`
- `documentation/exceptions.py`

### 4.4 Flux concernés en priorité

1. `CreateProjectAPIView.post`
2. `add_rubrique_to_map_view`
3. `RubriqueViewSet.update`
4. si encore conservé : `MapViewSet.create_rubrique`

### 4.5 Travail demandé à ClaudeCode

#### Étape A — audit local du code à modifier
Identifier dans `views.py` tous les endroits où une erreur est renvoyée via :
- `return Response(..., status=400)`
- `return Response(..., status=500)`
- `except Exception`
- `except ValidationError`

#### Étape B — refactor
Transformer ces vues pour :
- lever des `ValidationError` DRF pour les erreurs métier/validation,
- supprimer les réponses d’erreur manuelles quand elles contournent `custom_exception_handler`,
- laisser les exceptions inattendues remonter,
- conserver les logs utiles sans dupliquer le traitement d’erreur.

#### Étape C — homogénéisation
Vérifier que les routes suivantes ont toutes un comportement homogène :
- `structure_create`
- `add_rubrique_to_map_view` ou son remplaçant
- `RubriqueViewSet.update`
- `CreateProjectAPIView.post`

### 4.6 Contraintes pour ClaudeCode

- Ne pas modifier le sens métier des validations existantes.
- Ne pas déplacer de logique métier vers le frontend.
- Utiliser `rest_framework.exceptions.ValidationError`.
- Ne pas introduire de nouveau format d’erreur.
- Préserver les logs utiles, mais supprimer les logs de debug au mauvais niveau (`logger.error` pour du debug).

### 4.7 Critères de validation

- Une erreur métier remonte de manière cohérente sur les routes critiques.
- Une exception inattendue passe par `custom_exception_handler`.
- Le frontend n’a plus à gérer plusieurs formats pour une même famille d’opérations.
- Les tests backend vérifient au moins :
  - erreur métier sur attach,
  - erreur métier sur update rubrique,
  - erreur inattendue simulée.

---

## 5. Lot 2 — Protection de DELETE /api/rubriques/{id}/

### 5.1 Problème à corriger

Aujourd’hui, `DELETE /api/rubriques/{id}/` peut supprimer une `Rubrique`, ce qui entraîne silencieusement la suppression en cascade des `MapRubrique` liés.

Le problème n’est pas la cascade SQL en elle-même, mais l’absence de garde métier explicite avant destruction.

### 5.2 Objectif cible

Un endpoint contenu ne doit pas provoquer une suppression structurelle implicite sans contrôle explicite.

Avant suppression d’une rubrique :
- vérifier si des `MapRubrique` liés existent ;
- si oui, refuser la suppression avec une erreur métier claire ;
- sinon, autoriser la suppression.

### 5.3 Fichiers ciblés

- `documentation/views.py`
- éventuellement `documentation/models.py` seulement si nécessaire, mais éviter de toucher au schéma si un contrôle de vue suffit

### 5.4 Travail demandé à ClaudeCode

#### Étape A — override explicite
Implémenter un `destroy()` explicite dans `RubriqueViewSet`.

#### Étape B — garde métier
Dans `destroy()` :
- récupérer la rubrique ciblée ;
- vérifier l’existence de `MapRubrique` liés ;
- si des liens existent, lever une `ValidationError` ou retourner une erreur métier normalisée via le pipeline DRF ;
- sinon, exécuter la suppression normale.

#### Étape C — message d’erreur
Prévoir un message clair du type :
- “Impossible de supprimer cette rubrique : elle est encore utilisée dans une structure documentaire.”

### 5.5 Contraintes pour ClaudeCode

- Ne pas casser les suppressions légitimes de rubriques orphelines.
- Ne pas modifier les FK ni les `on_delete` dans ce sprint.
- Ne pas masquer l’erreur par un code 500.
- Réutiliser la stratégie d’erreurs homogénéisée du lot 1.

### 5.6 Critères de validation

- `DELETE /api/rubriques/{id}/` sur une rubrique liée à une map → refus clair.
- `DELETE /api/rubriques/{id}/` sur une rubrique non liée → suppression OK.
- Aucun effet de bord structurel silencieux.
- Test backend dédié présent.

---

## 6. Lot 3 — Implémentation de POST /api/maps/{id}/structure/attach/

### 6.1 Problème à corriger

Le référentiel canonique attend un endpoint :
`POST /api/maps/{id}/structure/attach/`

Cet endpoint manque encore, alors que le service métier existe déjà (`add_rubrique_to_map()`).

Le backend conserve des routes non canoniques pour cette opération :
- `POST /api/map-rubriques/`
- `POST /api/maps/{id}/rubriques/`

### 6.2 Objectif cible

Ajouter l’endpoint canonique `structure/attach/` **sans supprimer les routes historiques dans ce sprint**.

### 6.3 Fichiers ciblés

- `documentation/views.py`
- `documentation/urls.py`
- `documentation/serializers.py` si besoin d’un serializer de payload plus adapté

### 6.4 Travail demandé à ClaudeCode

#### Étape A — créer l’action canonique
Ajouter dans `MapViewSet` une action :
- méthode `POST`
- route `structure/attach`
- payload attendu cohérent avec `add_rubrique_to_map()`

#### Étape B — brancher le service métier existant
L’action doit appeler :
- `add_rubrique_to_map(map_id=..., rubrique_id=..., parent_id=..., ordre=...)`

#### Étape C — validation
Réutiliser le serializer déjà en place si adapté, sinon créer un serializer orienté attach.

#### Étape D — réponse
Retourner une réponse cohérente avec les autres endpoints structurels.

### 6.5 Contraintes pour ClaudeCode

- Ne pas dupliquer la logique métier déjà présente dans `services.py`.
- Ne pas supprimer les routes historiques dans ce sprint.
- Ne pas exposer davantage `MapRubrique` qu’aujourd’hui.
- Garder la compatibilité frontend existante.

### 6.6 Critères de validation

- `POST /api/maps/{id}/structure/attach/` fonctionne.
- Attacher une rubrique d’un autre projet échoue proprement.
- Attacher deux fois la même rubrique échoue proprement.
- Les routes historiques restent opérationnelles tant que le frontend n’est pas migré.
- Test backend dédié présent.

---

## 7. Tests minimums attendus

### Lot 1 — erreurs
- erreur métier sur `structure/attach`
- erreur métier sur update rubrique
- exception inattendue sur une vue critique → format homogène

### Lot 2 — delete rubrique
- suppression refusée si `MapRubrique` lié
- suppression autorisée si aucun `MapRubrique` lié

### Lot 3 — attach
- attach valide
- attach d’une rubrique d’un autre projet → 400
- attach en doublon → 400

---

## 8. Définition de terminé

Le sprint est terminé si :

- les erreurs backend critiques sont homogénéisées ;
- `DELETE /api/rubriques/{id}/` est protégé contre la suppression structurelle implicite ;
- `POST /api/maps/{id}/structure/attach/` existe et fonctionne ;
- les tests backend minimums passent ;
- aucune route de compatibilité frontend n’a été supprimée prématurément.