import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export function useGammes() {
  return useQuery({
    queryKey: ["gammes"],
    queryFn: async () => {
      const response = await api.get("/gammes/");
      return response.data;
    },
  });
}
