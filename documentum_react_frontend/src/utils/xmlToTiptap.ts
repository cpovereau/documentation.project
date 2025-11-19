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
export function parseXmlToTiptap(xmlString: string): TiptapNode[] {
  console.groupCollapsed("🔍 [parseXmlToTiptap] Analyse du XML reçu");

  // 1. Affiche brut
  console.log("📨 xmlString (brut):", xmlString);

  // 2. Validation basique
  if (!xmlString || typeof xmlString !== "string") {
    console.warn("parseXmlToTiptap appelé avec un xml invalide :", xmlString);
    return [{ type: "paragraph", content: [{ type: "text", text: "..." }] }];
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');

   // 3. Vérification d’erreur de parsing XML
  const parserErrors = doc.getElementsByTagName("parsererror");
  if (parserErrors.length > 0) {
    console.error("❌ Erreur XML : ", parserErrors[0].textContent);
    throw new Error("Le XML fourni n’est pas valide.");
  }

  // 4. Tentative d'extraction du body
  const root = doc.getElementsByTagName('body')[0];
  console.log("📥 XML reçu par parseXmlToTiptap:", root);

  if (!root) {
    console.error("❌ Aucun élément <body> trouvé.");
    console.groupEnd();
    throw new Error("Balise <body> introuvable dans le XML.");
  }

  const result = parseXmlNode(root);
  console.log("🧬 JSON TipTap généré :", result);
  return result?.content ?? [];
  
}