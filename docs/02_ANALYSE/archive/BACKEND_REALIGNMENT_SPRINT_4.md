# BACKEND_REALIGNMENT_SPRINT_4.md

> **Statut** : plan d’implémentation — Sprint 4 (Migration frontend + suppressions contrôlées)
>
> **Objectif principal** : finaliser la sortie du transitoire en migrant le frontend vers les routes canoniques, puis supprimer les routes et handlers de compatibilité backend
>
> **Pré-requis** : Sprint 1, Sprint 2 et Sprint 3 validés
>
> **Principe clé** : aucune suppression backend avant preuve de migration frontend

---

## 1. Objectif du sprint

Finaliser le réalignement backend/frontend sur les routes canoniques en 3 temps :

1. migrer le frontend vers les endpoints canoniques ;
2. valider que les routes historiques ne sont plus appelées ;
3. supprimer les handlers et routes de compatibilité backend.

Ce sprint est le plus sensible de la séquence. Il doit être exécuté par étapes, avec validation intermédiaire obligatoire.

---

## 2. Risques à maîtriser

### R-1 — Suppression trop tôt

Risque : suppression d’une route encore utilisée par le frontend.

➡️ Interdit : aucune suppression backend sans preuve que le frontend n’appelle plus la route.

---

### R-2 — Régression sur LeftSidebar

Risque : la migration des appels structurels casse :
- création de rubrique
- indentation
- désindentation
- reorder
- chargement structure

➡️ Tous les flux LeftSidebar doivent être retestés après migration.

---

### R-3 — Mélange frontend + backend dans un seul lot non vérifié

➡️ Exécuter le sprint en deux phases strictes :
- Phase A : migration frontend
- Phase B : suppression backend

---

### R-4 — Contrats de réponse différents

Risque : la route canonique ne renvoie pas tout à fait le même contrat que la route legacy.

➡️ Vérifier explicitement les payloads consommés côté frontend avant suppression.

---

## 3. Phase A — Migration frontend vers les routes canoniques

### 3.1 Objectif

Remplacer dans le frontend tous les appels legacy encore actifs par leurs équivalents canoniques.

---

### 3.2 Routes à migrer

| Usage frontend | Route legacy | Route canonique cible |
|---|---|---|
| Création rubrique dans map | `/api/maps/${id}/create-rubrique/` | `/api/maps/${id}/structure/create` |
| Indent | `/api/map-rubriques/${id}/indent/` | `/api/maps/${mapId}/structure/${id}/indent` |
| Outdent | `/api/map-rubriques/${id}/outdent/` | `/api/maps/${mapId}/structure/${id}/outdent` |
| Reorder | `/api/maps/${mapId}/reorder/` | `/api/maps/${mapId}/structure/reorder` |
| Attach rubrique existante | `/api/map-rubriques/` ou `/api/maps/${id}/rubriques/` | `/api/maps/${id}/structure/attach/` |
| Création projet | `/projet/create/` | `/api/projets/` |

---

### 3.3 Cibles frontend probables

À vérifier dans le code réel avant modification :

- `LeftSidebar.tsx`
- services API frontend associés
- hooks ou wrappers autour d’Axios
- éventuels tests frontend

---

### 3.4 Travail demandé

#### A-1 — cartographie frontend réelle

Avant toute modification, identifier précisément :
- fichiers appelants
- fonctions concernées
- payloads envoyés
- réponses attendues

#### A-2 — migration progressive

Migrer une famille d’appels à la fois :
1. `create-rubrique` → `structure/create`
2. `indent` / `outdent`
3. `reorder`
4. `attach`
5. création projet

#### A-3 — validation immédiate après chaque migration

Après chaque sous-lot :
- test manuel ou automatisé
- vérification du comportement UI
- vérification des erreurs API

---

### 3.5 Contraintes

- Ne pas changer le comportement UI attendu.
- Ne pas déplacer de logique métier vers le frontend.
- Garder les ids métier inchangés.
- Si une réponse backend canonique diffère légèrement, adapter le frontend avec précision minimale.

---

### 3.6 Critères de validation Phase A

- Le frontend n’appelle plus aucune route legacy ciblée.
- Les flux LeftSidebar restent opérationnels.
- La création projet fonctionne via `POST /api/projets/`.
- Aucun appel réseau 404/400 inattendu sur les flux migrés.

---

## 4. Phase B — Suppression backend des routes de compatibilité

### 4.1 Objectif

Supprimer les endpoints legacy une fois la migration frontend confirmée.

---

### 4.2 Éléments backend à supprimer

| Élément | Type | Remplacé par |
|---|---|---|
| `MapViewSet.create_rubrique` | action ViewSet | `MapViewSet.structure_create` |
| `add_rubrique_to_map_view` | FBV | `MapViewSet.structure_attach` |
| `MapRubriqueIndentView` | APIView compat | `MapViewSet.structure_indent` |
| `MapRubriqueOutdentView` | APIView compat | `MapViewSet.structure_outdent` |
| `MapReorderCompatView` | APIView compat | `MapViewSet.structure_reorder` |
| route `/projet/create/` | compat | `POST /api/projets/` |

---

### 4.3 Travail demandé

#### B-1 — suppression ciblée dans `views.py`

Supprimer uniquement les handlers explicitement remplacés.

#### B-2 — suppression ciblée dans `urls.py`

Retirer les routes legacy correspondantes.

#### B-3 — nettoyage imports et tests

Supprimer les imports devenus inutiles et adapter les tests backend.

---

### 4.4 Contraintes

- Ne supprimer qu’après validation de la Phase A.
- Vérifier qu’aucun test backend ou frontend ne référence encore les routes legacy.
- Conserver les routes canoniques comme seule façade publique.

---

### 4.5 Critères de validation Phase B

- Les routes legacy ne sont plus résolubles.
- Les routes canoniques couvrent 100 % des flux utiles.
- Aucun handler de compatibilité ne subsiste dans `views.py` ou `urls.py`.

---

## 5. Phase C — Validation finale post-suppression

### 5.1 Objectif

Vérifier que le système fonctionne encore intégralement après retrait du legacy.

---

### 5.2 Vérifications obligatoires

#### Frontend
- ouverture projet
- chargement structure
- sélection rubrique
- création rubrique
- indentation
- désindentation
- reorder drag & drop
- création projet

#### Backend
- routes legacy absentes
- routes canoniques fonctionnelles
- erreurs homogènes
- permissions explicites toujours en place

---

### 5.3 Critères de validation Phase C

- Aucun appel frontend vers route supprimée
- Aucun 404 inattendu
- Tous les tests critiques passent

---

## 6. Tests minimums attendus

### Backend
- route legacy supprimée → non résoluble
- route canonique équivalente → OK
- création projet via `/api/projets/` → OK
- attach / create / reorder / indent / outdent → OK

### Frontend
- tests ou vérifications manuelles sur LeftSidebar
- création projet via UI
- absence d’appel réseau legacy

---

## 7. Définition de terminé

Le sprint est terminé si :

- le frontend n’utilise plus les routes legacy ciblées ;
- les routes backend de compatibilité ont été supprimées ;
- les flux documentaires restent opérationnels ;
- `/api/projets/` est l’unique porte d’entrée de création projet ;
- `/projet/create/` n’existe plus.

---

## 8. Hors scope

- refonte DTO complète
- normalisation métier du contenu XML racine vide
- nettoyage avancé serializers orientés flux

---

## 9. Ordre d’exécution recommandé

```text
Étape 1 — Cartographie frontend réelle des appels legacy
Étape 2 — Migration frontend create-rubrique
Étape 3 — Migration frontend indent/outdent/reorder
Étape 4 — Migration frontend attach
Étape 5 — Migration frontend création projet
Étape 6 — Validation manuelle + tests
Étape 7 — Suppression backend des handlers legacy
Étape 8 — Suppression backend des routes legacy
Étape 9 — Validation finale post-suppression
```

---

## 10. Note de gouvernance

Toute suppression effective d’une route doit être considérée comme une décision de sortie du transitoire.

Si une ambiguïté apparaît pendant la migration frontend, arrêter la suppression et documenter le point dans `BACKEND_GAP_ANALYSIS.md` ou dans le suivi de refonte avant de poursuivre.

