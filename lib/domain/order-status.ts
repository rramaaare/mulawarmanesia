/**
 * File ini untuk apa:
 * Aturan perpindahan status pesanan (PRD §7 dan §10.7).
 * Status hanya boleh maju satu tahap, kecuali bolak-balik cek_desain <-> perlu_revisi.
 * Dipakai server (penjaga utama) dan tampilan admin (menampilkan tombol yang boleh).
 */

/** Nama status (sama dengan enum OrderStatus di database). */
export type StatusName =
  | "menunggu_pembayaran"
  | "kedaluwarsa"
  | "dibayar"
  | "cek_desain"
  | "perlu_revisi"
  | "produksi"
  | "qc"
  | "siap_kirim"
  | "dikirim"
  | "selesai"
  | "dibatalkan";

/** Urutan tahap utama pesanan yang sudah dibayar. */
const MAIN_FLOW: StatusName[] = [
  "dibayar",
  "cek_desain",
  "produksi",
  "qc",
  "siap_kirim",
  "dikirim",
  "selesai",
];

/** Label yang dibaca manusia untuk tiap status. */
export const STATUS_LABEL: Record<StatusName, string> = {
  menunggu_pembayaran: "Menunggu pembayaran",
  kedaluwarsa: "Kedaluwarsa",
  dibayar: "Dibayar",
  cek_desain: "Cek desain",
  perlu_revisi: "Perlu revisi",
  produksi: "Produksi",
  qc: "QC & pengemasan",
  siap_kirim: "Siap kirim",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

/**
 * Label status sesuai cara pengiriman: pesanan "Ambil di workshop" tidak dikirim kurir,
 * jadi tahap siap_kirim/dikirim dibaca "Siap diambil"/"Sudah diambil".
 */
export function statusLabelFor(status: StatusName, shippingMethod: "KIRIM" | "AMBIL"): string {
  if (shippingMethod === "AMBIL") {
    if (status === "siap_kirim") return "Siap diambil";
    if (status === "dikirim") return "Sudah diambil";
  }
  return STATUS_LABEL[status];
}

/** Tahap yang tampil di timeline pelanggan (8 tahap, PRD §8.8). */
export const TIMELINE_STEPS: StatusName[] = [
  "menunggu_pembayaran",
  "dibayar",
  "cek_desain",
  "produksi",
  "qc",
  "siap_kirim",
  "dikirim",
  "selesai",
];

/** Status yang menunggu tindakan admin (ditandai merah di dashboard). */
export const ADMIN_ACTION_STATUSES: StatusName[] = ["dibayar", "cek_desain", "siap_kirim"];

/**
 * Daftar status tujuan yang BOLEH dari status sekarang.
 * Contoh: dari "dibayar" hanya boleh ke "cek_desain".
 */
export function allowedNextStatuses(current: StatusName): StatusName[] {
  if (current === "cek_desain") return ["produksi", "perlu_revisi"];
  if (current === "perlu_revisi") return ["cek_desain"];

  const index = MAIN_FLOW.indexOf(current);
  if (index === -1 || index === MAIN_FLOW.length - 1) return [];
  return [MAIN_FLOW[index + 1]];
}

/** Menjawab: apakah perpindahan dari status `from` ke `to` diizinkan? */
export function canChangeStatus(from: StatusName, to: StatusName): boolean {
  return allowedNextStatuses(from).includes(to);
}

/** Status setelah "produksi" mengunci desain: pelanggan tidak bisa minta revisi. */
export function isDesignLocked(status: StatusName): boolean {
  return ["produksi", "qc", "siap_kirim", "dikirim", "selesai"].includes(status);
}
