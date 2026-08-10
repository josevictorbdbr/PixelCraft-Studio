import { create } from "zustand";
import type { TextureSummary } from "../types/texture";

const MIN_ZOOM = 100;
const MAX_ZOOM = 6400;
const ZOOM_STEP = 100; 
const TARGET_DISPLAY_PX = 512; 

/* Zoom padrao ao abrir uma textura*/
export function computeDefaultZoom(width: number, height: number): number {
  const largestDimension = Math.max(width, height);
  const rawZoom = Math.floor(TARGET_DISPLAY_PX / largestDimension) * 100;
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, rawZoom || MIN_ZOOM));
}

interface EditorState {
  activeTexture: TextureSummary | null;
  activeTool: string;
  activeColor: string;
  activeAlpha: number;
  zoom: number;
  showGrid: boolean;

  /** Abre uma textura no editor, resetando o estado da sessao anterior. */
  openTexture: (texture: TextureSummary) => void;
  /** Troca a textura ativa SEM resetar ferramenta/grid - usado pelo salvar como" */
  setActiveTexture: (texture: TextureSummary) => void;
  clearActiveTexture: () => void;
  setActiveTool: (toolId: string) => void;
  setActiveColor: (color: string) => void;
  setActiveAlpha: (alpha: number) => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  toggleGrid: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  activeTexture: null,
  activeTool: "pencil",
  activeColor: "#ffffff",
  activeAlpha: 255,
  zoom: 3200,
  showGrid: false,

  openTexture: (texture) =>
    set({
      activeTexture: texture,
      activeTool: "pencil",
      showGrid: false,
    }),
  setActiveTexture: (texture) => set({ activeTexture: texture }),
  clearActiveTexture: () => set({ activeTexture: null }),
  setActiveTool: (toolId) => set({ activeTool: toolId }),
  setActiveColor: (color) => set({ activeColor: color }),
  setActiveAlpha: (alpha) => set({ activeAlpha: alpha }),
  setZoom: (zoom) => set({ zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom)) }),
  zoomIn: () => set((s) => ({ zoom: Math.min(MAX_ZOOM, s.zoom + ZOOM_STEP) })),
  zoomOut: () => set((s) => ({ zoom: Math.max(MIN_ZOOM, s.zoom - ZOOM_STEP) })),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
}));
