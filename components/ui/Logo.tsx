/**
 * Komponen Logo: huruf "M" dalam kotak merah + nama "mulawarmanesia". Tautan ke beranda
 * (atau ke `href` lain, mis. Dashboard di panel admin).
 * `compact` hanya menampilkan kotak "M" (dipakai saat sidebar admin diperkecil).
 */
import Link from "next/link";

export function Logo({
  inverse = false,
  compact = false,
  href = "/",
  label = "MULAWARMANESIA, ke beranda",
}: {
  inverse?: boolean;
  compact?: boolean;
  /** Tujuan tautan logo. */
  href?: string;
  /** Nama tautan untuk pembaca layar. */
  label?: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-2.5" aria-label={label}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control border-2 border-ink bg-accent text-lg font-bold text-white shadow-hard-sm">
        M
      </span>
      {!compact && <span className={inverse ? "text-lg font-semibold text-white" : "text-lg font-semibold"}>mulawarmanesia</span>}
    </Link>
  );
}
