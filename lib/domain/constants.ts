/**
 * File ini untuk apa:
 * Menyimpan semua angka dan daftar tetap bisnis di SATU tempat
 * (ukuran, minimal order, biaya dekorasi, diskon, batas waktu bayar).
 * Jika angka berubah, cukup ubah di sini; seluruh aplikasi ikut berubah.
 * Semua angka ini dummy sesuai PRD dan harus diganti dengan angka asli.
 */

/** Daftar ukuran pakaian yang tersedia, berurutan dari kecil ke besar. */
export const SIZES = ["S", "M", "L", "XL", "XXL", "XXXL"] as const;
export type Size = (typeof SIZES)[number];

/** Tambahan harga per pcs untuk ukuran besar (rupiah). */
export const SIZE_SURCHARGE: Record<Size, number> = {
  S: 0,
  M: 0,
  L: 0,
  XL: 0,
  XXL: 10_000,
  XXXL: 15_000,
};

/** Model baju dari file mockup: PDH (kemeja lengan panjang) dan VEST (rompi). */
export const PDH_MODELS = ["01", "02", "03", "04", "05", "06", "07"] as const;
export const VEST_MODELS = ["01", "02", "03", "04", "05", "06"] as const;
/** Semua nomor model yang mungkin (dipakai validasi). */
export const DESIGN_MODELS = ["01", "02", "03", "04", "05", "06", "07"] as const;

/**
 * Motif kain yang bisa dipakai di bagian mana pun selain warna polos.
 * `name` disimpan di desain seperti nama warna; `width`/`height` = ukuran gambar (piksel).
 */
export const MOTIFS = [
  { name: "Batik Hijau", slug: "batik-hijau", src: "/mockup/motif/batik-hijau.jpg", width: 1000, height: 638 },
  { name: "Batik Parang", slug: "batik-parang", src: "/mockup/motif/batik-parang.jpg", width: 1000, height: 665 },
] as const;
export type Motif = (typeof MOTIFS)[number];

/** Mencari motif dari namanya; undefined bila nama itu warna polos. */
export function findMotif(name: string | undefined): Motif | undefined {
  return MOTIFS.find((motif) => motif.name === name);
}

/** Posisi preset logo/teks di baju (urutan tampil di editor). */
export const DESIGN_POSITIONS = [
  "dada_kiri",
  "dada_kanan",
  "lengan_kiri",
  "lengan_kanan",
  "kerah_belakang",
  "punggung_atas",
  "punggung_tengah",
  "punggung_bawah",
  "lingkar_bawah",
] as const;

/** Batas penyesuaian manual logo/teks di editor (satuan kanvas gambar baju 300 x 340). */
export const OVERLAY_LIMITS = { offset: 150, minScale: 0.5, maxScale: 2.5 } as const;

/** Minimal total pcs dalam satu pesanan. */
export const MIN_ORDER_PCS = 12;

/** Maksimal gambar/logo per desain. */
export const MAX_IMAGES = 4;

/** Biaya dekorasi per gambar per pcs (rupiah), tergantung teknik. */
export const DECORATION_FEE = { bordir: 15_000, sablon: 10_000 } as const;
export type Technique = keyof typeof DECORATION_FEE;

/** Biaya tambahan per pcs bila memakai fitur "nama per orang". */
export const NAME_PER_PERSON_FEE = 7_500;

/** Diskon volume: dari batas pcs terbesar ke terkecil. 0.1 artinya 10%. */
export const VOLUME_DISCOUNTS = [
  { minPcs: 100, rate: 0.1 },
  { minPcs: 50, rate: 0.05 },
] as const;

/** Persentase DP bila pelanggan memilih skema DP. */
export const DP_RATE = 0.5;

/** Lama pesanan boleh menunggu pembayaran sebelum kedaluwarsa (jam). */
export const PAYMENT_DEADLINE_HOURS = 24;

/** Kapasitas produksi per minggu (pcs), dipakai meter di dashboard. */
export const WEEKLY_CAPACITY_PCS = 600;

/** Ukuran maksimal file logo (byte): 5 MB. */
export const MAX_LOGO_BYTES = 5 * 1024 * 1024;
