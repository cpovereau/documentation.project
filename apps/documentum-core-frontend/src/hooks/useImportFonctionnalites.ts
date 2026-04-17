import { useMutation } from "@tanstack/react-query";
import api from "@/lib/apiClient";

interface ImportFonctionnalitesPayload {
  file: File;
  mapping: Record<string, number>;
  produitId: number;
  skipHeader: boolean;
}

export function useImportFonctionnalites() {
  return useMutation({
    mutationFn: async ({ file, mapping, produitId, skipHeader }: ImportFonctionnalitesPayload) => {
      const form = new FormData();
      form.append("file", file);
      form.append("mapping", JSON.stringify(mapping));
      form.append("produit", produitId.toString());
      form.append("skip_header", skipHeader ? "true" : "false");
      const res = await api.post("/api/import/fonctionnalites/", form);
      return res.data;
    },
  });
}
