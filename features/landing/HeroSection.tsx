/**
 * HeroSection: bagian pembuka landing dengan lapisan paralaks (PRD §8.1).
 *   L1 teks latar "PDH / VEST" bertumpuk (0.2×) · L2 kartu PDH (0.5×)
 *   L3 kartu VEST (0.8×) · L4 judul + tombol (1.0×, memudar saat di-scroll)
 * Panel kanan memakai posisi persentase di dalam kotak berukuran tetap-rasio, sehingga
 * seluruh desain (termasuk teks latar) selalu tampil utuh dan tidak terpotong di layar apa pun.
 */
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Garment } from "@/components/Garment";
import { ParallaxLayer } from "@/components/ParallaxLayer";
import { PDH_RED, VEST_BLACK } from "./garment-colors";

/** Tiga angka singkat di bawah tombol. */
const FACTS = [
  { value: "12 pcs", label: "minimal order" },
  { value: "10–14 hari", label: "waktu produksi" },
  { value: "Bordir & sablon", label: "di workshop sendiri" },
];

export function HeroSection() {
  return (
    <section className="relative">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-12 pt-4 md:px-8 md:pt-6 lg:grid-cols-[1fr_620px] lg:gap-6">
        {/* L4: teks + tombol (kecepatan normal, memudar setelah 600 px scroll) */}
        <ParallaxLayer speed={1} fadeOut className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-wrap gap-2">
            <Tag tone="accent">PO Batch November</Tag>
            <Tag>Workshop Samarinda</Tag>
          </div>
          <h1 className="text-5xl font-medium uppercase leading-[1.05] tracking-[-0.03em] md:text-[64px]">
            Seragam
            <br />
            <span className="text-accent">Tanpa</span>
            <br />
            Kompromi
          </h1>
          <p className="max-w-md text-[15px] leading-relaxed text-ink-soft">
            Desain PDH &amp; VEST organisasimu sendiri: pilih model, atur warna tiap bagian, tambah logo dan teks. Kami produksi rapi di workshop Samarinda.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button href="/editor" size="lg">Mulai Custom →</Button>
            <Button href="#katalog" variant="secondary" size="lg">Lihat Katalog</Button>
          </div>
          <dl className="flex flex-wrap gap-x-12 gap-y-4 pt-2">
            {FACTS.map((fact) => (
              <div key={fact.label}>
                <dt className="text-lg font-semibold">{fact.value}</dt>
                <dd className="text-xs text-ink-muted">{fact.label}</dd>
              </div>
            ))}
          </dl>
        </ParallaxLayer>

        {/* Panel ilustrasi: kotak rasio tetap, semua elemen memakai posisi persen */}
        <div className="@container relative mx-auto aspect-[415/387] w-full max-w-[620px]">
          {/* L1: teks latar raksasa bertumpuk, paling lambat. Ukuran font = % lebar kotak. */}
          <ParallaxLayer speed={0.2} fromTop mobile className="pointer-events-none absolute left-[33%] top-0 select-none">
            <span className="block text-[27cqw] font-semibold leading-[0.86] text-salmon" aria-hidden>
              PDH
              <br />
              VEST
            </span>
          </ParallaxLayer>

          {/* L2: kartu PDH (0.5×, miring tipis) */}
          <ParallaxLayer speed={0.5} rotateTo={-2} fromTop mobile className="absolute left-[7%] top-[12%] z-10 w-[49%]">
            <Card tone="blue" className="!p-[5%] shadow-hard-lg">
              <Garment product="PDH" colors={PDH_RED} className="w-full" />
            </Card>
          </ParallaxLayer>

          {/* L3: kartu VEST (0.8×) menutup sudut kanan-bawah kartu PDH */}
          <ParallaxLayer speed={0.8} fromTop className="absolute left-[44%] top-[37%] z-20 w-[49%]">
            <Card tone="butter" className="!p-[5%] shadow-hard-lg">
              <Garment product="VEST" colors={VEST_BLACK} className="w-full" />
            </Card>
          </ParallaxLayer>

          {/* Tag melayang (tanpa paralaks) */}
          <span className="absolute left-[51%] top-[33%] z-30 rounded-full bg-ink px-3 py-1 text-[10px] font-medium text-white md:text-[11px]">
            Warna tiap bagian bebas diatur
          </span>
          <span className="absolute left-[12%] top-[73.5%] z-30 rounded-full border-2 border-ink bg-accent px-3 py-0.5 text-[10px] font-medium text-white md:text-[11px]">
            Bordir dada kiri
          </span>
        </div>
      </div>
    </section>
  );
}
