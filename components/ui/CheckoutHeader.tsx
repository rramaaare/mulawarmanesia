/**
 * Komponen CheckoutHeader: bilah atas khusus alur pemesanan (Pesanan, Pembayaran, Selesai).
 * Berisi logo, indikator 4 langkah (Desain → Pesanan → Pembayaran → Selesai), dan nomor bantuan.
 * `step` = langkah yang sedang berjalan (1 sampai 4); langkah sebelumnya ditandai centang.
 */
import { cn } from "@/lib/cn";
import { Logo } from "./Logo";

const STEPS = ["Desain", "Pesanan", "Pembayaran", "Selesai"] as const;

export function CheckoutHeader({ step, className }: { step: 1 | 2 | 3 | 4; className?: string }) {
  return (
    <header className={cn("sticky top-0 z-40 border-b-2 border-ink bg-surface print:hidden", className)}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Logo />

        {/* Mobile: satu pil ringkas "Langkah 2/4" (tanpa nama langkah) */}
        <p className="rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-white md:hidden">Langkah {step}/4</p>

        {/* Indikator langkah (tablet ke atas) */}
        <ol className="hidden items-center gap-2 text-sm md:flex" aria-label="Langkah pemesanan">
          {STEPS.map((label, index) => {
            const number = index + 1;
            const done = number < step;
            const current = number === step;
            return (
              <li key={label} className="flex items-center gap-2" aria-current={current ? "step" : undefined}>
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border-2 text-[11px] font-semibold",
                    done && "border-ink bg-ink text-white",
                    current && "border-ink bg-accent text-white",
                    !done && !current && "border-line text-ink-muted",
                  )}
                >
                  {done ? "✓" : number}
                </span>
                <span className={cn("hidden md:inline", current ? "font-semibold" : done ? "font-medium" : "text-ink-muted")}>{label}</span>
                {number < STEPS.length && <span className={cn("hidden h-0.5 w-6 md:block", done ? "bg-ink" : "bg-line")} aria-hidden />}
              </li>
            );
          })}
        </ol>

        <p className="hidden text-[11px] text-ink-soft lg:block">Bantuan: WA 0812 5555 0199</p>
      </div>
    </header>
  );
}
