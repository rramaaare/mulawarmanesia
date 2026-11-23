/**
 * CatalogSection: tiga kartu produk paling dipesan. Harga "mulai dari" diambil dari
 * database lewat props (bukan ditulis di sini). Klik kartu membuka editor dengan
 * produk dan kategori kartu itu sudah terpilih.
 */
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tag } from "@/components/ui/Tag";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";
import type { Catalog } from "@/server/services/catalog-service";

/** Kartu yang ditampilkan: kategori + ringkasan + latar pastel. */
const FEATURED = [
  { product: "PDH", category: "Model 02", image: "/landing/pdh-02-depan-hero.webp", alt: "PDH Model 02 hijau dengan bahu hitam dan logo Universitas Mulawarman", detail: "Bahu kontras · bordir logo dada", tone: "bg-pastel-blue" },
  { product: "PDH", category: "Model 07", image: "/landing/pdh-07-depan-unmul.webp", alt: "PDH Model 07 putih dengan aksen batik dan logo Universitas Mulawarman", detail: "Aksen batik · bordir dada & lengan", tone: "bg-pastel-blue" },
  { product: "VEST", category: "Model 01", image: "/landing/vest-01-depan-unmul.webp", alt: "VEST Model 01 hijau army dengan bahu krem dan logo Universitas Mulawarman", detail: "Empat saku · bordir logo & nama", tone: "bg-pastel-butter" },
] as const;

export function CatalogSection({ catalog }: { catalog: Catalog }) {
  return (
    <section id="katalog">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-14 md:px-8 md:py-16">
        <SectionTitle
          title="Katalog paling dipesan"
          action={<Button href="#kategori" variant="dark" className="w-full md:w-auto">Lihat semua katalog →</Button>}
        />
        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          {FEATURED.map((item) => {
            const category = catalog.categories.find((row) => row.product === item.product && row.name === item.category);
            return (
              <Link key={`${item.product}-${item.category}`} href={category ? `/editor?kategori=${category.id}` : "/editor"} className="group">
                <Card pressable className="flex h-full flex-col gap-4 !p-3">
                  <div className={cn("flex h-[220px] items-center justify-center rounded-control border-2 border-ink px-4 py-5 md:h-auto md:rounded-card", item.tone)}>
                    <Image src={item.image} alt={item.alt} width={600} height={680} className="mx-auto h-44 w-auto" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 px-2 pb-2">
                    <div>
                      <Tag>{item.product}</Tag>
                    </div>
                    <h3 className="mt-1 text-xl font-semibold md:text-base">{item.product} {item.category}</h3>
                    <p className="text-sm text-ink-soft md:text-xs">{item.detail}</p>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <p className="text-xs text-ink-muted">Mulai dari</p>
                        <p className="text-lg font-semibold text-accent">{category ? formatRupiah(category.basePrice) : "-"}</p>
                      </div>
                      <span className="flex h-11 w-11 items-center justify-center rounded-control bg-ink text-white md:h-9 md:w-9" aria-hidden>→</span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
