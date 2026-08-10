import type { Dictionary } from "./en";
import type { AppErrorPayload } from "../types/error";

function isAppErrorPayload(value: unknown): value is AppErrorPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    typeof (value as { code: unknown }).code === "string"
  );
}

/**
 * Traduz um erro para o idioma ativo. Se vier do backend (Rust, formato
 * {code, params} - ver core/error.rs), busca a mensagem em `t.errors` pelo
 * `code`. Qualquer outro tipo de erro (rede, parsing, etc) cai para
 * `String(err)` mesmo - nao ha traducao possivel para o que a gente nao
 * reconhece.
 */
export function translateError(t: Dictionary, err: unknown): string {
  if (isAppErrorPayload(err)) {
    const errors = t.errors as Record<string, (params: Record<string, string>) => string>;
    const translate = errors[err.code];
    if (translate) return translate(err.params ?? {});
  }
  return String(err);
}
