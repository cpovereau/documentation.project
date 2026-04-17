// =====================================================
// 📂 Fichier : src/api/fonctionnalites.ts
// 🔎 API pour les fonctionnalités
// =====================================================

import api from "@/lib/apiClient";

export interface Fonctionnalite {
  id: number;
  nom: string;
  code: string;
  id_fonctionnalite: string;
  produit: number;
  produit_nom?: string;
  is_archived: boolean;
}

export interface CreateFonctionnalitePayload {
  produit: number;
  nom: string;
  /** Code court unique par produit (5 chars max). */
  code: string;
  /** Identifiant fonctionnalité unique (8 chars max). */
  id_fonctionnalite: string;
}

/** Charge toutes les fonctionnalités non archivées. */
export const getFonctionnalites = async (): Promise<Fonctionnalite[]> => {
  const response = await api.get<Fonctionnalite[]>(
    "/api/fonctionnalites/?archived=false"
  );
  return response.data;
};

/** Crée une nouvelle fonctionnalité. */
export const createFonctionnalite = async (
  payload: CreateFonctionnalitePayload
): Promise<Fonctionnalite> => {
  const response = await api.post<Fonctionnalite>("/api/fonctionnalites/", payload);
  return response.data;
};

/**
 * Archive une fonctionnalité (équivaut à une suppression douce).
 * NOTE: DELETE /api/fonctionnalites/{id}/ retourne HTTP 405 (bloqué par ArchivableModelViewSet).
 * On utilise PATCH /api/fonctionnalites/{id}/archive/ à la place.
 */
export const archiveFonctionnalite = async (id: number): Promise<void> => {
  await api.patch(`/api/fonctionnalites/${id}/archive/`);
};
