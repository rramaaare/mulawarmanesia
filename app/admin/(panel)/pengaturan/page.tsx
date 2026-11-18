/**
 * Halaman Pengaturan ("/admin/pengaturan"): khusus superadmin.
 * Kapasitas produksi mingguan (dipakai meter di dashboard) dan batas waktu bayar pesanan baru.
 */
import { Card } from "@/components/ui/Card";
import { SettingsForm } from "@/features/admin/SettingsForm";
import { requireSuperadminPage } from "@/server/auth/session";
import { getSettings } from "@/server/services/settings-service";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireSuperadminPage();
  const settings = await getSettings();
  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <div>
        <h1 className="text-3xl font-semibold">Pengaturan</h1>
        <p className="text-sm text-ink-muted">Batas waktu bayar hanya berlaku untuk pesanan baru.</p>
      </div>
      <Card>
        <SettingsForm weeklyCapacity={settings.weeklyCapacity} paymentDeadlineHours={settings.paymentDeadlineHours} />
      </Card>
    </div>
  );
}
