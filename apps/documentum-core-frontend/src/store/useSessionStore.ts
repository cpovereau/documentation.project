import { create } from "zustand";

interface SessionStore {
  expired: boolean;
  setExpired: (value: boolean) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  expired: false,
  setExpired: (value) => set({ expired: value }),
}));
