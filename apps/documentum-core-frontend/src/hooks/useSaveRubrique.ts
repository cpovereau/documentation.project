// src/hooks/useRubriqueSave.ts
import { useCallback, useState } from "react";
import apiClient from "@/lib/apiClient";
import useXmlBufferStore from "@/store/xmlBufferStore";
import { toast } from "sonner";

/**
 * Hook de sauvegarde d'une rubrique.
 *
 * Flux garanti :
 *   buffer XML → PATCH /api/rubriques/{id}/ → status "saved" | "error"
 *
 * Contrat :
 *   - saveRubrique() retourne true en cas de succès, false en cas d'erreur
 *   - resetAfterSave() ne doit être appelé par le parent QUE si saveRubrique() retourne true
 *   - Le statut buffer est mis à jour avant le retour dans les deux cas
 *   - PATCH utilisé (mise à jour partielle — DRF l'accepte via ModelViewSet)
 */
export function useRubriqueSave(rubriqueId: number | null | undefined) {
  const [saving, setSaving] = useState(false);

  const getXml = useXmlBufferStore((s) => s.getXml);
  const setStatus = useXmlBufferStore((s) => s.setStatus);

  const saveRubrique = useCallback(async (): Promise<boolean> => {
    if (rubriqueId == null) {
      toast.error("Rubrique non sélectionnée. Sauvegarde impossible.");
      return false;
    }

    const xml = getXml(rubriqueId);

    if (!xml) {
      toast.error("Aucun contenu XML en mémoire. Sauvegarde annulée.");
      return false;
    }

    try {
      setSaving(true);

      await apiClient.patch(`/api/rubriques/${rubriqueId}/`, {
        contenu_xml: xml,
      });

      setStatus(rubriqueId, "saved");
      toast.success("Rubrique sauvegardée avec succès.");
      return true;
    } catch (error: any) {
      console.error("[useRubriqueSave] Erreur sauvegarde :", error);

      setStatus(rubriqueId, "error");

      toast.error(
        error?.message ??
          "Erreur lors de la sauvegarde de la rubrique (XML invalide ?).",
      );
      return false;
    } finally {
      setSaving(false);
    }
  }, [rubriqueId, getXml, setStatus]);

  return {
    saveRubrique,
    saving,
  };
}
