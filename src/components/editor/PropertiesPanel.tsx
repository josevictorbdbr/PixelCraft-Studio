import type { CategoryId } from "../../types/texture";
import { useTranslation } from "../../i18n/useTranslation";

interface PropertiesPanelProps {
  name: string;
  category: CategoryId;
  dimensions: { width: number; height: number } | null;
}

export function PropertiesPanel({ name, category, dimensions }: PropertiesPanelProps) {
  const t = useTranslation();

  return (
    <div>
      <h3 className="text-caption text-muted tracking-wide mb-2">{t.editor.propertiesHeading}</h3>
      <dl className="flex flex-col gap-1.5 text-body">
        <div className="flex justify-between gap-2">
          <dt className="text-muted">{t.editor.nameLabel}</dt>
          <dd className="text-ink truncate">{name}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted">{t.editor.categoryLabel}</dt>
          <dd className="text-ink">{t.categories[category]}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted">{t.editor.resolutionLabel}</dt>
          <dd className="text-ink">
            {dimensions ? `${dimensions.width}x${dimensions.height}` : "..."}
          </dd>
        </div>
      </dl>
    </div>
  );
}
