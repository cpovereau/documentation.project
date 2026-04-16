# Documentum – Cartographie Frontend — `Settings`

> **Objet** : cartographie de l'existant basée sur le modèle officiel
>
> **Statut** : analyse stricte, sans modification de fond ni jugement
>
> **Composants analysés :**
> - `SettingsScreen` (`src/screens/Settings/SettingsScreen.tsx`)
> - `SettingsModal` (`src/screens/Settings/SettingsModal.tsx`)
> - 7 onglets : `AccessTab`, `DataTab`, `FormatTab`, `NamingTab`, `LogsTab`, `TechTab`, `MaintenanceTab`
>
> **Routes applicatives :**
> - `/settings` → `SettingsScreen` directement (route protégée dans `App.tsx`)
> - Accessible également depuis `Desktop` via `SettingsButton` → `SettingsModal` (modal déplaçable)
>
> **Produite le** : 2026-04-16

---

## 1. Rôle fonctionnel réel

- **Rôle actuel** :
  `Settings` est l'écran de configuration de l'application. Il se présente en deux formes :
  - **`SettingsScreen`** : écran plein (route `/settings`), avec une sidebar de navigation à gauche (7 onglets) et le contenu de l'onglet actif à droite
  - **`SettingsModal`** : wrapper modal déplaçable (drag sur la barre de titre) qui intègre `SettingsScreen`, accessible depuis l'interface `Desktop`

  Les 7 onglets couvrent : Accès, Données, DITA/XML, Nomenclature, Journalisation, Paramètres techniques, Maintenance.

- **Écart éventuel** :
  Seul l'onglet **Données** (`DataTab`) effectue de vrais appels backend. Les 6 autres onglets fonctionnent entièrement en mémoire locale (localStorage via stores, ou simulations). Les boutons "Enregistrer" et les actions de maintenance déclenchent soit des toasts, soit des `alert()`, soit des `console.log`, sans persistance backend.

---

## 2. Flux métier pris en charge — vue d'ensemble par onglet

| Onglet | Déclencheur | API branchée | Persistance |
|--------|------------|-------------|-------------|
| Access | Navigation tabs | ❌ | État local uniquement |
| Données | Navigation tabs | ✅ (`useArchivableList`) | Backend DRF |
| DITA / XML | Navigation tabs | ❌ | État local (mémoire) |
| Nomenclature | Navigation tabs | ❌ | Store local `useNamingConfig` |
| Journalisation | Navigation tabs | ❌ | Données mockées statiques |
| Paramètres | Navigation tabs | ❌ | Store local `useTechConfig` |
| Maintenance | Navigation tabs | ❌ (simulation) | Aucune persistance |

---

## 3. Appels backend effectués

### 3.1 `DataTab` — seul onglet avec API réelles

`DataTab` utilise `useArchivableList` (via `useArchivableHooks`) pour charger et gérer 7 types de ressources :

| Ressource | Endpoint GET | Endpoint POST | Endpoint PATCH | Archive |
|-----------|-------------|--------------|----------------|---------|
| Gammes | `GET /api/gammes/` | `POST /api/gammes/` | `PATCH /api/gammes/{id}/` | ✅ |
| Produits | `GET /api/produits/` | `POST /api/produits/` | `PATCH /api/produits/{id}/` | ✅ |
| Fonctionnalités | `GET /api/fonctionnalites/` | `POST /api/fonctionnalites/` | `PATCH /api/fonctionnalites/{id}/` | ✅ |
| Audiences | `GET /api/audiences/` | `POST /api/audiences/` | `PATCH /api/audiences/{id}/` | ✅ |
| Tags | `GET /api/tags/` | `POST /api/tags/` | `PATCH /api/tags/{id}/` | ✅ |
| Profils publication | `GET /api/profils_publication/` | — | — | — (lecture seule dans l'UI) |
| Interface UI | `GET /api/interface_ui/` | `POST /api/interface_ui/` | `PATCH /api/interface_ui/{id}/` | ✅ |

**Import fonctionnalités** (bouton dédié) :
```
POST /api/import/fonctionnalites/
```
Payload : `FormData` (file + mapping + produit + skip_header). Déclenché via `useImportModal`.

**Conformité :**
- 🟢 Toutes les ressources passent par `useArchivableList` → `api.get/post/patch` → `/api/{resource}/`
- 🟢 Tri côté frontend (alphabétique locale française) après chargement

### 3.2 Autres onglets — aucun appel backend

Les onglets Access, FormatTab, NamingTab, LogsTab, TechTab, MaintenanceTab n'effectuent aucun appel réseau.

---

## 4. États et contextes consommés

### `SettingsScreen`

| État | Type | Rôle |
|------|------|------|
| `activeTab` | `string` | Onglet actif (parmi `access`, `data`, `formats`, `naming`, `logs`, `tech`, `maintenance`) |

### `SettingsModal`

| État | Type | Rôle |
|------|------|------|
| `position` | `{ x, y }` | Position absolue de la modale |
| `offset` | `{ x, y }` | Offset drag depuis coin |
| `isDragging` | `boolean` | État dragging en cours |

> ⚠️ **Observation** : `SettingsModal` contient deux `useEffect` dont le second est déclaré après `if (!open) return null` (ligne 38), ce qui constitue une **violation de la règle des hooks React** (hooks conditionnels). Ce composant peut produire des avertissements React en développement.

### Stores consommés par les onglets

| Store | Onglet | Méthodes | Persistance |
|-------|--------|---------|-------------|
| `useNamingConfig` | NamingTab, MaintenanceTab | `setVersion`, `version` | Local (store Zustand ou localStorage — non vérifié) |
| `useTechConfig` | TechTab | `config`, `updateConfig` | Local (store Zustand — aucun appel API) |

---

## 5. DTO manipulés

### `DataTab`

| DTO | Source | Usage |
|-----|--------|-------|
| `ArchivableItem` | `types/archivable.ts` | Tous les éléments de liste (gammes, produits, etc.) |
| Payload création | `AddItemModal.onSubmit` | Données de création (clés variables selon ressource) |

### `AccessTab`

| DTO local | Structure (observée) |
|-----------|---------------------|
| `Profil` | `{ id, nom, description, permissions: Record<string, boolean> }` |
| `Utilisateur` | `{ id, nom, prenom, email, profilId, actif }` |

> Ces types sont définis localement dans `AccessTab.tsx`, non dans `types/`.

### `FormatTab`

| DTO local | Structure (observée) |
|-----------|---------------------|
| Fichier DTD/XSLT | `{ id: number, nom: string, contenu: string }` |

> Données hardcodées (2 fichiers initiaux) — aucune API.

### `NamingTab`

Consomme et écrit le type `NamingConfig` importé depuis `types/NamingConfig`.

### `LogsTab`

Consomme `logsMockData` (import statique depuis `./mockLogs`) et type `LogType` depuis `types/LogsTypes`.

---

## 6. Écarts avec le backend canonique

### 6.1 AccessTab — profils et utilisateurs non persistés

Gestion locale complète de profils et utilisateurs. Le bouton "Enregistrer" ne déclenche aucun appel API. Aucun endpoint backend pour les profils utilisateurs n'est identifié comme branché.

### 6.2 FormatTab — fichiers DTD/XSLT non persistés

2 fichiers hardcodés à l'initialisation. Upload via `FormatUploader` : comportement non vérifié à ce niveau d'analyse (composant dédié). Sélection, visualisation et suppression sont locaux.

### 6.3 NamingTab — config sans persistance backend

Configuration enregistrée via `useNamingConfig.setVersion()` (store local). Bouton "Enregistrer" déclenche un `alert()` + `console.log`. Pas de `POST` ou `PATCH` backend.

### 6.4 LogsTab — données mockées

`logsMockData` est un import statique (`./mockLogs`). Aucun endpoint de journalisation n'est appelé. Le filtrage (type, date, texte) est entièrement local.

### 6.5 TechTab — config sans persistance backend

`useTechConfig` stocke la configuration localement. Bouton "Enregistrer" → `toast.success` uniquement.

### 6.6 MaintenanceTab — toutes les actions sont des simulations

`useMaintenanceActions` implémente toutes les actions comme des `setTimeout` avec toast. Aucun appel API réel. Les données projets/versions utilisées dans "Cloner une version" sont hardcodées (`MOCK_PROJETS`, `MOCK_VERSIONS`).

---

## 7. Risques et impacts

| Risque | Gravité | Onglet concerné |
|--------|---------|----------------|
| Violation règle des hooks React dans SettingsModal | 🟠 Moyen | SettingsModal |
| Profils/utilisateurs non persistés | 🔴 Critique | AccessTab |
| Logs mockés | 🟠 Moyen | LogsTab |
| Config technique non persistée | 🟠 Moyen | TechTab |
| Config nomenclature non persistée côté backend | 🟠 Moyen | NamingTab |
| Maintenance sans API | 🟡 Faible | MaintenanceTab |
| FormatTab : upload non vérifié en profondeur | Indéterminé | FormatTab |

**Sensibilité** : `DataTab` est central (référentiels partagés par tout le système). Les autres onglets sont périphériques.

**Dépendances en cascade** : `DataTab` alimente les stores de produits/fonctionnalités utilisés par `LeftSidebar` (sélection produit/version) et `ProductDocSync`.

---

## 8. Verdict architectural

🟡 **Conforme sous contrainte** — DataTab opérationnel, autres onglets non persistés

### Détail par onglet

| Onglet | Verdict | Raison |
|--------|---------|--------|
| Données | 🟢 Conforme | API branchées, CRUD opérationnel |
| Access | 🔴 À réaligner | Aucune persistance backend |
| DITA/XML | 🔴 À réaligner | Données hardcodées, persistance non vérifiée |
| Nomenclature | 🟠 Partiel | Store local, pas de backend |
| Journalisation | 🔴 À réaligner | Données mockées, aucune API logs |
| Paramètres | 🟠 Partiel | Store local, pas de backend |
| Maintenance | 🔴 À réaligner | Toutes actions = simulation |

---

**Fin de la cartographie `Settings`.**
