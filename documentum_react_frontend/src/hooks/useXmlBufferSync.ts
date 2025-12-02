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
  const isSyncingRef = useRef(false);

  // Debounce pour éviter des conversions trop fréquentes
  const debouncedSync = useRef(
    debounce((xml: string, rubriqueId: number) => {
      setXml(rubriqueId, xml);
      setStatus(rubriqueId, "dirty");
    }, 400),
  ).current;

  /**
   * Démarre la synchronisation : chaque update TipTap est converti en XML
   * puis poussé dans Zustand.
   */
  const startSync = () => {
    if (!editor || !selectedMapItemId) return;
    if (isSyncingRef.current) return; // déjà actif

    isSyncingRef.current = true;

    editor.on("update", () => {
      if (!isSyncingRef.current) return;
      if (!selectedMapItemId) return;

      try {
        const json = editor.getJSON();
        const xml = tiptapToXml(json);
        debouncedSync(xml, selectedMapItemId);
      } catch (err) {
        console.error("[useXmlBufferSync] Erreur de conversion TipTap -> XML :", err);
        setStatus(selectedMapItemId, "error");
      }
    });
  };

  /** Stoppe la synchro (appelé avant changement de rubrique) */
  const stopSync = () => {
    isSyncingRef.current = false;
  };

  /**
   * Reset lors du changement d'éditeur ou changement de rubrique.
   */
  useEffect(() => {
    stopSync();

    if (editor && selectedMapItemId) {
      startSync();
    }

    return () => {
      stopSync();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, selectedMapItemId]);

  return { startSync, stopSync };
}
