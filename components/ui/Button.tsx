/**
 * Komponen Button: tombol bergaya neo-brutalism (garis hitam, bayangan keras).
 * Bila diberi `href`, tampil sebagai tautan; selain itu sebagai <button>.
 * Varian: primary (merah, aksi utama), secondary (putih), dark (hitam dengan dasar merah),
 * ghost (tanpa bingkai). Saat di-hover maupun ditekan, tombol bergeser ke arah bayangannya dan bayangan hilang.
 */
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "dark" | "ghost";
type Size = "sm" | "md" | "lg";

/** Class dasar yang sama untuk semua tombol. */
const BASE =
  "inline-flex items-center justify-center gap-2 rounded-control border-2 border-ink font-semibold transition-all " +
  "disabled:cursor-not-allowed disabled:opacity-60";

/** Efek hover dan ditekan untuk bayangan diagonal 3 px: tombol turun ke arah bayangannya lalu bayangan hilang. */
const PRESS_DIAGONAL =
  "hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none active:translate-x-[3px] active:translate-y-[3px] active:shadow-none";

/** Class khusus tiap varian warna. */
const VARIANTS: Record<Variant, string> = {
  primary: `bg-accent text-white shadow-hard-sm hover:bg-accent-hover ${PRESS_DIAGONAL}`,
  secondary: `bg-surface text-ink shadow-hard-sm hover:bg-subtle ${PRESS_DIAGONAL}`,
  // Dasar merah: bayangan hanya ke bawah (4 px), jadi saat ditekan tombol turun 4 px
  dark: "bg-ink text-white shadow-[0_4px_0_0_#c12822] hover:bg-ink hover:translate-y-[4px] hover:shadow-none active:translate-y-[4px] active:shadow-none",
  ghost: "border-transparent bg-transparent text-ink hover:bg-subtle",
};

/** Class khusus tiap ukuran. */
const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Jika diisi, tombol menjadi tautan ke alamat ini. */
  href?: string;
  children: ReactNode;
}

export function Button({ variant = "primary", size = "md", href, className, children, ...rest }: ButtonProps) {
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);
  if (href) {
    // Tautan ke bagian di halaman (#katalog atau /#katalog) memakai <a> biasa supaya
    // browser langsung meloncat ke section; Link Next.js dipakai untuk pindah halaman.
    if (href.startsWith("#") || href.startsWith("/#")) {
      return (
        <a href={href} className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
