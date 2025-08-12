import { create } from "zustand";

// Contexte d'import disponible
export type ImportContext = "fonctionnalites" | "media" | "xml";

// Structure des paramètres d'ouverture
export interface ImportModalParams {
  context: ImportContext;
  produits: { id: number; nom: string }[];
  fonctionnalites?: any[];
  interfaces?: any[];
  title?: string;
  onConfirm: (params: any) => void;
  onClose?: () => void;
}

// Structure du store Zustand
interface ImportModalState extends ImportModalParams {
  open: boolean;
  title?: string;
  openImportModal: (params: ImportModalParams) => void;
  closeImportModal: () => void;
}

export const useImportModal = create<ImportModalState>((set) => ({
  open: false,
  context: "fonctionnalites",
  produits: [],
  onConfirm: () => {},
  onClose: undefined,
  openImportModal: (params) => set({ open: true, ...params }),
  closeImportModal: () => set({ open: false }),
}));
