# BACKEND_REALIGNMENT_SPRINT_2.md

> **Statut** : plan d’implémentation — Sprint 2
>
> **Objectif principal** : canonisation de la création de projet
>
> **Contraintes majeures** :
>
> * Aucune rupture frontend
> * Conservation des invariants métier
> * Maintien temporaire des routes de compatibilité
>
> **Source** : BACKEND_GAP_ANALYSIS.md

---

## 1. Objectif du sprint

Aligner définitivement la création de projet sur le référentiel canonique en :

1. extrayant l’orchestration dans un service métier dédié `create_project()` ;
2. migrant `POST /api/projets/` pour utiliser ce service ;
3. conservant `/projet/create/` en compatibilité transitoire ;
4. préparant la suppression sans rupture.

---

## 2. Risques à maîtriser (critique)

### R-1 — Création partielle

Risque : création d’un projet sans :

* version active
* map master
* rubrique racine
* MapRubrique racine

➡️ Interdit : toute création doit rester atomique.

---

### R-2 — Double logique concurrente

Risque :

* logique dans `CreateProjectAPIView`
* logique dans `ProjetViewSet.create()`

➡️ Une seule source de vérité : le service `create_project()`.

---

### R-3 — Rupture frontend

Risque : le frontend appelle encore `/projet/create/`

➡️ Action : ne pas supprimer cette route dans ce sprint.

---

### R-4 — Régression des invariants

➡️ Tous les invariants actuels doivent être conservés strictement.

---

## 3. Lot 1 — Extraction du service create_project()

### 3.1 Objectif

Créer une fonction métier unique responsable de la création complète d’un projet.

---

### 3.2 Fichier cible

`documentation/services.py`

---

### 3.3 Signature attendue

```python
def create_project(*, data, user):
    ...
```

---

### 3.4 Invariants obligatoires

La fonction doit créer, dans une transaction unique :

1. Projet
2. VersionProjet active
3. Map master
4. Rubrique racine
5. MapRubrique racine

---

### 3.5 Contraintes

* Utiliser `@transaction.atomic`
* Aucune création partielle autorisée
* Ne pas appeler directement serializers dans le service
* Lever des `ValidationError` DRF

---

### 3.6 Critères de validation

* Une seule fonction contient toute l’orchestration
* Aucun duplicat de logique dans les vues

---

## 4. Lot 2 — Migration de ProjetViewSet.create()

### 4.1 Objectif

Faire de `POST /api/projets/` la vraie porte d’entrée canonique.

---

### 4.2 Fichier cible

`documentation/views.py`

---

### 4.3 Travail attendu

* Remplacer la logique actuelle (ValidationError volontaire)
* Appeler `create_project()`

---

### 4.4 Contraintes

* Conserver `serializer.is_valid(raise_exception=True)`
* Injecter `request.user`
* Ne pas dupliquer la logique métier

---

### 4.5 Critères de validation

* `POST /api/projets/` crée un projet complet
* Respect strict des invariants

---

## 5. Lot 3 — Adaptation de CreateProjectAPIView

### 5.1 Objectif

Transformer `/projet/create/` en simple proxy temporaire.

---

### 5.2 Travail attendu

* Supprimer toute logique métier interne
* Appeler `create_project()`

---

### 5.3 Contraintes

* Ne pas modifier la signature attendue par le frontend
* Conserver le format de réponse actuel

---

### 5.4 Critères de validation

* `/projet/create/` continue de fonctionner
* Les deux routes produisent le même résultat

---

## 6. Lot 4 — Alignement des réponses

### 6.1 Objectif

Garantir que :

* `/api/projets/`
* `/projet/create/`

retournent des réponses cohérentes.

---

### 6.2 Contraintes

* Ne pas casser le frontend existant
* Ne pas introduire de nouveau format

---

## 7. Tests obligatoires

### T-01 — création canonique

* POST /api/projets/
* vérifie tous les objets créés

### T-02 — création compat

* POST /projet/create/
* même résultat que T-01

### T-03 — atomicité

* simuler une erreur
* vérifier rollback complet

### T-04 — invariants

* version active unique
* map master présente

---

## 8. Définition de terminé

Le sprint est validé si :

* `create_project()` existe et est utilisé
* `/api/projets/` est pleinement fonctionnel
* `/projet/create/` fonctionne toujours
* aucun doublon de logique métier
* tous les tests passent

---

## 9. Ce qui reste volontairement hors scope

* suppression de `/projet/create/`
* nettoyage des routes historiques
* refonte DTO
