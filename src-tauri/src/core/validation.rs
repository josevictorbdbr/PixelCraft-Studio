use super::error::{AppError, EntityKind};

/// Caracteres proibidos em nomes de arquivo/pasta no Windows.
const INVALID_CHARS: [char; 9] = ['<', '>', ':', '"', '/', '\\', '|', '?', '*'];

/// Nomes reservados pelo Windows (case-insensitive, sem extensao).
const RESERVED_NAMES: [&str; 22] = [
    "CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8",
    "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
];

/// Validacao de nome compartilhada por projetos e texturas (mesmas regras
/// de arquivo/pasta do Windows nos dois casos - so o `entity` muda, para o
/// frontend escolher a frase certa no idioma ativo).
/// `existing_names` deve conter nomes ja em minusculas.
pub fn validate_name(
    name: &str,
    existing_names: &[String],
    entity: EntityKind,
) -> Result<(), AppError> {
    if name.is_empty() {
        return Err(AppError::NameEmpty { entity });
    }

    if name != name.trim() {
        return Err(AppError::NameHasSpaces { entity });
    }

    if name.chars().any(|c| INVALID_CHARS.contains(&c) || c.is_control()) {
        return Err(AppError::NameInvalidChars {
            entity,
            chars: INVALID_CHARS.iter().collect::<String>(),
        });
    }

    let bare_name = name.trim_end_matches('.');
    if RESERVED_NAMES
        .iter()
        .any(|reserved| reserved.eq_ignore_ascii_case(bare_name))
    {
        return Err(AppError::NameReserved { name: name.to_string() });
    }

    let lower = name.to_lowercase();
    if existing_names.iter().any(|existing| *existing == lower) {
        return Err(AppError::AlreadyExists { entity, name: name.to_string() });
    }

    Ok(())
}
