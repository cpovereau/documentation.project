# FRONTEND_MAP_ROADMAP

---

> ⚠️ Ce document décrit la roadmap frontend de la structure Map.
> La vérité backend est définie dans :
> - `10_CARTOGRAPHIE_BACKEND_CANONIQUE_EXPOSE.md`

---

Ce document synthétise **les travaux restants** concernant la gestion de la Map dans Documentum, après la stabilisation de la racine documentaire et des comportements UI associés.

---

## ✅ État actuel (validé)

### Structure & UX
- Une **racine documentaire explicite** existe (MapRubrique parent = null).
- La racine est :
  - non supprimable
  - non déplaçable (drag & drop)
  - non indentable / outdentable
- Les autres rubriques conservent les comportements historiques :
  - indentation / outdentation (via `level`)
  - réorganisation par drag & drop
  - expansion / collapse

### Architecture Frontend
- `MapModule` ne manipule **que des `MapItem`** (abstraction UI).
- La notion de racine est portée par `MapItem.isRoot` (donnée dérivée).
- La logique structurelle (racine, insertion) est centralisée dans `mapStructure.ts`.

### Fonctionnalités de la toolbar — état réel (2026-04-17)

| Bouton | Statut |
|---|---|
| Créer rubrique (`FilePlus`) | ✅ Fonctionnel |
| Charger map (`FolderSearch`) | ✅ Fonctionnel |
| Import Word | ⚠️ Bouton présent, logique non implémentée |
| Charger rubrique existante (`Download`) | ⚠️ Déclenche `alert()` — non implémenté |
| Dupliquer (`Copy`) | ⚠️ Stub v1 — `toast.error(...)` sans action backend |
| Supprimer (`Trash`) | ⚠️ Stub v1 — `toast.error(...)` sans action backend |

---

## 🔜 Travaux à venir

### ✅ 1️⃣ Création de rubrique — terminé (Sprint 4)

La création est désormais **atomique et en une seule requête** :

- `POST /api/maps/{id}/structure/create/` — crée la Rubrique et le lien MapRubrique en transaction atomique.
- Le parent est transmis via le champ `parent` du payload ; l’ordre est calculé côté backend.
- Le rechargement de la structure se fait via `GET /api/maps/{id}/structure/`.

Les routes legacy (`POST /api/rubriques/` + `POST /api/maps/{id}/rubriques/`) ont été supprimées (Sprint 4 Phase B).

---

### 2️⃣ Étape 4 — Projection `level` → `parent` / `ordre`

**Objectif** : sortir du mode « structure locale » et persister la hiérarchie réelle.

À faire :
- Écrire une fonction de conversion :
  - entrée : `MapItem[]` (linéaire avec `level`)
  - sortie : liste de mutations `{ mapRubriqueId, parentId, ordre }`
- Identifier correctement :
  - le parent réel de chaque rubrique
  - son ordre parmi ses frères

👉 `level` devient **une projection UI temporaire**, plus une vérité métier.

---

### ✅ 3️⃣ Persistance backend de la structure — terminé (Sprint 4)

> ✅ Lot 2 terminé (2026-04-10) : `listMapRubriques()` cible désormais `GET /api/maps/{id}/structure/`. Le rechargement après toute opération structurelle est entièrement canonique.

Les routes canoniques de persistance structurelle sont en place et appelées par le frontend :

| Opération | Route canonique | Statut frontend |
|---|---|---|
| Réordonnancement | `POST /api/maps/{id}/structure/reorder/` — payload `{ orderedIds }` | ✅ Appelé |
| Indentation | `POST /api/maps/{id}/structure/{map_rubrique_id}/indent/` | ✅ Appelé |
| Désindentation | `POST /api/maps/{id}/structure/{map_rubrique_id}/outdent/` | ✅ Appelé |
| Attachement rubrique existante | `POST /api/maps/{id}/structure/attach/` | ⚠️ Non appelé (non implémenté côté frontend) |

> La route `PATCH /maps/{mapId}/rubriques/{id}/` n'a jamais existé et est définitivement hors scope.

> ⚠️ Le payload `reorder` n'envoie pas `parentId` — le backend déduit le parent des IDs reçus. Le drag & drop est donc limité au même niveau hiérarchique (pas de cross-niveau).

Le rechargement systématique après chaque opération est à la charge du frontend (voir section 4).

---

### ✅ 4️⃣ Rechargement systématique de la Map — terminé

Rechargement présent après chaque opération structurelle (create, indent, outdent, reorder).
Rechargement via `GET /api/maps/{id}/structure/` (canonique) depuis Lot 2.

La sélection différée après création (`pendingSelectId`) utilise `setSelection()` du `selectionStore` depuis Lot 1 — CentralEditor reçoit le `rubriqueId` réel après chaque rechargement.

> ✅ Confirmé dans le code : chaque handler (`handleIndent`, `handleOutdent`, `handleReorder`, `handleAddMapItem`) appelle `setMapRubriques(await listMapRubriques(currentMapId))` après l'opération.

---

### 5️⃣ Évolutions UX possibles (non prioritaires)

À envisager ultérieurement :
- Rendu spécifique de la racine (style, icône, tooltip).
- Masquage partiel de la racine en mode « simple ».
- Actions distinctes :
  - « Ajouter une rubrique enfant »
  - « Ajouter une rubrique au même niveau »

---

## 🐛 Bugs identifiés à corriger (Map / ProductDocSync)

Ces bugs sont documentés ici pour traçabilité. Ils doivent être résolus dans **ProductDocSync Phase 5** (nettoyage technique).

| Bug | Composant | Description | Impact |
|---|---|---|---|
| Double `$$` dans template literal | `SyncRightSidebar` | `` `$${isRightSidebarExpanded ? "w-[248px]" : "w-0"}` `` — double `$` : la classe Tailwind ne s'applique probablement pas | UI : sidebar droite ne se redimensionne pas correctement |
| `TOTAL_HEIGHT` recalculé au montage uniquement | `ProductDocSync` | `const TOTAL_HEIGHT = window.innerHeight - 130` calculé une seule fois — non réactif au redimensionnement de la fenêtre | UX : hauteur incorrecte après resize |

👉 Ces corrections sont indépendantes de la logique métier et peuvent être traitées à tout moment (ProductDocSync Phase 5).

---

## 🚀 Chantiers transverses frontend à venir

### Widget Tableau de bord

Créer un composant widget réutilisable existant en **3 tailles** (S / M / L), destiné à être intégré dans les espaces « Tableaux de bord » de tous les modules Documentum Nexus.

**Principes :**
- Chaque module expose ses propres widgets (avancement, métriques, alertes…).
- Les espaces tableaux de bord sont **personnalisables** par l'utilisateur.
- Les tableaux de bord sont les portes d'entrée de chaque module.
- Le composant widget est partagé (bibliothèque de composants commune à tous les modules).

**À définir :**
- Anatomie du widget : header (titre + icône), body (contenu variable), footer (lien/action).
- Comportement responsive selon la taille (S : indicateur simple, M : liste courte, L : tableau ou graphe).
- Système de grille pour l'espace tableau de bord (drag & drop de positionnement ?).

**Prérequis :** aucun — peut démarrer indépendamment du reste.

---

### Claude Design — Évolutions UX/UI

Trois axes de travail UX à adresser avec l'aide de Claude Design :

1. **Évolution ergonomique de l'IHM actuel** — audit de l'interface Desktop + ProductDocSync, propositions d'amélioration de la cohérence visuelle, des patterns d'interaction, de la hiérarchie de l'information.

2. **Affichage React en mode tablette et smartphone** — responsive design, adaptation des vues principales (CentralEditor, Map, ProductDocSync) pour une expérience mobile acceptable.

3. **Préparation des interfaces des futurs modules Nexus** — design system cohérent pour les modules à venir (Production, Support, Portail...), en anticipant les patterns communs (tableaux de bord, widgets, navigation inter-modules).

**Prérequis :** aucun — travail de conception indépendant de l'implémentation en cours.

---

## 🧭 Ordre recommandé de traitement

1. ✅ Stabilisation de la Map (Sprint 1–3)
2. ✅ Création de rubrique via route canonique atomique (Sprint 4)
3. ✅ Persistance backend (reorder / indent / outdent) + routes canoniques (Sprint 4)
4. ✅ Rechargement systématique après chaque opération structurelle
5. 🔜 Étape 4 — Projection `level → parent / ordre` (drag & drop cross-niveau) ➡️ Permettra le drag & drop multi-niveaux fiable
6. 🔜 Implémentation clone et suppression depuis la Map toolbar (stubs v1 actuellement)
7. 🔜 Ajustements UX optionnels

---

## 🎯 Objectif final

À l’issue de ces étapes :
- La Map est **structurellement fiable**.
- La hiérarchie est **persistée et traçable**.
- Le système est prêt pour :
  - le versioning avancé
  - l’arbre d’impact
  - le travail collaboratif futur

---

📌 **Prochaine étape conseillée** :
> Traiter le **Lot 4** : supprimer la double lecture `selectedProjectId` et les logs debug production ; corriger le préfixe manquant dans `getProjectDetailsValidated` ; isoler `prepareNewRubriqueXml` hors de LeftSidebar.
> Puis traiter la **projection `level → parent/ordre`** pour le drag & drop cross-niveau.

