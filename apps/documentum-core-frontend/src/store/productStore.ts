// src/store/productStore.ts
import { create } from 'zustand';

export interface Produit {
  id: number;
  nom: string;
  abreviation: string;
  code?: string;
  [key: string]: any; // pour tolérer des champs additionnels
}

interface ProductStoreState {
  produits: Produit[];
  selectedProductId: number | null;
  setProduits: (produits: Produit[]) => void;
  setSelectedProductId: (id: number | null) => void;
  reset: () => void;
}

const useProductStore = create<ProductStoreState>((set) => ({
  produits: [],
  selectedProductId: null,
  setProduits: (produits) => set({ produits }),
  setSelectedProductId: (id) => set({ selectedProductId: id }),
  reset: () => set({ produits: [], selectedProductId: null }),
}));

export default useProductStore;