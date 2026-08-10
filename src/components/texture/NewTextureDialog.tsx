import { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Select } from "../common/Select";
import { CATEGORIES, type CategoryId } from "../../types/texture";
import { useTranslation } from "../../i18n/useTranslation";

interface NewTextureDialogProps {
  defaultCategory: CategoryId;
  onConfirm: (name: string, category: CategoryId) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  error: string | null;
}

/** Textura nova: canvas transparente. Resolucao inicial depende da
 * categoria (armadura: 64x32, demais: 16x16) - pode ser mudada depois
 * via "Redimensionar" no Editor. */
export function NewTextureDialog({
  defaultCategory,
  onConfirm,
  onCancel,
  isSubmitting,
  error,
}: NewTextureDialogProps) {
  const t = useTranslation();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategoryId>(defaultCategory);

  const canSubmit = name.trim().length > 0 && !isSubmitting;
  const defaultResolution = category === "armor" ? "64x32" : "16x16";

  const handleConfirm = () => {
    if (canSubmit) onConfirm(name, category);
  };

  return (
    <Modal title={t.texture.newTextureDialogTitle} onClose={onCancel}>
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
          {t.texture.initialResolutionNote(defaultResolution)}
        </p>
      </div>
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
