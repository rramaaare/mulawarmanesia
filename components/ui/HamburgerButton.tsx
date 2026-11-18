"use client";
/**
 * HamburgerButton: tombol menu mobile berupa kotak gelap 40x40 dengan tiga garis (jadi "X" saat terbuka).
 * Dipakai di Navbar situs dan topbar admin supaya bentuknya sama (sesuai desain Figma mobile).
 */
import { cn } from "@/lib/cn";

interface HamburgerButtonProps {
  open: boolean;
  onClick: () => void;
  /** id elemen menu yang dikendalikan (untuk aria-controls). */
  controls?: string;
  className?: string;
}

export function HamburgerButton({ open, onClick, controls, className }: HamburgerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={open ? "Tutup menu" : "Buka menu"}
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border-2 border-ink bg-ink shadow-[3px_3px_0_0_#c12822] transition-all",
        "active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        className,
      )}
    >
      <span className="relative block h-[14px] w-[18px]" aria-hidden>
        <span className={cn("absolute left-0 h-0.5 w-full rounded bg-white transition-all", open ? "top-[6px] rotate-45" : "top-0")} />
        <span className={cn("absolute left-0 top-[6px] h-0.5 w-full rounded bg-white transition-opacity", open && "opacity-0")} />
        <span className={cn("absolute left-0 h-0.5 w-full rounded bg-white transition-all", open ? "top-[6px] -rotate-45" : "top-[12px]")} />
      </span>
    </button>
  );
}
