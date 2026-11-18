/**
 * ProfileSection: cerita singkat bisnis + 4 statistik. Angka "2019" besar di latar
 * (warna merah muda) bergerak paralaks 0.4× dan berada di dalam area konten, jadi tidak terpotong.
 */
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CountUp } from "@/components/CountUp";
import { ParallaxLayer } from "@/components/ParallaxLayer";

/** Statistik bisnis (dummy, ganti dengan angka asli). */
const STATS = [
  { value: "1.200+", label: "pcs diproduksi per bulan", tone: "blue" },
  { value: "180+", label: "organisasi & instansi", tone: "blush" },
  { value: "10–14", label: "hari kerja produksi", tone: "mint" },
  { value: "12 pcs", label: "minimal order", tone: "peach" },
] as const;

export function ProfileSection() {
  return (
    <section className="relative">
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 md:px-8 md:py-16 lg:grid-cols-2">
        {/* Angka latar: di dalam kolom konten, di belakang teks dan kartu statistik */}
        <ParallaxLayer speed={0.4} className="pointer-events-none absolute left-[38%] top-4 z-0 hidden select-none lg:block">
          <span className="block text-[clamp(160px,19vw,290px)] font-semibold leading-none text-accent-subtle" aria-hidden>
            2019
          </span>
        </ParallaxLayer>

        <div className="relative z-10 flex flex-col gap-6">
          <SectionTitle kicker="Tentang kami" title="Dari Samarinda untuk barisanmu" />
          <p className="max-w-md text-sm leading-relaxed text-ink-soft">
            Sejak 2019 kami menjahit PDH dan VEST untuk himpunan, komunitas, instansi, dan tim proyek. Potong, jahit, bordir, dan sablon dikerjakan di satu workshop, jadi kualitas dan jadwal kami pegang sendiri.
          </p>
          <Button href="#cara-pesan" variant="dark" className="w-fit">Lihat cara pesan →</Button>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4">
          {STATS.map((stat) => (
            <Card key={stat.label} tone={stat.tone} className="!px-5 !py-6">
              <p className="text-4xl font-medium tracking-tight md:text-[44px]">
                <CountUp value={stat.value} />
              </p>
              <p className="mt-1 text-xs text-ink-soft">{stat.label}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
