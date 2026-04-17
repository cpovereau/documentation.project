# Refonte du CentralEditor – Roadmap & Suivi

Document de référence pour suivre l’avancement de la refonte progressive du composant `CentralEditor` et de son écosystème (XML, TipTap, stores, hooks).  
Ce document est synthétique, durable, et conçu pour un travail non linéaire dans le temps.

---

# 🧭 Vue d’ensemble du plan

La refonte est organisée en **5 phases**, toutes terminées :

1. **Phase 1 – Fiabilisation du buffer & synchronisation TipTap ✅**
2. **Phase 2 – Allègement structurel du CentralEditor ✅**
3. **Phase 3 – Parsing XML ⇄ TipTap complet ✅**
4. **Phase 4 – Sauvegarde backend & validation XML DITA ✅**
5. **Phase 5 – Sécurisation du guard de navigation ✅**

Chaque phase contient des tâches validables individuellement.

---

# ✅ Phase 1 — Synchronisation XML & guard (TERMINÉE)

### 🎯 Objectifs
- Garantir qu’aucune modification n’est perdue.  
- Centraliser le buffer XML et son état (`dirty/saved/error`).  
- Bloquer les changements de rubrique/projet en cas de contenu non sauvegardé.

### ✔ Réalisé
- Ajout du `status` dans `xmlBufferStore`.
- Création du hook `useXmlBufferSync`.
- Intégration complète dans `CentralEditor.tsx`.
- Mise en place du **garde-fou** dans `LeftSidebar` via `getStatus()`.
- Validation par Cursor : cohérence globale confirmée.

### 📝 Notes
Cette phase rend le flux **TipTap → XML → Buffer → Guard → UI** pleinement stable.

---

# 🔧 Phase 2 — Refactor structurel du CentralEditor (TERMINÉ)

### 🎯 Objectifs
- Alléger `CentralEditor.tsx`, devenu trop massif.
- Extraire l’UI (toolbar, menus, panneaux) dans des composants dédiés.
- Extraire la logique (modales, dialogues, états) dans des hooks dédiés.
- Préparer une architecture propre avant la sauvegarde ou le parsing avancé.

### 🧩 Tâches à réaliser
#### 2.1 — Extraction UI
- [X] Créer `EditorToolbar.tsx`
- [X] Créer `BlockTypeMenu.tsx` / `InlineMenu.tsx` si besoin
- [X] Créer `EditorPanels/HistoryPanel.tsx`
- [X] Créer `EditorPanels/FindReplacePanel.tsx`
- [X] Déporter les icônes, boutons, menus hors du fichier principal

#### 2.2 — Extraction logique
- [X] Créer `useEditorDialogs` (ouverture/fermeture des panels)
- [X] Créer `useEditorUIState` (états locaux de l’éditeur)
- [X] Déporter la gestion de la dictée dans `useDictation` (déjà existant, à isoler)

#### 2.3 — Nettoyage du fichier
- [X] Supprimer toute référence à `editor.getHTML()`
- [X] Remplacer par `getXml(selectedMapItemId)` partout dans la vue XML
- [X] Réduire les `useEffect` trop complexes (extraits dans useDictation + useGrammarPopup)
- [X] Rassembler les callbacks liés aux panels dans un hook (handleOpenFind/History inline, ok car triviaux)

#### 2.4 — Lot A : extraction hooks manquants (2026-04-11)
- [X] Créer `useDictation` : dictée vocale, toasts, stop sur clic, callbacks start/stop
- [X] Créer `useGrammarPopup` : click handler grammaire, état popup
- [X] Créer `useClipboardActions` : handleCut / handleCopy / handlePaste + logAction
- [X] Wirer `useEditorUIState` (existait mais n'était pas utilisé) : wordCount, isDragging, handleResizeStart
- [X] Nettoyer `useEditorUIState` : retrait de popup (→ useGrammarPopup) et lastXmlValidation (→ useEditorDialogs)
- [X] Supprimer le `useEffect` de debug rubriqueId
- [X] Supprimer le `console.log` de montage composant
- **Résultat : CentralEditor.tsx réduit de 444 → ~200 lignes (-55%)**

#### 2.5 — Lot A.5 : remise en cohérence post-refactor (2026-04-11)
- [X] `wordCount` : brancher `ui.setWordCount` dans `onUpdate` de `useEditor` (bug historique)
- [X] `isDictating` : supprimer le `useState` fantôme, exposer `isDictating: isRecording` dans `useDictation`
- [X] `GrammarHighlight.ts` : corriger `this.getState()(state)` → `this.getState(state)` (0 décoration sans ce fix)
- [X] `GrammarHighlight.ts` : corriger `.join(',')` sur `{value:string}[]` → `.map(r => r.value).join(',')`
- [X] `useGrammarChecker.ts` : transmettre `replacements: m.replacements` dans le dispatch vers l'extension
- [X] Supprimer `import type { Editor }` inutilisé dans `CentralEditor.tsx`
- [X] Retirer l'instanciation de `useClipboardActions` (sorties non utilisées dans l'UI — hook prêt mais pas branché)
- [X] Remplacer `MutableRefObject` (déprécié React 19) par `RefObject` dans `useDictation`

### 📝 Notes
L’objectif n’est **pas de changer le comportement**, mais d’obtenir un `CentralEditor.tsx` :
- plus léger,
- plus lisible,
- plus testable,
- mieux structuré pour les phases suivantes.

---

# 📦 Phase 3 — Parsing XML ⇄ TipTap complet (TERMINÉ)

### 🎯 Objectifs
- Comprendre *toutes* les balises DITA utilisées dans Documentum.
- Convertir correctement :
  - DITA XML → JSON TipTap  
  - JSON TipTap → DITA XML
- Aligner les extensions TipTap avec les balises XML attendues.

### 🧩 Tâches
#### 3.1 — Parsing XML → TipTap
- [X] Étendre `parseXmlToTiptap`
- [X] Support de toutes les balises DITA (concept, task, step, note…)
- [X] Support des attributs XML (id, audience, type…)

#### 3.2 — Sérialisation TipTap → XML
- [X] Refonte complète de `tiptapToXml`
- [X] Round-trip tests `xml → json → xml`
- [X] Indentation propre et règles cohérentes

#### 3.3 — Tests
- [X] Créer `tests/dita_conversion.spec.ts`
- [X] Ajouter des cas complexes (tables, listes, nested sections…)

### 📝 Notes
C’est la phase la plus technique, mais la plus critique pour assurer la fidélité DITA.

---

# 💾 Phase 4 — Sauvegarde backend & validation XML (TERMINÉ)

### 🎯 Objectifs
- Implémenter une sauvegarde réelle côté Django.
- Gérer le statut `saved` après un retour serveur.
- Intégrer un endpoint de validation XML.
- Finaliser le workflow complet de rédaction.

### 🧩 Tâches
#### 4.1 — Hook `useRubriqueSave`
- [x] Sérialisation XML depuis le buffer
- [x] Appel API `/rubriques/{id}/`
- [x] Mise à jour `status = “saved”` dans Zustand
- [x] Reset du `useRubriqueChangeTracker`

#### 4.2 — Validation XML
- [x] Endpoint côté Django (`POST /api/validate-xml/` — `xml.etree.ElementTree`)
- [x] Feedback visuel dans `CentralEditor` (`XmlValidationPanel` inline)

#### 4.3 — UX
- [x] Bouton “Enregistrer”
- [x] Modale “Quitter sans enregistrer ?” (Lot E — voir Phase 5)
- [ ] Sauvegarde automatique (optionnelle — hors périmètre actuel)

#### 4.4 — Lot B : sécurisation complète du flux de sauvegarde (2026-04-11)

**Écarts corrigés :**

| # | Écart | Correction |
|---|---|---|
| E1 | `PATCH /rubriques/{id}/` sans `/api/` → probable 404 | `PATCH /api/rubriques/{id}/` |
| E2 | Navigation guard inactif après save : `setXml` préservait le statut existant → buffer restait “saved” après édition | `useXmlBufferSync` marque `”dirty”` immédiatement (non-debounced) à chaque édition |
| E3 | `resetAfterSave()` appelé même en cas d’échec API (catch interne sans re-throw) | `saveRubrique()` retourne `boolean` ; `resetAfterSave()` conditionné au succès |
| E4 | `saving` state retourné mais non utilisé → double-save possible, aucun retour visuel | `saving` propagé → bouton désactivé + libellé “Enregistrement…” |
| E5 | `PUT` vs `PATCH` selon canon | PATCH conservé (mise à jour partielle, DRF l’accepte). Voir decision-log. |

**Fichiers modifiés :**
- `src/hooks/useSaveRubrique.ts` — chemin `/api/`, retour `boolean`
- `src/hooks/useXmlBufferSync.ts` — `setStatus(“dirty”)` immédiat
- `src/components/ui/CentralEditor.tsx` — `saving` destructuré, `resetAfterSave` conditionnel, `isSaving` passé à EditorHeader
- `src/components/ui/CentralEditor/EditorHeader.tsx` — prop `isSaving`, bouton protégé

#### 4.5 — Lot C : validation XML backend avec feedback visuel (2026-04-11)

- [x] Vue Django `validate_xml_view` (`POST /api/validate-xml/`) — parsing via `xml.etree.ElementTree`, retourne `{valid, errors[{line, col, message}]}`
- [x] Hook `useXmlValidation` — états `validating`, `result`, `runValidation()`, `clearResult()`
- [x] Composant `XmlValidationPanel` — panel inline vert/rouge avec numéro de ligne/colonne
- [x] `useEditorDialogs` allégé : suppression du DOMParser + `alert()`, `validateXml` → `openXmlView`
- [x] `CentralEditor.tsx` — `handleValidateXml` orchestre ouverture vue + appel backend
- [x] `EditorMenuBar` — “Outils > Valider le XML” branché sur `handleValidateXml`

### 📝 Notes
Le workflow complet “rédaction → sauvegarde → validation XML” est opérationnel.

---

# 🔒 Phase 5 — Sécurisation du guard de navigation (TERMINÉ)

### 🎯 Objectifs
- Bloquer toute navigation hors rubrique si le buffer contient du contenu non persisté.
- Couvrir les statuts `"dirty"` ET `"error"` (après échec de sauvegarde).

### 🧩 Tâches

#### 5.1 — Lot D : extension du guard à "error" (2026-04-11)
- [x] Identifier les deux points de guard : `LeftSidebar.tsx` (`hasUnsavedChanges`) et `useConfirmBeforeUnloadRubriqueChange` (dead code)
- [x] Modifier la condition : `=== "dirty"` → `=== "dirty" || === "error"`
- [x] Variable intermédiaire `currentBufferStatus` pour éviter double appel à `getStatus`
- [x] Alignement de `useConfirmBeforeUnloadRubriqueChange` par cohérence

**Fichiers modifiés :**
- `src/components/ui/LeftSidebar.tsx` — condition `hasUnsavedChanges`
- `src/hooks/useConfirmBeforeUnloadRubriqueChange.ts` — alignement (dead code)

#### 5.2 — Lot E : modale "Quitter sans enregistrer ?" (2026-04-11)
- [x] Créer `UnsavedChangesDialog` (3 choix : Enregistrer / Quitter / Annuler)
- [x] Introduire `pendingNavigation: (() => void) | null` dans `LeftSidebar`
- [x] Introduire `requestNavigation(action)` — intercepte si buffer bloquant, exécute sinon
- [x] Instancier `useRubriqueSave(selectedRubriqueId)` dans `LeftSidebar`
- [x] Transformer 6 points de guard (toast + return → `requestNavigation`)
- [x] Retirer les guards internes de `openProject` et `openMap` (gardes remontées aux entry points)
- [x] Garder les dialogs de projet/map guarded via leurs openers (`handleAdd`, `handleLoad`, `openLoadMapDialog`)

**Comportement sur échec de sauvegarde :** modale fermée, navigation annulée, buffer reste `"error"`, toast visible.

**Fichiers créés :**
- `src/components/ui/UnsavedChangesDialog.tsx`

**Fichiers modifiés :**
- `src/components/ui/LeftSidebar.tsx`

### 📝 Notes
- `useConfirmBeforeUnloadRubriqueChange` (beforeunload navigateur) reste dead code — non branché, hors périmètre.
- `resetAfterSave()` non appelé depuis la modale LeftSidebar (cosmétique uniquement — impact nul à la navigation).

---

# 📘 Annexes

### 🔍 Historique des validations Cursor
- [x] Phase 1 validée (buffer + sync + guard)
- [x] Phase 2 validée
- [x] Phase 3 validée
- [x] Phase 4 validée (Lots B + C)
- [x] Phase 5 validée (Lots D + E)

---

# 🐛 Correctif — Bug XML invalide : wrapper `<body>` (2026-04-17)

### Contexte

Bug bloquant identifié après validation des 5 phases : `tiptapToXml()` retourne des fragments multi-racines sans wrapper. Le backend rejette ces fragments via `ET.fromstring()`. L'erreur "contenu XML invalide" apparaît au rechargement de la rubrique.

### Cause racine

`useXmlBufferSync` stocke dans le buffer le résultat brut de `tiptapToXml(json.content)` — une concaténation de nœuds sans racine. Le backend (`Rubrique.clean()`) exige un XML monoracine valide.

### Décision d'implémentation

Voir `gov_decision-log.md` — `2026-04-17 – Format canonique de contenu_xml`.

Format cible : `<body>...nœuds...</body>`

### Fichiers à modifier

| Fichier | Modification |
|---|---|
| `hooks/useXmlBufferSync.ts` | Wrapper `<body>` autour de la sortie `tiptapToXml` avant stockage buffer |
| `hooks/useDitaLoader.ts` | Tolérance chargement : fragments dégradés wrappés `<body>` avant `parseXmlToTiptap` |
| `components/ui/LeftSidebar.tsx` | Template init : `<topic>` → `<body>` |

### Choix `<body>` — décision pragmatique, non définitive

Le wrapper `<body>` est retenu comme **contrat de stabilisation actuel**, pas comme cible architecturale finale.

**Justification pragmatique** :
- `parseXmlToTiptap` supporte nativement `<body>` : aplatit les enfants directs sans effet de bord.
- Le round-trip `<body>` est stable : save → load → save produit toujours `<body>`.
- `<topic>` était détruit à chaque édition (non listé dans `STRUCTURAL_ROOTS`).
- L'IHM ne dispose pas encore de sélecteur de structure DITA (topic/concept/task/reference) : imposer une racine structurelle aujourd'hui serait prématuré.

**Évolution future attendue** :
Quand l'IHM permettra à l'utilisateur de choisir le type DITA d'une rubrique (concept, task, reference, topic…), le contrat `contenu_xml` devra évoluer vers une racine structurelle explicite :
```xml
<concept id="..."><title>...</title><conbody>...</conbody></concept>
```
À ce moment, la migration des données existantes (`<body>`) vers la racine structurelle sera nécessaire. La décision sera tracée dans `gov_decision-log.md` lors de l'implémentation du sélecteur de structure.

### Statut

- [x] Implémentation validée — 2026-04-17

---

### 📌 Ici se noteront vos remarques, problèmes, ou TODO futurs
- 1️⃣ Whitelist d’attributs DITA (partiellement traitée, pas finalisée)
À faire plus tard

 Étendre la whitelist avec :
  class
  conref
  keyref
  outputclass
  scope
  format

 Ajouter un log non bloquant pour attributs ignorés

 Décider :
  whitelist stricte
  ou pass-through contrôlé par type

- 2️⃣ Vérifier Cohérence définitive des noms de nœuds Table
Point probablement traité
  Aujourd’hui :
  table, tableRow, tableCell, tableHeader
  Mais peut-être : 
  mappings dispersés  
  noms historiques (CustomTable, etc.) encore visibles
  
  À faire :
 Verrouiller une seule convention
  côté TipTap ET sérialisation
 
 Centraliser :
  XML_TO_TIPTAP_TAG
  TIPTAP_TO_XML
 
 Supprimer toute logique implicite / fallback


- 3️⃣ Gestion des caractères spéciaux dans <codeblock>
  État actuel
    Limitation connue : & interdit sauf XML valide
    Acceptée consciemment
  
  À faire plus tard (si besoin réel)
    Décider d’une stratégie officielle :
      CDATA optionnelle
      ou échappement conditionnel uniquement dans codeblock

    Documenter la règle (éditeur + backend)

- 4️⃣ Inline avancé (B / I / U / marks)
  À faire PLUS TARD
   Décider comment représenter : bold / italic / underline

    Choisir :
      mapping DITA réel
      ou neutralisation (flatten en texte)

    Ajouter les tests correspondants

 -5️⃣ Normalisation auto-corrigeante (Phase 4)
  État
    Totalement assumée comme hors périmètre actuel

  À garder en TODO
    normalizeProlog
    réordonnancement structurel
   validation table avancée

---

# ✔️ Fin du document
