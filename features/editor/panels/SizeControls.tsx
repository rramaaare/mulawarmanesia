"use client";
/**
 * SizeControls: tombol ukuran cepat (Kecil/Sedang/Besar), balik kiri-kanan/atas-bawah, dan "Reset posisi"
 * untuk satu logo/teks.
 * Ukuran juga bisa diubah dengan menarik pegangan di gambar baju; tombol ini menyorot ukuran terdekat.
 */
import { cn } from "@/lib/cn";
import { SIZE_PRESETS, clampScale, type OverlayAdjust } from "../garment-data";

interface SizeControlsProps {
  adjust: OverlayAdjust;
  /** Nama item untuk pembaca layar, mis. "logo.png" atau "HIMA TI". */
  name: string;
  onChange: (patch: OverlayAdjust) => void;
}

export function SizeControls({ adjust, name, onChange }: SizeControlsProps) {
  const scale = clampScale(adjust.scale);
  const nearest = SIZE_PRESETS.reduce((best, preset) => (Math.abs(preset.scale - scale) < Math.abs(best.scale - scale) ? preset : best));
  const changed = scale !== 1 || Boolean(adjust.offsetX) || Boolean(adjust.offsetY) || Boolean(adjust.flipX) || Boolean(adjust.flipY);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="flex gap-1" role="group" aria-label={`Ukuran ${name}`}>
        {SIZE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            aria-pressed={preset === nearest}
            onClick={() => onChange({ scale: preset.scale })}
            className={cn(
              "rounded-full border-2 border-ink px-2.5 py-0.5 text-xs font-semibold",
              preset === nearest ? "bg-ink text-white" : "bg-surface hover:bg-subtle",
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <span className="text-xs tabular-nums text-ink-muted">{Math.round(scale * 100)}%</span>
      <div className="flex gap-1" role="group" aria-label={`Balik ${name}`}>
        <button
          type="button"
          aria-pressed={Boolean(adjust.flipX)}
          aria-label="Balik kiri-kanan"
          title="Balik kiri-kanan"
          onClick={() => onChange({ flipX: !adjust.flipX })}
          className={cn("rounded-full border-2 border-ink px-2 py-0.5 text-xs font-semibold", adjust.flipX ? "bg-ink text-white" : "bg-surface hover:bg-subtle")}
        >
          ↔ Balik
        </button>
        <button
          type="button"
          aria-pressed={Boolean(adjust.flipY)}
          aria-label="Balik atas-bawah"
          title="Balik atas-bawah"
          onClick={() => onChange({ flipY: !adjust.flipY })}
          className={cn("rounded-full border-2 border-ink px-2 py-0.5 text-xs font-semibold", adjust.flipY ? "bg-ink text-white" : "bg-surface hover:bg-subtle")}
        >
          ↕ Balik
        </button>
      </div>
      {changed && (
        <button type="button" onClick={() => onChange({ offsetX: 0, offsetY: 0, scale: 1, flipX: false, flipY: false })} className="ml-auto text-xs font-semibold text-accent underline">
          Reset posisi
        </button>
      )}
    </div>
  );
}
