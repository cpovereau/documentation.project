import React, { useState } from "react";
import { toast } from "sonner";
import { ImportModal } from "@/components/ui";
import { api } from "@/lib/apiClient";
import { ensureCSRFReady } from "@/utils/csrf";

export function useImportFonctionnalites(
  produits: { id: number; nom: string }[],
  onSuccess?: () => void
) {
  const [open, setOpen] = useState(false);

  const startImport = () => setOpen(true);
  const cancel = () => setOpen(false);

  const handleConfirm = async ({
    file,
    mapping,
    produitId,
    skipHeader,
  }: {
    file: File;
    mapping: Record<string, number>;
    produitId: number;
    skipHeader: boolean;
  }) => {
    try {
      // 1. Attente de préparer le CSRF
      await ensureCSRFReady();

      // 2. Préparation du formulaire
      const form = new FormData();
      form.append("file", file);
      form.append("mapping", JSON.stringify(mapping));
      form.append("produit", produitId.toString());
      form.append("skip_header", skipHeader ? "true" : "false");

      // 3. Envoi POST
      await api.post("/import/fonctionnalites/", form);

      toast.success("Import terminé !");
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erreur pendant l'import");
      console.error(err);
    } finally {
      cancel();
    }
  };

  const ImportFonctionnalitesUI = () => (
    <ImportModal
      open={open}
      title="Importer des fonctionnalités"
      onClose={cancel}
      onConfirm={handleConfirm}
      produits={produits}
    />
  );

  return { ImportFonctionnalitesUI, startImport };
}
