/// Gera um novo identificador interno de projeto (UUID v4).
///
/// Isolado em modulo proprio para que o resto do codigo nunca dependa
/// diretamente da crate `uuid` - se a estrategia de geracao de id mudar
/// no futuro, so este arquivo precisa mudar.
pub fn generate_id() -> String {
    uuid::Uuid::new_v4().to_string()
}

/// Valida se uma string tem o formato de um UUID (usado ao receber um `id`
/// vindo do frontend, antes de usa-lo para localizar um projeto em disco).
pub fn is_valid(id: &str) -> bool {
    uuid::Uuid::parse_str(id).is_ok()
}
