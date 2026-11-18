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
import { Garment } from "@/components/Garment";
import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";
import type { Catalog } from "@/server/services/catalog-service";
import { PDH_RED, VEST_BLACK } from "./garment-colors";

/** Kartu yang ditampilkan: kategori + ringkasan + latar pastel. */
const FEATURED = [
  { product: "PDH", category: "Organisasi", detail: "American Drill · bordir logo dada", tone: "bg-pastel-blue", colors: PDH_RED },
  { product: "PDH", category: "Instansi", detail: "Nagata Drill · bordir dada & lengan", tone: "bg-pastel-blue", colors: PDH_RED },
  { product: "VEST", category: "Proyek", detail: "Taslan · strip reflektif · sablon", tone: "bg-pastel-butter", colors: VEST_BLACK },
] as const;

export function CatalogSection({ catalog }: { catalog: Catalog }) {
  return (
    <section id="katalog">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-14 md:px-8 md:py-16">
        <SectionTitle
          title="Katalog paling dipesan"
          action={<Button href="#kategori" variant="dark" size="sm">Lihat semua katalog →</Button>}
        />
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURED.map((item) => {
            const category = catalog.categories.find((row) => row.product === item.product && row.name === item.category);
            return (
              <Link key={item.category} href={category ? `/editor?kategori=${category.id}` : "/editor"} className="group">
                <Card pressable className="flex h-full flex-col gap-4 !p-3">
                  <div className={cn("rounded-card border-2 border-ink px-4 py-5", item.tone)}>
                    <Garment product={item.product} colors={item.colors} className="mx-auto h-44 w-auto" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 px-2 pb-2">
                    <div>
                      <Tag>{item.product}</Tag>
                    </div>
                    <h3 className="mt-1 font-semibold">{item.product} {item.category}</h3>
                    <p className="text-xs text-ink-soft">{item.detail}</p>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <p className="text-[11px] text-ink-muted">Mulai dari</p>
                        <p className="text-lg font-semibold text-accent">{category ? formatRupiah(category.basePrice) : "-"}</p>
                      </div>
                      <span className="flex h-9 w-9 items-center justify-center rounded-control bg-ink text-white" aria-hidden>→</span>
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
