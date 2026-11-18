/**
 * File ini untuk apa:
 * Data master yang boleh diubah superadmin: harga dasar kategori, tambahan harga bahan, tarif ongkir,
 * biaya dekorasi, dan palet warna kain beserta stoknya. Beberapa perubahan sekaligus (tombol
 * "Simpan perubahan") dan catatan audit-nya ditulis dalam SATU transaksi: semua berhasil atau semua batal.
 * Harga di editor, landing, dan checkout membaca tabel yang sama, jadi perubahan langsung berlaku.
 */
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db";
import { AppError } from "@/server/errors";
import type { Fees } from "@/lib/domain/pricing";
import { masterDataBatchSchema, masterDataChangeSchema, type MasterDataChange } from "@/lib/validation/master-data";
import { writeAudit } from "./audit-service";
import { getSettings } from "./settings-service";

/** Seluruh data master untuk halaman superadmin. */
export interface MasterData {
  categories: { id: number; product: string; name: string; basePrice: number }[];
  materials: { id: number; product: string; name: string; surcharge: number }[];
  /** `usedPcs` = pcs berwarna badan ini pada pesanan berbayar 30 hari terakhir. */
  colors: { id: number; name: string; hex: string; inStock: boolean; usedPcs: number }[];
  shipping: { zone: string; label: string; fee: number }[];
  fees: Fees;
}

/** Membaca semua data master. */
export async function getMasterData(): Promise<MasterData> {
  const since = new Date(Date.now() - 30 * 86_400_000);
  const [categories, materials, colors, shipping, settings, items] = await Promise.all([
    db.category.findMany({ orderBy: { id: "asc" } }),
    db.material.findMany({ orderBy: { id: "asc" } }),
    db.fabricColor.findMany({ orderBy: { id: "asc" } }),
    db.shippingRate.findMany({ orderBy: { id: "asc" } }),
    getSettings(),
    db.orderItem.findMany({ where: { order: { amountPaid: { gt: 0 }, createdAt: { gte: since } } }, include: { sizes: true } }),
  ]);

  // Jumlah pcs per warna badan
  const usage = new Map<string, number>();
  for (const item of items) {
    const pcs = item.sizes.reduce((sum, row) => sum + row.qty, 0);
    usage.set(item.bodyColor, (usage.get(item.bodyColor) ?? 0) + pcs);
  }

  return {
    categories,
    materials,
    colors: colors.map(({ id, name, hex, inStock }) => ({ id, name, hex, inStock, usedPcs: usage.get(name) ?? 0 })),
    shipping: shipping.map(({ zone, label, fee }) => ({ zone, label, fee })),
    fees: settings.fees,
  };
}

/** Menerapkan SATU perubahan di dalam transaksi `tx` dan menulis catatan auditnya. */
async function applyChange(tx: Prisma.TransactionClient, actorEmail: string, input: MasterDataChange): Promise<void> {
  if (input.type === "category") {
    const row = await tx.category.findUnique({ where: { id: input.id } });
    if (!row) throw new AppError("Kategori tidak ditemukan", 404);
    if (row.basePrice === input.value) return; // tidak ada yang berubah
    await tx.category.update({ where: { id: row.id }, data: { basePrice: input.value } });
    await writeAudit(tx, actorEmail, "harga_kategori_diubah", `${row.product} ${row.name}`, `${row.basePrice} -> ${input.value}`);
  } else if (input.type === "material") {
    const row = await tx.material.findUnique({ where: { id: input.id } });
    if (!row) throw new AppError("Bahan tidak ditemukan", 404);
    if (row.surcharge === input.value) return;
    await tx.material.update({ where: { id: row.id }, data: { surcharge: input.value } });
    await writeAudit(tx, actorEmail, "tambahan_bahan_diubah", `${row.product} ${row.name}`, `${row.surcharge} -> ${input.value}`);
  } else if (input.type === "shipping") {
    const row = await tx.shippingRate.findUnique({ where: { zone: input.zone } });
    if (!row) throw new AppError("Wilayah ongkir tidak ditemukan", 404);
    if (row.fee === input.value) return;
    await tx.shippingRate.update({ where: { id: row.id }, data: { fee: input.value } });
    await writeAudit(tx, actorEmail, "ongkir_diubah", row.label, `${row.fee} -> ${input.value}`);
  } else if (input.type === "color") {
    const row = await tx.fabricColor.findUnique({ where: { id: input.id } });
    if (!row) throw new AppError("Warna tidak ditemukan", 404);
    if (row.inStock === input.inStock) return;
    await tx.fabricColor.update({ where: { id: row.id }, data: { inStock: input.inStock } });
    await writeAudit(tx, actorEmail, "stok_warna_diubah", row.name, input.inStock ? "tersedia" : "habis");
  } else if (input.type === "fee") {
    const before = (await getSettings(tx)).fees[input.key];
    if (before === input.value) return;
    const key = `fee_${input.key}`;
    await tx.setting.upsert({ where: { key }, update: { value: String(input.value) }, create: { key, value: String(input.value) } });
    await writeAudit(tx, actorEmail, "biaya_diubah", input.key, `${before} -> ${input.value}`);
  } else {
    const exists = await tx.fabricColor.findUnique({ where: { name: input.name } });
    if (exists) throw new AppError(`[!] Warna "${input.name}" sudah ada`, 409);
    await tx.fabricColor.create({ data: { name: input.name, hex: input.hex.toUpperCase(), inStock: true } });
    await writeAudit(tx, actorEmail, "warna_ditambah", input.name, input.hex.toUpperCase());
  }
}

/**
 * Menerapkan satu perubahan ATAU beberapa sekaligus (`{ changes: [...] }`) oleh `actorEmail`.
 * Langkah: validasi semua -> (satu transaksi) terapkan satu per satu -> jika ada yang gagal, semuanya batal.
 */
export async function changeMasterData(actorEmail: string, rawInput: unknown): Promise<void> {
  const isBatch = typeof rawInput === "object" && rawInput !== null && "changes" in rawInput;
  const changes = isBatch ? masterDataBatchSchema.parse(rawInput).changes : [masterDataChangeSchema.parse(rawInput)];

  await db.$transaction(async (tx) => {
    for (const change of changes) await applyChange(tx, actorEmail, change);
  });
}
