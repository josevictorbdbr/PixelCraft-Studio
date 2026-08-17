/** Espelha `TemplateMeta` do Rust. `name` para embutidos e a propria `id`
 * (chave de traducao em `t.templates`, com fallback para a id crua se
 * faltar traducao); para custom e o nome literal digitado na importacao. */
export interface TemplateMeta {
  id: string;
  name: string;
  width: number;
  height: number;
  isCustom: boolean;
}

/** Espelha `TemplatePixels` do Rust - pixels ja redimensionados
 * (nearest-neighbor) pelo backend para a resolucao pedida. */
export interface TemplatePixelsPayload {
  width: number;
  height: number;
  pixels: number[];
}
