import { PixelCanvas } from "../canvas/PixelCanvas";

/**
 * Uma camada de pixel art: id estavel (persistido no backend), nome
 * editavel, canvas de pixels proprio, visibilidade e opacidade (0-100).
 * `id` e gerado uma vez e reaproveitado nos saves seguintes - e assim
 * que o backend sabe qual PNG de camada regravar.
 */
export class Layer {
  constructor(
    public readonly id: string,
    public name: string,
    public canvas: PixelCanvas,
    public visible: boolean = true,
    public opacity: number = 100,
  ) {}

  static createBlank(name: string, width: number, height: number): Layer {
    return new Layer(crypto.randomUUID(), name, new PixelCanvas(width, height));
  }
}
