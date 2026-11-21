"use client";
/**
 * Panel Model: pilih produk (PDH/VEST), lalu model baju dari mockup, dan bahan.
 * Satu kategori = satu model. Harga "mulai" tiap model datang dari database (props).
 */
import { Garment } from "@/components/Garment";
import { Field, SelectInput } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";
import type { Catalog } from "@/server/services/catalog-service";
import { colorsToHex } from "../design-helpers";
import { MODEL_INFO, defaultColorsFor, resolveModel, type ProductType } from "../garment-data";

interface ModelPanelProps {
  catalog: Catalog;
  product: ProductType;
  /** Warna desain saat ini (hex/motif), supaya thumbnail model terpilih tampil dengan warna pengguna. */
  hexColors: Record<string, string>;
  categoryId: number;
  materialId: number;
  /** Dipanggil saat pengguna memilih model/produk (editor yang memutuskan perlu konfirmasi atau tidak). */
  onSelectCategory: (categoryId: number) => void;
  onSelectMaterial: (materialId: number) => void;
}

const PRODUCTS: ProductType[] = ["PDH", "VEST"];

export function ModelPanel({ catalog, product, hexColors, categoryId, materialId, onSelectCategory, onSelectMaterial }: ModelPanelProps) {
  const categories = catalog.categories.filter((category) => category.product === product);
  const materials = catalog.materials.filter((material) => material.product === product);
  const activeModel = resolveModel(product, categories.find((category) => category.id === categoryId)?.designModel);

  return (
    <div className="flex flex-col gap-5">
      {/* Tab produk */}
      <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Produk">
        {PRODUCTS.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={product === item}
            onClick={() => {
              const first = catalog.categories.find((category) => category.product === item);
              if (first && item !== product) onSelectCategory(first.id);
            }}
            className={cn(
              "rounded-control border-2 border-ink px-3 py-2 text-sm font-semibold",
              product === item ? "bg-ink text-white shadow-hard-sm" : "bg-surface hover:bg-subtle",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Satu kartu = satu model: gambar + ciri + harga dasar */}
      <div>
        <p className="mb-2 text-sm font-semibold">
          Model {product === "PDH" ? "kemeja" : "rompi"}: <span className="text-accent">Model {activeModel}</span>
        </p>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2" aria-label={`Model ${product}`}>
          {categories.map((category) => {
            const model = resolveModel(product, category.designModel);
            const selected = category.id === categoryId;
            // Model terpilih memakai warna desain; model lain memakai warna bawaannya (agar ciri modelnya terlihat)
            const thumbColors = selected ? hexColors : colorsToHex(defaultColorsFor(product, model), catalog);
            return (
              <li key={category.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  aria-label={`${category.name}: ${MODEL_INFO[product][model]}, mulai ${formatRupiah(category.basePrice)}`}
                  onClick={() => onSelectCategory(category.id)}
                  className={cn(
                    "flex w-full flex-col items-center gap-1 rounded-control border-2 p-2 text-center transition-colors",
                    selected ? "border-accent bg-accent-subtle outline outline-2 outline-offset-1 outline-accent" : "border-ink bg-surface hover:bg-subtle",
                  )}
                >
                  <Garment product={product} model={model} colors={thumbColors} className="h-20 w-auto" />
                  <span className="text-sm font-semibold">{category.name}</span>
                  <span className="text-[11px] leading-tight text-ink-muted">{MODEL_INFO[product][model]}</span>
                  <span className="text-xs font-semibold text-accent">Mulai {formatRupiah(category.basePrice)}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs text-ink-muted">Ganti model tidak mengubah warna, logo, dan teks yang sudah diatur. Warna & motif tiap bagian diatur di tab Warna.</p>
      </div>

      <Field label="Bahan" hint={materials.find((item) => item.id === materialId)?.surcharge ? "Bahan ini menambah harga per pcs." : "Termasuk dalam harga dasar."}>
        {(props) => (
          <SelectInput {...props} value={materialId} onChange={(event) => onSelectMaterial(Number(event.target.value))}>
            {materials.map((material) => (
              <option key={material.id} value={material.id}>
                {material.name}{material.surcharge ? ` (+${formatRupiah(material.surcharge)})` : ""}
              </option>
            ))}
          </SelectInput>
        )}
      </Field>
    </div>
  );
}
