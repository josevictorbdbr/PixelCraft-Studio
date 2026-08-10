use std::fs;
use std::path::{Path, PathBuf};

use image::{Rgba, RgbaImage};

use super::super::error::AppError;

const PNG_EXTENSION: &str = "png";

/// Pasta de uma categoria dentro de um projeto (ex: <projeto>/textures/blocks).
pub fn category_dir(project_dir: &Path, category: &str) -> PathBuf {
    project_dir.join("textures").join(category)
}

/// Caminho do arquivo de uma textura especifica.
pub fn texture_path(category_dir: &Path, name: &str) -> PathBuf {
    category_dir.join(format!("{name}.{PNG_EXTENSION}"))
}

/// Lista os nomes (sem extensao) de todos os .png de uma pasta de categoria.
/// Uma categoria que ainda nao existe em disco simplesmente nao tem texturas.
pub fn list_png_names(dir: &Path) -> Result<Vec<String>, AppError> {
    if !dir.exists() {
        return Ok(Vec::new());
    }

    let mut names = Vec::new();
    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        let is_png = path
            .extension()
            .and_then(|ext| ext.to_str())
            .is_some_and(|ext| ext.eq_ignore_ascii_case(PNG_EXTENSION));

        if entry.file_type()?.is_file() && is_png {
            if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                names.push(stem.to_string());
            }
        }
    }
    names.sort();
    Ok(names)
}

/// Cria um PNG novo, todo transparente, na resolucao informada.
pub fn write_blank_png(path: &Path, width: u32, height: u32) -> Result<(), AppError> {
    let image = RgbaImage::from_pixel(width, height, Rgba([0, 0, 0, 0]));
    image.save(path)?;
    Ok(())
}

/// Redimensiona a tela de uma textura existente: os pixels atuais ficam na
/// mesma posicao (ancoragem no canto superior esquerdo), a area nova (se
/// aumentar) fica transparente, e o que sobrar fora da nova area (se
/// diminuir) e recortado. Nao estica/escala o conteudo - so muda o
/// tamanho da tela.
pub fn resize_canvas(path: &Path, new_width: u32, new_height: u32) -> Result<(), AppError> {
    let existing = image::open(path)?.to_rgba8();
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
    fs::rename(&tmp_path, path)?;
    Ok(())
}

/// Importa um arquivo de imagem existente: decodifica (validando que e uma
/// imagem de verdade) e regrava como PNG no destino, garantindo que o
/// arquivo final sempre seja um PNG valido, independente do arquivo de origem.
pub fn import_image(source: &Path, dest: &Path) -> Result<(), AppError> {
    let decoded = image::open(source)?;
    decoded.save(dest)?;
    Ok(())
}

/// Le um PNG e devolve seus pixels RGBA crus (para o Editor).
pub fn read_pixels(path: &Path) -> Result<super::texture_model::PixelBuffer, AppError> {
    let img = image::open(path)?.to_rgba8();
    let (width, height) = img.dimensions();
    Ok(super::texture_model::PixelBuffer {
        width,
        height,
        pixels: img.into_raw(),
    })
}

/// Grava pixels RGBA crus (vindos do canvas do editor) como PNG, de forma
/// atomica (arquivo temporario + rename), para nao corromper a textura se
/// o app fechar no meio do salvamento.
pub fn write_pixels_as_png(path: &Path, width: u32, height: u32, pixels: &[u8]) -> Result<(), AppError> {
    let expected_len = (width as usize) * (height as usize) * 4;
    if pixels.len() != expected_len {
        return Err(AppError::PixelDataSizeMismatch {
            expected: expected_len,
            received: pixels.len(),
        });
    }

    let image = RgbaImage::from_raw(width, height, pixels.to_vec())
        .ok_or(AppError::ImageBuildFailed)?;

    let tmp_path = path.with_extension("tmp");
    image.save_with_format(&tmp_path, image::ImageFormat::Png)?;
    fs::rename(&tmp_path, path)?;
    Ok(())
}
