import { invoke } from "@tauri-apps/api/core";
import type { TextureSummary } from "../types/texture";

/**
 * Unico ponto de contato com os Tauri commands de textura.
 * As chaves aqui sao camelCase de proposito: o Tauri converte
 * automaticamente para os parametros snake_case do lado Rust
 * (project_id, source_path, active_layer_id, destination_path).
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

/**
 * Exporta o PNG final (composto) de uma textura para um caminho qualquer
 * escolhido pelo usuario (dialog nativo "Salvar como") - nao mexe em
 * nada do projeto, so copia o arquivo pra fora.
 */
export function exportTexture(
  projectId: string,
  category: string,
  name: string,
  destinationPath: string,
): Promise<void> {
  return invoke("export_texture", { projectId, category, name, destinationPath });
}

/** Tamanho em bytes de um arquivo no disco - usado antes de importar, para
 * avisar o usuario se a imagem escolhida for pesada para pixel art. */
export function fileSizeBytes(path: string): Promise<number> {
  return invoke("file_size_bytes", { path });
}

export interface LayerPayload {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  pixels: number[];
}

export interface TextureLayersPayload {
  width: number;
  height: number;
  activeLayerId: string;
  layers: LayerPayload[];
}

/**
 * Carrega todas as camadas (com pixels) da textura, para o Editor montar
 * o PixelEditorEngine. De proposito nao usa <img>/convertFileSrc aqui:
 * ler pixels de volta (getImageData) de uma imagem carregada via asset
 * protocol pode "tainted" o canvas.
 */
export function loadTextureLayers(
  projectId: string,
  category: string,
  name: string,
): Promise<TextureLayersPayload> {
  return invoke("load_texture_layers", { projectId, category, name });
}

/**
 * Grava o estado completo das camadas de volta no disco - usado tanto
 * pelo autosave de pixels quanto por qualquer operacao estrutural
 * (add/remover/reordenar camada, visibilidade, opacidade): tudo isso
 * acontece em memoria no engine e chega aqui como uma lista completa.
 */
export function saveTextureLayers(
  projectId: string,
  category: string,
  name: string,
  width: number,
  height: number,
  activeLayerId: string,
  layers: LayerPayload[],
): Promise<void> {
  return invoke("save_texture_layers", {
    projectId,
    category,
    name,
    width,
    height,
    activeLayerId,
    layers,
  });
}

/**
 * "Salvar como": grava as camadas atuais do Editor como uma textura NOVA
 * (nome/categoria escolhidos pelo usuario) - nao sobrescreve a original.
 */
export function saveTextureLayersAs(
  projectId: string,
  category: string,
  name: string,
  width: number,
  height: number,
  activeLayerId: string,
  layers: LayerPayload[],
): Promise<TextureSummary> {
  return invoke("save_texture_layers_as", {
    projectId,
    category,
    name,
    width,
    height,
    activeLayerId,
    layers,
  });
}

/**
 * Redimensiona a tela da textura (16 a 1024 em cada eixo) - aplica em
 * TODAS as camadas. So muda o tamanho da tela - pixels existentes ficam
 * na mesma posicao, area nova fica transparente, area removida (se
 * encolher) e recortada.
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
