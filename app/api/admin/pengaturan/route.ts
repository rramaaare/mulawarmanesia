/**
 * Route API: PATCH /api/admin/pengaturan
 * Mengubah kapasitas produksi mingguan dan batas waktu bayar. Hanya superadmin.
 */
import { handle } from "@/server/api-helpers";
import { requireSuperadminApi } from "@/server/auth/session";
import { updateSettings } from "@/server/services/settings-service";

export async function PATCH(request: Request) {
  return handle(async () => {
    const admin = await requireSuperadminApi();
    return updateSettings(admin.email, await request.json());
  });
}
