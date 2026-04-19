/**
 * API — ImpactDocumentaire
 *
 * Tous les appels passent par apiClient (auth + CSRF configurés).
 * Endpoints canoniques définis dans 10_BACKEND_CANONIQUE.md § 9.3.
 */

import api from "@/lib/apiClient";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StatutImpact =
  | "a_faire"
  | "en_cours"
  | "pret"
  | "valide"
  | "ignore";

export interface ImpactDocumentaire {
  id: number;
  evolution_produit: number;
  rubrique: number;
  rubrique_titre: string;
  statut: StatutImpact;
  notes: string;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

/** GET /api/impacts/?evolution_produit={id} */
export const getImpacts = async (
  evolutionProduitId: number
): Promise<ImpactDocumentaire[]> => {
  const response = await api.get<ImpactDocumentaire[]>(
    `/api/impacts/?evolution_produit=${evolutionProduitId}`
  );
  return response.data;
};

/** POST /api/impacts/ */
export const createImpact = async (
  evolutionProduitId: number,
  rubriqueId: number
): Promise<ImpactDocumentaire> => {
  const response = await api.post<ImpactDocumentaire>("/api/impacts/", {
    evolution_produit: evolutionProduitId,
    rubrique: rubriqueId,
  });
  return response.data;
};

/** PATCH /api/impacts/{id}/update_statut/ */
export const updateStatutImpact = async (
  impactId: number,
  statut: StatutImpact
): Promise<ImpactDocumentaire> => {
  const response = await api.patch<ImpactDocumentaire>(
    `/api/impacts/${impactId}/update_statut/`,
    { statut }
  );
  return response.data;
};

/** PATCH /api/impacts/{id}/update_notes/ */
export const updateNotesImpact = async (
  impactId: number,
  notes: string
): Promise<ImpactDocumentaire> => {
  const response = await api.patch<ImpactDocumentaire>(
    `/api/impacts/${impactId}/update_notes/`,
    { notes }
  );
  return response.data;
};

/** DELETE /api/impacts/{id}/ */
export const deleteImpact = async (impactId: number): Promise<void> => {
  await api.delete(`/api/impacts/${impactId}/`);
};
