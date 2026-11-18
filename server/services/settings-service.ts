/**
 * File ini untuk apa:
 * Pengaturan yang boleh diubah superadmin: kapasitas produksi mingguan dan batas waktu bayar.
 * Nilai disimpan di tabel Setting; bila belum pernah diubah, dipakai nilai bawaan di
 * lib/domain/constants.ts.
 */
import { db } from "@/server/db";
import { PAYMENT_DEADLINE_HOURS, WEEKLY_CAPACITY_PCS } from "@/lib/domain/constants";
import { DEFAULT_FEES, type Fees } from "@/lib/domain/pricing";
import { settingsSchema } from "@/lib/validation/master-data";
import { writeAudit } from "./audit-service";

/** Pengaturan dalam bentuk angka siap pakai. */
export interface Settings {
  weeklyCapacity: number; // pcs per minggu
  paymentDeadlineHours: number; // jam
  fees: Fees; // biaya dekorasi, nama per orang, dan tambahan ukuran
}

/** Klien database apa pun yang punya tabel Setting (db biasa atau `tx` di dalam transaksi). */
type SettingsClient = Pick<typeof db, "setting">;

/** Membaca pengaturan; kunci yang belum ada memakai nilai bawaan. */
export async function getSettings(client: SettingsClient = db): Promise<Settings> {
  const rows = await client.setting.findMany();
  const map = new Map(rows.map((row) => [row.key, Number(row.value)]));
  return {
    weeklyCapacity: map.get("weeklyCapacity") ?? WEEKLY_CAPACITY_PCS,
    paymentDeadlineHours: map.get("paymentDeadlineHours") ?? PAYMENT_DEADLINE_HOURS,
    fees: {
      bordir: map.get("fee_bordir") ?? DEFAULT_FEES.bordir,
      sablon: map.get("fee_sablon") ?? DEFAULT_FEES.sablon,
      namePerPerson: map.get("fee_namePerPerson") ?? DEFAULT_FEES.namePerPerson,
      XXL: map.get("fee_XXL") ?? DEFAULT_FEES.XXL,
      XXXL: map.get("fee_XXXL") ?? DEFAULT_FEES.XXXL,
    },
  };
}

/** Menyimpan pengaturan baru (divalidasi) dan mencatatnya di audit log dalam satu transaksi. */
export async function updateSettings(actorEmail: string, rawInput: unknown): Promise<{ weeklyCapacity: number; paymentDeadlineHours: number }> {
  const input = settingsSchema.parse(rawInput);
  return db.$transaction(async (tx) => {
    const before = await getSettings(tx);
    for (const [key, value] of Object.entries(input)) {
      await tx.setting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value) } });
    }
    await writeAudit(
      tx,
      actorEmail,
      "pengaturan_diubah",
      "Pengaturan",
      `kapasitas ${before.weeklyCapacity} -> ${input.weeklyCapacity}; batas bayar ${before.paymentDeadlineHours} jam -> ${input.paymentDeadlineHours} jam`,
    );
    return input;
  });
}
