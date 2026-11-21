/**
 * File ini untuk apa:
 * Mengubah isi bagian desain (nama warna kain atau nama motif) menjadi "cat" untuk gambar baju.
 * Fungsi biasa (bukan komponen client), jadi bisa dipakai di halaman server maupun browser.
 */
import { findMotif } from "./constants";

const FALLBACK = "#CCCCCC";

/** ID pola SVG untuk sebuah motif. */
export const motifId = (slug: string) => `mlw-motif-${slug}`;

/**
 * Mengubah { Badan: "Navy", Bahu: "Batik Hijau" } (nama dari palet/motif) menjadi cat untuk Garment:
 * kode hex untuk warna polos, `url(#...)` untuk motif.
 */
export function toPaints(colors: Record<string, string>, palette: { name: string; hex: string }[]): Record<string, string> {
  const hexByName = new Map(palette.map((color) => [color.name, color.hex]));
  return Object.fromEntries(
    Object.entries(colors).map(([part, name]) => {
      const motif = findMotif(name);
      return [part, motif ? `url(#${motifId(motif.slug)})` : (hexByName.get(name) ?? FALLBACK)];
    }),
  );
}

