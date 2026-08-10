/**
 * Gera uma cor deterministica a partir de uma string.
 * Usado so como placeholder visual enquanto nao existe imagem de textura
 * de verdade.
 */
export function placeholderColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 45%, 40%)`;
}
