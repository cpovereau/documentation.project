// src/api/mapRubriques.ts
import api from "@/lib/apiClient"

/**
 * Représente l’usage structurel d’une Rubrique dans une Map.
 * 👉 Source de vérité pour l’arbre documentaire.
 */
export interface MapRubrique {
  id: number
  map: number
  rubrique: number
  ordre: number
  parent: number | null

  // Enrichissements possibles (optionnels selon endpoints)
  rubrique_detail?: {
    id: number
    titre: string
    is_active: boolean
    is_archived: boolean
  }
}

/** ---- API Calls ---- */

/**
 * Création d’un lien Map ↔ Rubrique
 * 👉 étape obligatoire après la création d’une rubrique
 */
export async function createMapRubrique(
  mapId: number,
  payload: { rubrique: number; parent?: number | null }
) {
  const { data } = await api.post(
    `/api/maps/${mapId}/rubriques/`,
    payload
  );
  return data;
}

/**
 * Mise à jour d’un lien (ordre / parent)
 * 👉 utilisé pour le drag & drop / réorganisation
 */
export async function updateMapRubrique(
  mapId: number,
  mapRubriqueId: number,
  payload: { ordre?: number; parent?: number | null }
) {
  const { data } = await api.patch(
    `/api/maps/${mapId}/rubriques/${mapRubriqueId}/`,
    payload
  );
  return data;
}


/**
 * Suppression d’un lien Map ↔ Rubrique
 * 👉 ne supprime PAS la rubrique elle-même
 */
export async function deleteMapRubrique(
  mapId: number,
  mapRubriqueId: number
): Promise<void> {
  await api.delete(
    `/api/maps/${mapId}/rubriques/${mapRubriqueId}/`
  );
}
