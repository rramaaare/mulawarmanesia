/**
 * File ini untuk apa:
 * Mengambil data master (kategori, bahan, warna kain, kota & ongkir) untuk editor
 * dan halaman Pesanan. Semua harga berasal dari database, bukan ditulis di tampilan.
 */
import { db } from "@/server/db";
import type { Fees } from "@/lib/domain/pricing";
import { getSettings } from "./settings-service";

/** Data master yang dikirim ke browser. */
export interface Catalog {
  categories: { id: number; product: "PDH" | "VEST"; name: string; basePrice: number }[];
  materials: { id: number; product: "PDH" | "VEST"; name: string; surcharge: number }[];
  colors: { name: string; hex: string; inStock: boolean }[];
  cities: { name: string; zone: string; fee: number }[];
  /** Biaya dekorasi/nama/ukuran yang berlaku (bisa diubah superadmin). */
  fees: Fees;
}

/** Membaca seluruh data master sekaligus. */
export async function getCatalog(): Promise<Catalog> {
  const [categories, materials, colors, cities, rates, settings] = await Promise.all([
    db.category.findMany({ orderBy: { id: "asc" } }),
    db.material.findMany({ orderBy: { id: "asc" } }),
    db.fabricColor.findMany({ orderBy: { id: "asc" } }),
    db.city.findMany({ orderBy: { name: "asc" } }),
    db.shippingRate.findMany(),
    getSettings(),
  ]);
  const feeByZone = new Map(rates.map((rate) => [rate.zone, rate.fee]));

  return {
    categories,
    materials,
    colors: colors.map(({ name, hex, inStock }) => ({ name, hex, inStock })),
    cities: cities.map((city) => ({ name: city.name, zone: city.zone, fee: feeByZone.get(city.zone) ?? 0 })),
    fees: settings.fees,
  };
}
