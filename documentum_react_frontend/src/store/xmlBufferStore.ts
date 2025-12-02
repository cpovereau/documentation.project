// src/store/xmlBufferStore.ts
import { create } from "zustand";

export type BufferStatus = "saved" | "dirty" | "error";

interface XmlEntry {
  xml: string;
  status: BufferStatus;
}

interface XmlBufferState {
  buffer: Record<number, XmlEntry>; // mapItemId -> { xml, status }
  setXml: (id: number, xml: string) => void;
  setStatus: (id: number, status: BufferStatus) => void;
  getXml: (id: number) => string | null;
  getStatus: (id: number) => BufferStatus | null;
  clear: () => void;
}

const useXmlBufferStore = create<XmlBufferState>((set, get) => ({
  buffer: {},

  setXml: (id, xml) =>
    set((state) => ({
      buffer: {
        ...state.buffer,
        [id]: {
          xml,
          status: state.buffer[id]?.status ?? "dirty", // par défaut : non sauvegardé
        },
      },
    })),

  setStatus: (id, status) =>
    set((state) => ({
      buffer: {
        ...state.buffer,
        [id]: {
          xml: state.buffer[id]?.xml ?? "",
          status,
        },
      },
    })),

  getXml: (id) => {
    const entry = get().buffer[id];
    return entry?.xml ?? null;
  },

  getStatus: (id) => {
    const entry = get().buffer[id];
    return entry?.status ?? null;
  },

  clear: () => set({ buffer: {} }),
}));

export default useXmlBufferStore;
