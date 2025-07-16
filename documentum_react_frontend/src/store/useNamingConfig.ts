import { create } from "zustand";

export type NamingFormat = string; // libre, y compris "custom"

type NamingConfig = {
  version: NamingFormat;
  setVersion: (format: NamingFormat) => void;
};

export const useNamingConfig = create<NamingConfig>((set) => ({
  version: "", // Par défaut : aucune règle
  setVersion: (format) => set({ version: format }),
}));
