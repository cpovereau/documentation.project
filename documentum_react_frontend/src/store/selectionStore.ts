// src/store/selectionStore.ts
//
// Source de vérité unique pour la sélection courante dans la Map documentaire.
// Consommé par : LeftSidebar (écriture), Desktop (lecture), CentralEditor (lecture via prop).

import { create } from "zustand";

interface SelectionState {
  /** ID du MapRubrique sélectionné (= clé d'affichage dans MapModule) */
  selectedMapItemId: number | null;
  /** ID de la Rubrique métier associée (= clé pour le buffer XML et l'éditeur) */
  selectedRubriqueId: number | null;
  /** Sélectionner un item : les deux IDs sont fournis ensemble pour rester cohérents */
  setSelection: (payload: { mapItemId: number; rubriqueId: number | null }) => void;
  /** Réinitialiser la sélection (changement de projet, de map, suppression) */
  clearSelection: () => void;
}

const useSelectionStore = create<SelectionState>((set) => ({
  selectedMapItemId: null,
  selectedRubriqueId: null,

  setSelection: ({ mapItemId, rubriqueId }) =>
    set({ selectedMapItemId: mapItemId, selectedRubriqueId: rubriqueId }),

  clearSelection: () =>
    set({ selectedMapItemId: null, selectedRubriqueId: null }),
}));

export default useSelectionStore;
