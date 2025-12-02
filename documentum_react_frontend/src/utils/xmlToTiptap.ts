// src/utils/xmlToTiptap.ts

/**
 * ⚙️ Utilitaire de conversion XML DITA ➜ JSON TipTap
 * - Parse une chaîne XML
 * - Récupère le contenu utile (en priorité à l'intérieur de <body>)
 * - Convertit récursivement chaque nœud en structure JSON TipTap
 *
 * 📌 Objectif principal : produire une structure STABLE et compatible TipTap v3,
 * pour être injectée dans `editor.commands.setContent({ type: "doc", content: nodes })`
 * sans provoquer de normalisation automatique ni de boucles infinies.
 */

export interface TiptapNode {
  type: string;
  attrs?: Record<string, any>;
  content?: TiptapNode[];
  text?: string;
}

// 🧭 Mapping minimal des balises XML vers les types TipTap
// (à enrichir progressivement en fonction des extensions réellement utilisées)
const nodeTypeMap: Record<string, string> = {
  p: "paragraph",
  body: "body", // traité comme conteneur logique, pas injecté tel quel dans TipTap
};

function mapNodeName(element: Element): string {
  const raw = element.tagName.toLowerCase();
  return nodeTypeMap[raw] ?? raw;
}

/**
 * Convertit un nœud DOM XML en nœud TipTap JSON (récursif).
 */
export function parseXmlNode(xmlNode: Node): TiptapNode | null {
  if (xmlNode.nodeType === Node.TEXT_NODE) {
    const text = xmlNode.textContent?.trim();
    if (!text) return null;
    return { type: "text", text };
  }

  if (xmlNode.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const element = xmlNode as Element;
  const type = mapNodeName(element);

  // Attributs
  const attrs: Record<string, string> = {};
  for (const attr of Array.from(element.attributes)) {
    attrs[attr.name] = attr.value;
  }

  // Enfants récursifs
  const children: TiptapNode[] = [];
  for (const child of Array.from(element.childNodes)) {
    const parsedChild = parseXmlNode(child);
    if (parsedChild) {
      children.push(parsedChild);
    }
  }

  const node: TiptapNode = { type };
  if (Object.keys(attrs).length > 0) {
    node.attrs = attrs;
  }
  if (children.length > 0) {
    node.content = children;
  }

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

  // On tente d'abord de récupérer le contenu du <body>, sinon on prend la racine
  const body = doc.getElementsByTagName("body")[0];
  const container: Element = body || (doc.documentElement as Element);

  console.log("📥 Élément racine utilisé pour la conversion :", container.tagName);

  const resultNodes: TiptapNode[] = [];

  // Important : on itère sur les enfants du conteneur, et non sur le conteneur lui-même,
  // pour éviter d'introduire un faux noeud racine non géré par TipTap.
  for (const child of Array.from(container.childNodes)) {
    const parsed = parseXmlNode(child);
    if (parsed) {
      resultNodes.push(parsed);
    }
  }

  console.log("🧬 JSON TipTap généré (doc.content) :", resultNodes);
  console.groupEnd();

  return resultNodes;
}
