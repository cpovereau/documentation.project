# Documentum – Decision Log

Ce document recense les **décisions structurantes** prises pour le projet Documentum.

Il a pour objectifs :
- de conserver la mémoire des choix forts,
- d’éviter les débats cycliques,
- de permettre une remise en question éclairée si le contexte évolue.

Une décision non consignée ici est considérée comme :
- provisoire,
- ou non stabilisée.

---

## Format des décisions

Chaque décision suit le format suivant :

- **Date**
- **Sujet**
- **Contexte**
- **Décision**
- **Justification**
- **Conséquences**
- **Statut** (Active / À réévaluer)

---

## 2024-11-17 – Architecture générale Documentum

**Sujet**  
Architecture globale du projet Documentum

**Contexte**  
Besoin d’un outil de documentation structuré, versionné, extensible et orienté publication multi-formats.

**Décision**  
- Backend : Django REST + PostgreSQL  
- Frontend : React + TypeScript + Tailwind  
- Éditeur : TipTap v3 avec extensions personnalisées  
- Formats : DITA XML comme source canonique

**Justification**  
- Séparation claire frontend / backend  
- Écosystème mature  
- Compatibilité avec les objectifs long terme (PDF, Web Help, SCORM)

**Conséquences**  
- Nécessité de respecter strictement la structure DITA  
- Complexité initiale assumée

**Statut**  
Active

---

## 2025-06-22 – Abandon de l’édition inline dans les Paramètres

**Sujet**  
UX des écrans de Paramètres

**Contexte**  
Les premières maquettes prévoyaient de l’édition inline pour certaines entités.

**Décision**  
Abandon total de l’édition inline au profit de modales dédiées.

**Justification**  
- Complexité UX élevée  
- Validation difficile  
- Incohérence avec le backend  
- Maintenance coûteuse

**Conséquences**  
- Uniformisation des écrans Paramètres  
- Simplification des flux utilisateur  
- Réduction des cas limites

**Statut**  
Active

---

## 2025-06-22 – Centralisation de la gestion des erreurs

**Sujet**  
Gestion des erreurs frontend / backend

**Contexte**  
Multiplication de formats d’erreurs hétérogènes et gestion locale.

**Décision**  
- Centralisation backend via `custom_exception_handler`  
- Normalisation frontend via intercepteur Axios

**Justification**  
- Lisibilité  
- Cohérence UX  
- Facilité de maintenance

**Conséquences**  
- Obligation de respecter le format d’erreur standard  
- Simplification des composants consommateurs

**Statut**  
Active

---

## 2025-06-23 – Centralisation des extensions TipTap

**Sujet**  
Gestion des extensions TipTap personnalisées

**Contexte**  
Multiplication d’extensions dispersées dans le projet.

**Décision**  
- Export nommé obligatoire  
- Point d’entrée unique (`src/extensions/index.ts`)

**Justification**  
- Lisibilité  
- Réutilisabilité  
- Compatibilité TipTap v3

**Conséquences**  
- Discipline stricte sur la création d’extensions  
- Meilleure maintenance globale

**Statut**  
Active

---

## 2025-07-22 – Gestion explicite du buffer de rubrique

**Sujet**  
Prévention de la perte de contenu non sauvegardé

**Contexte**  
Risque identifié de reset implicite du contenu lors de changements de contexte.

**Décision**  
Introduction d’un statut explicite du buffer (`ready`, `modified`, `saved`, etc.).

**Justification**  
- Sécurité du contenu  
- UX maîtrisée  
- Prévention des pertes silencieuses

**Conséquences**  
- Complexification contrôlée de la gestion d’état  
- Nécessité d’UX explicite (popup, avertissements)

**Statut**  
Active

---

## 2025-08-14 – Import et remplacement des médias

**Sujet**  
Gestion des images et médias partagés

**Contexte**  
Besoin d’un système fiable d’import et de remplacement sans rupture de liens.

**Décision**  
- Nommage déterministe côté backend  
- Remplacement en conservant le nom original  
- Confirmation utilisateur explicite

**Justification**  
- Cohérence documentaire  
- Fiabilité des publications  
- UX sécurisante

**Conséquences**  
- Couplage frontend / backend assumé  
- Complexité accrue mais maîtrisée

**Statut**  
Active

---

## 2025-09-29 – Centralisation de la sauvegarde des rubriques

**Sujet**  
Stratégie de sauvegarde des contenus

**Contexte**  
Multiples points potentiels de sauvegarde implicite.

**Décision**  
Centralisation de la logique de sauvegarde dans un hook dédié (`saveRubrique()`).

**Justification**  
- Cohérence  
- Traçabilité  
- Prévention des conflits

**Conséquences**  
- Discipline d’appel  
- Facilite l’évolution vers autosave ou warning utilisateur

**Statut**  
Active

---

## 2026-04-09 – Coexistence temporaire des endpoints structurels backend

**Sujet**
Coexistence temporaire des endpoints structurels canoniques et des endpoints historiques de compatibilité.

**Contexte**
Le frontend historique (LeftSidebar) appelle encore :
- POST /api/map-rubriques/{id}/indent/
- POST /api/map-rubriques/{id}/outdent/
- POST /api/maps/{id}/reorder/

Le backend a été réaligné pour :
- conserver ces routes de compatibilité,
- ajouter en parallèle les routes canoniques :
    - GET /api/maps/{id}/structure/
    - POST /api/maps/{id}/structure/create/
    - POST /api/maps/{id}/structure/reorder/
    - POST /api/maps/{id}/structure/{mapRubriqueId}/indent
    - POST /api/maps/{id}/structure/{mapRubriqueId}/outdent

**Décision**
- Maintenir temporairement une double exposition :
    - canonique pour la cible backend,
    - compatible pour le frontend existant, en réutilisant les mêmes services métiers.

**Justification**
- éviter toute régression frontend,
- supprimer les 404 bloquantes,
- préparer une migration progressive sans déplacer la logique métier dans l’UI.

**Conséquences**
- la documentation doit distinguer cible et état transitoire
- les routes de compatibilité sont temporaires
- elles devront être supprimées après migration frontend

**Statut**
Active — à réévaluer après migration du frontend vers /structure/*

---

## 2026-04-09 – Neutralisation défensive de POST /api/projets/

**Sujet**
Création de projet non canonique temporairement interdite.

**Contexte**
Le référentiel cible prévoit que POST /api/projets/ soit la porte d’entrée unique. Mais l’orchestration complète n’a pas encore été rapatriée dans ProjetViewSet.create(). Aujourd’hui, la seule route garantissant les invariants métier reste POST /projet/create/.

**Décision**
POST /api/projets/ est explicitement bloqué par une erreur métier, afin d’empêcher toute création partielle ou incohérente.

**Justification**
Mieux vaut une interdiction explicite qu’une création silencieusement incomplète.

**Conséquences**
- /projet/create/ reste provisoirement obligatoire
- le canon n’est pas encore atteint sur la création projet
- la migration future devra déplacer l’orchestration dans ProjetViewSet.create()

**Statut**
Active — temporaire

---

## Règle de clôture

Toute décision listée ici :
- fait autorité,
- s’impose au projet,
- peut être remise en question uniquement via une nouvelle entrée documentée.

La mémoire du projet est un actif, pas une contrainte.
