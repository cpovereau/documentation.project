// =====================================================
// 📂 Fichier : src/hooks/useGammes.ts
// 🔎 Hook pour récupérer les gammes
// =====================================================
import { useQuery } from "@tanstack/react-query";
import { getAllGammes, Gamme } from "@/api/gammes";

export function useGammes() {
  return useQuery<Gamme[]>({
    queryKey: ["gammes"],
    queryFn: getAllGammes,
  });
}
