/**
 * File ini untuk apa:
 * Tabel panduan ukuran (lingkar dada dan panjang badan) yang dipakai bersama oleh
 * dialog "Panduan ukuran" di halaman Pesanan dan halaman /panduan-ukuran.
 * Angka contoh; ganti dengan ukuran asli workshop.
 */

/** Baris tabel: ukuran, lingkar dada (cm), panjang badan (cm). */
export const SIZE_GUIDE = [
  { size: "S", chest: 96, length: 68 },
  { size: "M", chest: 100, length: 70 },
  { size: "L", chest: 104, length: 72 },
  { size: "XL", chest: 110, length: 74 },
  { size: "XXL", chest: 116, length: 76 },
  { size: "XXXL", chest: 122, length: 78 },
] as const;
