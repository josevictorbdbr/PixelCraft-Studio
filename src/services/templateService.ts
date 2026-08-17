import { invoke } from "@tauri-apps/api/core";
import type { TemplateMeta, TemplatePixelsPayload } from "../types/template";

/**
 * Templates de textura base: lista unica (embutidos + custom do usuario),
 * valida para qualquer projeto - por isso fica separado de textureService
 * (que sempre opera dentro de um projectId).
 */

export function listTemplates(): Promise<TemplateMeta[]> {
  return invoke("list_templates");
}

/** Pixels de um template ja redimensionados (nearest-neighbor) para a
 * resolucao da textura atual sendo editada. */
export function getTemplatePixels(
  id: string,
  targetWidth: number,
  targetHeight: number,
): Promise<TemplatePixelsPayload> {
  return invoke("get_template_pixels", { id, targetWidth, targetHeight });
}

/** Importa um PNG (caminho escolhido no dialogo nativo) como template
 * custom - fica salvo no nivel do ambiente, disponivel em qualquer projeto. */
export function importCustomTemplate(sourcePath: string, name: string): Promise<TemplateMeta> {
  return invoke("import_custom_template", { sourcePath, name });
}

export function deleteCustomTemplate(id: string): Promise<void> {
  return invoke("delete_custom_template", { id });
}

/** "Remove" um template embutido do ponto de vista do usuario - nao mexe
 * no bundle, so oculta pra esse usuario (ver hide_builtin no backend). */
export function hideBuiltinTemplate(id: string): Promise<void> {
  return invoke("hide_builtin_template", { id });
}
