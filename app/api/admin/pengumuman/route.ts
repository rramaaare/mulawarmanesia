/**
 * Route API: PATCH /api/admin/pengumuman
 * Mengubah label PO batch di hero dan pesan pita merah di landing page. Hanya superadmin.
 */
import { handle } from "@/server/api-helpers";
import { requireSuperadminApi } from "@/server/auth/session";
import { updateAnnouncement } from "@/server/services/announcement-service";

export async function PATCH(request: Request) {
  return handle(async () => {
    const admin = await requireSuperadminApi();
    return updateAnnouncement(admin.email, await request.json());
  });
}
