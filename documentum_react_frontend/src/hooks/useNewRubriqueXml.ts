// src/hooks/useNewRubriqueXml.ts
//
// Extrait la génération du XML initial d'une nouvelle rubrique hors de LeftSidebar.
// Raison : LeftSidebar est un composant de structure — la logique de contenu
// (template DITA, produit, projet) ne lui appartient pas.
//
// Usage :
//   const generateRubriqueXml = useNewRubriqueXml();
//   const xml = await generateRubriqueXml("Nouvelle rubrique");

import { prepareNewRubriqueXml } from "@/api/rubriqueTemplates";
import useSelectedProduct from "@/hooks/useSelectedProduct";
import useSelectedVersion from "@/hooks/useSelectedVersion";

export function useNewRubriqueXml() {
  const { selectedProduct } = useSelectedProduct();
  const { selectedProjectId } = useSelectedVersion();

  return async function generateXml(titre: string): Promise<string> {
    return prepareNewRubriqueXml({
      titre,
      projetId: selectedProjectId ?? undefined,
      type_dita: "topic",
      produitLabelOrAbbrev: selectedProduct?.abreviation ?? null,
    });
  };
}
