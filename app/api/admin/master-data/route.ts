/**
 * Route API: PATCH /api/admin/master-data
 * Mengubah satu data master (harga kategori, tambahan bahan, ongkir, atau stok warna).
 * Hanya superadmin. Body contoh: { "type": "category", "id": 1, "value": 200000 }
 */
import { handle } from "@/server/api-helpers";
import { requireSuperadminApi } from "@/server/auth/session";
import { changeMasterData } from "@/server/services/master-data-service";

export async function PATCH(request: Request) {
  return handle(async () => {
    const admin = await requireSuperadminApi();
    await changeMasterData(admin.email, await request.json());
    return { changed: true };
  });
}
