// src/utils/xmlToTiptap.ts

/**
 * ⚙️ Utilitaire de conversion XML DITA ➜ JSON TipTap
 * V2 — version structurée, consciente des balises DITA principales
 */

export interface TiptapNode {
  type: string;
  attrs?: Record<string, any>;
  content?: TiptapNode[];
  text?: string;
}

// 🧭 Mapping XML -> type TipTap
// À enrichir progressivement (concept, reference, learning, etc.)
const XML_TO_TIPTAP_TAG: Record<string, string> = {
  // blocs de base
  p: "paragraph",
  title: "title",
  shortdesc: "shortdesc",
  body: "body",
  section: "section",
  note: "note",

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

  // à compléter : concept, conbody, reference, refbody, learning*, etc.
  concept: "concept",
  conbody: "conbody",
  reference: "reference",
  refbody: "refbody",
};

function mapXmlTagToTiptapType(el: Element): string {
  const raw = el.tagName.toLowerCase();
  return XML_TO_TIPTAP_TAG[raw] ?? raw; // fallback: même nom
}

// 🧾 Whitelist d'attributs par type TipTap
// On commence simple : toujours "id", puis on enrichira progressivement.
const ATTR_WHITELIST: Record<string, string[]> = {
  "*": ["id"],

  image: ["id", "href", "src", "alt"],
  crossReference: ["id", "refid", "href"],
  docTag: ["id", "type", "audience", "product", "feature"],
  inlineVariable: ["id", "name"],
};

function extractAttributes(el: Element, type: string): Record<string, any> | undefined {
  const allowed = new Set([
    ...(ATTR_WHITELIST["*"] ?? []),
    ...(ATTR_WHITELIST[type] ?? []),
  ]);

  const attrs: Record<string, any> = {};

  for (const attr of Array.from(el.attributes)) {
    if (allowed.has(attr.name)) {
      attrs[attr.name] = attr.value;
    }
  }

  // Normalisation spécifique pour certains types
  if (type === "image") {
    const href = el.getAttribute("href") ?? el.getAttribute("src");
    if (href) {
      attrs.src = href; // on standardise en "src" côté TipTap
    }
  }

  return Object.keys(attrs).length > 0 ? attrs : undefined;
}

/**
 * Convertit un nœud DOM XML en nœud TipTap JSON (récursif).
 * Gère TEXT_NODE, ELEMENT_NODE, avec quelques cas spéciaux.
 */
export function parseXmlNode(xmlNode: Node): TiptapNode | null {
  // Texte
  if (xmlNode.nodeType === Node.TEXT_NODE) {
    const text = xmlNode.textContent ?? "";
    // On ne garde pas les textes purement vides ou blancs
    if (!text.trim()) return null;
    return { type: "text", text };
  }

  // On ignore les commentaires, etc.
  if (xmlNode.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const element = xmlNode as Element;
  const tagName = element.tagName.toLowerCase();
  const type = mapXmlTagToTiptapType(element);

  // Cas spéciaux éventuels
  // - listitem -> listItem
  // - itemizedlist/orderedlist
  // - etc.

  const attrs = extractAttributes(element, type);

  // Enfants récursifs
  const children: TiptapNode[] = [];
  for (const child of Array.from(element.childNodes)) {
    const parsedChild = parseXmlNode(child);
    if (parsedChild) {
      children.push(parsedChild);
    }
  }

  // Certains conteneurs ne doivent pas apparaître tels quels dans TipTap,
  // mais seulement exposer leurs enfants. Exemple : body.
  if (tagName === "body") {
    // On "aplatit" body : on retourne seulement ses enfants.
    // Note : c'est géré au niveau supérieur dans parseXmlToTiptap, mais
    // on garde ce garde-fou.
    return children.length ? { type: "body", content: children } : null;
  }

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

  // Racines structurelles DITA qu'on veut garder telles quelles
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
    if (parsedRoot) {
      resultNodes.push(parsedRoot);
    }
  }

  console.log("🧬 JSON TipTap généré (doc.content) :", resultNodes);
  console.groupEnd();

  return resultNodes;
}

