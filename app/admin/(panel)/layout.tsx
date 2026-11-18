/**
 * Layout panel admin: memeriksa login SEBELUM menampilkan halaman apa pun di dalam
 * grup (panel). Jika belum login, pengguna diarahkan ke /admin/login.
 * Susunan: menu samping di kiri, isi halaman di kanan.
 */
import { AdminSidebar } from "@/features/admin/AdminSidebar";
import { requireAdminPage } from "@/server/auth/session";
import { getNavCounts } from "@/server/services/order-list-service";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();
  const counts = await getNavCounts();
  return (
    <div className="flex min-h-screen flex-1 flex-col lg:flex-row">
      <AdminSidebar role={admin.role} name={admin.name} email={admin.email} counts={counts} />
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto w-full max-w-[1180px]">{children}</div>
      </main>
    </div>
  );
}
