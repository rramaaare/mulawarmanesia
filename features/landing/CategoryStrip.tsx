/**
 * CategoryStrip: strip kartu kategori desain yang bergeser horizontal (paralaks 0.6×)
 * saat di-scroll di desktop; kartu terakhir terpotong di tepi area konten sebagai petunjuk
 * bahwa strip bisa digeser. Di mobile menjadi daftar geser manual (swipe).
 */
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Garment } from "@/components/Garment";
import { ParallaxLayer } from "@/components/ParallaxLayer";
import { cn } from "@/lib/cn";
import type { Catalog } from "@/server/services/catalog-service";
import { PDH_RED, VEST_BLACK } from "./garment-colors";

/** Latar pastel bergantian untuk kotak ilustrasi tiap kartu. */
const TONES = ["bg-pastel-blue", "bg-pastel-mint", "bg-pastel-butter", "bg-pastel-peach"];

/** 185000 -> "Rp185rb" */
function shortPrice(amount: number): string {
  return `Rp${Math.round(amount / 1000)}rb`;
}

export function CategoryStrip({ catalog }: { catalog: Catalog }) {
  return (
    <section id="kategori">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-14 md:px-8 md:py-16">
        <SectionTitle
          title="Kategori desain"
          description="Setiap kategori adalah template awal: potongan kerah, saku, dan posisi logo sudah diatur. Kamu tinggal mengubah warna dan isinya."
        />
        {/* Di mobile: overflow-x-auto (swipe). Di desktop: dipotong di tepi konten, digeser paralaks. */}
        {/* Pinggir kiri-kanan memudar (blur) lewat mask, bukan terpotong tajam */}
        <div className="-mb-3 overflow-x-auto pb-3 [-webkit-mask-image:linear-gradient(to_right,transparent,black_5%,black_88%,transparent)] [mask-image:linear-gradient(to_right,transparent,black_5%,black_88%,transparent)] md:overflow-x-clip">
          <ParallaxLayer speed={0.6} axis="x" distance={480} className="flex w-max gap-5">
            {catalog.categories.map((category, index) => (
              <Link key={category.id} href={`/editor?kategori=${category.id}`} className="group">
                <Card pressable className="flex h-[170px] w-[280px] items-stretch md:w-[290px] justify-between gap-3 !p-4">
                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="text-base font-semibold md:text-sm">{category.product}</p>
                      <p className="text-base font-semibold md:text-sm">{category.name}</p>
                      <p className="mt-1 text-xs text-ink-muted">Mulai {shortPrice(category.basePrice)}</p>
                    </div>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink text-xs" aria-hidden>→</span>
                  </div>
                  <div className={cn("flex w-[128px] items-center justify-center rounded-control md:w-[120px] md:rounded-card border-2 border-ink", TONES[index % TONES.length])}>
                    <Garment product={category.product} colors={category.product === "PDH" ? PDH_RED : VEST_BLACK} className="h-24 w-auto" />
                  </div>
                </Card>
              </Link>
            ))}
          </ParallaxLayer>
        </div>
      </div>
    </section>
  );
}
