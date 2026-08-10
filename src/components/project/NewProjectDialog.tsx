import { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { useTranslation } from "../../i18n/useTranslation";

interface NewProjectDialogProps {
  onConfirm: (name: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  error: string | null;
}

/** Dialogo minimo: pede apenas o nome do projeto (doc UI/UX, secao 1). */
export function NewProjectDialog({
  onConfirm,
  onCancel,
  isSubmitting,
  error,
}: NewProjectDialogProps) {
  const t = useTranslation();
  const [name, setName] = useState("");

  // Nao fazemos trim automatico: o backend valida espacos nas pontas e
  // devolve uma mensagem clara, entao deixamos o valor seguir como digitado.
  const canSubmit = name.trim().length > 0 && !isSubmitting;

  const handleConfirm = () => {
    if (canSubmit) onConfirm(name);
  };

  return (
    <Modal title={t.project.newProjectDialogTitle} onClose={onCancel}>
      <input
        autoFocus
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
        placeholder={t.project.namePlaceholder}
        disabled={isSubmitting}
        className="w-full h-[34px] px-3 rounded-sm bg-canvas border border-line text-ink text-body outline-none focus:border-accent disabled:opacity-60"
      />
      {error && <p className="text-caption text-red-400 mt-2">{error}</p>}
      <div className="flex justify-end gap-button-gap mt-4">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          {t.common.cancel}
        </Button>
        <Button variant="primary" onClick={handleConfirm} disabled={!canSubmit}>
          {isSubmitting ? t.common.creating : t.common.create}
        </Button>
      </div>
    </Modal>
  );
}
