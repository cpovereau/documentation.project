/**
 * useFonctionnaliteList — hook dédié à l'écran ProductDocSync.
 *
 * Responsabilités :
 * - Charger les fonctionnalités depuis GET /api/fonctionnalites/?archived=false
 * - Filtrer côté frontend par produitId (pas de filtre ?produit= côté backend)
 * - Mapper vers FeatureItem (format UI, mono-niveau)
 * - Exposer les mutations add (POST) et archive (PATCH …/archive/)
 *
 * TODO(Phase 2): remplacer le filtrage frontend par ?produit={id} une fois le filtre
 * implémenté côté backend.
 * Ref: docs/01_OPERATIONNEL/ProductDocSync/PRODUCTDOCSYNC_ROADMAP.md — Phase 1
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getFonctionnalites,
  createFonctionnalite,
  archiveFonctionnalite,
  type Fonctionnalite,
  type CreateFonctionnalitePayload,
} from "@/api/fonctionnalites";
import type { FeatureItem } from "@/types/FeatureItem";

// Clé partagée avec useFonctionnalites (DataTab) pour mutualiser le cache React Query.
const QUERY_KEY = ["fonctionnalites"] as const;

/** Mappe une Fonctionnalite backend vers un FeatureItem UI. */
function toFeatureItem(f: Fonctionnalite): FeatureItem {
  return {
    id: f.id,
    name: f.nom,
    level: 1, // mono-niveau — cadrage 2026-04-16
    expanded: true,
    // hasUpdate / hasEvolution / hasCorrectif : non disponibles en backend pour l'instant.
    // TODO(Phase 3): alimenter depuis ImpactDocumentaire une fois implémenté.
  };
}

export interface UseFonctionnaliteListReturn {
  /** Fonctionnalités filtrées et mappées pour l'UI. */
  features: FeatureItem[];
  isLoading: boolean;
  isError: boolean;
  /** Ajoute une fonctionnalité via POST. Retourne la nouvelle entité en onSuccess. */
  addFeature: (
    params: { nom: string; produitId: number },
    callbacks?: {
      onSuccess?: (created: FeatureItem) => void;
      onError?: () => void;
    }
  ) => void;
  /** Archive une fonctionnalité (PATCH …/archive/) — DELETE retourne 405. */
  archiveFeature: (id: number) => void;
  isAdding: boolean;
  isArchiving: boolean;
}

// ---------------------------------------------------------------------------
// Utilitaires de génération automatique de code / id_fonctionnalite
// ---------------------------------------------------------------------------

/**
 * Génère un code produit court (≤ 5 chars) depuis le nom.
 * Un suffixe timestamp évite les collisions courantes.
 * TODO(Phase 2): calculer côté backend
 */
function generateCode(nom: string): string {
  const clean = nom
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 3)
    .padEnd(3, "X");
  const suffix = String(Date.now()).slice(-2);
  return (clean + suffix).slice(0, 5);
}

/**
 * Génère un id_fonctionnalite unique de 8 chiffres (contrainte backend : unique=True).
 * TODO(Phase 2): déléguer au backend ou définir un format métier avec l'équipe.
 */
function generateIdFonctionnalite(): string {
  return String(Date.now()).slice(-8);
}

// ---------------------------------------------------------------------------
// Hook principal
// ---------------------------------------------------------------------------

export function useFonctionnaliteList(
  produitId: number | null
): UseFonctionnaliteListReturn {
  const queryClient = useQueryClient();

  // ── Chargement ──────────────────────────────────────────────────────────
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: getFonctionnalites,
    staleTime: 10_000,
  });

  // ── Filtrage côté frontend par produit ──────────────────────────────────
  const features: FeatureItem[] = (query.data ?? [])
    .filter((f) => produitId === null || f.produit === produitId)
    .map(toFeatureItem);

  // ── Mutation : ajout ─────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: (payload: CreateFonctionnalitePayload) =>
      createFonctionnalite(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout de la fonctionnalité");
    },
  });

  // ── Mutation : archivage ─────────────────────────────────────────────────
  const archiveMutation = useMutation({
    mutationFn: archiveFonctionnalite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Fonctionnalité archivée");
    },
    onError: () => {
      toast.error("Erreur lors de l'archivage de la fonctionnalité");
    },
  });

  // ── API exposée ──────────────────────────────────────────────────────────

  const addFeature: UseFonctionnaliteListReturn["addFeature"] = (
    { nom, produitId: targetProduitId },
    callbacks
  ) => {
    const payload: CreateFonctionnalitePayload = {
      produit: targetProduitId,
      nom,
      code: generateCode(nom),
      id_fonctionnalite: generateIdFonctionnalite(),
    };
    addMutation.mutate(payload, {
      onSuccess: (created) => {
        toast.success(`Fonctionnalité « ${created.nom} » ajoutée`);
        callbacks?.onSuccess?.(toFeatureItem(created));
      },
      onError: () => {
        callbacks?.onError?.();
      },
    });
  };

  const archiveFeature = (id: number) => {
    archiveMutation.mutate(id);
  };

  return {
    features,
    isLoading: query.isLoading,
    isError: query.isError,
    addFeature,
    archiveFeature,
    isAdding: addMutation.isPending,
    isArchiving: archiveMutation.isPending,
  };
}
