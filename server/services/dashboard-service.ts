/**
 * File ini untuk apa:
 * Menghitung angka-angka dashboard admin (PRD §8.9) langsung dari database.
 * Aturan tanggal: semua angka "dibayar" memakai tanggal PEMBAYARAN (paidAt),
 * sehingga cocok dengan daftar pesanan yang difilter berdasarkan tanggal bayar.
 * Bagian `system` (akun, stok warna, aktivitas) hanya diisi untuk superadmin.
 */
import { db } from "@/server/db";
import { SIZES } from "@/lib/domain/constants";
import { ADMIN_ACTION_STATUSES, type StatusName } from "@/lib/domain/order-status";
import { formatDateTimeWita } from "@/lib/format";
import type { TableData } from "@/lib/domain/table";
import { listAudit } from "./audit-service";
import { expireOverdueOrders } from "./expiry-service";
import { ORDER_ROW_INCLUDE, toOrderRow, type OrderRow } from "./order-list-service";
import { getSettings } from "./settings-service";

/** Pilihan rentang waktu di dashboard. */
export type DashboardRange = "7d" | "30d" | "month";

/** Membaca ?range= dari alamat; nilai aneh diganti 30 hari. */
export function parseRange(value: string | undefined): DashboardRange {
  return value === "7d" || value === "month" ? value : "30d";
}

/** Seluruh data dashboard dalam satu objek. */
export interface DashboardData {
  rangeLabel: string;
  period: { start: string; end: string };
  updatedAt: string;
  revenue: { current: number; previous: number };
  paidOrders: { count: number; pcs: number; previousCount: number };
  inProduction: { count: number; pcs: number; capacityPercent: number };
  waiting: { count: number; value: number; expiringSoon: number };
  weeklyRevenue: { label: string; value: number }[];
  statusCounts: { status: StatusName; count: number; needsAction: boolean }[];
  sizes: { size: string; pcs: number }[];
  categories: { name: string; pcs: number }[];
  productShare: { pdh: number; vest: number };
  methods: { label: string; percent: number }[];
  schemes: { label: string; percent: number }[];
  funnel: { label: string; count: number }[];
  colors: { name: string; hex: string; percent: number }[];
  outOfStockColors: string[];
  capacity: { used: number; limit: number };
  todo: { code: string; reason: string }[];
  /** 50 pesanan terbaru; tampilan memilih berapa yang ditampilkan. */
  latest: OrderRow[];
  /** Bagian Sistem; hanya diisi untuk superadmin. */
  system?: { activeAdmins: number; inactiveAdmins: number; audit: TableData };
}

/** Menghitung awal dan akhir rentang waktu serta pembanding periode sebelumnya. */
function resolveRange(range: DashboardRange, now: Date) {
  const day = 86_400_000;
  if (range === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const length = now.getTime() - start.getTime();
    return { start, previousStart: new Date(start.getTime() - length), label: "Bulan ini" };
  }
  const days = range === "7d" ? 7 : 30;
  const start = new Date(now.getTime() - days * day);
  return { start, previousStart: new Date(start.getTime() - days * day), label: `${days} hari terakhir` };
}

/** Mengubah daftar nilai menjadi persen terhadap total. */
function toPercent(entries: Record<string, number>): { label: string; percent: number }[] {
  const total = Object.values(entries).reduce((sum, value) => sum + value, 0) || 1;
  return Object.entries(entries).map(([label, value]) => ({ label, percent: Math.round((value / total) * 100) }));
}

/** Membaca dan menghitung semua data dashboard untuk rentang tertentu. `role` menentukan bagian Sistem. */
export async function getDashboard(range: DashboardRange, role: "ADMIN" | "SUPERADMIN"): Promise<DashboardData> {
  await expireOverdueOrders();
  const now = new Date();
  const { weeklyCapacity } = await getSettings(); // kapasitas bisa diubah superadmin
  const { start, previousStart, label } = resolveRange(range, now);

  // Pembayaran sukses pada periode ini dan sebelumnya
  const [payments, previousPayments] = await Promise.all([
    db.payment.findMany({
      where: { status: "sukses", paidAt: { gte: start } },
      include: { order: { include: { items: { include: { category: true, sizes: true } } } } },
    }),
    db.payment.findMany({ where: { status: "sukses", paidAt: { gte: previousStart, lt: start } } }),
  ]);

  // Pesanan unik yang dibayar pada periode ini
  const paidOrders = Array.from(new Map(payments.map((payment) => [payment.orderId, payment.order])).values());
  const pcsOf = (order: (typeof paidOrders)[number]) => order.items.reduce((sum, item) => sum + item.sizes.reduce((s, row) => s + row.qty, 0), 0);

  // Ukuran, kategori, produk, warna badan
  const sizeTotals: Record<string, number> = Object.fromEntries(SIZES.map((size) => [size, 0]));
  const categoryTotals: Record<string, number> = {};
  const colorTotals: Record<string, number> = {};
  let pdhPcs = 0;
  let vestPcs = 0;
  for (const order of paidOrders) {
    for (const item of order.items) {
      const pcs = item.sizes.reduce((sum, row) => sum + row.qty, 0);
      item.sizes.forEach((row) => (sizeTotals[row.size] += row.qty));
      const categoryName = `${item.product} ${item.category.name}`;
      categoryTotals[categoryName] = (categoryTotals[categoryName] ?? 0) + pcs;
      colorTotals[item.bodyColor] = (colorTotals[item.bodyColor] ?? 0) + pcs;
      if (item.product === "PDH") pdhPcs += pcs;
      else vestPcs += pcs;
    }
  }

  // Metode bayar dan skema bayar
  const methodTotals: Record<string, number> = {};
  payments.forEach((payment) => {
    const name = { qris: "QRIS", va: "Virtual Account", ewallet: "E-wallet" }[payment.method] ?? payment.method;
    methodTotals[name] = (methodTotals[name] ?? 0) + 1;
  });
  const schemeTotals: Record<string, number> = { Lunas: 0, "DP 50%": 0 };
  paidOrders.forEach((order) => (schemeTotals[order.paymentScheme === "LUNAS" ? "Lunas" : "DP 50%"] += 1));

  // Pendapatan 8 minggu terakhir (rentang tetap, tidak mengikuti filter)
  const weekMs = 7 * 86_400_000;
  const weeklyStart = new Date(now.getTime() - 8 * weekMs);
  const weeklyPayments = await db.payment.findMany({ where: { status: "sukses", paidAt: { gte: weeklyStart } } });
  const weeklyRevenue = Array.from({ length: 8 }, (_, index) => {
    const from = new Date(weeklyStart.getTime() + index * weekMs);
    const to = new Date(from.getTime() + weekMs);
    const value = weeklyPayments
      .filter((payment) => payment.paidAt && payment.paidAt >= from && payment.paidAt < to)
      .reduce((sum, payment) => sum + payment.amount, 0);
    return { label: from.toLocaleDateString("id-ID", { day: "numeric", month: "short" }), value };
  });

  // Keadaan pesanan saat ini (tidak mengikuti rentang waktu)
  const activeOrders = await db.order.findMany({
    where: { status: { notIn: ["selesai", "kedaluwarsa", "dibatalkan"] } },
    include: { items: { include: { sizes: true } } },
  });
  const statusMap = new Map<StatusName, number>();
  activeOrders.forEach((order) => statusMap.set(order.status as StatusName, (statusMap.get(order.status as StatusName) ?? 0) + 1));
  const statusOrder: StatusName[] = ["menunggu_pembayaran", "dibayar", "cek_desain", "perlu_revisi", "produksi", "qc", "siap_kirim", "dikirim"];
  const statusCounts = statusOrder.map((status) => ({
    status,
    count: statusMap.get(status) ?? 0,
    needsAction: ADMIN_ACTION_STATUSES.includes(status),
  }));

  const production = activeOrders.filter((order) => order.status === "produksi");
  const productionPcs = production.reduce((sum, order) => sum + order.items.reduce((s, item) => s + item.sizes.reduce((x, row) => x + row.qty, 0), 0), 0);
  const waiting = activeOrders.filter((order) => order.status === "menunggu_pembayaran");
  const threeHours = now.getTime() + 3 * 3_600_000;

  // Perlu tindakan: cek desain, revisi, input resi, hampir kedaluwarsa
  const todo: DashboardData["todo"] = [];
  activeOrders.forEach((order) => {
    if (order.status === "dibayar") todo.push({ code: order.code, reason: "Cek desain" });
    if (order.status === "perlu_revisi") todo.push({ code: order.code, reason: "Perlu revisi" });
    if (order.status === "siap_kirim") todo.push({ code: order.code, reason: "Input resi" });
    if (order.status === "menunggu_pembayaran" && order.expiresAt.getTime() < threeHours) {
      todo.push({ code: order.code, reason: "Bayar < 3 jam" });
    }
  });

  // Konversi sederhana dari data pesanan (alat pelacakan event masih [KEPUTUSAN] di PRD)
  const createdInRange = await db.order.count({ where: { createdAt: { gte: start } } });
  const reachedProduction = paidOrders.filter((order) => ["produksi", "qc", "siap_kirim", "dikirim", "selesai"].includes(order.status)).length;
  const finished = paidOrders.filter((order) => order.status === "selesai").length;

  const colorRows = await db.fabricColor.findMany();
  const colorHex = new Map(colorRows.map((row) => [row.name, row.hex]));
  const colorTotalPcs = Object.values(colorTotals).reduce((sum, value) => sum + value, 0) || 1;

  const latestRows = await db.order.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: ORDER_ROW_INCLUDE });

  // Bagian Sistem (hanya superadmin)
  let system: DashboardData["system"];
  if (role === "SUPERADMIN") {
    const [activeAdmins, inactiveAdmins, audit] = await Promise.all([
      db.adminUser.count({ where: { active: true } }),
      db.adminUser.count({ where: { active: false } }),
      listAudit(100),
    ]);
    system = {
      activeAdmins,
      inactiveAdmins,
      audit: {
        columns: ["Waktu", "Oleh", "Aktivitas", "Objek", "Detail"],
        rows: audit.map((row) => [formatDateTimeWita(row.createdAt), row.actorEmail, row.action.replace(/_/g, " "), row.target, row.detail ?? "-"]),
      },
    };
  }

  return {
    rangeLabel: label,
    period: { start: start.toISOString(), end: now.toISOString() },
    updatedAt: now.toISOString(),
    revenue: {
      current: payments.reduce((sum, payment) => sum + payment.amount, 0),
      previous: previousPayments.reduce((sum, payment) => sum + payment.amount, 0),
    },
    paidOrders: {
      count: paidOrders.length,
      pcs: paidOrders.reduce((sum, order) => sum + pcsOf(order), 0),
      previousCount: new Set(previousPayments.map((payment) => payment.orderId)).size,
    },
    inProduction: {
      count: production.length,
      pcs: productionPcs,
      capacityPercent: Math.round((productionPcs / weeklyCapacity) * 100),
    },
    waiting: {
      count: waiting.length,
      value: waiting.reduce((sum, order) => sum + order.total, 0),
      expiringSoon: waiting.filter((order) => order.expiresAt.getTime() < threeHours).length,
    },
    weeklyRevenue,
    statusCounts,
    sizes: SIZES.map((size) => ({ size, pcs: sizeTotals[size] })),
    categories: Object.entries(categoryTotals).map(([name, pcs]) => ({ name, pcs })).sort((a, b) => b.pcs - a.pcs),
    productShare: { pdh: pdhPcs, vest: vestPcs },
    methods: toPercent(methodTotals),
    schemes: toPercent(schemeTotals),
    funnel: [
      { label: "Pesanan dibuat", count: createdInRange },
      { label: "Dibayar", count: paidOrders.length },
      { label: "Masuk produksi", count: reachedProduction },
      { label: "Selesai", count: finished },
    ],
    colors: Object.entries(colorTotals)
      .map(([name, pcs]) => ({ name, hex: colorHex.get(name) ?? "#999999", percent: Math.round((pcs / colorTotalPcs) * 100) }))
      .sort((a, b) => b.percent - a.percent),
    outOfStockColors: colorRows.filter((row) => !row.inStock).map((row) => row.name),
    capacity: { used: productionPcs, limit: weeklyCapacity },
    todo,
    latest: latestRows.map(toOrderRow),
    system,
  };
}
