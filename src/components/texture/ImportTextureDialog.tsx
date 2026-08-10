import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { FileImage, TriangleAlert } from "lucide-react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Select } from "../common/Select";
import { CATEGORIES, type CategoryId } from "../../types/texture";
import { fileSizeBytes } from "../../services/textureService";
import { useTranslation } from "../../i18n/useTranslation";

interface ImportTextureDialogProps {
  defaultCategory: CategoryId;
  onConfirm: (category: CategoryId, sourcePath: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  error: string | null;
}

// Arquivos maiores que isso disparam o aviso "tem certeza?" - imagens de
// pixel art raramente pesam tanto, geralmente indica algo fora do esperado
// (foto, textura em alta resolucao, etc).
const MAX_RECOMMENDED_BYTES = 2 * 1024 * 1024; // 2MB

function formatMb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

export function ImportTextureDialog({
  defaultCategory,
  onConfirm,
  onCancel,
  isSubmitting,
  error,
}: ImportTextureDialogProps) {
  const t = useTranslation();
  const [category, setCategory] = useState<CategoryId>(defaultCategory);
  const [sourcePath, setSourcePath] = useState<string | null>(null);
  const [sourceSizeBytes, setSourceSizeBytes] = useState<number | null>(null);
  const [acknowledgedOversize, setAcknowledgedOversize] = useState(false);

  const handlePickFile = async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: t.texture.pngFilterName, extensions: ["png"] }],
    });
    if (typeof selected !== "string") return;

    setSourcePath(selected);
    setAcknowledgedOversize(false);
    try {
      setSourceSizeBytes(await fileSizeBytes(selected));
    } catch {
      // Nao bloqueia o fluxo por causa disso - so fica sem o aviso de tamanho.
      setSourceSizeBytes(null);
    }
  };

  const isOversized = sourceSizeBytes !== null && sourceSizeBytes > MAX_RECOMMENDED_BYTES;
  const canSubmit = sourcePath !== null && !isSubmitting && (!isOversized || acknowledgedOversize);

  const handleConfirm = () => {
    if (canSubmit && sourcePath) onConfirm(category, sourcePath);
  };

  const fileName = sourcePath?.split(/[/\\]/).pop();

  return (
    <Modal title={t.texture.importDialogTitle} onClose={onCancel}>
      <div className="flex flex-col gap-3">
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value as CategoryId)}
          disabled={isSubmitting}
          options={CATEGORIES.map((c) => ({ value: c.id, label: t.categories[c.id] }))}
        />

        <button
          type="button"
          onClick={handlePickFile}
          disabled={isSubmitting}
          className="flex items-center gap-2 h-[34px] px-3 rounded-sm bg-canvas border border-line text-body text-left outline-none focus:border-accent disabled:opacity-60 cursor-pointer"
        >
          <FileImage size={16} className="text-muted shrink-0" />
          <span className={`truncate ${fileName ? "text-ink" : "text-muted"}`}>
            {fileName ?? t.texture.chooseFileLabel}
          </span>
        </button>

        {isOversized && sourceSizeBytes !== null && (
          <div className="flex flex-col gap-2 p-3 rounded-sm border border-yellow-500/40 bg-yellow-500/10">
            <div className="flex items-start gap-2">
              <TriangleAlert size={16} className="text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-caption text-yellow-100">
                {t.texture.oversizeWarning(formatMb(sourceSizeBytes))}
              </p>
            </div>
            <label className="flex items-center gap-2 text-caption text-ink cursor-pointer pl-1">
              <input
                type="checkbox"
                checked={acknowledgedOversize}
                onChange={(e) => setAcknowledgedOversize(e.target.checked)}
                disabled={isSubmitting}
              />
              {t.texture.oversizeAcknowledge}
            </label>
          </div>
        )}
      </div>
      {error && <p className="text-caption text-red-400 mt-2">{error}</p>}
      <div className="flex justify-end gap-button-gap mt-4">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          {t.common.cancel}
        </Button>
        <Button variant="primary" onClick={handleConfirm} disabled={!canSubmit}>
          {isSubmitting ? t.texture.importing : t.main.importButton}
        </Button>
      </div>
    </Modal>
  );
}
