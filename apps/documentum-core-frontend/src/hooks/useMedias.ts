import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export interface MediaItem {
  id: number;
  nom_fichier: string;
  chemin_acces: string;
  description?: string;
  type_media: "image" | "video";
  produit: number;
  rubrique?: number | null;
}

interface UseMediasOptions {
  produitId?: number;
  fonctionnaliteCode?: string;
  interfaceCode?: string;
  searchTerm?: string;
}

export const useMedias = ({
  produitId,
  fonctionnaliteCode,
  interfaceCode,
  searchTerm,
}: UseMediasOptions = {}) => {
  const {
    data = [],
    isLoading: loading,
    error: rawError,
    refetch,
  } = useQuery({
    queryKey: ["medias"],
    queryFn: () => api.get<MediaItem[]>("/api/media-items/").then((r) => r.data),
    staleTime: 30_000,
  });

  const medias = useMemo(() => {
    let results = data;

    if (produitId) {
      results = results.filter((m) => m.produit === produitId);
    }
    if (fonctionnaliteCode) {
      const lc = fonctionnaliteCode.toLowerCase();
      results = results.filter(
        (m) =>
          m.nom_fichier.toLowerCase().includes(lc) ||
          m.description?.toLowerCase().includes(lc),
      );
    }
    if (interfaceCode) {
      const lc = interfaceCode.toLowerCase();
      results = results.filter(
        (m) =>
          m.nom_fichier.toLowerCase().includes(lc) ||
          m.description?.toLowerCase().includes(lc),
      );
    }
    if (searchTerm) {
      const lc = searchTerm.toLowerCase();
      results = results.filter(
        (m) =>
          m.nom_fichier.toLowerCase().includes(lc) ||
          m.description?.toLowerCase().includes(lc),
      );
    }

    return results;
  }, [data, produitId, fonctionnaliteCode, interfaceCode, searchTerm]);

  const error = rawError
    ? (rawError as any).message || "Erreur lors du chargement des médias"
    : null;

  return { medias, loading, error, refetch };
};
