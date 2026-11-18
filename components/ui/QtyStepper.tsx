"use client";
/**
 * Komponen QtyStepper: tombol − dan + untuk mengatur jumlah (0–999) per ukuran.
 * Angka juga bisa diketik langsung; nilai di luar batas dirapikan otomatis.
 */
interface QtyStepperProps {
  label: string; // nama ukuran, mis. "XL"
  value: number;
  onChange: (value: number) => void;
}

/** Menjaga nilai tetap bilangan bulat antara 0 dan 999. */
function clamp(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(999, Math.max(0, Math.trunc(value)));
}

export function QtyStepper({ label, value, onChange }: QtyStepperProps) {
  const buttonClass =
    "flex h-9 w-9 items-center justify-center rounded-control border-2 border-ink bg-surface text-base font-bold hover:bg-subtle md:h-8 md:w-8";
  return (
    <div className="flex h-[60px] items-center justify-between gap-3 rounded-card border-2 border-ink bg-surface px-3 md:h-auto md:py-1.5">
      <span className="w-12 text-xl font-semibold md:text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" aria-label={`Kurangi ${label}`} className={buttonClass} onClick={() => onChange(clamp(value - 1))}>
          −
        </button>
        <input
          aria-label={`Jumlah ${label}`}
          inputMode="numeric"
          className="w-12 rounded-control border-2 border-ink px-1 py-1 text-center text-base font-semibold md:text-sm"
          value={value}
          onChange={(event) => onChange(clamp(Number(event.target.value.replace(/\D/g, ""))))}
        />
        <button type="button" aria-label={`Tambah ${label}`} className={buttonClass} onClick={() => onChange(clamp(value + 1))}>
          +
        </button>
      </div>
    </div>
  );
}
