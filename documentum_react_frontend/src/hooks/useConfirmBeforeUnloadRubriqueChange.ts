import { useEffect } from "react";
import useXmlBufferStore from "@/store/xmlBufferStore";
import { toast } from "sonner";

export function useConfirmBeforeUnloadRubriqueChange(
  currentRubriqueId: number | null,
  onConfirm: () => void,
  onCancel: () => void
) {
  const getRubriqueState = useXmlBufferStore((s) => s.getRubriqueState);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const current = currentRubriqueId != null ? getRubriqueState(currentRubriqueId) : null;

      if (current?.status === "dirty") {
        event.preventDefault();
        event.returnValue = ""; // pour certains navigateurs
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentRubriqueId, getRubriqueState]);

  // Tu peux aussi créer une fonction manuelle pour les changements dans l'UI
  const confirmManualChange = () => {
    const current = currentRubriqueId != null ? getRubriqueState(currentRubriqueId) : null;

    if (current?.status === "dirty") {
      toast.warning("Des modifications non sauvegardées seront perdues.");
      const confirmed = window.confirm("Des modifications sont en cours. Voulez-vous continuer sans enregistrer ?");
      if (confirmed) onConfirm();
      else onCancel();
      return;
    }

    // Pas de modification → on confirme directement
    onConfirm();
  };

  return { confirmManualChange };
}
