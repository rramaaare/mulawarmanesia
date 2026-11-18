/**
 * Halaman Log aktivitas ("/admin/log"): khusus superadmin. Daftar 100 aktivitas terakhir
 * (perubahan harga/stok/ongkir, akun, pengaturan, dan status pesanan). Catatan hanya bisa dibaca.
 */
import { Card } from "@/components/ui/Card";
import { formatDateTimeWita } from "@/lib/format";
import { FilterSelect } from "@/features/admin/overview/FilterSelect";
import { requireSuperadminPage } from "@/server/auth/session";
import { listAudit } from "@/server/services/audit-service";

export const dynamic = "force-dynamic";

/** Pilihan jumlah aktivitas yang ditampilkan. */
const LIMITS = [10, 25, 50, 100];

export default async function AuditLogPage({ searchParams }: { searchParams: Promise<{ per?: string }> }) {
  await requireSuperadminPage();
  const { per } = await searchParams;
  const limit = LIMITS.find((choice) => String(choice) === per) ?? 50;
  const rows = await listAudit(limit);
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-semibold">Log aktivitas</h1>
        <p className="text-sm text-ink-muted">Catatan tidak bisa diubah atau dihapus.</p>
      </div>
      <FilterSelect param="per" value={String(limit)} label="Tampilkan" options={LIMITS.map((choice) => ({ value: String(choice), label: `${choice} aktivitas terakhir` }))} className="w-fit" />
      <Card className="overflow-x-auto !p-0">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b-2 border-ink bg-subtle">
              {["Waktu", "Oleh", "Aktivitas", "Objek", "Detail"].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-muted">Belum ada aktivitas tercatat.</td></tr>}
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-line last:border-b-0">
                <td className="whitespace-nowrap px-4 py-3">{formatDateTimeWita(row.createdAt)}</td>
                <td className="px-4">{row.actorEmail}</td>
                <td className="px-4 font-semibold">{row.action.replace(/_/g, " ")}</td>
                <td className="px-4">{row.target}</td>
                <td className="px-4 text-ink-soft">{row.detail ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
