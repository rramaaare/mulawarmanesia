/**
 * Komponen ChoiceCard: kartu pilihan bergaya radio (satu pilihan dari beberapa).
 * Dipakai di semua pilihan: bahan, pengiriman, skema bayar, dan metode pembayaran,
 * sehingga tampilannya selalu seragam. Terpilih = latar merah muda, garis dan bayangan merah.
 * Saat ditekan, kartu bergeser dan bayangannya hilang (sama seperti tombol).
 */
import { cn } from "@/lib/cn";

interface ChoiceCardProps {
  /** Nama grup radio; semua kartu dalam satu grup memakai nama yang sama. */
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  /** Keterangan kecil di bawah judul. */
  text?: string;
  /** Teks di sisi kanan, mis. harga atau "Tanpa biaya". */
  right?: string;
  /** "sm" = lebih ringkas (dipakai di form padat seperti halaman Pesanan). */
  size?: "md" | "sm";
}

export function ChoiceCard({ name, value, checked, onChange, title, text, right, size = "md" }: ChoiceCardProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center rounded-card border-2 transition-all",
        size === "sm" ? "gap-3 px-3 py-2.5" : "gap-4 p-4",
        "has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-info",
        "active:translate-x-[3px] active:translate-y-[3px] active:shadow-none", // efek ditekan
        checked ? "border-accent bg-accent-subtle shadow-hard-accent-sm" : "border-ink bg-surface shadow-hard-sm",
      )}
    >
      {/* Input asli disembunyikan (tetap bisa diakses keyboard); bulatan di bawah adalah tampilannya */}
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      <span aria-hidden className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-surface">
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        {text && <span className="block text-xs text-ink-muted">{text}</span>}
      </span>
      {right && <span className="shrink-0 text-sm font-medium text-accent">{right}</span>}
    </label>
  );
}
