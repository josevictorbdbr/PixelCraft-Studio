/** Converte "#rrggbb" numa tupla RGBA, com alpha opcional (0-255, padrao 255 = opaco). */
export function hexToRgba(hex: string, alpha = 255): [number, number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b, alpha];
}

/** Converte uma tupla RGBA em "#rrggbb" (ignora o alpha - usado pelo conta-gotas). */
export function rgbaToHex([r, g, b]: [number, number, number, number]): string {
  return rgbToHex(r, g, b);
}

/** Converte 3 componentes RGB (0-255) em "#rrggbb". */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** HSV (h: 0-360, s/v: 0-100) -> RGB (0-255 cada). */
export function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const sNorm = s / 100;
  const vNorm = v / 100;
  const c = vNorm * sNorm;
  const hh = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hh < 1) [r, g, b] = [c, x, 0];
  else if (hh < 2) [r, g, b] = [x, c, 0];
  else if (hh < 3) [r, g, b] = [0, c, x];
  else if (hh < 4) [r, g, b] = [0, x, c];
  else if (hh < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = vNorm - c;
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

/** RGB (0-255 cada) -> HSV (h: 0-360, s/v: 0-100). */
export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;
  const max = Math.max(rN, gN, bN);
  const min = Math.min(rN, gN, bN);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rN) h = 60 * (((gN - bN) / delta) % 6);
    else if (max === gN) h = 60 * ((bN - rN) / delta + 2);
    else h = 60 * ((rN - gN) / delta + 4);
  }
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : (delta / max) * 100;
  const v = max * 100;
  return [h, s, v];
}
