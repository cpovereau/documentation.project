import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { Fonctionnalite } from "@/types/dictionnaires";

export function useFonctionnalites() {
  return useQuery<Fonctionnalite[]>({
    queryKey: ["fonctionnalites"],
    queryFn: async () => {
      const response = await api.get("/fonctionnalites/?archived=false");
      return response.data;
    },
  });
}
