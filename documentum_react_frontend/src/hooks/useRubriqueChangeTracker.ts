// hooks/useRubriqueChangeTracker.ts
import { useEffect, useState } from "react";
import { Editor } from "@tiptap/react";

interface UseRubriqueChangeTrackerResult {
  hasChanges: boolean;
  resetInitialContent: () => void;
  updateInitialContent: (html: string) => void;
}

export function useRubriqueChangeTracker(
  editor: Editor | null
): UseRubriqueChangeTrackerResult {
  const [initialContent, setInitialContent] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Met à jour l'état à chaque changement dans l'éditeur
  useEffect(() => {
    if (!editor) return;

    const updateState = () => {
      const current = editor.getHTML();
      setHasChanges(current !== initialContent);
    };

    updateState(); // appel initial
    editor.on("update", updateState);

    return () => {
      editor.off("update", updateState);
    };
  }, [editor, initialContent]);

  // Utilisé après un enregistrement pour réinitialiser la comparaison
  const resetInitialContent = () => {
    if (editor) {
      setInitialContent(editor.getHTML());
      setHasChanges(false);
    }
  };

  // Utilisé si tu veux forcer un nouveau point de référence depuis l'externe
  const updateInitialContent = (html: string) => {
    setInitialContent(html);
  };

  return {
    hasChanges,
    resetInitialContent,
    updateInitialContent,
  };
}