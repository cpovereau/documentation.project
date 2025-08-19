// lib/resources.ts
import api from "@/lib/apiClient";

/**
 * Toggle l'archivage ou la restauration d'une ressource de type ArchivableModelViewSet
 * @param resource Pluriel de la ressource (ex: "gammes")
 * @param id ID de l'item
 * @param isArchived true si l'item est déjà archivé (donc on le restaure)
 */
export async function toggleArchivableResource(
  resource: string,
  id: number,
  isArchived: boolean
): Promise<void> {
  const action = isArchived ? "restore" : "archive";
  await api.patch(`/${resource}/${id}/${action}/`);
}
