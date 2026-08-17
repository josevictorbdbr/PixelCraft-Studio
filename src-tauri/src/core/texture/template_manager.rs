use std::fs;
use std::path::PathBuf;

use image::imageops::FilterType;
use tauri::{path::BaseDirectory, AppHandle, Manager};

use super::super::error::{AppError, EntityKind};
use super::template_model::{BuiltinTemplateEntry, CustomTemplateEntry, TemplateMeta, TemplatePixels};

const APP_FOLDER_NAME: &str = "PixelCraft Studio";
const CUSTOM_TEMPLATES_FOLDER: &str = "Templates";
const BUILTIN_MANIFEST_FILE: &str = "manifest.json";
const CUSTOM_MANIFEST_FILE: &str = "custom_manifest.json";
const HIDDEN_BUILTIN_FILE: &str = "hidden_builtin.json";
const PNG_EXTENSION: &str = "png";

/// Templates de textura base: uma lista unica (sem categoria) de PNGs com
/// resolucao fixa propria, oferecidos como camada nova no Editor. Duas
/// origens: embutidos no bundle (`resources/templates/`) e custom do
/// usuario, persistidos no nivel do ambiente (nao por projeto), no mesmo
/// diretorio de `settings.json` (ver `core::settings::SettingsManager`).
pub struct TemplateManager;

impl TemplateManager {
    /// Pasta dos templates embutidos no bundle (recurso empacotado -
    /// precisa estar registrado em `tauri.conf.json` > `bundle.resources`).
    fn builtin_dir(app: &AppHandle) -> Result<PathBuf, AppError> {
        app.path()
            .resolve("resources/templates", BaseDirectory::Resource)
            .map_err(|_| AppError::TemplateResourceDirNotFound)
    }

    /// `Documentos/PixelCraft Studio/Templates/` - custom templates valem
    /// para o ambiente todo, disponiveis em qualquer projeto.
    fn custom_dir(app: &AppHandle) -> Result<PathBuf, AppError> {
        let documents = app
            .path()
            .document_dir()
            .map_err(|_| AppError::DocumentsDirNotFound)?;
        let dir = documents.join(APP_FOLDER_NAME).join(CUSTOM_TEMPLATES_FOLDER);
        fs::create_dir_all(&dir)?;
        Ok(dir)
    }

    fn custom_manifest_path(app: &AppHandle) -> Result<PathBuf, AppError> {
        Ok(Self::custom_dir(app)?.join(CUSTOM_MANIFEST_FILE))
    }

    fn hidden_builtin_path(app: &AppHandle) -> Result<PathBuf, AppError> {
        Ok(Self::custom_dir(app)?.join(HIDDEN_BUILTIN_FILE))
    }

    fn read_hidden_builtin(app: &AppHandle) -> Result<Vec<String>, AppError> {
        let path = Self::hidden_builtin_path(app)?;
        if !path.exists() {
            return Ok(Vec::new());
        }
        let raw = fs::read_to_string(&path)?;
        Ok(serde_json::from_str(&raw).unwrap_or_default())
    }

    /// Escrita atomica (tmp + rename), mesmo padrao do resto do app.
    fn write_hidden_builtin(app: &AppHandle, ids: &[String]) -> Result<(), AppError> {
        let path = Self::hidden_builtin_path(app)?;
        let raw = serde_json::to_string_pretty(ids)?;
        let tmp_path = path.with_extension("tmp");
        fs::write(&tmp_path, raw)?;
        fs::rename(&tmp_path, &path)?;
        Ok(())
    }

    fn read_custom_manifest(app: &AppHandle) -> Result<Vec<CustomTemplateEntry>, AppError> {
        let path = Self::custom_manifest_path(app)?;
        if !path.exists() {
            return Ok(Vec::new());
        }
        let raw = fs::read_to_string(&path)?;
        Ok(serde_json::from_str(&raw).unwrap_or_default())
    }

    /// Escrita atomica (tmp + rename), mesmo padrao do resto do app.
    fn write_custom_manifest(app: &AppHandle, entries: &[CustomTemplateEntry]) -> Result<(), AppError> {
        let path = Self::custom_manifest_path(app)?;
        let raw = serde_json::to_string_pretty(entries)?;
        let tmp_path = path.with_extension("tmp");
        fs::write(&tmp_path, raw)?;
        fs::rename(&tmp_path, &path)?;
        Ok(())
    }

    fn read_builtin_manifest(app: &AppHandle) -> Result<Vec<BuiltinTemplateEntry>, AppError> {
        let dir = Self::builtin_dir(app)?;
        let manifest_path = dir.join(BUILTIN_MANIFEST_FILE);
        if !manifest_path.exists() {
            return Ok(Vec::new());
        }
        let raw = fs::read_to_string(&manifest_path)?;
        Ok(serde_json::from_str(&raw)?)
    }

    /// Lista todos os templates disponiveis: embutidos (exceto os que o
    /// usuario ocultou - ver `hide_builtin`) + custom do usuario.
    pub fn list(app: &AppHandle) -> Result<Vec<TemplateMeta>, AppError> {
        let hidden = Self::read_hidden_builtin(app)?;
        let mut metas = Vec::new();

        let dir = Self::builtin_dir(app)?;
        for entry in Self::read_builtin_manifest(app)? {
            if hidden.contains(&entry.id) {
                continue;
            }
            let (width, height) = image::image_dimensions(dir.join(&entry.file))?;
            metas.push(TemplateMeta {
                id: entry.id.clone(),
                name: entry.id,
                width,
                height,
                is_custom: false,
            });
        }

        for entry in Self::read_custom_manifest(app)? {
            metas.push(TemplateMeta {
                id: entry.id,
                name: entry.name,
                width: entry.width,
                height: entry.height,
                is_custom: true,
            });
        }

        Ok(metas)
    }

    /// Le os pixels de um template (embutido ou custom) e redimensiona via
    /// nearest-neighbor para a resolucao alvo (da textura atual), mantendo
    /// o estilo pixel art. Se o template ja tiver o tamanho alvo, o resize
    /// e um no-op (mesma dimensao de entrada e saida).
    pub fn get_pixels(
        app: &AppHandle,
        id: &str,
        target_width: u32,
        target_height: u32,
    ) -> Result<TemplatePixels, AppError> {
        let path = Self::resolve_png_path(app, id)?;
        let img = image::open(&path)?.to_rgba8();

        let resized = if img.width() == target_width && img.height() == target_height {
            img
        } else {
            image::imageops::resize(&img, target_width, target_height, FilterType::Nearest)
        };

        Ok(TemplatePixels {
            width: target_width,
            height: target_height,
            pixels: resized.into_raw(),
        })
    }

    /// Caminho do PNG de um template, embutido ou custom, pela `id`.
    fn resolve_png_path(app: &AppHandle, id: &str) -> Result<PathBuf, AppError> {
        for entry in Self::read_builtin_manifest(app)? {
            if entry.id == id {
                return Ok(Self::builtin_dir(app)?.join(&entry.file));
            }
        }
        for entry in Self::read_custom_manifest(app)? {
            if entry.id == id {
                return Ok(Self::custom_dir(app)?.join(format!("{id}.{PNG_EXTENSION}")));
            }
        }
        Err(AppError::TemplateNotFound { id: id.to_string() })
    }

    /// Importa um PNG (caminho escolhido no dialogo nativo pelo frontend)
    /// como template custom. Fica salvo no nivel do ambiente, disponivel em
    /// qualquer projeto.
    pub fn import_custom(app: &AppHandle, source_path: &str, name: &str) -> Result<TemplateMeta, AppError> {
        let name = name.trim();
        if name.is_empty() {
            return Err(AppError::NameEmpty { entity: EntityKind::Template });
        }

        let mut entries = Self::read_custom_manifest(app)?;
        if entries.iter().any(|e| e.name == name) {
            return Err(AppError::AlreadyExists {
                entity: EntityKind::Template,
                name: name.to_string(),
            });
        }

        let img = image::open(source_path)?.to_rgba8();
        let (width, height) = img.dimensions();

        let id = uuid::Uuid::new_v4().to_string();
        let dest = Self::custom_dir(app)?.join(format!("{id}.{PNG_EXTENSION}"));
        img.save_with_format(&dest, image::ImageFormat::Png)?;

        entries.push(CustomTemplateEntry {
            id: id.clone(),
            name: name.to_string(),
            width,
            height,
        });
        Self::write_custom_manifest(app, &entries)?;

        Ok(TemplateMeta { id, name: name.to_string(), width, height, is_custom: true })
    }

    /// Remove um template custom (o PNG e a entrada no manifesto). Templates
    /// embutidos nao podem ser removidos por aqui.
    pub fn delete_custom(app: &AppHandle, id: &str) -> Result<(), AppError> {
        let mut entries = Self::read_custom_manifest(app)?;
        let before = entries.len();
        entries.retain(|e| e.id != id);
        if entries.len() == before {
            return Err(AppError::TemplateNotFound { id: id.to_string() });
        }

        let png_path = Self::custom_dir(app)?.join(format!("{id}.{PNG_EXTENSION}"));
        if png_path.exists() {
            fs::remove_file(png_path)?;
        }
        Self::write_custom_manifest(app, &entries)
    }

    /// "Remove" um template embutido do ponto de vista do usuario. Nao mexe
    /// no bundle (a pasta de recursos costuma ser so-leitura depois de
    /// instalado, e apagar de la quebraria numa atualizacao futura do app) -
    /// em vez disso, guarda a id numa lista de ocultos por usuario, que o
    /// `list()` respeita. Idempotente: ocultar de novo nao da erro.
    pub fn hide_builtin(app: &AppHandle, id: &str) -> Result<(), AppError> {
        let exists = Self::read_builtin_manifest(app)?.iter().any(|e| e.id == id);
        if !exists {
            return Err(AppError::TemplateNotFound { id: id.to_string() });
        }

        let mut hidden = Self::read_hidden_builtin(app)?;
        if !hidden.contains(&id.to_string()) {
            hidden.push(id.to_string());
            Self::write_hidden_builtin(app, &hidden)?;
        }
        Ok(())
    }
}
