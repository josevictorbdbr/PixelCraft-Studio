import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { Loader2, Check } from "lucide-react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { useTranslation } from "../../i18n/useTranslation";
import { translateError } from "../../i18n/errors";
import {
  listTemplates,
  importCustomTemplate,
  deleteCustomTemplate,
  hideBuiltinTemplate,
} from "../../services/templateService";
import type { TemplateMeta } from "../../types/template";

interface ManageTemplatesDialogProps {
  onClose: () => void;
}

const ADDED_NOTICE_DURATION_MS = 2000;

/** Rotulo exibido: embutido usa `t.templates[id]` (fallback pra id crua se
 * a traducao ainda nao foi cadastrada); custom usa o nome literal. */
function displayName(template: TemplateMeta, t: ReturnType<typeof useTranslation>): string {
  if (template.isCustom) return template.name;
  return t.templates[template.name] ?? template.name;
}

/**
 * Gerenciar templates (Configuracoes > Gerenciar Templates): lista TODOS
 * (embutidos + custom) com selecao unica + Adicionar (dialogo nativo,
 * sempre custom) + Excluir do selecionado. "Excluir" um embutido nao mexe
 * no bundle - so oculta pra esse usuario (ver hide_builtin no backend);
 * "Excluir" um custom remove o PNG e o manifesto de verdade.
 */
export function ManageTemplatesDialog({ onClose }: ManageTemplatesDialogProps) {
  const t = useTranslation();
  const [templates, setTemplates] = useState<TemplateMeta[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddedNotice, setShowAddedNotice] = useState(false);

  const reload = () => {
    listTemplates()
      .then(setTemplates)
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

  const handleDelete = async () => {
    const selected = templates?.find((tpl) => tpl.id === selectedId);
    if (!selected) return;

    setIsDeleting(true);
    setError(null);
    try {
      if (selected.isCustom) {
        await deleteCustomTemplate(selected.id);
      } else {
        await hideBuiltinTemplate(selected.id);
      }
      setSelectedId(null);
      reload();
    } catch (err) {
      setError(translateError(t, err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal title={t.settings.manageTemplatesDialogTitle} onClose={onClose} widthClassName="w-96">
      {showAddedNotice && (
        <p className="flex items-center gap-1.5 text-caption text-accent mb-2">
          <Check size={14} />
          {t.settings.templateAddedNotice}
        </p>
      )}
      {error && <p className="text-caption text-red-400 mb-2">{error}</p>}

      {!templates ? (
        <div className="flex items-center gap-2 text-muted text-body mb-4">
          <Loader2 size={16} className="animate-spin" />
          {t.common.loading}
        </div>
      ) : templates.length > 0 ? (
        <ul className="flex flex-col gap-1 max-h-60 overflow-y-auto mb-4">
          {templates.map((tpl) => (
            <li key={tpl.id}>
              <button
                type="button"
                onClick={() => setSelectedId(tpl.id === selectedId ? null : tpl.id)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-sm text-left transition-colors cursor-pointer border ${
                  selectedId === tpl.id ? "border-accent bg-accent/10" : "border-transparent hover:bg-canvas"
                }`}
              >
                <span className="text-body text-ink truncate">{displayName(tpl, t)}</span>
                <span className="text-caption text-muted shrink-0">{tpl.width}x{tpl.height}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mb-4" />
      )}

      <div className="flex gap-2">
        <Button variant="secondary" onClick={handleImport} disabled={isImporting} className="flex-1 justify-center">
          {isImporting ? t.texture.importing : t.settings.importTemplateButton}
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={!selectedId || isDeleting}
          className="flex-1 justify-center"
        >
          {t.settings.deleteSelectedTemplateButton}
        </Button>
      </div>
    </Modal>
  );
}
