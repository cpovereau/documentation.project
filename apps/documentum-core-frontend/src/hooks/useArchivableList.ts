// hooks/useArchivableList.ts
import { useEffect, useState } from "react";
import api from "@/lib/apiClient";
import { toast } from "sonner";
import { toggleArchivableResource } from "@/lib/resources";
export type { ArchivableItem } from "@/types/archivable";
import type { ArchivableItem } from "@/types/archivable";

/**
 * Hook générique pour gérer une liste d'éléments archivables (avec API REST DRF)
 * @param resource nom de la ressource API (ex: "gammes", "produits", "profils-publication")
 * @param enabled booléen pour activer ou non le chargement automatique
 * @param showArchived afficher les archivés (true) ou les actifs (false)
 */
export function useArchivableList(
  resource: string,
  enabled: boolean,
  showArchived: boolean
) {
  const [items, setItems] = useState<ArchivableItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/${resource}/`, {
        params: { archived: showArchived },
        withCredentials: true,
      });
      // Tri alphabétique par nom (insensible à la casse, locale française)
      const sortedData = [...res.data].sort((a: ArchivableItem, b: ArchivableItem) =>
        a.nom?.localeCompare?.(b.nom, "fr", { sensitivity: "base" }) ?? 0
      );
      setItems(sortedData);
    } catch (err: any) {
      console.error(`[${resource}] Erreur de chargement :`, err);
      toast.error(err.message || `Erreur chargement ${resource}.`);
    } finally {
      setLoading(false);
    }
  };

  const create = async (data: Record<string, any>) => {
    await api.post(`/api/${resource}/`, data, { withCredentials: true });
    await fetchItems();
  };

  const update = async (id: number, data: Record<string, any>) => {
    await api.patch(`/api/${resource}/${id}/`, data, { withCredentials: true });
    await fetchItems();
  };

  const toggleArchive = async (id: number, isArchived: boolean) => {
    try {
      await toggleArchivableResource(resource, id, isArchived);
      await fetchItems();
      toast.success(
        `Élément ${isArchived ? "restauré" : "archivé"} avec succès.`
      );
    } catch (error) {
      console.error(`Erreur archivage ${resource}:`, error);
      toast.error("Erreur lors de l'archivage/restauration.");
    }
  };

  useEffect(() => {
    if (enabled) fetchItems();
  }, [enabled, showArchived]);

  return {
    items,
    loading,
    create,
    update,
    toggleArchive,
    refetch: fetchItems,
  };
}

/**
 * Centralise les hooks archivables pour chaque type de ressource géré dans l'onglet Données.
 * Chaque hook n'est activé que lorsque l'onglet correspondant est sélectionné.
 */
export function useArchivableHooks(
  selectedItem: string,
  showArchived: boolean
) {
  return {
    gammes: useArchivableList("gammes", selectedItem === "gammes", showArchived),
    produits: useArchivableList("produits", selectedItem === "produits", showArchived),
    fonctionnalites: useArchivableList("fonctionnalites", selectedItem === "fonctionnalites", showArchived),
    audiences: useArchivableList("audiences", selectedItem === "audiences", showArchived),
    tags: useArchivableList("tags", selectedItem === "tags", showArchived),
    profils_publication: useArchivableList("profils-publication", selectedItem === "profils_publication", showArchived),
    interface_ui: useArchivableList("interfaces", selectedItem === "interface_ui", showArchived),
  };
}

/**
 * Labels d'affichage pour les entités gérées dans l'onglet Données.
 */
export const resourceLabels: Record<string, string> = {
  gammes: "Gammes",
  produits: "Produits",
  fonctionnalites: "Fonctionnalités",
  audiences: "Audiences",
  tags: "Tags",
  profils_publication: "Profils de publication",
  interface_ui: "Interface utilisateur",
};
