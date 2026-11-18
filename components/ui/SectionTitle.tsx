/**
 * Komponen SectionTitle: judul bagian halaman.
 *  - Tanpa `kicker`: judul diawali panah merah (gaya desain), boleh ada tombol `action` di kanan.
 *  - Dengan `kicker`: teks kecil merah di atas judul (dipakai "Tentang kami" dan "Manifesto").
 * Dipakai di semua section landing agar gayanya seragam.
 */
import type { ReactNode } from "react";

interface SectionTitleProps {
  kicker?: string; // teks kecil di atas judul, mis. "TENTANG KAMI"
  title: string;
  description?: ReactNode;
  /** Tombol/tautan di sisi kanan judul, mis. "Lihat semua katalog". */
  action?: ReactNode;
}

/** Ikon panah merah di depan judul. */
function ArrowIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7 shrink-0 text-accent md:h-8 md:w-8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  );
}

export function SectionTitle({ kicker, title, description, action }: SectionTitleProps) {
  return (
    <div className="flex flex-col gap-3">
      {kicker && <p className="text-xs font-semibold uppercase tracking-widest text-accent">{kicker}</p>}
      <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:justify-between">
        {/* Dengan kicker, lebar judul dibatasi agar terpecah dua baris seperti di desain */}
        <h2 className={`flex items-center gap-3 text-[28px] font-medium leading-tight tracking-tight md:text-4xl ${kicker ? "max-w-[440px]" : ""}`}>
          {!kicker && <ArrowIcon />}
          {title}
        </h2>
        {action}
      </div>
      {description && <p className="max-w-3xl text-sm text-ink-soft md:text-base">{description}</p>}
    </div>
  );
}
