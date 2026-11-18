/**
 * Komponen Card: kotak putih bergaris hitam 2 px dengan bayangan keras.
 *  - `tone`      : warna latar (pastel) untuk kartu statistik/ilustrasi.
 *  - `shadow`    : ukuran bayangan ("md" besar, "sm" kecil untuk kartu di dalam kartu, "accent" merah).
 *  - `pressable` : kartu bisa diklik; saat ditekan bergeser 3 px dan bayangannya hilang
 *                  (sama seperti tombol), jadi terasa "ditekan".
 */
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "white" | "blue" | "mint" | "butter" | "peach" | "pink" | "blush";
type Shadow = "md" | "sm" | "accent";

const TONES: Record<Tone, string> = {
  white: "bg-surface",
  blush: "bg-blush",
  blue: "bg-pastel-blue",
  mint: "bg-pastel-mint",
  butter: "bg-pastel-butter",
  peach: "bg-pastel-peach",
  pink: "bg-accent-subtle",
};

const SHADOWS: Record<Shadow, string> = {
  md: "shadow-hard",
  sm: "shadow-hard-sm",
  accent: "shadow-hard-accent-sm",
};

/** Efek ditekan: geser ke arah bayangan lalu bayangan hilang. */
const PRESS = "cursor-pointer transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  /** Hilangkan bayangan sama sekali. */
  flat?: boolean;
  shadow?: Shadow;
  pressable?: boolean;
}

export function Card({ tone = "white", flat = false, shadow = "md", pressable = false, className, ...rest }: CardProps) {
  return (
    <div
      className={cn("rounded-card border-2 border-ink p-5", TONES[tone], !flat && SHADOWS[shadow], pressable && PRESS, className)}
      {...rest}
    />
  );
}
