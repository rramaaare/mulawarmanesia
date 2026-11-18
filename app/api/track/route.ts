/**
 * Route API: POST /api/track
 * Pelanggan melacak pesanan: body { code, whatsapp }. Berhasil -> nomor + token tautan status.
 */
import { handle } from "@/server/api-helpers";
import { trackOrder } from "@/server/services/order-view-service";
import { trackingSchema } from "@/lib/validation/tracking-admin";

export async function POST(request: Request) {
  return handle(async () => {
    const { code, whatsapp } = trackingSchema.parse(await request.json());
    // Alamat IP dipakai untuk membatasi percobaan gagal
    const clientKey = request.headers.get("x-forwarded-for") ?? "lokal";
    return trackOrder(code, whatsapp, clientKey);
  });
}
