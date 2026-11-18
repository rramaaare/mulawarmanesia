/**
 * Halaman Produksi ("/admin/produksi"): antrean kerja workshop. Menampilkan pesanan yang sedang
 * diproduksi, di tahap QC & pengemasan, dan siap kirim, lengkap dengan total pcs tiap tahap.
 * Bisa dicari (nomor / nama) dan difilter per tahap lewat alamat (?q=..&status=produksi,qc).
 * Memakai tabel yang sama dengan daftar pesanan (OrdersTable).
 */
import { Card } from "@/components/ui/Card";
import { OrdersTable } from "@/features/admin/OrdersTable";
import { StatusFilter } from "@/features/admin/StatusFilter";
import { OverviewIcon } from "@/features/admin/overview/icons";
import { STATUS_LABEL } from "@/lib/domain/order-status";
import { listOrders } from "@/server/services/order-list-service";

export const dynamic = "force-dynamic";

/** Tahap yang ditampilkan di halaman ini. */
const STAGES = ["produksi", "qc", "siap_kirim"] as const;
type Stage = (typeof STAGES)[number];

export default async function ProductionPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q, status } = await searchParams;
  // Tahap terpilih: daftar dipisah koma, hanya tahap yang dikenal; kosong = semua tahap
  const selected = (status ?? "").split(",").filter((item): item is Stage => STAGES.includes(item as Stage));
  const shownStages = selected.length > 0 ? selected : [...STAGES];
  const { rows, counts } = await listOrders({ statuses: [...shownStages], search: q });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-medium">Produksi</h1>
          <p className="mt-1 text-sm text-ink-soft">{rows.length} pesanan dalam antrean kerja workshop</p>
        </div>
        {/* Cari + filter tahap (checkbox) */}
        <div className="flex flex-wrap items-center gap-3">
          <form role="search" className="relative flex">
            <OverviewIcon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            {selected.length > 0 && <input type="hidden" name="status" value={selected.join(",")} />}
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari nomor pesanan atau nama"
              aria-label="Cari pesanan produksi"
              className="w-72 rounded-control border-2 border-ink bg-surface py-2.5 pl-10 pr-4 text-sm placeholder:text-ink-muted focus:outline-none"
            />
          </form>
          <StatusFilter
            selected={selected}
            options={STAGES.map((stage) => ({ value: stage, label: STATUS_LABEL[stage], count: counts[stage] ?? 0 }))}
          />
        </div>
      </div>
      {shownStages.map((stage) => {
        const stageRows = rows.filter((row) => row.status === stage);
        const pcs = stageRows.reduce((sum, row) => sum + row.pcs, 0);
        return (
          <Card key={stage} className="!p-5">
            <h2 className="text-xl font-medium">{STATUS_LABEL[stage]}</h2>
            <p className="mb-4 mt-0.5 text-xs text-ink-muted">{stageRows.length} pesanan · {pcs} pcs</p>
            <OrdersTable rows={stageRows} emptyText={q ? "Tidak ada pesanan yang cocok." : "Tidak ada pesanan di tahap ini."} />
          </Card>
        );
      })}
    </div>
  );
}
