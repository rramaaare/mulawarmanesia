/**
 * File ini untuk apa:
 * Menghitung harga pesanan. Fungsinya "murni" (tanpa database/tampilan),
 * jadi dipakai ulang oleh editor (estimasi di browser) DAN server (harga resmi).
 * Rumus mengikuti PRD §8.6.
 */
import {
  DECORATION_FEE,
  DP_RATE,
  NAME_PER_PERSON_FEE,
  SIZE_SURCHARGE,
  SIZES,
  VOLUME_DISCOUNTS,
  type Size,
  type Technique,
} from "./constants";

/** Biaya yang boleh diatur superadmin (rupiah per pcs). */
export interface Fees {
  bordir: number; // per gambar
  sablon: number; // per gambar
  namePerPerson: number;
  XXL: number; // tambahan ukuran
  XXXL: number;
}

/** Nilai bawaan biaya, diambil dari konstanta; dipakai bila belum ada pengaturan di database. */
export const DEFAULT_FEES: Fees = {
  bordir: DECORATION_FEE.bordir,
  sablon: DECORATION_FEE.sablon,
  namePerPerson: NAME_PER_PERSON_FEE,
  XXL: SIZE_SURCHARGE.XXL,
  XXXL: SIZE_SURCHARGE.XXXL,
};

/** Jumlah pcs per ukuran, mis. { S: 2, M: 6 }. Ukuran yang kosong dianggap 0. */
export type SizeQuantities = Partial<Record<Size, number>>;

/** Data yang dibutuhkan untuk menghitung harga. */
export interface PriceInput {
  basePrice: number; // harga dasar kategori
  materialSurcharge: number; // tambahan harga bahan
  decorationTechniques: Technique[]; // satu elemen per gambar
  namePerPerson: boolean;
  quantities: SizeQuantities;
  shippingFee: number;
  /** Biaya dekorasi/nama/ukuran. Kosong = nilai bawaan dari konstanta. */
  fees?: Fees;
}

/** Hasil perhitungan harga, semuanya dalam rupiah. */
export interface PriceResult {
  totalPcs: number;
  unitPrice: number; // harga per pcs sebelum tambahan ukuran
  decorationTotal: number; // total biaya bordir/sablon seluruh pcs
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  downPayment: number; // nominal DP (50%) bila memilih DP
}

/** Tambahan harga per pcs untuk ukuran tertentu (hanya XXL dan XXXL yang punya tambahan). */
function sizeSurcharge(size: Size, fees: Fees): number {
  if (size === "XXL") return fees.XXL;
  if (size === "XXXL") return fees.XXXL;
  return 0;
}

/** Menjumlahkan semua pcs dari semua ukuran. */
export function countPieces(quantities: SizeQuantities): number {
  return SIZES.reduce((sum, size) => sum + (quantities[size] ?? 0), 0);
}

/** Mencari persen diskon volume untuk total pcs tertentu (0 jika tidak ada). */
export function volumeDiscountRate(totalPcs: number): number {
  const rule = VOLUME_DISCOUNTS.find((item) => totalPcs >= item.minPcs);
  return rule ? rule.rate : 0;
}

/** Menghitung seluruh rincian harga dari input. */
export function calculatePrice(input: PriceInput): PriceResult {
  const totalPcs = countPieces(input.quantities);
  const fees = input.fees ?? DEFAULT_FEES;

  // Biaya dekorasi per pcs = jumlah biaya semua gambar
  const decorationPerPiece = input.decorationTechniques.reduce(
    (sum, technique) => sum + fees[technique],
    0,
  );
  const namePerPiece = input.namePerPerson ? fees.namePerPerson : 0;

  // Harga per pcs (tanpa tambahan ukuran)
  const unitPrice =
    input.basePrice + input.materialSurcharge + decorationPerPiece + namePerPiece;

  // Subtotal = tiap ukuran dikali (harga per pcs + tambahan ukuran)
  const subtotal = SIZES.reduce((sum, size) => {
    const qty = input.quantities[size] ?? 0;
    return sum + qty * (unitPrice + sizeSurcharge(size, fees));
  }, 0);

  const discount = Math.round(subtotal * volumeDiscountRate(totalPcs));
  const total = subtotal - discount + input.shippingFee;

  return {
    totalPcs,
    unitPrice,
    decorationTotal: decorationPerPiece * totalPcs,
    subtotal,
    discount,
    shippingFee: input.shippingFee,
    total,
    downPayment: Math.round(total * DP_RATE),
  };
}
