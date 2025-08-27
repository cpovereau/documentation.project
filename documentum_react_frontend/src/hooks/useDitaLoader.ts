/**
 * useDitaLoader
 * --------------
 * Hook qui synchronise le contenu XML d'une rubrique sélectionnée
 * dans la carte (`mapItems`) avec le contenu affiché dans l'éditeur TipTap.
 *
 * 📥 Entrée : `selectedMapItemId` (identifiant numérique de la rubrique sélectionnée)
 * 📤 Action :
 *   - Récupère le contenu XML depuis le buffer store local (Zustand)
 *   - Parse le XML en JSON TipTap via `parseXmlToTiptap(...)`
 *   - Injecte le contenu dans l'éditeur avec `editor.commands.setContent(...)`
 *   - Si aucun XML trouvé, affiche un texte d’attente
 *
 * ⚠️ Ce hook suppose que :
 *   - Les clés du buffer sont bien des `number` (type du `mapItem.id`)
 *   - L’appel à `setXml(mapItemId, xml)` a été effectué AVANT la sélection
 *   - Le buffer Zustand est accessible et synchrone (pas de délai async)
 *
 * Utilisation :
 *   - Appelé dans `CentralEditor` à chaque changement de `selectedMapItemId`
 */


import { useEffect, useState } from "react";
import { Editor } from "@tiptap/react";
import useXmlBufferStore from "@/store/xmlBufferStore";
import { parseXmlToTiptap } from "@/utils/xmlToTiptap";

interface UseDitaLoaderProps {
  editor: Editor | null;
  selectedMapItemId: number | null;
}

/**
 * 🔄 Hook qui synchronise le contenu XML du buffer avec l’éditeur TipTap
 */
export function useDitaLoader({ editor, selectedMapItemId }: UseDitaLoaderProps) {
  const getXml = useXmlBufferStore((state) => state.getXml);
  const [isLoading, setIsLoading] = useState(false);

  console.log("🚀 useDitaLoader déclenché", {
    selectedMapItemId,
    editor,
    getXml: typeof getXml,
  });

  // ❌ Pas de return anticipé ici → on garde le hook systematiquement appelé
  const shouldLoad =
    !!editor && selectedMapItemId !== null && !isNaN(Number(selectedMapItemId));

  useEffect(() => {
    if (!shouldLoad) {
      console.log("🛑 useDitaLoader : conditions non remplies (dans useEffect)");
      return;
    }

    setIsLoading(true);

    const xml = getXml(selectedMapItemId!);
    console.log("🧾 XML récupéré depuis le buffer (via useDitaLoader) :", xml);

    if (!xml || typeof xml !== "string" || xml.trim() === "") {
      console.warn("⚠️ Aucun XML trouvé ou XML invalide pour l'ID :", selectedMapItemId);
      editor!.commands.setContent("<p>Aucun contenu disponible pour cette rubrique.</p>");
      setIsLoading(false);
      return;
    }

    try {
      const nodes = parseXmlToTiptap(xml);
      console.log("📦 Contenu injecté dans l’éditeur :", nodes);

      setTimeout(() => {
        editor!.commands.setContent({ type: "doc", content: nodes });
        setIsLoading(false);
      }, 0);
    } catch (err) {
      console.error("❌ Erreur lors du parsing XML:", err);
      editor!.commands.setContent("<p>Erreur de conversion XML</p>");
      setIsLoading(false);
    }
  }, [shouldLoad, getXml, editor, selectedMapItemId]);

  return { isLoading };
}