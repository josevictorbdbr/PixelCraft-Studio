import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const baseClasses =
  "h-[34px] px-4 rounded-sm text-body font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-2";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent/90",
  secondary: "bg-panel text-ink border border-line hover:border-accent",
  // Caixa contornada na cor de destaque - acao de maior peso visual (ex. Novo Projeto)
  outline: "bg-transparent text-accent border border-accent hover:bg-accent/10",
  // Sem fundo/borda - acao secundaria discreta (ex. Abrir/Excluir Projeto)
  ghost: "bg-transparent text-muted hover:text-ink",
  // Mesmo padrao do outline, mas vermelho - acao destrutiva com contorno sempre visivel (ex. Excluir Textura)
  danger: "bg-transparent text-red-400 border border-red-500/60 hover:bg-red-500/10 hover:border-red-500",
};

/** Botao padrao, 34px de altura conforme doc de UI/UX (secao 4). */
export function Button({
  variant = "secondary",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
