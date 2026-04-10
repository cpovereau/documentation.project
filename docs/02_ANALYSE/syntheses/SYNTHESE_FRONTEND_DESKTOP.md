# Documentum – Synthèse Frontend
## Issue de la cartographie `Desktop`

> **Statut** : validé
> 
> **Source** : Cartographie Frontend — Desktop
> 
> **Objectif** : formaliser le rôle et la position architecturale de Desktop dans la chaîne frontend Documentum.

---

## 1. Périmètre couvert

- Composant analysé : **Desktop**
- Nature : orchestrateur d’interface (UI composition)
- Rôle : composition des modules, gestion des états visuels et propagation des interactions

---

## 2. Appels backend

- **Aucun appel backend direct ou indirect**

> Desktop n’interagit jamais directement avec l’API.

---

## 3. Flux métier exposés (orchestration UI)

| Flux | Déclencheur UI | Implémentation | Commentaire |
|------|----------------|----------------|-------------|
| Sélection projet | action utilisateur | Propagation vers LeftSidebar | Conforme |
| Sélection map | action utilisateur | Propagation vers LeftSidebar | Conforme |
| Sélection rubrique | action utilisateur | Propagation vers CentralEditor | Conforme |
| Redimensionnement éditeurs | drag handle | Gestion locale UI | Conforme |

---

## 4. États et données manipulés

- États locaux purement UI (dimensions, visibilité)
- Données structurantes reçues via props
- DTO manipulé : `MapItem[]` (UI only)

> Aucun état métier persistant n’est porté par Desktop.

---

## 5. Écarts avec le backend canonique

- Aucun écart identifié

Desktop est totalement découplé du backend.

---

## 6. Risques et impacts

- Risque intrinsèque faible
- Point de vigilance : évolution future du DTO UI `MapItem`
- Sensibilité dépendante des composants enfants

---

## 7. Verdict architectural

🟢 **Conforme**

- Orchestrateur UI strict
- Aucun mélange métier / UI
- Conforme au référentiel backend

---

## 8. Rôle dans la trajectoire globale

- Composant stable lors du réalignement backend
- Ne nécessite aucune correction structurelle
- Sert de socle pour l’orchestration UI future

---

> **Cette synthèse confirme que Desktop n’est pas une source de dette technique ou métier.**

**Fin de la synthèse Frontend — Desktop**