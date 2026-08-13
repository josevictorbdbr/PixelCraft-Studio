use std::path::{Path, PathBuf};

use crate::core::project::DEFAULT_CATEGORIES;
use crate::core::validation;

use super::super::error::{AppError, EntityKind};
use super::filesystem;
use super::texture_model::{
    default_resolution_for_category, LayerData, LayerInput, LayerManifest, LayerMeta,
    TextureLayers, TextureSummary, MAX_LAYERS, MAX_RESOLUTION, MIN_RESOLUTION,
};

/// Ponto unico de acesso a texturas em disco. Recebe sempre a pasta do
/// projeto ja resolvida - fica livre do Tauri e testavel isoladamente.
pub struct TextureManager;

impl TextureManager {
    /// Lista todas as texturas do projeto, em todas as categorias. O
    /// `path` de cada uma aponta pro PNG composto (miniatura), nunca
    /// pra uma camada especifica.
    pub fn list(project_dir: &Path) -> Result<Vec<TextureSummary>, AppError> {
        let mut all = Vec::new();
        for category in DEFAULT_CATEGORIES {
            let dir = filesystem::category_dir(project_dir, category);
            for name in filesystem::list_texture_names(&dir)? {
                let texture_dir = filesystem::texture_dir(&dir, &name);
                all.push(TextureSummary {
                    name,
                    category: category.to_string(),
                    path: filesystem::composite_path(&texture_dir).to_string_lossy().to_string(),
                });
            }
        }
        Ok(all)
    }

    /// Cria uma textura nova (transparente) com uma unica camada "Base" -
    /// resolucao inicial depende da categoria (armadura: 64x32, demais: 16x16).
    pub fn create(project_dir: &Path, category: &str, name: &str) -> Result<TextureSummary, AppError> {
        let category_dir = Self::validated_category_dir(project_dir, category, name)?;
        let (width, height) = default_resolution_for_category(category);
        let pixels = filesystem::blank_pixels(width, height);
        Self::create_texture_folder(&category_dir, name, width, height, &pixels)?;

        Ok(TextureSummary {
            name: name.to_string(),
            category: category.to_string(),
            path: filesystem::composite_path(&filesystem::texture_dir(&category_dir, name))
                .to_string_lossy()
                .to_string(),
        })
    }

    /// Importa um arquivo de imagem existente para dentro de uma
    /// categoria, como uma textura nova de camada unica "Base".
    pub fn import(project_dir: &Path, category: &str, source_path: &str) -> Result<TextureSummary, AppError> {
        let source = PathBuf::from(source_path);
        let name = source
            .file_stem()
            .and_then(|s| s.to_str())
            .ok_or(AppError::InvalidFileName)?
            .to_string();

        let category_dir = Self::validated_category_dir(project_dir, category, &name)?;
        let (width, height, pixels) = filesystem::read_image_as_pixels(&source)?;
        Self::create_texture_folder(&category_dir, &name, width, height, &pixels)?;

        let path = filesystem::composite_path(&filesystem::texture_dir(&category_dir, &name))
            .to_string_lossy()
            .to_string();

        Ok(TextureSummary {
            name,
            category: category.to_string(),
            path,
        })
    }

    /// Le todas as camadas (com pixels) de uma textura, para o Editor
    /// carregar. Migra automaticamente do formato antigo, se necessario.
    pub fn load_layers(project_dir: &Path, category: &str, name: &str) -> Result<TextureLayers, AppError> {
        let category_dir = Self::checked_category_dir(project_dir, category)?;
        filesystem::migrate_legacy_texture(&category_dir, name)?;

        let texture_dir = filesystem::texture_dir(&category_dir, name);
        if !texture_dir.exists() {
            return Err(AppError::TextureNotFound {
                name: name.to_string(),
                category: category.to_string(),
            });
        }

        let manifest = filesystem::read_manifest(&texture_dir)?;
        let mut layers = Vec::with_capacity(manifest.layers.len());
        for meta in &manifest.layers {
            let pixels = filesystem::read_layer_pixels(&texture_dir, &meta.id)?;
            layers.push(LayerData {
                id: meta.id.clone(),
                name: meta.name.clone(),
                visible: meta.visible,
                opacity: meta.opacity,
                pixels,
            });
        }

        Ok(TextureLayers {
            width: manifest.width,
            height: manifest.height,
            active_layer_id: manifest.active_layer_id,
            layers,
        })
    }

    /// Grava o estado completo das camadas de volta no disco (autosave e
    /// operacoes estruturais como add/remover/reordenar camada - tudo
    /// isso acontece em memoria no Editor e chega aqui como uma unica
    /// lista completa, igual ao autosave normal de pixels).
    pub fn save_layers(
        project_dir: &Path,
        category: &str,
        name: &str,
        width: u32,
        height: u32,
        active_layer_id: &str,
        layers: &[LayerInput],
    ) -> Result<(), AppError> {
        let category_dir = Self::checked_category_dir(project_dir, category)?;
        let texture_dir = filesystem::texture_dir(&category_dir, name);
        if !texture_dir.exists() {
            return Err(AppError::TextureNotFound {
                name: name.to_string(),
                category: category.to_string(),
            });
        }
        Self::write_layers_to_disk(&texture_dir, width, height, active_layer_id, layers)
    }

    /// "Salvar como": grava as camadas atuais do Editor como uma textura
    /// NOVA (nome/categoria escolhidos pelo usuario) - reusa a mesma
    /// validacao de nome/categoria do `create`.
    pub fn save_layers_as(
        project_dir: &Path,
        category: &str,
        name: &str,
        width: u32,
        height: u32,
        active_layer_id: &str,
        layers: &[LayerInput],
    ) -> Result<TextureSummary, AppError> {
        let category_dir = Self::validated_category_dir(project_dir, category, name)?;
        let texture_dir = filesystem::texture_dir(&category_dir, name);
        Self::write_layers_to_disk(&texture_dir, width, height, active_layer_id, layers)?;

        Ok(TextureSummary {
            name: name.to_string(),
            category: category.to_string(),
            path: filesystem::composite_path(&texture_dir).to_string_lossy().to_string(),
        })
    }

    /// Redimensiona a tela de uma textura existente (16 a 1024 em cada
    /// eixo) - aplica em TODAS as camadas (mesma ancoragem/recorte de
    /// antes), depois regrava manifesto e composite.
    pub fn resize(project_dir: &Path, category: &str, name: &str, new_width: u32, new_height: u32) -> Result<TextureSummary, AppError> {
        let category_dir = Self::checked_category_dir(project_dir, category)?;
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

        let texture_dir = filesystem::texture_dir(&category_dir, name);
        let mut manifest = filesystem::read_manifest(&texture_dir)?;

        for meta in &manifest.layers {
            filesystem::resize_layer_canvas(&texture_dir, &meta.id, new_width, new_height)?;
        }
        manifest.width = new_width;
        manifest.height = new_height;
        filesystem::write_manifest(&texture_dir, &manifest)?;
        Self::regenerate_composite(&texture_dir, &manifest)?;

        Ok(TextureSummary {
            name: name.to_string(),
            category: category.to_string(),
            path: filesystem::composite_path(&texture_dir).to_string_lossy().to_string(),
        })
    }

    /// Remove uma textura (pasta completa: manifesto + camadas + composite).
    pub fn delete(project_dir: &Path, category: &str, name: &str) -> Result<(), AppError> {
        let category_dir = Self::checked_category_dir(project_dir, category)?;
        let texture_dir = filesystem::texture_dir(&category_dir, name);
        if !texture_dir.exists() {
            return Err(AppError::TextureNotFound {
                name: name.to_string(),
                category: category.to_string(),
            });
        }
        filesystem::delete_texture_dir(&texture_dir)
    }

    /// Tamanho em bytes de um arquivo no disco - usado antes de importar.
    pub fn file_size_bytes(path: &str) -> Result<u64, AppError> {
        let metadata = std::fs::metadata(path)?;
        Ok(metadata.len())
    }

    fn checked_category_dir(project_dir: &Path, category: &str) -> Result<PathBuf, AppError> {
        if !DEFAULT_CATEGORIES.contains(&category) {
            return Err(AppError::InvalidCategory { category: category.to_string() });
        }
        Ok(filesystem::category_dir(project_dir, category))
    }

    /// Valida a categoria e o nome (vazio/espacos/caracteres invalidos/
    /// duplicado dentro da categoria) e devolve a pasta da categoria.
    fn validated_category_dir(project_dir: &Path, category: &str, name: &str) -> Result<PathBuf, AppError> {
        let dir = Self::checked_category_dir(project_dir, category)?;
        let existing: Vec<String> = filesystem::list_texture_names(&dir)?
            .iter()
            .map(|n| n.to_lowercase())
            .collect();

        validation::validate_name(name, &existing, EntityKind::Texture)?;
        Ok(dir)
    }

    /// Cria a pasta de uma textura nova com uma unica camada "Base".
    fn create_texture_folder(category_dir: &Path, name: &str, width: u32, height: u32, pixels: &[u8]) -> Result<(), AppError> {
        let texture_dir = filesystem::texture_dir(category_dir, name);
        let layer_id = uuid::Uuid::new_v4().to_string();

        std::fs::create_dir_all(filesystem::layers_folder(&texture_dir))?;
        filesystem::write_layer_png(&texture_dir, &layer_id, width, height, pixels)?;
        filesystem::write_composite_png(&texture_dir, width, height, pixels)?;

        let manifest = LayerManifest {
            width,
            height,
            active_layer_id: layer_id.clone(),
            layers: vec![LayerMeta {
                id: layer_id,
                name: "Base".to_string(),
                visible: true,
                opacity: 100,
            }],
        };
        filesystem::write_manifest(&texture_dir, &manifest)
    }

    /// Valida e persiste a lista de camadas enviada pelo Editor: regrava
    /// cada PNG de camada, o manifesto e a miniatura composta.
    fn write_layers_to_disk(
        texture_dir: &Path,
        width: u32,
        height: u32,
        active_layer_id: &str,
        layers: &[LayerInput],
    ) -> Result<(), AppError> {
        if layers.is_empty() {
            return Err(AppError::EmptyLayerList);
        }
        if layers.len() > MAX_LAYERS {
            return Err(AppError::LayerLimitReached { max: MAX_LAYERS });
        }

        std::fs::create_dir_all(filesystem::layers_folder(texture_dir))?;

        let mut metas = Vec::with_capacity(layers.len());
        for layer in layers {
            filesystem::write_layer_png(texture_dir, &layer.id, width, height, &layer.pixels)?;
            metas.push(LayerMeta {
                id: layer.id.clone(),
                name: layer.name.clone(),
                visible: layer.visible,
                opacity: layer.opacity,
            });
        }

        let manifest = LayerManifest {
            width,
            height,
            active_layer_id: active_layer_id.to_string(),
            layers: metas,
        };
        filesystem::write_manifest(texture_dir, &manifest)?;

        let entries: Vec<(bool, u8, &[u8])> = layers.iter().map(|l| (l.visible, l.opacity, l.pixels.as_slice())).collect();
        let composite = Self::composite_pixels(width, height, &entries);
        filesystem::write_composite_png(texture_dir, width, height, &composite)
    }

    /// Reconstroi o composite lendo as camadas de volta do disco (usado
    /// pelo `resize`, onde os pixels ja foram regravados por camada).
    fn regenerate_composite(texture_dir: &Path, manifest: &LayerManifest) -> Result<(), AppError> {
        let mut buffers = Vec::with_capacity(manifest.layers.len());
        for meta in &manifest.layers {
            buffers.push(filesystem::read_layer_pixels(texture_dir, &meta.id)?);
        }
        let entries: Vec<(bool, u8, &[u8])> = manifest
            .layers
            .iter()
            .zip(buffers.iter())
            .map(|(meta, buf)| (meta.visible, meta.opacity, buf.as_slice()))
            .collect();
        let composite = Self::composite_pixels(manifest.width, manifest.height, &entries);
        filesystem::write_composite_png(texture_dir, manifest.width, manifest.height, &composite)
    }

    /// Compoe camadas visiveis em uma unica imagem (alpha-over classico).
    /// `layers[0]` e sempre a camada do topo - por isso percorre a lista
    /// de tras para frente (do fundo pro topo) ao desenhar.
    fn composite_pixels(width: u32, height: u32, layers: &[(bool, u8, &[u8])]) -> Vec<u8> {
        let pixel_count = (width as usize) * (height as usize);
        let mut out = vec![0u8; pixel_count * 4];

        for &(visible, opacity, pixels) in layers.iter().rev() {
            if !visible || opacity == 0 {
                continue;
            }
            let factor = opacity as f32 / 100.0;
            for i in 0..pixel_count {
                let si = i * 4;
                let sa = (pixels[si + 3] as f32 / 255.0) * factor;
                if sa <= 0.0 {
                    continue;
                }
                let da = out[si + 3] as f32 / 255.0;
                let out_a = sa + da * (1.0 - sa);
                if out_a <= 0.0001 {
                    continue;
                }
                out[si] = ((pixels[si] as f32 * sa + out[si] as f32 * da * (1.0 - sa)) / out_a) as u8;
                out[si + 1] = ((pixels[si + 1] as f32 * sa + out[si + 1] as f32 * da * (1.0 - sa)) / out_a) as u8;
                out[si + 2] = ((pixels[si + 2] as f32 * sa + out[si + 2] as f32 * da * (1.0 - sa)) / out_a) as u8;
                out[si + 3] = (out_a * 255.0) as u8;
            }
        }
        out
    }
}
