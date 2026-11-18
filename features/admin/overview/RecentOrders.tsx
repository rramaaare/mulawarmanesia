"use client";
/**
 * RecentOrders: tabel "Pesanan terbaru" dengan pengaturan jumlah baris ("Tampilkan N entri").
 * Server mengirim 50 pesanan terbaru; di browser hanya sebagian yang ditampilkan menurut pilihan,
 * jadi mengganti jumlah baris tidak memanggil server.
 */
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SelectInput } from "@/components/ui/Field";
import type { OrderRow } from "@/server/services/order-list-service";
import { OrdersTable } from "../OrdersTable";

const PER_PAGE_OPTIONS = [5, 10, 25, 50];

export function RecentOrders({ rows }: { rows: OrderRow[] }) {
  const [perPage, setPerPage] = useState(5);
  const visible = rows.slice(0, perPage);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm text-ink-soft">
        <span>Tampilkan</span>
        <div className="w-24">
          <SelectInput aria-label="Jumlah pesanan yang ditampilkan" value={perPage} className="!py-1.5" onChange={(event) => setPerPage(Number(event.target.value))}>
            {PER_PAGE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </SelectInput>
        </div>
        <span>entri</span>
      </div>
      <OrdersTable rows={visible} emptyText="Belum ada pesanan." />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink-muted">Menampilkan {visible.length} dari {rows.length} pesanan terbaru</p>
        <Button href="/admin/pesanan" variant="dark">Lihat semua pesanan →</Button>
      </div>
    </div>
  );
}
