// =====================================================
// 📂 Fichier : src/api/interfaces.ts
// 🔎 API pour les interfaces utilisateur
// =====================================================

import api from "@/lib/apiClient";

export interface InterfaceUtilisateur {
  id: number;
  nom: string;
  code: string;
  is_archived: boolean;
}

export const getAllInterfaces = async (): Promise<InterfaceUtilisateur[]> => {
  const response = await api.get<InterfaceUtilisateur[]>("/interfaces/");
  return response.data;
};