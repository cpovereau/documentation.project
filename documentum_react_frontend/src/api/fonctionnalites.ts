// =====================================================
// 📂 Fichier : src/api/fonctionnalites.ts
// 🔎 API pour les fonctionnalités
// =====================================================

import { api } from "@/lib/apiClient";

export interface Fonctionnalite {
  id: number;
  nom: string;
  code: string;
  id_fonctionnalite: string;
  produit: number;
  produit_nom?: string;
  is_archived: boolean;
}

export const getAllFonctionnalites = async (): Promise<Fonctionnalite[]> => {
  const response = await api.get<Fonctionnalite[]>("/fonctionnalites/");
  return response.data;
};