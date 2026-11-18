/**
 * File ini untuk apa:
 * Blok kecil yang dipakai berulang oleh widget dashboard (tanpa state, jadi aman dipakai di server
 * maupun di komponen client): Chip, StatCard, Panel, BarRow, dan beberapa fungsi pembantu.
 */
import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

/** Selisih persen terhadap periode sebelumnya, mis. "+35%". */
export function changeLabel(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "baru" : "—";
  const percent = Math.round(((current - previous) / previous) * 100);
  return `${percent >= 0 ? "+" : ""}${percent}%`;
}

/** Pil kecil berwarna di kartu angka. */
export function Chip({ tone, children }: { tone: "mint" | "butter" | "red"; children: ReactNode }) {
  const styles = { mint: "bg-pastel-mint", butter: "bg-pastel-butter", red: "bg-accent text-white" }[tone];
  return <span className={cn("shrink-0 rounded-full border-2 border-ink px-2.5 py-0.5 text-xs font-semibold", styles)}>{children}</span>;
}

/** Kartu angka: judul kecil, nilai besar, lalu pil + keterangan. */
export function StatCard({ title, value, chip, note }: { title: string; value: string; chip: ReactNode; note: string }) {
  return (
    <Card className="flex min-w-0 flex-col gap-2 !p-4">
      <p className="text-sm text-ink-soft">{title}</p>
      <p className="text-3xl font-medium tracking-tight">{value}</p>
      <div className="flex flex-wrap items-center gap-2">
        {chip}
        <span className="text-xs text-ink-muted">{note}</span>
      </div>
    </Card>
  );
}

/** Kartu panel dengan judul dan sub-judul. */
export function Panel({ title, subtitle, children, className }: { title: string; subtitle?: string; children: ReactNode; className?: string }) {
  return (
    <Card className={cn("min-w-0 !p-5", className)}>
      <h3 className="text-xl font-medium">{title}</h3>
      {subtitle && <p className="mb-4 mt-0.5 text-xs text-ink-muted">{subtitle}</p>}
      {children}
    </Card>
  );
}

/** Satu baris batang: label, batang tanpa bingkai, nilai. */
export function BarRow({ label, value, max, text, color = "bg-accent", swatch }: { label: string; value: number; max: number; text?: string; color?: string; swatch?: string }) {
  return (
    <div className="grid grid-cols-[minmax(96px,140px)_1fr_auto] items-center gap-3 text-sm">
      <span className="flex min-w-0 items-center gap-2">
        {swatch && <span className="h-3 w-3 shrink-0 rounded-sm border border-ink" style={{ backgroundColor: swatch }} />}
        <span className="leading-tight">{label}</span>
      </span>
      <span className="h-3">
        <span className={cn("block h-full rounded-sm", color)} style={{ width: `${Math.max(2, Math.min(100, (value / (max || 1)) * 100))}%` }} />
      </span>
      <span className="min-w-8 whitespace-pre text-right text-xs font-semibold tabular-nums">{text ?? value}</span>
    </div>
  );
}
