/**
 * File ini untuk apa:
 * Alur pembayaran: membuat tagihan (Payment pending) dan memproses webhook dari
 * gateway. Webhook di sini IDEMPOTEN: dikirim dua kali pun uang hanya dicatat sekali
 * (Isolation + Consistency pada ACID). Status pembayaran HANYA berubah lewat webhook
 * ber-tanda-tangan, bukan karena browser bilang "sudah bayar".
 */
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { db } from "@/server/db";
import { AppError } from "@/server/errors";
import { DP_RATE } from "@/lib/domain/constants";
import { expireOverdueOrders } from "./expiry-service";

/** Metode pembayaran yang disediakan simulator. */
export type PaymentMethod = "qris" | "va" | "ewallet";

/** Isi pesan webhook dari gateway. */
interface WebhookPayload {
  gatewayRef: string;
  status: "sukses" | "gagal" | "kedaluwarsa";
}

/** Membuat tanda tangan HMAC-SHA256 untuk isi pesan (kunci rahasia dari .env). */
export function signWebhook(rawBody: string): string {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET ?? "";
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}

/** Membandingkan dua tanda tangan dengan cara yang aman dari serangan waktu. */
function signatureMatches(rawBody: string, signature: string): boolean {
  const expected = Buffer.from(signWebhook(rawBody));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

/** Menentukan nominal tagihan berikutnya: DP/lunas pertama, atau sisa setelah DP. */
function nextAmountDue(order: { total: number; amountPaid: number; paymentScheme: string }): number {
  if (order.amountPaid > 0) return order.total - order.amountPaid; // pelunasan setelah DP
  return order.paymentScheme === "DP50" ? Math.round(order.total * DP_RATE) : order.total;
}

/** Data tagihan yang ditampilkan di halaman Pembayaran. */
export interface PaymentTicket {
  gatewayRef: string;
  method: PaymentMethod;
  amount: number;
  expiresAt: Date;
  /** Nomor VA / kode QRIS tiruan untuk ditampilkan. */
  instruction: string;
}

/** Membuat tagihan pembayaran untuk sebuah pesanan. */
export async function startPayment(code: string, method: PaymentMethod): Promise<PaymentTicket> {
  await expireOverdueOrders();
  const order = await db.order.findUnique({ where: { code } });
  if (!order) throw new AppError("Pesanan tidak ditemukan", 404);

  const needsFirstPayment = order.status === "menunggu_pembayaran";
  const needsSettlement = order.paymentState === "dp_dibayar" && order.amountPaid < order.total;
  if (!needsFirstPayment && !needsSettlement) {
    throw new AppError("[!] Pesanan ini tidak sedang menunggu pembayaran", 409);
  }

  const amount = nextAmountDue(order);
  // Pakai ulang tagihan yang masih menunggu untuk metode dan nominal yang sama, supaya membuka
  // atau memuat ulang halaman pembayaran tidak menumpuk tagihan baru di database.
  const existing = await db.payment.findFirst({
    where: { orderId: order.id, method, amount, status: "pending" },
    orderBy: { createdAt: "desc" },
  });
  let gatewayRef = existing?.gatewayRef;
  if (!gatewayRef) {
    gatewayRef = `SIM-${Date.now()}-${randomBytes(4).toString("hex")}`;
    await db.payment.create({ data: { orderId: order.id, gatewayRef, method, amount } });
  }

  const instruction = method === "qris" ? `QRIS-${gatewayRef}` : `8077${String(order.id).padStart(10, "0")}`;
  return { gatewayRef, method, amount, expiresAt: order.expiresAt, instruction };
}

/** Hasil pemrosesan webhook (duplicate = pesan yang sama sudah pernah diproses). */
export interface WebhookResult {
  duplicate: boolean;
  orderCode?: string;
}

/**
 * Memproses webhook pembayaran. Semua perubahan dilakukan dalam SATU transaksi
 * dengan baris pesanan dikunci (FOR UPDATE) agar dua webhook bersamaan tidak saling menimpa.
 */
export async function processPaymentWebhook(rawBody: string, signature: string): Promise<WebhookResult> {
  // 1. Tolak jika tanda tangan salah (pesan bukan dari gateway)
  if (!signatureMatches(rawBody, signature)) throw new AppError("Tanda tangan webhook tidak valid", 401);
  const payload = JSON.parse(rawBody) as WebhookPayload;

  return db.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { gatewayRef: payload.gatewayRef } });
    if (!payment) throw new AppError("Pembayaran tidak dikenal", 404);

    // 2. Kunci baris pesanan: webhook lain untuk pesanan ini harus menunggu
    await tx.$queryRaw`SELECT id FROM \`Order\` WHERE id = ${payment.orderId} FOR UPDATE`;

    // 3. Baca ulang SETELAH terkunci. Jika sudah diproses, berhenti (idempoten).
    const current = await tx.payment.findUniqueOrThrow({ where: { id: payment.id } });
    const order = await tx.order.findUniqueOrThrow({ where: { id: payment.orderId } });
    if (current.status !== "pending") return { duplicate: true, orderCode: order.code };

    // 4. Catat hasil pembayaran + simpan isi webhook mentah sebagai bukti
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: payload.status,
        paidAt: payload.status === "sukses" ? new Date() : null,
        rawPayload: payload as object,
      },
    });
    if (payload.status !== "sukses") return { duplicate: false, orderCode: order.code };

    // 5. Pembayaran sukses: tambah uang masuk, tentukan keadaan bayar, majukan status
    const amountPaid = order.amountPaid + payment.amount;
    const paymentState = amountPaid >= order.total ? "lunas" : "dp_dibayar";
    const firstPayment = order.status === "menunggu_pembayaran" || order.status === "kedaluwarsa";

    await tx.order.update({
      where: { id: order.id },
      data: {
        amountPaid,
        paymentState,
        version: { increment: 1 },
        ...(firstPayment ? { status: "dibayar" } : {}),
      },
    });
    await tx.orderStatusLog.create({
      data: {
        orderId: order.id,
        status: firstPayment ? "dibayar" : order.status,
        note: paymentState === "lunas" ? "Pembayaran lunas diterima" : "DP diterima",
        changedBy: "sistem",
      },
    });
    return { duplicate: false, orderCode: order.code };
  });
}

/**
 * Dipakai halaman "gateway simulator": membuat pesan webhook yang ditandatangani
 * lalu memprosesnya lewat jalur yang SAMA dengan webhook asli.
 */
export async function simulateGatewayResult(
  gatewayRef: string,
  status: WebhookPayload["status"],
): Promise<WebhookResult> {
  const rawBody = JSON.stringify({ gatewayRef, status } satisfies WebhookPayload);
  return processPaymentWebhook(rawBody, signWebhook(rawBody));
}
