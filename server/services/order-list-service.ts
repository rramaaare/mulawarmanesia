/**
 * File ini untuk apa:
 * Daftar pesanan untuk halaman admin: filter status, pencarian, paginasi, dan ekspor CSV.
 * `toOrderRow` juga dipakai dashboard ("Pesanan terbaru") agar bentuk barisnya sama.
 */
import { db } from "@/server/db";
import { expireOverdueOrders } from "./expiry-service";
import type { StatusName } from "@/lib/domain/order-status";

/** Jumlah baris per halaman bawaan di daftar pesanan, dan pilihan yang boleh dipakai. */
export const ORDERS_PER_PAGE = 10;
export const PER_PAGE_CHOICES = [10, 25, 50, 100] as const;

/** Satu baris pada tabel pesanan. */
export interface OrderRow {
  code: string;
  customer: string;
  organization: string | null;
  product: string;
  pcs: number;
  total: number;
  paymentLabel: string;
  status: StatusName;
  createdAt: string;
}

/** Bagian "include" Prisma yang dibutuhkan untuk membuat OrderRow. */
export const ORDER_ROW_INCLUDE = { items: { include: { category: true, sizes: true } } } as const;

/** Mengubah satu pesanan (dengan relasi ORDER_ROW_INCLUDE) menjadi OrderRow. */
export function toOrderRow(order: {
  code: string;
  customerName: string;
  organization: string | null;
  total: number;
  paymentState: "belum_bayar" | "dp_dibayar" | "lunas";
  status: string;
  createdAt: Date;
  items: { product: string; category: { name: string }; sizes: { qty: number }[] }[];
}): OrderRow {
  const item = order.items[0];
  return {
    code: order.code,
    customer: order.customerName,
    organization: order.organization,
    product: item ? `${item.product} ${item.category.name}` : "-",
    pcs: item?.sizes.reduce((sum, row) => sum + row.qty, 0) ?? 0,
    total: order.total,
    paymentLabel: { belum_bayar: "Belum bayar", dp_dibayar: "DP 50%", lunas: "Lunas" }[order.paymentState],
    status: order.status as StatusName,
    createdAt: order.createdAt.toISOString(),
  };
}

/** Pilihan penyaringan daftar. */
export interface ListOptions {
  /** Satu status. */
  status?: string;
  /** Beberapa status sekaligus (dipakai halaman Produksi). */
  statuses?: string[];
  search?: string;
  /** Nomor halaman mulai 1; kosong = ambil semua (untuk ekspor CSV). */
  page?: number;
  /** Jumlah baris per halaman (bawaan ORDERS_PER_PAGE). */
  perPage?: number;
}

/** Hasil daftar: baris halaman ini + jumlah per status + info halaman. */
export interface OrderListResult {
  rows: OrderRow[];
  counts: Record<string, number>;
  /** Jumlah pesanan yang cocok dengan filter (semua halaman). */
  matching: number;
  /** Jumlah semua pesanan tanpa filter. */
  all: number;
  page: number;
  pageCount: number;
  perPage: number;
}

/** Mengambil pesanan, bisa difilter per status dan dicari berdasarkan nomor/nama. */
export async function listOrders(options: ListOptions = {}): Promise<OrderListResult> {
  await expireOverdueOrders();
  const { status, statuses, search } = options;
  const perPage = options.perPage ?? ORDERS_PER_PAGE;

  const where = {
    ...(status ? { status: status as StatusName } : {}),
    ...(statuses ? { status: { in: statuses as StatusName[] } } : {}),
    ...(search ? { OR: [{ code: { contains: search } }, { customerName: { contains: search } }] } : {}),
  };

  const [matching, grouped] = await Promise.all([
    db.order.count({ where }),
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const pageCount = Math.max(1, Math.ceil(matching / perPage));
  const page = options.page ? Math.min(Math.max(1, options.page), pageCount) : 1;

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: ORDER_ROW_INCLUDE,
    ...(options.page ? { skip: (page - 1) * perPage, take: perPage } : {}),
  });

  const counts: Record<string, number> = {};
  grouped.forEach((row) => (counts[row.status] = row._count._all));
  const all = Object.values(counts).reduce((sum, value) => sum + value, 0);

  return { rows: orders.map(toOrderRow), counts, matching, all, page, pageCount, perPage };
}

/** Mengubah daftar pesanan menjadi teks CSV untuk diunduh admin. */
export function ordersToCsv(rows: OrderRow[]): string {
  const header = ["Nomor", "Pemesan", "Produk", "Pcs", "Total", "Pembayaran", "Status", "Tanggal"];
  const lines = rows.map((row) =>
    [row.code, row.customer, row.product, row.pcs, row.total, row.paymentLabel, row.status, row.createdAt]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

/** Angka kecil di menu samping: pesanan yang masih berjalan dan yang sedang diproduksi. */
export async function getNavCounts(): Promise<{ active: number; production: number }> {
  const grouped = await db.order.groupBy({ by: ["status"], _count: { _all: true } });
  const done = ["selesai", "kedaluwarsa", "dibatalkan"];
  let active = 0;
  let production = 0;
  for (const row of grouped) {
    if (!done.includes(row.status)) active += row._count._all;
    if (row.status === "produksi") production = row._count._all;
  }
  return { active, production };
}
