import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await api.get("/tags/");
      return response.data;
    },
  });
}
