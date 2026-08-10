import { useTranslation } from "../../i18n/useTranslation";

interface ColorPaletteProps {
  activeColor: string;
  activeAlpha: number;
  onOpenPicker: () => void;
}

/**
 * Cor ativa: um quadrado (branco por padrao) que abre o seletor de cores
 * completo ao ser clicado. Fundo em xadrez atras mostra a opacidade.
 */
export function ColorPalette({ activeColor, activeAlpha, onOpenPicker }: ColorPaletteProps) {
  const t = useTranslation();

  return (
    <div>
      <h3 className="text-caption text-muted tracking-wide mb-2">{t.editor.colorHeading}</h3>
      <button
        type="button"
        onClick={onOpenPicker}
        aria-label={t.editor.selectColorAriaLabel}
        title={t.editor.colorPickerTooltip(activeColor.toUpperCase())}
        className="size-10 rounded-sm border border-line hover:border-accent transition-colors cursor-pointer overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(45deg, #2a2a2a 25%, transparent 25%), linear-gradient(-45deg, #2a2a2a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2a2a2a 75%), linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)",
          backgroundSize: "8px 8px",
          backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
        }}
      >
        <div
          className="size-full"
          style={{ backgroundColor: activeColor, opacity: activeAlpha / 255 }}
        />
      </button>
    </div>
  );
}
