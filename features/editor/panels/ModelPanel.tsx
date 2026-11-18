"use client";
/**
 * Panel Model & kategori: pilih produk (PDH/VEST), kategori desain, dan bahan.
 * Kategori = template awal. Harga "mulai" tiap kategori datang dari database (props).
 */
import { Card } from "@/components/ui/Card";
import { Field, SelectInput } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";
import type { Catalog } from "@/server/services/catalog-service";
import type { ProductType } from "../garment-data";

interface ModelPanelProps {
  catalog: Catalog;
  product: ProductType;
  categoryId: number;
  materialId: number;
  /** Dipanggil saat pengguna memilih kategori (editor yang memutuskan perlu konfirmasi atau tidak). */
  onSelectCategory: (categoryId: number) => void;
  onSelectMaterial: (materialId: number) => void;
}

const PRODUCTS: ProductType[] = ["PDH", "VEST"];

export function ModelPanel({ catalog, product, categoryId, materialId, onSelectCategory, onSelectMaterial }: ModelPanelProps) {
  const categories = catalog.categories.filter((category) => category.product === product);
  const materials = catalog.materials.filter((material) => material.product === product);

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

      {/* Kartu kategori */}
      <ul className="flex flex-col gap-2">
        {categories.map((category, index) => {
          const selected = category.id === categoryId;
          return (
            <li key={category.id}>
              <button type="button" aria-pressed={selected} onClick={() => onSelectCategory(category.id)} className="w-full text-left">
                {/* Kartu di dalam kartu: bayangan kecil + efek ditekan saat diklik */}
                <Card pressable shadow={selected ? "accent" : "sm"} tone={selected ? "pink" : "white"} className={cn("flex items-center gap-3 p-3", selected && "border-accent")}>
                  <span className="text-sm font-semibold text-accent">{String(index + 1).padStart(2, "0")}</span>
                  <span className="flex-1 text-sm font-semibold">{category.name}</span>
                  <span className="text-xs text-ink-soft">Mulai {formatRupiah(category.basePrice)}</span>
                </Card>
              </button>
            </li>
          );
        })}
      </ul>

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
