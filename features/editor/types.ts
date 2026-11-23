/**
 * File ini untuk apa:
 * Bentuk data desain yang dipakai editor dan halaman Pesanan.
 */
import type { OverlayAdjust, PositionKey, ProductType } from "./garment-data";

/** Teknik pemasangan logo. */
export type DecorationTechnique = "bordir" | "sablon";

/** Satu logo yang sudah ditambahkan pengguna (offset/skala = hasil geser & ubah ukuran di gambar baju). */
export interface EditorImage extends OverlayAdjust {
  id: string;
  /** Kunci file di IndexedDB (file asli disimpan di browser sampai checkout). */
  fileKey: string;
  fileName: string; // nama asli untuk ditampilkan
  /** URL sementara untuk pratinjau; dibuat ulang saat draf dibuka (tidak disimpan). */
  previewUrl?: string;
  position: PositionKey;
  technique: DecorationTechnique;
  /** Perbandingan lebar/tinggi gambar asli, supaya logo panjang dipasang memanjang. */
  aspect?: number;
}

/** Satu teks pada desain (offset/skala = hasil geser & ubah ukuran di gambar baju). */
export interface EditorText extends OverlayAdjust {
  id: string;
  content: string;
  fontName: string;
  colorName: string; // nama warna benang/tinta
  position: PositionKey;
}

/** Seluruh keadaan desain. */
export interface DesignState {
  product: ProductType;
  /** Model baju dari mockup ("01"-"07"); ditentukan oleh kategori. */
  model?: string;
  categoryId: number;
  materialId: number;
  colors: Record<string, string>; // nama bagian -> nama warna kain
  images: EditorImage[];
  texts: EditorText[];
}
