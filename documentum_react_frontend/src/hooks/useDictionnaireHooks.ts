// 📁 src/hooks/useDictionnaireHooks.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/apiClient";
import {
  Gamme,
  Produit,
  Fonctionnalite,
  InterfaceUtilisateur,
  Tag,
  Audience,
} from "@/types/dictionnaires";

// --- Gammes ---
export function useGammes() {
  return useQuery<Gamme[]>({
    queryKey: ["gammes"],
    queryFn: async () => {
      const response = await api.get("/api/gammes/?archived=false");
      return response.data;
    },
  });
}

// --- Produits ---
export function useProduits() {
  return useQuery<Produit[]>({
    queryKey: ["produits"],
    queryFn: async () => {
      const response = await api.get("/api/produits/?archived=false");
      return response.data;
    },
  });
}

// --- Fonctionnalités ---
export function useFonctionnalites() {
  return useQuery<Fonctionnalite[]>({
    queryKey: ["fonctionnalites"],
    queryFn: async () => {
      const response = await api.get("/api/fonctionnalites/?archived=false");
      return response.data;
    },
  });
}

// --- Interfaces utilisateur ---
export function useInterfaces() {
  return useQuery<InterfaceUtilisateur[]>({
    queryKey: ["interfaces"],
    queryFn: async () => {
      const response = await api.get("/api/interfaces/?archived=false");
      return response.data;
    },
  });
}

// --- Tags ---
export function useTags() {
  return useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await api.get("/api/tags/?archived=false");
      return response.data;
    },
  });
}

// --- Audiences ---
export function useAudiences() {
  return useQuery<Audience[]>({
    queryKey: ["audiences"],
    queryFn: async () => {
      const response = await api.get("/api/audiences/?archived=false");
      return response.data;
    },
  });
}
