/**
 * File ini untuk apa:
 * Aturan murni untuk "pengumuman landing page": label PO batch di hero dan pita merah berjalan di
 * paling atas. Isinya diatur superadmin di halaman Pengaturan; bila belum pernah diatur, dipakai
 * nilai bawaan di bawah (sama dengan teks yang dulu ditulis tetap di kode).
 */

/** Batas panjang teks dan jumlah pesan pita. */
export const ANNOUNCEMENT_LIMITS = { badge: 40, tickerText: 70, tickerMax: 6 } as const;

/** Satu teks pengumuman: tampil bila `on` dan tidak kosong. */
export interface AnnouncementItem {
  on: boolean;
  text: string;
}

/** Seluruh pengumuman landing: satu label di hero + daftar pesan di pita (urutan = urutan tampil). */
export interface Announcement {
  badge: AnnouncementItem;
  ticker: AnnouncementItem[];
}

/** Nilai bawaan: sama dengan teks landing sebelum bisa diatur. */
export const DEFAULT_ANNOUNCEMENT: Announcement = {
  badge: { on: true, text: "PO Batch November" },
  ticker: [
    { on: true, text: "PO BATCH NOVEMBER DIBUKA" },
    { on: true, text: "MINIMAL ORDER 12 PCS" },
    { on: true, text: "PRODUKSI 10–14 HARI KERJA" },
    { on: true, text: "KIRIM KE SELURUH INDONESIA" },
  ],
};

/** Salinan nilai bawaan yang aman diubah (tidak menimpa konstanta). */
export function defaultAnnouncement(): Announcement {
  return { badge: { ...DEFAULT_ANNOUNCEMENT.badge }, ticker: DEFAULT_ANNOUNCEMENT.ticker.map((item) => ({ ...item })) };
}

/** Bagian yang benar-benar ditampilkan di landing: label hero (atau null bila mati) dan pesan pita yang aktif. */
export function activeAnnouncement(announcement: Announcement): { badge: string | null; ticker: string[] } {
  const badge = announcement.badge.on && announcement.badge.text.trim() ? announcement.badge.text.trim() : null;
  const ticker = announcement.ticker.filter((item) => item.on && item.text.trim()).map((item) => item.text.trim());
  return { badge, ticker };
}
