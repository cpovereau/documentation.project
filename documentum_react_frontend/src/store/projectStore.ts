// src/store/projectStore.ts
import { create } from 'zustand';

export interface Version {
  id: number;
  nom: string;
  numero: string;
  isActive: boolean;
  [key: string]: any;
}

export interface MapItem {
  id: number;
  title: string;
  level: number;
  isMaster: boolean;
  expanded: boolean;
  versionOrigine: string;
}

export interface Projet {
  id: number;
  nom: string;
  produit: number; // ou objet si nécessaire
  versionActive: Version | null;
  mapItems: MapItem[];
  [key: string]: any;
}

interface ProjectStoreState {
  projets: Projet[];
  selectedProjectId: number | null;
  setProjets: (projets: Projet[]) => void;
  setSelectedProjectId: (id: number | null) => void;
}

const useProjectStore = create<ProjectStoreState>((set) => ({
  projets: [],
  selectedProjectId: null,
  setProjets: (projets) => set({ projets }),
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
}));

export default useProjectStore;
