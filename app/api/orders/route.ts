/**
 * Route API: POST /api/orders
 * Membuat pesanan baru dari data halaman Pesanan (tombol "Bayar sekarang").
 * Route ini sengaja tipis: validasi dan transaksi ada di order-service.
 */
import { handle } from "@/server/api-helpers";
import { createOrder } from "@/server/services/order-service";

export async function POST(request: Request) {
  return handle(async () => createOrder(await request.json()));
}
