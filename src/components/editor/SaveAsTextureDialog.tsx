import { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Select } from "../common/Select";
import { CATEGORIES, type CategoryId } from "../../types/texture";
import { useTranslation } from "../../i18n/useTranslation";

interface SaveAsTextureDialogProps {
  defaultCategory: CategoryId;
  currentWidth: number;
  currentHeight: number;
  onConfirm: (name: string, category: CategoryId) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  error: string | null;
}

/** "Salvar como": grava o conteudo atual do canvas numa textura NOVA (nome
 * + categoria escolhidos aqui). Nao deixa sobrescrever uma textura ja
 * existente - a validacao de nome duplicado vem do backend. */
export function SaveAsTextureDialog({
  defaultCategory,
  currentWidth,
  currentHeight,
  onConfirm,
  onCancel,
  isSubmitting,
  error,
}: SaveAsTextureDialogProps) {
  const t = useTranslation();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategoryId>(defaultCategory);

  const canSubmit = name.trim().length > 0 && !isSubmitting;

  const handleConfirm = () => {
    if (canSubmit) onConfirm(name, category);
  };

  return (
    <Modal title={t.editor.saveAsDialogTitle} onClose={onCancel}>
      <div className="flex flex-col gap-3">
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
          placeholder={t.texture.namePlaceholder}
          disabled={isSubmitting}
          className="w-full h-[34px] px-3 rounded-sm bg-canvas border border-line text-ink text-body outline-none focus:border-accent disabled:opacity-60"
        />
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value as CategoryId)}
          disabled={isSubmitting}
          options={CATEGORIES.map((c) => ({ value: c.id, label: t.categories[c.id] }))}
        />
        <p className="text-caption text-muted">
          {t.editor.saveAsResolutionNote(currentWidth, currentHeight)}
        </p>
      </div>
      {error && <p className="text-caption text-red-400 mt-2">{error}</p>}
      <div className="flex justify-end gap-button-gap mt-4">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          {t.common.cancel}
        </Button>
        <Button variant="primary" onClick={handleConfirm} disabled={!canSubmit}>
          {isSubmitting ? t.common.saving : t.common.save}
        </Button>
      </div>
    </Modal>
  );
}
