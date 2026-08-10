import type { Tool, ToolContext } from "./Tool";
import { regionOrWhole, rotateRegion90 } from "./geometry";

/**
 * Acao instantanea no clique - gira 90 graus (sentido horario) a selecao
 * ativa (se for quadrada) ou a textura inteira. Regiao retangular
 * (nao-quadrada) e ignorada silenciosamente - rotacionar mudaria a forma
 * da regiao, o que nao cabe no mesmo espaco sem redimensionar.
 */
export class RotateTool implements Tool {
  id = "rotate";

  onPointerDown(_x: number, _y: number, ctx: ToolContext): void {
    rotateRegion90(ctx.canvas, regionOrWhole(ctx.canvas, ctx.selection));
  }

  onPointerMove(): void {}
  onPointerUp(): void {}
}
