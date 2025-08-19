// hooks/useArchivableList.ts
import { useEffect, useState } from "react";
import api from "@/lib/apiClient";
import { toast } from "sonner";
import { toggleArchivableResource } from "@/lib/resources";

export interface ArchivableItem {
  id: number;
  is_archived: boolean;
  [key: string]: any;
}

/**
 * Hook générique pour gérer une liste d'éléments archivables (avec API REST DRF)
 * @param resource nom de la ressource en base (ex: "gammes", "produits")
 * @param enabled boolean pour activer ou non la requête auto
 * @param showArchived afficher les archivés ou non
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
      const res = await api.get(`/${resource}/`, {
        params: { archived: showArchived },
        withCredentials: true,
      });
      const sortedData = res.data.sort((a: any, b: any) =>
      a.nom?.localeCompare?.(b.nom, "fr", { sensitivity: "base" }) ?? 0
    );
      setItems(res.data);
    } catch (err: any) {
      console.error(`[${resource}] Erreur API :`, err);
      toast.error(err.message || `Erreur chargement ${resource}.`);
    } finally {
      setLoading(false);
    }
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
    toggleArchive,
    refetch: fetchItems,
  };
}

/**
 * Utilitaire pour centraliser tous les hooks archivables par type
 */
export function getArchivableHooks(
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
 * Labels d'affichage pour les entités archivables (utilisé dans getTitle)
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
