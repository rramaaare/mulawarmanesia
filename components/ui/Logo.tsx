/**
 * Komponen Logo: huruf "M" dalam kotak merah + nama "mulawarmanesia". Tautan ke beranda.
 * `compact` hanya menampilkan kotak "M" (dipakai saat sidebar admin diperkecil).
 */
import Link from "next/link";

export function Logo({ inverse = false, compact = false }: { inverse?: boolean; compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="MULAWARMANESIA, ke beranda">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control border-2 border-ink bg-accent text-lg font-bold text-white shadow-hard-sm">
        M
      </span>
      {!compact && <span className={inverse ? "text-lg font-semibold text-white" : "text-lg font-semibold"}>mulawarmanesia</span>}
    </Link>
  );
}
