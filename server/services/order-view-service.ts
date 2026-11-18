/**
 * File ini untuk apa:
 * Membaca pesanan dari database dan mengubahnya menjadi bentuk sederhana (OrderView)
 * yang aman dikirim ke tampilan (tanggal menjadi teks ISO). Dipakai oleh halaman
 * status pelanggan, pelacakan, dan detail pesanan admin.
 */
import { db } from "@/server/db";
import { AppError } from "@/server/errors";
import { expireOverdueOrders } from "./expiry-service";
import type { StatusName } from "@/lib/domain/order-status";
import { normalizeOrderCode } from "@/lib/domain/order-code";
import { normalizeWhatsapp } from "@/lib/domain/phone";

/** Bentuk data pesanan yang dipakai tampilan. */
export interface OrderView {
  code: string;
  status: StatusName;
  paymentState: "belum_bayar" | "dp_dibayar" | "lunas";
  paymentScheme: "LUNAS" | "DP50";
  customerName: string;
  whatsapp: string;
  email: string;
  organization: string | null;
  shippingMethod: "KIRIM" | "AMBIL";
  address: string | null;
  city: string | null;
  postalCode: string | null;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  amountPaid: number;
  courier: string | null;
  resi: string | null;
  revisionReason: string | null;
  createdAt: string;
  expiresAt: string;
  item: {
    product: "PDH" | "VEST";
    categoryName: string;
    materialName: string;
    designJson: unknown;
    notes: string | null;
    unitPrice: number;
    sizes: { size: string; qty: number }[];
    names: { name: string; size: string }[];
    assets: { fileName: string; technique: string; position: string }[];
    totalPcs: number;
  };
  logs: { status: StatusName; note: string | null; changedBy: string; changedAt: string }[];
  payments: { gatewayRef: string; method: string; amount: number; status: string; paidAt: string | null }[];
}

/** Bagian "include" Prisma: relasi apa saja yang ikut dibaca bersama pesanan. */
const ORDER_INCLUDE = {
  items: { include: { category: true, material: true, sizes: true, names: true, assets: true } },
  logs: { orderBy: { changedAt: "asc" as const } },
  payments: { orderBy: { createdAt: "desc" as const } },
};

/** Mengubah satu baris pesanan (dengan relasinya) menjadi OrderView. */
function toOrderView(order: NonNullable<Awaited<ReturnType<typeof findOrderRow>>>): OrderView {
  const item = order.items[0];
  return {
    code: order.code,
    status: order.status as StatusName,
    paymentState: order.paymentState,
    paymentScheme: order.paymentScheme,
    customerName: order.customerName,
    whatsapp: order.whatsapp,
    email: order.email,
    organization: order.organization,
    shippingMethod: order.shippingMethod,
    address: order.address,
    city: order.city,
    postalCode: order.postalCode,
    subtotal: order.subtotal,
    discount: order.discount,
    shippingFee: order.shippingFee,
    total: order.total,
    amountPaid: order.amountPaid,
    courier: order.courier,
    resi: order.resi,
    revisionReason: order.revisionReason,
    createdAt: order.createdAt.toISOString(),
    expiresAt: order.expiresAt.toISOString(),
    item: {
      product: item.product,
      categoryName: item.category.name,
      materialName: item.material.name,
      designJson: item.designJson,
      notes: item.notes,
      unitPrice: item.unitPrice,
      sizes: item.sizes.map((row) => ({ size: row.size, qty: row.qty })),
      names: item.names.map((row) => ({ name: row.name, size: row.size })),
      assets: item.assets.map((row) => ({ fileName: row.fileName, technique: row.technique, position: row.position })),
      totalPcs: item.sizes.reduce((sum, row) => sum + row.qty, 0),
    },
    logs: order.logs.map((log) => ({
      status: log.status as StatusName,
      note: log.note,
      changedBy: log.changedBy,
      changedAt: log.changedAt.toISOString(),
    })),
    payments: order.payments.map((payment) => ({
      gatewayRef: payment.gatewayRef,
      method: payment.method,
      amount: payment.amount,
      status: payment.status,
      paidAt: payment.paidAt ? payment.paidAt.toISOString() : null,
    })),
  };
}

/** Query dasar: cari satu pesanan beserta relasinya. */
function findOrderRow(code: string) {
  return db.order.findUnique({ where: { code }, include: ORDER_INCLUDE });
}

/** Admin: ambil pesanan berdasarkan nomor (tanpa verifikasi WhatsApp). */
export async function getOrderForAdmin(code: string): Promise<OrderView> {
  await expireOverdueOrders();
  const order = await findOrderRow(code);
  if (!order) throw new AppError("Pesanan tidak ditemukan", 404);
  return toOrderView(order);
}

/** Pelanggan: ambil pesanan dengan token rahasia dari tautan email/WA. */
export async function getOrderByToken(code: string, token: string): Promise<OrderView> {
  await expireOverdueOrders();
  const order = await findOrderRow(code);
  if (!order || order.trackingToken !== token) throw new AppError("Pesanan tidak ditemukan", 404);
  return toOrderView(order);
}

// ---- Pembatasan percobaan lacak (PRD §10.6): maksimal 5 gagal per 15 menit ----
const MAX_FAILED_TRACKING = 5;
const TRACKING_WINDOW_MS = 15 * 60 * 1000;
/** Catatan waktu gagal per kunci klien, disimpan di memori server (cukup untuk demo). */
const failedAttempts = new Map<string, number[]>();

/** Mengembalikan daftar kegagalan yang masih dalam jendela 15 menit. */
function recentFailures(clientKey: string): number[] {
  const cutoff = Date.now() - TRACKING_WINDOW_MS;
  const recent = (failedAttempts.get(clientKey) ?? []).filter((time) => time > cutoff);
  failedAttempts.set(clientKey, recent);
  return recent;
}

/**
 * Pelanggan melacak pesanan dengan nomor pesanan + nomor WhatsApp.
 * Pesan error SAMA untuk "tidak ada" dan "WA salah" agar nomor tidak bisa ditebak.
 */
export async function trackOrder(code: string, whatsapp: string, clientKey: string): Promise<{ code: string; token: string }> {
  if (recentFailures(clientKey).length >= MAX_FAILED_TRACKING) {
    throw new AppError("[!] Terlalu banyak percobaan. Coba lagi dalam 15 menit", 429);
  }
  const normalizedCode = normalizeOrderCode(code);
  const normalizedWa = normalizeWhatsapp(whatsapp);
  const order = normalizedCode ? await db.order.findUnique({ where: { code: normalizedCode } }) : null;

  if (!order || order.whatsapp !== normalizedWa) {
    failedAttempts.set(clientKey, [...recentFailures(clientKey), Date.now()]);
    throw new AppError(
      "[!] Pesanan tidak ditemukan. Periksa nomor pesanan dan nomor WhatsApp yang dipakai saat checkout",
      404,
    );
  }
  return { code: order.code, token: order.trackingToken };
}
