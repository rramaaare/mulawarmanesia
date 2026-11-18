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
    <>
      {/* Mobile: daftar kartu (tiap kartu = tautan ke detail pesanan) */}
      <ul className="flex flex-col gap-3 md:hidden">
        {rows.length === 0 && <li className="rounded-card border-2 border-line bg-surface px-4 py-8 text-center text-sm text-ink-muted">{emptyText}</li>}
        {rows.map((row) => (
          <li key={row.code}>
            <Link
              href={`/admin/pesanan/${row.code}`}
              className="flex flex-col gap-2 rounded-card border-2 border-ink bg-surface p-3.5 shadow-hard-sm transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              <span className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
                <span className="whitespace-nowrap font-semibold">{row.code}</span>
                <StatusPill status={row.status} />
              </span>
              <span className="text-sm text-ink-soft">
                {row.customer}
                {row.organization && <> · {row.organization}</>}
              </span>
              <span className="flex items-end justify-between gap-2 text-xs text-ink-muted">
                <span>{row.product} · {row.pcs} pcs · {formatDateShort(row.createdAt)}</span>
                <span className="text-sm font-semibold text-ink">{formatRupiah(row.total)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Tablet/desktop: tabel */}
      <div className="hidden overflow-x-auto md:block">
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
    </>
  );
}
