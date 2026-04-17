import { useQuery } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export interface ProjetListItem {
  id: number;
  nom: string;
  gamme: { id: number; nom: string };
  date_mise_a_jour: string;
}

export function useProjets(enabled = true) {
  return useQuery<ProjetListItem[]>({
    queryKey: ["projets"],
    queryFn: async () => {
      const res = await api.get<ProjetListItem[]>("/api/projets/?archived=false");
      return res.data;
    },
    enabled,
  });
}
