/**
 * File ini untuk apa:
 * Fungsi-fungsi kecil (murni) untuk bekerja dengan desain: membuat desain awal,
 * mengubah nama warna menjadi kode hex untuk gambar, menghitung estimasi harga,
 * dan mengetahui apakah pengguna sudah mengubah template.
 */
import { type GarmentImage, type GarmentText } from "@/components/Garment";
import { toPaints } from "@/lib/domain/paint";
import { calculatePrice } from "@/lib/domain/pricing";
import type { Catalog } from "@/server/services/catalog-service";
import { THREAD_COLORS, defaultColorsFor, partsFor, positionKeysFor, resolveModel, type PositionKey, type ProductType } from "./garment-data";
import type { DesignState } from "./types";

/**
 * Membuat desain awal. Jika `categoryId` diberikan dan valid dipakai itu,
 * jika tidak, PDH + kategori pertama (editor tidak pernah kosong, PRD §8.2).
 */
export function createInitialDesign(catalog: Catalog, categoryId?: number): DesignState {
  const category = catalog.categories.find((item) => item.id === categoryId) ?? catalog.categories.find((item) => item.product === "PDH") ?? catalog.categories[0];
  const material = catalog.materials.find((item) => item.product === category.product) ?? catalog.materials[0];
  const model = resolveModel(category.product, category.designModel);
  return {
    product: category.product,
    model,
    categoryId: category.id,
    materialId: material.id,
    colors: defaultColorsFor(category.product, model),
    images: [],
    texts: [],
  };
}

/** Apakah pengguna sudah mengubah sesuatu dari template (warna berbeda, ada logo/teks)? */
export function isDesignModified(design: DesignState): boolean {
  const defaults = defaultColorsFor(design.product, design.model);
  const colorChanged = Object.entries(defaults).some(([part, color]) => design.colors[part] !== color);
  return colorChanged || design.images.length > 0 || design.texts.length > 0;
}

/**
 * Mengganti model (produk sama). Desain yang belum diubah memakai isi bawaan model baru;
 * desain yang sudah diubah mempertahankan warna bagian yang sama, bagian baru diisi bawaan.
 */
export function withModel(design: DesignState, model: string): DesignState {
  const defaults = defaultColorsFor(design.product, model);
  const keepColors = isDesignModified(design);
  const colors = Object.fromEntries(
    partsFor(design.product, model).map((part) => [part, (keepColors ? design.colors[part] : undefined) ?? defaults[part]]),
  );
  return { ...design, model, colors };
}

/**
 * Menyelaraskan desain (mis. draf lama) dengan kategorinya: model = model kategori, bagian disesuaikan
 * dengan model itu (isi lama dipertahankan, "Tutup saku" lama dibaca sebagai "Saku"), dan posisi
 * logo/teks yang tidak ada di produk itu (mis. lengan di VEST) dipindah ke posisi yang ada.
 */
export function syncModelWithCategory(design: DesignState, catalog: Catalog): DesignState {
  const category = catalog.categories.find((item) => item.id === design.categoryId);
  if (!category || category.product !== design.product) return design;
  const model = resolveModel(design.product, category.designModel);
  const parts = partsFor(design.product, model);
  const images = fitPositions(design.product, design.images);
  const texts = fitPositions(design.product, design.texts);
  const inSync = model === design.model && parts.every((part) => part in design.colors) && Object.keys(design.colors).every((part) => parts.includes(part));
  if (inSync) return { ...design, images, texts };
  const defaults = defaultColorsFor(design.product, model);
  const legacy: Record<string, string | undefined> = { Saku: design.colors["Tutup saku"] };
  const colors = Object.fromEntries(parts.map((part) => [part, design.colors[part] ?? legacy[part] ?? defaults[part]]));
  return { ...design, model, colors, images, texts };
}

/** Mengubah { Badan: "Navy", Bahu: "Batik Hijau" } menjadi cat untuk gambar (hex atau motif). */
export function colorsToHex(colors: Record<string, string>, catalog: Catalog): Record<string, string> {
  return toPaints(colors, catalog.colors);
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

/** Posisi preset berikutnya untuk logo/teks yang sudah ada (dipakai saat produk berganti). */
export function resetPositions<T extends { position: PositionKey }>(product: ProductType, items: T[]): T[] {
  const keys = positionKeysFor(product);
  return items.map((item, index) => ({ ...item, position: keys[index % keys.length] }));
}

/** Memindahkan logo/teks yang posisinya tidak ada di produk ini; yang lain dibiarkan. */
function fitPositions<T extends { position: PositionKey }>(product: ProductType, items: T[]): T[] {
  const keys = positionKeysFor(product);
  return items.map((item, index) => (keys.includes(item.position) ? item : { ...item, position: keys[index % keys.length] }));
}
