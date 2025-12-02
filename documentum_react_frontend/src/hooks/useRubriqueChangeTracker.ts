import { useEffect, useRef, useState } from "react";
import { Editor } from "@tiptap/react";
import useXmlBufferStore from "@/store/xmlBufferStore";

/**
 * Détection de modifications dans une rubrique.
 * - Compare le JSON initial et le JSON courant de TipTap.
 * - Met à jour le store Zustand avec status = "dirty".
 * - Fournit un resetInitialContent() après une sauvegarde.
 */
export function useRubriqueChangeTracker(
  editor: Editor | null,
  rubriqueId: number | null | undefined
) {
  const [hasChanges, setHasChanges] = useState(false);

  const getXml = useXmlBufferStore((s) => s.getXml);
  const setStatus = useXmlBufferStore((s) => s.setStatus);
  const setXml = useXmlBufferStore((s) => s.setXml);

  // On mémorise l'état initial de l'éditeur en JSON
  const initialJsonRef = useRef<any>(null);

  // Réinitialise l'état initial après une sauvegarde réussie
  const resetInitialContent = () => {
    if (!editor) return;
    initialJsonRef.current = editor.getJSON();
    setHasChanges(false);
    if (rubriqueId) setStatus(rubriqueId, "saved");
  };

  useEffect(() => {
    if (!editor || !rubriqueId) {
      return; // <- ceci renvoie `void`, c’est OK
    }

    initialJsonRef.current = editor.getJSON();
    setHasChanges(false);

    const handleUpdate = () => {
      if (!initialJsonRef.current) return;

      const current = editor.getJSON();
      const initial = initialJsonRef.current;

      const changed = JSON.stringify(current) !== JSON.stringify(initial);

      if (changed) {
        if (!hasChanges) {
          setHasChanges(true);
          setStatus(rubriqueId, "dirty");
        }
      }
    };

    editor.on("update", handleUpdate);

    // IMPORTANT : retourner une fonction `() => void`
    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor, rubriqueId]); // SAFE

  return {
    hasChanges,
    resetInitialContent,
  };
}