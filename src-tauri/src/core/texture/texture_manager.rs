use std::path::{Path, PathBuf};

use crate::core::project::DEFAULT_CATEGORIES;
use crate::core::validation;

use super::super::error::{AppError, EntityKind};
use super::filesystem;
use super::texture_model::{
    default_resolution_for_category, PixelBuffer, TextureSummary, MAX_RESOLUTION, MIN_RESOLUTION,
};

/// Ponto unico de acesso a texturas em disco. Assim como o ProjectManager,
/// recebe sempre a pasta do projeto (`project_dir`) ja resolvida - fica
/// livre do Tauri e testavel isoladamente.
pub struct TextureManager;

impl TextureManager {
    /// Lista todas as texturas do projeto, em todas as categorias.
    pub fn list(project_dir: &Path) -> Result<Vec<TextureSummary>, AppError> {
        let mut all = Vec::new();
        for category in DEFAULT_CATEGORIES {
            let dir = filesystem::category_dir(project_dir, category);
            for name in filesystem::list_png_names(&dir)? {
                let path = filesystem::texture_path(&dir, &name);
                all.push(TextureSummary {
                    name,
                    category: category.to_string(),
                    path: path.to_string_lossy().to_string(),
                });
            }
        }
        Ok(all)
    }

    /// Cria uma textura nova (canvas transparente) numa categoria - a
    /// resolucao inicial depende da categoria (armadura: 64x32, demais: 16x16).
    pub fn create(project_dir: &Path, category: &str, name: &str) -> Result<TextureSummary, AppError> {
        let dir = Self::validated_category_dir(project_dir, category, name)?;

        let path = filesystem::texture_path(&dir, name);
        std::fs::create_dir_all(&dir)?;
        let (width, height) = default_resolution_for_category(category);
        filesystem::write_blank_png(&path, width, height)?;

        Ok(TextureSummary {
            name: name.to_string(),
            category: category.to_string(),
            path: path.to_string_lossy().to_string(),
        })
    }

    /// Importa um arquivo de imagem existente (escolhido no dialogo nativo
    /// do sistema) para dentro de uma categoria, regravando como PNG.
    pub fn import(
        project_dir: &Path,
        category: &str,
        source_path: &str,
    ) -> Result<TextureSummary, AppError> {
        let source = PathBuf::from(source_path);
        let name = source
            .file_stem()
            .and_then(|s| s.to_str())
            .ok_or(AppError::InvalidFileName)?
            .to_string();

        let dir = Self::validated_category_dir(project_dir, category, &name)?;

        let dest = filesystem::texture_path(&dir, &name);
        std::fs::create_dir_all(&dir)?;
        filesystem::import_image(&source, &dest)?;

        Ok(TextureSummary {
            name,
            category: category.to_string(),
            path: dest.to_string_lossy().to_string(),
        })
    }

    /// Le os pixels crus de uma textura (Editor carrega por aqui).
    pub fn load_pixels(project_dir: &Path, category: &str, name: &str) -> Result<PixelBuffer, AppError> {
        if !DEFAULT_CATEGORIES.contains(&category) {
            return Err(AppError::InvalidCategory { category: category.to_string() });
        }
        let dir = filesystem::category_dir(project_dir, category);
        let path = filesystem::texture_path(&dir, name);
        filesystem::read_pixels(&path)
    }

    /// Grava os pixels editados no Editor de volta no arquivo PNG da textura.
    pub fn save_pixels(
        project_dir: &Path,
        category: &str,
        name: &str,
        width: u32,
        height: u32,
        pixels: &[u8],
    ) -> Result<(), AppError> {
        if !DEFAULT_CATEGORIES.contains(&category) {
            return Err(AppError::InvalidCategory { category: category.to_string() });
        }

        let dir = filesystem::category_dir(project_dir, category);
        let path = filesystem::texture_path(&dir, name);
        filesystem::write_pixels_as_png(&path, width, height, pixels)
    }

    /// "Salvar como": grava os pixels atuais do Editor como uma textura
    /// NOVA (nome/categoria escolhidos pelo usuario) - reusa a mesma
    /// validacao de nome/categoria do `create` (nao deixa sobrescrever uma
    /// textura ja existente; para isso o usuario usa o "Salvar" normal).
    pub fn save_as(
        project_dir: &Path,
        category: &str,
        name: &str,
        width: u32,
        height: u32,
        pixels: &[u8],
    ) -> Result<TextureSummary, AppError> {
        let dir = Self::validated_category_dir(project_dir, category, name)?;

        std::fs::create_dir_all(&dir)?;
        let path = filesystem::texture_path(&dir, name);
        filesystem::write_pixels_as_png(&path, width, height, pixels)?;

        Ok(TextureSummary {
            name: name.to_string(),
            category: category.to_string(),
            path: path.to_string_lossy().to_string(),
        })
    }

    /// Redimensiona a tela de uma textura existente (16 a 1024 em cada
    /// eixo). So muda o tamanho da tela - pixels existentes ficam na
    /// mesma posicao, area nova fica transparente, area removida (se
    /// diminuir) e recortada. Nao estica/escala o conteudo.
    pub fn resize(
        project_dir: &Path,
        category: &str,
        name: &str,
        new_width: u32,
        new_height: u32,
    ) -> Result<TextureSummary, AppError> {
        if !DEFAULT_CATEGORIES.contains(&category) {
            return Err(AppError::InvalidCategory { category: category.to_string() });
        }
        if !(MIN_RESOLUTION..=MAX_RESOLUTION).contains(&new_width)
            || !(MIN_RESOLUTION..=MAX_RESOLUTION).contains(&new_height)
        {
            return Err(AppError::InvalidResolution {
                min: MIN_RESOLUTION,
                max: MAX_RESOLUTION,
                width: new_width,
                height: new_height,
            });
        }

        let dir = filesystem::category_dir(project_dir, category);
        let path = filesystem::texture_path(&dir, name);
        filesystem::resize_canvas(&path, new_width, new_height)?;

        Ok(TextureSummary {
            name: name.to_string(),
            category: category.to_string(),
            path: path.to_string_lossy().to_string(),
        })
    }

    /// Remove uma textura (arquivo PNG) de uma categoria.
    pub fn delete(project_dir: &Path, category: &str, name: &str) -> Result<(), AppError> {
        if !DEFAULT_CATEGORIES.contains(&category) {
            return Err(AppError::InvalidCategory { category: category.to_string() });
        }

        let dir = filesystem::category_dir(project_dir, category);
        let path = filesystem::texture_path(&dir, name);
        if !path.exists() {
            return Err(AppError::TextureNotFound {
                name: name.to_string(),
                category: category.to_string(),
            });
        }

        std::fs::remove_file(&path)?;
        Ok(())
    }

    /// Tamanho em bytes de um arquivo no disco - usado antes de importar,
    /// para avisar o usuario se a imagem for pesada para pixel art.
    pub fn file_size_bytes(path: &str) -> Result<u64, AppError> {
        let metadata = std::fs::metadata(path)?;
        Ok(metadata.len())
    }

    /// Valida a categoria e o nome (vazio/espacos/caracteres invalidos/
    /// duplicado dentro da categoria) e devolve a pasta da categoria.
    fn validated_category_dir(project_dir: &Path, category: &str, name: &str) -> Result<PathBuf, AppError> {
        if !DEFAULT_CATEGORIES.contains(&category) {
            return Err(AppError::InvalidCategory { category: category.to_string() });
        }

        let dir = filesystem::category_dir(project_dir, category);
        let existing: Vec<String> = filesystem::list_png_names(&dir)?
            .iter()
            .map(|n| n.to_lowercase())
            .collect();

        validation::validate_name(name, &existing, EntityKind::Texture)?;
        Ok(dir)
    }
}
