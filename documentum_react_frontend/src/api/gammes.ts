// =====================================================
// 📂 Fichier : src/api/gammes.ts
// 🔎 API pour les gammes
// =====================================================
import api from "@/lib/apiClient";

export interface Gamme {
  id: number;
  nom: string;
  description: string;
  is_archived: boolean;
}

export const getAllGammes = async (): Promise<Gamme[]> => {
  const response = await api.get<Gamme[]>("/gammes/?archived=false");
  return response.data;
};
