import type { ReactNode } from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Classe de largura Tailwind (ex. "w-80", "w-96"). Padrao: w-80. */
  widthClassName?: string;
}

/** Dialogo simples centralizado, usado por ex. em "Novo Projeto". */
export function Modal({ title, onClose, children, widthClassName = "w-80" }: ModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={`bg-panel border border-line rounded-sm p-panel shadow-lg ${widthClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-section-title text-ink mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
