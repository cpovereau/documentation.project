// src/api/produits.ts
import { api } from "@/lib/apiClient";

export interface Produit {
  id: number;
  nom: string;
}

export async function getProduits(): Promise<Produit[]> {
  const response = await api.get("/produits/");
  return response.data;
}
