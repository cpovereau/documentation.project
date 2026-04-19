// src/store/usePendingMediaStore.ts
//
// Pont découplé entre RightSidebar (source de sélection média)
// et CentralEditor (consommateur de l'insertion).
// Consommé par : RightSidebar (écriture), CentralEditor (lecture + clear).

import { create } from "zustand";
import type { MediaItem } from "@/hooks/useMedias";

interface PendingMediaState {
  pendingImage: MediaItem | null;
  setPendingImage: (item: MediaItem) => void;
  clearPendingImage: () => void;
}

const usePendingMediaStore = create<PendingMediaState>((set) => ({
  pendingImage: null,
  setPendingImage: (item) => set({ pendingImage: item }),
  clearPendingImage: () => set({ pendingImage: null }),
}));

export default usePendingMediaStore;
