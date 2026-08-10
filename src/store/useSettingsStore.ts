import { create } from "zustand";
import { loadSettings, saveSettings } from "../services/settingsService";
import type { AppSettings, Language } from "../types/settings";

const DEFAULT_SETTINGS: AppSettings = { language: "en" };

interface SettingsState {
  settings: AppSettings;
  isSettingsOpen: boolean;
  loadInitial: () => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  openSettings: () => void;
  closeSettings: () => void;
}

/**
 * Preferencias do usuario (hoje so idioma). Carregado uma vez no boot do
 * app (App.tsx) a partir do settings.json via backend.
 */
export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isSettingsOpen: false,

  loadInitial: async () => {
    const settings = await loadSettings();
    set({ settings });
  },

  setLanguage: async (language) => {
    const updated: AppSettings = { ...get().settings, language };
    set({ settings: updated });
    await saveSettings(updated);
  },

  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
}));
