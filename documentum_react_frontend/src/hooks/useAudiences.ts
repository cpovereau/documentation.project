import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export function useAudiences() {
  return useQuery({
    queryKey: ["audiences"],
    queryFn: async () => {
      const response = await api.get("/audiences/");
      return response.data;
    },
  });
}
