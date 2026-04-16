# Settings — Roadmap & Suivi

Document de référence pour suivre l'évolution de l'écran `Settings` (`SettingsScreen`, `SettingsModal`) et de ses 7 onglets.  
Ce document est synthétique, durable, et conçu pour un travail non linéaire dans le temps.

---

# 🧭 Vue d'ensemble du plan

L'évolution est organisée en **6 phases** par onglet ou domaine fonctionnel :

1. **Phase 1 — DataTab (TERMINÉ)**
2. **Phase 2 — AccessTab : persistance backend profils/utilisateurs (À FAIRE)**
3. **Phase 3 — LogsTab : journalisation réelle (À FAIRE)**
4. **Phase 4 — TechTab + NamingTab : persistance backend de la configuration (À FAIRE)**
5. **Phase 5 — FormatTab + MaintenanceTab : actions réelles (À FAIRE)**
6. **Phase 6 — SettingsModal : stabilisation technique (À FAIRE)**

---

# ⚠️ État actuel (2026-04-16)

### Synthèse par onglet

| Onglet | Statut | API |
|--------|--------|-----|
| Données | ✅ Opérationnel | ✅ Branché |
| Accès | 🔴 Non persisté | ❌ Local uniquement |
| DITA / XML | 🔴 Non persisté | ❌ Hardcodé |
| Nomenclature | 🟠 Partiel | ❌ Store local |
| Journalisation | 🔴 Mockée | ❌ Données statiques |
| Paramètres | 🟠 Partiel | ❌ Store local |
| Maintenance | 🔴 Simulation | ❌ setTimeout mock |

---

# ✅ Phase 1 — DataTab (TERMINÉ)

### 🎯 Objectifs
Gestion CRUD des référentiels métier (gammes, produits, fonctionnalités, audiences, tags, profils de publication, interfaces UI).

### ✔ Réalisé

- [X] Chargement via `useArchivableList` → `GET /api/{resource}/?archived=false|true`
- [X] Tri alphabétique côté frontend après chargement
- [X] Création via `AddItemModal` → `POST /api/{resource}/`
- [X] Modification inline → `PATCH /api/{resource}/{id}/`
- [X] Archive/restauration → mécanisme via `toggleArchivableResource`
- [X] Import fonctionnalités → `POST /api/import/fonctionnalites/` (FormData : file, mapping, produit, skip_header)
- [X] Données dictionnaire centralisées via `useAllDictionnaireData` (gammes + produits pour les modales)

### 📝 Notes
DataTab est le seul onglet pleinement opérationnel. Il alimente les stores de sélection produit/version utilisés par LeftSidebar et ProductDocSync.

---

# 🔜 Phase 2 — AccessTab : persistance backend (À FAIRE — PRIORITÉ HAUTE)

### 🎯 Objectifs
- Remplacer la gestion locale des profils et utilisateurs par des appels backend réels.
- Permettre la gestion multi-utilisateurs réelle.

### 🧩 Tâches

#### 2.1 — Backend : modèles et API

- [ ] Vérifier ou créer les modèles `Profil` et `Utilisateur` Django
- [ ] Exposer `GET/POST/PATCH/DELETE /api/profils/`
- [ ] Exposer `GET/POST/PATCH /api/utilisateurs/`
- [ ] Implémenter l'endpoint de réinitialisation mot de passe (bouton existant dans l'UI)

#### 2.2 — Frontend : hooks de chargement

- [ ] Créer `useProfilList()` → `GET /api/profils/`
- [ ] Créer `useUtilisateurList()` → `GET /api/utilisateurs/`
- [ ] Remplacer les `useState` locaux (`profils`, `utilisateurs`) par ces hooks

#### 2.3 — Persistance des mutations

- [ ] `handleAddProfil` → `POST /api/profils/`
- [ ] `togglePermission` / `handleNomChange` / `handleDescriptionChange` → `PATCH /api/profils/{id}/`
- [ ] `handleAddUser` → `POST /api/utilisateurs/`
- [ ] `handleUserChange` → `PATCH /api/utilisateurs/{id}/`
- [ ] Bouton "Enregistrer" → remplacer par sauvegarde automatique ou confirmation

#### 2.4 — Déplacer les types

- [ ] Déplacer `interface Profil` et `interface Utilisateur` vers `src/types/` (actuellement définis localement dans `AccessTab.tsx`)

### 📝 Notes
La liste `permissionsDisponibles` est hardcodée dans le composant. Décider si elle doit être configurable depuis le backend ou rester une constante frontend.

---

# 🔜 Phase 3 — LogsTab : journalisation réelle (À FAIRE)

### 🎯 Objectifs
- Remplacer les données mockées (`logsMockData`) par un chargement depuis l'API.
- Permettre la consultation de l'historique réel des actions utilisateur.

### 🧩 Tâches

#### 3.1 — Backend : endpoint journalisation

- [ ] Définir la structure du log d'audit (utilisateur, action, date, type, projet, description)
- [ ] Exposer `GET /api/logs/` avec filtres : `?type=...&search=...&start_date=...&end_date=...`
- [ ] Implémenter la pagination DRF
- [ ] Implémenter l'écriture des logs depuis les ViewSets existants (ou via Django signals)

#### 3.2 — Frontend : hook `useLogList`

- [ ] Créer `useLogList(filters)` → `GET /api/logs/?...`
- [ ] Gérer les états `loading`, `error`, `items`
- [ ] Brancher les filtres UI (`activeFilter`, `searchTerm`, `startDate`, `endDate`) sur les paramètres du hook

#### 3.3 — Remplacer `logsMockData`

- [ ] Supprimer l'import de `./mockLogs`
- [ ] Brancher `LogTable` sur les données réelles
- [ ] Gérer l'état vide et le chargement initial

### 📝 Notes
Le fichier `mockLogs.ts` contient des données statiques suffisantes pour valider l'UI. Il peut servir de fixture de test une fois le branchement API effectué.

---

# 🔜 Phase 4 — TechTab + NamingTab : persistance backend (À FAIRE)

### 🎯 Objectifs
- Persister la configuration technique et de nomenclature côté backend.
- Synchroniser les stores locaux avec une source de vérité partagée.

### 🧩 Tâches

#### 4.1 — TechTab : endpoint configuration technique

- [ ] Définir le modèle de configuration technique (un singleton ou par organisation)
- [ ] Exposer `GET /api/config/tech/` + `PATCH /api/config/tech/`
- [ ] Brancher `useTechConfig` sur cet endpoint (chargement + sauvegarde réelle)
- [ ] Remplacer `toast.success("Paramètres techniques enregistrés")` par un appel PATCH réel

#### 4.2 — NamingTab : endpoint configuration nomenclature

- [ ] Exposer `GET /api/config/naming/` + `PATCH /api/config/naming/`
- [ ] Brancher `useNamingConfig` sur cet endpoint
- [ ] Supprimer `alert()` et `console.log` dans `handleSave` et `handleSimulation`
- [ ] Déplacer le type `NamingConfig` (vérifié dans `src/types/NamingConfig`) vers cet endpoint si nécessaire

### 📝 Notes
`useTechConfig` et `useNamingConfig` sont des stores locaux (Zustand ou localStorage — à confirmer). Leur migration vers un backend partagé permettra la cohérence entre sessions et utilisateurs.

---

# 🔜 Phase 5 — FormatTab + MaintenanceTab : actions réelles (À FAIRE)

### 🧩 Tâches

#### 5.1 — FormatTab : persistance des fichiers DTD/XSLT

- [ ] Vérifier le comportement de `FormatUploader` : déclenche-t-il un appel API ? (non vérifié à ce jour)
- [ ] Si non branché : exposer `POST /api/formats/` + `DELETE /api/formats/{id}/`
- [ ] Supprimer les fichiers hardcodés dans `useState` initial
- [ ] Implémenter le chargement depuis `GET /api/formats/?type=DTD|XSLT`

#### 5.2 — MaintenanceTab : actions réelles

- [ ] `archiveOldVersions` → `POST /api/maintenance/archive-old-versions/`
- [ ] `validateVersions` → `POST /api/maintenance/validate-versions/`
- [ ] `clearSessions` → `POST /api/maintenance/clear-sessions/`
- [ ] `clearCache` → `POST /api/maintenance/clear-cache/`
- [ ] `exportLogs` → `GET /api/logs/export/?format=csv`
- [ ] `exportConfig` → `GET /api/config/export/`
- [ ] `cloneVersion` → `POST /api/versions/{id}/clone/` (endpoint partagé avec LeftSidebar Lot 6)
- [ ] Remplacer les `MOCK_PROJETS` et `MOCK_VERSIONS` par des appels `GET /api/projets/` et `GET /api/versions/?projet={id}`
- [ ] Supprimer tous les `setTimeout` dans `useMaintenanceActions`

### 📝 Notes
Toutes les actions de maintenance sont actuellement des simulations (`setTimeout` + toast). Aucune action réelle n'est effectuée. Ce lot est le moins prioritaire car il n'impacte pas le flux métier principal.

---

# 🔜 Phase 6 — SettingsModal : stabilisation technique (À FAIRE)

### 🎯 Objectifs
- Corriger la violation de règle des hooks React.
- Stabiliser le comportement de drag de la modale.

### 🧩 Tâches

#### 6.1 — Correction violation règle des hooks

- [ ] Le second `useEffect` est déclaré après `if (!open) return null` (ligne 38 de `SettingsModal.tsx`)
- [ ] Déplacer le `return null` **après** tous les hooks, ou restructurer avec un composant imbriqué

#### 6.2 — Drag modale

- [ ] Position initiale de la modale : actuellement `{ x: 0, y: 0 }` — la modale apparaît en haut à gauche
- [ ] Envisager une position initiale centrée ou mémorisée entre ouvertures

---

# 📘 Annexes

### 🔍 Dépendances entre phases

| Phase | Dépendances |
|-------|-------------|
| Phase 1 | ✅ Terminé — aucune dépendance |
| Phase 2 | Décision architecture utilisateurs/permissions |
| Phase 3 | Implémentation écriture de logs backend |
| Phase 4 | Décision modèle singleton config |
| Phase 5.2 | Endpoint versions (partagé avec LeftSidebar Lot 6.3) |
| Phase 6 | Indépendante — correction technique pure |

### 📌 TODO futurs (non priorisés)

- 1️⃣ Interface UI — `interface_ui` dans DataTab : les codes d'interface sont utilisés par ProductDocSync (fonctionnalités) — clarifier le lien
- 2️⃣ Profils de publication dans DataTab : en lecture seule dans l'UI — décider si éditable ou géré exclusivement par les administrateurs
- 3️⃣ Thème et langue : aucun onglet dédié n'existe pour les préférences utilisateur (thème, langue) — à envisager dans une phase ultérieure

---

# ✔️ Fin du document
