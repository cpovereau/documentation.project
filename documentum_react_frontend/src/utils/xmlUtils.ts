// src/utils/xmlUtils.ts

/**
 * 🛡️ Fonction utilitaire pour échapper les caractères dans le texte XML
 * (utilisée dans tiptapToXml.ts et d’autres modules)
 */
export function escapeXmlText(str: string): string {
  return str
    .replace(/&(?!amp;|lt;|gt;|quot;|apos;)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * 🛡️ Fonction utilitaire pour échapper les caractères dans les attributs XML
 * (utilisée dans tiptapToXml.ts et d’autres modules)
 */
export function escapeXmlAttr(str: string): string {
  return str
    .replace(/&(?!amp;|lt;|gt;|quot;|apos;)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Espace d’indentation standard : 4 espaces
 * Permet d'assurer une sortie XML stable et propre
 */
export function indent(level: number): string {
  return " ".repeat(level * 4);
}
