import { Minus, Plus, Grid3x3 } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";

interface ZoomControlProps {
  zoom: number;
  showGrid: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleGrid: () => void;
}

/** Controle de zoom + toggle de grid (doc UI/UX, secao 3). */
export function ZoomControl({ zoom, showGrid, onZoomIn, onZoomOut, onToggleGrid }: ZoomControlProps) {
  const t = useTranslation();

  return (
    <div className="flex items-center gap-3 px-3 py-2 border-t border-line shrink-0">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onZoomOut}
          aria-label={t.editor.zoomOutAriaLabel}
          className="size-7 flex items-center justify-center rounded-sm text-muted hover:text-ink hover:bg-panel transition-colors cursor-pointer"
        >
          <Minus size={14} />
        </button>
        <span className="text-caption text-muted w-14 text-center tabular-nums">
          {t.editor.zoomLabel(zoom)}
        </span>
        <button
          type="button"
          onClick={onZoomIn}
          aria-label={t.editor.zoomInAriaLabel}
          className="size-7 flex items-center justify-center rounded-sm text-muted hover:text-ink hover:bg-panel transition-colors cursor-pointer"
        >
          <Plus size={14} />
        </button>
      </div>

      <button
        type="button"
        onClick={onToggleGrid}
        className={`flex items-center gap-1.5 px-2 h-7 rounded-sm text-caption transition-colors cursor-pointer ${
          showGrid ? "text-accent bg-accent/15" : "text-muted hover:text-ink hover:bg-panel"
        }`}
      >
        <Grid3x3 size={14} />
        Grid: {showGrid ? t.editor.gridOn : t.editor.gridOff}
      </button>
    </div>
  );
}
