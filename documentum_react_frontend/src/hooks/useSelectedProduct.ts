// src/hooks/useSelectedProduct.ts
import { useStore } from 'zustand';
import { useMemo } from 'react';
import useProductStore from '@/store/productStore'; // à créer si pas existant

export default function useSelectedProduct() {
  const selectedProductId = useProductStore((s) => s.selectedProductId);
  const produits = useProductStore((s) => s.produits);

  const selectedProduct = useMemo(() => {
    return produits.find((p) => p.id === selectedProductId) ?? null;
  }, [produits, selectedProductId]);

  return {
    selectedProduct,
    selectedProductId,
  };
}
