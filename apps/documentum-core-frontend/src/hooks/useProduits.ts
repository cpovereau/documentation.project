// =====================================================
// 📂 Fichier : src/hooks/useProduits.ts
// 🔎 Hook pour récupérer les produits
// =====================================================
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/apiClient";
import { Produit } from "@/types/dictionnaires";

export function useProduits() {
  return useQuery<Produit[]>({
    queryKey: ["produits"],
    queryFn: async () => {
      const response = await api.get("/api/produits/?archived=false");
      return response.data;
    },
  });
}
