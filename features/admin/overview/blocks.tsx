/**
 * File ini untuk apa:
 * Blok-blok kecil penyusun dashboard (semuanya komponen server, tanpa state):
 *  - OverviewBanner : banner sambutan di paling atas
 *  - SectionHeader  : judul bagian (ikon + judul + subjudul + garis bawah)
 *  - MetricCard     : kartu angka (label kecil, angka besar, keterangan, kotak ikon berwarna)
 */
import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { OverviewIcon, type IconName } from "./icons";

/** Banner sambutan: kartu hitam dengan bayangan merah, nama di kiri, tanggal di kanan. */
export function OverviewBanner({ name, dateText }: { name: string; dateText: string }) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-card border-2 border-ink bg-ink p-6 text-white shadow-[6px_6px_0_0_#c12822] md:p-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-medium tracking-tight md:text-4xl">Selamat datang kembali, {name}!</h1>
        <p className="mt-2 text-sm text-disabled">Pantau pesanan, produksi, dan pembayaran MULAWARMANESIA dalam satu halaman.</p>
      </div>
      <span className="flex items-center gap-2 rounded-full border-2 border-white/30 bg-white/10 px-4 py-2 text-sm font-medium">
        <OverviewIcon name="clock" className="h-4 w-4" />
        {dateText}
      </span>
    </section>
  );
}

/** Judul bagian: kotak ikon, judul, subjudul, garis di bawahnya, dan (opsional) tombol aksi di kanan. */
export function SectionHeader({ icon, title, subtitle, action }: { icon: IconName; title: string; subtitle: string; action?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-center gap-4 border-b-2 border-ink pb-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control border-2 border-ink bg-pastel-butter shadow-hard-sm">
        <OverviewIcon name={icon} className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <h2 className="text-2xl font-medium">{title}</h2>
        <p className="text-sm text-ink-soft">{subtitle}</p>
      </div>
      {action}
    </header>
  );
}

/** Warna latar kotak ikon pada kartu angka. */
const ICON_TONES = {
  grey: "bg-subtle",
  mint: "bg-pastel-mint",
  rose: "bg-accent-subtle",
  blue: "bg-pastel-blue",
  butter: "bg-pastel-butter",
  peach: "bg-pastel-peach",
} as const;
export type MetricTone = keyof typeof ICON_TONES;

/** Kartu angka: label kapital kecil, angka besar, keterangan, dan kotak ikon di kanan. */
export function MetricCard({ label, value, caption, icon, tone }: { label: string; value: string | number; caption: string; icon: IconName; tone: MetricTone }) {
  return (
    <Card className="flex min-w-0 items-center justify-between gap-4 !p-5">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">{label}</p>
        <p className="mt-1 text-3xl font-medium tracking-tight tabular-nums">{typeof value === "number" ? value.toLocaleString("id-ID") : value}</p>
        <p className="mt-0.5 text-[11px] text-ink-muted">{caption}</p>
      </div>
      <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-control border-2 border-ink", ICON_TONES[tone])}>
        <OverviewIcon name={icon} className="h-6 w-6" />
      </span>
    </Card>
  );
}
