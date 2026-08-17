import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { Trash2, Loader2, Check } from "lucide-react";
import { Button } from "../common/Button";
import { useTranslation } from "../../i18n/useTranslation";
import { translateError } from "../../i18n/errors";
import { listTemplates, importCustomTemplate, deleteCustomTemplate } from "../../services/templateService";
import type { TemplateMeta } from "../../types/template";

const ADDED_NOTICE_DURATION_MS = 2000;

/**
 * Templates custom do usuario ficam no nivel do ambiente (nao por
 * projeto), entao o gerenciamento fica em Configuracoes - importar
 * (dialogo nativo) e excluir. Templates embutidos nao aparecem aqui.
 */
export function CustomTemplatesSection() {
  const t = useTranslation();
  const [templates, setTemplates] = useState<TemplateMeta[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddedNotice, setShowAddedNotice] = useState(false);

  const reload = () => {
    listTemplates()
      .then((all) => setTemplates(all.filter((tpl) => tpl.isCustom)))
      .catch((err) => setError(translateError(t, err)));
  };

  useEffect(reload, []);

  // Some sozinho depois de um tempo - nao precisa de interacao do usuario.
  useEffect(() => {
    if (!showAddedNotice) return;
    const timer = setTimeout(() => setShowAddedNotice(false), ADDED_NOTICE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [showAddedNotice]);

  const handleImport = async () => {
    const path = await open({
      multiple: false,
      filters: [{ name: t.texture.pngFilterName, extensions: ["png"] }],
    });
    if (!path || Array.isArray(path)) return;

    const fileName = path.split(/[\\/]/).pop() ?? "template";
    const name = fileName.replace(/\.png$/i, "");

    setIsImporting(true);
    setError(null);
    try {
      await importCustomTemplate(path, name);
      reload();
      setShowAddedNotice(true);
    } catch (err) {
      setError(translateError(t, err));
    } finally {
      setIsImporting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      await deleteCustomTemplate(id);
      reload();
    } catch (err) {
      setError(translateError(t, err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-line">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-body text-ink font-medium">{t.settings.customTemplatesHeading}</h3>
        <Button variant="secondary" onClick={handleImport} disabled={isImporting}>
          {isImporting ? t.texture.importing : t.settings.importTemplateButton}
        </Button>
      </div>

      {showAddedNotice && (
        <p className="flex items-center gap-1.5 text-caption text-accent mb-2">
          <Check size={14} />
          {t.settings.templateAddedNotice}
        </p>
      )}
      {error && <p className="text-caption text-red-400 mb-2">{error}</p>}

      {!templates ? (
        <div className="flex items-center gap-2 text-muted text-body">
          <Loader2 size={16} className="animate-spin" />
          {t.common.loading}
        </div>
      ) : templates.length > 0 ? (
        <ul className="flex flex-col gap-1 max-h-60 overflow-y-auto">
          {templates.map((tpl) => (
            <li key={tpl.id} className="flex items-center justify-between px-2 py-1 rounded-sm hover:bg-canvas">
              <span className="text-body text-ink truncate">{tpl.name}</span>
              <span className="flex items-center gap-3 shrink-0">
                <span className="text-caption text-muted">{tpl.width}x{tpl.height}</span>
                <button
                  type="button"
                  aria-label={t.settings.deleteTemplateAriaLabel(tpl.name)}
                  title={t.settings.deleteTemplateAriaLabel(tpl.name)}
                  disabled={deletingId === tpl.id}
                  onClick={() => handleDelete(tpl.id)}
                  className="text-muted hover:text-red-400 transition-colors cursor-pointer disabled:opacity-40"
                >
                  <Trash2 size={14} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
