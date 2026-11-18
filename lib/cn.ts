/**
 * File ini untuk apa:
 * Fungsi kecil `cn` untuk menggabungkan nama class CSS. Class yang bernilai
 * false/null/undefined dibuang, sehingga kondisi bisa ditulis ringkas:
 *   cn("p-4", aktif && "bg-accent")
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
