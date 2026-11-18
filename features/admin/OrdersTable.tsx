/**
 * OrdersTable: tabel pesanan bergaya desain admin (kepala hitam, baris belang-belang, status berupa pil).
 * Dipakai di dashboard ("Pesanan terbaru"), daftar pesanan, dan halaman produksi.
 */
import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatDateShort, formatRupiah } from "@/lib/format";
import type { OrderRow } from "@/server/services/order-list-service";
import { StatusPill } from "./StatusPill";
import { OverviewIcon } from "./overview/icons";

/** Judul kolom: [teks, rata kanan?]. */
const HEADERS: [string, boolean][] = [
  ["No. pesanan", false],
  ["Pemesan", false],
  ["Produk", false],
  ["Pcs", true],
  ["Total", true],
  ["Bayar", false],
  ["Status", false],
  ["Tanggal", false],
  ["Detail", false],
];

export function OrdersTable({ rows, emptyText = "Tidak ada pesanan yang cocok." }: { rows: OrderRow[]; emptyText?: string }) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[780px] overflow-hidden rounded-card border-2 border-ink">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-ink text-xs text-white">
              {HEADERS.map(([label, right]) => (
                <th key={label || "aksi"} className={cn("px-3 py-3 font-medium", right && "text-right", label === "Detail" && "text-center")}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={HEADERS.length} className="px-4 py-10 text-center text-ink-muted">{emptyText}</td></tr>
            )}
            {rows.map((row, index) => (
              <tr key={row.code} className={cn("relative transition-colors hover:bg-pastel-butter/60", index % 2 === 1 && "bg-subtle")}>
                <td className="px-3 py-4">
                  <Link href={`/admin/pesanan/${row.code}`} className="whitespace-nowrap font-medium after:absolute after:inset-0 after:content-[''] hover:underline">{row.code}</Link>
                </td>
                <td className="max-w-[200px] px-3 py-4">
                  {row.customer}
                  {row.organization && <span> · {row.organization}</span>}
                </td>
                <td className="px-3 py-4">{row.product}</td>
                <td className="px-3 py-4 text-right tabular-nums">{row.pcs}</td>
                <td className="whitespace-nowrap px-3 py-4 text-right tabular-nums">{formatRupiah(row.total)}</td>
                <td className="whitespace-nowrap px-3 py-4">{row.paymentLabel}</td>
                <td className="px-3 py-4"><StatusPill status={row.status} /></td>
                <td className="whitespace-nowrap px-3 py-4">{formatDateShort(row.createdAt)}</td>
                <td className="px-3 py-4 text-center">
                  <Link
                    href={`/admin/pesanan/${row.code}`}
                    aria-label={`Lihat detail ${row.code}`}
                    title="Lihat detail"
                    className="relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-control border-2 border-ink bg-surface transition-all hover:bg-pastel-butter active:translate-y-px"
                  >
                    <OverviewIcon name="eye" className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
