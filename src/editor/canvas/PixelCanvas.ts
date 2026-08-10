export type RGBA = [number, number, number, number];

/**
 * Dona da matriz de pixels de uma textura (via ImageData nativo do
 * browser). Nao sabe nada sobre ferramentas, zoom ou desenho na tela -
 * so armazena e edita pixels.
 */
export class PixelCanvas {
  readonly width: number;
  readonly height: number;
  private imageData: ImageData;

  constructor(width: number, height: number, initial?: ImageData) {
    this.width = width;
    this.height = height;
    this.imageData = initial ?? new ImageData(width, height);
  }

  private inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  getPixel(x: number, y: number): RGBA {
    const i = (y * this.width + x) * 4;
    const d = this.imageData.data;
    return [d[i], d[i + 1], d[i + 2], d[i + 3]];
  }

  setPixel(x: number, y: number, [r, g, b, a]: RGBA): void {
    if (!this.inBounds(x, y)) return;
    const i = (y * this.width + x) * 4;
    const d = this.imageData.data;
    d[i] = r;
    d[i + 1] = g;
    d[i + 2] = b;
    d[i + 3] = a;
  }

  getImageData(): ImageData {
    return this.imageData;
  }

  /** Copia profunda do estado atual - usada pelo HistoryManager (undo/redo). */
  snapshot(): ImageData {
    return new ImageData(new Uint8ClampedArray(this.imageData.data), this.width, this.height);
  }

  /**
   * Restaura um snapshot anterior (undo/redo, ou previa de Linha/Retangulo
   * que restaura-e-redesenha a cada movimento do mouse). Sempre copia os
   * bytes em vez de guardar o mesmo objeto: senao, desenhar depois de um
   * restore() mutaria o snapshot original (que pode ainda estar guardado
   * no historico ou ser reusado em varias chamadas), corrompendo-o.
   */
  restore(snapshot: ImageData): void {
    this.imageData = new ImageData(new Uint8ClampedArray(snapshot.data), this.width, this.height);
  }
}
