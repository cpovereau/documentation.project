import { useQuery } from "@tanstack/react-query";
import api from "@/lib/apiClient";
import { Audience } from "@/types/dictionnaires";

export function useAudiences() {
  return useQuery<Audience[]>({
    queryKey: ["audiences"],
    queryFn: async () => {
      const response = await api.get("/audiences/?archived=false");
      return response.data;
    },
  });
}
