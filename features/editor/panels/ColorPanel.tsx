"use client";
/**
 * Panel Warna: pilih bagian garmen lalu pilih warna kain dari palet stok, atau motif (mis. batik).
 * Warna yang habis tampil abu bersilang dan tidak bisa diklik (PRD §8.3, §10.2).
 */
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { Catalog } from "@/server/services/catalog-service";
import { MOTIFS, findMotif } from "@/lib/domain/constants";
import { defaultColorsFor, partsFor, type ProductType } from "../garment-data";

interface ColorPanelProps {
  catalog: Catalog;
  product: ProductType;
  /** Model PDH; menentukan bagian apa saja yang bisa diwarnai. */
  model?: string;
  /** Nama bagian -> nama warna yang sedang dipakai. */
  colors: Record<string, string>;
  onChangeColor: (part: string, colorName: string) => void;
}

export function ColorPanel({ catalog, product, model, colors, onChangeColor }: ColorPanelProps) {
  const parts = partsFor(product, model);
  const [activePart, setActivePart] = useState(parts[0]);
  // Jika produk berganti dan bagian aktif tidak ada lagi, pakai bagian pertama
  const part = parts.includes(activePart) ? activePart : parts[0];
  /** Warna polos terakhir yang dipilih per bagian (dipakai saat motif dilepas lewat "None"). */
  const lastPlain = useRef<Record<string, string>>({});
  const hasMotif = Boolean(findMotif(colors[part]));

  /** Melepas motif: kembali ke warna polos terakhir, warna bawaan model, warna Badan, atau warna stok pertama. */
  function removeMotif() {
    if (!hasMotif) return;
    const isPlain = (name: string | undefined): name is string => Boolean(name) && !findMotif(name);
    const candidates = [lastPlain.current[part], defaultColorsFor(product, model)[part], colors["Badan"]];
    const plain = candidates.find(isPlain) ?? catalog.colors.find((color) => color.inStock)?.name;
    if (plain) onChangeColor(part, plain);
  }

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
          {part}: <span className="text-accent">{colors[part]}</span>
        </p>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Warna polos</p>
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
                  onClick={() => {
                    lastPlain.current[part] = color.name;
                    onChangeColor(part, color.name);
                  }}
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

      {/* Motif kain: bisa dipakai di bagian mana pun sebagai pengganti warna polos */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Motif</p>
        <ul className="grid grid-cols-3 gap-2">
          {/* None: lepas motif, bagian kembali ke warna polos */}
          <li>
            <button
              type="button"
              aria-label="Tanpa motif"
              aria-pressed={!hasMotif}
              onClick={removeMotif}
              className={cn(
                "relative mx-auto flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-ink bg-disabled",
                !hasMotif && "outline outline-[3px] outline-offset-2 outline-accent",
              )}
            >
              {/* Ikon "tanpa": lingkaran abu-abu dengan garis miring */}
              <span className="h-[3px] w-[130%] -rotate-45 bg-ink" aria-hidden />
            </button>
            <span className="mt-1 block truncate text-center text-xs text-ink-soft">None</span>
          </li>
          {MOTIFS.map((motif) => {
            const selected = colors[part] === motif.name;
            return (
              <li key={motif.slug}>
                <button
                  type="button"
                  aria-label={`Motif ${motif.name}`}
                  aria-pressed={selected}
                  onClick={() => onChangeColor(part, motif.name)}
                  className={cn(
                    "h-12 w-full rounded-control border-2 border-ink bg-cover bg-center",
                    selected && "outline outline-[3px] outline-offset-2 outline-accent",
                  )}
                  style={{ backgroundImage: `url(${motif.src})` }}
                />
                <span className="mt-1 block truncate text-center text-xs text-ink-soft">{motif.name}</span>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs text-ink-muted">Motif dicetak/dijahit sesuai kain yang tersedia; letak motif di baju asli bisa sedikit berbeda. Pilih None untuk melepas motif.</p>
      </div>
    </div>
  );
}
