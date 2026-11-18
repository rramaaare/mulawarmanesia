/**
 * File ini untuk apa:
 * Data tetap untuk editor desain: bagian garmen yang bisa diwarnai, posisi logo/teks
 * yang tersedia (preset), font, dan warna benang/tinta. Dipisah dari tampilan supaya
 * mudah diubah tanpa menyentuh komponen.
 */

/** Jenis produk. */
export type ProductType = "PDH" | "VEST";

/** Bagian garmen yang bisa diwarnai terpisah (PRD §8.3). */
export const GARMENT_PARTS: Record<ProductType, string[]> = {
  PDH: ["Badan", "Lengan", "Kerah", "Tutup saku", "Plaket", "List lengan"],
  VEST: ["Badan", "Strip reflektif", "Saku", "Ritsleting"],
};

/** Warna awal tiap bagian ketika kategori baru dipilih (nama warna dari palet kain). */
export const DEFAULT_COLORS: Record<ProductType, Record<string, string>> = {
  PDH: { Badan: "Navy", Lengan: "Navy", Kerah: "Hitam", "Tutup saku": "Navy", Plaket: "Navy", "List lengan": "Hitam" },
  VEST: { Badan: "Hijau Army", "Strip reflektif": "Kuning", Saku: "Hijau Army", Ritsleting: "Hitam" },
};

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

/** Daftar posisi dalam urutan tampil di panel. */
export const POSITION_KEYS = Object.keys(POSITIONS) as PositionKey[];

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
