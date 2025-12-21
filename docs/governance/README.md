# Documentum – Governance

Ce dossier contient la **gouvernance de conception** du projet Documentum.

Il ne s’agit pas de documentation technique ni fonctionnelle,  
mais d’une **mémoire normative et consciente du projet**.

Son objectif est de :
- préserver la cohérence globale,
- éviter les régressions par oubli,
- documenter les choix structurants,
- guider les évolutions futures.

---

## Intention

Documentum est un projet complexe, évolutif et à forte contrainte métier.  
Sa qualité repose moins sur des solutions ponctuelles que sur la **cohérence dans le temps**.

Cette gouvernance sert de :
- boussole (ce qui guide les décisions),
- garde-fou (ce qui ne doit plus être fait),
- radar (les zones à risque),
- mémoire (pourquoi certains choix ont été faits).

---

## Contenu du dossier

- **`principles.md`**  
  Les principes invariants du projet.  
  Ce qui ne doit pas changer sans remise en question formelle.

- **`forbidden-patterns.md`**  
  Les pratiques, patterns et raccourcis explicitement interdits.  
  Ce qui a été testé, évalué et rejeté.

- **`risk-areas.md`**  
  Les zones de vigilance active.  
  Là où une évolution nécessite une attention particulière.

- **`decision-log.md`**  
  L’historique des décisions structurantes.  
  La mémoire rationnelle du projet.

---

## Règle d’usage

- Ces documents font autorité.
- Une évolution qui les contredit doit être :
  - consciente,
  - argumentée,
  - et consignée dans le `decision-log.md`.

Ils ne sont pas là pour ralentir le projet,  
mais pour **éviter de devoir corriger demain ce qu’on peut anticiper aujourd’hui**.

---

## Esprit

Cette gouvernance est volontairement :
- légère,
- lisible,
- maintenable.

Peu de règles, mais des règles assumées.

La cohérence est un choix.
