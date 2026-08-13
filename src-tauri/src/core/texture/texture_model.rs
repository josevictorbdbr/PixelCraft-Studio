use serde::{Deserialize, Serialize};

/// Limites de resolucao ao redimensionar uma textura.
pub const MIN_RESOLUTION: u32 = 16;
pub const MAX_RESOLUTION: u32 = 1024;

/// Teto de camadas por textura - mantem o HistoryManager (snapshot de
/// todas as camadas por acao) barato em memoria.
pub const MAX_LAYERS: usize = 6;

/// Resolucao padrao de uma textura nova, por categoria: armadura e
/// 64x32, as demais 16x16. Pode ser mudada depois via redimensionar.
pub fn default_resolution_for_category(category: &str) -> (u32, u32) {
    if category == "armor" {
        (64, 32)
    } else {
        (16, 16)
    }
}

/// Uma textura e identificada pelo par (categoria, nome) - a propria
/// pasta em disco e a fonte da verdade, sem indice separado.
#[derive(Debug, Clone, Serialize)]
pub struct TextureSummary {
    pub name: String,
    pub category: String,
    /// Caminho do PNG composto (miniatura/preview) - nunca de uma camada
    /// especifica. O frontend usa isso com convertFileSrc() pra exibir.
    pub path: String,
}

/// Metadados de uma camada, persistidos em `layers.json`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LayerMeta {
    pub id: String,
    pub name: String,
    pub visible: bool,
    /// 0-100.
    pub opacity: u8,
}

/// Conteudo de `layers.json`. A ORDEM do Vec e a ordem visual: indice 0
/// e a camada do topo (mais na frente). A composicao final (miniatura)
/// desenha do ultimo indice para o primeiro (de baixo para cima).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LayerManifest {
    pub width: u32,
    pub height: u32,
    pub active_layer_id: String,
    pub layers: Vec<LayerMeta>,
}

/// Uma camada com seus pixels crus - devolvida ao Editor por `load_layers`.
#[derive(Debug, Clone, Serialize)]
pub struct LayerData {
    pub id: String,
    pub name: String,
    pub visible: bool,
    pub opacity: u8,
    pub pixels: Vec<u8>,
}

/// Estado completo (todas as camadas) de uma textura, devolvido ao Editor.
#[derive(Debug, Clone, Serialize)]
pub struct TextureLayers {
    pub width: u32,
    pub height: u32,
    pub active_layer_id: String,
    pub layers: Vec<LayerData>,
}

/// Uma camada enviada pelo Editor para gravar (`save_layers`/`save_layers_as`).
/// Mesma ordem-e-indice-0-e-topo do `LayerManifest`.
#[derive(Debug, Clone, Deserialize)]
pub struct LayerInput {
    pub id: String,
    pub name: String,
    pub visible: bool,
    pub opacity: u8,
    pub pixels: Vec<u8>,
}
