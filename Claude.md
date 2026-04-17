# 🧠 CLAUDE.md — Cadre d’exécution du projet Documentum

Ce fichier définit les règles **obligatoires** à respecter par toute IA intervenant sur le projet.

Ces règles priment sur toute autre instruction implicite.

---

# 🏛 0. RÉFÉRENTIEL DE GOUVERNANCE (PRIORITAIRE)

Claude doit systématiquement se référer aux documents suivants :

- docs/00_REFERENTIEL/40_GOVERNANCE/gov_principles.md
- docs/00_REFERENTIEL/40_GOVERNANCE/gov_forbidden-patterns.md
- docs/00_REFERENTIEL/40_GOVERNANCE/gov_risk-areas.md
- docs/00_REFERENTIEL/40_GOVERNANCE/gov_decision-log.md

👉 Ces documents font autorité sur :
- les règles de conception
- les patterns interdits
- les zones à risque
- les décisions d’architecture

👉 En cas de conflit :
CES DOCUMENTS PRIMENT sur toute autre instruction.

---

# 🔴 1. RÈGLE FONDAMENTALE

Toute évolution doit être :

* cohérente avec le référentiel
* traçable
* documentée

👉 Une réponse sans impact documentaire est invalide.

---

# 📚 2. IMPACT DOCUMENTAIRE (OBLIGATOIRE)

Toute réponse doit inclure :

## Impact documentaire

* Documents à modifier
* Documents à créer
* Mise à jour de l’index
* Decision log (si applicable)

---

# 🧩 3. ARCHITECTURE NON NÉGOCIABLE

## 3.1 Séparation stricte

* Structure ≠ contenu
* Backend ≠ frontend
* UI ≠ logique métier

👉 Aucune proposition ne doit violer ces règles.

---

## 3.2 Backend

* DRF + services métiers
* aucune logique dans les ViewSets
* endpoints canoniques uniquement

---

## 3.3 Frontend

* composants = affichage uniquement
* logique = hooks
* API = client centralisé

---

# 🔄 4. MÉTHODE DE TRAVAIL

Cycle obligatoire :

Analyse
→ Décision
→ Documentation
→ Implémentation
→ Vérification

👉 Ne jamais proposer directement du code sans passer par l’analyse.

---

# 🧠 5. GESTION DE LA COMPLEXITÉ DES RÉPONSES

Claude doit évaluer la complexité de la tâche demandée.

Si la réponse :
- est longue
- implique plusieurs fichiers
- nécessite une génération volumineuse

👉 Claude doit :

1. proposer une structuration en étapes
2. signaler le risque de réponse incomplète
3. proposer de découper la tâche

Exemple :

"Cette tâche est volumineuse, je propose de la découper en plusieurs étapes pour garantir une réponse complète et fiable."

👉 Claude ne doit jamais :
- tenter de tout produire en une seule réponse risquée
- générer un contenu tronqué sans avertissement

---

# 🔍 6. VÉRIFICATION AVANT RÉPONSE

Avant toute proposition, Claude doit :

1. vérifier la cohérence avec le référentiel existant
2. éviter toute duplication de logique ou de document
3. s'assurer que la réponse s'inscrit dans la structure projet

👉 Si un doute existe :
Claude doit le signaler avant de proposer une solution

---

# ⚠️ 7. ZONES À RISQUE (CRITIQUES)

Claude doit être particulièrement vigilant sur :

* buffer XML (perte de données)
* parsing XML ⇄ TipTap
* versioning
* synchronisation frontend/backend

👉 Toute modification dans ces zones doit être explicitement signalée.

---

# 🚫 8. PATTERNS INTERDITS

Claude ne doit jamais :

* ajouter de la logique métier dans un composant React
* faire un appel API hors client centralisé
* dupliquer un état global
* modifier silencieusement le contenu

---

# 📂 9. INDEX DOCUMENTAIRE

Claude doit :

* proposer l’ajout à l’index pour tout nouveau document
* vérifier la cohérence après modification

👉 Un document non indexé est inexistant.

---

# 🧾 10. DECISION LOG

Obligatoire si :

* modification d’architecture
* nouvelle règle métier
* changement de comportement global

---

# 🎯 11. OBJECTIF GLOBAL

Maintenir en permanence :

* cohérence métier
* cohérence technique
* cohérence documentaire

---

# ✔️ FIN
