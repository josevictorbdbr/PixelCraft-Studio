import type { TextureSummary } from "../../types/texture";
import { useTranslation } from "../../i18n/useTranslation";
import { TextureThumbnail } from "./TextureThumbnail";

interface TextureGridProps {
  textures: TextureSummary[];
  onOpenTexture: (texture: TextureSummary) => void;
  onDeleteTexture: (texture: TextureSummary) => void;
}

export function TextureGrid({ textures, onOpenTexture, onDeleteTexture }: TextureGridProps) {
  const t = useTranslation();

  if (textures.length === 0) {
    return <p className="text-caption text-muted">{t.texture.emptyGrid}</p>;
  }

  return (
    <div className="flex flex-wrap gap-thumb-gap">
      {textures.map((texture) => (
        <TextureThumbnail
          key={`${texture.category}/${texture.name}`}
          texture={texture}
          onOpen={() => onOpenTexture(texture)}
          onDelete={() => onDeleteTexture(texture)}
        />
      ))}
    </div>
  );
}
