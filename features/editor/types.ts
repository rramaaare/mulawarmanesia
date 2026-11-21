/**
 * File ini untuk apa:
 * Bentuk data desain yang dipakai editor dan halaman Pesanan.
 */
import type { PositionKey, ProductType } from "./garment-data";

/** Teknik pemasangan logo. */
export type DecorationTechnique = "bordir" | "sablon";

/** Satu logo yang sudah ditambahkan pengguna. */
export interface EditorImage {
  id: string;
  /** Kunci file di IndexedDB (file asli disimpan di browser sampai checkout). */
  fileKey: string;
  fileName: string; // nama asli untuk ditampilkan
  /** URL sementara untuk pratinjau; dibuat ulang saat draf dibuka (tidak disimpan). */
  previewUrl?: string;
  position: PositionKey;
  technique: DecorationTechnique;
}

/** Satu teks pada desain. */
export interface EditorText {
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
