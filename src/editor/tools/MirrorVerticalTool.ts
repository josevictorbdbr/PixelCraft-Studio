import type { Tool, ToolContext } from "./Tool";
import { mirrorVertical, regionOrWhole } from "./geometry";

/** Acao instantanea no clique - espelha a selecao ativa, ou a textura inteira. */
export class MirrorVerticalTool implements Tool {
  id = "mirror-v";

  onPointerDown(_x: number, _y: number, ctx: ToolContext): void {
    mirrorVertical(ctx.canvas, regionOrWhole(ctx.canvas, ctx.selection));
  }

  onPointerMove(): void {}
  onPointerUp(): void {}
}
