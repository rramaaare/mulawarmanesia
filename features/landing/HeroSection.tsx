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
      <div className="mx-auto grid max-w-7xl items-center gap-7 px-4 md:gap-12 pb-8 pt-7 md:px-8 md:pt-6 md:pb-12 lg:grid-cols-[1fr_620px] lg:gap-6">
        {/* L4: teks + tombol (kecepatan normal, memudar setelah 600 px scroll) */}
        <ParallaxLayer speed={1} fadeOut className="relative z-10 flex flex-col gap-4 md:gap-6">
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
          <p className="max-w-md text-base leading-relaxed text-ink-soft">
            Desain PDH &amp; VEST organisasimu sendiri: pilih model, atur warna tiap bagian, tambah logo dan teks. Kami produksi rapi di workshop Samarinda.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href="/editor" size="lg" className="w-full sm:w-auto">Mulai Custom →</Button>
            <Button href="#katalog" variant="secondary" size="lg" className="w-full sm:w-auto">Lihat Katalog</Button>
          </div>
          <dl className="grid grid-cols-3 gap-3 pt-2 sm:flex sm:flex-wrap sm:gap-x-12 sm:gap-y-4">
            {FACTS.map((fact) => (
              <div key={fact.label}>
                <dt className="text-base font-semibold sm:text-lg">{fact.value}</dt>
                <dd className="text-xs text-ink-muted">{fact.label}</dd>
              </div>
            ))}
          </dl>
        </ParallaxLayer>

        {/* Panel ilustrasi: kotak rasio tetap, semua elemen memakai posisi persen */}
        <div className="@container relative mx-auto aspect-[350/590] w-full max-w-[620px] md:aspect-[415/387]">
          {/* L1: teks latar raksasa bertumpuk, paling lambat. Ukuran font = % lebar kotak. */}
          <ParallaxLayer speed={0.2} fromTop mobile className="pointer-events-none absolute left-[31%] top-0 select-none md:left-[33%]">
            <span className="block text-[29.7cqw] font-medium leading-[0.86] text-salmon md:text-[27cqw] md:font-semibold" aria-hidden>
              PDH
              <br />
              VEST
            </span>
          </ParallaxLayer>

          {/* L2: kartu PDH (0.5×, miring tipis) */}
          <ParallaxLayer speed={0.5} rotateTo={-2} fromTop mobile className="absolute left-0 top-[6.8%] z-10 w-[85.7%] md:left-[7%] md:top-[12%] md:w-[49%]">
            <Card tone="blue" className="!p-[5%] shadow-hard-lg">
              <Garment product="PDH" colors={PDH_RED} className="w-full" />
            </Card>
          </ParallaxLayer>

          {/* L3: kartu VEST (0.8×) menutup sudut kanan-bawah kartu PDH */}
          <ParallaxLayer speed={0.8} fromTop className="absolute left-[14.3%] top-[44.4%] z-20 w-[85.7%] md:left-[44%] md:top-[37%] md:w-[49%]">
            <Card tone="butter" className="!p-[5%] shadow-hard-lg">
              <Garment product="VEST" colors={VEST_BLACK} className="w-full" />
            </Card>
          </ParallaxLayer>

          {/* Tag melayang (tanpa paralaks) */}
          <span className="absolute left-[28.6%] top-[4%] z-30 rounded-full bg-ink px-3 py-1 text-xs font-medium text-white md:left-[51%] md:top-[33%] md:text-[11px]">
            Warna tiap bagian bebas diatur
          </span>
          <span className="absolute left-[2.9%] top-[50.8%] z-30 rounded-full border-2 border-ink bg-accent px-3 py-0.5 text-xs font-medium text-white md:left-[12%] md:top-[73.5%] md:text-[11px]">
            Bordir dada kiri
          </span>
        </div>
      </div>
    </section>
  );
}
