// =====================================================
// 📂 Fichier : src/api/projet.ts
// 🔎 API pour les projets
// =====================================================
import api from '@/lib/apiClient';
import { Projet } from '@/store/projectStore';

export async function getProjets(): Promise<Projet[]> {
  const response = await api.get<Projet[]>('/projets/');
  return response.data;
}
