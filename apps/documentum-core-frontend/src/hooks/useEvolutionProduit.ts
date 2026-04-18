/**
 * useEvolutionProduit — hooks dédiés à la gestion des EvolutionProduit.
 *
 * Implémente les endpoints définis dans 10_BACKEND_CANONIQUE.md § 9.2 :
 * - GET   /api/evolutions-produit/?version_produit={id}
 * - POST  /api/evolutions-produit/
 * - PATCH /api/evolutions-produit/{id}/archive/
 * - PATCH /api/evolutions-produit/reorder/
 *
 * Règles respectées :
 * - Fallback tableau via constante module-level (interdit ?? [])
 *   cf. gov_forbidden-patterns.md § 4.3
 * - Aucun appel API direct — tout via apiClient (versionsProduit.ts)
 * - Aucune logique métier dans les composants — tout ici
 *
 * Ref: PRODUCTDOCSYNC_ROADMAP.md — Phase 1.1, 1.2 (révisées 2026-04-18)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getEvolutionsProduit,
  createEvolutionProduit,
  archiveEvolutionProduit,
  reorderEvolutionsProduit,
  type EvolutionProduit,
  type CreateEvolutionProduitPayload,
  type ReorderEvolutionsProduitPayload,
} from "@/api/versionsProduit";
import type { FeatureItem } from "@/types/FeatureItem";

// Clé cache segmentée par versionProduitId.
const evolutionsProduitKey = (versionProduitId: number) =>
  ["evolutions-produit", versionProduitId] as const;

// Constante module-level — référence stable.
// Voir gov_forbidden-patterns.md § 4.3.
const EMPTY_EVOLUTIONS: EvolutionProduit[] = [];

// ---------------------------------------------------------------------------
// Mapping EvolutionProduit → FeatureItem
// ---------------------------------------------------------------------------

/**
 * Mappe une EvolutionProduit backend vers un FeatureItem UI.
 * Le nom affiché est le nom de la fonctionnalité référencée (référentiel).
 */
function toFeatureItem(e: EvolutionProduit): FeatureItem {
  return {
    id: e.id,
    name: e.fonctionnalite_nom ?? `Évolution #${e.id}`,
    level: 1,
    expanded: true,
    hasEvolution: e.type === "evolution",
    hasCorrectif: e.type === "correctif",
  };
}

// ---------------------------------------------------------------------------
// useEvolutionProduitList
// ---------------------------------------------------------------------------

export interface UseEvolutionProduitListReturn {
  /** Données brutes backend (pour copy/paste et mutations). */
  evolutions: EvolutionProduit[];
  /** Données mappées pour le composant FeatureModule. */
  features: FeatureItem[];
  isLoading: boolean;
  isError: boolean;
}

/**
 * Charge les EvolutionProduit d'une version depuis GET /api/evolutions-produit/?version_produit={id}.
 * La query est désactivée si versionProduitId est null.
 * Les évolutions archivées sont exclues par défaut (comportement backend).
 */
export function useEvolutionProduitList(
  versionProduitId: number | null
): UseEvolutionProduitListReturn {
  const query = useQuery({
    queryKey:
      versionProduitId !== null
        ? evolutionsProduitKey(versionProduitId)
        : ["evolutions-produit-disabled"],
    queryFn: () => getEvolutionsProduit(versionProduitId!),
    enabled: versionProduitId !== null,
    staleTime: 10_000,
  });

  const evolutions = query.data ?? EMPTY_EVOLUTIONS;

  return {
    evolutions,
    features: evolutions.map(toFeatureItem),
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

// ---------------------------------------------------------------------------
// useEvolutionProduitCreate
// ---------------------------------------------------------------------------

export interface UseEvolutionProduitCreateReturn {
  addEvolution: (
    payload: CreateEvolutionProduitPayload,
    callbacks?: {
      onSuccess?: (created: EvolutionProduit) => void;
      onError?: () => void;
    }
  ) => void;
  isAdding: boolean;
}

/**
 * Crée une EvolutionProduit via POST /api/evolutions-produit/.
 * Invalide le cache de la version concernée après succès.
 */
export function useEvolutionProduitCreate(): UseEvolutionProduitCreateReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateEvolutionProduitPayload) =>
      createEvolutionProduit(payload),
    onSuccess: (created) => {
      queryClient.invalidateQueries({
        queryKey: evolutionsProduitKey(created.version_produit),
      });
    },
    onError: () => {
      toast.error("Erreur lors de la création de l'évolution");
    },
  });

  const addEvolution: UseEvolutionProduitCreateReturn["addEvolution"] = (
    payload,
    callbacks
  ) => {
    mutation.mutate(payload, {
      onSuccess: (created) => {
        toast.success("Évolution ajoutée");
        callbacks?.onSuccess?.(created);
      },
      onError: () => {
        callbacks?.onError?.();
      },
    });
  };

  return {
    addEvolution,
    isAdding: mutation.isPending,
  };
}

// ---------------------------------------------------------------------------
// useEvolutionProduitArchive
// ---------------------------------------------------------------------------

export interface UseEvolutionProduitArchiveReturn {
  archiveEvolution: (id: number, versionProduitId: number) => void;
  isArchiving: boolean;
}

/**
 * Archive une EvolutionProduit via PATCH /api/evolutions-produit/{id}/archive/.
 * DELETE retourne 405 (ArchivableModelViewSet).
 */
export function useEvolutionProduitArchive(): UseEvolutionProduitArchiveReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id }: { id: number; versionProduitId: number }) =>
      archiveEvolutionProduit(id),
    onSuccess: (_, { versionProduitId }) => {
      queryClient.invalidateQueries({
        queryKey: evolutionsProduitKey(versionProduitId),
      });
      toast.success("Évolution archivée");
    },
    onError: () => {
      toast.error("Erreur lors de l'archivage de l'évolution");
    },
  });

  const archiveEvolution = (id: number, versionProduitId: number) => {
    mutation.mutate({ id, versionProduitId });
  };

  return {
    archiveEvolution,
    isArchiving: mutation.isPending,
  };
}

// ---------------------------------------------------------------------------
// useEvolutionProduitReorder
// ---------------------------------------------------------------------------

export interface UseEvolutionProduitReorderReturn {
  reorderEvolutions: (
    payload: ReorderEvolutionsProduitPayload,
    versionProduitId: number
  ) => void;
  isReordering: boolean;
}

/**
 * Réordonne les EvolutionProduit via PATCH /api/evolutions-produit/reorder/.
 * Le service backend garantit l'atomicité et valide que tous les IDs existent.
 */
export function useEvolutionProduitReorder(): UseEvolutionProduitReorderReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      payload,
    }: {
      payload: ReorderEvolutionsProduitPayload;
      versionProduitId: number;
    }) => reorderEvolutionsProduit(payload),
    onSuccess: (_, { versionProduitId }) => {
      queryClient.invalidateQueries({
        queryKey: evolutionsProduitKey(versionProduitId),
      });
    },
    onError: () => {
      toast.error("Erreur lors du réordonnancement");
    },
  });

  const reorderEvolutions = (
    payload: ReorderEvolutionsProduitPayload,
    versionProduitId: number
  ) => {
    mutation.mutate({ payload, versionProduitId });
  };

  return {
    reorderEvolutions,
    isReordering: mutation.isPending,
  };
}
