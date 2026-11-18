/**
 * StickyBar: bilah bawah yang menempel di layar HP (hanya mobile) berisi satu angka kecil
 * (mis. "Estimasi / pcs" + harga) dan satu tombol aksi. Tingginya 75px sesuai desain Figma.
 * Desktop tidak memakainya karena ringkasan harga sudah ada di kartu samping.
 */
import type { ReactNode } from "react";

interface StickyBarProps {
  /** Teks kecil di atas angka, mis. "Estimasi / pcs". */
  label: string;
  /** Angka/nilai utama, mis. "Rp 200.000". */
  value: string;
  /** Tombol aksi di kanan (mis. <Button>Lanjut →</Button>). */
  action: ReactNode;
}

export function StickyBar({ label, value, action }: StickyBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex h-[75px] items-center justify-between gap-3 border-t-2 border-ink bg-surface px-4 print:hidden lg:hidden">
      <div className="min-w-0">
        <p className="text-xs text-ink-muted">{label}</p>
        <p className="truncate text-lg font-semibold text-accent">{value}</p>
      </div>
      {action}
    </div>
  );
}
