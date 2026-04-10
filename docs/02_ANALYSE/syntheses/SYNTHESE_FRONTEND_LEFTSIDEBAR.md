# Documentum – Synthèse Frontend
## Issue de la cartographie `LeftSidebar`

> **Statut** : validé
>
> **Source** : Cartographie Frontend — LeftSidebar
>
> **Objectif** : fournir une vision synthétique et actionnable des écarts frontend ↔ backend avant la poursuite de la cartographie.

---

## 1. Périmètre couvert

- Composant analysé : **LeftSidebar**
- Rôle : point d’entrée de la navigation documentaire
- Nature : composant central, orchestrateur de flux métier frontend

---

## 2. Inventaire des endpoints utilisés

| Endpoint | Responsabilité métier | Statut | Commentaire |
|---------|----------------------|--------|-------------|
| `GET /api/projets/{id}/` | Chargement projet | 🟢 Conforme | Fallback si projet absent du cache local |
| `GET /api/projets/{id}/structure/` | Lecture structure projet | 🟢 Conforme | Endpoint canonique |
| `GET /api/maps/{id}/rubriques/` | Lecture structure map | 🟡 Toléré | À remplacer par `/structure/` |
| `POST /api/maps/{id}/create-rubrique/` | Création rubrique + rattachement | 🟡 Toléré | À migrer vers endpoint structure canonique |
| `POST /api/map-rubriques/{id}/indent/` | Indentation structure | 🔴 Cassé | Endpoint inexistant backend |
| `POST /api/map-rubriques/{id}/outdent/` | Désindentation structure | 🔴 Cassé | Endpoint inexistant backend |
| `POST /api/maps/{id}/reorder/` | Réordonnancement structure | 🔴 Cassé | Endpoint inexistant backend |

---

## 3. Typologie des écarts identifiés

### 3.1. Écarts contractuels

- Utilisation d’endpoints non canoniques
- Appels vers des routes supprimables à terme

---

### 3.2. Écarts fonctionnels

- Fonctionnalités UI dépendantes d’endpoints inexistants
- Comportements partiellement non fonctionnels

---

### 3.3. Écarts architecturaux

- Mélange structure / contenu dans un composant de navigation
- Responsabilités transverses assumées par le frontend

---

## 4. Logiques compensatoires frontend

- Calcul local du parent d’insertion
- Sélection différée après création
- Rechargement complet après chaque modification structurelle

> Ces logiques compensent des lacunes backend historiques.

---

## 5. Impacts en cascade

- **CentralEditor** : dépend de la sélection transmise
- **ProjectModule / MapModule** : dépendants des données normalisées par LeftSidebar
- **XmlBufferStore** : initialisé hors du composant éditeur

---

## 6. Verdict global

- Composant **non conforme à la cible backend**, mais **fonctionnel par compensation**
- Nécessite un réalignement prioritaire après stabilisation backend

---

## 7. Recommandations de pilotage

- Ne pas corriger le frontend avant réalignement backend
- Utiliser cette synthèse comme **référence transverse**
- Poursuivre la cartographie frontend avec **ProjectModule**

---

> **Cette synthèse constitue un point de passage obligatoire avant toute correction.**

**Fin de la synthèse Frontend — LeftSidebar**

