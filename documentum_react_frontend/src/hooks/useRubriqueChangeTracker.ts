// src/hooks/useRubriqueChangeTracker.ts
import { useEffect, useState } from "react";
import { Editor } from "@tiptap/react";
import useXmlBufferStore from "@/store/xmlBufferStore";

export function useRubriqueChangeTracker(editor: Editor | null, rubriqueId: number | null | undefined) {
  const [hasChanges, setHasChanges] = useState(false);
  const getRubriqueState = useXmlBufferStore((s) => s.getRubriqueState);
  const markDirty = useXmlBufferStore((s) => s.markDirty);
  const markSaved = useXmlBufferStore((s) => s.markSaved);
  const setXml = useXmlBufferStore((s) => s.setXml);

  // 🖊️ Suivi de modifications de contenu
  useEffect(() => {
    if (!editor || rubriqueId == null) return;

    const handleUpdate = () => {
      const current = editor.getHTML();
      const rubrique = getRubriqueState(rubriqueId);

      if (!rubrique) return;
      if (current !== rubrique.xml) {
        markDirty(rubriqueId);
      }
    };

    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor, rubriqueId, getRubriqueState, markDirty]);

  // 🧭 Mise à jour du flag de modification
  useEffect(() => {
    if (rubriqueId == null) return;

    const check = () => {
      const rubrique = getRubriqueState(rubriqueId);
      setHasChanges(rubrique?.status === "dirty");
    };

    check(); // immédiat

    // Option : si tu veux du live-check, garde ce setInterval
    const interval = setInterval(check, 500);
    return () => clearInterval(interval);
  }, [rubriqueId, getRubriqueState]);

  // ✅ Appelé après sauvegarde réussie
  const resetInitialContent = () => {
    if (!editor || rubriqueId == null) return;

    const html = editor.getHTML();
    setXml(rubriqueId, html);
    markSaved(rubriqueId);
    setHasChanges(false);
  };

  return { hasChanges, resetInitialContent };
}
