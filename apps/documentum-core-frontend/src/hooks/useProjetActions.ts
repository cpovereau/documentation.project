import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";
import type { MapRubriqueDTO } from "@/api/maps";
import type { ProjectDTO } from "@/types/ProjectDTO";

interface ProjetStructureData {
  map: { id: number };
  structure: MapRubriqueDTO[];
}

export function useProjetActions(selectedProjectId: number | null) {
  const queryClient = useQueryClient();

  const structure = useQuery<ProjetStructureData>({
    queryKey: ["projet-structure", selectedProjectId],
    queryFn: async () => {
      const res = await api.get<ProjetStructureData>(
        `/api/projets/${selectedProjectId}/structure/`,
      );
      return res.data;
    },
    enabled: !!selectedProjectId,
  });

  const deleteProjet = useMutation({
    mutationFn: (id: number) => api.delete(`/api/projets/${id}/`),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ["projet", id] });
      queryClient.removeQueries({ queryKey: ["projet-structure", id] });
    },
  });

  const fetchProjet = (projectId: number): Promise<ProjectDTO> =>
    queryClient.fetchQuery({
      queryKey: ["projet", projectId],
      queryFn: async () => {
        const res = await api.get<any>(`/api/projets/${projectId}/`);
        return res.data.project ?? res.data;
      },
      staleTime: 5 * 60 * 1000,
    });

  return { structure, deleteProjet, fetchProjet };
}
