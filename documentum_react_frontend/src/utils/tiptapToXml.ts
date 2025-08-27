// src/utils/tiptapToXml.ts

/**
 * 🔁 Utilitaire de conversion JSON TipTap ➜ XML DITA
 * Permet de ré-exporter un arbre d'édition vers un format XML.
 * Ne gère que les balises connues du système.
 */

interface TiptapNode {
  type: string;
  attrs?: Record<string, string>;
  content?: TiptapNode[];
  text?: string;
}

/**
 * Échappe les caractères spéciaux XML
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Construit une chaîne XML à partir d'un noeud TipTap
 */
export function tiptapNodeToXml(node: TiptapNode): string {
  if (node.type === "text") {
    return escapeXml(node.text || "");
  }

  const attrs = node.attrs
    ? Object.entries(node.attrs)
        .map(([key, value]) => `${key}="${escapeXml(value)}"`)
        .join(" ")
    : "";

  const content = (node.content || []).map(tiptapNodeToXml).join("");

  return `<${node.type}${attrs ? " " + attrs : ""}>${content}</${node.type}>`;
}

/**
 * Convertit un tableau racine TipTap en XML complet (hors en-tête)
 */
export function tiptapToXml(nodes: TiptapNode[]): string {
  return nodes.map(tiptapNodeToXml).join("\n");
}
