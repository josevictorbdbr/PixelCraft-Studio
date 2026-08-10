import type { Language } from "../types/settings";
import { en } from "./en";
import { es } from "./es";
import { ptBR } from "./pt-BR";

export type { Dictionary } from "./en";

/** `satisfies` garante que todo Language tenha um dicionario correspondente. */
export const dictionaries = {
  en,
  "pt-br": ptBR,
  es,
} satisfies Record<Language, unknown>;
