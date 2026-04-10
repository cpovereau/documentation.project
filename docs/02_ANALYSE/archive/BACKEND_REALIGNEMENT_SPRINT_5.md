# BACKEND_REALIGNMENT_SPRINT_5.md

> **Statut** : plan d’implémentation — Sprint 5 (Stabilisation backend)
>
> **Objectif principal** : améliorer la qualité interne du backend sans modifier la façade canonique exposée
>
> **Pré-requis** : Sprint 1 à Sprint 4 validés
>
> **Principe clé** : aucune régression API, aucun changement de contrat frontend

---

## 1. Objectif du sprint

Stabiliser le backend Documentum sur trois axes complémentaires :

1. **logs métier propres**
2. **monitoring minimal utile**
3. **nettoyage progressif des serializers**

Ce sprint vise à améliorer :
- l’observabilité
- le diagnostic en cas d’échec
- la lisibilité du code
- la cohérence des flux backend

Sans :
- rouvrir un chantier de refonte structurelle
- modifier les routes canoniques
- casser les contrats frontend existants

---

## 2. Risques à maîtriser

### R-1 — Régression silencieuse sur les contrats API

➡️ Interdit : modifier les payloads ou réponses consommés par le frontend sans validation explicite.

---

### R-2 — Logging trop bavard ou inutile

➡️ Les logs doivent être :
- structurés
- ciblés
- utiles au diagnostic

Pas de spam, pas de bruit, pas de logs décoratifs.

---

### R-3 — Monitoring confondu avec un chantier d’infra

➡️ Ce sprint ne met pas en place une stack lourde.
On vise un **monitoring léger, immédiatement utile**.

---

### R-4 — Nettoyage serializers trop agressif

➡️ Ne pas splitter les serializers au point de casser les vues existantes.
Le nettoyage doit être progressif et justifié par les flux.

---

## 3. Lot 1 — Logs métier propres

### 3.1 Objectif

Rendre les opérations critiques backend lisibles dans les logs, avec un niveau cohérent et un contenu exploitable.

---

### 3.2 Flux à couvrir en priorité

- création projet (`create_project()`)
- création rubrique dans map (`create_rubrique_in_map()`)
- attach rubrique (`add_rubrique_to_map()`)
- reorder (`reorder_map_rubriques()`)
- indent / outdent
- update rubrique (`RubriqueViewSet.update()`)
- delete rubrique protégé (`RubriqueViewSet.destroy()`)

---

### 3.3 Résultat attendu

Pour chaque flux critique :
- un log d’entrée utile si nécessaire
- un log de succès métier
- un log d’échec exploitable
- pas de doublon entre vue et service

---

### 3.4 Règles à appliquer

- `logger.info(...)` pour succès métier significatif
- `logger.warning(...)` pour refus métier attendus / validations bloquantes
- `logger.exception(...)` pour exceptions inattendues
- pas de `logger.error("[DEBUG]...")`
- pas de log contenant du bruit inutile

---

### 3.5 Contraintes

- inclure des identifiants utiles : `project_id`, `map_id`, `rubrique_id`, `map_rubrique_id`, `user_id`
- ne jamais logger de contenu XML complet
- ne pas dupliquer la même information dans plusieurs couches

---

### 3.6 Critères de validation

- chaque opération critique laisse une trace utile dans les logs
- les échecs sont diagnostiquables sans lecture intrusive du code
- aucun log de debug parasite ne subsiste

---

## 4. Lot 2 — Monitoring minimal utile

### 4.1 Objectif

Mettre en place un monitoring léger permettant de suivre l’état du backend sans déployer une infrastructure lourde.

---

### 4.2 Périmètre visé

Monitoring de base orienté exploitation :
- visibilité sur les erreurs 4xx / 5xx
- visibilité sur les flux critiques backend
- point simple de vérification de santé si absent

---

### 4.3 Options possibles (à choisir selon l’existant)

#### Option A — Healthcheck minimal
- endpoint simple de santé backend
- vérifie au minimum que l’application répond

#### Option B — Comptage / traces simples dans les logs
- nombre d’échecs sur certains flux
- logs structurés faciles à filtrer

#### Option C — Préparation monitoring futur
- tags ou messages suffisamment standardisés pour brancher plus tard un vrai monitoring

---

### 4.4 Contraintes

- ne pas introduire de dépendance lourde inutile dans ce sprint
- rester compatible avec l’exploitation actuelle du projet
- viser le concret, pas la sophistication

---

### 4.5 Critères de validation

- il existe au moins un point simple de contrôle de santé ou d’état
- les logs permettent d’identifier rapidement une panne fonctionnelle critique
- la base est prête pour un monitoring plus avancé plus tard

---

## 5. Lot 3 — Nettoyage progressif des serializers

### 5.1 Objectif

Réduire la polyvalence excessive de certains serializers sans casser les vues existantes.

---

### 5.2 Cibles prioritaires

#### A — `RubriqueSerializer`
Actuellement trop polyvalent :
- création standalone
- update contenu
- lecture complète

#### B — `ProjetSerializer`
À examiner pour clarifier son rôle après l’introduction de `create_project()`.

#### C — serializers structurels
Vérifier leur cohérence de nommage et de payload.

---

### 5.3 Approche recommandée

Nettoyage progressif, par flux :

1. identifier le flux
2. identifier le serializer réellement nécessaire
3. créer un serializer plus ciblé si cela clarifie fortement le code
4. migrer la vue concernée sans changer le contrat externe

---

### 5.4 Résultat attendu

À l’issue du sprint, on doit au minimum avoir :
- une cartographie claire des serializers par flux
- un premier nettoyage effectif sur les cas les plus évidents
- une dette serializer mieux bornée si elle n’est pas complètement traitée

---

### 5.5 Contraintes

- ne pas modifier inutilement les réponses API déjà validées
- ne pas lancer une refonte DTO complète dans ce sprint
- rester focalisé sur les serializers les plus ambiguës

---

### 5.6 Critères de validation

- responsabilités des serializers plus lisibles
- moins de confusion création / lecture / update
- aucun contrat frontend cassé

---

## 6. Travail demandé à ClaudeCode

### 6.1 Phase A — Audit ciblé

Avant modification, produire un état des lieux concis :
- flux critiques qui manquent de logs
- stratégie de monitoring légère la plus adaptée à l’existant
- serializers les plus polyvalents à cibler en priorité

---

### 6.2 Phase B — Implémentation lot par lot

Procéder dans cet ordre :
1. logs métier
2. monitoring léger
3. serializers

Ne pas mélanger tous les changements en une seule passe si cela nuit à la lisibilité.

---

### 6.3 Phase C — Validation finale

Fournir un récapitulatif :
- ce qui a été modifié
- ce qui reste volontairement à traiter plus tard
- quels contrats sont inchangés

---

## 7. Tests minimums attendus

### Logs
- vérifier qu’au moins les flux critiques produisent les logs attendus
- vérifier qu’aucun format de log parasite ne subsiste

### Monitoring
- test du healthcheck si ajouté
- test simple du comportement attendu en cas de réponse normale

### Serializers
- tests sur les vues modifiées
- validation que les contrats de réponse restent compatibles

---

## 8. Définition de terminé

Le sprint est terminé si :

- les logs métier critiques sont propres et exploitables ;
- un monitoring léger utile est en place ;
- les serializers les plus ambigus sont clarifiés au moins sur un premier périmètre ;
- aucune route canonique ni contrat frontend n’a été cassé.

---

## 9. Hors scope

- refonte DTO complète de tout le backend
- correction du `contenu_xml` racine vide
- refonte métier supplémentaire
- mise en place d’une stack de monitoring lourde

---

## 10. Ordre d’exécution recommandé

```text
Étape 1 — Audit ciblé logs / monitoring / serializers
Étape 2 — Logs métier propres sur flux critiques
Étape 3 — Monitoring minimal utile
Étape 4 — Nettoyage progressif des serializers
Étape 5 — Tests et validation finale
```

---

## 11. Note documentaire

À l’issue de ce sprint, mettre à jour si nécessaire :
- `10_CARTOGRAPHIE_BACKEND_CANONIQUE_EXPOSE.md`
- `BACKEND_GAP_ANALYSIS.md` (uniquement si de nouveaux écarts sont révélés)

Ce sprint améliore la qualité interne ; il ne doit pas remettre en cause la cartographie canonique exposée.

