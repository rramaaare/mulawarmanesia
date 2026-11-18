/**
 * Route API: POST /api/payments/webhook
 * Pintu masuk webhook dari payment gateway (server ke server).
 * Header "x-signature" berisi tanda tangan HMAC dari isi pesan.
 */
import { handle } from "@/server/api-helpers";
import { processPaymentWebhook } from "@/server/services/payment-service";

export async function POST(request: Request) {
  return handle(async () => {
    // Isi mentah dipakai untuk memeriksa tanda tangan, jadi dibaca sebagai teks
    const rawBody = await request.text();
    return processPaymentWebhook(rawBody, request.headers.get("x-signature") ?? "");
  });
}
