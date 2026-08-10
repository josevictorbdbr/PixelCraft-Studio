use tauri::AppHandle;

use crate::core::error::AppError;
use crate::core::project::{projects_root, ProjectManager, ProjectManifest, ProjectSummary};

/// Lista todos os projetos existentes em disco.
#[tauri::command]
pub fn list_projects(app: AppHandle) -> Result<Vec<ProjectSummary>, AppError> {
    let root = projects_root(&app)?;
    ProjectManager::list(&root)
}

/// Cria um projeto novo com o nome informado.
#[tauri::command]
pub fn create_project(app: AppHandle, name: String) -> Result<ProjectSummary, AppError> {
    let root = projects_root(&app)?;
    ProjectManager::create(&root, &name)
}

/// Remove definitivamente um projeto (identificado pelo UUID interno).
#[tauri::command]
pub fn delete_project(app: AppHandle, id: String) -> Result<(), AppError> {
    let root = projects_root(&app)?;
    ProjectManager::delete(&root, &id)
}

/// Abre um projeto (identificado pelo UUID interno), validando/reparando
/// sua estrutura de pastas antes de devolver o manifest ao frontend.
#[tauri::command]
pub fn open_project(app: AppHandle, id: String) -> Result<ProjectManifest, AppError> {
    let root = projects_root(&app)?;
    ProjectManager::open(&root, &id)
}
