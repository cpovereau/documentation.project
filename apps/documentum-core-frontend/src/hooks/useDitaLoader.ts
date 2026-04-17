/**
 * useDitaLoader
 * --------------
 * Point de charge unique du contenu d'une rubrique dans TipTap.
 *
 * Stratégie de chargement :
 *   1. Si buffer "dirty" ou "error" → contenu non sauvegardé en cours : utiliser le buffer.
 *   2. Sinon → fetcher GET /api/rubriques/{id}/ → mettre en buffer (status "saved") → injecter.
 *
 * Tolérance données dégradées :
 *   Les données en base peuvent être des fragments sans racine unique
 *   (ex. `<p>a</p><p>b</p>` stocké avant correction du sérialiseur).
 *   Dans ce cas, wrapIfFragment() détecte le parseerror DOMParser et wrappe avec <body>.
 *
 * ✔ setContent() avec { emitUpdate: false } — évite la boucle useXmlBufferSync
 * ✔ Seuls déclencheurs autorisés : editor, rubriqueId
 */

import { useEffect, useState } from "react";
import { Editor } from "@tiptap/react";
import useXmlBufferStore from "@/store/xmlBufferStore";
import { parseXmlToTiptap } from "@/utils/xmlToTiptap";
import { getRubrique } from "@/api/rubriques";

interface UseDitaLoaderProps {
  editor: Editor | null;
  rubriqueId: number | null;
}

function wrapIfFragment(xml: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  if (doc.getElementsByTagName("parsererror").length > 0) {
    return `<body>${xml}</body>`;
  }
  return xml;
}

function injectContent(editor: Editor, xml: string): void {
  if (!xml || xml.trim() === "") {
    editor.commands.setContent(
      "<p>Aucun contenu disponible pour cette rubrique.</p>",
      { emitUpdate: false },
    );
    return;
  }

  const safeXml = wrapIfFragment(xml);
  const nodes = parseXmlToTiptap(safeXml);
  editor.commands.setContent({ type: "doc", content: nodes }, { emitUpdate: false });
}

export function useDitaLoader({ editor, rubriqueId }: UseDitaLoaderProps) {
  const getStatus = useXmlBufferStore((s) => s.getStatus);
  const getXml    = useXmlBufferStore((s) => s.getXml);
  const setXml    = useXmlBufferStore((s) => s.setXml);
  const setStatus = useXmlBufferStore((s) => s.setStatus);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!editor || rubriqueId == null) return;

    const bufferStatus = getStatus(rubriqueId);
    const isUnsaved = bufferStatus === "dirty" || bufferStatus === "error";

    if (isUnsaved) {
      const xml = getXml(rubriqueId) ?? "";
      try {
        injectContent(editor, xml);
      } catch (err) {
        console.error("❌ [useDitaLoader] Erreur parsing buffer non sauvegardé :", err);
        editor.commands.setContent("<p>Erreur de conversion XML</p>", { emitUpdate: false });
      }
      return;
    }

    // Chargement depuis le backend
    setIsLoading(true);

    getRubrique(rubriqueId)
      .then((rubrique) => {
        const rawXml = rubrique.contenu_xml ?? "";
        const safeXml = rawXml.trim() !== "" ? wrapIfFragment(rawXml) : "";

        // Mise en buffer avec statut saved
        setXml(rubriqueId, safeXml);
        setStatus(rubriqueId, "saved");

        injectContent(editor, safeXml);
      })
      .catch((err) => {
        console.error("❌ [useDitaLoader] Erreur chargement rubrique :", err);
        editor.commands.setContent(
          "<p>Erreur de chargement du contenu.</p>",
          { emitUpdate: false },
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [
    editor,
    rubriqueId, // ✔ Seuls déclencheurs autorisés
  ]);

  return { isLoading };
}
