import { create } from "zustand";

// Typage minimal pour le contexte d'import
export type ImportContext = "fonctionnalites" | "media" | "xml";

interface ImportModalState {
  open: boolean;
  context: ImportContext;
  produits: { id: number; nom: string }[];
  onConfirm: (params: any) => void;
  onClose?: () => void;
  openImportModal: (
    ctx: ImportContext,
    produits: { id: number; nom: string }[],
    onConfirm: (params: any) => void,
    onClose?: () => void
  ) => void;
  closeImportModal: () => void;
}

export const useImportModal = create<ImportModalState>((set) => ({
  open: false,
  context: "fonctionnalites",
  produits: [],
  onConfirm: () => {},
  onClose: undefined,
  openImportModal: (context, produits, onConfirm, onClose) =>
    set({ open: true, context, produits, onConfirm, onClose }),
  closeImportModal: () => set({ open: false }),
}));
