import { create } from "zustand";
import type { ProjectManifest } from "../types/project";

interface ProjectState {
  activeProject: ProjectManifest | null;
  setActiveProject: (project: ProjectManifest) => void;
  clearActiveProject: () => void;
}

/** Projeto atualmente aberto */
export const useProjectStore = create<ProjectState>((set) => ({
  activeProject: null,
  setActiveProject: (project) => set({ activeProject: project }),
  clearActiveProject: () => set({ activeProject: null }),
}));
