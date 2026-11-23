// Tes pengumuman landing: aturan tampil (murni) dan penyimpanan ke tabel Setting (database sungguhan).
import "dotenv/config";
import { afterAll, describe, expect, it } from "vitest";
import { activeAnnouncement, DEFAULT_ANNOUNCEMENT } from "@/lib/domain/announcement";
import { db } from "@/server/db";
import { getAnnouncement, updateAnnouncement } from "@/server/services/announcement-service";

const ACTOR = "tes-pengumuman@example.test";

afterAll(async () => {
  // Kembalikan ke bawaan (hapus baris pengumuman) dan bersihkan jejak audit tes
  await db.setting.deleteMany({ where: { key: { startsWith: "announce_" } } });
  await db.auditLog.deleteMany({ where: { actorEmail: ACTOR } });
  await db.$disconnect();
});

describe("aturan tampil pengumuman", () => {
  it("bawaan: label dan keempat pesan pita tampil", () => {
    const shown = activeAnnouncement(DEFAULT_ANNOUNCEMENT);
    expect(shown.badge).toBe("PO Batch November");
    expect(shown.ticker).toHaveLength(4);
  });

  it("pesan yang dimatikan atau kosong tidak tampil, label mati = null", () => {
    const shown = activeAnnouncement({
      badge: { on: false, text: "PO Batch Desember" },
      ticker: [
        { on: true, text: "  MINIMAL ORDER 12 PCS  " },
        { on: false, text: "KIRIM KE SELURUH INDONESIA" },
        { on: true, text: "   " },
      ],
    });
    expect(shown.badge).toBeNull();
    expect(shown.ticker).toEqual(["MINIMAL ORDER 12 PCS"]);
  });
});

describe("penyimpanan pengumuman", () => {
  it("menyimpan lalu membaca ulang sama persis, dan mencatat audit", async () => {
    const saved = await updateAnnouncement(ACTOR, {
      badge: { on: true, text: "PO Batch Desember" },
      ticker: [
        { on: true, text: "PO BATCH DESEMBER DIBUKA" },
        { on: false, text: "PRODUKSI 10–14 HARI KERJA" },
        { on: false, text: "" }, // baris kosong yang dimatikan dibuang saat disimpan
      ],
    });
    expect(saved.ticker).toHaveLength(2);

    const read = await getAnnouncement();
    expect(read.badge).toEqual({ on: true, text: "PO Batch Desember" });
    expect(read.ticker).toEqual([
      { on: true, text: "PO BATCH DESEMBER DIBUKA" },
      { on: false, text: "PRODUKSI 10–14 HARI KERJA" },
    ]);

    const log = await db.auditLog.findFirst({ where: { actorEmail: ACTOR, action: "pengumuman_diubah" } });
    expect(log?.detail).toContain("PO Batch Desember");
  });

  it("menolak label yang dinyalakan tapi kosong, dan pesan lebih dari 6", async () => {
    await expect(updateAnnouncement(ACTOR, { badge: { on: true, text: "" }, ticker: [] })).rejects.toThrow(/Isi label/);
    const seven = Array.from({ length: 7 }, (_, index) => ({ on: true, text: `PESAN ${index}` }));
    await expect(updateAnnouncement(ACTOR, { badge: { on: false, text: "" }, ticker: seven })).rejects.toThrow(/Maksimal 6/);
  });

  it("tanpa pengaturan tersimpan, memakai bawaan", async () => {
    await db.setting.deleteMany({ where: { key: { startsWith: "announce_" } } });
    const read = await getAnnouncement();
    expect(read.badge.text).toBe("PO Batch November");
    expect(read.ticker).toHaveLength(4);
  });
});
