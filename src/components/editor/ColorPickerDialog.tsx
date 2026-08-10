import { useEffect, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { hexToRgba, hsvToRgb, rgbToHex, rgbToHsv } from "../../utils/color";
import { useTranslation } from "../../i18n/useTranslation";

interface ColorPickerDialogProps {
  initialHex: string;
  /** 0-255 */
  initialAlpha: number;
  onConfirm: (hex: string, alpha: number) => void;
  onCancel: () => void;
}

/** Le a posicao do ponteiro dentro de um elemento, normalizada 0-1 nos dois eixos. */
function usePointerDrag(onMove: (fracX: number, fracY: number) => void) {
  const handlePointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const fracX = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const fracY = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);
    onMove(fracX, fracY);
  };

  return {
    onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      handlePointer(e);
    },
    onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.buttons === 1) handlePointer(e);
    },
  };
}

function SVSquare({
  hue,
  saturation,
  value,
  onChange,
}: {
  hue: number;
  saturation: number;
  value: number;
  onChange: (s: number, v: number) => void;
}) {
  const drag = usePointerDrag((fracX, fracY) => onChange(fracX * 100, 100 - fracY * 100));

  return (
    <div
      className="relative w-full h-40 rounded-sm cursor-crosshair touch-none select-none"
      style={{
        backgroundColor: `hsl(${hue}, 100%, 50%)`,
        backgroundImage:
          "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)",
      }}
      {...drag}
    >
      <div
        className="absolute size-3 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ left: `${saturation}%`, top: `${100 - value}%` }}
      />
    </div>
  );
}

function HueSlider({ hue, onChange }: { hue: number; onChange: (h: number) => void }) {
  const drag = usePointerDrag((_x, fracY) => onChange(fracY * 360));

  return (
    <div
      className="relative w-5 h-40 rounded-sm cursor-pointer touch-none select-none"
      style={{
        background: "linear-gradient(to bottom, red, yellow, lime, cyan, blue, magenta, red)",
      }}
      {...drag}
    >
      <div
        className="absolute left-0 right-0 h-1.5 -translate-y-1/2 rounded-sm border border-white shadow-md pointer-events-none"
        style={{ top: `${(hue / 360) * 100}%` }}
      />
    </div>
  );
}

function AlphaSlider({
  rgb,
  alphaPct,
  onChange,
}: {
  rgb: [number, number, number];
  alphaPct: number;
  onChange: (a: number) => void;
}) {
  const drag = usePointerDrag((_x, fracY) => onChange(100 - fracY * 100));
  const [r, g, b] = rgb;

  return (
    <div
      className="relative w-5 h-40 rounded-sm cursor-pointer touch-none select-none"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(${r},${g},${b},1), rgba(${r},${g},${b},0)), repeating-conic-gradient(#8a8a8a 0% 25%, #5a5a5a 0% 50%)`,
        backgroundSize: "100% 100%, 8px 8px",
      }}
      {...drag}
    >
      <div
        className="absolute left-0 right-0 h-1.5 -translate-y-1/2 rounded-sm border border-white shadow-md pointer-events-none"
        style={{ top: `${100 - alphaPct}%` }}
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-caption text-muted">
      {label}
      <input
        type="number"
        min={0}
        max={max}
        value={Math.round(value)}
        onChange={(e) => {
          const n = Number(e.target.value);
          onChange(Number.isFinite(n) ? Math.min(max, Math.max(0, n)) : 0);
        }}
        className="h-8 px-2 rounded-sm bg-canvas border border-line text-ink text-body outline-none focus:border-accent"
      />
    </label>
  );
}

/** Seletor de cor completo: quadrado SV + matiz + opacidade + hex/RGB (doc: "faz falta num editor de texturas"). */
export function ColorPickerDialog({
  initialHex,
  initialAlpha,
  onConfirm,
  onCancel,
}: ColorPickerDialogProps) {
  const t = useTranslation();
  const [initR, initG, initB] = hexToRgba(initialHex);
  const [initH, initS, initV] = rgbToHsv(initR, initG, initB);

  const [hue, setHue] = useState(initH);
  const [sat, setSat] = useState(initS);
  const [val, setVal] = useState(initV);
  const [alphaPct, setAlphaPct] = useState(Math.round((initialAlpha / 255) * 100));

  const [r, g, b] = hsvToRgb(hue, sat, val);
  const hex = rgbToHex(r, g, b);

  const [hexInput, setHexInput] = useState(hex);
  useEffect(() => setHexInput(hex), [hex]);

  const applyHexInput = (raw: string) => {
    const clean = raw.trim().replace(/^#/, "");
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
      setHexInput(hex); // entrada invalida: reverte o campo para o valor atual
      return;
    }
    const [nr, ng, nb] = hexToRgba(`#${clean}`);
    const [nh, ns, nv] = rgbToHsv(nr, ng, nb);
    setHue(nh);
    setSat(ns);
    setVal(nv);
  };

  const updateFromRgb = (nr: number, ng: number, nb: number) => {
    const [nh, ns, nv] = rgbToHsv(nr, ng, nb);
    setHue(nh);
    setSat(ns);
    setVal(nv);
  };

  return (
    <Modal title={t.editor.colorPickerTitle} onClose={onCancel} widthClassName="w-[26rem]">
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          <SVSquare hue={hue} saturation={sat} value={val} onChange={(s, v) => { setSat(s); setVal(v); }} />
        </div>
        <HueSlider hue={hue} onChange={setHue} />
        <AlphaSlider rgb={[r, g, b]} alphaPct={alphaPct} onChange={setAlphaPct} />
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <input
          type="text"
          value={hexInput}
          onChange={(e) => setHexInput(e.target.value)}
          onBlur={(e) => applyHexInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyHexInput(hexInput)}
          className="h-[34px] px-3 rounded-sm bg-canvas border border-line text-ink text-body outline-none focus:border-accent uppercase"
        />
        <div className="grid grid-cols-4 gap-2">
          <NumberField label="R" value={r} max={255} onChange={(n) => updateFromRgb(n, g, b)} />
          <NumberField label="G" value={g} max={255} onChange={(n) => updateFromRgb(r, n, b)} />
          <NumberField label="B" value={b} max={255} onChange={(n) => updateFromRgb(r, g, n)} />
          <NumberField label={t.editor.opacityLabel} value={alphaPct} max={100} onChange={setAlphaPct} />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <div
          className="size-8 rounded-sm border border-line shrink-0 pixelated"
          style={{
            backgroundImage:
              "linear-gradient(45deg, #2a2a2a 25%, transparent 25%), linear-gradient(-45deg, #2a2a2a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2a2a2a 75%), linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)",
            backgroundSize: "8px 8px",
            backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
          }}
        >
          <div className="size-full rounded-sm" style={{ backgroundColor: hex, opacity: alphaPct / 100 }} />
        </div>
        <div className="flex-1" />
        <Button variant="secondary" onClick={onCancel}>
          {t.common.cancel}
        </Button>
        <Button
          variant="primary"
          onClick={() => onConfirm(hex, Math.round((alphaPct / 100) * 255))}
        >
          {t.editor.selectButton}
        </Button>
      </div>
    </Modal>
  );
}
