/**
 * Route API: PATCH /api/admin/akun/[id]
 * Mengubah status aktif ({ active }) atau mereset kata sandi ({ password }) satu akun. Hanya superadmin.
 */
import { handle } from "@/server/api-helpers";
import { AppError } from "@/server/errors";
import { requireSuperadminApi } from "@/server/auth/session";
import { updateAdmin } from "@/server/services/account-service";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const admin = await requireSuperadminApi();
    const { id } = await context.params;
    if (!/^\d+$/.test(id)) throw new AppError("Akun tidak ditemukan", 404);
    await updateAdmin(admin.email, Number(id), await request.json());
    return { updated: true };
  });
}
