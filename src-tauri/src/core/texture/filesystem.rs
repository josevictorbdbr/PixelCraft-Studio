use std::fs;
use std::path::{Path, PathBuf};

use image::{Rgba, RgbaImage};

use super::super::error::AppError;
use super::texture_model::{LayerManifest, LayerMeta};

const PNG_EXTENSION: &str = "png";
const MANIFEST_FILE: &str = "layers.json";
const LAYERS_SUBFOLDER: &str = "layers";
const COMPOSITE_FILE: &str = "composite.png";

/// Pasta de uma categoria dentro de um projeto (ex: <projeto>/textures/blocks).
pub fn category_dir(project_dir: &Path, category: &str) -> PathBuf {
    project_dir.join("textures").join(category)
}

/// Pasta de uma textura especifica (ex: .../blocks/pedra/).
pub fn texture_dir(category_dir: &Path, name: &str) -> PathBuf {
    category_dir.join(name)
}

/// Caminho do PNG solto do formato ANTIGO (pre-camadas) - so usado para
/// detectar e migrar texturas criadas antes dessa mudanca.
pub fn legacy_texture_path(category_dir: &Path, name: &str) -> PathBuf {
    category_dir.join(format!("{name}.{PNG_EXTENSION}"))
}

pub fn manifest_path(texture_dir: &Path) -> PathBuf {
    texture_dir.join(MANIFEST_FILE)
}

pub fn layers_folder(texture_dir: &Path) -> PathBuf {
    texture_dir.join(LAYERS_SUBFOLDER)
}

pub fn layer_png_path(texture_dir: &Path, layer_id: &str) -> PathBuf {
    layers_folder(texture_dir).join(format!("{layer_id}.{PNG_EXTENSION}"))
}

pub fn composite_path(texture_dir: &Path) -> PathBuf {
    texture_dir.join(COMPOSITE_FILE)
}

/// Lista os nomes das texturas de uma categoria. Antes de listar, migra
/// automaticamente qualquer PNG solto (formato antigo) encontrado na
/// pasta para o formato novo de pasta+manifesto - a migracao e
/// transparente e acontece no primeiro acesso, sem comando manual.
pub fn list_texture_names(category_dir: &Path) -> Result<Vec<String>, AppError> {
    if !category_dir.exists() {
        return Ok(Vec::new());
    }

    let mut legacy_names = Vec::new();
    for entry in fs::read_dir(category_dir)? {
        let entry = entry?;
        let path = entry.path();
        let is_png = path
            .extension()
            .and_then(|ext| ext.to_str())
            .is_some_and(|ext| ext.eq_ignore_ascii_case(PNG_EXTENSION));
        if entry.file_type()?.is_file() && is_png {
            if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                legacy_names.push(stem.to_string());
            }
        }
    }
    for name in &legacy_names {
        migrate_legacy_texture(category_dir, name)?;
    }

    let mut names = Vec::new();
    for entry in fs::read_dir(category_dir)? {
        let entry = entry?;
        if entry.file_type()?.is_dir() && manifest_path(&entry.path()).exists() {
            if let Some(n) = entry.file_name().to_str() {
                names.push(n.to_string());
            }
        }
    }
    names.sort();
    Ok(names)
}

/// Converte uma textura do formato antigo (um PNG solto) para o formato
/// novo: pasta com uma unica camada "Base" + manifesto + composite.
/// No-op se a textura ja estiver no formato novo (ou nunca ter existido).
pub fn migrate_legacy_texture(category_dir: &Path, name: &str) -> Result<(), AppError> {
    let legacy_path = legacy_texture_path(category_dir, name);
    if !legacy_path.exists() {
        return Ok(());
    }

    let img = image::open(&legacy_path)?.to_rgba8();
    let (width, height) = img.dimensions();
    let pixels = img.into_raw();

    let dir = texture_dir(category_dir, name);
    let layer_id = uuid::Uuid::new_v4().to_string();

    fs::create_dir_all(layers_folder(&dir))?;
    write_layer_png(&dir, &layer_id, width, height, &pixels)?;
    write_composite_png(&dir, width, height, &pixels)?;

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
    write_manifest(&dir, &manifest)?;

    fs::remove_file(&legacy_path)?;
    Ok(())
}

pub fn read_manifest(texture_dir: &Path) -> Result<LayerManifest, AppError> {
    let raw = fs::read_to_string(manifest_path(texture_dir))?;
    Ok(serde_json::from_str(&raw)?)
}

pub fn write_manifest(texture_dir: &Path, manifest: &LayerManifest) -> Result<(), AppError> {
    let raw = serde_json::to_string_pretty(manifest)?;
    let path = manifest_path(texture_dir);
    let tmp_path = path.with_extension("tmp");
    fs::write(&tmp_path, raw)?;
    fs::rename(&tmp_path, &path)?;
    Ok(())
}

pub fn read_layer_pixels(texture_dir: &Path, layer_id: &str) -> Result<Vec<u8>, AppError> {
    let img = image::open(layer_png_path(texture_dir, layer_id))?.to_rgba8();
    Ok(img.into_raw())
}

pub fn write_layer_png(
    texture_dir: &Path,
    layer_id: &str,
    width: u32,
    height: u32,
    pixels: &[u8],
) -> Result<(), AppError> {
    write_rgba_png(&layer_png_path(texture_dir, layer_id), width, height, pixels)
}

pub fn write_composite_png(texture_dir: &Path, width: u32, height: u32, pixels: &[u8]) -> Result<(), AppError> {
    write_rgba_png(&composite_path(texture_dir), width, height, pixels)
}

pub fn delete_texture_dir(texture_dir: &Path) -> Result<(), AppError> {
    if texture_dir.exists() {
        fs::remove_dir_all(texture_dir)?;
    }
    Ok(())
}

/// Pixels transparentes para uma textura/camada nova.
pub fn blank_pixels(width: u32, height: u32) -> Vec<u8> {
    RgbaImage::from_pixel(width, height, Rgba([0, 0, 0, 0])).into_raw()
}

/// Decodifica um arquivo de imagem qualquer (import) em pixels RGBA crus.
pub fn read_image_as_pixels(source: &Path) -> Result<(u32, u32, Vec<u8>), AppError> {
    let img = image::open(source)?.to_rgba8();
    let (width, height) = img.dimensions();
    Ok((width, height, img.into_raw()))
}

/// Redimensiona a tela de UMA camada (pixels existentes ficam na mesma
/// posicao, area nova fica transparente, area removida e recortada).
/// Chamada uma vez por camada pelo `TextureManager::resize`.
pub fn resize_layer_canvas(texture_dir: &Path, layer_id: &str, new_width: u32, new_height: u32) -> Result<(), AppError> {
    let path = layer_png_path(texture_dir, layer_id);
    let existing = image::open(&path)?.to_rgba8();
    let mut resized = RgbaImage::from_pixel(new_width, new_height, Rgba([0, 0, 0, 0]));

    let copy_width = existing.width().min(new_width);
    let copy_height = existing.height().min(new_height);
    for y in 0..copy_height {
        for x in 0..copy_width {
            resized.put_pixel(x, y, *existing.get_pixel(x, y));
        }
    }

    let tmp_path = path.with_extension("tmp");
    resized.save_with_format(&tmp_path, image::ImageFormat::Png)?;
    fs::rename(&tmp_path, &path)?;
    Ok(())
}

/// Copia o PNG composto (resultado final achatado) de uma textura para um
/// destino qualquer escolhido pelo usuario (Exportar) - nao mexe em nada
/// do projeto, so le o composite e grava uma copia fora da pasta do projeto.
pub fn copy_composite_to(texture_dir: &Path, destination: &Path) -> Result<(), AppError> {
    fs::copy(composite_path(texture_dir), destination)?;
    Ok(())
}

/// Grava pixels RGBA crus como PNG, de forma atomica (arquivo temporario
/// + rename). Reaproveitado por camadas individuais e pelo composite.
fn write_rgba_png(path: &Path, width: u32, height: u32, pixels: &[u8]) -> Result<(), AppError> {
    let expected_len = (width as usize) * (height as usize) * 4;
    if pixels.len() != expected_len {
        return Err(AppError::PixelDataSizeMismatch {
            expected: expected_len,
            received: pixels.len(),
        });
    }

    let image = RgbaImage::from_raw(width, height, pixels.to_vec()).ok_or(AppError::ImageBuildFailed)?;

    let tmp_path = path.with_extension("tmp");
    image.save_with_format(&tmp_path, image::ImageFormat::Png)?;
    fs::rename(&tmp_path, path)?;
    Ok(())
}
