/**
 * Halaman Daftar Pesanan Admin ("/admin/pesanan") - desain "Pesanan".
 * Kolom cari, tombol "Filter status" berisi checkbox (boleh pilih beberapa status), tabel, dan paginasi
 * dengan jumlah baris yang bisa diatur. Semua filter lewat alamat (?status=a,b&q=..&page=..&per=..),
 * jadi halaman tetap sederhana dan bisa dibagikan.
 */
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { OrdersTable } from "@/features/admin/OrdersTable";
import { StatusFilter } from "@/features/admin/StatusFilter";
import { FilterSelect } from "@/features/admin/overview/FilterSelect";
import { OverviewIcon } from "@/features/admin/overview/icons";
import { STATUS_LABEL, type StatusName } from "@/lib/domain/order-status";
import { listOrders, ORDERS_PER_PAGE, PER_PAGE_CHOICES } from "@/server/services/order-list-service";

export const dynamic = "force-dynamic";

/** Status yang bisa difilter, berurutan. */
const FILTERS: StatusName[] = ["menunggu_pembayaran", "dibayar", "cek_desain", "perlu_revisi", "produksi", "qc", "siap_kirim", "dikirim", "selesai", "dibatalkan", "kedaluwarsa"];

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string; per?: string }> }) {
  const { status, q, page, per } = await searchParams;
  const pageNumber = page && /^\d+$/.test(page) ? Number(page) : 1;
  // Jumlah baris per halaman: hanya pilihan yang diizinkan, selain itu bawaan
  const perPage = PER_PAGE_CHOICES.find((choice) => String(choice) === per) ?? ORDERS_PER_PAGE;
  // Status terpilih: daftar dipisah koma, hanya yang dikenal
  const selected = (status ?? "").split(",").filter((item): item is StatusName => FILTERS.includes(item as StatusName));
  const result = await listOrders({ statuses: selected.length > 0 ? selected : undefined, search: q, page: pageNumber, perPage });

  /** Menyusun alamat halaman lain dengan filter yang dipertahankan. */
  const hrefForPage = (target: number) => {
    const params = new URLSearchParams();
    if (selected.length > 0) params.set("status", selected.join(","));
    if (q) params.set("q", q);
    if (perPage !== ORDERS_PER_PAGE) params.set("per", String(perPage));
    if (target > 1) params.set("page", String(target));
    const text = params.toString();
    return `/admin/pesanan${text ? `?${text}` : ""}`;
  };
  const exportQuery = new URLSearchParams({ ...(selected.length > 0 ? { status: selected.join(",") } : {}), ...(q ? { q } : {}) });
  const first = result.matching === 0 ? 0 : (result.page - 1) * perPage + 1;
  const last = Math.min(result.page * perPage, result.matching);
  const disabledButton = "inline-flex cursor-not-allowed items-center rounded-control border-2 border-line bg-subtle px-5 py-2.5 text-sm font-semibold text-disabled";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-medium">Pesanan</h1>
          <p className="mt-1 text-sm text-ink-soft">{result.all} pesanan · urut dari yang terbaru</p>
        </div>

        {/* Cari + filter status (checkbox) + ekspor */}
        <div className="flex flex-wrap items-center gap-3">
          <form role="search" className="relative flex">
            <OverviewIcon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            {selected.length > 0 && <input type="hidden" name="status" value={selected.join(",")} />}
            {perPage !== ORDERS_PER_PAGE && <input type="hidden" name="per" value={perPage} />}
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari nomor pesanan atau nama"
              aria-label="Cari pesanan"
              className="w-72 rounded-control border-2 border-ink bg-surface py-2.5 pl-10 pr-4 text-sm placeholder:text-ink-muted focus:outline-none"
            />
          </form>
          <StatusFilter
            selected={selected}
            options={FILTERS.map((item) => ({ value: item, label: STATUS_LABEL[item], count: result.counts[item] ?? 0 }))}
          />
          <Button href={`/api/admin/orders/export?${exportQuery}`} variant="secondary">Ekspor CSV</Button>
        </div>
      </div>

      <Card className="!p-3">
        <OrdersTable rows={result.rows} />
        <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-2 pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <FilterSelect
              param="per"
              value={String(perPage)}
              label="Tampilkan"
              resetParams={["page"]}
              options={PER_PAGE_CHOICES.map((choice) => ({ value: String(choice), label: `${choice} entri` }))}
            />
            <p className="text-sm text-ink-soft">Menampilkan {first}–{last} dari {result.matching} pesanan</p>
          </div>
          <div className="flex gap-3">
            {result.page > 1 ? <Button href={hrefForPage(result.page - 1)} variant="secondary">Sebelumnya</Button> : <span className={disabledButton}>Sebelumnya</span>}
            {result.page < result.pageCount ? <Button href={hrefForPage(result.page + 1)} variant="secondary">Berikutnya →</Button> : <span className={disabledButton}>Berikutnya →</span>}
          </div>
        </div>
      </Card>
    </div>
  );
}
