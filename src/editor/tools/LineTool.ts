import type { Tool, ToolContext } from "./Tool";
import { drawLine } from "./geometry";

export class LineTool implements Tool {
  id = "line";
  private start: { x: number; y: number } | null = null;
  private before: ImageData | null = null;

  onPointerDown(x: number, y: number, ctx: ToolContext): void {
    this.start = { x, y };
    this.before = ctx.canvas.snapshot();
    drawLine(ctx.canvas, x, y, x, y, ctx.color);
  }

  onPointerMove(x: number, y: number, ctx: ToolContext): void {
    if (!this.start || !this.before) return;
    ctx.canvas.restore(this.before);
    drawLine(ctx.canvas, this.start.x, this.start.y, x, y, ctx.color);
  }

  onPointerUp(x: number, y: number, ctx: ToolContext): void {
    if (!this.start || !this.before) return;
    ctx.canvas.restore(this.before);
    drawLine(ctx.canvas, this.start.x, this.start.y, x, y, ctx.color);
    this.start = null;
    this.before = null;
  }
}
