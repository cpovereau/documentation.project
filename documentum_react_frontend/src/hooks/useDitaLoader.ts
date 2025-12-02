/**
 * useDitaLoader
 * --------------
 * Charge le XML d’une rubrique depuis le buffer Zustand
 * et l’injecte DANS TipTap **sans déclencher de boucle update**.
 *
 * ✔ Déclenchement uniquement lors d’un changement de rubrique OU éditeur
 * ✔ setContent() avec { emitUpdate: false } pour éviter useXmlBufferSync
 * ✔ Aucune dépendance au buffer → évite les boucles infinies
 */

import { useEffect, useState } from "react";
import { Editor } from "@tiptap/react";
import useXmlBufferStore from "@/store/xmlBufferStore";
import { parseXmlToTiptap } from "@/utils/xmlToTiptap";

interface UseDitaLoaderProps {
  editor: Editor | null;
  selectedMapItemId: number | null;
}

export function useDitaLoader({ editor, selectedMapItemId }: UseDitaLoaderProps) {
  const getXml = useXmlBufferStore((state) => state.getXml);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Conditions minimales : si l’éditeur n’est pas prêt ou pas de rubrique sélectionnée
    if (!editor || selectedMapItemId == null) {
      return;
    }

    setIsLoading(true);

    // Lecture du XML depuis Zustand
    const xml = getXml(selectedMapItemId);

    // Si vide → message fallback
    if (!xml || typeof xml !== "string" || xml.trim() === "") {
      editor.commands.setContent(
        "<p>Aucun contenu disponible pour cette rubrique.</p>",
        { emitUpdate: false } // ⚠️ INDISPENSABLE
      );
      setIsLoading(false);
      return;
    }

    try {
      // Conversion XML → JSON TipTap
      const nodes = parseXmlToTiptap(xml);

      // Injection dans TipTap → sans update (évite sync → Zustand → reload → boucle !)
      editor.commands.setContent(
        { type: "doc", content: nodes },
        { emitUpdate: false }
      );

      setIsLoading(false);
    } catch (err) {
      console.error("❌ Erreur lors du parsing XML:", err);
      editor.commands.setContent("<p>Erreur de conversion XML</p>", {
        emitUpdate: false,
      });
      setIsLoading(false);
    }
  }, [
    editor,
    selectedMapItemId, // ✔ Seuls déclencheurs autorisés
  ]);

  return { isLoading };
}
