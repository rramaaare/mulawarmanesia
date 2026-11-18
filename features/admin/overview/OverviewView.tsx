/**
 * OverviewView: menyusun dashboard dengan urutan Prime Lite HR, berisi widget dashboard sebelumnya:
 *   Banner sambutan
 *   1. Pesanan & Produksi      -> 4 kartu angka + kartu "Statistik Pesanan" bertab
 *   2. Penjualan & Produksi    -> pendapatan per minggu + ukuran terlaris (dua grafik berdampingan)
 *   3. Pesanan & Tindakan      -> pesanan terbaru, perlu tindakan, kapasitas, konversi, warna kain
 *   4. Sistem                  -> khusus superadmin
 * Komponen server: filter rentang dibaca dari alamat (?range=).
 */
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import type { TableData } from "@/lib/domain/table";
import { formatRupiahCompact } from "@/lib/format";
import type { DashboardData, DashboardRange } from "@/server/services/dashboard-service";
import { PagedTable } from "./PagedTable";
import { RecentOrders } from "./RecentOrders";
import { StatusTabsCard } from "./StatusTabsCard";
import { MetricCard, OverviewBanner, SectionHeader } from "./blocks";
import { SizeColumnChart, WeeklyRevenueChart } from "./charts";
import { BarRow, Chip, Panel, StatCard, changeLabel } from "./widgets";

interface OverviewViewProps {
  data: DashboardData;
  range: DashboardRange;
  name: string;
}

export function OverviewView({ data, range, name }: OverviewViewProps) {
  const dateText = new Date(data.updatedAt).toLocaleDateString("id-ID", { timeZone: "Asia/Makassar", weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const maxFunnel = Math.max(...data.funnel.map((row) => row.count), 1);
  const maxColor = 100;
  const capacityPercent = Math.min(100, Math.round((data.capacity.used / data.capacity.limit) * 100));

  // Wawasan singkat: dua ukuran teratas dan titik bocor terbesar di alur pemesanan
  const sizeTotal = data.sizes.reduce((sum, row) => sum + row.pcs, 0) || 1;
  const topSizes = [...data.sizes].sort((a, b) => b.pcs - a.pcs).slice(0, 2);
  const topShare = Math.round(((topSizes[0].pcs + topSizes[1].pcs) / sizeTotal) * 100);
  const steps = data.funnel.slice(1).map((row, index) => ({
    from: data.funnel[index].label,
    to: row.label,
    keep: data.funnel[index].count > 0 ? Math.round((row.count / data.funnel[index].count) * 100) : 100,
  }));
  const worstStep = steps.length ? steps.reduce((worst, step) => (step.keep < worst.keep ? step : worst)) : undefined;

  // Tabel "Perlu tindakan hari ini" (dengan pengaturan jumlah entri)
  const todoTable: TableData = {
    columns: ["Pesanan", "Keterangan"],
    rows: data.todo.map((item) => [{ text: item.code, href: `/admin/pesanan/${item.code}` }, item.reason]),
  };

  return (
    <div className="flex flex-col gap-10 pb-10">
      <OverviewBanner name={name} dateText={dateText} />

      {/* ===== 1. Pesanan & Produksi ===== */}
      <section className="flex flex-col gap-6">
        <SectionHeader
          icon="orders"
          title="Pesanan & Produksi"
          subtitle={`Ringkasan pesanan dan pembayaran, ${data.rangeLabel.toLowerCase()}`}
          action={<Button href="/api/admin/orders/export" variant="secondary" size="sm">Ekspor CSV</Button>}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Pendapatan diterima"
            value={formatRupiahCompact(data.revenue.current)}
            chip={<Chip tone="mint">{changeLabel(data.revenue.current, data.revenue.previous)}</Chip>}
            note="dari periode sebelumnya"
          />
          <StatCard
            title="Pesanan dibayar"
            value={`${data.paidOrders.count} · ${data.paidOrders.pcs.toLocaleString("id-ID")} pcs`}
            chip={<Chip tone="mint">{data.paidOrders.count - data.paidOrders.previousCount >= 0 ? "+" : ""}{data.paidOrders.count - data.paidOrders.previousCount} pesanan</Chip>}
            note="dari periode sebelumnya"
          />
          <StatCard
            title="Sedang diproduksi"
            value={`${data.inProduction.count} · ${data.inProduction.pcs} pcs`}
            chip={<Chip tone="butter">{data.inProduction.capacityPercent}%</Chip>}
            note={`dari kapasitas ${data.capacity.limit} pcs`}
          />
          <StatCard
            title="Menunggu pembayaran"
            value={`${data.waiting.count} · ${formatRupiahCompact(data.waiting.value)}`}
            chip={<Chip tone="red">{data.waiting.expiringSoon} pesanan</Chip>}
            note="kedaluwarsa < 3 jam"
          />
        </div>
        <StatusTabsCard data={data} range={range} />
      </section>

      {/* ===== 2. Penjualan & Produksi ===== */}
      <section className="flex flex-col gap-6">
        <SectionHeader icon="chart" title="Penjualan & Produksi" subtitle="Pendapatan mingguan dan ukuran yang paling banyak dipesan" />
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <Panel title="Pendapatan per minggu" subtitle="Pembayaran yang diterima (lunas + DP), 8 minggu terakhir, juta rupiah">
            <WeeklyRevenueChart data={data.weeklyRevenue} />
          </Panel>
          <Panel title="Ukuran terlaris" subtitle={`Jumlah pcs per ukuran, ${data.rangeLabel.toLowerCase()}`}>
            <SizeColumnChart data={data.sizes} />
            <p className="mt-3 text-xs text-ink-soft">
              {topSizes[0].size} dan {topSizes[1].size} mengisi {topShare}% pesanan. Siapkan stok kain untuk dua ukuran ini lebih dulu.
            </p>
          </Panel>
        </div>
      </section>

      {/* ===== 3. Pesanan & Tindakan ===== */}
      <section className="flex flex-col gap-6">
        <SectionHeader icon="today" title="Pesanan & Tindakan" subtitle="Pesanan terbaru, tindakan yang menunggu, kapasitas, dan alur pemesanan" />
        <Panel title="Pesanan terbaru" subtitle="Klik nomor untuk membuka detail pesanan">
          <RecentOrders rows={data.latest} />
        </Panel>
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-6">
          <Panel title="Perlu tindakan hari ini" subtitle="Pesanan yang menunggu desain, revisi, resi, atau hampir kedaluwarsa">
            <PagedTable table={todoTable} emptyText="Tidak ada tindakan tertunda." />
          </Panel>
          <Panel title="Warna kain terlaris" subtitle="Bagian dari pcs berdasarkan warna badan">
            <div className="flex flex-col gap-3">
              {data.colors.length === 0 && <p className="text-sm text-ink-muted">Belum ada data warna.</p>}
              {data.colors.map((row) => <BarRow key={row.name} label={row.name} value={row.percent} max={maxColor} text={`${row.percent}%`} swatch={row.hex} />)}
            </div>
            {data.outOfStockColors.length > 0 && (
              <div className="mt-4">
                <Alert tone="warning" title={`${data.outOfStockColors.length} warna habis: ${data.outOfStockColors.join(", ")}`}>Ditandai silang di editor pelanggan.</Alert>
              </div>
            )}
          </Panel>
          </div>
          <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-6">
          <Panel title="Kapasitas produksi" subtitle="Pcs dalam produksi dibanding kapasitas mingguan">
            <p className="flex items-baseline gap-2">
              <span className="text-5xl font-medium tracking-tight">{data.capacity.used}</span>
              <span className="text-sm text-ink-soft">dari {data.capacity.limit} pcs · {capacityPercent}%</span>
            </p>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-accent-subtle" role="meter" aria-valuenow={data.capacity.used} aria-valuemin={0} aria-valuemax={data.capacity.limit} aria-label="Kapasitas produksi">
              <div className="h-full rounded-full bg-accent" style={{ width: `${capacityPercent}%` }} />
            </div>
            <p className="mt-2 text-xs text-ink-muted">
              Sisa {Math.max(0, data.capacity.limit - data.capacity.used)} pcs. Pesanan baru di atas itu masuk antrean minggu depan.
            </p>
          </Panel>
          <Panel title="Konversi alur pemesanan" subtitle={`Dari pesanan dibuat sampai selesai, ${data.rangeLabel.toLowerCase()}`}>
            <div className="flex flex-col gap-3">
              {data.funnel.map((row, index) => (
                <BarRow
                  key={row.label}
                  label={row.label}
                  value={row.count}
                  max={maxFunnel}
                  text={index > 0 && data.funnel[index - 1].count > 0 ? `${row.count} · lanjut ${steps[index - 1].keep}%` : String(row.count)}
                />
              ))}
            </div>
            {worstStep && data.funnel[0].count > 0 && (
              <p className="mt-4 text-xs text-ink-soft">
                Titik bocor terbesar: dari “{worstStep.from}” ke “{worstStep.to}”. {100 - worstStep.keep}% berhenti di tahap ini.
              </p>
            )}
          </Panel>
          </div>
        </div>
      </section>

      {/* ===== 4. Sistem (khusus superadmin) ===== */}
      {data.system && (
        <section className="flex flex-col gap-6">
          <SectionHeader icon="system" title="Sistem" subtitle="Akun, stok warna, dan aktivitas terbaru (khusus superadmin)" />
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard label="Akun Admin Aktif" value={data.system.activeAdmins} caption="Bisa masuk ke panel" icon="users" tone="mint" />
            <MetricCard label="Akun Nonaktif" value={data.system.inactiveAdmins} caption="Tidak bisa masuk" icon="userOff" tone="rose" />
            <MetricCard
              label="Warna Habis"
              value={data.outOfStockColors.length}
              caption={data.outOfStockColors.length > 0 ? data.outOfStockColors.join(", ") : "Semua warna tersedia"}
              icon="alert"
              tone="butter"
            />
          </div>
          <Panel title="Aktivitas Terakhir" subtitle="Dari Log aktivitas: perubahan harga, stok, akun, pengaturan, dan status pesanan">
            <PagedTable table={data.system.audit} emptyText="Belum ada aktivitas tercatat." />
          </Panel>
        </section>
      )}
    </div>
  );
}

