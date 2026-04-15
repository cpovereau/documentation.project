// 📁 src/hooks/useAllDictionnaireData.ts
import {
  useGammes,
  useProduits,
  useFonctionnalites,
  useInterfaces,
  useTags,
  useAudiences,
} from "@/hooks/useDictionnaireHooks";

export function useAllDictionnaireData() {
  const gammes = useGammes();
  const produits = useProduits();
  const fonctionnalites = useFonctionnalites();
  const interfaces = useInterfaces();
  const tags = useTags();
  const audiences = useAudiences();

  return {
    data: {
      gammes: gammes.data ?? [],
      produits: produits.data ?? [],
      fonctionnalites: fonctionnalites.data ?? [],
      interfaces: interfaces.data ?? [],
      tags: tags.data ?? [],
      audiences: audiences.data ?? [],
    },
    isLoading:
      gammes.isLoading ||
      produits.isLoading ||
      fonctionnalites.isLoading ||
      interfaces.isLoading ||
      tags.isLoading ||
      audiences.isLoading,
    refetch: async () => {
      await Promise.all([
        gammes.refetch(),
        produits.refetch(),
        fonctionnalites.refetch(),
        interfaces.refetch(),
        tags.refetch(),
        audiences.refetch(),
      ]);
    },
  };
}
