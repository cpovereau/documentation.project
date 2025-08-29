---
description: A description of your rule
---

## Règle : Bonnes pratiques React/TypeScript

- Utiliser uniquement des **composants fonctionnels** avec `useState`, `useEffect` et hooks personnalisés.
- Préférer des noms explicites comme `handleConfirmClick` ou `onCloseModal`.
- Les props doivent être **typées** avec `interface Props`.
- Grouper les `useEffect` par thème (ex: init, API, cleanup).
- Éviter les effets inutiles lors du re-render (ajouter un `console.log` temporaire si besoin).
- Si un composant dépasse 150 lignes : envisager une extraction (`HeaderSection`, `FooterActions`, etc.)
- Ajouter des **commentaires explicites** au-dessus des `useEffect` ou callbacks critiques.


## Règle : Style Tailwind CSS dans l'application Documentum

- Toujours utiliser les **classes Tailwind** dans l'ordre : position → layout → spacing → border → text → bg → misc.
- Les composants doivent avoir un style cohérent avec les autres (boutons, modales, sidebars).
- Éviter les classes utilitaires conditionnelles mal lisibles : préférer `clsx()` si nécessaire.
- Les classes partagées sont centralisées dans `components/ui/`.


## Règle : Utilisation des hooks Documentum

- Privilégier les hooks personnalisés suivants :
  - `useImportModal()` pour toute logique d'import
  - `useGrammarChecker()` pour les éditeurs enrichis
  - `useRubriqueChangeTracker()` pour surveiller les changements de rubriques
- Ne pas dupliquer la logique dans les composants.
- Regrouper tous les hooks dans `/lib/hooks/` ou `components/ui/`.
- Documenter les hooks avec un bloc JSDoc clair au-dessus de la fonction.


## Règle : Génération des noms d'images/médias

- Chaque image doit suivre le format : `{produit}-{fonctionnalite}-{interface}-{numéro}.jpg`
- L'appel backend `/medias-check-nom/` est obligatoire avant validation de l'import.
- Le numéro est **auto-incrémenté** à partir des fichiers existants en base.
- Ne jamais autoriser une image sans préfixe métier (`USA-AUTH-BTN-001.jpg` par exemple).
- L'association à une rubrique est facultative au moment de l'import.


## Règle : Écrire tous les commentaires en français

- Tous les commentaires de composants, hooks, et modules doivent être en français.
- Utiliser un vocabulaire technique clair : « gestion des props », « appel API », « effet secondaire », etc.
- Éviter les abréviations ou le franglais inutile.
- Expliquer les sections complexes (boucles, maps imbriquées, conditions ternaires).