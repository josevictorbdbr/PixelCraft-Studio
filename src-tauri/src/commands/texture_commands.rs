use tauri::AppHandle;

use crate::core::error::AppError;
use crate::core::project::{projects_root, ProjectManager};
use crate::core::texture::{LayerInput, TextureLayers, TextureManager, TextureSummary};

/// Tamanho em bytes de um arquivo (usado pelo frontend antes de importar,
/// para avisar se a imagem escolhida for pesada para pixel art).
#[tauri::command]
pub fn file_size_bytes(path: String) -> Result<u64, AppError> {
    TextureManager::file_size_bytes(&path)
}

/// Lista todas as texturas de um projeto (identificado pelo UUID interno).
#[tauri::command]
pub fn list_textures(app: AppHandle, project_id: String) -> Result<Vec<TextureSummary>, AppError> {
    let root = projects_root(&app)?;
    let project_dir = ProjectManager::dir_by_id(&root, &project_id)?;
    TextureManager::list(&project_dir)
}

/// Cria uma textura nova (canvas transparente, camada unica "Base") numa
/// categoria do projeto.
#[tauri::command]
pub fn create_texture(
    app: AppHandle,
    project_id: String,
    category: String,
    name: String,
) -> Result<TextureSummary, AppError> {
    let root = projects_root(&app)?;
    let project_dir = ProjectManager::dir_by_id(&root, &project_id)?;
    TextureManager::create(&project_dir, &category, &name)
}

/// Le todas as camadas (com pixels) de uma textura, para o Editor carregar
/// (sem passar por <img>/asset protocol - ver decisions.md). Migra
/// automaticamente do formato antigo (PNG unico) se for o caso.
#[tauri::command]
pub fn load_texture_layers(
    app: AppHandle,
    project_id: String,
    category: String,
    name: String,
) -> Result<TextureLayers, AppError> {
    let root = projects_root(&app)?;
    let project_dir = ProjectManager::dir_by_id(&root, &project_id)?;
    TextureManager::load_layers(&project_dir, &category, &name)
}

/// Grava o estado completo das camadas do Editor de volta no disco -
/// chamado tanto pelo autosave de pixels quanto por operacoes estruturais
/// (add/remover/reordenar/renomear camada, mudar visibilidade/opacidade),
/// que acontecem em memoria no Editor e chegam aqui como uma lista completa.
#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub fn save_texture_layers(
    app: AppHandle,
    project_id: String,
    category: String,
    name: String,
    width: u32,
    height: u32,
    active_layer_id: String,
    layers: Vec<LayerInput>,
) -> Result<(), AppError> {
    let root = projects_root(&app)?;
    let project_dir = ProjectManager::dir_by_id(&root, &project_id)?;
    TextureManager::save_layers(&project_dir, &category, &name, width, height, &active_layer_id, &layers)
}

/// "Salvar como": grava as camadas atuais do Editor como uma textura NOVA
/// (nome/categoria escolhidos pelo usuario) - nao sobrescreve a textura
/// original.
#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub fn save_texture_layers_as(
    app: AppHandle,
    project_id: String,
    category: String,
    name: String,
    width: u32,
    height: u32,
    active_layer_id: String,
    layers: Vec<LayerInput>,
) -> Result<TextureSummary, AppError> {
    let root = projects_root(&app)?;
    let project_dir = ProjectManager::dir_by_id(&root, &project_id)?;
    TextureManager::save_layers_as(&project_dir, &category, &name, width, height, &active_layer_id, &layers)
}

/// Redimensiona a tela de uma textura existente (16 a 1024 em cada eixo) -
/// aplica em todas as camadas.
#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub fn resize_texture(
    app: AppHandle,
    project_id: String,
    category: String,
    name: String,
    width: u32,
    height: u32,
) -> Result<TextureSummary, AppError> {
    let root = projects_root(&app)?;
    let project_dir = ProjectManager::dir_by_id(&root, &project_id)?;
    TextureManager::resize(&project_dir, &category, &name, width, height)
}

/// Remove uma textura (identificada por categoria + nome) do projeto.
#[tauri::command]
pub fn delete_texture(
    app: AppHandle,
    project_id: String,
    category: String,
    name: String,
) -> Result<(), AppError> {
    let root = projects_root(&app)?;
    let project_dir = ProjectManager::dir_by_id(&root, &project_id)?;
    TextureManager::delete(&project_dir, &category, &name)
}

/// Importa um arquivo de imagem (caminho escolhido no dialogo nativo pelo
/// frontend) para dentro de uma categoria do projeto.
#[tauri::command]
pub fn import_texture(
    app: AppHandle,
    project_id: String,
    category: String,
    source_path: String,
) -> Result<TextureSummary, AppError> {
    let root = projects_root(&app)?;
    let project_dir = ProjectManager::dir_by_id(&root, &project_id)?;
    TextureManager::import(&project_dir, &category, &source_path)
}
