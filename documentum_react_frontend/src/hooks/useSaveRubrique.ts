// src/hooks/useSaveRubrique.ts
import { useCallback, useState } from "react";
import { Editor } from "@tiptap/react";
import apiClient from "@/lib/apiClient";
import useXmlBufferStore from "@/store/xmlBufferStore";
import { toast } from "sonner";

export function useSaveRubrique(editor: Editor | null, rubriqueId: number | null | undefined) {
  const [saving, setSaving] = useState(false);

  const setXml = useXmlBufferStore((s) => s.setXml);
  const markSaved = useXmlBufferStore((s) => s.markSaved);
  const getRubriqueState = useXmlBufferStore((s) => s.getRubriqueState);

  const saveRubrique = useCallback(async () => {
    if (!editor || rubriqueId == null) {
      toast.error("Éditeur ou rubrique indisponible. Sauvegarde annulée.");
      return;
    }

    const content = editor.getHTML();
    const rubrique = getRubriqueState(rubriqueId);

    if (!rubrique) {
      toast.error("Rubrique non trouvée en mémoire. Impossible de sauvegarder.");
      return;
    }

    try {
      setSaving(true);

      await apiClient.patch(`/rubriques/${rubriqueId}/`, {
        contenu_xml: content,
      });

      setXml(rubriqueId, content);
      markSaved(rubriqueId);
      toast.success("Rubrique sauvegardée avec succès.");
    } catch (error: any) {
      console.error("[saveRubrique] Erreur lors de la sauvegarde :", error);
      toast.error("Erreur lors de la sauvegarde de la rubrique.");
    } finally {
      setSaving(false);
    }
  }, [editor, rubriqueId, getRubriqueState, setXml, markSaved]);

  return { saveRubrique, saving };
}
