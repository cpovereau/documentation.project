// 📁 src/hooks/useGammes.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { Gamme } from "@/types/dictionnaires";

export function useGammes() {
  return useQuery<Gamme[]>({
    queryKey: ["gammes"],
    queryFn: async () => {
      const response = await api.get("/gammes/?archived=false");
      return response.data;
    },
  });
}
