import { useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { Trash2 } from "lucide-react";
import type { TextureSummary } from "../../types/texture";
import { placeholderColor } from "../../utils/placeholderColor";
import { useTranslation } from "../../i18n/useTranslation";

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
  const [imageFailed, setImageFailed] = useState(false);

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
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={t.texture.deleteAriaLabel(texture.name)}
          title={t.texture.deleteTooltip}
          className="absolute -top-1.5 -right-1.5 size-5 rounded-sm bg-panel border border-line text-muted hover:text-red-400 hover:border-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          <Trash2 size={11} />
        </button>
      </div>
      <span className="text-caption text-muted text-center truncate w-full">
        {texture.name}
      </span>
    </div>
  );
}
