// src/api/rubriques.ts
import api from "@/lib/apiClient"

/** ---- Types ---- */

export type DitaType = "topic" | "concept" | "task" | "reference"

/** Requête API backend */
export interface Rubrique {
  id: number
  titre: string
  contenu_xml: string
  projet: number
  type_rubrique: number
  fonctionnalite?: {
    id: number
    code: string
    nom: string
  } | null
  version_projet?: number
  is_active: boolean
  is_archived: boolean
  date_creation: string
  date_mise_a_jour: string
  audience: string
  revision_numero: number
  version: number
  version_precedente?: number | null
}

export interface RubriqueCreatePayload {
  titre: string
  contenu_xml: string
  projet: number

  // Champs optionnels (backend-driven ou tardifs)
  type_rubrique?: number | null
  fonctionnalite_id?: number | null
  audience?: string
  revision_numero?: number
  version?: number
  version_projet?: number
}

export interface RubriqueUpdatePayload extends Partial<RubriqueCreatePayload> {}

/** ---- API Calls ---- */
export async function getRubrique(id: number): Promise<Rubrique> {
  const { data } = await api.get<Rubrique>(`/api/rubriques/${id}/`)
  return data
}

export async function listRubriques(params?: Record<string, any>): Promise<Rubrique[]> {
  const { data } = await api.get<Rubrique[]>("/api/rubriques/", { params })
  return data
}

export async function createRubrique(payload: RubriqueCreatePayload): Promise<Rubrique> {
  const { data } = await api.post<Rubrique>("/api/rubriques/", payload)
  return data
}

export async function updateRubrique(
  id: number,
  payload: RubriqueUpdatePayload
): Promise<Rubrique> {
  const { data } = await api.patch<Rubrique>(`/rubriques/${id}/`, payload)
  return data
}
