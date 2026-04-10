# Documentum – Risk Areas

Ce document recense les **zones à risque connues** du projet Documentum.

Il ne s’agit pas de défauts, mais de zones où :
- la complexité est élevée,
- les impacts sont transverses,
- les erreurs coûtent cher à corriger.

Avant toute évolution dans l’une de ces zones, une **analyse consciente** est requise.

---

## 1. Gestion du buffer de rubrique

### Risques identifiés
- Perte de contenu non sauvegardé
- Incohérence entre état visuel et état réel
- Écrasement silencieux lors d’un changement de contexte

### Points de vigilance
- Toujours connaître le statut du buffer (`ready`, `modified`, `saved`, etc.)
- Bloquer ou confirmer toute action destructrice
- Prévoir une UX explicite (popup, message, action volontaire)

### Règle implicite
Aucune navigation ne doit pouvoir détruire un buffer sans signalement clair.

---

## 2. Import et remplacement des médias

### Risques identifiés
- Duplication de fichiers
- Rupture de lien dans la documentation
- Noms incohérents ou non conformes
- Remplacement involontaire d’un média existant

### Points de vigilance
- Génération déterministe des noms côté backend
- Confirmation explicite avant remplacement
- Réinitialisation complète du state à chaque ouverture de modale
- Validation stricte des formats autorisés

### Règle implicite
Un média est une référence partagée, pas un asset jetable.

---

## 3. Synchronisation Frontend / Backend

### Risques identifiés
- Maquettes impossibles à raccorder
- États frontend irréalistes
- Hypothèses backend implicites et fausses

### Points de vigilance
- Conserver les identifiants même en mock
- Anticiper les structures de réponse réelles
- Centraliser les appels API dès le départ
- Préparer les effets conditionnels

### Règle implicite
Une maquette ne doit jamais bloquer l’industrialisation.

---

## 4. Versioning (projets, rubriques, fonctionnalités)

### Risques identifiés
- Confusion entre versions
- Effets de bord lors du clonage
- Perte de traçabilité documentaire
- Mauvaise gestion des évolutions successives d’une même fonctionnalité

### Points de vigilance
- Ne jamais supposer l’unicité d’une évolution
- Distinguer clairement version, clone et instance
- Centraliser la logique de versioning
- Prévoir les tables de liaison nécessaires

### Règle implicite
Le versioning est un sujet métier, pas un détail technique.

---

## 5. États globaux et synchronisation

### Risques identifiés
- Désynchronisation entre écrans
- États fantômes ou obsolètes
- Effets de bord non maîtrisés

### Points de vigilance
- Identifier clairement la source de vérité
- Éviter les duplications locales
- Nettoyer explicitement les états lors des changements de contexte

### Règle implicite
Un état mal maîtrisé est une dette invisible.

---

## 6. Extensions TipTap personnalisées

### Risques identifiés
- Incompatibilité avec TipTap v3
- Régression sur des extensions existantes
- Extensions trop spécifiques ou non réutilisables

### Points de vigilance
- Respect strict des conventions d’export
- Tests sur plusieurs contextes d’éditeur
- Compatibilité avec les formats de sortie

### Règle implicite
Une extension est une brique du socle, pas un hack local.

---

## 7. UX transversale (Desktop / ProductDocSync)

### Risques identifiés
- Rupture de cohérence entre écrans
- Comportements contradictoires
- Régressions fonctionnelles croisées

### Points de vigilance
- Évaluer chaque évolution sur les deux écrans
- Partager les composants dès que possible
- Maintenir la symétrie des comportements

### Règle implicite
Deux écrans, un seul produit.

---

## 8. Dette technique masquée

### Risques identifiés
- “On verra plus tard”
- Solutions temporaires non suivies
- Logique implicite non documentée

### Points de vigilance
- Identifier explicitement toute dette
- La documenter ou la planifier
- Refuser la dette silencieuse

### Règle implicite
Ce qui n’est pas nommé ne sera jamais traité.

---

## 9. Règle finale de vigilance

Toute évolution touchant une zone listée ici doit :
- être annoncée consciemment,
- être évaluée,
- et, si nécessaire, être consignée dans le `decision-log.md`.

L’ignorance d’une zone à risque est une faute de conception, pas un oubli.
