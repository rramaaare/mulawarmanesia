"use client";
/**
 * StatusTabsCard: kartu "Statistik Pesanan" bertab (susunan Prime Lite HR) berisi widget lama dashboard:
 * Status Aktif, Kategori Terlaris, PDH vs VEST, dan Metode & Skema Bayar. Filter rentang waktu di kanan
 * atas mengubah alamat halaman; berganti tab tidak memuat ulang karena semua datanya sudah dikirim server.
 */
import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { STATUS_LABEL } from "@/lib/domain/order-status";
import type { DashboardData } from "@/server/services/dashboard-service";
import { FilterSelect } from "./FilterSelect";
import { BarRow } from "./widgets";

const TABS = ["Status Aktif", "Kategori Terlaris", "PDH vs VEST", "Metode & Skema Bayar"] as const;
type Tab = (typeof TABS)[number];

/** Pilihan rentang waktu. */
const RANGE_OPTIONS = [
  { value: "7d", label: "7 hari terakhir" },
  { value: "30d", label: "30 hari terakhir" },
  { value: "month", label: "Bulan ini" },
];

export function StatusTabsCard({ data, range }: { data: DashboardData; range: string }) {
  const [tab, setTab] = useState<Tab>("Status Aktif");

  const totalActive = data.statusCounts.reduce((sum, row) => sum + row.count, 0);
  const maxStatus = Math.max(...data.statusCounts.map((row) => row.count), 1);
  const maxCategory = Math.max(...data.categories.map((row) => row.pcs), 1);
  const totalProduct = data.productShare.pdh + data.productShare.vest || 1;
  const pdhPercent = Math.round((data.productShare.pdh / totalProduct) * 100);

  return (
    <Card className="overflow-hidden !p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink bg-subtle px-5 py-4">
        <div>
          <h3 className="text-lg font-medium">Statistik Pesanan</h3>
          <p className="text-xs text-ink-muted">Pesanan aktif saat ini; kategori, produk, dan pembayaran mengikuti rentang waktu</p>
        </div>
        <div className="hidden md:block"><FilterSelect param="range" value={range} options={RANGE_OPTIONS} label="Rentang:" /></div>
        {/* Mobile: tiga tombol segmen (tinggi 40) */}
        <div className="flex w-full gap-1 md:hidden" role="group" aria-label="Rentang waktu">
          {RANGE_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={`?range=${option.value}`}
              scroll={false}
              aria-current={range === option.value ? "true" : undefined}
              className={cn("flex h-10 flex-1 items-center justify-center rounded-control border-2 border-ink px-1 text-xs font-semibold", range === option.value ? "bg-ink text-white" : "bg-surface")}
            >
              {option.label.replace(" terakhir", "")}
            </Link>
          ))}
        </div>
      </div>

      {/* Tab (bisa digulir ke samping di layar kecil) */}
      <div className="overflow-x-auto border-b-2 border-ink" role="tablist" aria-label="Sudut pandang statistik">
        <div className="flex min-w-max">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={tab === item}
              onClick={() => setTab(item)}
              className={cn(
                "whitespace-nowrap border-b-4 px-5 py-3 text-sm font-semibold transition-colors",
                tab === item ? "border-accent text-ink" : "border-transparent text-ink-muted hover:text-ink",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        {tab === "Status Aktif" && (
          <div>
            <p className="mb-4 text-xs text-ink-muted">{totalActive} pesanan sedang berjalan</p>
            <div className="flex flex-col gap-3">
              {data.statusCounts.map((row) => (
                <BarRow key={row.status} label={STATUS_LABEL[row.status]} value={row.count} max={maxStatus} color={row.needsAction ? "bg-accent" : "bg-disabled"} />
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-1.5 text-xs text-ink-soft">
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-accent" />Menunggu tindakan admin</span>
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-disabled" />Berjalan / menunggu pelanggan</span>
            </div>
          </div>
        )}

        {tab === "Kategori Terlaris" && (
          <div>
            <p className="mb-4 text-xs text-ink-muted">Jumlah pcs per kategori desain, {data.rangeLabel.toLowerCase()}</p>
            <div className="flex flex-col gap-3">
              {data.categories.length === 0 && <p className="text-sm text-ink-muted">Belum ada pesanan dibayar pada rentang ini.</p>}
              {data.categories.map((row) => <BarRow key={row.name} label={row.name} value={row.pcs} max={maxCategory} />)}
            </div>
          </div>
        )}

        {tab === "PDH vs VEST" && (
          <div>
            <p className="mb-4 text-xs text-ink-muted">Bagian dari {totalProduct.toLocaleString("id-ID")} pcs, {data.rangeLabel.toLowerCase()}</p>
            <div className="flex h-9 overflow-hidden rounded-control border-2 border-ink text-xs font-semibold text-white">
              <span className="flex items-center justify-center bg-accent" style={{ width: `${pdhPercent}%` }}>{pdhPercent}%</span>
              <span className="flex flex-1 items-center justify-center bg-info">{100 - pdhPercent}%</span>
            </div>
            <div className="mt-2 flex gap-4 text-xs text-ink-soft">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-accent" />PDH · {data.productShare.pdh} pcs</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-info" />VEST · {data.productShare.vest} pcs</span>
            </div>
          </div>
        )}

        {tab === "Metode & Skema Bayar" && (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-medium">Metode pembayaran</p>
              <div className="flex flex-col gap-3">
                {data.methods.map((row) => <BarRow key={row.label} label={row.label} value={row.percent} max={100} text={`${row.percent}%`} />)}
                {data.methods.length === 0 && <p className="text-sm text-ink-muted">Belum ada pembayaran.</p>}
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-medium">Skema bayar</p>
              <div className="flex flex-col gap-3">
                {data.schemes.map((row) => <BarRow key={row.label} label={row.label} value={row.percent} max={100} text={`${row.percent}%`} />)}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
