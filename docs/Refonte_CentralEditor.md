# Refonte du CentralEditor – Roadmap & Suivi

Document de référence pour suivre l’avancement de la refonte progressive du composant `CentralEditor` et de son écosystème (XML, TipTap, stores, hooks).  
Ce document est synthétique, durable, et conçu pour un travail non linéaire dans le temps.

---

# 🧭 Vue d’ensemble du plan

La refonte est organisée en **4 phases**, à mener progressivement :

1. **Phase 1 – Fiabilisation du buffer & synchronisation TipTap (FAIT)**
2. **Phase 2 – Allègement du CentralEditor (EN COURS)**
3. **Phase 3 – Parsing XML ⇄ TipTap complet (À VENIR)**
4. **Phase 4 – Sauvegarde backend & validation XML DITA (À VENIR)**

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

# 🔧 Phase 2 — Refactor structurel du CentralEditor (EN COURS)

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
- [ ] Réduire les `useEffect` trop complexes
- [ ] Rassembler les callbacks liés aux panels dans un hook

### 📝 Notes
L’objectif n’est **pas de changer le comportement**, mais d’obtenir un `CentralEditor.tsx` :
- plus léger,
- plus lisible,
- plus testable,
- mieux structuré pour les phases suivantes.

---

# 📦 Phase 3 — Parsing XML ⇄ TipTap complet (À FAIRE)

### 🎯 Objectifs
- Comprendre *toutes* les balises DITA utilisées dans Documentum.
- Convertir correctement :
  - DITA XML → JSON TipTap  
  - JSON TipTap → DITA XML
- Aligner les extensions TipTap avec les balises XML attendues.

### 🧩 Tâches
#### 3.1 — Parsing XML → TipTap
- [ ] Étendre `parseXmlToTiptap`
- [ ] Support de toutes les balises DITA (concept, task, step, note…)
- [ ] Support des attributs XML (id, audience, type…)

#### 3.2 — Sérialisation TipTap → XML
- [ ] Refonte complète de `tiptapToXml`
- [ ] Round-trip tests `xml → json → xml`
- [ ] Indentation propre et règles cohérentes

#### 3.3 — Tests
- [ ] Créer `tests/dita_conversion.spec.ts`
- [ ] Ajouter des cas complexes (tables, listes, nested sections…)

### 📝 Notes
C’est la phase la plus technique, mais la plus critique pour assurer la fidélité DITA.

---

# 💾 Phase 4 — Sauvegarde backend & validation XML (À FAIRE)

### 🎯 Objectifs
- Implémenter une sauvegarde réelle côté Django.
- Gérer le statut `saved` après un retour serveur.
- Intégrer un endpoint de validation XML (`xmllint` / DITA-OT).
- Finaliser le workflow complet de rédaction.

### 🧩 Tâches
#### 4.1 — Hook `useRubriqueSave`
- [ ] Sérialisation XML depuis le buffer
- [ ] Appel API `/rubriques/{id}/`
- [ ] Mise à jour `status = "saved"` dans Zustand
- [ ] Reset du `useRubriqueChangeTracker`

#### 4.2 — Validation XML
- [ ] Endpoint côté Django
- [ ] Feedback visuel dans `CentralEditor` (panneau erreurs)

#### 4.3 — UX
- [ ] Bouton “Enregistrer”
- [ ] Modale “Quitter sans enregistrer ?”
- [ ] Sauvegarde automatique (optionnelle)

### 📝 Notes
C’est la phase qui activera toute la chaîne “rédaction → versionning → validation → publication”.

---

# 📘 Annexes

### 🔍 Historique des validations Cursor
- [x] Phase 1 validée (buffer + sync + guard)
- [ ] Phase 2 en cours
- [ ] Phases 3 et 4 à planifier

### 📌 Ici se noteront vos remarques, problèmes, ou TODO futurs
- …

---

# ✔️ Fin du document
