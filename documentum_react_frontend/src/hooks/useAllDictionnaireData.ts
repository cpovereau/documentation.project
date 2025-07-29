import { useGammes } from "@/hooks/useGammes";
import { useProduits } from "@/hooks/useProduits";
import { useFonctionnalites } from "@/hooks/useFonctionnalites";
import { useTags } from "@/hooks/useTags";
import { useAudiences } from "@/hooks/useAudiences";

export function useAllDictionnaireData() {
  const gammes = useGammes();
  const produits = useProduits();
  const fonctionnalites = useFonctionnalites();
  const tags = useTags();
  const audiences = useAudiences();

  return {
    data: {
      gammes: gammes.data,
      produits: produits.data,
      fonctionnalites: fonctionnalites.data,
      tags: tags.data,
      audiences: audiences.data,
    },
    refetch: async () => {
      await Promise.all([
        gammes.refetch(),
        produits.refetch(),
        fonctionnalites.refetch(),
        tags.refetch(),
        audiences.refetch(),
      ]);
    },
  };
}
