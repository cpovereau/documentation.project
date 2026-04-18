import { useMutation } from "@tanstack/react-query";
import api from "@/lib/apiClient";

interface ImportMediaPayload {
  file: Blob;
  produitId: number;
  fonctionnaliteId: number;
  interfaceId: number;
  nomFichier: string;
  remplacer: boolean;
  remplacerNomFichier?: string | null;
}

export function useImportMedia() {
  return useMutation({
    mutationFn: async ({
      file,
      produitId,
      fonctionnaliteId,
      interfaceId,
      nomFichier,
      remplacer,
      remplacerNomFichier,
    }: ImportMediaPayload) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("produit", produitId.toString());
      formData.append("fonctionnalite", fonctionnaliteId.toString());
      formData.append("interface", interfaceId.toString());
      formData.append("nom_fichier", nomFichier);
      formData.append("remplacer", remplacer ? "true" : "false");
      if (remplacerNomFichier) {
        formData.append("remplacer_nom_fichier", remplacerNomFichier);
      }
      const res = await api.post("/import/media/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
  });
}
