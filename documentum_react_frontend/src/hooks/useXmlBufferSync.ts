import { useEffect, useRef } from "react";
import { Editor } from "@tiptap/react";
import debounce from "lodash.debounce";
import { tiptapToXml } from "../utils/tiptapToXml";
import useXmlBufferStore from "../store/xmlBufferStore";

/**
 * Hook responsable de la synchronisation automatique entre :
 *  - le contenu TipTap (JSON)
 *  - le buffer XML Zustand (par rubrique)
 *
 * ⚠️ Il ne gère aucune sauvegarde API : il ne fait que maintenir
 *     un buffer XML cohérent et marqué comme "dirty".
 */
export function useXmlBufferSync(editor: Editor | null, selectedMapItemId: number | null) {
  const { setXml, setStatus } = useXmlBufferStore();
  const handlerRef = useRef<(() => void) | null>(null);

  // Debounce pour éviter des conversions trop fréquentes
  const debouncedSync = useRef(
    debounce((xml: string, rubriqueId: number) => {
      setXml(rubriqueId, xml);
    }, 400),
  ).current;

  useEffect(() => {
    if (!editor || !selectedMapItemId) return;

    const onUpdate = () => {
      try {
        const json = editor.getJSON();
        const xml = tiptapToXml(json.content ?? []);
        debouncedSync(xml, selectedMapItemId);
      } catch (err) {
        console.error("[useXmlBufferSync] Erreur TipTap → XML", err);
        setStatus(selectedMapItemId, "error");
      }
    };

    handlerRef.current = onUpdate;
    editor.on("update", onUpdate);

    return () => {
      if (handlerRef.current) {
        editor.off("update", handlerRef.current);
        handlerRef.current = null;
      }
      debouncedSync.cancel();
    };
  }, [editor, selectedMapItemId, debouncedSync, setXml, setStatus]);

  return {};
}
