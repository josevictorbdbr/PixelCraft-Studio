use serde::Serialize;

/// Limites de resolucao ao redimensionar uma textura (item 4 das
/// pendencias pre-GitHub).
pub const MIN_RESOLUTION: u32 = 16;
pub const MAX_RESOLUTION: u32 = 1024;

/// Resolucao padrao de uma textura nova, por categoria: armadura e
/// 64x32 (formato real de armaduras no Minecraft), as demais 16x16.
/// Pode ser mudada depois via redimensionar (Editor).
pub fn default_resolution_for_category(category: &str) -> (u32, u32) {
    if category == "armor" {
        (64, 32)
    } else {
        (16, 16)
    }
}

/// Uma textura e identificada pelo par (categoria, nome) - o proprio arquivo
/// PNG em disco e a fonte da verdade, sem indice/metadado separado (sem
/// banco de dados, mesmo espirito do ProjectManager).
#[derive(Debug, Clone, Serialize)]
pub struct TextureSummary {
    pub name: String,
    pub category: String,
    /// Caminho absoluto do PNG em disco - o frontend usa isso com
    /// convertFileSrc() para exibir a miniatura de verdade.
    pub path: String,
}

/// Pixels RGBA crus de uma textura, para o Editor carregar sem depender
/// de <img>/asset protocol (que pode "tainted" o canvas ao ler pixels de
/// volta - ver decisions.md). Simetrico ao que save_texture recebe.
#[derive(Debug, Clone, Serialize)]
pub struct PixelBuffer {
    pub width: u32,
    pub height: u32,
    pub pixels: Vec<u8>,
}
