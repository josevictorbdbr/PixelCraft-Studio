import { useEffect, useState } from "react";
import { LayoutTemplate, Loader2 } from "lucide-react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { useTranslation } from "../../i18n/useTranslation";
import { translateError } from "../../i18n/errors";
import { listTemplates, getTemplatePixels } from "../../services/templateService";
import type { TemplateMeta } from "../../types/template";
import { PixelEditorEngine, MAX_LAYERS } from "../../editor/PixelEditorEngine";

interface TemplatePickerProps {
  engine: PixelEditorEngine;
}

/** Rotulo exibido: embutido usa `t.templates[id]` (fallback pra id crua se
 * a traducao ainda nao foi cadastrada); custom usa o nome literal. */
function displayName(template: TemplateMeta, t: ReturnType<typeof useTranslation>): string {
  if (template.isCustom) return template.name;
  return t.templates[template.name] ?? template.name;
}

/**
 * Botao acima do seletor de cor que abre a lista (unica, sem categoria) de
 * templates base. Selecionar um adiciona-o como camada nova - bloqueado no
 * mesmo MAX_LAYERS das outras acoes de camada, reusando layer_limit_reached.
 */
export function TemplatePicker({ engine }: TemplatePickerProps) {
  const t = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [templates, setTemplates] = useState<TemplateMeta[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  const layerLimitReached = engine.layers.length >= MAX_LAYERS;

  useEffect(() => {
    if (!isOpen || templates) return;
    listTemplates()
      .then(setTemplates)
      .catch((err) => setLoadError(translateError(t, err)));
  }, [isOpen, templates, t]);

  const handleSelect = async (template: TemplateMeta) => {
    if (layerLimitReached) return;
    setApplyingId(template.id);
    setApplyError(null);
    try {
      const pixels = await getTemplatePixels(template.id, engine.width, engine.height);
      engine.addLayerFromTemplate(displayName(template, t), pixels);
      setIsOpen(false);
    } catch (err) {
      setApplyError(translateError(t, err));
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <>
      <Button variant="secondary" className="w-full justify-center" onClick={() => setIsOpen(true)}>
        <LayoutTemplate size={16} />
        {t.editor.templatesButton}
      </Button>

      {isOpen && (
        <Modal title={t.editor.templatesDialogTitle} onClose={() => setIsOpen(false)} widthClassName="w-96">
          {layerLimitReached && (
            <p className="text-caption text-red-400 mb-3">{t.errors.layer_limit_reached({ max: String(MAX_LAYERS) })}</p>
          )}
          {applyError && <p className="text-caption text-red-400 mb-3">{applyError}</p>}

          {loadError ? (
            <p className="text-body text-red-400">{loadError}</p>
          ) : !templates ? (
            <div className="flex items-center gap-2 text-muted text-body">
              <Loader2 size={16} className="animate-spin" />
              {t.common.loading}
            </div>
          ) : templates.length === 0 ? (
            <p className="text-body text-muted">{t.editor.templatesEmpty}</p>
          ) : (
            <ul className="flex flex-col gap-1 max-h-80 overflow-y-auto">
              {templates.map((template) => (
                <li key={template.id}>
                  <button
                    type="button"
                    disabled={layerLimitReached || applyingId !== null}
                    onClick={() => handleSelect(template)}
                    className="w-full text-left px-3 py-2 rounded-sm text-body text-ink hover:bg-canvas transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-between gap-3"
                  >
                    <span className="truncate">{displayName(template, t)}</span>
                    <span className="text-caption text-muted shrink-0">
                      {applyingId === template.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        `${template.width}x${template.height}`
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}
    </>
  );
}
