import { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { useTranslation } from "../../i18n/useTranslation";

const MIN_RESOLUTION = 16;
const MAX_RESOLUTION = 1024;

interface ResizeTextureDialogProps {
  initialWidth: number;
  initialHeight: number;
  onConfirm: (width: number, height: number) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  error: string | null;
}

function clamp(value: number): number {
  if (!Number.isFinite(value)) return MIN_RESOLUTION;
  return Math.min(MAX_RESOLUTION, Math.max(MIN_RESOLUTION, Math.round(value)));
}

export function ResizeTextureDialog({
  initialWidth,
  initialHeight,
  onConfirm,
  onCancel,
  isSubmitting,
  error,
}: ResizeTextureDialogProps) {
  const t = useTranslation();
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);

  const unchanged = width === initialWidth && height === initialHeight;

  const handleConfirm = () => {
    if (!isSubmitting && !unchanged) onConfirm(width, height);
  };

  return (
    <Modal title={t.editor.resizeDialogTitle} onClose={onCancel}>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-caption text-muted">
            {t.editor.widthLabel}
            <input
              type="number"
              min={MIN_RESOLUTION}
              max={MAX_RESOLUTION}
              value={width}
              disabled={isSubmitting}
              onChange={(e) => setWidth(clamp(Number(e.target.value)))}
              className="h-8 px-2 rounded-sm bg-canvas border border-line text-ink text-body outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1 text-caption text-muted">
            {t.editor.heightLabel}
            <input
              type="number"
              min={MIN_RESOLUTION}
              max={MAX_RESOLUTION}
              value={height}
              disabled={isSubmitting}
              onChange={(e) => setHeight(clamp(Number(e.target.value)))}
              className="h-8 px-2 rounded-sm bg-canvas border border-line text-ink text-body outline-none focus:border-accent"
            />
          </label>
        </div>
        <p className="text-caption text-muted">
          {t.editor.resizeNote(MIN_RESOLUTION, MAX_RESOLUTION)}
        </p>
      </div>
      {error && <p className="text-caption text-red-400 mt-2">{error}</p>}
      <div className="flex justify-end gap-button-gap mt-4">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          {t.common.cancel}
        </Button>
        <Button variant="primary" onClick={handleConfirm} disabled={isSubmitting || unchanged}>
          {isSubmitting ? t.editor.resizing : t.editor.resizeButton}
        </Button>
      </div>
    </Modal>
  );
}
