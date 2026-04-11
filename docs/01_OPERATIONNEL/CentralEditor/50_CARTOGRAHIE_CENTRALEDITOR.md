# 🧩 50 — Cartographie Frontend : CentralEditor

---

## 1. Rôle fonctionnel réel

**Rôle actuel** :  
Édition du contenu XML DITA des rubriques via TipTap, avec synchronisation temps réel vers un buffer local.

---

### Responsabilités observées

- Chargement du contenu XML d’une rubrique
- Conversion XML → TipTap JSON (affichage)
- Conversion TipTap JSON → XML (édition)
- Synchronisation avec le `XmlBufferStore`
- Gestion du statut (`dirty`, `saved`, etc.)
- Déclenchement de la sauvegarde backend
- Intégration de fonctionnalités avancées :
  - dictée vocale
  - correction grammaticale
  - recherche/remplacement
  - historique local

---

### Rôle théorique attendu

- Éditeur de contenu uniquement
- Aucune gestion de structure (maps)
- Aucune logique métier métier transverse

---

### Écart identifié

🟡 Faible à modéré

Le composant est globalement bien positionné, mais :
- certaines responsabilités sont encore trop larges
- dépend fortement de nombreux hooks

---

## 2. Flux métier pris en charge

---

### Flux principal : édition de rubrique

| Étape | Déclencheur | Composant / Hook | Description |
|------|------------|------------------|------------|
| Chargement | changement `rubriqueId` | useDitaLoader | XML → TipTap |
| Initialisation buffer | useEffect | useXmlBufferStore | initialise si absent |
| Modification | saisie utilisateur | useXmlBufferSync | TipTap → XML |
| Suivi des changements | automatique | useRubriqueChangeTracker | détecte `dirty` |
| Sauvegarde | bouton | useRubriqueSave | appel backend |
| Mise à jour statut | réponse API | useXmlBufferStore | passe à `saved` |

---

## 3. Interactions avec le frontend

---

### 3.1 LeftSidebar

- fournit `selectedMapItemId`
- bloque la navigation si buffer `dirty`

---

### 3.2 Desktop

- transmet `rubriqueId`
- gère layout et redimensionnement

---

### 3.3 XmlBufferStore

Rôle central :

- `getXml(rubriqueId)`
- `setXml(rubriqueId, xml)`
- `getStatus(rubriqueId)`
- `setStatus(rubriqueId, status)`

👉 Source de vérité côté frontend

---

## 4. Hooks utilisés

---

### 4.1 Chargement & synchronisation

- `useDitaLoader`
- `useXmlBufferSync`

---

### 4.2 Sauvegarde

- `useRubriqueSave`

---

### 4.3 Tracking & historique

- `useRubriqueChangeTracker`
- `useEditorHistoryTracker`

---

### 4.4 Édition avancée

- `useFindReplaceTipTap`
- `useGrammarChecker`
- `useEditorShortcuts`

### 4.5 Hooks composites (Lot A — 2026-04-11)

Ces hooks agrègent plusieurs hooks primitifs et `useEffect` précédemment inline dans `CentralEditor` :

- `useDictation` → `useSpeechToText` + `useSpeechCommands` + 3 useEffects (toasts, stop sur clic) + callbacks start/stop
- `useGrammarPopup` → état popup + useEffect click handler sur `grammar-error`
- `useClipboardActions` → handleCut / handleCopy / handlePaste avec traçabilité `logAction`
- `useEditorUIState` → wordCount, isDragging, handleResizeStartWrapper (désormais wired)

---

## 5. Appels backend effectués

---

### 5.1 Sauvegarde de rubrique

Endpoint :

PUT /api/rubriques/{id}/

Responsabilité :

- persister le contenu XML
- déclencher une révision si nécessaire

---

### 5.2 Vérification grammaticale

Endpoint :

POST /api/orthographe/

Responsabilité :

- analyser le texte
- retourner des suggestions

---

## 6. Données manipulées

---

### XML (contenu principal)

- format DITA
- stocké dans le buffer
- synchronisé avec TipTap

---

### JSON TipTap

- représentation interne de l’éditeur
- jamais envoyé au backend

---

## 7. Transformations critiques

---

### XML → TipTap

- parsing via `parseXmlToTiptap`
- dépend des extensions TipTap

---

### TipTap → XML

- sérialisation via `tiptapToXml`
- doit être parfaitement fidèle

---

⚠️ Zone à très haut risque

- perte de données possible
- erreurs invisibles côté UI

---

## 8. Écarts avec l’architecture cible

---

### 8.1 Complexité élevée

- trop de hooks dans un seul composant
- logique difficile à suivre

---

### 8.2 Dépendance forte au buffer

- normal mais critique
- toute erreur = perte de contenu

---

### 8.3 Absence de gestion de conflits

- pas de version serveur vs client
- risque futur

---

## 9. Risques et impacts

---

### 9.1 Perte de contenu

- bug critique
- impact utilisateur majeur

---

### 9.2 Désynchronisation XML / TipTap

- contenu corrompu
- publication incorrecte

---

### 9.3 Performance

- parsing XML coûteux
- debounce nécessaire (déjà en place)

---

## 10. Dépendances en cascade

---

CentralEditor impacte directement :

- LeftSidebar (navigation bloquée)
- XmlBufferStore (état global)
- Backend (révisions)
- Publication (qualité du contenu)

---

## 11. Verdict architectural

🟡 Acceptable mais critique

---

### Points forts

- séparation structure / contenu respectée
- logique centralisée dans des hooks
- flux global cohérent

---

### Points faibles

- complexité élevée
- dépendances nombreuses
- zone à risque critique (conversion XML)

---

### Priorité

Haute

CentralEditor est le cœur du système.

Toute évolution doit être :
- maîtrisée
- testée
- documentée

---

# ✔️ Fin de la cartographie CentralEditor