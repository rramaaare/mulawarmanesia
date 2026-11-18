/**
 * File ini untuk apa:
 * Menandai pesanan yang lewat batas waktu bayar sebagai "kedaluwarsa".
 * Dipanggil setiap kali pesanan dibaca (tanpa job terjadwal), supaya sederhana.
 */
import { db } from "@/server/db";

/** Mengubah semua pesanan menunggu_pembayaran yang sudah lewat expiresAt menjadi kedaluwarsa. */
export async function expireOverdueOrders(): Promise<void> {
  const overdue = await db.order.findMany({
    where: { status: "menunggu_pembayaran", expiresAt: { lt: new Date() } },
    select: { id: true },
  });
  if (overdue.length === 0) return;

  await db.$transaction(async (tx) => {
    for (const { id } of overdue) {
      // Syarat status dicek lagi di updateMany agar pesanan yang baru dibayar tidak tertimpa
      const result = await tx.order.updateMany({
        where: { id, status: "menunggu_pembayaran" },
        data: { status: "kedaluwarsa", version: { increment: 1 } },
      });
      if (result.count === 1) {
        await tx.orderStatusLog.create({
          data: { orderId: id, status: "kedaluwarsa", note: "Batas waktu bayar habis", changedBy: "sistem" },
        });
      }
    }
  });
}
