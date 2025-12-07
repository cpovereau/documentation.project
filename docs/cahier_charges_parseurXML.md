# 📘 CAHIER DES CHARGES — Phase 3 : Conversion XML ⇄ TipTap (Documentum)
*Version 1.0 — 2025-02 — Documentum CCMS*

---

# 1. Objectif général

L’objectif de la Phase 3 est de concevoir, implémenter et tester une chaîne complète et fiable de conversion :

```
DITA XML  ⇄  JSON TipTap  ⇄  Éditeur Documentum
```

Cela inclut :

- un parseur **XML → TipTap** tolérant, intelligent et auto-réparateur  
- un sérialiseur **TipTap → XML** strict, propre et normé  
- un système garantissant un **round-trip stable** :
  ```
  XML → TipTap → XML ≈ XML initial (structurelle)
  ```

---

# 2. Liste complète des balises supportées

Les balises sont classées de manière fonctionnelle selon leur rôle dans Documentum.

---

## 2.1 — Balises Header / Prolog (structure DITA)

| Balise | Notes |
|--------|--------|
| `<title>` | obligatoire |
| `<shortdesc>` | facultatif |
| `<prolog>` | parent des métadonnées |
| `<author>` | nom de l’auteur |
| `<critdates>` | ensemble dates |
| `<created date="…"/>` | date de création |
| `<revised date="…"/>` | date de dernière modification |
| `<metadata>` | parent des métadonnées avancées |
| `<audience>` | audience globale |
| `<prodinfo>` | informations produit |
| `<prodname>` | nom produit |
| `<version>` | version logicielle |
| `<doc-tag type="…">…</doc-tag>` | produit, fonctionnalité, interface, etc. |

---

## 2.2 — Balises contextuelles

| Balise | Usage |
|--------|--------|
| `<audience>` (inline) | ciblage local |
| `<context>` | commercial / formation / technique… |
| `<inline-variable name="…"/>` | variable dynamique |
| `<status-marker value="…"/>` | état documentaire |

---

## 2.3 — Balises de structure

### Topics DITA
- `<topic>`
- `<concept>` + `<conbody>`
- `<task>` + `<taskbody>`
- `<reference>` + `<refbody>`
- `<section>`

### Steps DITA
- `<steps>`
- `<step>`
  - `<cmd>`
  - `<info>`

### Glossaire
- `<glossentry>`

### Pédagogie
- `<question>`
- `<answer>`

### Tables Documentum (version retenue)
- `<custom-table>`
  - `<custom-table-row>`
  - `<custom-table-header>`
  - `<custom-table-cell colspan="x" rowspan="y">`

---

## 2.4 — Balises de mise en forme

### Inline
- `<b>`
- `<i>`
- `<u>`
- `<sup>`
- `<sub>`
- `<code>`
- `<xref>`

### Block
- `<p>`
- `<note>`
- `<example>`
- `<codeblock>`
- `<figure>`  
  - `<title>`  
  - `<image href="…"/>`

---

## 2.5 — Médias

| Balise | Notes |
|--------|--------|
| `<image href="fichier.jpg"/>` | format normalisé |
| `<figure>` avec `<image>` | version structurée |
| `<video src="…"/>` | support vidéo |

---

## 2.6 — Balises / extensions non-exportées vers XML

Extensions TipTap internes :

- GrammarHighlight
- décorations visuelles
- placeholders internes
- metadata techniques du DOM ProseMirror

---

# 3. Gestion des attributs

---

## 3.1 — Attributs obligatoires

| Balise | Attribut obligatoire | Rôle |
|--------|----------------------|------|
| `<image>` | `href` | chemin du média |
| `<video>` | `src` | chemin vidéo |
| `<topic>` / `<concept>` / `<task>` / `<reference>` | `id` | identifiant unique |
| `<created>` / `<revised>` | `date` | date de création / modif |
| `<doc-tag>` | `type` | nature du tag |
| `<inline-variable>` | `name` | clé variable |
| `<status-marker>` | `value` | état documentaire |

Si un attribut obligatoire manque →  
✔️ tentative d’auto-réparation → sinon message d’erreur UI.

---

## 3.2 — Attributs optionnels gérés (liste blanche)

Attributs interprétés par Documentum :

- `colspan`, `rowspan` (tables)
- `outputclass` (mise en forme)
- `alt`, `width`, `height` (image)
- `lang` (codeblocks)
- `id` (anchors)
- `difficulty`, `correct` (pédagogie)

---

## 3.3 — Attributs tolérés (liste grise)

➡️ Tous les attributs non prévus dans la liste blanche :

- `class`
- `style`
- `data-*`
- attributs Word (`w:rsid`, `w:val`, etc.)

Le parseur doit :

- **les conserver exactement**
- **les restituer tels quels**
- **ne jamais les modifier**

---

## 3.4 — Attributs interdits

Attribus purement UI / TipTap :

- `data-placeholder`
- `data-suggestions`
- `class="grammar-error"`
- ids temporaires ProseMirror
- décorations de surlignage

➡️ **Supprimés systématiquement en export XML.**

---

# 4. Politique de sérialisation XML

---

## 4.1 — Indentation

➡️ **4 espaces** pour chaque niveau.

---

## 4.2 — Retours à la ligne

➡️ **LF (`\n`) uniquement**  
Git-friendly, OS-agnostic.

---

## 4.3 — Ordre des balises

### Dans `<prolog>` :  
Ordre strict et imposé :

1. `<author>`  
2. `<critdates>`  
3. `<metadata>`

### Ailleurs  
➡️ ordre libre.

---

## 4.4 — Gestion des balises vides

### ✔️ Métadonnées → **compact `<tag/>` :**

- `<metadata/>`
- `<doc-tag/>`
- `<audience/>`
- `<version/>`
- `<inline-variable/>`
- `<created/>`
- `<revised/>`

### ✔️ Contenu éditorial → **balises développées :**

- `<note></note>`
- `<shortdesc></shortdesc>`
- `<section></section>`
- `<step></step>`
- `<answer></answer>`  
- etc.

---

## 4.5 — Auto-correction structurelle

Comportement intelligent :

| Situation | Correction automatique |
|----------|-------------------------|
| `<topic>` sans `<title>` | ajout `<title>Titre manquant</title>` |
| `<task>` sans `<taskbody>` | ajout `<taskbody></taskbody>` |
| `<steps>` sans `<step>` | création `<step>` minimal |
| Balises mal imbriquées | réorganisation |
| Balises non fermées | fermeture correcte |
| `img`, `image`, `span`, `div` hérités | normalisation vers DITA |
| Éléments illégaux dans `<p>` | extraction + repositionnement |

Le but :  
📌 **Documentum génère toujours un XML valide, stable, DITA-compatible.**

---

## 4.6 — Normalisation des médias

Tous les formats :

- `<image>fichier.jpg</image>`
- `<img src="..."/>`
- `<image src="..." />`

sont convertis en :

```xml
<image href="fichier.jpg"/>
```

---

## 4.7 — Normalisation des espaces et retours

En sortie :

- pas de double espace inutile  
- pas de lignes vides excessives  
- les textes sont conservés mais **nettoyés**  
- les blocs `<codeblock>` ne sont jamais modifiés  

---

# 5. Round-Trip Guarantee (exigence 100%)

```
XML → TipTap → XML
```

Le XML final doit :

- conserver **toutes** les balises  
- conserver **tous** les attributs autorisés  
- être **structurellement équivalent**  
- être **plus propre**
