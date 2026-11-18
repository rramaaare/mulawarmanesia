/**
 * Halaman Dashboard Admin ("/admin"): satu dashboard untuk semua peran. Bagian "Sistem" hanya
 * dihitung dan ditampilkan untuk superadmin. Rentang waktu dibaca dari alamat (?range=7d|30d|month).
 */
import { OverviewView } from "@/features/admin/overview/OverviewView";
import { requireAdminPage } from "@/server/auth/session";
import { getDashboard, parseRange } from "@/server/services/dashboard-service";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const admin = await requireAdminPage();
  const { range: rawRange } = await searchParams;
  const range = parseRange(rawRange);
  const data = await getDashboard(range, admin.role);
  return <OverviewView data={data} range={range} name={admin.name} />;
}
