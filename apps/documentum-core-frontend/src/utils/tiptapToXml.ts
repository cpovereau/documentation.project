// src/utils/tiptapToXml.ts

import { escapeXmlText, escapeXmlAttr, indent } from "./xmlUtils";

interface TiptapNode {
  type: string;
  attrs?: Record<string, any>;
  content?: TiptapNode[];
  text?: string;
}

// 🔒 Type guard interne à la sérialisation
function isTiptapNode(
  node: TiptapNode | undefined | null
): node is TiptapNode {
  return Boolean(node);
}

/* ----------------------------------------------
 * Mapping TipTap → XML DITA
 * -------------------------------------------- */
const TIPTAP_TO_XML: Record<string, string> = {
  paragraph: "p",
  title: "title",
  shortdesc: "shortdesc",
  section: "section",
  note: "note",
  codeblock: "codeblock",
  example: "example",

  table: "table",
  tableRow: "row",
  tableHeader: "entry",
  tableCell: "entry",

  task: "task",
  taskbody: "taskbody",
  steps: "steps",
  step: "step",

  bulletList: "itemizedlist",
  orderedList: "orderedlist",
  listItem: "listitem",

  image: "image",
  figure: "figure",
  video: "video",

  prolog: "prolog",
  docTag: "doc-tag",
  rubriqueMetadata: "rubrique-metadata",
  inlineVariable: "variable",

  concept: "concept",
  conbody: "conbody",
  reference: "reference",
  refbody: "refbody",
  glossary: "glossary",
  crossReference: "xref",

  question: "question",
  answer: "answer",
};

// Conversion du type TipTap vers la balise XML
function toXmlTag(nodeType: string): string {
  return TIPTAP_TO_XML[nodeType] ?? nodeType;
}

/* ----------------------------------------------
 * Sérialisation des attributs XML
 * -------------------------------------------- */
function serializeAttributes(attrs?: Record<string, any>): string {
  if (!attrs) return "";

  return Object.entries(attrs)
    .map(([k, v]) => `${k}="${escapeXmlAttr(String(v))}"`)
    .join(" ");
}

/* ----------------------------------------------
 * Helper pour futures règles spécifiques <prolog>
 * -------------------------------------------- */
function normalizeProlog(node: TiptapNode) {
  if (!node.content) return;

  // TODO Phase 4 : imposer ordre author → critdates → metadata
  // Exemple :
  // const order = ["author", "critdates", "metadata"];
  // node.content.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
}

/* ----------------------------------------------
 * Sérialisation récursive d’un nœud TipTap
 * -------------------------------------------- */
function serializeNode(node: TiptapNode, level = 0): string {
    // 🧮 TABLE (TipTap → DITA)
    if (node.type === "table") {
      const attrs = serializeAttributes(node.attrs);
      const openTable = attrs ? `<table ${attrs}>` : `<table>`;

      const rows = node.content ?? [];

      const headerRows: TiptapNode[] = [];
      const bodyRows: TiptapNode[] = [];

      for (const row of rows) {
        const cells = row.content ?? [];
        const hasCells = cells.length > 0;
        const isHeaderRow =
          hasCells && cells.every((c) => c.type === "tableHeader");

        // Tous les header en tête, tant qu'on n'a pas commencé le body
        if (isHeaderRow && bodyRows.length === 0) {
          headerRows.push(row);
        } else {
        bodyRows.push(row);
        }
      }

      const allRows = rows;
      const colCount =
        allRows.length > 0
          ? Math.max(...allRows.map((r) => r.content?.length ?? 0))
          : 0;

      const parts: string[] = [];
      parts.push(indent(level) + openTable);
      parts.push(indent(level + 1) + `<tgroup cols="${colCount}">`);

      // THEAD
      if (headerRows.length > 0) {
        parts.push(indent(level + 2) + `<thead>`);
        for (const row of headerRows) {
          parts.push(indent(level + 3) + `<row>`);
          for (const cell of row.content ?? []) {
            parts.push(serializeNode(cell, level + 4));
          }
          parts.push(indent(level + 3) + `</row>`);
        }
        parts.push(indent(level + 2) + `</thead>`);
      }

      // TBODY
      parts.push(indent(level + 2) + `<tbody>`);
      const bodySource =
        bodyRows.length > 0
          ? bodyRows
          : allRows; // si aucun header, toutes les lignes vont dans tbody

      for (const row of bodySource) {
        parts.push(indent(level + 3) + `<row>`);
        for (const cell of row.content ?? []) {
          parts.push(serializeNode(cell, level + 4));
        }
        parts.push(indent(level + 3) + `</row>`);
      }
      parts.push(indent(level + 2) + `</tbody>`);

      parts.push(indent(level + 1) + `</tgroup>`);
      parts.push(indent(level) + `</table>`);

      return parts.join("\n");
    }

  // Cas spécial : codeblock
  if (node.type === "codeblock") {
    const attrs = serializeAttributes(node.attrs);
    const tag = "codeblock";
    const text = node.content?.[0]?.text ?? "";

  return indent(level) +
    (attrs ? `<${tag} ${attrs}>${text}</${tag}>`
           : `<${tag}>${text}</${tag}>`);
  }

  // Cas spécial : référence
  if (node.type === "reference") {
    const children = node.content ?? [];

    // 1. Extraire chaque bloc attendu
    const title = children.find(c => c.type === "title");
    const prolog = children.find(c => c.type === "prolog");
    const refbody = children.find(c => c.type === "refbody");

    const ordered = [
      title,
      ...(prolog ? [prolog] : []),
      refbody,
    ].filter(isTiptapNode);

    const attrs = serializeAttributes(node.attrs);
    const open = attrs ? `<reference ${attrs}>` : `<reference>`;

    const inner = ordered
      .map(node => serializeNode(node, level + 1))
      .join("\n");

    return [
      indent(level) + open,
      inner,
      indent(level) + `</reference>`
    ].join("\n");
  }

  // Cas spécial : task
  if (node.type === "task") {
    const children = node.content ?? [];

    const title = children.find(c => c.type === "title");
    const prolog = children.find(c => c.type === "prolog");
    const taskbody = children.find(c => c.type === "taskbody");

    const ordered = [
      title,
      ...(prolog ? [prolog] : []),
      taskbody,
    ].filter(isTiptapNode);

    const attrs = serializeAttributes(node.attrs);
    const open = attrs ? `<task ${attrs}>` : `<task>`;

    const inner = ordered
      .map(node => serializeNode(node, level + 1))
      .join("\n");

  return [
    indent(level) + open,
    inner,
    indent(level) + `</task>`
  ].join("\n");
  }

  // Cas spécial : taskbody
  if (node.type === "taskbody") {
    const attrs = serializeAttributes(node.attrs);
    const open = attrs ? `<taskbody ${attrs}>` : `<taskbody>`;
    const inner = (node.content ?? [])
      .map(c => serializeNode(c, level + 1))
      .join("\n");

  return [
    indent(level) + open,
    inner,
    indent(level) + `</taskbody>`
  ].join("\n");
  }

  // Cas spécial : example
  if (node.type === "example") {
    const attrs = serializeAttributes(node.attrs);
    const open = attrs ? `<example ${attrs}>` : `<example>`;

    const inner = (node.content ?? [])
      .map(c => serializeNode(c, level + 1))
      .join("\n");

  return [
    indent(level) + open,
    inner,
    indent(level) + `</example>`,
  ].join("\n");
  }

  // Cas spécial : figure
  if (node.type === "figure") {
    const children = node.content ?? [];

    const title = children.find(c => c.type === "title");
    const image = children.find(c => c.type === "image");

    // On respecte l’ordre DITA
    const ordered = [
      ...(title ? [title] : []),
      ...(image ? [image] : []),
      ...children.filter(c => c !== title && c !== image) // au cas où
    ];

    const attrs = serializeAttributes(node.attrs);
    const open = attrs ? `<figure ${attrs}>` : `<figure>`;

    const inner = ordered
      .map(c => serializeNode(c, level + 1))
      .join("\n");

  return [
    indent(level) + open,
    inner,
    indent(level) + `</figure>`
  ].join("\n");
  }

  // Cas spécial : glossentry (auto-fermante)
  if (node.type === "glossentry") {
    const attrs = serializeAttributes(node.attrs);
  return indent(level) + `<glossentry ${attrs} />`;
  }

  // Cas spécial : crossReference (inline)
  if (node.type === "crossReference") {
    const allAttrs = node.attrs ?? {};
    const { text, ...rest } = allAttrs;

    const attrs = serializeAttributes(rest);
    const innerText = escapeXmlText(text ?? "");

    const open = attrs ? `<xref ${attrs}>` : `<xref>`;

    return indent(level) + open + innerText + `</xref>`;
  }

  // Cas spécial : docTag (inline)
  if (node.type === "docTag") {
    const attrs = serializeAttributes(node.attrs);
    const textNode = node.content?.find(c => c.type === "text");
    const text = escapeXmlText(textNode?.text ?? "");

    const open = attrs ? `<doc-tag ${attrs}>` : `<doc-tag>`;
  return indent(level) + open + text + `</doc-tag>`;
  }

  // Cas spécial : inlineVariable (inline, atomique)
  if (node.type === "inlineVariable") {
    const attrs = serializeAttributes(node.attrs);
  return indent(level) + `<variable ${attrs} />`;
  }

  // Texte pur
  if (node.type === "text") {
  return indent(level) + escapeXmlText(node.text ?? "");
  }

  const tag = toXmlTag(node.type);
  const attrs = serializeAttributes(node.attrs);

  // Détection balises autofermantes
  const children = node.content ?? [];

  // Toute balise sans enfant = auto-fermante, sauf cas particuliers à l’avenir.
  if (children.length === 0) {
  return indent(level) + (attrs ? `<${tag} ${attrs} />` : `<${tag} />`);
  }

  const open = attrs ? `<${tag} ${attrs}>` : `<${tag}>`;

  // Texte inline unique → <tag>texte</tag>
  if (children.length === 1 && children[0].type === "text") {
    return (
      indent(level) +
      open +
      escapeXmlText(children[0].text ?? "") +
      `</${tag}>`
    );
  }

  // Aucun enfant → <tag></tag>
  if (children.length === 0) {
    return indent(level) + open + `</${tag}>`;
  }

  // Normalisation prolog (non active maintenant)
  if (node.type === "prolog") {
    normalizeProlog(node);
  }

  const inner = children
    .map((c) => serializeNode(c, level + 1))
    .join("\n");

  return [
    indent(level) + open,
    inner,
    indent(level) + `</${tag}>`,
  ].join("\n");
}

/**
 * 🧩 Sérialisation d'un tableau TipTap → XML DITA
 */
function serializeTable(node: TiptapNode, level = 0): string {
  const attrs = serializeAttributes(node.attrs);
  const openTable = attrs ? `<table ${attrs}>` : `<table>`;

  const rows = node.content ?? [];
  if (rows.length === 0) {
    return indent(level) + openTable + `</table>`;
  }

  // Détection du nombre de colonnes à partir de la première ligne
  let cols = 0;
  for (const child of rows[0].content ?? []) {
    if (child.type === "customTableCell" || child.type === "customTableHeader") {
      cols++;
    }
  }

  const tgroupOpen = `<tgroup cols="${cols}">`;

  const theadRows: TiptapNode[] = [];
  const tbodyRows: TiptapNode[] = [];

  // Séparation THEAD / TBODY
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const hasHeader = (row.content ?? []).some(
      c => c.type === "customTableHeader"
    );
    if (hasHeader && theadRows.length === 0) {
      theadRows.push(row);
    } else {
      tbodyRows.push(row);
    }
  }

  const serializeRow = (row: TiptapNode, lvl: number) => {
    const entries = row.content ?? [];
    const serializedEntries = entries.map(entry =>
      serializeTableEntry(entry, lvl + 1)
    ).join("\n");

    return [
      indent(lvl) + "<row>",
      serializedEntries,
      indent(lvl) + "</row>"
    ].join("\n");
  };

  const serializeTableEntry = (node: TiptapNode, lvl: number) => {
    const tag = "entry";
    const attrs = serializeAttributes(node.attrs);

    // Le contenu textuel d'une cellule est dans node.content[0].text
    const textNode = node.content?.[0];
    const text = textNode?.text ?? "";

    if (!text.trim()) {
      return indent(lvl) + (attrs ? `<entry ${attrs}/>` : `<entry/>`);
    }

    return indent(lvl) + 
      (attrs ? `<entry ${attrs}>${escapeXmlText(text)}</entry>` 
             : `<entry>${escapeXmlText(text)}</entry>`);
  };

  // Construction thead
  let theadXml = "";
  if (theadRows.length > 0) {
    const serialized = theadRows.map(r => serializeRow(r, level + 3)).join("\n");
    theadXml = [
      indent(level + 2) + "<thead>",
      serialized,
      indent(level + 2) + "</thead>"
    ].join("\n");
  }

  // Construction tbody
  const tbodySerialized = tbodyRows.map(r => serializeRow(r, level + 3)).join("\n");
  const tbodyXml = [
    indent(level + 2) + "<tbody>",
    tbodySerialized,
    indent(level + 2) + "</tbody>"
  ].join("\n");

  // Final assembly
  return [
    indent(level) + openTable,
    indent(level + 1) + tgroupOpen,
    theadXml,
    tbodyXml,
    indent(level + 1) + "</tgroup>",
    indent(level) + "</table>",
  ].filter(Boolean).join("\n");
}

/* ----------------------------------------------
 * 🧩 Point d'entrée : TipTap → XML (doc.content)
 * -------------------------------------------- */
export function tiptapToXml(nodes: TiptapNode[]): string {
  return nodes.map((n) => serializeNode(n, 0)).join("\n");
}
