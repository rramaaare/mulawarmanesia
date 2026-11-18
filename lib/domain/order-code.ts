/**
 * File ini untuk apa:
 * Membuat dan memeriksa nomor pesanan berformat MLW-YYMM-NNNN (mis. MLW-2611-0042).
 */

/** Pola nomor pesanan yang valid. */
const ORDER_CODE_PATTERN = /^MLW-\d{4}-\d{4}$/;

/** Mengubah tanggal menjadi periode "YYMM", mis. 18 Nov 2026 -> "2611". */
export function periodOf(date: Date): string {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}${month}`;
}

/** Menyusun nomor pesanan dari periode dan urutan, mis. ("2611", 42) -> "MLW-2611-0042". */
export function buildOrderCode(period: string, sequence: number): string {
  return `MLW-${period}-${String(sequence).padStart(4, "0")}`;
}

/**
 * Merapikan input pelanggan: buang spasi, jadikan huruf besar.
 * Mengembalikan null jika formatnya tidak sesuai.
 */
export function normalizeOrderCode(input: string): string | null {
  const cleaned = input.replace(/\s+/g, "").toUpperCase();
  return ORDER_CODE_PATTERN.test(cleaned) ? cleaned : null;
}
