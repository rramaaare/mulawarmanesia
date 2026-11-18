/**
 * Route API: GET /api/orders/[code]?token=...
 * Mengambil data pesanan untuk halaman status pelanggan.
 * Token rahasia dari tautan lacak wajib cocok; tanpa token pesanan tidak dibuka.
 */
import { handle } from "@/server/api-helpers";
import { getOrderByToken } from "@/server/services/order-view-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;
    const token = new URL(request.url).searchParams.get("token") ?? "";
    return getOrderByToken(code, token);
  });
}
