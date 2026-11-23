/**
 * File ini untuk apa:
 * Data tetap untuk editor desain: model baju (dari mockup), bagian yang bisa diwarnai,
 * posisi logo/teks yang tersedia (preset), font, dan warna benang/tinta. Dipisah dari tampilan supaya
 * mudah diubah tanpa menyentuh komponen.
 */

import { DESIGN_POSITIONS, OVERLAY_LIMITS, PDH_MODELS, VEST_MODELS } from "@/lib/domain/constants";

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

/** Sisi baju tempat posisi berada; "both" = menyambung dari depan ke belakang. */
export type PositionSide = "front" | "back" | "both";

/** Posisi preset untuk logo dan teks (nama + sisi). Titik dan area ada di PRODUCT_POSITIONS. */
export const POSITIONS: Record<(typeof DESIGN_POSITIONS)[number], { label: string; side: PositionSide }> = {
  dada_kiri: { label: "Dada kiri", side: "front" },
  dada_kanan: { label: "Dada kanan", side: "front" },
  lengan_kiri: { label: "Lengan kiri", side: "front" },
  lengan_kanan: { label: "Lengan kanan", side: "front" },
  kerah_belakang: { label: "Bawah kerah belakang", side: "back" },
  punggung_atas: { label: "Punggung atas", side: "back" },
  punggung_tengah: { label: "Punggung tengah", side: "back" },
  punggung_bawah: { label: "Punggung bawah", side: "back" },
  lingkar_bawah: { label: "Lingkar bawah (depan → belakang)", side: "both" },
};
export type PositionKey = (typeof DESIGN_POSITIONS)[number];

/** Sisi pratinjau yang paling pas untuk menampilkan posisi (posisi sambung tetap di sisi yang sedang tampil). */
export function sideOf(position: PositionKey, current: "front" | "back"): "front" | "back" {
  const side = POSITIONS[position].side;
  return side === "both" ? current : side;
}

/** Apakah posisi terlihat di sisi pratinjau ini. */
export function isOnSide(position: PositionKey, side: "front" | "back"): boolean {
  const own = POSITIONS[position].side;
  return own === "both" || own === side;
}

/**
 * Area cetak per posisi: titik tengah (x, y) dan lebar/tinggi maksimum (w, h), di ruang gambar 300 x 340.
 */
export interface PrintArea {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Posisi lingkar: x = titik mulai (bukan titik tengah). */
  startBased?: true;
  /** Bingkai sendiri untuk area ini (lengan); kosong = bingkai badan. */
  frame?: FoldFrame;
}

/**
 * Bingkai tempat logo/teks dipasang: bagian badan/lengan selebar cx ± r. Logo/teks TIDAK diubah
 * bentuknya; bagian yang melewati tepi bingkai dipotong di tepi itu lalu dilanjutkan utuh di tampak
 * sebaliknya, mulai dari tepi yang sama (seperti kain yang dilipat ke belakang).
 * cxBack = tengah bagian yang sama di tampak sebaliknya (lengan tampak di sisi gambar yang berlawanan).
 */
export interface FoldFrame {
  cx: number;
  r: number;
  cxBack?: number;
  /** Kemiringan bingkai (derajat, searah jarum jam) di tampak asal; tampak sebaliknya dicerminkan. */
  angle?: number;
  /** Titik putar kemiringan (y); x = cx / cxBack. */
  cy?: number;
}

/**
 * PDH: dari letak "YOUR NAME / YOUR LOGO", bendera lengan, dan tulisan punggung di mockup.
 * VEST: dari letak "NAMA / LOGO HERE" dan tulisan punggung; rompi tidak berlengan.
 */
export const PRODUCT_POSITIONS: Record<ProductType, Partial<Record<PositionKey, PrintArea>>> = {
  PDH: {
    dada_kiri: { x: 112, y: 96, w: 36, h: 30 },
    dada_kanan: { x: 188, y: 96, w: 36, h: 30 },
    // Lengan miring ±22° (diukur dari mockup). Lengan kanan pemakai tampak di kiri gambar depan
    // dan di kanan gambar belakang, jadi tampak belakangnya dicerminkan.
    lengan_kiri: { x: 41, y: 125, w: 30, h: 22, frame: { cx: 41, cy: 125, r: 21, cxBack: 259, angle: 22 } },
    lengan_kanan: { x: 259, y: 125, w: 30, h: 22, frame: { cx: 259, cy: 125, r: 21, cxBack: 41, angle: -22 } },
    kerah_belakang: { x: 150, y: 44, w: 56, h: 14 },
    punggung_atas: { x: 150, y: 64, w: 140, h: 40 },
    punggung_tengah: { x: 150, y: 172, w: 150, h: 110 },
    punggung_bawah: { x: 150, y: 270, w: 140, h: 40 },
    lingkar_bawah: { x: 150, y: 300, w: 220, h: 18, startBased: true },
  },
  VEST: {
    dada_kiri: { x: 97, y: 104, w: 36, h: 30 },
    dada_kanan: { x: 203, y: 101, w: 36, h: 30 },
    kerah_belakang: { x: 150, y: 38, w: 56, h: 14 },
    punggung_atas: { x: 150, y: 64, w: 150, h: 45 },
    punggung_tengah: { x: 150, y: 175, w: 170, h: 110 },
    punggung_bawah: { x: 150, y: 280, w: 170, h: 40 },
    lingkar_bawah: { x: 150, y: 305, w: 280, h: 18, startBased: true },
  },
};

/**
 * Setengah lebar badan pada tiap ketinggian (diukur dari mockup; VEST memakai model tersempit
 * agar tidak ada yang kelewatan).
 */
const BODY_PROFILE: Record<ProductType, [y: number, r: number][]> = {
  PDH: [[70, 83], [102, 79], [130, 77], [200, 75], [340, 76]],
  VEST: [[60, 91], [100, 87], [140, 93], [180, 109], [300, 107]],
};

/** Bingkai badan pada ketinggian y (setengah lebar diinterpolasi dari profil). */
export function bodyFrame(product: ProductType, y: number): FoldFrame {
  const profile = BODY_PROFILE[product];
  if (y <= profile[0][0]) return { cx: 150, r: profile[0][1] };
  for (let index = 1; index < profile.length; index++) {
    const [y1, r1] = profile[index];
    const [y0, r0] = profile[index - 1];
    if (y <= y1) return { cx: 150, r: r0 + ((r1 - r0) * (y - y0)) / (y1 - y0) };
  }
  return { cx: 150, r: profile[profile.length - 1][1] };
}

/** Daftar posisi dalam urutan tampil di panel. */
export const POSITION_KEYS = [...DESIGN_POSITIONS] as PositionKey[];

/** Posisi yang tersedia untuk produk (VEST tidak punya lengan). */
export function positionKeysFor(product: ProductType): PositionKey[] {
  return POSITION_KEYS.filter((key) => key in PRODUCT_POSITIONS[product]);
}

/**
 * Potongan item yang tampil di satu sisi: item digeser sejauh `shift` lalu dipotong ke rentang x0..x1
 * (koordinat bingkai, sebelum kemiringan lengan).
 */
export interface FoldSegment {
  x0: number;
  x1: number;
  shift: number;
}

/**
 * Menghitung potongan yang tampil. Di tampak asal: bagian di dalam bingkai. Di tampak sebaliknya:
 * bagian yang melewati tepi kanan bingkai muncul mulai tepi kiri bingkai sebaliknya, dan bagian yang
 * melewati tepi kiri muncul berakhir di tepi kanan bingkai sebaliknya (sisi badan yang sama).
 */
export function foldSegments(box: OverlayBox, side: "front" | "back"): FoldSegment[] {
  const frame = box.frame;
  if (!frame) return side === box.home ? [{ x0: -Infinity, x1: Infinity, shift: 0 }] : [];
  const left = frame.cx - frame.r;
  const right = frame.cx + frame.r;
  const right2 = box.x + box.w;
  const segments: FoldSegment[] = [];
  if (side === box.home) {
    if (right2 > left && box.x < right) segments.push({ x0: left, x1: right, shift: 0 });
    return segments;
  }
  const otherCx = frame.cxBack ?? frame.cx;
  const otherLeft = otherCx - frame.r;
  const otherRight = otherCx + frame.r;
  const overflowRight = right2 - right;
  if (overflowRight > 0) segments.push({ x0: otherLeft, x1: Math.min(otherRight, otherLeft + overflowRight), shift: otherLeft - right });
  const overflowLeft = left - box.x;
  if (overflowLeft > 0) segments.push({ x0: Math.max(otherLeft, otherRight - overflowLeft), x1: otherRight, shift: otherRight - left });
  return segments;
}

/** Kotak bagian item yang tampil di satu sisi (untuk kotak pilihan & area sentuh); null bila tidak tampil. */
export function foldVisibleBox(box: OverlayBox, side: "front" | "back"): { x: number; y: number; w: number; h: number } | null {
  let min = Infinity;
  let max = -Infinity;
  for (const segment of foldSegments(box, side)) {
    const from = Math.max(segment.x0, box.x + segment.shift);
    const to = Math.min(segment.x1, box.x + box.w + segment.shift);
    if (to - from > 0.5) {
      min = Math.min(min, from);
      max = Math.max(max, to);
    }
  }
  return Number.isFinite(min) ? { x: min, y: box.y, w: max - min, h: box.h } : null;
}

/** Pilihan ukuran cepat untuk logo/teks. */
export const SIZE_PRESETS = [
  { label: "Kecil", scale: 0.75 },
  { label: "Sedang", scale: 1 },
  { label: "Besar", scale: 1.4 },
] as const;

/**
 * Keterangan ukuran & geseran untuk admin/lembar produksi, mis. " · ukuran Besar (140%) · digeser manual".
 * Kosong bila logo/teks memakai ukuran dan titik bawaan.
 */
export function placementNote(adjust: OverlayAdjust): string {
  const scale = clampScale(adjust.scale);
  const nearest = SIZE_PRESETS.reduce((best, preset) => (Math.abs(preset.scale - scale) < Math.abs(best.scale - scale) ? preset : best));
  const size = scale === 1 ? "" : ` · ukuran ${nearest.label} (${Math.round(scale * 100)}%)`;
  const moved = adjust.offsetX || adjust.offsetY ? " · digeser manual" : "";
  const flipped = adjust.flipX && adjust.flipY ? " · dibalik kiri-kanan & atas-bawah" : adjust.flipX ? " · dibalik kiri-kanan" : adjust.flipY ? " · dibalik atas-bawah" : "";
  return size + moved + flipped;
}

/** Penyesuaian manual sebuah logo/teks (semua opsional; kosong = bawaan posisi). */
export interface OverlayAdjust {
  offsetX?: number;
  offsetY?: number;
  scale?: number;
  /** Dibalik kiri-kanan (cermin). */
  flipX?: boolean;
  /** Dibalik atas-bawah. */
  flipY?: boolean;
}

/** Hasil tata letak satu logo/teks: kotak di kanvas 300 x 340 (koordinat tampak depan untuk posisi sambung). */
export interface OverlayBox {
  /** Pojok kiri-atas dan ukuran kotak. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Ukuran huruf (khusus teks). */
  fontSize: number;
  /** Bingkai badan/lengan tempat item dipasang (bagian di luar tepi berlanjut di tampak sebaliknya). */
  frame?: FoldFrame;
  /** Sisi asal item (tempat x diukur). */
  home: "front" | "back";
}

const CANVAS = { w: 300, h: 340 };
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
/**
 * Perkiraan lebar satu huruf terhadap ukuran font (em) untuk font tebal sans-serif:
 * huruf kapital & angka lebih lebar dari huruf kecil, spasi & tanda baca sempit.
 */
export function charEm(letter: string): number {
  if (letter === " ") return 0.3;
  if (letter === "I" || letter === "1") return 0.34;
  if (/[MWmw@]/.test(letter)) return 0.88;
  if (/[A-Z0-9]/.test(letter)) return 0.7;
  if (/[a-z]/.test(letter)) return letter === "i" || letter === "l" || letter === "j" ? 0.3 : 0.58;
  return 0.4;
}

/** Perkiraan lebar teks (em). */
export function textEm(content: string): number {
  return Math.max(Array.from(content).reduce((sum, letter) => sum + charEm(letter), 0), 0.6);
}

/** Skala dibatasi ke rentang yang diizinkan. */
export function clampScale(scale: number | undefined): number {
  return clamp(scale ?? 1, OVERLAY_LIMITS.minScale, OVERLAY_LIMITS.maxScale);
}

/**
 * Menghitung kotak logo/teks agar ukurannya ikut bentuk: logo panjang memakai lebar area,
 * logo tinggi memakai tinggi area; teks diperkecil hurufnya sampai muat di lebar area.
 * Lalu dikali skala, digeser sesuai offset, dan dijaga tetap di dalam kanvas.
 */
export function layoutOverlay(
  product: ProductType,
  position: PositionKey,
  item: ({ kind: "image"; aspect?: number } | { kind: "text"; content: string }) & OverlayAdjust,
): OverlayBox {
  const area = PRODUCT_POSITIONS[product][position] ?? PRODUCT_POSITIONS[product].dada_kiri ?? { x: 150, y: 120, w: 36, h: 30 };
  const scale = clampScale(item.scale);
  let w: number;
  let h: number;
  let fontSize = 0;
  if (item.kind === "image") {
    const aspect = clamp(item.aspect ?? 1, 0.1, 10);
    w = Math.min(area.w, area.h * aspect) * scale;
    h = w / aspect;
  } else {
    const em = textEm(item.content);
    // Ukuran dasar = muat di area (tapi tidak di bawah 4), lalu skala tetap berpengaruh walau teksnya panjang
    const base = clamp(Math.min(area.h * 0.8, area.w / em), 4, 40);
    fontSize = clamp(base * scale, 3, 60);
    w = fontSize * em;
    h = fontSize;
  }
  const offsetX = clamp(item.offsetX ?? 0, -OVERLAY_LIMITS.offset, OVERLAY_LIMITS.offset);
  const offsetY = clamp(item.offsetY ?? 0, -OVERLAY_LIMITS.offset, OVERLAY_LIMITS.offset);
  const centerY = clamp(area.y + offsetY, h / 2, CANVAS.h - h / 2);
  const home = POSITIONS[position].side === "back" ? "back" : "front";
  // Boleh digeser sampai melewati tepi: bagian yang lewat dilanjutkan utuh di tampak sebaliknya
  const frame = area.frame ?? bodyFrame(product, centerY);
  const limit = frame.r * 1.6;
  const left = area.startBased
    ? clamp(area.x + offsetX, frame.cx - limit, frame.cx + limit)
    : clamp(area.x + offsetX, frame.cx - limit, frame.cx + limit) - w / 2;
  return { x: left, y: centerY - h / 2, w, h, fontSize, frame, home };
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
