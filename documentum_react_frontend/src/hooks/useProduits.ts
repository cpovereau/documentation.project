import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export function useProduits() {
  return useQuery({
    queryKey: ["produits"],
    queryFn: async () => {
      const response = await api.get("/produits/");
      return response.data;
    },
  });
}
