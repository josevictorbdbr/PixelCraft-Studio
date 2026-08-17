use serde::{Deserialize, Serialize};

/// Metadados de um template exibidos na lista do TemplatePicker. `name` para
/// embutidos e a propria `id` (chave de traducao em `i18n/templates.ts`,
/// nao existe ainda - ver nota no PR); para custom e o nome literal que o
/// usuario digitou ao importar.
///
/// `rename_all = "camelCase"` e obrigatorio aqui: valores de RETORNO de
/// commands nao passam pela conversao camelCase<->snake_case automatica do
/// Tauri (isso so vale pros argumentos de entrada) - sem isso, `is_custom`
/// chega como `undefined` no frontend (`isCustom` no TS).
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TemplateMeta {
    pub id: String,
    pub name: String,
    pub width: u32,
    pub height: u32,
    pub is_custom: bool,
}

/// Pixels de um template ja redimensionados (nearest-neighbor) para a
/// resolucao da textura atual - prontos para virar uma Layer no Editor.
#[derive(Debug, Clone, Serialize)]
pub struct TemplatePixels {
    pub width: u32,
    pub height: u32,
    pub pixels: Vec<u8>,
}

/// Uma entrada do `manifest.json` dos templates embutidos (bundle).
#[derive(Debug, Clone, Deserialize)]
pub struct BuiltinTemplateEntry {
    pub id: String,
    pub file: String,
}

/// Uma entrada persistida no manifesto dos templates custom do usuario -
/// mesmo padrao de "manifesto + PNG" usado pelas camadas de textura.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomTemplateEntry {
    pub id: String,
    pub name: String,
    pub width: u32,
    pub height: u32,
}
