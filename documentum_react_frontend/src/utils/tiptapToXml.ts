// src/utils/tiptapToXml.ts

import { escapeXml, indent } from "./xmlUtils";

interface TiptapNode {
  type: string;
  attrs?: Record<string, any>;
  content?: TiptapNode[];
  text?: string;
}

/**
 * Mapping TipTap -> XML DITA
 */
const TIPTAP_TO_XML: Record<string, string> = {
  // textes & blocs
  paragraph: "p",
  title: "title",
  shortdesc: "shortdesc",
  section: "section",
  note: "note",

  // tâches
  task: "task",
  taskbody: "taskbody",
  steps: "steps",
  step: "step",

  // listes
  bulletList: "itemizedlist",
  orderedList: "orderedlist",
  listItem: "listitem",

  // médias
  image: "image",
  figure: "figure",
  video: "video",

  // métadonnées
  prolog: "prolog",
  docTag: "doc-tag",
  rubriqueMetadata: "rubrique-metadata",
  inlineVariable: "variable",

  // structures concept & reference
  concept: "concept",
  conbody: "conbody",
  reference: "reference",
  refbody: "refbody",

  // pédagogie
  question: "question",
  answer: "answer",
};

/**
 * Retourne le nom XML correct
 */
function toXmlTag(nodeType: string): string {
  return TIPTAP_TO_XML[nodeType] ?? nodeType;
}

/**
 * Format un attribut en XML
 */
function serializeAttributes(attrs?: Record<string, any>): string {
  if (!attrs) return "";

  return Object.entries(attrs)
    .map(([k, v]) => `${k}="${escapeXml(String(v))}"`)
    .join(" ");
}

/**
 * Sérialisation d’un nœud TipTap en XML
 */
function serializeNode(node: TiptapNode, level = 0): string {
  // Texte simple
  if (node.type === "text") {
    return indent(level) + escapeXml(node.text ?? "");
  }

  // Balise XML correspondante
  const tag = toXmlTag(node.type);

  // Attributs
  const attrs = serializeAttributes(node.attrs);
  const open =
    attrs.length > 0 ? `<${tag} ${attrs}>` : `<${tag}>`;

  const children = node.content ?? [];

  // Balise auto-fermante ? ex: <image/>
  const SELF_CLOSING = new Set(["image", "video", "doc-tag", "variable"]);
  if (SELF_CLOSING.has(tag) && children.length === 0) {
    return indent(level) + (attrs ? `<${tag} ${attrs} />` : `<${tag} />`);
  }

  // Balise classique
   if (
    children.length === 1 &&
    children[0].type === "text"
  ) {
    const textContent = escapeXml(children[0].text ?? "");
    return indent(level) + open + textContent + `</${tag}>`;
  }

   // Cas général multi-lignes
  if (children.length === 0) {
    return indent(level) + open + `</${tag}>`;
  }

  const inner = children
    .map(c => serializeNode(c, level + 1))
    .join("\n");

  return [
    indent(level) + open,
    inner,
    indent(level) + `</${tag}>`,
  ].join("\n");
}

/**
 * 🧩 Point d'entrée TipTap → XML (équivalent à doc.content)
 */
export function tiptapToXml(nodes: TiptapNode[]): string {
  return nodes.map(n => serializeNode(n, 0)).join("\n");
}
