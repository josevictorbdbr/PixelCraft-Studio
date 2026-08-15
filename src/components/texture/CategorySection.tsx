import { forwardRef } from "react";
import type { TextureSummary } from "../../types/texture";
import { useTranslation } from "../../i18n/useTranslation";
import { TextureGrid } from "./TextureGrid";

interface CategorySectionProps {
  label: string;
  textures: TextureSummary[];
  selectedTexture: TextureSummary | null;
  onSelectTexture: (texture: TextureSummary | null) => void;
  onOpenTexture: (texture: TextureSummary) => void;
}

/** Uma secao "Textures for X" (doc UI/UX, secao 2). `ref` usado para scroll de ancoragem. */
export const CategorySection = forwardRef<HTMLDivElement, CategorySectionProps>(
  ({ label, textures, selectedTexture, onSelectTexture, onOpenTexture }, ref) => {
    const t = useTranslation();
    return (
      <section ref={ref} className="scroll-mt-4">
        <h2 className="text-section-title text-ink mb-3">{t.main.texturesFor(label)}</h2>
        <TextureGrid
          textures={textures}
          selectedTexture={selectedTexture}
          onSelectTexture={onSelectTexture}
          onOpenTexture={onOpenTexture}
        />
      </section>
    );
  },
);
CategorySection.displayName = "CategorySection";
