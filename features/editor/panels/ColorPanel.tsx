"use client";
/**
 * Panel Warna: pilih bagian garmen lalu pilih warna kain dari palet stok.
 * Warna yang habis tampil abu bersilang dan tidak bisa diklik (PRD §8.3, §10.2).
 */
import { useState } from "react";
import { cn } from "@/lib/cn";
import type { Catalog } from "@/server/services/catalog-service";
import { GARMENT_PARTS, type ProductType } from "../garment-data";

interface ColorPanelProps {
  catalog: Catalog;
  product: ProductType;
  /** Nama bagian -> nama warna yang sedang dipakai. */
  colors: Record<string, string>;
  onChangeColor: (part: string, colorName: string) => void;
}

export function ColorPanel({ catalog, product, colors, onChangeColor }: ColorPanelProps) {
  const parts = GARMENT_PARTS[product];
  const [activePart, setActivePart] = useState(parts[0]);
  // Jika produk berganti dan bagian aktif tidak ada lagi, pakai bagian pertama
  const part = parts.includes(activePart) ? activePart : parts[0];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-sm font-semibold">Bagian garmen</p>
        <div className="flex flex-wrap gap-2">
          {parts.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={part === item}
              onClick={() => setActivePart(item)}
              className={cn(
                "rounded-full border-2 border-ink px-3 py-1 text-xs font-semibold",
                part === item ? "bg-ink text-white" : "bg-surface hover:bg-subtle",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">
          Warna {part}: <span className="text-accent">{colors[part]}</span>
        </p>
        <ul className="grid grid-cols-5 gap-1.5 sm:gap-2 lg:grid-cols-4 lg:gap-3">
          {catalog.colors.map((color) => {
            const selected = colors[part] === color.name;
            return (
              <li key={color.name}>
                <button
                  type="button"
                  disabled={!color.inStock}
                  aria-label={color.inStock ? color.name : `${color.name} (stok habis)`}
                  aria-pressed={selected}
                  onClick={() => onChangeColor(part, color.name)}
                  className={cn(
                    "relative h-11 w-full rounded-control border-2 border-ink lg:h-12",
                    selected && "outline outline-[3px] outline-offset-2 outline-accent",
                    !color.inStock && "cursor-not-allowed opacity-40",
                  )}
                  style={{ backgroundColor: color.hex }}
                >
                  {!color.inStock && <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-ink" aria-hidden>✕</span>}
                </button>
                <span className="mt-1 block truncate text-center text-xs text-ink-soft">{color.name}</span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-ink-muted">Warna hanya dari kain yang tersedia di stok. Warna layar bisa sedikit berbeda dari kain asli.</p>
      </div>
    </div>
  );
}
