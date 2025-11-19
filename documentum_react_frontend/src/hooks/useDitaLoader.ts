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


import { useEffect } from "react";
import { Editor } from "@tiptap/react";
import useXmlBufferStore from "@/store/xmlBufferStore";
import { parseXmlToTiptap } from "@/utils/xmlToTiptap";

interface UseDitaLoaderProps {
  editor: Editor | null;
  selectedMapItemId: number | null | undefined;
}

export function useDitaLoader({ editor, selectedMapItemId }: UseDitaLoaderProps) {
  const getRubriqueState = useXmlBufferStore((s) => s.getRubriqueState);

  useEffect(() => {
    if (!editor || selectedMapItemId == null) return;

    const rubrique = getRubriqueState(selectedMapItemId);

    if (!rubrique) {
      console.warn(`[useDitaLoader] Aucune rubrique trouvée dans le buffer pour l'ID ${selectedMapItemId}`);
      return;
    }

    const { xml, status } = rubrique;

    if (!xml.trim()) {
      console.warn(`[useDitaLoader] XML vide pour la rubrique ID ${selectedMapItemId}`);
      return;
    }

    if (status === "dirty") {
      console.warn(`[useDitaLoader] Rubrique ID ${selectedMapItemId} modifiée (dirty), injection annulée`);
      return;
    }

    console.log(`[useDitaLoader] Injection de la rubrique ID ${selectedMapItemId} (status: ${status})`);

    try {
      const content = parseXmlToTiptap(xml);
      editor.commands.setContent(content, { emitUpdate: false });
    } catch (e) {
      console.error(`[useDitaLoader] Erreur lors de l'analyse XML rubrique ${selectedMapItemId} :`, e);
    }
  }, [editor, selectedMapItemId, getRubriqueState]);
}