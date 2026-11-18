/**
 * Route API: GET /api/admin/orders/export
 * Mengunduh daftar pesanan sebagai file CSV. Hanya untuk admin yang sudah login.
 */
import { requireAdminApi } from "@/server/auth/session";
import { AppError } from "@/server/errors";
import { listOrders, ordersToCsv } from "@/server/services/order-list-service";

export async function GET(request: Request) {
  try {
    await requireAdminApi();
    const params = new URL(request.url).searchParams;
    // Status bisa lebih dari satu (dipisah koma), sama seperti filter di halaman Pesanan
    const statuses = (params.get("status") ?? "").split(",").filter(Boolean);
    const { rows } = await listOrders({ statuses: statuses.length > 0 ? statuses : undefined, search: params.get("q") ?? undefined });
    return new Response(ordersToCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="pesanan-mulawarmanesia.csv"',
      },
    });
  } catch (error) {
    return new Response("Tidak diizinkan", { status: error instanceof AppError ? error.status : 500 });
  }
}
