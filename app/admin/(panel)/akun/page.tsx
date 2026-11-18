/**
 * Halaman Akun admin ("/admin/akun"): khusus superadmin. Daftar akun, tambah akun,
 * aktif/nonaktif, dan reset kata sandi.
 */
import { AccountManager } from "@/features/admin/AccountManager";
import { requireSuperadminPage } from "@/server/auth/session";
import { listAdmins } from "@/server/services/account-service";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const self = await requireSuperadminPage();
  const accounts = await listAdmins();
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-semibold">Akun admin</h1>
        <p className="text-sm text-ink-muted">Admin mengurus pesanan; superadmin juga mengatur master data, akun, dan pengaturan.</p>
      </div>
      <AccountManager accounts={accounts} selfEmail={self.email} />
    </div>
  );
}
