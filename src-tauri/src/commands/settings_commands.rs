use tauri::AppHandle;

use crate::core::error::AppError;
use crate::core::settings::{AppSettings, SettingsManager};

/// Carrega as configuracoes do usuario (idioma, etc). Chamado uma vez ao
/// iniciar o app.
#[tauri::command]
pub fn load_settings(app: AppHandle) -> Result<AppSettings, AppError> {
    SettingsManager::load(&app)
}

/// Grava as configuracoes por completo. O frontend guarda o estado atual e
/// manda o objeto inteiro a cada mudanca (ex. troca de idioma).
#[tauri::command]
pub fn save_settings(app: AppHandle, settings: AppSettings) -> Result<(), AppError> {
    SettingsManager::save(&app, &settings)
}
