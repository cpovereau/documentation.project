# Documentum – Cartographie Frontend : CentralEditor

---

## 1. Rôle fonctionnel réel

- **Rôle actuel :**
  - Composant central de l’édition de contenu DITA (texte structuré XML ↔ TipTap JSON).
  - Orchestration complète de la zone d’édition (TipTap v3), gestion injection/récupération XML, synchronisation état local (Zustand), gestion du buffer de rubrique, grammatique, dictée vocale, panneau d’historique, fonctions find/replace, gestion des panneaux contextuels (dock question/exercice), gestion des raccourcis, surcouche de sauvegarde.
  - Présence de composants enfants : `EditorHeader`, `EditorToolbar`, panneaux d’édition question/exercice, gestion du mode preview, popup d’aide à la suggestion, etc.

- **Écart éventuel :**
  - Aucun écart évident entre le rôle observé et l’attendu ; le composant assume bien la centralité éditoriale telle que définie.

---

## 2. Flux métier pris en charge

| Flux                                 | Déclencheur UI                               | Hook / Contexte                      | DTO                    | Endpoint actuel                    | Endpoint cible                 |
|---------------------------------------|----------------------------------------------|--------------------------------------|------------------------|------------------------------------|-------------------------------|
| Chargement rubrique pour édition      | Sélection de rubrique (prop rubriqueId)      | useDitaLoader, useXmlBufferStore     | string (xml), Rubrique | Aucun appel direct (buffer local)  | GET /api/rubriques/{id}/      |
| Synchronisation buffer XML ↔ éditeur  | Update éditeur TipTap                        | useXmlBufferSync, xmlBufferStore     | string (xml)           | Aucun appel direct                 | -                             |
| Sauvegarde rubrique                   | Action "sauvegarde" via UI                   | useRubriqueSave                      | Rubrique (contenant xml) | PATCH /rubriques/{id}/             | PATCH /api/rubriques/{id}/    |
| Vérification grammaticale             | Automatique à l’update / clic                | useGrammarChecker, PopupSuggestion   | string (texte brut)    | API LanguageTool (probablement externe/indirect) | (hors scope backend canonique) |
| Dictée vocale (insertion de texte)    | Icône micro, commande vocale                 | useSpeechToText, useSpeechCommands   | string (texte)         | Aucun                               | Aucun                         |

> 💡 Les flux "find/replace", "historique", "log action" et "panneaux contextuels" sont 100% frontend/local (aucun flux réseau) : pas de DTO, pas d’endpoint concerné.

---

## 3. Appels backend effectués

- **PATCH /rubriques/{rubriqueId}/**  
  - **Responsabilité réelle :** sauvegarde du contenu XML pour une rubrique donnée.
  - **Conformité :**  
    - 🟡 Toléré temporairement (appel direct sur `/rubriques/` sans `/api/` explicite selon certaines conventions, mais l’harmonisation dépend du backend).
- **Aucun GET direct depuis CentralEditor :**  
  - Le chargement se fait via Zustand, supposant que le XML est préchargé ailleurs.

---

## 4. États et contextes consommés

- **Zustand :**
  - `xmlBufferStore` : central (getXml, setXml, setStatus), propriétaire réel du buffer XML de chaque rubrique.
- **État local :**
  - États critiques : wordCount, findValue, replaceValue, batchMode, isDictating, isDragging, popup.
- **Contextes React :**
  - Aucun contexte React natif utilisé ; toute la logique de partage passe par Zustand ou des hooks locaux spécialisés.
- **Principales dépendances :**  
  - TipTap Editor (instance), gestion d’effets synchronisée à l’identifiant rubrique.

---

## 5. DTO manipulés

- **DTO consommés :**
  - `Rubrique` (api.ts : interface conforme aux serializers backend : id, titre, contenu_xml…)
  - String XML (bufferisé et échangé dans Zustand)
- **DTO produits :**
  - `Rubrique` (lors de la sauvegarde PATCH)
- **Transformations locales :**
  - XML → TipTap JSON : via hook `useDitaLoader` et utilitaire `parseXmlToTiptap`
  - TipTap JSON → XML : via hook `useXmlBufferSync` et utilitaire `tiptapToXml`
- **Observations :**
  - Aucune surcharge ou confusion DTO frontal / backend détectée.
  - Les buffers intermédiaires sont typés localement mais basculent sur du string (xml) et du json (TipTap) sans typage métier supplémentaire.

---

## 6. Écarts avec le backend canonique

- **Appels hors contrat :**
  - PATCH opéré sur `/rubriques/{id}/` (à harmoniser si contract nommage `/api/rubriques/` attendu)
- **Logiques compensatoires frontend :**
  - Synchronisation buffer XML locale pour éviter roundtrips vers le backend à chaque frappe.
  - Injection manuelle du XML dans TipTap (optimisations anti-boucle).
  - Simulation locale de l’historique et de la grammaire (tout “mémoire de travail” : non contractualisé).
- **Confusions structure/contenu :**
  - Aucune confusion détectée : la séparation XML (stockage) ↔ TipTap JSON (édition) est respectée.

---

## 7. Risques et impacts

- **Impact potentiel d’un réalignement backend :**
  - Si path/API de la rubrique évolue, tout le mécanisme de sauvegarde et chargement doit être réaligné (central, toute l’édition dépendante).
  - La logique du buffer local implique des risques en cas de désynchronisation ou de flux multi-éditeur (collaboration).
- **Sensibilité :**
  - Composant critique (toute l’édition, dépendances multiples).
- **Dépendances en cascade :**
  - Toute modification structurelle impacte les hooks d’édition, les panneaux contextuels, la synchronisation, le buffer global, et tous les flux parents (Desktop, ProductDocSync, etc.).

---

## 8. Verdict architectural

- 🟡 Conforme sous contrainte  
  Composant central fidèle au rôle attendu et à la logique métier, mais dépend fortement de la discipline du buffer local et d’une nomenclature précise côté backend. Tout écart ou évolution backend a un impact fort.

---

> **Incertitudes signalées :**  
> - L’utilisation effective d’un endpoint `/api/` ou `/rubriques/` dépend du backend au moment T ; vérifier à l’échelle projet si `/api/rubriques/` est la vérité canonique.  
> - La conformité patches DTO suppose que `contenu_xml` colle strictement à la structure attendue par le backend : à revalider en cas d’évolution du schéma backend.

---

**Fin de cartographie pour CentralEditor.**



