/**
 * Komponen Tag: label kecil berbentuk pil, mis. status pesanan atau jenis produk.
 * Status selalu disertai teks (bukan hanya warna) agar mudah dibaca semua orang.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "accent" | "success" | "warning" | "info" | "dark";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface text-ink",
  accent: "bg-accent text-white",
  success: "bg-pastel-mint text-ink",
  warning: "bg-pastel-butter text-ink",
  info: "bg-pastel-blue text-ink",
  dark: "bg-ink text-white",
};

export function Tag({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border-2 border-ink px-3 py-0.5 text-xs font-semibold", TONES[tone])}>
      {children}
    </span>
  );
}
