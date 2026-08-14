import { useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { Trash2, Download } from "lucide-react";
import type { TextureSummary } from "../../types/texture";
import { placeholderColor } from "../../utils/placeholderColor";
import { useTranslation } from "../../i18n/useTranslation";
import { useProjectStore } from "../../store/useProjectStore";
import { exportTexture } from "../../services/textureService";
import { translateError } from "../../i18n/errors";

interface TextureThumbnailProps {
  texture: TextureSummary;
  onOpen: () => void;
  onDelete: () => void;
}

/**
 * Miniatura 64x64 (doc UI/UX, secao 4). Mostra o PNG real via asset
 * protocol do Tauri; se a imagem falhar ao carregar, cai para um bloco
 * de cor placeholder em vez de quebrar o layout.
 */
export function TextureThumbnail({ texture, onOpen, onDelete }: TextureThumbnailProps) {
  const t = useTranslation();
  const activeProject = useProjectStore((s) => s.activeProject);
  const [imageFailed, setImageFailed] = useState(false);

  const handleExport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeProject) return;

    const destination = await save({
      defaultPath: `${texture.name}.png`,
      filters: [{ name: t.texture.pngFilterName, extensions: ["png"] }],
    });
    if (!destination) return; // usuario cancelou o dialog

    try {
      await exportTexture(activeProject.id, texture.category, texture.name, destination);
    } catch (err) {
      // Sem sistema de toast no projeto ainda - alerta simples por enquanto.
      window.alert(translateError(t, err));
    }
  };

  return (
    <div className="flex flex-col items-center gap-1 w-16 group">
      <div className="relative">
        <button
          type="button"
          onDoubleClick={onOpen}
          title={texture.name}
          className="size-16 rounded-sm overflow-hidden border border-line group-hover:border-accent transition-colors cursor-pointer block"
        >
          {imageFailed ? (
            <div
              className="size-full"
              style={{ backgroundColor: placeholderColor(texture.name) }}
              aria-hidden
            />
          ) : (
            <img
              src={convertFileSrc(texture.path)}
              alt={texture.name}
              className="size-full pixelated object-cover"
              onError={() => setImageFailed(true)}
            />
          )}
        </button>

        <div className="absolute -top-1.5 -right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={handleExport}
            aria-label={t.texture.exportAriaLabel(texture.name)}
            title={t.texture.exportTooltip}
            className="size-5 rounded-sm bg-panel border border-line text-muted hover:text-accent hover:border-accent flex items-center justify-center cursor-pointer"
          >
            <Download size={11} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label={t.texture.deleteAriaLabel(texture.name)}
            title={t.texture.deleteTooltip}
            className="size-5 rounded-sm bg-panel border border-line text-muted hover:text-red-400 hover:border-red-400 flex items-center justify-center cursor-pointer"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
      <span className="text-caption text-muted text-center truncate w-full">
        {texture.name}
      </span>
    </div>
  );
}
