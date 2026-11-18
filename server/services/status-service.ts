/**
 * File ini untuk apa:
 * Admin mengubah status pesanan. Aturan urutan status dijaga DI SERVER di dalam
 * transaksi (Consistency), bukan hanya di tombol tampilan.
 */
import { db } from "@/server/db";
import { AppError } from "@/server/errors";
import { canChangeStatus, type StatusName } from "@/lib/domain/order-status";
import { changeStatusSchema } from "@/lib/validation/tracking-admin";
import { writeAudit } from "./audit-service";

/**
 * Mengubah status pesanan `code` oleh admin `adminEmail`.
 * Langkah: validasi -> kunci baris -> cek aturan -> ubah + catat log (satu transaksi).
 */
export async function changeOrderStatus(code: string, adminEmail: string, rawInput: unknown): Promise<void> {
  const input = changeStatusSchema.parse(rawInput);

  await db.$transaction(async (tx) => {
    // Kunci baris pesanan agar dua admin tidak mengubah status bersamaan
    await tx.$queryRaw`SELECT id FROM \`Order\` WHERE code = ${code} FOR UPDATE`;
    const order = await tx.order.findUnique({ where: { code } });
    if (!order) throw new AppError("Pesanan tidak ditemukan", 404);

    const from = order.status as StatusName;
    if (!canChangeStatus(from, input.status)) {
      throw new AppError("[!] Status hanya bisa maju satu tahap", 409);
    }
    // Aturan DP: barang tidak boleh siap kirim sebelum tagihan lunas
    if (input.status === "siap_kirim" && order.paymentState !== "lunas") {
      throw new AppError("[!] Sisa tagihan DP belum dibayar. Pesanan belum bisa siap kirim", 409);
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: input.status,
        version: { increment: 1 },
        revisionReason: input.status === "perlu_revisi" ? input.note : null,
        ...(input.status === "dikirim" ? { courier: input.courier, resi: input.resi } : {}),
      },
    });
    await tx.orderStatusLog.create({
      data: { orderId: order.id, status: input.status, note: input.note || null, changedBy: adminEmail },
    });
    await writeAudit(tx, adminEmail, "status_pesanan_diubah", code, `${from} -> ${input.status}`);
  });
}
