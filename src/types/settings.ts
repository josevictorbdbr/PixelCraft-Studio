/** Espelha o enum Language do Rust. */
export type Language = "en" | "pt-br" | "es";

/** Espelha a struct AppSettings do Rust (settings.json). */
export interface AppSettings {
  language: Language;
}
