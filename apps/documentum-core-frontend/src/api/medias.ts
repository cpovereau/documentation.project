// =====================================================
// 📂 Fichier : src/api/medias.ts
// 🔎 API d'accès aux médias (images / vidéos)
// =====================================================

import api from "@/lib/apiClient";

export interface MediaItem {
  id: number;
  nom_fichier: string;
  chemin_acces: string;
  description?: string;
  type_media: "image" | "video";
  produit: number;
  rubrique?: number | null;
}

export const getAllMedias = async (): Promise<MediaItem[]> => {
  const response = await api.get<MediaItem[]>("/api/media-items/");
  return response.data;
};