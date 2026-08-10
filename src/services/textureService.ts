import { invoke } from "@tauri-apps/api/core";
import type { TextureSummary } from "../types/texture";

/**
 * Unico ponto de contato com os Tauri commands de textura.
 * As chaves aqui sao camelCase de proposito: o Tauri converte
 * automaticamente para os parametros snake_case do lado Rust
 * (project_id, source_path).
 */

export function listTextures(projectId: string): Promise<TextureSummary[]> {
  return invoke("list_textures", { projectId });
}

export function createTexture(
  projectId: string,
  category: string,
  name: string,
): Promise<TextureSummary> {
  return invoke("create_texture", { projectId, category, name });
}

export function deleteTexture(
  projectId: string,
  category: string,
  name: string,
): Promise<void> {
  return invoke("delete_texture", { projectId, category, name });
}

export function importTexture(
  projectId: string,
  category: string,
  sourcePath: string,
): Promise<TextureSummary> {
  return invoke("import_texture", { projectId, category, sourcePath });
}

/** Tamanho em bytes de um arquivo no disco - usado antes de importar, para
 * avisar o usuario se a imagem escolhida for pesada para pixel art. */
export function fileSizeBytes(path: string): Promise<number> {
  return invoke("file_size_bytes", { path });
}

export interface PixelBuffer {
  width: number;
  height: number;
  pixels: number[];
}

/**
 * Carrega os pixels crus da textura (usado pelo Editor). De proposito
 * nao usa <img>/convertFileSrc aqui: ler pixels de volta (getImageData)
 * de uma imagem carregada via asset protocol pode "tainted" o canvas.
 */
export function loadTexturePixels(
  projectId: string,
  category: string,
  name: string,
): Promise<PixelBuffer> {
  return invoke("load_texture_pixels", { projectId, category, name });
}

export function saveTexture(
  projectId: string,
  category: string,
  name: string,
  width: number,
  height: number,
  pixels: Uint8ClampedArray,
): Promise<void> {
  return invoke("save_texture", {
    projectId,
    category,
    name,
    width,
    height,
    pixels: Array.from(pixels),
  });
}

/**
 * "Salvar como": grava os pixels atuais do Editor como uma textura NOVA
 * (nome/categoria escolhidos pelo usuario) - nao sobrescreve a original.
 */
export function saveTextureAs(
  projectId: string,
  category: string,
  name: string,
  width: number,
  height: number,
  pixels: Uint8ClampedArray,
): Promise<TextureSummary> {
  return invoke("save_texture_as", {
    projectId,
    category,
    name,
    width,
    height,
    pixels: Array.from(pixels),
  });
}

/**
 * Redimensiona a tela da textura (16 a 1024 em cada eixo). So muda o
 * tamanho da tela - pixels existentes ficam na mesma posicao, area nova
 * fica transparente, area removida (se encolher) e recortada.
 */
export function resizeTexture(
  projectId: string,
  category: string,
  name: string,
  width: number,
  height: number,
): Promise<TextureSummary> {
  return invoke("resize_texture", { projectId, category, name, width, height });
}
