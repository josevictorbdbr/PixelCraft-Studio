
/**Categorias fixas de texturas*/
export const CATEGORIES = [
  { id: "blocks" },
  { id: "items" },
  { id: "armor" },
  { id: "gui" },
  { id: "entities" },
  { id: "particles" },
  { id: "misc" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

/** Espelha a struct TextureSummary do Rust.*/
export interface TextureSummary {
  name: string;
  category: CategoryId;
  path: string;
}
