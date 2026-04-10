// src/api/maps.ts
import api from "@/lib/apiClient";

/**
 * Formats de publication supportés par le backend (DITA-OT).
 * Source : DITA_OUTPUT_FORMATS dans documentation/utils.py
 */
export const PUBLISH_FORMATS = [
  { value: "pdf",         label: "PDF" },
  { value: "html5",       label: "Web Help (HTML5)" },
  { value: "xhtml",       label: "XHTML" },
  { value: "scorm",       label: "Moodle (SCORM)" },
  { value: "markdown",    label: "Markdown" },
  { value: "eclipsehelp", label: "Eclipse Help" },
] as const;

export type PublishFormat = (typeof PUBLISH_FORMATS)[number]["value"];

/**
 * Réponse retournée par POST /api/publier-map/{map_id}/
 */
export interface PublishMapResult {
  status: "success" | "error";
  message: string;
  map?: string;
  rubriques_count?: number;
  format?: string;
  formats_supportes?: string[];
}

/**
 * Publie une map au format demandé.
 * Route canonique : POST /api/publier-map/{mapId}/
 * Payload : { format }
 * Note : le backend retourne toujours HTTP 200 même en cas d'erreur métier.
 * Vérifier result.status pour distinguer succès / erreur.
 */
export async function publishMap(mapId: number, format: string): Promise<PublishMapResult> {
  const { data } = await api.post<PublishMapResult>(`/api/publier-map/${mapId}/`, { format });
  return data;
}

/**
 * DTO retourné par GET /api/maps/{id}/structure/
 * Correspond à MapRubriqueStructureSerializer (backend).
 *
 * Forme identique à ce que retournait l'ancien /rubriques/ mais
 * l'endpoint /rubriques/ a été supprimé côté backend (Sprint 3/4).
 * Le canon est désormais /structure/.
 */
export interface MapRubriqueDTO {
  id: number;
  ordre: number;
  parent: number | null;
  rubrique: {
    id: number;
    titre: string;
    revision_numero: number;
    is_active: boolean;
    is_archived: boolean;
  };
}

/**
 * Charge la structure d'une map.
 *
 * Route canonique : GET /api/maps/{mapId}/structure/
 * (remplace l'ancien GET /api/maps/{mapId}/rubriques/ supprimé Sprint 4)
 */
export async function listMapRubriques(mapId: number): Promise<MapRubriqueDTO[]> {
  const { data } = await api.get<MapRubriqueDTO[]>(`/api/maps/${mapId}/structure/`);
  return data;
}
