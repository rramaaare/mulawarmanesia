/**
 * File ini untuk apa:
 * Catatan aktivitas (audit log): siapa mengubah apa dan kapan. Catatan ditulis DI DALAM transaksi
 * yang sama dengan perubahannya, jadi tidak mungkin ada perubahan tanpa catatan (atau sebaliknya).
 * Tabel ini hanya ditambah; tidak ada fungsi untuk mengubah atau menghapus catatan.
 */
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db";

/** Menulis satu catatan. Panggil di dalam `db.$transaction` dengan `tx` dari transaksi itu. */
export async function writeAudit(
  tx: Prisma.TransactionClient,
  actorEmail: string,
  action: string,
  target: string,
  detail?: string,
): Promise<void> {
  await tx.auditLog.create({ data: { actorEmail, action, target, detail: detail?.slice(0, 300) } });
}

/** Satu baris catatan untuk ditampilkan. */
export interface AuditRow {
  id: number;
  actorEmail: string;
  action: string;
  target: string;
  detail: string | null;
  createdAt: string;
}

/** Mengambil catatan terbaru (paling baru di atas). */
export async function listAudit(limit = 100): Promise<AuditRow[]> {
  const rows = await db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: limit });
  return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }));
}
