// src/utils/xmlToTiptap.ts

/**
 * ⚙️ Utilitaire de conversion XML DITA ➜ JSON TipTap
 * Ne gère que les balises connues définies comme extensions TipTap.
 * Fonctionne récursivement. À adapter selon les besoins métier.
 */

interface TiptapNode {
  type: string;
  attrs?: Record<string, any>;
  content?: TiptapNode[];
  text?: string;
}

// 🧭 Mapping des balises XML vers les types attendus par TipTap
const nodeTypeMap: Record<string, string> = {
  p: "paragraph",
  body: "doc",
  // ajoute d'autres mappings ici si besoin
};

/**
 * Convertit un nœud XML en node TipTap JSON (récursif)
 */
export function parseXmlNode(xmlNode: Element | Text): TiptapNode | null {
  const ELEMENT_NODE = 1;
  const TEXT_NODE = 3;

  if (xmlNode.nodeType === TEXT_NODE) {
    const text = xmlNode.textContent?.trim();
    if (!text) return null;
    return { type: 'text', text };
  }

  if (xmlNode.nodeType !== ELEMENT_NODE) return null;

  const element = xmlNode as Element;
  const rawType = element.nodeName;
  const type = nodeTypeMap[rawType] || rawType;
  
  const attrs: Record<string, string> = {};
  for (const attr of Array.from(element.attributes)) {
    attrs[attr.name] = attr.value;
  }

  const children: TiptapNode[] = [];
  for (const child of Array.from(element.childNodes)) {
    const parsed = parseXmlNode(child as Element | Text);
    if (parsed) children.push(parsed);
  }

  const node: TiptapNode = { type };
  if (Object.keys(attrs).length > 0) node.attrs = attrs;
  if (children.length > 0) node.content = children;

  return node;
}

/**
 * Point d'entrée principal : parse une chaîne XML complète en arbre TipTap JSON
 */
export function parseXmlToTiptap(xml: string): string {
  console.group("[parseXmlToTiptap] Analyse du XML reçu");

  // 🔧 Supprime la ligne DOCTYPE si elle est présente
  const sanitizedXml = xml.replace(/<!DOCTYPE[^>]*>/, "");
  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitizedXml, "application/xml");

  // Vérification d’erreur
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) {
    console.error("❌ Erreur DOMParser:", errorNode.textContent);
    throw new Error("Erreur d’analyse du XML.");
  }

  const root = doc.getElementsByTagName("body")[0];
  console.log("📥 XML reçu par parseXmlToTiptap:", root);

  if (!root) {
    console.error("❌ Balise <body> introuvable dans le XML.");
    console.groupEnd();
    throw new Error("Balise <body> introuvable dans le XML.");
  }

  console.groupEnd();
  return root.innerHTML; // ✅ renvoie une string HTML utilisable
}
