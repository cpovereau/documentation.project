import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";
import { listMapRubriques } from "@/api/maps";
import type { MapRubriqueDTO } from "@/api/maps";

export const mapStructureQueryKey = (mapId: number | null) =>
  ["map-structure", mapId] as const;

// Référence stable partagée pour le fallback vide — évite les boucles de rendu
// causées par `query.data ?? []` (nouvelle référence [] à chaque rendu).
const EMPTY_RUBRIQUES: MapRubriqueDTO[] = [];

interface CreateRubriquePayload {
  titre: string;
  contenu_xml: string;
  parent: number;
}

export function useMapStructure(mapId: number | null) {
  const queryClient = useQueryClient();

  const query = useQuery<MapRubriqueDTO[]>({
    queryKey: mapStructureQueryKey(mapId),
    queryFn: () => mapId === null ? Promise.resolve([]) : listMapRubriques(mapId),
    enabled: !!mapId,
    staleTime: 30_000,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: mapStructureQueryKey(mapId) });

  const createRubrique = useMutation({
    mutationFn: (payload: CreateRubriquePayload) =>
      api.post(`/api/maps/${mapId}/structure/create/`, payload),
    onSuccess: invalidate,
  });

  const renameRubrique = useMutation({
    mutationFn: ({ rubriqueId, titre }: { rubriqueId: number; titre: string }) =>
      api.patch(`/api/rubriques/${rubriqueId}/`, { titre }),
    onSuccess: invalidate,
  });

  const indent = useMutation({
    mutationFn: (mapRubriqueId: number) =>
      api.post(`/api/maps/${mapId}/structure/${mapRubriqueId}/indent/`),
    onSuccess: invalidate,
  });

  const outdent = useMutation({
    mutationFn: (mapRubriqueId: number) =>
      api.post(`/api/maps/${mapId}/structure/${mapRubriqueId}/outdent/`),
    onSuccess: invalidate,
  });

  const reorder = useMutation({
    mutationFn: (orderedIds: number[]) =>
      api.post(`/api/maps/${mapId}/structure/reorder/`, { orderedIds }),
    onSuccess: invalidate,
  });

  return {
    mapRubriques: query.data ?? EMPTY_RUBRIQUES,
    isLoading: query.isLoading,
    isError: query.isError,
    createRubrique,
    renameRubrique,
    indent,
    outdent,
    reorder,
  };
}
