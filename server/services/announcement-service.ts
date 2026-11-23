/**
 * File ini untuk apa:
 * Membaca dan menyimpan pengumuman landing page (label PO batch + pita merah) yang diatur superadmin.
 * Disimpan di tabel Setting (kunci berawalan "announce_"), jadi tidak perlu tabel baru. Satu pesan =
 * dua baris: teks dan penanda aktif. Bila belum pernah disimpan, dipakai nilai bawaan
 * (lib/domain/announcement.ts). Penyimpanan dan catatan audit berada dalam satu transaksi.
 */
import { db } from "@/server/db";
import {
  ANNOUNCEMENT_LIMITS,
  activeAnnouncement,
  defaultAnnouncement,
  type Announcement,
} from "@/lib/domain/announcement";
import { announcementSchema } from "@/lib/validation/master-data";
import { writeAudit } from "./audit-service";

/** Awalan kunci semua pengaturan pengumuman di tabel Setting. */
const PREFIX = "announce_";

/** Klien database apa pun yang punya tabel Setting (db biasa atau `tx` di dalam transaksi). */
type SettingsClient = Pick<typeof db, "setting">;

/** Membaca pengumuman; bila belum pernah disimpan, mengembalikan nilai bawaan. */
export async function getAnnouncement(client: SettingsClient = db): Promise<Announcement> {
  const rows = await client.setting.findMany({ where: { key: { startsWith: PREFIX } } });
  if (rows.length === 0) return defaultAnnouncement();
  const map = new Map(rows.map((row) => [row.key, row.value]));
  const ticker: Announcement["ticker"] = [];
  for (let index = 0; index < ANNOUNCEMENT_LIMITS.tickerMax; index++) {
    const text = map.get(`${PREFIX}t${index}_text`);
    if (text) ticker.push({ text, on: map.get(`${PREFIX}t${index}_on`) !== "0" });
  }
  return {
    badge: { on: map.get(`${PREFIX}badgeOn`) !== "0", text: map.get(`${PREFIX}badgeText`) ?? "" },
    ticker,
  };
}

/** Bagian pengumuman yang tampil di landing (dipakai halaman publik). */
export async function getActiveAnnouncement(): Promise<{ badge: string | null; ticker: string[] }> {
  return activeAnnouncement(await getAnnouncement());
}

/** Menyimpan pengumuman baru (divalidasi) dan mencatatnya di audit log dalam satu transaksi. */
export async function updateAnnouncement(actorEmail: string, rawInput: unknown): Promise<Announcement> {
  const input = announcementSchema.parse(rawInput);
  // Baris kosong (tanpa teks) tidak disimpan; urutan pesan yang tersisa dipertahankan
  const next: Announcement = { badge: input.badge, ticker: input.ticker.filter((item) => item.text) };

  return db.$transaction(async (tx) => {
    const rows = [
      { key: `${PREFIX}badgeOn`, value: next.badge.on ? "1" : "0" },
      { key: `${PREFIX}badgeText`, value: next.badge.text },
      ...next.ticker.flatMap((item, index) => [
        { key: `${PREFIX}t${index}_text`, value: item.text },
        { key: `${PREFIX}t${index}_on`, value: item.on ? "1" : "0" },
      ]),
    ];
    await tx.setting.deleteMany({ where: { key: { startsWith: PREFIX } } });
    await tx.setting.createMany({ data: rows });

    const shown = activeAnnouncement(next);
    await writeAudit(
      tx,
      actorEmail,
      "pengumuman_diubah",
      "Pengumuman landing",
      `label PO ${shown.badge ? `"${shown.badge}"` : "dimatikan"}; ${shown.ticker.length} dari ${next.ticker.length} pesan pita tampil`,
    );
    return next;
  });
}
