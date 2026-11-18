/**
 * File ini untuk apa:
 * Fungsi-fungsi kecil (murni) untuk bekerja dengan desain: membuat desain awal,
 * mengubah nama warna menjadi kode hex untuk gambar, menghitung estimasi harga,
 * dan mengetahui apakah pengguna sudah mengubah template.
 */
import type { GarmentImage, GarmentText } from "@/components/Garment";
import { calculatePrice } from "@/lib/domain/pricing";
import type { Catalog } from "@/server/services/catalog-service";
import { DEFAULT_COLORS, POSITION_KEYS, THREAD_COLORS } from "./garment-data";
import type { DesignState } from "./types";

/**
 * Membuat desain awal. Jika `categoryId` diberikan dan valid dipakai itu,
 * jika tidak, PDH + kategori pertama (editor tidak pernah kosong, PRD §8.2).
 */
export function createInitialDesign(catalog: Catalog, categoryId?: number): DesignState {
  const category = catalog.categories.find((item) => item.id === categoryId) ?? catalog.categories.find((item) => item.product === "PDH") ?? catalog.categories[0];
  const material = catalog.materials.find((item) => item.product === category.product) ?? catalog.materials[0];
  return {
    product: category.product,
    categoryId: category.id,
    materialId: material.id,
    colors: { ...DEFAULT_COLORS[category.product] },
    images: [],
    texts: [],
  };
}

/** Apakah pengguna sudah mengubah sesuatu dari template (warna berbeda, ada logo/teks)? */
export function isDesignModified(design: DesignState): boolean {
  const defaults = DEFAULT_COLORS[design.product];
  const colorChanged = Object.entries(defaults).some(([part, color]) => design.colors[part] !== color);
  return colorChanged || design.images.length > 0 || design.texts.length > 0;
}

/** Mengubah { Badan: "Navy" } menjadi { Badan: "#1F2A44" } memakai palet dari database. */
export function colorsToHex(colors: Record<string, string>, catalog: Catalog): Record<string, string> {
  const hexByName = new Map(catalog.colors.map((color) => [color.name, color.hex]));
  return Object.fromEntries(Object.entries(colors).map(([part, name]) => [part, hexByName.get(name) ?? "#CCCCCC"]));
}

/** Menyiapkan daftar logo dan teks dalam bentuk yang dimengerti komponen Garment. */
export function toGarmentOverlays(design: DesignState): { images: GarmentImage[]; texts: GarmentText[] } {
  return {
    images: design.images
      .filter((image) => image.previewUrl)
      .map((image) => ({ src: image.previewUrl as string, position: image.position })),
    texts: design.texts.map((text) => ({
      content: text.content,
      fontName: text.fontName,
      colorHex: THREAD_COLORS.find((color) => color.name === text.colorName)?.hex ?? "#FFFFFF",
      position: text.position,
    })),
  };
}

/** Estimasi harga per pcs (sebelum ukuran besar, diskon, dan ongkir) untuk panel kanan editor. */
export function estimateUnitPrice(design: DesignState, catalog: Catalog): number {
  const category = catalog.categories.find((item) => item.id === design.categoryId);
  const material = catalog.materials.find((item) => item.id === design.materialId);
  return calculatePrice({
    basePrice: category?.basePrice ?? 0,
    materialSurcharge: material?.surcharge ?? 0,
    decorationTechniques: design.images.map((image) => image.technique),
    namePerPerson: false,
    quantities: { M: 1 }, // satu pcs ukuran M saja, supaya yang dibaca adalah harga per pcs
    shippingFee: 0,
    fees: catalog.fees,
  }).total;
}

/** Posisi preset berikutnya untuk logo yang sudah ada (dipakai saat kategori berganti). */
export function resetPositions<T extends { position: string }>(items: T[]): T[] {
  return items.map((item, index) => ({ ...item, position: POSITION_KEYS[index % POSITION_KEYS.length] }));
}
