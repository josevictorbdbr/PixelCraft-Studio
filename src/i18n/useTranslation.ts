import { useSettingsStore } from "../store/useSettingsStore";
import { dictionaries } from "./index";

/**
 * Devolve o dicionario do idioma ativo (ex. `t.settings.title`). Sem
 * parsing de chave tipo "settings.title" de proposito - acesso direto ao
 * objeto ja da autocomplete e erro de tipo se a chave nao existir.
 */
export function useTranslation() {
  const language = useSettingsStore((s) => s.settings.language);
  return dictionaries[language];
}
