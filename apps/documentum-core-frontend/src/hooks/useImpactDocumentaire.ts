/**
 * useImpactDocumentaire — hooks dédiés à la gestion des ImpactDocumentaire.
 *
 * Implémente les endpoints définis dans 10_BACKEND_CANONIQUE.md § 9.3 :
 * - GET    /api/impacts/?evolution_produit={id}
 * - POST   /api/impacts/
 * - PATCH  /api/impacts/{id}/update_statut/
 * - DELETE /api/impacts/{id}/
 *
 * Règles respectées :
 * - Fallback tableau via constante module-level (interdit ?? [])
 *   cf. gov_forbidden-patterns.md § 4.3
 * - Aucun appel API direct — tout via impacts.ts / rubriques.ts
 * - Aucune logique métier dans les composants — tout ici
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getImpacts,
  createImpact,
  updateStatutImpact as updateStatutImpactApi,
  updateNotesImpact as updateNotesImpactApi,
  deleteImpact as deleteImpactApi,
  type ImpactDocumentaire,
  type StatutImpact,
} from "@/api/impacts";
import { listRubriques, type Rubrique } from "@/api/rubriques";

// ---------------------------------------------------------------------------
// Clés de cache
// ---------------------------------------------------------------------------

const impactsKey = (evolutionProduitId: number) =>
  ["impacts", evolutionProduitId] as const;

const RUBRIQUES_LIST_KEY = ["rubriques-list"] as const;

// Constantes module-level — références stables (gov_forbidden-patterns § 4.3).
const EMPTY_IMPACTS: ImpactDocumentaire[] = [];
const EMPTY_RUBRIQUES: Rubrique[] = [];

// ---------------------------------------------------------------------------
// useImpactList
// ---------------------------------------------------------------------------

export interface UseImpactListReturn {
  impacts: ImpactDocumentaire[];
  isLoading: boolean;
  isError: boolean;
}

/**
 * Charge les ImpactDocumentaire d'une évolution depuis GET /api/impacts/?evolution_produit={id}.
 * La query est désactivée si evolutionProduitId est null.
 */
export function useImpactList(
  evolutionProduitId: number | null
): UseImpactListReturn {
  const query = useQuery({
    queryKey:
      evolutionProduitId !== null
        ? impactsKey(evolutionProduitId)
        : ["impacts-disabled"],
    queryFn: () => getImpacts(evolutionProduitId!),
    enabled: evolutionProduitId !== null,
    staleTime: 10_000,
  });

  return {
    impacts: query.data ?? EMPTY_IMPACTS,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

// ---------------------------------------------------------------------------
// useImpactCreate
// ---------------------------------------------------------------------------

export interface UseImpactCreateReturn {
  addImpact: (
    evolutionProduitId: number,
    rubriqueId: number,
    callbacks?: { onSuccess?: (created: ImpactDocumentaire) => void }
  ) => void;
  isAdding: boolean;
}

/**
 * Crée un ImpactDocumentaire via POST /api/impacts/.
 * Invalide le cache de l'évolution concernée après succès.
 */
export function useImpactCreate(): UseImpactCreateReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      evolutionProduitId,
      rubriqueId,
    }: {
      evolutionProduitId: number;
      rubriqueId: number;
    }) => createImpact(evolutionProduitId, rubriqueId),
    onSuccess: (created) => {
      queryClient.invalidateQueries({
        queryKey: impactsKey(created.evolution_produit),
      });
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout de l'impact");
    },
  });

  const addImpact: UseImpactCreateReturn["addImpact"] = (
    evolutionProduitId,
    rubriqueId,
    callbacks
  ) => {
    mutation.mutate(
      { evolutionProduitId, rubriqueId },
      {
        onSuccess: (created) => {
          toast.success("Impact documentaire ajouté");
          callbacks?.onSuccess?.(created);
        },
      }
    );
  };

  return {
    addImpact,
    isAdding: mutation.isPending,
  };
}

// ---------------------------------------------------------------------------
// useImpactUpdateStatut
// ---------------------------------------------------------------------------

export interface UseImpactUpdateStatutReturn {
  updateStatut: (
    impactId: number,
    statut: StatutImpact,
    evolutionProduitId: number
  ) => void;
  isUpdating: boolean;
}

/**
 * Met à jour le statut d'un ImpactDocumentaire via PATCH /api/impacts/{id}/update_statut/.
 * Invalide le cache de l'évolution concernée après succès.
 */
export function useImpactUpdateStatut(): UseImpactUpdateStatutReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      impactId,
      statut,
    }: {
      impactId: number;
      statut: StatutImpact;
      evolutionProduitId: number;
    }) => updateStatutImpactApi(impactId, statut),
    onSuccess: (_, { evolutionProduitId }) => {
      queryClient.invalidateQueries({
        queryKey: impactsKey(evolutionProduitId),
      });
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du statut");
    },
  });

  const updateStatut = (
    impactId: number,
    statut: StatutImpact,
    evolutionProduitId: number
  ) => {
    mutation.mutate({ impactId, statut, evolutionProduitId });
  };

  return {
    updateStatut,
    isUpdating: mutation.isPending,
  };
}

// ---------------------------------------------------------------------------
// useImpactUpdateNotes
// ---------------------------------------------------------------------------

export interface UseImpactUpdateNotesReturn {
  updateNotes: (
    impactId: number,
    notes: string,
    evolutionProduitId: number,
    callbacks?: { onSuccess?: (updated: ImpactDocumentaire) => void }
  ) => void;
  isUpdating: boolean;
}

/**
 * Met à jour les notes d'un ImpactDocumentaire via PATCH /api/impacts/{id}/update_notes/.
 * Invalide le cache de l'évolution concernée après succès.
 */
export function useImpactUpdateNotes(): UseImpactUpdateNotesReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      impactId,
      notes,
    }: {
      impactId: number;
      notes: string;
      evolutionProduitId: number;
    }) => updateNotesImpactApi(impactId, notes),
    onSuccess: (_, { evolutionProduitId }) => {
      queryClient.invalidateQueries({
        queryKey: impactsKey(evolutionProduitId),
      });
      toast.success("Notes enregistrées");
    },
    onError: () => {
      toast.error("Erreur lors de l'enregistrement des notes");
    },
  });

  const updateNotes = (
    impactId: number,
    notes: string,
    evolutionProduitId: number,
    callbacks?: { onSuccess?: (updated: ImpactDocumentaire) => void }
  ) => {
    mutation.mutate(
      { impactId, notes, evolutionProduitId },
      { onSuccess: (updated) => callbacks?.onSuccess?.(updated) }
    );
  };

  return {
    updateNotes,
    isUpdating: mutation.isPending,
  };
}

// ---------------------------------------------------------------------------
// useImpactDelete
// ---------------------------------------------------------------------------

export interface UseImpactDeleteReturn {
  deleteImpact: (impactId: number, evolutionProduitId: number) => void;
  isDeleting: boolean;
}

/**
 * Supprime un ImpactDocumentaire via DELETE /api/impacts/{id}/.
 * Invalide le cache de l'évolution concernée après succès.
 */
export function useImpactDelete(): UseImpactDeleteReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      impactId,
    }: {
      impactId: number;
      evolutionProduitId: number;
    }) => deleteImpactApi(impactId),
    onSuccess: (_, { evolutionProduitId }) => {
      queryClient.invalidateQueries({
        queryKey: impactsKey(evolutionProduitId),
      });
      toast.success("Impact supprimé");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de l'impact");
    },
  });

  const deleteImpact = (impactId: number, evolutionProduitId: number) => {
    mutation.mutate({ impactId, evolutionProduitId });
  };

  return {
    deleteImpact,
    isDeleting: mutation.isPending,
  };
}

// ---------------------------------------------------------------------------
// useRubriqueListForImpact
// ---------------------------------------------------------------------------

export interface UseRubriqueListReturn {
  rubriques: Rubrique[];
  isLoading: boolean;
}

/**
 * Charge la liste des rubriques non archivées pour le dialog d'ajout d'impact.
 * Cache statique — les rubriques ne changent pas au rythme des impacts.
 */
export function useRubriqueListForImpact(): UseRubriqueListReturn {
  const query = useQuery({
    queryKey: RUBRIQUES_LIST_KEY,
    queryFn: () => listRubriques({ is_archived: false }),
    staleTime: 60_000,
  });

  return {
    rubriques: query.data ?? EMPTY_RUBRIQUES,
    isLoading: query.isLoading,
  };
}
