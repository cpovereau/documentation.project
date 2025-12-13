// src/hooks/useRubriqueSave.ts
import { useCallback, useState } from "react";
import apiClient from "@/lib/apiClient";
import useXmlBufferStore from "@/store/xmlBufferStore";
import { toast } from "sonner";

export function useRubriqueSave(rubriqueId: number | null | undefined) {
  const [saving, setSaving] = useState(false);

  const getXml = useXmlBufferStore((s) => s.getXml);
  const setStatus = useXmlBufferStore((s) => s.setStatus);

  const saveRubrique = useCallback(async () => {
    if (rubriqueId == null) {
      toast.error("Rubrique non sélectionnée. Sauvegarde impossible.");
      return;
    }

    const xml = getXml(rubriqueId);

    if (!xml) {
      toast.error("Aucun contenu XML en mémoire. Sauvegarde annulée.");
      return;
    }

    try {
      setSaving(true);

      await apiClient.patch(`/rubriques/${rubriqueId}/`, {
        contenu_xml: xml,
      });

      setStatus(rubriqueId, "saved");
      toast.success("Rubrique sauvegardée avec succès.");
    } catch (error: any) {
      console.error("[useRubriqueSave] Erreur sauvegarde :", error);

      setStatus(rubriqueId, "error");

      toast.error(
        error?.message ??
          "Erreur lors de la sauvegarde de la rubrique (XML invalide ?).",
      );
    } finally {
      setSaving(false);
    }
  }, [rubriqueId, getXml, setStatus]);

  return {
    saveRubrique,
    saving,
  };
}
