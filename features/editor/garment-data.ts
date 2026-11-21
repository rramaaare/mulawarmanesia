/**
 * File ini untuk apa:
 * Data tetap untuk editor desain: model baju (dari mockup), bagian yang bisa diwarnai,
 * posisi logo/teks yang tersedia (preset), font, dan warna benang/tinta. Dipisah dari tampilan supaya
 * mudah diubah tanpa menyentuh komponen.
 */

import { PDH_MODELS, VEST_MODELS } from "@/lib/domain/constants";

/** Jenis produk. */
export type ProductType = "PDH" | "VEST";

/** Nomor model baju dari mockup ("01"-"07"). Satu kategori = satu model. */
export type DesignModel = string;
export const MODELS: Record<ProductType, readonly string[]> = { PDH: PDH_MODELS, VEST: VEST_MODELS };
export const DEFAULT_MODEL = "01";

/** Ciri singkat tiap model, tampil di pilihan model. */
export const MODEL_INFO: Record<ProductType, Record<string, string>> = {
  PDH: {
    "01": "Polos, dua saku",
    "02": "Bahu kontras",
    "03": "Bahu + panel samping",
    "04": "Lengan & bahu kontras",
    "05": "Strip vertikal, satu saku",
    "06": "Epolet + bahu terang",
    "07": "Aksen batik",
  },
  VEST: {
    "01": "Empat saku, list dada",
    "02": "Empat saku, bahu kontras",
    "03": "Saku ritsleting, bahu kontras",
    "04": "Dua warna diagonal",
    "05": "Kerah berdiri, empat saku",
    "06": "Saku lapangan, aksen gelap",
  },
};

/** Bagian yang bisa diwarnai (atau diberi motif) untuk tiap model, sesuai mockup. */
const PDH_BASE_PARTS = ["Badan", "Lengan", "Kerah", "Plaket", "Saku", "List lengan"];
export const MODEL_PARTS: Record<ProductType, Record<string, string[]>> = {
  PDH: {
    "01": PDH_BASE_PARTS,
    "02": [...PDH_BASE_PARTS, "Bahu"],
    "03": [...PDH_BASE_PARTS, "Bahu", "Panel samping"],
    "04": [...PDH_BASE_PARTS, "Bahu", "Panel samping"],
    "05": [...PDH_BASE_PARTS, "Strip"],
    "06": [...PDH_BASE_PARTS, "Bahu", "Epolet"],
    "07": [...PDH_BASE_PARTS, "Bahu", "Panel samping"],
  },
  VEST: {
    "01": ["Badan", "Bahu", "Saku", "Aksen"],
    "02": ["Badan", "Bahu", "Saku"],
    "03": ["Badan", "Bahu", "Saku"],
    "04": ["Badan atas", "Badan bawah"],
    "05": ["Badan", "Saku", "Aksen"],
    "06": ["Badan", "Saku", "Aksen"],
  },
};

/** Isi awal tiap bagian per model (nama warna dari palet kain, atau nama motif). */
export const MODEL_DEFAULTS: Record<ProductType, Record<string, Record<string, string>>> = {
  PDH: {
    "01": { Badan: "Navy", Lengan: "Navy", Kerah: "Hitam", Plaket: "Navy", Saku: "Navy", "List lengan": "Hitam" },
    "02": { Badan: "Hijau Botol", Lengan: "Hijau Botol", Kerah: "Hijau Botol", Plaket: "Hijau Botol", Saku: "Hijau Botol", "List lengan": "Hitam", Bahu: "Hitam" },
    "03": { Badan: "Putih", Lengan: "Putih", Kerah: "Putih", Plaket: "Putih", Saku: "Abu Muda", "List lengan": "Putih", Bahu: "Abu Tua", "Panel samping": "Abu Tua" },
    "04": { Badan: "Putih", Lengan: "Abu Tua", Kerah: "Putih", Plaket: "Putih", Saku: "Abu Tua", "List lengan": "Abu Tua", Bahu: "Abu Tua", "Panel samping": "Abu Tua" },
    "05": { Badan: "Putih", Lengan: "Putih", Kerah: "Putih", Plaket: "Putih", Saku: "Abu Tua", "List lengan": "Abu Tua", Strip: "Abu Tua" },
    "06": { Badan: "Abu Muda", Lengan: "Putih", Kerah: "Putih", Plaket: "Putih", Saku: "Putih", "List lengan": "Putih", Bahu: "Putih", Epolet: "Abu Muda" },
    "07": { Badan: "Putih", Lengan: "Putih", Kerah: "Putih", Plaket: "Putih", Saku: "Putih", "List lengan": "Putih", Bahu: "Batik Hijau", "Panel samping": "Batik Hijau" },
  },
  VEST: {
    "01": { Badan: "Hijau Army", Bahu: "Cream", Saku: "Hijau Army", Aksen: "Hitam" },
    "02": { Badan: "Navy", Bahu: "Cream", Saku: "Navy" },
    "03": { Badan: "Cream", Bahu: "Khaki", Saku: "Cream" },
    "04": { "Badan atas": "Cream", "Badan bawah": "Maroon" },
    "05": { Badan: "Biru Dongker", Saku: "Biru Dongker", Aksen: "Navy" },
    "06": { Badan: "Abu Muda", Saku: "Abu Muda", Aksen: "Abu Tua" },
  },
};

/** Model yang valid untuk produk; nilai lain (mis. desain lama tanpa model) jadi Model 01. */
export function resolveModel(product: ProductType, model: string | undefined | null): string {
  return model && MODELS[product].includes(model) ? model : DEFAULT_MODEL;
}

/** Daftar bagian yang bisa diwarnai untuk produk + model. */
export function partsFor(product: ProductType, model?: string | null): string[] {
  return MODEL_PARTS[product][resolveModel(product, model)];
}

/** Isi awal bagian untuk produk + model. */
export function defaultColorsFor(product: ProductType, model?: string | null): Record<string, string> {
  return { ...MODEL_DEFAULTS[product][resolveModel(product, model)] };
}

/** Posisi preset untuk logo dan teks. Koordinat dalam ruang gambar SVG 300 x 340. */
export const POSITIONS = {
  dada_kiri: { label: "Dada kiri", side: "front", x: 122, y: 128, size: 38 },
  dada_kanan: { label: "Dada kanan", side: "front", x: 178, y: 128, size: 38 },
  lengan_kiri: { label: "Lengan kiri", side: "front", x: 46, y: 100, size: 26 },
  lengan_kanan: { label: "Lengan kanan", side: "front", x: 254, y: 100, size: 26 },
  punggung_atas: { label: "Punggung atas", side: "back", x: 150, y: 90, size: 46 },
  punggung_tengah: { label: "Punggung tengah", side: "back", x: 150, y: 175, size: 90 },
} as const;
export type PositionKey = keyof typeof POSITIONS;

/**
 * Titik posisi per produk (gambar mockup), di ruang gambar 300 x 340.
 * PDH: dari letak "YOUR NAME / YOUR LOGO", bendera lengan, dan tulisan punggung di mockup.
 * VEST: dari letak "NAMA / LOGO HERE" dan tulisan punggung; rompi tidak berlengan.
 */
export const PRODUCT_POSITIONS: Record<ProductType, Partial<Record<PositionKey, { x: number; y: number; size: number }>>> = {
  PDH: {
    dada_kiri: { x: 112, y: 96, size: 30 },
    dada_kanan: { x: 188, y: 96, size: 30 },
    lengan_kiri: { x: 37, y: 102, size: 22 },
    lengan_kanan: { x: 263, y: 104, size: 22 },
    punggung_atas: { x: 150, y: 61, size: 46 },
    punggung_tengah: { x: 150, y: 175, size: 90 },
  },
  VEST: {
    dada_kiri: { x: 97, y: 104, size: 30 },
    dada_kanan: { x: 203, y: 101, size: 30 },
    punggung_atas: { x: 150, y: 63, size: 46 },
    punggung_tengah: { x: 150, y: 180, size: 90 },
  },
};

/** Daftar posisi dalam urutan tampil di panel. */
export const POSITION_KEYS = Object.keys(POSITIONS) as PositionKey[];

/** Posisi yang tersedia untuk produk (VEST tidak punya lengan). */
export function positionKeysFor(product: ProductType): PositionKey[] {
  return POSITION_KEYS.filter((key) => key in PRODUCT_POSITIONS[product]);
}

/** Font yang tersedia untuk bordir/sablon (dummy, 4 font). */
export const FONTS = [
  { name: "Poppins Tebal", css: "Poppins, sans-serif", weight: 700 },
  { name: "Serif Klasik", css: "Georgia, serif", weight: 700 },
  { name: "Mesin Tik", css: "'Courier New', monospace", weight: 700 },
  { name: "Tulis Tangan", css: "'Brush Script MT', cursive", weight: 400 },
] as const;

/** Warna benang/tinta untuk teks. */
export const THREAD_COLORS = [
  { name: "Putih", hex: "#FFFFFF" },
  { name: "Hitam", hex: "#111111" },
  { name: "Emas", hex: "#D4A62A" },
  { name: "Merah", hex: "#C12822" },
  { name: "Perak", hex: "#C0C0C0" },
] as const;
