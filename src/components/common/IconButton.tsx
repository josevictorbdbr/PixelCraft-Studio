import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string; // usado como title/aria-label - nunca so o icone sem contexto
}

/** Botao de icone 32x32, para acoes como Configuracoes (doc UI/UX, secao 4). */
export function IconButton({ icon, label, className = "", ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`size-8 flex items-center justify-center rounded-sm text-muted hover:text-ink hover:bg-panel transition-colors cursor-pointer ${className}`}
      {...rest}
    >
      {icon}
    </button>
  );
}
