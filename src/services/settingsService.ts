import { invoke } from "@tauri-apps/api/core";
import type { AppSettings } from "../types/settings";

/** Unico ponto de contato com os Tauri commands de configuracoes. */

export function loadSettings(): Promise<AppSettings> {
  return invoke("load_settings");
}

export function saveSettings(settings: AppSettings): Promise<void> {
  return invoke("save_settings", { settings });
}
