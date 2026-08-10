import { create } from "zustand";

/** Telas do fluxo linear definido no doc de UI/UX */
export type Screen = "home" | "main" | "editor";

interface UIState {
  activeScreen: Screen;
  goTo: (screen: Screen) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeScreen: "home",
  goTo: (screen) => set({ activeScreen: screen }),
}));
