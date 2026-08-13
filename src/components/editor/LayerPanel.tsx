import { useTranslation } from "../../i18n/useTranslation";
import { MAX_LAYERS, type PixelEditorEngine } from "../../editor/PixelEditorEngine";

interface LayerPanelProps {
  engine: PixelEditorEngine;
}

/**
 * Lista de camadas: topo da lista = topo visual (layers[0]). Cada linha
 * tem visibilidade, nome editavel, opacidade, reordenar e excluir. O
 * componente pai re-renderiza via engine.onChange - aqui e so leitura
 * direta de engine.layers a cada render, sem estado proprio.
 */
export function LayerPanel({ engine }: LayerPanelProps) {
  const t = useTranslation();
  const layers = engine.layers;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-caption text-muted tracking-wide">{t.editor.layersHeading}</h3>
        <button
          type="button"
          onClick={() => engine.addLayer()}
          disabled={layers.length >= MAX_LAYERS}
          className="text-caption text-accent hover:text-accent/80 disabled:text-muted disabled:cursor-not-allowed"
        >
          + {t.editor.addLayerButton}
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {layers.map((layer, index) => {
          const isActive = layer.id === engine.activeLayerId;
          return (
            <div
              key={layer.id}
              onClick={() => engine.setActiveLayerId(layer.id)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-sm border text-body cursor-pointer ${
                isActive ? "bg-panel border-accent/40 text-ink" : "border-transparent text-muted hover:bg-panel/60"
              }`}
            >
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); engine.setLayerVisible(layer.id, !layer.visible); }}
                aria-label={t.editor.toggleLayerVisibilityAriaLabel(layer.name)}
                className={`shrink-0 w-4 text-center ${layer.visible ? "" : "opacity-30"}`}
              >
                👁
              </button>

              <span className="flex-1 min-w-0 truncate">{layer.name}</span>

              <input
                type="range"
                min={0}
                max={100}
                value={layer.opacity}
                onChange={(e) => engine.setLayerOpacity(layer.id, Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                aria-label={t.editor.opacityLabel}
                className="w-14 shrink-0"
              />

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); engine.moveLayerUp(layer.id); }}
                disabled={index === 0}
                aria-label={t.editor.moveLayerUpAriaLabel}
                className="shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); engine.moveLayerDown(layer.id); }}
                disabled={index === layers.length - 1}
                aria-label={t.editor.moveLayerDownAriaLabel}
                className="shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ↓
              </button>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); engine.deleteLayer(layer.id); }}
                disabled={layers.length <= 1}
                aria-label={t.editor.deleteLayerAriaLabel(layer.name)}
                className="shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                🗑
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
