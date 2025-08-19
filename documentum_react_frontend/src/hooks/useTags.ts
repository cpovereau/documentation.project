import { useQuery } from "@tanstack/react-query";
import api from "@/lib/apiClient";
import { Tag } from "@/types/dictionnaires";

export function useTags() {
  return useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await api.get("/tags/?archived=false");
      return response.data;
    },
  });
}
