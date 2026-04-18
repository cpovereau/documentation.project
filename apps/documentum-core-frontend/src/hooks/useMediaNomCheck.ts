import { useQuery } from "@tanstack/react-query";
import api from "@/lib/apiClient";
import { generateNextMediaName } from "@/lib/mediaUtils";

interface MediaNomCheckResult {
  nomMedia: string;
  doublon: boolean;
  existingImages: string[];
}

export function useMediaNomCheck(
  produitId: number | null,
  fonctionnaliteId: number | null,
  interfaceId: number | null,
  fileExtension: string,
) {
  return useQuery<MediaNomCheckResult>({
    queryKey: ["media-nom-check", produitId, fonctionnaliteId, interfaceId, fileExtension],
    queryFn: async () => {
      const res = await api.get("/medias-check-nom/", {
        params: { produit: produitId, fonctionnalite: fonctionnaliteId, interface: interfaceId },
      });
      const { prefix, existing = [] } = res.data;
      const extension = fileExtension || "jpg";
      const nextNom = generateNextMediaName(prefix, existing, extension);
      return {
        nomMedia: nextNom,
        doublon: existing.includes(nextNom),
        existingImages: existing,
      };
    },
    enabled: !!produitId && !!fonctionnaliteId && !!interfaceId,
  });
}
