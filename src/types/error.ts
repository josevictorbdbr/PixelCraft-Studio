/** Espelha o formato serializado do AppError do Rust */
export interface AppErrorPayload {
  code: string;
  params: Record<string, string>;
}
