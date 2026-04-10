# BACKEND_REALIGNMENT_SPRINT_3.md

> **Statut** : plan d’implémentation — Sprint 3 (Nettoyage contrôlé)
>
> **Objectif principal** : réduire la surface d’API et supprimer le code mort **sans rupture frontend**
>
> **Pré-requis** : Sprint 1 et Sprint 2 validés
>
> **Principe clé** : aucune suppression d’une route encore consommée

---

## 1. Objectif du sprint

Nettoyer le backend en supprimant :
- le code mort (routes inatteignables)
- les doublons évidents
- les incohérences de sécurité (permissions implicites)

Tout en :
- conservant les routes de compatibilité réellement utilisées
- ne modifiant pas les contrats frontend actifs

---

## 2. Risques à maîtriser

### R-1 — Suppression d’une route encore utilisée
➡️ Toujours vérifier via logs/tests avant suppression

### R-2 — Régression silencieuse
➡️ Couvrir chaque suppression par un test ou une vérification explicite

### R-3 — Effet domino
➡️ Supprimer uniquement ce qui est prouvé comme mort ou doublon exact

---

## 3. Lot 1 — Suppression du code mort

### 3.1 Objectif

Supprimer les handlers enregistrés mais jamais atteints (dead code)

---

### 3.2 Éléments ciblés

- `CreateMapView` (urls.py)
- `map_rubriques_view` (si confirmé mort)

---

### 3.3 Travail demandé

- supprimer les entrées correspondantes dans `urls.py`
- supprimer les vues associées si non référencées ailleurs

---

### 3.4 Contraintes

- vérifier que ces routes ne sont jamais appelées
- s’appuyer sur l’audit des routes

---

### 3.5 Critères de validation

- aucune route morte restante
- aucun impact sur les tests existants

---

## 4. Lot 2 — Nettoyage des doublons évidents

### 4.1 Objectif

Supprimer les doublons **non utilisés par le frontend**

---

### 4.2 Éléments ciblés

- `MapViewSet.create_rubrique`

---

### 4.3 Contraintes

- vérifier qu’aucun appel frontend n’utilise cette route

---

### 4.4 Critères de validation

- aucune régression fonctionnelle

---

## 5. Lot 3 — Sécurisation des vues compat

### 5.1 Objectif

Ajouter explicitement les permissions sur les vues legacy

---

### 5.2 Éléments ciblés

- `MapRubriqueIndentView`
- `MapRubriqueOutdentView`
- `MapReorderCompatView`

---

### 5.3 Travail demandé

Ajouter :

```python
permission_classes = [IsAuthenticated]
```

---

### 5.4 Critères de validation

- toutes les routes nécessitent authentification
- aucune dépendance implicite au settings global

---

## 6. Lot 4 — Nettoyage des imports

### 6.1 Objectif

Supprimer les imports inutiles suite aux refactorings

---

### 6.2 Fichiers ciblés

- `views.py`

---

### 6.3 Travail demandé

- supprimer les imports inutilisés : `VersionProjet`, `Rubrique`, `MapRubrique` (si non utilisés)

---

### 6.4 Critères de validation

- aucun warning linter
- aucun import cassé

---

## 7. Tests minimums

- vérification que toutes les routes actives fonctionnent
- vérification authentification obligatoire sur routes compat
- absence d’erreurs 404 inattendues

---

## 8. Définition de terminé

Le sprint est terminé si :

- aucun code mort identifié ne subsiste
- aucune route inutile n’est exposée
- toutes les vues sont sécurisées explicitement
- le backend reste 100% compatible avec le frontend

---

## 9. Hors scope

- suppression de `/projet/create/`
- suppression des routes compat frontend
- refonte DTO
