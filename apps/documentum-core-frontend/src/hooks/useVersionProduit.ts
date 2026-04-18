/**
 * useVersionProduit — hooks dédiés à la gestion des VersionProduit.
 *
 * Implémente les endpoints définis dans 10_BACKEND_CANONIQUE.md § 9.1 :
 * - GET  /api/versions-produit/?produit={id}
 * - POST /api/versions-produit/
 * - POST /api/versions-produit/{id}/publier/
 *
 * Règles respectées :
 * - Fallback tableau via constante module-level (interdit ?? [])
 *   cf. gov_forbidden-patterns.md § 4.3
 * - Aucun appel API direct — tout via apiClient (versionsProduit.ts)
 * - Aucune logique métier dans les composants — tout ici
 *
 * Ref: PRODUCTDOCSYNC_ROADMAP.md — Phase 2.2, 2.3, 2.4
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getVersionsProduit,
  createVersionProduit,
  publierVersionProduit,
  type VersionProduit,
  type CreateVersionProduitPayload,
} from "@/api/versionsProduit";

// Clé cache partagée entre tous les hooks VersionProduit.
// Inclut le produitId pour segmenter les données par produit.
const versionsProduitKey = (produitId: number) =>
  ["versions-produit", produitId] as const;

// Constante module-level — référence stable pour éviter les boucles de rendu.
// Voir gov_forbidden-patterns.md § 4.3 : interdit d'utiliser ?? [] comme fallback direct.
const EMPTY_VERSIONS: VersionProduit[] = [];

// ---------------------------------------------------------------------------
// useVersionProduitList
// ---------------------------------------------------------------------------

export interface UseVersionProduitListReturn {
  versions: VersionProduit[];
  isLoading: boolean;
  isError: boolean;
}

/**
 * Charge les VersionProduit d'un produit depuis GET /api/versions-produit/?produit={id}.
 * La query est désactivée si produitId est null.
 * Les versions archivées sont exclues par défaut (comportement backend).
 */
export function useVersionProduitList(
  produitId: number | null
): UseVersionProduitListReturn {
  const query = useQuery({
    queryKey: produitId !== null ? versionsProduitKey(produitId) : ["versions-produit-disabled"],
    queryFn: () => getVersionsProduit(produitId!),
    enabled: produitId !== null,
    staleTime: 10_000,
  });

  return {
    versions: query.data ?? EMPTY_VERSIONS,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

// ---------------------------------------------------------------------------
// useVersionProduitCreate
// ---------------------------------------------------------------------------

export interface UseVersionProduitCreateReturn {
  createVersion: (
    payload: CreateVersionProduitPayload,
    callbacks?: {
      onSuccess?: (created: VersionProduit) => void;
      onError?: () => void;
    }
  ) => void;
  isCreating: boolean;
}

/**
 * Crée une VersionProduit via POST /api/versions-produit/.
 * Invalide le cache du produit concerné après succès.
 */
export function useVersionProduitCreate(): UseVersionProduitCreateReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateVersionProduitPayload) =>
      createVersionProduit(payload),
    onSuccess: (created) => {
      queryClient.invalidateQueries({
        queryKey: versionsProduitKey(created.produit),
      });
    },
    onError: () => {
      toast.error("Erreur lors de la création de la version");
    },
  });

  const createVersion: UseVersionProduitCreateReturn["createVersion"] = (
    payload,
    callbacks
  ) => {
    mutation.mutate(payload, {
      onSuccess: (created) => {
        toast.success(`Version ${created.numero} créée`);
        callbacks?.onSuccess?.(created);
      },
      onError: () => {
        callbacks?.onError?.();
      },
    });
  };

  return {
    createVersion,
    isCreating: mutation.isPending,
  };
}

// ---------------------------------------------------------------------------
// useVersionProduitPublier
// ---------------------------------------------------------------------------

export interface UseVersionProduitPublierReturn {
  publierVersion: (
    id: number,
    produitId: number,
    callbacks?: {
      onSuccess?: (published: VersionProduit) => void;
      onError?: () => void;
    }
  ) => void;
  isPublishing: boolean;
}

/**
 * Publie une VersionProduit via POST /api/versions-produit/{id}/publier/.
 * La publication est irréversible côté backend.
 * Invalide le cache du produit concerné après succès.
 */
export function useVersionProduitPublier(): UseVersionProduitPublierReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: number) => publierVersionProduit(id),
    onError: () => {
      toast.error("Erreur lors de la publication de la version");
    },
  });

  const publierVersion: UseVersionProduitPublierReturn["publierVersion"] = (
    id,
    produitId,
    callbacks
  ) => {
    mutation.mutate(id, {
      onSuccess: (published) => {
        queryClient.invalidateQueries({
          queryKey: versionsProduitKey(produitId),
        });
        toast.success(`Version ${published.numero} publiée`);
        callbacks?.onSuccess?.(published);
      },
      onError: () => {
        callbacks?.onError?.();
      },
    });
  };

  return {
    publierVersion,
    isPublishing: mutation.isPending,
  };
}
