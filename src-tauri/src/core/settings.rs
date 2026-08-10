use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

use super::error::AppError;

const APP_FOLDER_NAME: &str = "PixelCraft Studio";
const SETTINGS_FILE_NAME: &str = "settings.json";

/// Idiomas suportados pela interface. O frontend e a fonte da verdade para
/// as traducoes - aqui so precisamos saber qual esta ativo e persistir isso.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum Language {
    En,
    PtBr,
    Es,
}

impl Default for Language {
    /// Ingles e o idioma padrao do app.
    fn default() -> Self {
        Language::En
    }
}

/// Preferencias do usuario persistidas em `settings.json`, ao lado da pasta
/// `Projects/`. Deliberadamente pequeno por agora - novos campos (ex.
/// resolucao padrao) podem ser adicionados aqui sem quebrar arquivos antigos,
/// gracas ao `#[serde(default)]`.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default)]
pub struct AppSettings {
    pub language: Language,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            language: Language::default(),
        }
    }
}

/// Ponto unico de acesso ao arquivo de configuracoes. Segue o mesmo padrao
/// de escrita atomica usado no restante do app (grava em `.tmp`, renomeia).
pub struct SettingsManager;

impl SettingsManager {
    /// Resolve `Documentos/PixelCraft Studio/settings.json`, criando a pasta
    /// pai caso ainda nao exista.
    fn path(app: &AppHandle) -> Result<PathBuf, AppError> {
        let documents = app
            .path()
            .document_dir()
            .map_err(|_| AppError::DocumentsDirNotFound)?;

        let app_dir = documents.join(APP_FOLDER_NAME);
        fs::create_dir_all(&app_dir)?;
        Ok(app_dir.join(SETTINGS_FILE_NAME))
    }

    /// Carrega as configuracoes salvas. Na primeira execucao (arquivo ainda
    /// nao existe) ou se o arquivo estiver corrompido, devolve os padroes -
    /// configuracao nunca deve impedir o app de abrir.
    pub fn load(app: &AppHandle) -> Result<AppSettings, AppError> {
        let path = Self::path(app)?;
        match fs::read_to_string(&path) {
            Ok(content) => Ok(serde_json::from_str(&content).unwrap_or_default()),
            Err(_) => Ok(AppSettings::default()),
        }
    }

    /// Grava as configuracoes por completo (o frontend sempre envia o objeto
    /// inteiro, nao campos isolados - mantem o contrato simples).
    pub fn save(app: &AppHandle, settings: &AppSettings) -> Result<(), AppError> {
        let path = Self::path(app)?;
        let json = serde_json::to_string_pretty(settings)?;
        let tmp_path = path.with_extension("tmp");
        fs::write(&tmp_path, json)?;
        fs::rename(&tmp_path, &path)?;
        Ok(())
    }
}
