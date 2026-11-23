/**
 * Halaman Pengaturan ("/admin/pengaturan"): khusus superadmin.
 * Kapasitas produksi mingguan (dipakai meter di dashboard), batas waktu bayar pesanan baru,
 * dan pengumuman landing page (label PO batch + pita merah).
 */
import { Card } from "@/components/ui/Card";
import { AnnouncementForm } from "@/features/admin/AnnouncementForm";
import { SettingsForm } from "@/features/admin/SettingsForm";
import { requireSuperadminPage } from "@/server/auth/session";
import { getAnnouncement } from "@/server/services/announcement-service";
import { getSettings } from "@/server/services/settings-service";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireSuperadminPage();
  const [settings, announcement] = await Promise.all([getSettings(), getAnnouncement()]);
  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <div>
        <h1 className="text-3xl font-semibold">Pengaturan</h1>
        <p className="text-sm text-ink-muted">Batas waktu bayar hanya berlaku untuk pesanan baru.</p>
      </div>
      <Card>
        <SettingsForm weeklyCapacity={settings.weeklyCapacity} paymentDeadlineHours={settings.paymentDeadlineHours} />
      </Card>
      <Card className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-medium">Pengumuman landing page</h2>
          <p className="text-sm text-ink-muted">Label PO batch di hero dan pita merah di paling atas halaman depan. Berlaku langsung setelah disimpan.</p>
        </div>
        <AnnouncementForm initial={announcement} />
      </Card>
    </div>
  );
}
