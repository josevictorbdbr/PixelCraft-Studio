import type { Tool, ToolContext } from "./Tool";
import { drawRectOutline } from "./geometry";

export class RectangleTool implements Tool {
  id = "rectangle";
  private start: { x: number; y: number } | null = null;
  private before: ImageData | null = null;

  onPointerDown(x: number, y: number, ctx: ToolContext): void {
    this.start = { x, y };
    this.before = ctx.canvas.snapshot();
    drawRectOutline(ctx.canvas, x, y, x, y, ctx.color);
  }

  onPointerMove(x: number, y: number, ctx: ToolContext): void {
    if (!this.start || !this.before) return;
    ctx.canvas.restore(this.before);
    drawRectOutline(ctx.canvas, this.start.x, this.start.y, x, y, ctx.color);
  }

  onPointerUp(x: number, y: number, ctx: ToolContext): void {
    if (!this.start || !this.before) return;
    ctx.canvas.restore(this.before);
    drawRectOutline(ctx.canvas, this.start.x, this.start.y, x, y, ctx.color);
    this.start = null;
    this.before = null;
  }
}
