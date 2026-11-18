/**
 * Route API: PATCH /api/admin/orders/[code]/status
 * Admin mengubah status pesanan. Wajib login; aturan urutan dijaga di status-service.
 */
import { handle } from "@/server/api-helpers";
import { requireAdminApi } from "@/server/auth/session";
import { changeOrderStatus } from "@/server/services/status-service";

export async function PATCH(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const adminEmail = await requireAdminApi();
    const { code } = await context.params;
    await changeOrderStatus(code, adminEmail, await request.json());
    return { changed: true };
  });
}
