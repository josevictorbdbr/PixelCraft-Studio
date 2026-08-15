import { useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import type { TextureSummary } from "../../types/texture";
import { placeholderColor } from "../../utils/placeholderColor";

interface TextureThumbnailProps {
  texture: TextureSummary;
  isSelected: boolean;
  onSelect: () => void;
  onOpen: () => void;
}

/**
 * Miniatura 64x64 (doc UI/UX, secao 4). Mostra o PNG real via asset
 * protocol do Tauri; se a imagem falhar ao carregar, cai para um bloco
 * de cor placeholder em vez de quebrar o layout.
 *
 * So imagem + nome - nenhum botao de acao aqui (editar/exportar/excluir
 * ficam na barra superior da MainScreen, a esquerda de "Nova Textura",
 * pra nao correr risco de excluir sem querer clicando perto da
 * miniatura). 1 clique seleciona (destaque de borda); 2 cliques abrem.
 */
export function TextureThumbnail({ texture, isSelected, onSelect, onOpen }: TextureThumbnailProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div
      className="flex flex-col items-center gap-1 w-16 cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <button
        type="button"
        onDoubleClick={onOpen}
        title={texture.name}
        className={`size-16 rounded-none overflow-hidden border transition-colors block cursor-pointer ${
          isSelected ? "border-accent" : "border-line hover:border-accent/60"
        }`}
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
      <span className="text-caption text-muted text-center truncate w-full">
        {texture.name}
      </span>
    </div>
  );
}