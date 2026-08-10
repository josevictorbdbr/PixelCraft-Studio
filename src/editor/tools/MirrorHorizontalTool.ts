import type { Tool, ToolContext } from "./Tool";
import { mirrorHorizontal, regionOrWhole } from "./geometry";

/** Acao instantanea no clique - espelha a selecao ativa, ou a textura inteira. */
export class MirrorHorizontalTool implements Tool {
  id = "mirror-h";

  onPointerDown(_x: number, _y: number, ctx: ToolContext): void {
    mirrorHorizontal(ctx.canvas, regionOrWhole(ctx.canvas, ctx.selection));
  }

  onPointerMove(): void {}
  onPointerUp(): void {}
}
