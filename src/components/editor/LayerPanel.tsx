import { useTranslation } from "../../i18n/useTranslation";

/** So existe a camada "Base" na v1 (doc de arquitetura, secao 6 - Layer ja
 * modelada para o futuro, mas sem UI de multiplas camadas ainda). */
export function LayerPanel() {
  const t = useTranslation();

  return (
    <div>
      <h3 className="text-caption text-muted tracking-wide mb-2">{t.editor.layersHeading}</h3>
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-sm bg-panel border border-accent/40 text-body text-ink">
        {t.editor.baseLayerName}
      </div>
    </div>
  );
}
