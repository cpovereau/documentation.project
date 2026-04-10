# Documentum – Suivi projet backend

> **Objet** : suivi structuré des validations, décisions et ajustements à conduire sur le backend Documentum
>
> **Statut** : document de pilotage (vivant)
>
> **Rôle** : assurer un réalignement maîtrisé du backend avec la cible architecturale validée, sans régression fonctionnelle.

---

## 1. Règles d’usage du document

- Ce document **ne contient pas de code**.
- Il trace :
  - les constats factuels,
  - les décisions à acter,
  - les validations à réaliser,
  - l’état d’avancement.
- Toute modification backend significative doit :
  - soit s’appuyer sur une décision déjà actée ici,
  - soit donner lieu à une nouvelle entrée.

---

## 2. État initial (socle validé)

### 2.1. Référentiel canonique backend

- 📄 Document de référence : **Documentum – Référentiel Backend Canonique**
- Statut : **à valider définitivement**
- Action :
  - [ ] Relecture complète
  - [ ] Ajustements éventuels
  - [ ] Validation formelle

Responsable : Christophe

---

## 3. Création de projet

### 3.1. Constat

- Deux portes d’entrée coexistent :
  - `POST /api/projets/`
  - `POST /projet/create/`
- Les garanties de complétude ne sont pas équivalentes.

### 3.2. Risques identifiés

- Projets sans map master
- Absence de rubrique racine
- Cas limites difficiles à diagnostiquer côté frontend

### 3.3. Décision cible

- Une seule porte d’entrée : `POST /api/projets/`
- Garantie systématique :
  - version active
  - map master
  - rubrique racine
  - MapRubrique racine

### 3.4. Actions à conduire

- [x] Neutraliser `POST /api/projets/` pour empêcher les créations incomplètes
- [x] Maintenir temporairement `POST /projet/create/` comme seule route fonctionnelle
- [ ] Intégrer le workflow complet dans `ProjetViewSet.create()`
- [ ] Extraire l’orchestration dans un service métier dédié
- [ ] Supprimer l’endpoint `/projet/create/`

Statut : **à faire**

---

## 4. Gestion des maps

### 4.1. Constat

- Deux handlers pour `/api/maps/` :
  - `MapViewSet`
  - `CreateMapView`

### 4.2. Risques identifiés

- Comportement non déterministe selon l’ordre de résolution
- Dette technique silencieuse

### 4.3. Décision cible

- Un seul handler : `MapViewSet`
- Suppression de tout endpoint concurrent

### 4.4. Actions à conduire

- [ ] Supprimer `CreateMapView`
- [ ] Vérifier si `/api/maps/` n’a plus qu’un seul handler effectif
- [x] Ajouter `GET /api/maps/{id}/structure/`
- [x] Ajouter `POST /api/maps/{id}/structure/create/`
- [x] Ajouter `POST /api/maps/{id}/structure/reorder/`
- [x] Ajouter `POST /api/maps/{id}/structure/{mapRubriqueId}/indent`
- [x] Ajouter `POST /api/maps/{id}/structure/{mapRubriqueId}/outdent`
- [x] Conserver temporairement les endpoints historiques de compatibilité frontend

Statut : **à faire**

---

## 5. Structure documentaire (MapRubrique)

### 5.1. Constat

- Confusion historique entre :
  - structure (MapRubrique)
  - contenu (Rubrique)
- Endpoints hétérogènes et vocabulaire ambigu

### 5.2. Décision cible

- MapRubrique = structure interne backend
- Jamais manipulé directement par le frontend

### 5.3. Endpoints cibles à valider

- `GET /api/projets/{id}/structure/`
- `GET /api/maps/{id}/structure/`
- `POST /api/maps/{id}/structure/attach/`
- `POST /api/maps/{id}/structure/create/`
- `POST /api/maps/{id}/structure/reorder/`
- `POST /api/maps/{id}/structure/{mapRubriqueId}/indent`

### 5.4. Actions à conduire

- [ ] Cartographier les endpoints existants à supprimer / fusionner
- [ ] Vérifier que tous les appels reposent sur les services métiers existants
- [ ] Marquer explicitement MapRubrique comme **non exposé** au frontend

Statut : **en transition contrôlée**
- canon disponible côté backend
- compatibilité historique maintenue pour le frontend existant

---

## 6. Contenu documentaire (Rubrique)

### 6.1. Constat

- Le contenu XML est correctement isolé
- L’endpoint `PUT /api/rubriques/{id}/` est déjà canonique

### 6.2. Décision cible

- Aucun endpoint structurel ne modifie le contenu
- Aucun endpoint de contenu ne modifie la structure

### 6.3. Actions à conduire

- [ ] Vérifier l’absence d’effets de bord structurels
- [ ] Valider le contrat minimal `RubriqueContentDTO`

Statut : **à valider**

---

## 7. DTO et contrats d’API

### 7.1. Constat

- DTO présents mais parfois polyvalents
- Manque de distinction claire par flux

### 7.2. Décision cible

- DTO orientés par intention :
  - navigation
  - édition
  - publication

### 7.3. Actions à conduire

- [ ] Lister les DTO existants
- [ ] Identifier les usages multiples problématiques
- [ ] Proposer une normalisation progressive

Statut : **à analyser**

---

## 8. Sécurité et robustesse

### 8.1. Points à vérifier

- Transactions sur opérations structurelles
- Gestion des erreurs métier
- Logs explicites sur actions critiques

### 8.2. Actions à conduire

- [ ] Audit rapide des services critiques
- [ ] Vérification des rollback implicites

Statut : **à planifier**

---

## 9. Synthèse d’avancement

| Domaine                | Statut                                                     |
| ---------------------- | ---------------------------------------------------------- |
| Référentiel backend    | Validé comme **cible**, mais état transitoire à documenter |
| Création projet        | **Partiellement sécurisée**                                |
| Maps                   | **Partiellement rationalisées**                            |
| Structure documentaire | **Lot 1 et Lot 3 validés**                                 |
| Contenu documentaire   | À valider                                                  |
| DTO                    | En cours de normalisation                                  |
| Robustesse             | Partiellement couverte                                     |

---

> **Ce document est la colonne vertébrale du réalignement backend.**
>
> Toute décision non tracée ici est considérée comme non actée.

**Fin du document – Suivi projet backend**

