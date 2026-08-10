import type { Tool, ToolContext } from "./Tool";

export class EyedropperTool implements Tool {
  id = "eyedropper";

  onPointerDown(x: number, y: number, ctx: ToolContext): void {
    const picked = ctx.canvas.getPixel(x, y);
    ctx.onColorPicked?.(picked);
  }

  onPointerMove(): void {
    // So amostra no clique - sem "arrastar para pipetar continuamente".
  }

  onPointerUp(): void {}
}
