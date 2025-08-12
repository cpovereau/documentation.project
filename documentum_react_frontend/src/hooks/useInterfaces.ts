import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { InterfaceUtilisateur } from "@/types/dictionnaires";

export function useInterfaces() {
  return useQuery<InterfaceUtilisateur[]>({
    queryKey: ["interfaces"],
    queryFn: async () => {
      const response = await api.get("/interfaces/?archived=false");
      return response.data;
    },
  });
}
