/**
 * API — VersionProduit et EvolutionProduit
 *
 * Tous les appels passent par apiClient (auth + CSRF configurés).
 * Endpoints canoniques définis dans 10_BACKEND_CANONIQUE.md §§ 9.1 et 9.2.
 */

import api from "@/lib/apiClient";

// ---------------------------------------------------------------------------
// Types — VersionProduit
// ---------------------------------------------------------------------------

export interface VersionProduit {
  id: number;
  produit: number;
  produit_nom?: string;
  numero: string;
  statut: "en_preparation" | "publiee" | "archivee";
  date_publication: string | null;
  created_at: string;
}

export interface CreateVersionProduitPayload {
  produit: number;
  numero: string;
}

// ---------------------------------------------------------------------------
// Types — EvolutionProduit
// ---------------------------------------------------------------------------

export interface EvolutionProduit {
  id: number;
  version_produit: number;
  version_numero?: string;
  fonctionnalite: number;
  fonctionnalite_nom?: string;
  type: "evolution" | "correctif";
  description: string;
  ordre: number;
  statut: "draft" | "valide";
  is_archived: boolean;
  created_at: string;
}

export interface CreateEvolutionProduitPayload {
  version_produit: number;
  fonctionnalite: number;
  type: "evolution" | "correctif";
  description?: string;
}

export interface ReorderEvolutionsProduitPayload {
  orderedIds: number[];
}

// ---------------------------------------------------------------------------
// API — VersionProduit
// ---------------------------------------------------------------------------

/** GET /api/versions-produit/?produit={id} — versions non archivées d'un produit. */
export const getVersionsProduit = async (
  produitId: number
): Promise<VersionProduit[]> => {
  const response = await api.get<VersionProduit[]>(
    `/api/versions-produit/?produit=${produitId}`
  );
  return response.data;
};

/** POST /api/versions-produit/ — crée une nouvelle version pour un produit. */
export const createVersionProduit = async (
  payload: CreateVersionProduitPayload
): Promise<VersionProduit> => {
  const response = await api.post<VersionProduit>(
    "/api/versions-produit/",
    payload
  );
  return response.data;
};

/**
 * POST /api/versions-produit/{id}/publier/ — publie la version.
 * La publication est irréversible côté backend.
 */
export const publierVersionProduit = async (
  id: number
): Promise<VersionProduit> => {
  const response = await api.post<VersionProduit>(
    `/api/versions-produit/${id}/publier/`
  );
  return response.data;
};

// ---------------------------------------------------------------------------
// API — EvolutionProduit
// ---------------------------------------------------------------------------

/** GET /api/evolutions-produit/?version_produit={id} — évolutions non archivées d'une version. */
export const getEvolutionsProduit = async (
  versionProduitId: number
): Promise<EvolutionProduit[]> => {
  const response = await api.get<EvolutionProduit[]>(
    `/api/evolutions-produit/?version_produit=${versionProduitId}`
  );
  return response.data;
};

/** POST /api/evolutions-produit/ — crée une évolution dans une version. */
export const createEvolutionProduit = async (
  payload: CreateEvolutionProduitPayload
): Promise<EvolutionProduit> => {
  const response = await api.post<EvolutionProduit>(
    "/api/evolutions-produit/",
    payload
  );
  return response.data;
};

/**
 * PATCH /api/evolutions-produit/{id}/archive/ — archive (suppression logique).
 * DELETE retourne 405 (ArchivableModelViewSet).
 */
export const archiveEvolutionProduit = async (id: number): Promise<void> => {
  await api.patch(`/api/evolutions-produit/${id}/archive/`);
};

/** PATCH /api/evolutions-produit/reorder/ — réordonne en transaction atomique. */
export const reorderEvolutionsProduit = async (
  payload: ReorderEvolutionsProduitPayload
): Promise<void> => {
  await api.patch("/api/evolutions-produit/reorder/", payload);
};
