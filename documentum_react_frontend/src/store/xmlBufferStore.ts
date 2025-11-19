// src/store/xmlBufferStore.ts
import { create } from "zustand";

type RubriqueBufferStatus = "ready" | "dirty" | "saved" | "loading";

export type RubriqueBuffer = {
  xml: string;
  status: RubriqueBufferStatus;
};

type XmlBufferState = {
  buffer: Record<number, RubriqueBuffer>;

  setXml: (id: number, xml: string) => void;
  markDirty: (id: number) => void;
  markSaved: (id: number) => void;
  clearAll: () => void;

  getXml: (id: number) => string | null;
  getStatus: (id: number) => RubriqueBufferStatus | null;
  getRubriqueState: (id: number) => RubriqueBuffer | null;
};

const useXmlBufferStore = create<XmlBufferState>((set, get) => ({
  buffer: {},

  setXml: (id, xml) =>
    set((state) => ({
      buffer: {
        ...state.buffer,
        [id]: { xml, status: "ready" },
      },
    })),

  markDirty: (id) =>
    set((state) => {
      const entry = state.buffer[id];
      if (!entry) return state;
      return {
        buffer: {
          ...state.buffer,
          [id]: { ...entry, status: "dirty" },
        },
      };
    }),

  markSaved: (id) =>
    set((state) => {
      const entry = state.buffer[id];
      if (!entry) return state;
      return {
        buffer: {
          ...state.buffer,
          [id]: { ...entry, status: "saved" },
        },
      };
    }),

  clearAll: () => set({ buffer: {} }),

  getXml: (id) => {
    const entry = get().buffer[id];
    return entry ? entry.xml : null;
  },

  getStatus: (id) => {
    const entry = get().buffer[id];
    return entry ? entry.status : null;
  },

  /**
   * ✅ Nouvelle méthode centrale : retourne l'objet complet { xml, status }
   */
  getRubriqueState: (id) => {
    return get().buffer[id] ?? null;
  },
}));

export default useXmlBufferStore;

