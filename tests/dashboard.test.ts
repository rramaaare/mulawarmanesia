// Tes integrasi dashboard (dashboard-service): angka kartu, rentang waktu, dan bagian Sistem per peran.
// Berjalan ke database MySQL sungguhan (perlu `npx prisma db seed` dan sebaiknya `npm run seed:demo`).
import "dotenv/config";
import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { getDashboard, parseRange } from "@/server/services/dashboard-service";

afterAll(async () => {
  await db.$disconnect();
});

describe("parseRange", () => {
  it("memakai 30 hari untuk nilai kosong atau aneh, dan menerima nilai yang sah", () => {
    expect(parseRange(undefined)).toBe("30d");
    expect(parseRange("sembarang")).toBe("30d");
    expect(parseRange("7d")).toBe("7d");
    expect(parseRange("month")).toBe("month");
  });
});

describe("getDashboard", () => {
  it("jumlah status aktif cocok dengan isi database", async () => {
    const data = await getDashboard("30d", "ADMIN");
    const active = await db.order.count({ where: { status: { notIn: ["selesai", "kedaluwarsa", "dibatalkan"] } } });
    const shown = data.statusCounts.reduce((sum, row) => sum + row.count, 0);
    expect(shown).toBe(active); // ke-8 status aktif yang ditampilkan mencakup semua pesanan aktif
  });

  it("delapan minggu pendapatan, enam ukuran, dan 50 pesanan terbaru paling banyak", async () => {
    const data = await getDashboard("30d", "ADMIN");
    expect(data.weeklyRevenue).toHaveLength(8);
    expect(data.sizes.map((row) => row.size)).toEqual(["S", "M", "L", "XL", "XXL", "XXXL"]);
    expect(data.latest.length).toBeLessThanOrEqual(50);
  });

  it("rentang lebih panjang tidak mengurangi pesanan dibayar", async () => {
    const week = await getDashboard("7d", "ADMIN");
    const month = await getDashboard("30d", "ADMIN");
    expect(month.paidOrders.count).toBeGreaterThanOrEqual(week.paidOrders.count);
  });

  it("persentase metode dan skema bayar berjumlah sekitar 100% (atau 0 bila belum ada)", async () => {
    const data = await getDashboard("30d", "ADMIN");
    for (const list of [data.methods, data.schemes]) {
      const sum = list.reduce((total, row) => total + row.percent, 0);
      expect(sum === 0 || (sum >= 95 && sum <= 105)).toBe(true);
    }
  });

  it("bagian Sistem hanya ada untuk superadmin", async () => {
    expect((await getDashboard("30d", "ADMIN")).system).toBeUndefined();
    const superData = await getDashboard("30d", "SUPERADMIN");
    expect(superData.system?.activeAdmins).toBeGreaterThanOrEqual(1);
    expect(superData.system?.audit.columns).toContain("Aktivitas");
  });
});
