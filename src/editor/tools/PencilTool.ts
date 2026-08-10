import type { Tool, ToolContext } from "./Tool";

export class PencilTool implements Tool {
  id = "pencil";

  onPointerDown(x: number, y: number, ctx: ToolContext): void {
    ctx.canvas.setPixel(x, y, ctx.color);
  }

  onPointerMove(x: number, y: number, ctx: ToolContext): void {
    ctx.canvas.setPixel(x, y, ctx.color);
  }

  onPointerUp(): void {
    // O snapshot para o undo/redo e feito pelo PixelEditorEngine, que
    // sabe o momento exato do pointerDown/pointerUp do traco inteiro.
  }
}
