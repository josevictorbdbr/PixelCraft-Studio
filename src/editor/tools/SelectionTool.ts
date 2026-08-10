import type { Tool, ToolContext } from "./Tool";

function normalize(x0: number, y0: number, x1: number, y1: number) {
  return {
    x0: Math.min(x0, x1),
    y0: Math.min(y0, y1),
    x1: Math.max(x0, x1),
    y1: Math.max(y0, y1),
  };
}

/**
 * Define um retangulo de selecao arrastando o mouse. Nesta etapa a unica
 * acao sobre a selecao e limpar o conteudo (Delete/Backspace) - mover ou
 * copiar fica para uma proxima iteracao.
 */
export class SelectionTool implements Tool {
  id = "selection";
  private start: { x: number; y: number } | null = null;

  onPointerDown(x: number, y: number, ctx: ToolContext): void {
    this.start = { x, y };
    ctx.onSelectionChange?.(normalize(x, y, x, y));
  }

  onPointerMove(x: number, y: number, ctx: ToolContext): void {
    if (!this.start) return;
    ctx.onSelectionChange?.(normalize(this.start.x, this.start.y, x, y));
  }

  onPointerUp(x: number, y: number, ctx: ToolContext): void {
    if (!this.start) return;
    ctx.onSelectionChange?.(normalize(this.start.x, this.start.y, x, y));
    this.start = null;
  }
}
