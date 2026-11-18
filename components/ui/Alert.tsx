/**
 * Komponen Alert: kotak pesan di atas halaman (error, info, sukses, peringatan).
 * Memakai role="alert" agar pembaca layar langsung membacakannya. Ikon berupa kotak kecil
 * berwarna dengan satu karakter (i, !, ✓), bukan hanya warna.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "danger" | "info" | "success" | "warning";

const TONES: Record<Tone, { box: string; icon: string; mark: string }> = {
  danger: { box: "bg-accent-subtle", icon: "bg-danger", mark: "!" },
  info: { box: "bg-pastel-blue", icon: "bg-info", mark: "i" },
  success: { box: "bg-pastel-mint", icon: "bg-success", mark: "✓" },
  warning: { box: "bg-pastel-butter", icon: "bg-warning", mark: "!" },
};

export function Alert({ tone = "info", title, children }: { tone?: Tone; title?: string; children?: ReactNode }) {
  return (
    <div role="alert" className={cn("flex items-start gap-3 rounded-card border-2 border-ink p-4 text-sm shadow-hard-sm", TONES[tone].box)}>
      <span
        className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-ink text-xs font-bold text-white", TONES[tone].icon)}
        aria-hidden
      >
        {TONES[tone].mark}
      </span>
      <div className="flex flex-col gap-0.5">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-ink-soft">{children}</div>}
      </div>
    </div>
  );
}
