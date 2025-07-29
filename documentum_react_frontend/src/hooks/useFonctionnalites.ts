import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export function useFonctionnalites() {
  return useQuery({
    queryKey: ["fonctionnalites"],
    queryFn: async () => {
      const response = await api.get("/fonctionnalites/");
      return response.data;
    },
  });
}
