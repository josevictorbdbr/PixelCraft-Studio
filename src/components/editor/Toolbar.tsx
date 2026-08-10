import {
  Undo2,
  Redo2,
  Pencil,
  Eraser,
  PaintBucket,
  Pipette,
  Slash,
  Square,
  FlipHorizontal2,
  FlipVertical2,
  RotateCw,
  Scaling,
  SquareDashedMousePointer,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import type { Dictionary } from "../../i18n/en";

interface ToolbarItem {
  id: string;
  label: string;
  Icon: LucideIcon;
  /** "tool": fica selecionada/destacada (Lapis, Balde...). "action": acao
   * imediata, sem estado de selecao (Desfazer, Redimensionar...). */
  kind: "tool" | "action";
}

/**
 * Categorias da toolbar (doc de referencia do usuario: icones lado a lado,
 * agrupados por categoria, em vez de uma coluna unica). "Redimensionar"
 * ainda e so a entrada na toolbar - a funcionalidade de verdade chega
 * numa proxima etapa. Labels vem do dicionario i18n (`t`), por isso essa
 * lista e montada dentro do componente, nao como constante de modulo.
 */
function buildToolbarCategories(t: Dictionary): { label: string; items: ToolbarItem[] }[] {
  return [
    {
      label: t.editor.toolbarCategories.general,
      items: [
        { id: "undo", label: t.editor.tools.undo, Icon: Undo2, kind: "action" },
        { id: "redo", label: t.editor.tools.redo, Icon: Redo2, kind: "action" },
      ],
    },
    {
      label: t.editor.toolbarCategories.drawing,
      items: [
        { id: "pencil", label: t.editor.tools.pencil, Icon: Pencil, kind: "tool" },
        { id: "eraser", label: t.editor.tools.eraser, Icon: Eraser, kind: "tool" },
        { id: "bucket", label: t.editor.tools.bucket, Icon: PaintBucket, kind: "tool" },
        { id: "eyedropper", label: t.editor.tools.eyedropper, Icon: Pipette, kind: "tool" },
      ],
    },
    {
      label: t.editor.toolbarCategories.shapes,
      items: [
        { id: "line", label: t.editor.tools.line, Icon: Slash, kind: "tool" },
        { id: "rectangle", label: t.editor.tools.rectangle, Icon: Square, kind: "tool" },
      ],
    },
    {
      label: t.editor.toolbarCategories.transform,
      items: [
        { id: "mirror-h", label: t.editor.tools.mirrorHorizontal, Icon: FlipHorizontal2, kind: "tool" },
        { id: "mirror-v", label: t.editor.tools.mirrorVertical, Icon: FlipVertical2, kind: "tool" },
        { id: "rotate", label: t.editor.tools.rotate, Icon: RotateCw, kind: "tool" },
        { id: "resize", label: t.editor.tools.resize, Icon: Scaling, kind: "action" },
      ],
    },
    {
      label: t.editor.toolbarCategories.selection,
      items: [
        { id: "selection", label: t.editor.tools.selection, Icon: SquareDashedMousePointer, kind: "tool" },
      ],
    },
  ];
}

interface ToolbarProps {
  activeTool: string;
  onSelectTool: (toolId: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onResize: () => void;
}

export function Toolbar({
  activeTool,
  onSelectTool,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onResize,
}: ToolbarProps) {
  const t = useTranslation();
  const toolbarCategories = buildToolbarCategories(t);

  const handleClick = (id: string) => {
    if (id === "undo") onUndo();
    else if (id === "redo") onRedo();
    else if (id === "resize") onResize();
    else onSelectTool(id);
  };

  const isDisabled = (id: string) => (id === "undo" && !canUndo) || (id === "redo" && !canRedo);

  return (
    <nav className="flex-1 py-3 px-2 flex flex-col gap-4 overflow-y-auto">
      {toolbarCategories.map((category) => (
        <div key={category.label}>
          <h3 className="text-caption text-muted tracking-wide mb-1.5 px-0.5">{category.label}</h3>
          <div className="grid grid-cols-2 gap-1">
            {category.items.map(({ id, label, Icon, kind }) => {
              const isActive = kind === "tool" && id === activeTool;
              return (
                <button
                  key={id}
                  type="button"
                  title={label}
                  aria-label={label}
                  disabled={isDisabled(id)}
                  onClick={() => handleClick(id)}
                  className={`size-9 flex items-center justify-center rounded-sm transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                    isActive
                      ? "bg-accent/15 text-accent border border-accent"
                      : "text-muted hover:text-ink hover:bg-panel border border-transparent"
                  }`}
                >
                  <Icon size={16} />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
