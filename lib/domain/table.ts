/**
 * File ini untuk apa:
 * Bentuk data tabel sederhana yang dipakai bersama oleh server (yang menyusun datanya) dan
 * komponen PagedTable di browser (yang menampilkannya).
 */

/** Isi satu sel: teks/angka biasa, atau tautan. */
export type Cell = string | number | { text: string; href: string };

/** Tabel: judul kolom, baris, dan (opsional) rata kiri/kanan tiap kolom. */
export interface TableData {
  columns: string[];
  rows: Cell[][];
  align?: ("left" | "right")[];
}
