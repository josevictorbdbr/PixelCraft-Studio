import { PixelCanvas, type RGBA } from "./canvas/PixelCanvas";
import { HistoryManager } from "./history/HistoryManager";
import { SnapshotCommand } from "./history/Command";
import { ToolRegistry } from "./tools/ToolRegistry";
import type { SelectionRect, ToolContext } from "./tools/Tool";

const TRANSPARENT: RGBA = [0, 0, 0, 0];

function imageDataEquals(a: ImageData, b: ImageData): boolean {
  if (a.data.length !== b.data.length) return false;
  for (let i = 0; i < a.data.length; i++) {
    if (a.data[i] !== b.data[i]) return false;
  }
  return true;
}

/**
 * Orquestra PixelCanvas + ToolRegistry + HistoryManager (doc de
 * arquitetura, secao 6). Um traco inteiro (pointerDown -> pointerUp) vira
 * uma unica entrada no historico, nao uma por pixel.
 */
export class PixelEditorEngine {
  readonly canvas: PixelCanvas;
  readonly history = new HistoryManager();

  activeToolId = "pencil";
  activeColor: RGBA = [0, 0, 0, 255];
  isDirty = false;
  selection: SelectionRect | null = null;

  /** Reatribuido pelo componente React para redesenhar quando algo muda. */
  onChange: () => void = () => {};
  /** Reatribuido pela EditorScreen para levar a cor do conta-gotas ao store. */
  onColorPicked: (color: RGBA) => void = () => {};

  private strokeBefore: ImageData | null = null;
  private isDrawing = false;

  constructor(width: number, height: number, initial?: ImageData) {
    this.canvas = new PixelCanvas(width, height, initial);
  }

  private buildContext(): ToolContext {
    return {
      canvas: this.canvas,
      color: this.activeColor,
      selection: this.selection,
      onColorPicked: (color) => this.onColorPicked(color),
      onSelectionChange: (rect) => {
        this.selection = rect;
        this.onChange();
      },
    };
  }

  /** Compara com o estado anterior e so empilha historico se algo mudou de verdade. */
  private commitIfChanged(before: ImageData): void {
    const after = this.canvas.snapshot();
    if (!imageDataEquals(before, after)) {
      this.history.push(
        new SnapshotCommand((data) => this.canvas.restore(data), before, after, () => this.onChange()),
      );
      this.isDirty = true;
    }
  }

  setActiveTool(id: string): void {
    this.activeToolId = id;
    if (id !== "selection" && this.selection) {
      this.selection = null;
      this.onChange();
    }
  }

  setActiveColor(color: RGBA): void {
    this.activeColor = color;
  }

  pointerDown(x: number, y: number): void {
    const tool = ToolRegistry.get(this.activeToolId);
    if (!tool) return;
    this.isDrawing = true;
    this.strokeBefore = this.canvas.snapshot();
    tool.onPointerDown(x, y, this.buildContext());
    this.onChange();
  }

  pointerMove(x: number, y: number): void {
    if (!this.isDrawing) return;
    const tool = ToolRegistry.get(this.activeToolId);
    if (!tool) return;
    tool.onPointerMove(x, y, this.buildContext());
    this.onChange();
  }

  pointerUp(x: number, y: number): void {
    if (!this.isDrawing) return;
    const tool = ToolRegistry.get(this.activeToolId);
    tool?.onPointerUp(x, y, this.buildContext());
    this.isDrawing = false;

    const before = this.strokeBefore;
    this.strokeBefore = null;
    if (!before) return;
    this.commitIfChanged(before);
  }

  /** Apaga (transparente) os pixels dentro da selecao ativa, se houver. */
  clearSelectionRect(): void {
    if (!this.selection) return;
    const before = this.canvas.snapshot();
    const { x0, y0, x1, y1 } = this.selection;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        this.canvas.setPixel(x, y, TRANSPARENT);
      }
    }
    this.commitIfChanged(before);
    this.onChange();
  }

  undo(): void {
    if (!this.history.canUndo) return;
    this.history.undo();
    this.isDirty = true;
  }

  redo(): void {
    if (!this.history.canRedo) return;
    this.history.redo();
    this.isDirty = true;
  }

  markSaved(): void {
    this.isDirty = false;
  }
}
