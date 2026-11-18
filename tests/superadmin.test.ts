// Tes integrasi fitur superadmin: master data + audit log, pengaturan, dan aturan pengaman akun.
// Berjalan ke database MySQL sungguhan (perlu `npx prisma db seed` dahulu). Data tes dibersihkan di akhir.
import "dotenv/config";
import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { createAdmin, updateAdmin } from "@/server/services/account-service";
import { changeMasterData } from "@/server/services/master-data-service";
import { getSettings, updateSettings } from "@/server/services/settings-service";

const ACTOR = "tes-superadmin@example.test";
const TEST_ACCOUNT = "akun-tes@example.test";

afterAll(async () => {
  // Bersihkan catatan dan akun buatan tes agar data demo tidak tercemar
  await db.auditLog.deleteMany({ where: { actorEmail: ACTOR } });
  await db.adminUser.deleteMany({ where: { email: TEST_ACCOUNT } });
  await db.$disconnect();
});

describe("master data", () => {
  it("mengubah harga kategori, menulis audit log, lalu bisa dikembalikan", async () => {
    const category = await db.category.findFirstOrThrow({ where: { product: "PDH", name: "Organisasi" } });
    const original = category.basePrice;

    await changeMasterData(ACTOR, { type: "category", id: category.id, value: original + 5000 });
    const changed = await db.category.findUniqueOrThrow({ where: { id: category.id } });
    expect(changed.basePrice).toBe(original + 5000);

    const log = await db.auditLog.findFirst({ where: { actorEmail: ACTOR, action: "harga_kategori_diubah" }, orderBy: { id: "desc" } });
    expect(log?.detail).toBe(`${original} -> ${original + 5000}`);

    await changeMasterData(ACTOR, { type: "category", id: category.id, value: original }); // kembalikan
  });

  it("menolak harga bukan angka bulat atau negatif", async () => {
    const category = await db.category.findFirstOrThrow();
    await expect(changeMasterData(ACTOR, { type: "category", id: category.id, value: "abc" })).rejects.toThrow();
    await expect(changeMasterData(ACTOR, { type: "category", id: category.id, value: -1 })).rejects.toThrow();
    await expect(changeMasterData(ACTOR, { type: "category", id: category.id, value: 1.5 })).rejects.toThrow();
  });

  it("mengubah stok warna", async () => {
    const color = await db.fabricColor.findFirstOrThrow({ where: { inStock: true } });
    await changeMasterData(ACTOR, { type: "color", id: color.id, inStock: false });
    expect((await db.fabricColor.findUniqueOrThrow({ where: { id: color.id } })).inStock).toBe(false);
    await changeMasterData(ACTOR, { type: "color", id: color.id, inStock: true });
  });
});

describe("simpan beberapa perubahan sekaligus", () => {
  it("atomik: bila satu perubahan gagal, perubahan lain ikut dibatalkan", async () => {
    const category = await db.category.findFirstOrThrow({ where: { product: "PDH", name: "Organisasi" } });
    const original = category.basePrice;
    await expect(
      changeMasterData(ACTOR, {
        changes: [
          { type: "category", id: category.id, value: original + 777 }, // valid
          { type: "shipping", zone: "wilayah-fiktif", value: 1000 }, // gagal: wilayah tidak ada
        ],
      }),
    ).rejects.toThrow();
    // Perubahan pertama tidak boleh tersisa
    expect((await db.category.findUniqueOrThrow({ where: { id: category.id } })).basePrice).toBe(original);
  });

  it("menerapkan banyak perubahan dalam satu paket, termasuk biaya dekorasi, lalu mengembalikannya", async () => {
    const before = await getSettings();
    await changeMasterData(ACTOR, { changes: [{ type: "fee", key: "bordir", value: before.fees.bordir + 1000 }, { type: "fee", key: "XXL", value: before.fees.XXL + 500 }] });
    const after = await getSettings();
    expect(after.fees.bordir).toBe(before.fees.bordir + 1000);
    expect(after.fees.XXL).toBe(before.fees.XXL + 500);
    await changeMasterData(ACTOR, { changes: [{ type: "fee", key: "bordir", value: before.fees.bordir }, { type: "fee", key: "XXL", value: before.fees.XXL }] });
  });

  it("menambah warna baru dan menolak nama ganda atau kode warna salah", async () => {
    const name = "Warna Tes Otomatis";
    await changeMasterData(ACTOR, { type: "color_add", name, hex: "#123456" });
    await expect(changeMasterData(ACTOR, { type: "color_add", name, hex: "#123456" })).rejects.toThrow(/sudah ada/);
    await expect(changeMasterData(ACTOR, { type: "color_add", name: "Salah Kode", hex: "merah" })).rejects.toThrow();
    await db.fabricColor.deleteMany({ where: { name } });
  });
});

describe("pengaturan", () => {
  it("menyimpan pengaturan dan terbaca kembali", async () => {
    const before = await getSettings();
    await updateSettings(ACTOR, { weeklyCapacity: 777, paymentDeadlineHours: 12 });
    expect(await getSettings()).toMatchObject({ weeklyCapacity: 777, paymentDeadlineHours: 12 });
    await updateSettings(ACTOR, { weeklyCapacity: before.weeklyCapacity, paymentDeadlineHours: before.paymentDeadlineHours }); // kembalikan
  });

  it("menolak nilai di luar batas", async () => {
    await expect(updateSettings(ACTOR, { weeklyCapacity: 0, paymentDeadlineHours: 24 })).rejects.toThrow();
    await expect(updateSettings(ACTOR, { weeklyCapacity: 600, paymentDeadlineHours: 500 })).rejects.toThrow();
  });
});

describe("akun admin", () => {
  it("membuat akun, menolak email ganda, menonaktifkan, dan mengaktifkan lagi", async () => {
    await createAdmin(ACTOR, { email: TEST_ACCOUNT, name: "Akun Tes", password: "kata-sandi-8", role: "ADMIN" });
    await expect(createAdmin(ACTOR, { email: TEST_ACCOUNT, name: "Akun Tes", password: "kata-sandi-8", role: "ADMIN" })).rejects.toThrow(/sudah terdaftar/);

    const account = await db.adminUser.findUniqueOrThrow({ where: { email: TEST_ACCOUNT } });
    expect(account.passwordHash).not.toContain("kata-sandi-8"); // sandi disimpan sebagai hash

    await updateAdmin(ACTOR, account.id, { active: false });
    expect((await db.adminUser.findUniqueOrThrow({ where: { id: account.id } })).active).toBe(false);
    await updateAdmin(ACTOR, account.id, { active: true });
    expect((await db.adminUser.findUniqueOrThrow({ where: { id: account.id } })).active).toBe(true);
  });

  it("menolak kata sandi kurang dari 8 karakter", async () => {
    await expect(createAdmin(ACTOR, { email: "pendek@example.test", name: "Pendek", password: "123", role: "ADMIN" })).rejects.toThrow();
  });

  it("tidak boleh menonaktifkan diri sendiri atau superadmin terakhir", async () => {
    const supers = await db.adminUser.findMany({ where: { role: "SUPERADMIN", active: true } });
    expect(supers.length).toBeGreaterThanOrEqual(1);
    const only = supers[0];
    // Dengan actor = dirinya sendiri
    await expect(updateAdmin(only.email, only.id, { active: false })).rejects.toThrow(/akunmu sendiri/);
    // Dengan actor lain, bila ia superadmin aktif terakhir
    if (supers.length === 1) {
      await expect(updateAdmin(ACTOR, only.id, { active: false })).rejects.toThrow(/minimal satu superadmin/);
    }
    expect((await db.adminUser.findUniqueOrThrow({ where: { id: only.id } })).active).toBe(true);
  });
});
