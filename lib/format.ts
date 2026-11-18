/**
 * File ini untuk apa:
 * Fungsi kecil untuk menampilkan angka dan tanggal dalam format Indonesia.
 */

/** 4048000 -> "Rp 4.048.000" */
export function formatRupiah(amount: number): string {
  return "Rp " + amount.toLocaleString("id-ID");
}

/** Tanggal dan jam dalam zona WITA, mis. "16 Nov 2026, 19.20 WITA". */
export function formatDateTimeWita(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const text = date.toLocaleString("id-ID", {
    timeZone: "Asia/Makassar",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${text} WITA`;
}

/** Tanggal pendek, mis. "16 Nov". */
export function formatDateShort(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("id-ID", {
    timeZone: "Asia/Makassar",
    day: "numeric",
    month: "short",
  });
}

/** Rupiah ringkas: 185600000 -> "Rp 185,6 jt"; di bawah 1 juta ditulis lengkap. */
export function formatRupiahCompact(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} jt`;
  }
  return formatRupiah(amount);
}

/** Tanggal tanpa tahun ke bentuk "18 Okt". */
export function formatDayMonth(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("id-ID", { timeZone: "Asia/Makassar", day: "numeric", month: "short" });
}

/** Tanggal panjang: "16 Nov 2026". */
export function formatDateLong(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("id-ID", { timeZone: "Asia/Makassar", day: "numeric", month: "short", year: "numeric" });
}
