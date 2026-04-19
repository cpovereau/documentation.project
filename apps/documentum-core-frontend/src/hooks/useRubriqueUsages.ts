/**
 * useRubriqueUsages — charge les Maps qui contiennent une Rubrique donnée.
 *
 * Endpoint : GET /api/rubriques/{id}/usages/
 * Ref : 10_BACKEND_CANONIQUE.md § 5.3
 */

import { useQuery } from "@tanstack/react-query";
import { getRubriqueUsages, type RubriqueUsage } from "@/api/rubriques";

const EMPTY_USAGES: RubriqueUsage[] = [];

export interface UseRubriqueUsagesReturn {
  usages: RubriqueUsage[];
  isLoading: boolean;
}

/**
 * Charge les usages d'une rubrique (dans quelles Maps elle est utilisée).
 * Query désactivée si rubriqueId est null.
 * staleTime 30s : les usages changent rarement en cours de session.
 */
export function useRubriqueUsages(
  rubriqueId: number | null
): UseRubriqueUsagesReturn {
  const query = useQuery({
    queryKey:
      rubriqueId !== null
        ? ["rubrique-usages", rubriqueId]
        : ["rubrique-usages-disabled"],
    queryFn: () => getRubriqueUsages(rubriqueId!),
    enabled: rubriqueId !== null,
    staleTime: 30_000,
  });

  return {
    usages: query.data ?? EMPTY_USAGES,
    isLoading: query.isLoading,
  };
}
