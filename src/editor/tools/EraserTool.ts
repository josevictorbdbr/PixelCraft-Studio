import type { Tool, ToolContext } from "./Tool";

const TRANSPARENT: [number, number, number, number] = [0, 0, 0, 0];

export class EraserTool implements Tool {
  id = "eraser";

  onPointerDown(x: number, y: number, ctx: ToolContext): void {
    ctx.canvas.setPixel(x, y, TRANSPARENT);
  }

  onPointerMove(x: number, y: number, ctx: ToolContext): void {
    ctx.canvas.setPixel(x, y, TRANSPARENT);
  }

  onPointerUp(): void {
    // Snapshot do traco inteiro fica a cargo do PixelEditorEngine.
  }
}
