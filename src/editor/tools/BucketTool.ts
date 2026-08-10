import type { Tool, ToolContext } from "./Tool";
import type { RGBA, PixelCanvas } from "../canvas/PixelCanvas";

function colorsEqual(a: RGBA, b: RGBA): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

/** Preenchimento por área (4-direcional). Ate 16x16 (o comum), o custo e
 * irrelevante; mesmo no maximo hoje suportado (1024x1024 = ~1 milhao de
 * pixels no pior caso), ainda roda bem abaixo de 1 segundo. */
function floodFill(canvas: PixelCanvas, startX: number, startY: number, fillColor: RGBA): void {
  const target = canvas.getPixel(startX, startY);
  if (colorsEqual(target, fillColor)) return;

  const stack: [number, number][] = [[startX, startY]];
  const visited = new Set<number>();

  while (stack.length > 0) {
    const next = stack.pop();
    if (!next) break;
    const [x, y] = next;
    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) continue;

    const key = y * canvas.width + x;
    if (visited.has(key)) continue;
    if (!colorsEqual(canvas.getPixel(x, y), target)) continue;

    visited.add(key);
    canvas.setPixel(x, y, fillColor);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
}

export class BucketTool implements Tool {
  id = "bucket";

  onPointerDown(x: number, y: number, ctx: ToolContext): void {
    floodFill(ctx.canvas, x, y, ctx.color);
  }

  onPointerMove(): void {
    // Balde age so no clique, nao repete durante o arraste.
  }

  onPointerUp(): void {}
}
