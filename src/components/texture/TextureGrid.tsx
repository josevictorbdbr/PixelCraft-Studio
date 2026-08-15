import type { TextureSummary } from "../../types/texture";
import { useTranslation } from "../../i18n/useTranslation";
import { TextureThumbnail } from "./TextureThumbnail";

interface TextureGridProps {
  textures: TextureSummary[];
  selectedTexture: TextureSummary | null;
  onSelectTexture: (texture: TextureSummary | null) => void;
  onOpenTexture: (texture: TextureSummary) => void;
}

function isSameTexture(a: TextureSummary | null, b: TextureSummary): boolean {
  return a !== null && a.category === b.category && a.name === b.name;
}

export function TextureGrid({ textures, selectedTexture, onSelectTexture, onOpenTexture }: TextureGridProps) {
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
          isSelected={isSameTexture(selectedTexture, texture)}
          onSelect={() => onSelectTexture(texture)}
          onOpen={() => onOpenTexture(texture)}
        />
      ))}
    </div>
  );
}
