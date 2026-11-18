/**
 * Route API: GET /api/catalog
 * Mengirim data master (kategori, bahan, warna, kota) ke editor dan halaman Pesanan.
 */
import { handle } from "@/server/api-helpers";
import { getCatalog } from "@/server/services/catalog-service";

export const dynamic = "force-dynamic"; // selalu ambil data terbaru, jangan di-cache

export async function GET() {
  return handle(() => getCatalog());
}
