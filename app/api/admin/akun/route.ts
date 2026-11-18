/**
 * Route API: POST /api/admin/akun
 * Membuat akun admin baru (body: { email, name, password, role }). Hanya superadmin.
 */
import { handle } from "@/server/api-helpers";
import { requireSuperadminApi } from "@/server/auth/session";
import { createAdmin } from "@/server/services/account-service";

export async function POST(request: Request) {
  return handle(async () => {
    const admin = await requireSuperadminApi();
    await createAdmin(admin.email, await request.json());
    return { created: true };
  });
}
