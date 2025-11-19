// src/store/xmlBufferStore.ts
import { create } from 'zustand';

interface XmlBufferState {
  buffer: Record<number, string>; // mapItemId -> contenu XML
  setXml: (id: number, xml: string) => void;
  getXml: (id: number) => string | undefined;
  clear: () => void;
}

const useXmlBufferStore = create<XmlBufferState>((set, get) => ({
  buffer: {},

  setXml: (id, xml) =>
    set((state) => ({
      buffer: {
        ...state.buffer,
        [id]: xml,
      },
    })),

  getXml: (id) => {
    const xml = get().buffer[id];
    return xml ?? null;
  },

  clear: () => set({ buffer: {} }),
}));

export default useXmlBufferStore;