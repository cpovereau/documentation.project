// src/api/maps.ts
import api from "@/lib/apiClient";
import { MapItem } from "@/types/MapItem"

export interface MapRubriqueDTO {
  id: number
  ordre: number
  parent: number | null
  rubrique: {
    id: number
    titre: string
    revision_numero: number
    is_active: boolean
    is_archived: boolean
  }
}

export async function listMapRubriques(
  mapId: number
): Promise<MapRubriqueDTO[]> {
  const { data } = await api.get<MapRubriqueDTO[]>(
    `/api/maps/${mapId}/rubriques/`
  )
  return data
}

export async function loadMapRubriques(mapId: number): Promise<MapItem[]> {
  const { data } = await api.get(`/api/maps/${mapId}/rubriques/`)

  // Transformation backend → UI
  return data.map((item: any) => ({
    id: item.id,
    rubriqueId: item.rubrique_id,
    title: item.titre,
    parentId: item.parent,
    level: item.parent ? 1 : 0, // simple au départ
    expanded: true,
  }))
}

