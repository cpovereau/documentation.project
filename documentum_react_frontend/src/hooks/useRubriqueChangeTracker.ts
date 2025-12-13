import { useEffect, useRef, useState } from "react";
import { Editor } from "@tiptap/react";

/**
 * Hook UX pur :
 * - détecte si le contenu a changé depuis la dernière sauvegarde
 * - ne touche PAS au store XML
 */
export function useRubriqueChangeTracker(
  editor: Editor | null,
  rubriqueId: number | null | undefined
) {
  const [hasChanges, setHasChanges] = useState(false);
  const initialJsonRef = useRef<any>(null);

  const resetAfterSave = () => {
    if (!editor) return;
    initialJsonRef.current = editor.getJSON();
    setHasChanges(false);
  };

  useEffect(() => {
    if (!editor || !rubriqueId) return;

    initialJsonRef.current = editor.getJSON();
    setHasChanges(false);

    const handleUpdate = () => {
      if (!initialJsonRef.current) return;

      const current = editor.getJSON();
      const changed =
        JSON.stringify(current) !== JSON.stringify(initialJsonRef.current);

      if (changed) {
        setHasChanges(true);
      }
    };

    editor.on("update", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor, rubriqueId]);

  return {
    hasChanges,
    resetAfterSave,
  };
}
