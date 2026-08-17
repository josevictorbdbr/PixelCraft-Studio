use tauri::AppHandle;

use crate::core::error::AppError;
use crate::core::texture::{TemplateManager, TemplateMeta, TemplatePixels};

/// Lista todos os templates disponiveis: embutidos + custom do usuario.
#[tauri::command]
pub fn list_templates(app: AppHandle) -> Result<Vec<TemplateMeta>, AppError> {
    TemplateManager::list(&app)
}

/// Pixels de um template ja redimensionados (nearest-neighbor) para a
/// resolucao da textura atual - prontos para virar uma Layer no Editor.
#[tauri::command]
pub fn get_template_pixels(
    app: AppHandle,
    id: String,
    target_width: u32,
    target_height: u32,
) -> Result<TemplatePixels, AppError> {
    TemplateManager::get_pixels(&app, &id, target_width, target_height)
}

/// Importa um PNG (caminho do dialogo nativo) como template custom - fica
/// salvo no nivel do ambiente, disponivel em qualquer projeto.
#[tauri::command]
pub fn import_custom_template(app: AppHandle, source_path: String, name: String) -> Result<TemplateMeta, AppError> {
    TemplateManager::import_custom(&app, &source_path, &name)
}

/// Remove um template custom. Templates embutidos nao podem ser removidos.
#[tauri::command]
pub fn delete_custom_template(app: AppHandle, id: String) -> Result<(), AppError> {
    TemplateManager::delete_custom(&app, &id)
}

/// "Remove" um template embutido do ponto de vista do usuario (nao mexe no
/// bundle - guarda numa lista de ocultos por usuario que `list_templates`
/// respeita). Ver `TemplateManager::hide_builtin` para o motivo.
#[tauri::command]
pub fn hide_builtin_template(app: AppHandle, id: String) -> Result<(), AppError> {
    TemplateManager::hide_builtin(&app, &id)
}
