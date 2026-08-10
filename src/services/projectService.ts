import { invoke } from "@tauri-apps/api/core";
import type { ProjectManifest, ProjectSummary } from "../types/project";

/**
 * Unico ponto de contato com os Tauri commands de projeto.
 * Nenhum componente deve chamar invoke() diretamente - tudo passa por aqui.
 * Erros vindos do backend chegam como `{ code, params }` (ver AppError em
 * core/error.rs e AppErrorPayload em types/error.ts)
 * `translateError(t, err)` (i18n/errors.ts) antes de exibir ao usuario.
 */

export function listProjects(): Promise<ProjectSummary[]> {
  return invoke("list_projects");
}

export function createProject(name: string): Promise<ProjectSummary> {
  return invoke("create_project", { name });
}

export function deleteProject(id: string): Promise<void> {
  return invoke("delete_project", { id });
}

export function openProject(id: string): Promise<ProjectManifest> {
  return invoke("open_project", { id });
}
