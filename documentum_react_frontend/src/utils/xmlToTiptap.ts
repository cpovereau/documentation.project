// src/utils/xmlToTiptap.ts

/**
 * ⚙️ Utilitaire de conversion XML DITA ➜ JSON TipTap
 * V3 — support des structures DITA (task, concept, reference…)
 */

export interface TiptapNode {
  type: string;
  attrs?: Record<string, any>;
  content?: TiptapNode[];
  text?: string;
}

// 🧭 Mapping XML -> type TipTap
// Aligné avec vos extensions personnalisées et StarterKit.
const XML_TO_TIPTAP_TAG: Record<string, string> = {
  // blocs de base
  p: "paragraph",
  title: "title",
  shortdesc: "shortdesc",
  body: "body",
  section: "section",
  note: "note",
  codeblock: "codeblock",
  example: "example",

  // tableaux
  table: "Table",
  row: "TableRow",
  entry: "TableCell",     
  thead: "thead",
  tbody: "tbody",
  tgroup: "tgroup",

  // tâches DITA
  task: "task",
  taskbody: "taskbody",
  steps: "steps",
  step: "step",

  // listes DITA (via StarterKit)
  itemizedlist: "bulletList",
  orderedlist: "orderedList",
  listitem: "listItem",

  // médias (supposés alignés avec vos extensions)
  image: "image",
  figure: "figure",
  video: "video",

  // prolog & métadonnées
  prolog: "prolog",
  "rubrique-metadata": "rubriqueMetadata",
  "doc-tag": "docTag",

  // pédagogie de base
  question: "question",
  answer: "answer",

  // structures DITA "topic-like"
  concept: "concept",
  conbody: "conbody",
  reference: "reference",
  refbody: "refbody",
  glossentry: "glossentry",
  xref: "crossReference",

  // variables inline
  variable: "inlineVariable",
};

function mapXmlTagToTiptapType(el: Element): string {
  const raw = el.tagName.toLowerCase();
  return XML_TO_TIPTAP_TAG[raw] ?? raw; // fallback: même nom si non mappé
}

// 🧾 Whitelist d'attributs par type TipTap
// On commence simple : toujours "id", puis on enrichira progressivement.
const ATTR_WHITELIST: Record<string, string[]> = {
  "*": ["id"],

  image: ["id", "href", "src", "alt"],
  crossReference: ["id", "refid"],
  docTag: ["id", "type"],
  inlineVariable: ["id", "name"],
  glossentry: ["id", "termid", "term", "definition"],
};

function extractAttributes(el: Element, type: string): Record<string, any> | undefined {
  const allowAll = !ATTR_WHITELIST[type];

  const attrs: Record<string, any> = {};

  for (const attr of Array.from(el.attributes)) {
  if (allowAll || ATTR_WHITELIST[type]?.includes(attr.name) || ATTR_WHITELIST["*"]?.includes(attr.name)) {
    attrs[attr.name] = attr.value;
  }
}

  // Normalisation spécifique pour certains types
  if (type === "image") {
    const href = el.getAttribute("href") ?? el.getAttribute("src");
    if (href) {
      // Standardisation côté TipTap
      attrs.src = href;
    }
  }

  return Object.keys(attrs).length > 0 ? attrs : undefined;
}

/**
 * Convertit un nœud DOM XML en nœud TipTap JSON (récursif).
 * Gère TEXT_NODE, ELEMENT_NODE, avec quelques cas spéciaux.
 */
export function parseXmlNode(xmlNode: Node): TiptapNode | null {
  // Cas du Texte
  // ⚠️ Pour les codeblocks, on NE doit JAMAIS filtrer les espaces.
  if (xmlNode.nodeType === Node.TEXT_NODE) {
    const text = xmlNode.textContent ?? "";

    // 🎯 si on est dans un <codeblock>, NE PAS filtrer les espaces
    if (xmlNode.parentElement?.tagName.toLowerCase() === "codeblock") {
      return { type: "text", text }; // on garde absolument tout
    }

    // Comportement normal ailleurs
    if (!text.trim()) return null;
    return { type: "text", text: text.trim() }
  }

  // On ignore tout ce qui n'est pas un élément
  if (xmlNode.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const element = xmlNode as Element;
  const tagName = element.tagName.toLowerCase();
  const type = mapXmlTagToTiptapType(element);
  const attrs = extractAttributes(element, type);

  // 🧨 Cas particulier PRIORITAIRE : <codeblock>
  // -----------------------------------------------
  // On NE traite surtout PAS les enfants individuellement.
  // On NE supprime PAS les blancs / indentations.
  // On garde le texte EXACTEMENT tel qu'il est dans le XML.
  if (tagName === "codeblock") {
    return {
      type: "codeblock",
      attrs,
      content: [
        {
          type: "text",
          text: element.textContent ?? "",
        },
      ],
    };
  }

  // Cas général : parcourir les enfants récursivement
  const children: TiptapNode[] = [];
  for (const child of Array.from(element.childNodes)) {
    const parsedChild = parseXmlNode(child);
    if (parsedChild) {
      children.push(parsedChild);
    }
  }

    // 🧮 ========== TABLE HANDLING (xml → TipTap) ==========
  if (tagName === "table") {
    const tableAttrs = attrs;
    const rows: TiptapNode[] = [];

    /**
     * Traite une section (thead/tbody ou table directement)
     * et ajoute les lignes correspondantes dans `rows`.
     */
    const processSection = (sectionEl: Element, isHeader: boolean) => {
      for (const rowEl of Array.from(sectionEl.children)) {
        if (rowEl.tagName.toLowerCase() !== "row") continue;

        const cells: TiptapNode[] = [];

        for (const entryEl of Array.from(rowEl.children)) {
          if (entryEl.tagName.toLowerCase() !== "entry") continue;

          const cellType = isHeader ? "tableHeader" : "tableCell";
          const cellAttrs = extractAttributes(entryEl, cellType);
          const cellChildren: TiptapNode[] = [];

          for (const child of Array.from(entryEl.childNodes)) {
            const parsedChild = parseXmlNode(child);
            if (parsedChild) {
              cellChildren.push(parsedChild);
            }
          }

          const cellNode: TiptapNode = { type: cellType };
          if (cellAttrs) cellNode.attrs = cellAttrs;
          if (cellChildren.length > 0) cellNode.content = cellChildren;

          cells.push(cellNode);
        }

        rows.push({
          type: "tableRow",
          content: cells,
        });
      }
    };

    // On cherche des <tgroup> à l'intérieur de la table
    const tgroups = Array.from(element.children).filter(
      (el) => el.tagName.toLowerCase() === "tgroup"
    ) as Element[];

    if (tgroups.length > 0) {
      for (const tgroupEl of tgroups) {
        const children = Array.from(tgroupEl.children) as Element[];

        // thead / tbody explicites
        for (const child of children) {
          const childTag = child.tagName.toLowerCase();
          if (childTag === "thead") {
            processSection(child, true);
          } else if (childTag === "tbody") {
            processSection(child, false);
          }
        }

        // Si des <row> sont directement dans <tgroup>, on les traite comme body
        const hasDirectRows = children.some(
          (c) => c.tagName.toLowerCase() === "row"
        );
        if (hasDirectRows) {
          processSection(tgroupEl, false);
        }
      }
    } else {
      // Pas de tgroup : lignes directement dans <table>
      processSection(element, false);
    }

    return {
      type: "table",
      attrs: tableAttrs,
      content: rows,
    };
  }  
  
  // ========== CAS PARTICULIERS SPÉCIFIQUES ==========

  // Cas particulier : <reference>
  if (tagName === "reference") {
    return {
      type: "reference",
      attrs,
      content: children,  // title, prolog?, refbody
    };
  }

  // Cas particulier : <task>
  if (tagName === "task") {
    return {
      type: "task",
      attrs,
      content: children, // title, shortdesc?, taskbody
    };
  }

  if (tagName === "taskbody") {
    return {
      type: "taskbody",
      attrs,
      content: children, // steps
    };
  }

  if (tagName === "steps") {
    return {
      type: "steps", attrs,
      content: children, // step+
    };
  }

  if (tagName === "step") {
    return {
      type: "step", attrs,
      content: children, // paragraph+
    };
  }

  // Cas particulier : <example>
  if (tagName === "example") {
    return {
      type: "example",
      attrs,
      content: children,
    };
  }

  // Cas particulier : <figure>
  if (tagName === "figure") {
    return {
      type: "figure",
      attrs,
      content: children    // title + image + autres blocs éventuels
    };
  }

  // Cas particulier : <glossentry>
  if (tagName === "glossentry") {
    return {
      type: "glossentry",
      attrs,
      content: []   // pas de contenu interne
    };
  }

  // Cas particulier : <xref>
  if (tagName === "xref") {
    return {
      type: "crossReference",
      attrs: {
        ...attrs,
        text: element.textContent ?? "",
      },
      content: [], // Inline node → pas de children TipTap
    };
  }

  // Cas particulier : <doc-tag>
  if (tagName === "doc-tag") {
    return {
      type: "docTag",
      attrs,
      content: [
        {
          type: "text",
          text: element.textContent ?? "",
        },
      ],
    };
  }

  // Cas particulier : <variable>
  if (tagName === "variable") {
    return {
      type: "inlineVariable",
      attrs,
      content: [],  // Pas de contenu : node atomique
    };
  }

  // ========== FIN DES CAS PARTICULIERS ==========

  // <body> → on l'aplatit proprement
  if (tagName === "body") {
    return children.length ? { type: "body", content: children } : null;
  }

  // Construction du nœud TipTap générique
  const node: TiptapNode = { type };
  if (attrs) node.attrs = attrs;
  if (children.length > 0) node.content = children;

  return node;
}

/**
 * Point d'entrée principal : parse une chaîne XML complète
 * et renvoie un tableau de nœuds TipTap à utiliser comme `doc.content`.
 */
export function parseXmlToTiptap(xmlString: string): TiptapNode[] {
  console.groupCollapsed("🔍 [parseXmlToTiptap] Analyse du XML reçu");
  console.log("📨 xmlString (brut):", xmlString);

  if (!xmlString || typeof xmlString !== "string") {
    console.warn("parseXmlToTiptap appelé avec un xml invalide :", xmlString);
    console.groupEnd();
    return [
      {
        type: "paragraph",
        content: [{ type: "text", text: "(XML vide ou invalide)" }],
      },
    ];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "application/xml");

  // Vérification d'erreur de parsing XML
  const parserErrors = doc.getElementsByTagName("parsererror");
  if (parserErrors.length > 0) {
    console.error("❌ Erreur XML :", parserErrors[0].textContent);
    console.groupEnd();
    throw new Error("Le XML fourni n'est pas valide.");
  }

  const root = doc.documentElement as Element;
  const rootTag = root.tagName.toLowerCase();

  // 🧱 Racines DITA "structurelles" :
  // - <task>
  // - <concept>
  // - <reference>
  const STRUCTURAL_ROOTS = new Set(["task", "concept", "reference"]);

  let container: Element;

  if (STRUCTURAL_ROOTS.has(rootTag)) {
    // Pour <task>, <concept>, <reference> → on garde la racine
    container = root;
  } else {
    // Sinon, on cherche un "body-like" à l'intérieur
    const bodyLike =
      (doc.getElementsByTagName("body")[0] as Element | undefined) ||
      (doc.getElementsByTagName("conbody")[0] as Element | undefined) ||
      (doc.getElementsByTagName("taskbody")[0] as Element | undefined) ||
      (doc.getElementsByTagName("refbody")[0] as Element | undefined);

    // S'il y a un body/conbody/taskbody/refbody → on le prend,
    // sinon on prend la racine telle quelle (p, steps, etc.)
    container = bodyLike ?? root;
  }

  console.log("📥 Élément conteneur utilisé pour la conversion :", container.tagName);

  const resultNodes: TiptapNode[] = [];

  // Cas particulier : <body> → on aplatit les enfants
  if (container.tagName.toLowerCase() === "body") {
    for (const child of Array.from(container.childNodes)) {
      const parsed = parseXmlNode(child);
      if (parsed) {
        resultNodes.push(parsed);
      }
    }
  } else {
    // Tous les autres cas : on convertit le conteneur LUI-MÊME
    const parsedRoot = parseXmlNode(container);
    if (Array.isArray(parsedRoot)) {
      resultNodes.push(...parsedRoot);
    } else if (parsedRoot) {
      resultNodes.push(parsedRoot);
    }

  }

  console.log("🧬 JSON TipTap généré (doc.content) :", resultNodes);
  console.groupEnd();

  return resultNodes;
}
