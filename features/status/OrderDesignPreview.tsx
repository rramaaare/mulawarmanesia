/**
 * OrderDesignPreview: menggambar ulang desain pesanan (depan & belakang) dari
 * `designJson` yang tersimpan di database. Inilah gunanya menyimpan desain sebagai
 * data (bukan gambar): hasilnya bisa dirender persis sama kapan saja.
 *  - `separate` = dua kotak terpisah dengan keterangan di bawahnya (halaman admin);
 *  - default    = satu kotak berisi dua sisi (halaman status pelanggan).
 */
import { Garment, type GarmentImage, type GarmentText } from "@/components/Garment";
import { toPaints } from "@/lib/domain/paint";
import { THREAD_COLORS, type PositionKey, type ProductType } from "@/features/editor/garment-data";
import type { Catalog } from "@/server/services/catalog-service";
import type { OrderView } from "@/server/services/order-view-service";

/** Bentuk designJson yang disimpan saat checkout. */
export interface StoredDesign {
  product: ProductType;
  /** Model baju; kosong untuk pesanan lama (diambil dari kategori). */
  model?: string;
  colors: Record<string, string>;
  images: { fileName: string; position: PositionKey; technique?: string; label?: string }[];
  texts: { content: string; font: string; color: string; position: PositionKey }[];
}

interface OrderDesignPreviewProps {
  order: OrderView;
  catalog: Catalog;
  separate?: boolean;
  /** Tinggi gambar garmen (kelas Tailwind), mis. "h-44". */
  heightClass?: string;
}

export function OrderDesignPreview({ order, catalog, separate = false, heightClass = "h-44" }: OrderDesignPreviewProps) {
  const design = order.item.designJson as StoredDesign;
  const model = design.model ?? order.item.categoryModel ?? undefined;
  const colors = toPaints(design.colors, catalog.colors);
  const images: GarmentImage[] = design.images.map((image) => ({ src: `/api/uploads/${image.fileName}`, position: image.position }));
  const texts: GarmentText[] = design.texts.map((text) => ({
    content: text.content,
    fontName: text.font,
    colorHex: THREAD_COLORS.find((color) => color.name === text.color)?.hex ?? "#FFFFFF",
    position: text.position,
  }));
  const sides = [
    { side: "front" as const, label: "Depan" },
    { side: "back" as const, label: "Belakang" },
  ];

  if (separate) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {sides.map(({ side, label }) => (
          <figure key={side} className="flex flex-col gap-2">
            <div className="flex items-center justify-center rounded-card border-2 border-line bg-subtle p-4">
              <Garment product={design.product} model={model} colors={colors} side={side} images={images} texts={texts} className={`w-auto ${heightClass}`} />
            </div>
            <figcaption className="text-xs text-ink-muted">{label}</figcaption>
          </figure>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 rounded-card border-2 border-ink bg-subtle p-3">
      {sides.map(({ side, label }) => (
        <figure key={side} className="text-center">
          <Garment product={design.product} model={model} colors={colors} side={side} images={images} texts={texts} className={`mx-auto w-auto ${heightClass}`} />
          <figcaption className="text-xs text-ink-muted">{label}</figcaption>
        </figure>
      ))}
    </div>
  );
}
