import { PixelCanvas } from "../canvas/PixelCanvas";

/**
 * Uma camada de pixel art: id estavel (persistido no backend), nome
 * editavel, canvas de pixels proprio, visibilidade e opacidade (0-100).
 * `id` e gerado uma vez e reaproveitado nos saves seguintes - e assim
 * que o backend sabe qual PNG de camada regravar.
 */
export class Layer {
  public readonly id: string;
  public name: string;
  public canvas: PixelCanvas;
  public visible: boolean;
  public opacity: number;

  constructor(
    id: string,
    name: string,
    canvas: PixelCanvas,
    visible: boolean = true,
    opacity: number = 100,
  ) {
    this.id = id;
    this.name = name;
    this.canvas = canvas;
    this.visible = visible;
    this.opacity = opacity;
  }

  static createBlank(name: string, width: number, height: number): Layer {
    return new Layer(crypto.randomUUID(), name, new PixelCanvas(width, height));
  }
}
