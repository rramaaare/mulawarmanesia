/**
 * File ini untuk apa:
 * Class CSS yang dipakai bersama oleh semua kontrol form (input, select, textarea)
 * supaya tampilannya seragam. Dipisah dari komponen agar tidak saling mengimpor.
 */

/** Class dasar semua kontrol input. */
export const CONTROL =
  "w-full rounded-control border-2 bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none";

/** Class garis: tebal dan merah tua saat error, hitam saat normal. */
export function borderClass(error?: string): string {
  return error ? "border-danger border-[3px]" : "border-ink";
}
